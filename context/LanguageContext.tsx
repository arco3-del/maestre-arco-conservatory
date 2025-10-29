import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { getTranslator, Translator, loadTranslations } from '../i18n';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translator;
  isInitialized: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadTranslations();
      setIsInitialized(true);
    };
    init();
  }, []);

  const t = useCallback((key: string, replacements?: { [key: string]: string }) => {
    return getTranslator(language)(key, replacements);
  }, [language]);
  
  const value = { language, setLanguage, t, isInitialized };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};