import React, { useState } from 'react';
import { OutlineSection, StoryProject, StorySection, View } from '../types';
import { generateStoryOutline } from '../services/geminiService';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { ICONS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

interface OutlineGeneratorViewProps {
  setProject: React.Dispatch<React.SetStateAction<StoryProject>>;
  onNavigate: (view: View) => void;
}

export const OutlineGeneratorView: React.FC<OutlineGeneratorViewProps> = ({ setProject, onNavigate }) => {
  const { t } = useTranslation();
  const [genre, setGenre] = useState('');
  const [idea, setIdea] = useState('');
  const [outline, setOutline] = useState<OutlineSection[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!idea || !genre) return;
    setIsLoading(true);
    setError(null);
    setOutline(null);
    const generatedOutline = await generateStoryOutline(genre, idea);
    if (generatedOutline) {
      setOutline(generatedOutline);
    } else {
      setError(t('outline.error.generationFailed'));
    }
    setIsLoading(false);
  };

  const handleApplyOutline = () => {
    if (!outline) return;
    const newManuscript: StorySection[] = outline.map((section, index) => ({
      id: `outline-${Date.now()}-${index}`,
      title: section.title,
      content: section.description,
    }));
    setProject(p => ({ ...p, manuscript: newManuscript }));
    onNavigate('dashboard');
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('outline.title')}</h1>
      <p className="text-md md:text-lg text-gray-400 mb-8">
        {t('outline.description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-white">{t('outline.idea.title')}</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-2">
                {t('outline.idea.genreLabel')}
              </label>
              <Input
                id="genre"
                placeholder={t('outline.idea.genrePlaceholder')}
                value={genre}
                onChange={e => setGenre(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="idea" className="block text-sm font-medium text-gray-300 mb-2">
                {t('outline.idea.promptLabel')}
              </label>
              <Textarea
                id="idea"
                placeholder={t('outline.idea.promptPlaceholder')}
                value={idea}
                onChange={e => setIdea(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            <Button onClick={handleGenerate} disabled={isLoading || !idea || !genre} className="w-full">
              {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">{ICONS.SPARKLES}</svg>}
              {t('outline.idea.generateButton')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-white">{t('outline.result.title')}</h2>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center h-full min-h-[300px]">
                <div className="text-center">
                    <Spinner className="h-10 w-10 mx-auto" />
                    <p className="mt-4 text-gray-400">{t('outline.result.loading')}</p>
                </div>
              </div>
            )}
            {error && !isLoading && (
                <div className="flex justify-center items-center h-full min-h-[300px] text-red-400">
                    <p>{error}</p>
                </div>
            )}
            {!isLoading && !error && outline && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {outline.map((section, index) => (
                  <Card key={index} className="bg-gray-900/50">
                    <CardHeader><h3 className="text-lg font-semibold text-indigo-300">{section.title}</h3></CardHeader>
                    <CardContent><p className="text-gray-300 font-serif">{section.description}</p></CardContent>
                  </Card>
                ))}
              </div>
            )}
             {!isLoading && !error && !outline && (
                <div className="flex justify-center items-center h-full min-h-[300px]">
                    <p className="text-gray-500 text-center">{t('outline.result.placeholder')}</p>
                </div>
             )}

            {outline && !isLoading && (
                <Button className="mt-6 w-full" onClick={handleApplyOutline}>
                    {t('outline.result.applyButton')}
                </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};