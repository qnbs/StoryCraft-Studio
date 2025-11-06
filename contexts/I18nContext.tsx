import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';

type Language = 'en' | 'de';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => any;
}

export const I18nContext = createContext<I18nContextType>({
  language: 'de',
  setLanguage: () => {},
  t: (key: string) => key,
});

interface I18nProviderProps {
    children: ReactNode;
}

const modules = ['common', 'sidebar', 'portal', 'dashboard', 'manuscript', 'writer', 'templates', 'tags', 'outline', 'characters', 'worlds', 'export', 'settings', 'help'];

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('de');
  const [translations, setTranslations] = useState<Record<string, Record<string, any>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async (lang: Language) => {
      try {
        const promises = modules.map(module => 
          fetch(`/locales/${lang}/${module}.json`).then(res => res.json())
        );
        const results = await Promise.all(promises);
        return results.reduce((acc, current) => ({...acc, ...current}), {});
      } catch (error) {
        console.error(`Failed to load translation files for ${lang}`, error);
        return {};
      }
    };
    
    const loadAllLanguages = async () => {
        setIsLoading(true);
        try {
            const [enData, deData] = await Promise.all([
                fetchTranslations('en'),
                fetchTranslations('de')
            ]);
            setTranslations({ en: enData, de: deData });
        } catch (error) {
            console.error("Failed to load all translation files", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadAllLanguages();
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string>) => {
    if (!translations) {
      return key;
    }
    const value = translations[language]?.[key] || key;

    if (typeof value !== 'string') {
        return value; // For objects/arrays like help categories
    }

    let translation = value;

    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(`{{${placeholder}}}`, value);
      });
    }

    return translation;
  }, [language, translations]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--background-primary)]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--border-interactive)]"></div>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};