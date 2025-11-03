import React, { useState } from 'react';
import { generateScene } from '../services/geminiService';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { ICONS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

type GenerationType = 'description' | 'dialogue' | 'ending';

export const WriterView: React.FC = () => {
  const { t } = useTranslation();
  const [generationType, setGenerationType] = useState<GenerationType>('description');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!context) return;
    setIsLoading(true);
    setResult('');
    const generatedText = await generateScene(context, generationType);
    setResult(generatedText);
    setIsLoading(false);
  };
    
  const getPlaceholderText = () => {
      switch(generationType) {
          case 'description':
              return t('writer.placeholders.description');
          case 'dialogue':
              return t('writer.placeholders.dialogue');
          case 'ending':
              return t('writer.placeholders.ending');
      }
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('writer.title')}</h1>
      <p className="text-md md:text-lg text-gray-400 mb-8">
        {t('writer.description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-white">{t('writer.request.title')}</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="gen-type" className="block text-sm font-medium text-gray-300 mb-2">
                {t('writer.request.generateLabel')}
              </label>
              <Select
                id="gen-type"
                value={generationType}
                onChange={e => setGenerationType(e.target.value as GenerationType)}
              >
                <option value="description">{t('writer.request.options.description')}</option>
                <option value="dialogue">{t('writer.request.options.dialogue')}</option>
                <option value="ending">{t('writer.request.options.ending')}</option>
              </Select>
            </div>
            <div>
              <label htmlFor="context" className="block text-sm font-medium text-gray-300 mb-2">
                {t('writer.request.contextLabel')}
              </label>
              <Textarea
                id="context"
                placeholder={getPlaceholderText()}
                value={context}
                onChange={e => setContext(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            <Button onClick={handleGenerate} disabled={isLoading || !context} className="w-full">
              {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">{ICONS.SPARKLES}</svg>}
              {t('common.generate')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-white">{t('writer.result.title')}</h2>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-full min-h-[300px]">
                    <Spinner className="h-10 w-10"/>
                </div>
            ) : (
                <div className="prose prose-invert prose-lg min-h-[300px] bg-gray-900 p-4 rounded-md whitespace-pre-wrap font-serif">
                  {result || <span className="text-gray-500">{t('writer.result.placeholder')}</span>}
                </div>
            )}
            {result && !isLoading && (
                <Button variant="secondary" className="mt-4" onClick={() => navigator.clipboard.writeText(result)}>
                    {t('common.copyToClipboard')}
                </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};