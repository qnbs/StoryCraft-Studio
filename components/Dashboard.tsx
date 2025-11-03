import React from 'react';
import { StoryProject } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { useTranslation } from '../hooks/useTranslation';

interface DashboardProps {
  project: StoryProject;
  setProject: React.Dispatch<React.SetStateAction<StoryProject>>;
}

export const Dashboard: React.FC<DashboardProps> = ({ project, setProject }) => {
  const { t } = useTranslation();
    
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProject(p => ({ ...p, title: e.target.value }));
  };

  const handleLoglineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProject(p => ({ ...p, logline: e.target.value }));
  };
    
  const handleSectionContentChange = (index: number, content: string) => {
    const updatedManuscript = [...project.manuscript];
    updatedManuscript[index].content = content;
    setProject(p => ({ ...p, manuscript: updatedManuscript }));
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('dashboard.title')}</h1>
        <p className="text-md md:text-lg text-gray-400">{t('dashboard.description')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-xl font-semibold text-white">{t('dashboard.stats.title')}</h3></CardHeader>
          <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('dashboard.stats.characters')}</span>
                  <span className="font-bold text-indigo-400 text-2xl">{project.characters.length}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('dashboard.stats.worlds')}</span>
                  <span className="font-bold text-indigo-400 text-2xl">{project.worlds.length}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('dashboard.stats.sections')}</span>
                  <span className="font-bold text-indigo-400 text-2xl">{project.manuscript.length}</span>
              </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
            <CardHeader><h3 className="text-xl font-semibold text-white">{t('dashboard.details.title')}</h3></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-300 mb-2">{t('dashboard.details.projectTitle')}</label>
                    <Input id="projectTitle" value={project.title} onChange={handleTitleChange} placeholder={t('dashboard.details.projectTitlePlaceholder')}/>
                </div>
                <div>
                    <label htmlFor="projectLogline" className="block text-sm font-medium text-gray-300 mb-2">{t('dashboard.details.logline')}</label>
                    <Input id="projectLogline" value={project.logline} onChange={handleLoglineChange} placeholder={t('dashboard.details.loglinePlaceholder')}/>
                </div>
            </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white mb-4">{t('dashboard.manuscript.title')}</h2>
        <div className="space-y-6">
          {project.manuscript.length > 0 ? (
            project.manuscript.map((section, index) => (
              <Card key={section.id}>
                <CardHeader><h3 className="text-xl font-semibold text-white">{section.title}</h3></CardHeader>
                <CardContent>
                  <Textarea
                    value={section.content}
                    onChange={(e) => handleSectionContentChange(index, e.target.value)}
                    placeholder={t('dashboard.manuscript.contentPlaceholder', { title: section.title })}
                    className="min-h-[200px] text-lg leading-relaxed font-serif"
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center text-gray-400 py-12">
                <p>{t('dashboard.manuscript.empty')}</p>
                <p>{t('dashboard.manuscript.emptyHint')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
};