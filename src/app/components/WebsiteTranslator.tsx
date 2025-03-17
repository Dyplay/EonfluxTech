'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    WebsiteTranslator: {
      Options: {
        api: {
          clientId: string;
          url: string;
        };
        ui: {
          toolbarPosition: string;
          layout: string;
          translate: string;
        };
      };
      Initialize: () => void;
    };
  }
}

export default function WebsiteTranslator() {
  useEffect(() => {
    // Initialize the translator after the script has loaded
    if (typeof window !== 'undefined' && window.WebsiteTranslator) {
      console.log('WebsiteTranslator object found in window');
      
      // Configure
      const clientId = process.env.NEXT_PUBLIC_WEBSITE_TRANSLATOR_CLIENT_ID || "YOUR_CLIENT_ID";
      const apiUrl = process.env.NEXT_PUBLIC_WEBSITE_TRANSLATOR_API_URL || "https://example.com";
      
      console.log('Using clientId:', clientId);
      console.log('Using apiUrl:', apiUrl);
      
      window.WebsiteTranslator.Options.api.clientId = clientId;
      window.WebsiteTranslator.Options.api.url = apiUrl;
      window.WebsiteTranslator.Options.ui.toolbarPosition = "top";
      window.WebsiteTranslator.Options.ui.layout = "menu";
      window.WebsiteTranslator.Options.ui.translate = "target";
      
      // Initialize the translator
      try {
        window.WebsiteTranslator.Initialize();
        console.log('WebsiteTranslator initialized successfully');
      } catch (error) {
        console.error('Error initializing WebsiteTranslator:', error);
      }
    } else {
      console.error('WebsiteTranslator object not found in window');
    }
  }, []);

  return (
    <>
      <Script 
        src="/dist/widget.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Website Translator script loaded successfully');
        }}
        onError={(e) => {
          console.error('Error loading Website Translator script:', e);
        }}
      />
      <div className="website-translator"></div>
    </>
  );
} 