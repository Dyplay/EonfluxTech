'use client';

import { useState } from 'react';
import { FiGlobe, FiX } from 'react-icons/fi';

// Languages with their native names
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh-CN', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' }
];

export default function BrowserTranslator() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  const translatePage = (languageCode: string) => {
    // Different approaches based on browser
    if (navigator.userAgent.indexOf('Chrome') !== -1) {
      // For Chrome, we can use the built-in translation feature
      // But we need to show instructions since we can't trigger it directly
      setShowNotice(true);
      setIsOpen(false);
    } else {
      // For other browsers, use Google Translate URL
      const currentUrl = encodeURIComponent(window.location.href);
      const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${languageCode}&u=${currentUrl}`;
      window.open(translateUrl, '_blank');
      setIsOpen(false);
    }
  };

  return (
    <>
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
              <h3 className="text-sm font-medium">Translate Page</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => translatePage(lang.code)}
                  className="text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Translation Notice for Chrome Users */}
      {showNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Browser Translation</h3>
              <button 
                onClick={() => setShowNotice(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p>To translate this page in Chrome:</p>
              
              <ol className="list-decimal pl-5 space-y-2">
                <li>Right-click anywhere on the page</li>
                <li>Select "Translate to [Your Language]" from the menu</li>
                <li>Choose your preferred language if prompted</li>
              </ol>
              
              <div className="pt-4">
                <button
                  onClick={() => setShowNotice(false)}
                  className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 