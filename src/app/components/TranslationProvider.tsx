'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Import translation files
import enTranslations from './translations/en.json';
import deTranslations from './translations/de.json';
import huTranslations from './translations/hu.json';

// Define available languages
export const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'hu', name: 'Magyar' },
];

// Create a map of translations
const translations = {
  en: enTranslations,
  de: deTranslations,
  hu: huTranslations,
};

// Define the type for our translation context
type TranslationContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
};

// Create the context
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Create the provider component
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('en');

  // Load saved locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && languages.some(lang => lang.code === savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  // Save locale to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[locale as keyof typeof translations];
    
    // Navigate through nested keys
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // If key not found in current locale, try English as fallback
        if (locale !== 'en') {
          let fallback: any = translations.en;
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object' && fk in fallback) {
              fallback = fallback[fk];
            } else {
              return key; // Return the key itself if not found in fallback
            }
          }
          return typeof fallback === 'string' ? fallback : key;
        }
        return key; // Return the key itself if not found
      }
    }
    
    return typeof result === 'string' ? result : key;
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

// Custom hook to use the translation context
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
} 