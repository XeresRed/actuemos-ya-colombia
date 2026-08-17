'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationDictionary } from './types';
import { es } from './dictionaries/es';
import { en } from './dictionaries/en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const dictionaries: Record<Language, TranslationDictionary> = {
  es,
  en,
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  t: es,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ayc_lang') as Language | null;
      if (stored === 'es' || stored === 'en') {
        setLanguageState(stored);
        document.documentElement.lang = stored;
      } else {
        const browserLang = navigator.language.startsWith('en') ? 'en' : 'es';
        setLanguageState(browserLang);
        document.documentElement.lang = browserLang;
      }
    } catch {
      // Ignorar en entornos donde localStorage no esté disponible
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('ayc_lang', lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignorar
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: dictionaries[language] || es,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
