'use client';

import { useState, useEffect } from 'react';
import { FiGlobe, FiX } from 'react-icons/fi';

// Languages supported by DeepL
const languages = [
  { code: 'EN', name: 'English' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'FR', name: 'Français' },
  { code: 'ES', name: 'Español' },
  { code: 'IT', name: 'Italiano' },
  { code: 'NL', name: 'Nederlands' },
  { code: 'PL', name: 'Polski' },
  { code: 'PT', name: 'Português' },
  { code: 'RU', name: 'Русский' },
  { code: 'JA', name: '日本語' },
  { code: 'ZH', name: '中文' }
];

export default function DeepLTranslator() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store original text content to allow switching back to English
  const [originalContent, setOriginalContent] = useState<Map<Element, string>>(new Map());
  
  // Function to collect all text nodes from the DOM
  const getTextNodes = () => {
    const textElements: Element[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip script and style elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          if (
            parent.tagName === 'SCRIPT' || 
            parent.tagName === 'STYLE' || 
            parent.classList.contains('deepl-translator') ||
            node.textContent?.trim() === ''
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.parentElement && node.textContent?.trim()) {
        textElements.push(node.parentElement);
      }
    }
    
    // Remove duplicates
    return [...new Set(textElements)];
  };
  
  // Function to translate text using our API route
  const translateText = async (text: string, targetLang: string) => {
    try {
      console.log(`Translating text to ${targetLang}: "${text.substring(0, 30)}..."`);
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: [text],
          target_lang: targetLang,
          source_lang: 'EN',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Translation API error:', data);
        throw new Error(`Translation API error: ${response.status}${data.details ? ` - ${data.details}` : ''}`);
      }
      
      if (!data.translations || !data.translations[0]) {
        console.error('Unexpected API response:', data);
        throw new Error('Unexpected API response format');
      }
      
      return data.translations[0].text;
    } catch (error) {
      console.error('Translation error:', error);
      setError(error instanceof Error ? error.message : String(error));
      return text; // Return original text on error
    }
  };
  
  // Function to translate the page
  const translatePage = async (languageCode: string) => {
    setError(null);
    
    if (languageCode === 'EN' && originalContent.size > 0) {
      // Restore original content if switching back to English
      originalContent.forEach((text, element) => {
        element.textContent = text;
      });
      setOriginalContent(new Map());
      setCurrentLanguage('EN');
      setIsOpen(false);
      document.documentElement.lang = 'en';
      return;
    }
    
    setIsTranslating(true);
    
    try {
      // Set the language attribute on the html element
      document.documentElement.lang = languageCode.toLowerCase();
      
      // Store the selected language in localStorage
      localStorage.setItem('preferredLanguage', languageCode);
      
      // Update current language state
      setCurrentLanguage(languageCode);
      
      // Close the language selector
      setIsOpen(false);
      
      // Get all text elements
      const elements = getTextNodes();
      console.log(`Found ${elements.length} text elements to translate`);
      
      // Store original content if not already stored
      if (originalContent.size === 0) {
        elements.forEach(element => {
          if (element.textContent) {
            originalContent.set(element, element.textContent);
          }
        });
      }
      
      // Translate each element
      const batchSize = 5; // Process in smaller batches to avoid overwhelming the API
      for (let i = 0; i < elements.length; i += batchSize) {
        const batch = elements.slice(i, i + batchSize);
        console.log(`Translating batch ${i / batchSize + 1} of ${Math.ceil(elements.length / batchSize)}`);
        
        await Promise.all(batch.map(async (element) => {
          if (element.textContent && element.textContent.trim()) {
            const originalText = originalContent.get(element) || element.textContent;
            if (originalText.length > 1) { // Only translate non-empty text
              const translatedText = await translateText(originalText, languageCode);
              element.textContent = translatedText;
            }
          }
        }));
      }
      
      console.log('Translation completed successfully');
    } catch (err) {
      console.error('Error during translation:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsTranslating(false);
    }
  };

  // Load preferred language from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage.toLowerCase();
      
      // Apply translation if not English
      if (savedLanguage !== 'EN') {
        translatePage(savedLanguage);
      }
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 deepl-translator">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Translate"
        disabled={isTranslating}
      >
        {isTranslating ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FiGlobe className="w-5 h-5" />
        )}
      </button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64 deepl-translator">
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
                disabled={isTranslating}
              >
                {lang.name}
              </button>
            ))}
          </div>
          
          {isTranslating && (
            <div className="mt-2 text-xs text-center text-gray-500">
              Translating page content...
            </div>
          )}
          
          {error && (
            <div className="mt-2 text-xs text-center text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded">
              Error: {error}
            </div>
          )}
          
          <div className="mt-4 text-xs text-center text-gray-500">
            Powered by DeepL
          </div>
        </div>
      )}
    </div>
  );
} 