'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function SimpleTranslator() {
  return (
    <>
      <Script 
        src="/dist/widget.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Website Translator script loaded successfully');
          
          if (typeof window !== 'undefined' && window.WebsiteTranslator) {
            // Configure
            window.WebsiteTranslator.Options.api.clientId = "demo";
            window.WebsiteTranslator.Options.api.url = "https://letsmt.eu/ws/v2/translation";
            window.WebsiteTranslator.Options.ui.toolbarPosition = "top";
            window.WebsiteTranslator.Options.ui.layout = "menu";
            window.WebsiteTranslator.Options.ui.translate = "target";
            
            // Initialize the translator
            window.WebsiteTranslator.Initialize();
          }
        }}
      />
      <div className="website-translator"></div>
    </>
  );
} 