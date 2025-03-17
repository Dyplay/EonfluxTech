'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiGlobe, FiX, FiCheck } from 'react-icons/fi';
import { locales } from '@/i18n';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'hu', name: 'Magyar' }
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: string) => {
    // Create the new path with the selected locale
    const currentPath = pathname;
    const segments = currentPath.split('/');
    
    // Check if the current path already has a locale
    const hasLocalePrefix = locales.some(loc => segments[1] === loc);
    
    let newPath;
    if (hasLocalePrefix) {
      // Replace the current locale with the new one
      segments[1] = newLocale;
      newPath = segments.join('/');
    } else {
      // Add the locale prefix
      newPath = `/${newLocale}${currentPath}`;
    }
    
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Change Language"
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
          
          <div className="space-y-1 mt-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors ${
                  locale === lang.code 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{lang.name}</span>
                {locale === lang.code && <FiCheck className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 