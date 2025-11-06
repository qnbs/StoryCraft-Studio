import React, { FC, useMemo, useState } from 'react';
import { View } from '../types';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectProjectData, selectAllCharacters, selectAllWorlds } from '../features/project/projectSelectors';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent, CardHeader } from './ui/Card';
import { ICONS } from '../constants';
import { DebouncedInput } from './ui/DebouncedInput';
import { DebouncedTextarea } from './ui/DebouncedTextarea';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { Modal } from './ui/Modal';
import { projectActions, generateLoglineSuggestionsThunk } from '../features/project/projectSlice';
import { useToast } from './ui/Toast';
import { Progress } from './ui/Progress';
import { Input } from './ui/Input';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const StatCard: FC<{ title: string; value: string | number; icon: React.ReactNode; animationIndex: number }> = React.memo(({ title, value, icon, animationIndex }) => (
    <Card className="animate-in" style={{ '--index': animationIndex } as React.CSSProperties}>
        <CardContent className="flex items-center space-x-4 p-4">
            <div className="p-3 bg-indigo-500/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-500 dark:text-indigo-300">{icon}</svg>
            </div>
            <div>
                <p className="text-sm text-[var(--foreground-muted)]">{title}</p>
                <p className="text-2xl font-bold text-[var(--foreground-primary)]">{value}</p>
            </div>
        </CardContent>
    </Card>
));

const QuickAccessCard: FC<{title: string; description: string; icon: React.ReactNode; onClick: () => void; animationIndex: number}> = React.memo(({ title, description, icon, onClick, animationIndex }) => (
     <Card as="button" onClick={onClick} className="text-left p-4 h-full group transition-all duration-300 hover:-translate-y-1 animate-in" style={{ '--index': animationIndex } as React.CSSProperties}>
        <h3 className="font-semibold text-lg flex items-center text-[var(--foreground-primary)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-[var(--foreground-muted)] group-hover:text-indigo-400 transition-colors">{icon}</svg>
            {title}
        </h3>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">{description}</p>
    </Card>
));

export const Dashboard: FC<DashboardProps> = ({ onNavigate }) => {
  const { t, language } = useTranslation();
  const dispatch = useAppDispatch();
  const project = useAppSelector(selectProjectData);
  const characters = useAppSelector(selectAllCharacters);
  const worlds = useAppSelector(selectAllWorlds);
  const toast = useToast();

  const [isLoglineModalOpen, setIsLoglineModalOpen] = useState(false);
  const [loglineSuggestions, setLoglineSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Goals State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalWordCount, setGoalWordCount] = useState(project.projectGoals?.totalWordCount || 50000);
  const [goalTargetDate, setGoalTargetDate] = useState(project.projectGoals?.targetDate || '');
  
  const openGoalModal = () => {
    setGoalWordCount(project.projectGoals?.totalWordCount || 50000);
    const date = project.projectGoals?.targetDate;
    setGoalTargetDate(date || '');
    setIsGoalModalOpen(true);
  };
  
  const handleSaveGoals = () => {
    dispatch(projectActions.updateProjectGoal({ key: 'totalWordCount', value: Number(goalWordCount) }));
    dispatch(projectActions.updateProjectGoal({ key: 'targetDate', value: goalTargetDate || null }));
    setIsGoalModalOpen(false);
  };

  const wordCount = useMemo(() => {
    return project.manuscript.reduce((acc, section) => {
      const words = section.content?.match(/\S+/g) || [];
      return acc + words.length;
    }, 0);
  }, [project.manuscript]);

  const handleGenerateLoglines = async () => {
    setIsAiLoading(true);
    setLoglineSuggestions([]);
    setIsLoglineModalOpen(true);
    try {
      const result = await dispatch(generateLoglineSuggestionsThunk(language)).unwrap();
      setLoglineSuggestions(result || []);
    } catch (e: any) {
      toast.error(t('error.apiErrorTitle'), typeof e === 'string' ? e : t('error.apiErrorDescription'));
      setIsLoglineModalOpen(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  const selectLogline = (logline: string) => {
    dispatch(projectActions.updateLogline(logline));
    setIsLoglineModalOpen(false);
  };
  
  const wordCountProgress = useMemo(() => project.projectGoals?.totalWordCount 
    ? (wordCount / project.projectGoals.totalWordCount) * 100 
    : 0, [wordCount, project.projectGoals?.totalWordCount]);
    
  const getDaysLeft = () => {
    if (!project.projectGoals?.targetDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(project.projectGoals.targetDate);
    const targetLocal = new Date(targetDate.getTime() + targetDate.getTimezoneOffset() * 60000);
    targetLocal.setHours(0,0,0,0);
    const diffTime = targetLocal.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysLeft = getDaysLeft();
  
  const renderDaysLeft = () => {
    if (daysLeft === null) return <p className="text-lg font-semibold text-[var(--foreground-muted)]">{t('dashboard.goals.noDeadline')}</p>;
    let color = 'text-[var(--foreground-primary)]';
    if (daysLeft < 0) color = 'text-red-500 dark:text-red-400';
    else if (daysLeft < 7) color = 'text-yellow-500 dark:text-yellow-400';
    const text = daysLeft < 0 ? t('dashboard.goals.overdue')
               : daysLeft === 0 ? t('dashboard.goals.noDaysLeft')
               : daysLeft === 1 ? t('dashboard.goals.dayLeft')
               : t('dashboard.goals.daysLeft', { count: String(daysLeft) });
    return <p className={`text-lg font-semibold ${color}`}>{text}</p>;
  };

  const quickAccessItems = [
      { title: t('sidebar.manuscript'), description: t('dashboard.quickAccess.manuscriptDesc'), icon: ICONS.WRITER, view: 'manuscript' },
      { title: t('sidebar.writer'), description: t('dashboard.quickAccess.writerDesc'), icon: ICONS.SPARKLES, view: 'writer' },
      { title: t('sidebar.outline'), description: t('dashboard.quickAccess.outlineDesc'), icon: ICONS.OUTLINE, view: 'outline' },
      { title: t('sidebar.characters'), description: t('dashboard.quickAccess.charactersDesc'), icon: ICONS.CHARACTERS, view: 'characters' },
      { title: t('sidebar.world'), description: t('dashboard.quickAccess.worldDesc'), icon: ICONS.WORLD, view: 'world' },
      { title: t('sidebar.export'), description: t('dashboard.quickAccess.exportDesc'), icon: ICONS.EXPORT, view: 'export' },
  ];

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="animate-in lg:col-span-2" style={{'--index': 0} as React.CSSProperties}>
                <CardHeader>
                    <h1 className="text-2xl font-bold text-[var(--foreground-primary)]">{t('dashboard.details.title')}</h1>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="projectTitle" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">{t('dashboard.details.projectTitle')}</label>
                        <DebouncedInput 
                            id="projectTitle" 
                            value={project.title} 
                            onDebouncedChange={(value) => dispatch(projectActions.updateTitle(value))} 
                            placeholder={t('dashboard.details.projectTitlePlaceholder')} 
                            className="text-2xl font-bold h-auto p-2 bg-[var(--background-primary)]"
                        />
                    </div>
                    <div>
                        <label htmlFor="projectLogline" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">{t('dashboard.details.logline')}</label>
                        <DebouncedTextarea 
                            id="projectLogline" 
                            value={project.logline} 
                            onDebouncedChange={(value) => dispatch(projectActions.updateLogline(value))} 
                            placeholder={t('dashboard.details.loglinePlaceholder')} 
                            rows={3} 
                        />
                        <Button onClick={handleGenerateLoglines} disabled={isAiLoading} variant="secondary" className="mt-2 w-full sm:w-auto">
                            {isAiLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">{ICONS.SPARKLES}</svg>}
                            {t('dashboard.details.aiLoglineButton')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="animate-in" style={{'--index': 1} as React.CSSProperties}>
                 <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[var(--foreground-primary)]">{t('dashboard.goals.title')}</h2>
                    <Button variant="ghost" size="sm" onClick={openGoalModal}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{ICONS.TARGET}</svg></Button>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <div>
                         <div className="flex justify-between items-baseline text-sm mb-1">
                             <span className="font-medium text-[var(--foreground-secondary)]">{t('dashboard.goals.wordCount')}</span>
                             <span className="font-semibold text-[var(--foreground-primary)]">{wordCount.toLocaleString()} / {project.projectGoals?.totalWordCount.toLocaleString()}</span>
                         </div>
                         <Progress value={wordCountProgress} />
                     </div>
                      <div>
                         <label className="text-sm font-medium text-[var(--foreground-secondary)]">{t('dashboard.goals.deadline')}</label>
                         {renderDaysLeft()}
                     </div>
                 </CardContent>
            </Card>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('dashboard.stats.totalWordCount')} value={wordCount.toLocaleString()} icon={ICONS.WRITER} animationIndex={1} />
        <StatCard title={t('dashboard.stats.characters')} value={characters.length} icon={ICONS.CHARACTERS} animationIndex={2} />
        <StatCard title={t('dashboard.stats.worlds')} value={worlds.length} icon={ICONS.WORLD} animationIndex={3} />
        <StatCard title={t('dashboard.stats.outlineSections')} value={project.outline?.length || 0} icon={ICONS.OUTLINE} animationIndex={4} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 animate-in" style={{'--index': 5} as React.CSSProperties}>{t('dashboard.quickAccess.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickAccessItems.map((item, i) => (
                <QuickAccessCard
                    key={item.view}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    onClick={() => onNavigate(item.view as View)}
                    animationIndex={6 + i}
                />
            ))}
        </div>
      </div>

       <Modal isOpen={isLoglineModalOpen} onClose={() => setIsLoglineModalOpen(false)} title={t('dashboard.loglineModal.title')}>
            {isAiLoading && <div className="flex flex-col items-center justify-center min-h-[200px]"><Spinner className="w-8 h-8" /><p className="mt-4 text-[var(--foreground-secondary)]">{t('dashboard.loglineModal.loading')}</p></div>}
            {!isAiLoading && loglineSuggestions.length > 0 && (
                <div className="space-y-3">
                    {loglineSuggestions.map((line, idx) => (
                        <Card as="button" key={idx} className="hover:bg-[var(--background-tertiary)] transition-colors cursor-pointer w-full text-left" onClick={() => selectLogline(line)}>
                            <CardContent className="p-4"><p className="text-[var(--foreground-secondary)]">{line}</p></CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {!isAiLoading && loglineSuggestions.length === 0 && <div className="text-center text-red-400 min-h-[200px] flex items-center justify-center"><p>{t('outline.error.generationFailed')}</p></div>}
        </Modal>

         <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title={t('dashboard.goals.modal.title')}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="goal-word-count" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">{t('dashboard.goals.modal.wordCountLabel')}</label>
                    <Input id="goal-word-count" type="number" value={goalWordCount} onChange={(e) => setGoalWordCount(Number(e.target.value))} min="0" step="1000" />
                </div>
                <div>
                    <label htmlFor="goal-date" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">{t('dashboard.goals.modal.deadlineLabel')}</label>
                    <Input id="goal-date" type="date" value={goalTargetDate} onChange={(e) => setGoalTargetDate(e.target.value)} />
                </div>
                <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveGoals}>{t('dashboard.goals.modal.save')}</Button>
                </div>
            </div>
         </Modal>
    </div>
  );
};