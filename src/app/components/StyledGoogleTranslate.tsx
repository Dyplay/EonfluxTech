'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { FiGlobe } from 'react-icons/fi';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
  }
}

export default function StyledGoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Define the initialization function for Google Translate
    window.googleTranslateElementInit = () => {
      const google = (window as any).google;
      if (google && google.translate) {
        new google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'ar,de,es,fr,it,ja,ko,pt,ru,zh-CN', // Add or remove languages as needed
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
      }
    };
  }, []);

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
                ✕
              </button>
            </div>
            <div id="google_translate_element" className="w-full"></div>
          </div>
        )}
      </div>
      
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      
      {/* Hide Google Translate attribution with CSS */}
      <style jsx global>{`
        .goog-te-gadget-simple {
          border: none !important;
          background-color: transparent !important;
          padding: 0 !important;
          width: 100% !important;
        }
        .goog-te-gadget-simple .goog-te-menu-value {
          color: inherit !important;
        }
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
      `}</style>
    </>
  );
} 