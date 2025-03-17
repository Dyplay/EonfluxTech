'use client';

import { useState, useEffect } from 'react';
import { FiGlobe, FiX } from 'react-icons/fi';

// Languages with their native names
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ko', name: '한국어' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'sv', name: 'Svenska' }
];

export default function DirectTranslator() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Function to translate the page
  const translatePage = (languageCode: string) => {
    // Set the language attribute on the html element
    document.documentElement.lang = languageCode;
    
    // Store the selected language in localStorage
    localStorage.setItem('preferredLanguage', languageCode);
    
    // Update current language state
    setCurrentLanguage(languageCode);
    
    // Close the language selector
    setIsOpen(false);
    
    // Redirect to Google Translate for actual translation
    if (languageCode !== 'en') {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://translate.google.com/translate?sl=en&tl=${languageCode}&u=${currentUrl}`;
    }
  };

  // Load preferred language from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Translate"
      >
        <FiGlobe className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Select Language</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-80 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => translatePage(lang.code)}
                className={`text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  currentLanguage === lang.code 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 