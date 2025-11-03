import React from 'react';
import { Template, StorySection, StoryProject } from '../types';
import { STORY_TEMPLATES } from '../constants';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';

interface TemplateViewProps {
  setProject: React.Dispatch<React.SetStateAction<StoryProject>>;
  onNavigate: (view: 'dashboard') => void;
}

export const TemplateView: React.FC<TemplateViewProps> = ({ setProject, onNavigate }) => {
  const { t } = useTranslation();
  
  const applyTemplate = (template: Template) => {
    const newSections: StorySection[] = template.sections.map((sec, index) => ({
      id: `${template.id}-${index}-${Date.now()}`,
      title: sec.title,
      content: ''
    }));
    setProject(p => ({ ...p, manuscript: newSections }));
    onNavigate('dashboard');
  };

  const renderTemplateCard = (template: Template) => (
    <Card key={template.id} className="flex flex-col">
      <CardHeader>
        <h3 className="text-xl font-bold text-white">{template.name}</h3>
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-2 ${template.type === 'Genre' ? 'bg-green-600 text-green-100' : 'bg-purple-600 text-purple-100'}`}>
          {template.type}
        </span>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-300">{template.description}</p>
      </CardContent>
      <div className="p-6 pt-0">
        <Button onClick={() => applyTemplate(template)} className="w-full">
          {t('templates.useTemplate')}
        </Button>
      </div>
    </Card>
  );

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('templates.title')}</h1>
      <p className="text-md md:text-lg text-gray-400 mb-8">
        {t('templates.description')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STORY_TEMPLATES.map(renderTemplateCard)}
      </div>
    </div>
  );
};