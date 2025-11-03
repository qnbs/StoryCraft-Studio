import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent, CardHeader } from './ui/Card';

const HelpSection: React.FC<{ titleKey: string; contentKey: string }> = ({ titleKey, contentKey }) => {
  const { t } = useTranslation();
  return (
    <Card className="bg-gray-800/50">
      <CardHeader>
        <h2 className="text-2xl font-semibold text-white">{t(titleKey)}</h2>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 leading-relaxed">{t(contentKey)}</p>
      </CardContent>
    </Card>
  );
};

export const HelpView: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    { title: 'help.dashboard.title', content: 'help.dashboard.content' },
    { title: 'help.templates.title', content: 'help.templates.content' },
    { title: 'help.outline.title', content: 'help.outline.content' },
    { title: 'help.characters.title', content: 'help.characters.content' },
    { title: 'help.world.title', content: 'help.world.content' },
    { title: 'help.writer.title', content: 'help.writer.content' },
    { title: 'help.export.title', content: 'help.export.content' },
  ];

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('help.title')}</h1>
      <p className="text-md md:text-lg text-gray-400 mb-8">{t('help.description')}</p>

      <div className="space-y-6">
        {sections.map(section => (
          <HelpSection key={section.title} titleKey={section.title} contentKey={section.content} />
        ))}
      </div>
    </div>
  );
};