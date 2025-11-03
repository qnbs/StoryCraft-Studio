import React, { useState, useMemo } from 'react';
import { StoryProject } from '../types';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader } from './ui/Card';
import { useTranslation } from '../hooks/useTranslation';

interface ExportViewProps {
  project: StoryProject;
}

export const ExportView: React.FC<ExportViewProps> = ({ project }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const formattedManuscript = useMemo(() => {
    let output = `# ${project.title}\n\n`;
    output += `**${t('export.loglineLabel')}:** ${project.logline}\n\n`;
    output += '---\n\n';

    if (project.characters.length > 0) {
      output += `## ${t('export.charactersLabel')}\n\n`;
      project.characters.forEach(char => {
        output += `### ${char.name}\n\n`;
        output += `**${t('export.appearanceLabel')}:** ${char.appearance || 'N/A'}\n\n`;
        output += `**${t('export.motivationLabel')}:** ${char.motivation || 'N/A'}\n\n`;
        output += `**${t('export.backstoryLabel')}:**\n${char.backstory || 'N/A'}\n\n`;
        output += `**${t('export.notesLabel')}:**\n${char.notes || 'N/A'}\n\n`;
      });
      output += '---\n\n';
    }

    if (project.worlds.length > 0) {
      output += `## ${t('export.worldsLabel')}\n\n`;
      project.worlds.forEach(world => {
        output += `### ${world.name}\n\n`;
        output += `**${t('export.descriptionLabel')}:**\n${world.description || 'N/A'}\n\n`;
        output += `**${t('export.historyLabel')}:**\n${world.history || 'N/A'}\n\n`;
        output += `**${t('export.geographyLabel')}:**\n${world.geography || 'N/A'}\n\n`;
        output += `**${t('export.magicSystemLabel')}:**\n${world.magicSystem || 'N/A'}\n\n`;
      });
      output += '---\n\n';
    }

    if (project.manuscript.length > 0) {
      output += `## ${t('export.manuscriptLabel')}\n\n`;
      project.manuscript.forEach(section => {
        output += `### ${section.title}\n\n`;
        output += `${section.content || `(${t('export.emptySection')})`}\n\n`;
      });
    }

    return output;
  }, [project, t]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(formattedManuscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'md' | 'txt') => {
    const blob = new Blob([formattedManuscript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_') || 'MyStory'}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('export.title')}</h1>
      <p className="text-md md:text-lg text-gray-400 mb-8">
        {t('export.description')}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-white">{t('export.options.title')}</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => handleDownload('md')} className="w-full">
                {t('export.options.downloadMd')}
              </Button>
              <Button onClick={() => handleDownload('txt')} className="w-full">
                {t('export.options.downloadTxt')}
              </Button>
              <Button onClick={handleCopyToClipboard} variant="secondary" className="w-full">
                {copied ? t('export.options.copied') : t('common.copyToClipboard')}
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <h2 className="text-2xl font-semibold text-white">{t('export.preview.title')}</h2>
                </CardHeader>
                <CardContent>
                    <pre className="bg-gray-900 p-4 rounded-md text-sm text-gray-300 h-[60vh] overflow-y-auto whitespace-pre-wrap font-sans">
                        {formattedManuscript}
                    </pre>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};