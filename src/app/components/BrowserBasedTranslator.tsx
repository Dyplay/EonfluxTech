'use client';

import { useState } from 'react';
import { FiGlobe, FiX } from 'react-icons/fi';

// Languages with their native names
const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' }
];

export default function BrowserBasedTranslator() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Function to handle translation
  const translatePage = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    
    if (languageCode === 'en') {
      // If English is selected, reload the page to get original content
      window.location.reload();
      return;
    }
    
    // Check if we're in Chrome or Edge (which have built-in translation)
    const isChromiumBased = /Chrome/.test(navigator.userAgent) || /Edg/.test(navigator.userAgent);
    
    if (isChromiumBased) {
      // Show instructions for Chrome/Edge users
      setShowInstructions(true);
      setIsOpen(false);
    } else {
      // For other browsers, use Google Translate
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://translate.google.com/translate?sl=auto&tl=${languageCode}&u=${currentUrl}`;
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
                    selectedLanguage === lang.code 
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

      {/* Translation Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Browser Translation</h3>
              <button 
                onClick={() => setShowInstructions(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX />
              </button>
            </div>
            
            <div className="space-y-4">
              <p>To translate this page in your browser:</p>
              
              <ol className="list-decimal pl-5 space-y-2">
                <li>Right-click anywhere on the page</li>
                <li>Select "Translate to [Your Language]" from the menu</li>
                <li>If prompted, choose {languages.find(l => l.code === selectedLanguage)?.name || 'your preferred language'}</li>
              </ol>
              
              <p className="text-sm text-gray-500 mt-4">
                Alternatively, you can use the built-in translation feature in your browser's menu.
              </p>
              
              <div className="pt-4">
                <button
                  onClick={() => {
                    setShowInstructions(false);
                    // Fallback to Google Translate if the user prefers
                    const currentUrl = encodeURIComponent(window.location.href);
                    window.open(`https://translate.google.com/translate?sl=auto&tl=${selectedLanguage}&u=${currentUrl}`, '_blank');
                  }}
                  className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Use Google Translate Instead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 