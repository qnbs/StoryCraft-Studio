import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Select } from './ui/Select';

export const SettingsView: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'en' | 'de');
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('settings.title')}</h1>
      <p className="text-md md:text-lg text-gray-400 mb-8">{t('settings.description')}</p>
      
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-white">{t('settings.language.title')}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">{t('settings.language.description')}</p>
            <Select value={language} onChange={handleLanguageChange}>
              <option value="en">{t('settings.language.english')}</option>
              <option value="de">{t('settings.language.german')}</option>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};