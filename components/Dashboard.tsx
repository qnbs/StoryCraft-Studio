import React, { FC } from 'react';
import { View } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { ICONS } from '../constants';
import { DebouncedInput } from './ui/DebouncedInput';
import { DebouncedTextarea } from './ui/DebouncedTextarea';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { Modal } from './ui/Modal';
import { Progress } from './ui/Progress';
import { Input } from './ui/Input';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardContext, useDashboardContext } from '../contexts/DashboardContext';

// --- Generic Components ---

const StatCard: FC<{ title: string; value: string | number; icon: React.ReactNode; animationIndex: number }> = React.memo(({ title, value, icon, animationIndex }) => (
    <Card className="animate-in flex items-center p-4 h-24 sm:h-auto" style={{ '--index': animationIndex } as React.CSSProperties}>
        <div className="p-3 bg-indigo-500/10 rounded-lg mr-4 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-500 dark:text-indigo-300">{icon}</svg>
        </div>
        <div>
            <p className="text-xs sm:text-sm text-[var(--foreground-muted)] uppercase tracking-wide font-medium">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--foreground-primary)]">{value}</p>
        </div>
    </Card>
));

const QuickAccessCard: FC<{title: string; description: string; icon: React.ReactNode; onClick: () => void; animationIndex: number}> = React.memo(({ title, description, icon, onClick, animationIndex }) => (
     <Card as="button" onClick={onClick} className="text-left p-5 h-full min-w-[260px] max-w-[260px] md:max-w-none md:min-w-0 group transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-in snap-center flex flex-col" style={{ '--index': animationIndex } as React.CSSProperties}>
        <h3 className="font-semibold text-lg flex items-center text-[var(--foreground-primary)] transition-colors mb-2">
            <div className="p-2 rounded-md bg-[var(--background-tertiary)] mr-3 group-hover:bg-indigo-500/20 transition-colors shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--foreground-muted)] group-hover:text-indigo-500 transition-colors">{icon}</svg>
            </div>
            {title}
        </h3>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed flex-grow">{description}</p>
    </Card>
));

// --- Sub-Components Consuming Context ---

const ProjectDetails: FC = () => {
    const { t, project, handleTitleChange, handleLoglineChange, isAiLoading, handleGenerateLoglines } = useDashboardContext();
    return (
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
                        onDebouncedChange={handleTitleChange} 
                        placeholder={t('dashboard.details.projectTitlePlaceholder')} 
                        className="text-xl sm:text-2xl font-bold h-auto p-2 bg-[var(--background-primary)] border-transparent hover:border-[var(--border-primary)] focus:border-[var(--border-interactive)] transition-all"
                    />
                </div>
                <div>
                    <label htmlFor="projectLogline" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">{t('dashboard.details.logline')}</label>
                    <DebouncedTextarea 
                        id="projectLogline" 
                        value={project.logline} 
                        onDebouncedChange={handleLoglineChange} 
                        placeholder={t('dashboard.details.loglinePlaceholder')} 
                        rows={3} 
                    />
                    <Button onClick={handleGenerateLoglines} disabled={isAiLoading} variant="secondary" className="mt-3 w-full sm:w-auto">
                        {isAiLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">{ICONS.SPARKLES}</svg>}
                        {t('dashboard.details.aiLoglineButton')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const GoalTracker: FC = () => {
    const { t, project, wordCount, wordCountProgress, daysLeft, openGoalModal } = useDashboardContext();

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

    return (
        <Card className="animate-in" style={{'--index': 1} as React.CSSProperties}>
             <CardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[var(--foreground-primary)]">{t('dashboard.goals.title')}</h2>
                <Button variant="ghost" size="sm" onClick={openGoalModal} className="rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{ICONS.TARGET}</svg></Button>
             </CardHeader>
             <CardContent className="space-y-6">
                 <div>
                     <div className="flex justify-between items-baseline text-sm mb-2">
                         <span className="font-medium text-[var(--foreground-secondary)]">{t('dashboard.goals.wordCount')}</span>
                         <span className="font-semibold text-[var(--foreground-primary)]">{wordCount.toLocaleString()} / {project.projectGoals?.totalWordCount.toLocaleString()}</span>
                     </div>
                     <Progress value={wordCountProgress} />
                 </div>
                  <div className="bg-[var(--background-tertiary)]/50 p-4 rounded-lg border border-[var(--border-primary)]/50">
                     <label className="text-xs uppercase tracking-wider font-medium text-[var(--foreground-muted)]">{t('dashboard.goals.deadline')}</label>
                     <div className="mt-1">{renderDaysLeft()}</div>
                 </div>
             </CardContent>
        </Card>
    );
};

const StatsGrid: FC = () => {
    const { t, wordCount, characters, worlds, project } = useDashboardContext();
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title={t('dashboard.stats.totalWordCount')} value={wordCount.toLocaleString()} icon={ICONS.WRITER} animationIndex={1} />
            <StatCard title={t('dashboard.stats.characters')} value={characters.length} icon={ICONS.CHARACTERS} animationIndex={2} />
            <StatCard title={t('dashboard.stats.worlds')} value={worlds.length} icon={ICONS.WORLD} animationIndex={3} />
            <StatCard title={t('dashboard.stats.outlineSections')} value={project.outline?.length || 0} icon={ICONS.OUTLINE} animationIndex={4} />
        </div>
    );
};

const QuickActions: FC = () => {
    const { t, onNavigate } = useDashboardContext();
    
    const quickAccessItems = [
        { title: t('sidebar.manuscript'), description: t('dashboard.quickAccess.manuscriptDesc'), icon: ICONS.WRITER, view: 'manuscript' },
        { title: t('sidebar.writer'), description: t('dashboard.quickAccess.writerDesc'), icon: ICONS.SPARKLES, view: 'writer' },
        { title: t('sidebar.outline'), description: t('dashboard.quickAccess.outlineDesc'), icon: ICONS.OUTLINE, view: 'outline' },
        { title: t('sidebar.characters'), description: t('dashboard.quickAccess.charactersDesc'), icon: ICONS.CHARACTERS, view: 'characters' },
        { title: t('sidebar.world'), description: t('dashboard.quickAccess.worldDesc'), icon: ICONS.WORLD, view: 'world' },
        { title: t('sidebar.export'), description: t('dashboard.quickAccess.exportDesc'), icon: ICONS.EXPORT, view: 'export' },
    ];

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 animate-in px-1" style={{'--index': 5} as React.CSSProperties}>{t('dashboard.quickAccess.title')}</h2>
            
            {/* Horizontal Snap Scroll Container for Mobile */}
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory space-x-4 md:grid md:grid-cols-3 md:space-x-0 md:gap-6 md:overflow-visible md:px-0 md:pb-0 scroll-smooth no-scrollbar">
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
                 {/* Spacer for horizontal scroll padding */}
                 <div className="w-1 shrink-0 md:hidden"></div>
            </div>
        </div>
    );
};

const DashboardModals: FC = () => {
    const { t, isLoglineModalOpen, setIsLoglineModalOpen, isAiLoading, loglineSuggestions, selectLogline, isGoalModalOpen, setIsGoalModalOpen, goalWordCount, setGoalWordCount, goalTargetDate, setGoalTargetDate, handleSaveGoals } = useDashboardContext();
    
    return (
        <>
            <Modal isOpen={isLoglineModalOpen} onClose={() => setIsLoglineModalOpen(false)} title={t('dashboard.loglineModal.title')}>
                {isAiLoading && <div className="flex flex-col items-center justify-center min-h-[200px]"><Spinner className="w-8 h-8" /><p className="mt-4 text-[var(--foreground-secondary)]">{t('dashboard.loglineModal.loading')}</p></div>}
                {!isAiLoading && loglineSuggestions.length > 0 && (
                    <div className="space-y-3">
                        {loglineSuggestions.map((line, idx) => (
                            <Card as="button" key={idx} className="hover:bg-[var(--background-tertiary)] transition-colors cursor-pointer w-full text-left border-l-4 border-l-transparent hover:border-l-indigo-500" onClick={() => selectLogline(line)}>
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
                    <div className="flex justify-end pt-4 gap-2">
                        <Button variant="secondary" onClick={() => setIsGoalModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleSaveGoals}>{t('dashboard.goals.modal.save')}</Button>
                    </div>
                </div>
             </Modal>
        </>
    );
};

// --- Main Composition ---

const DashboardUI: FC = () => {
    return (
        <div className="space-y-6 sm:space-y-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ProjectDetails />
                <GoalTracker />
            </div>
            <StatsGrid />
            <QuickActions />
            <DashboardModals />
        </div>
    );
};

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export const Dashboard: FC<DashboardProps> = ({ onNavigate }) => {
    const contextValue = useDashboard({ onNavigate });
    return (
        <DashboardContext.Provider value={contextValue}>
            <DashboardUI />
        </DashboardContext.Provider>
    );
};
