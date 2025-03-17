'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function MicrosoftTranslator() {
  return (
    <>
      <div 
        id="MicrosoftTranslatorWidget" 
        className="fixed bottom-4 right-4 z-50 shadow-lg rounded-lg overflow-hidden"
        style={{ width: '260px', height: '48px', color: '#000000', backgroundColor: '#f4f4f4' }}
      />
      
      <Script
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            setTimeout(function() {
              var s = document.createElement('script');
              s.type = 'text/javascript';
              s.charset = 'UTF-8';
              s.src = ((location && location.href && location.href.indexOf('https') == 0) ? 'https://ssl.microsofttranslator.com' : 'http://www.microsofttranslator.com') + '/ajax/v3/WidgetV3.ashx?siteData=ueOIGRSKkd965FeEGM5JtQ**&ctf=False&ui=true&settings=Manual&from=';
              var p = document.getElementsByTagName('head')[0] || document.documentElement;
              p.insertBefore(s, p.firstChild);
            }, 0);
          `,
        }}
      />
    </>
  );
} 