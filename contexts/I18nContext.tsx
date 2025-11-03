import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';

type Language = 'en' | 'de';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

export const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

interface I18nProviderProps {
    children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, Record<string, string>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enResponse, deResponse] = await Promise.all([
          fetch('/locales/en.json'),
          fetch('/locales/de.json'),
        ]);
        const enData = await enResponse.json();
        const deData = await deResponse.json();
        setTranslations({ en: enData, de: deData });
      } catch (error) {
        console.error("Failed to load translation files", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTranslations();
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string>) => {
    if (!translations) {
      return key;
    }
    let translation = translations[language]?.[key] || key;

    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(`{{${placeholder}}}`, value);
      });
    }

    return translation;
  }, [language, translations]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};
