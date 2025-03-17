'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
  }
}

export default function GoogleTranslate() {
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
      <div id="google_translate_element" className="fixed top-0 right-0 z-50 p-2"></div>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
} 