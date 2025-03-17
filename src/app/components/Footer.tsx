'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/app/components/ThemeProvider';
import { useTranslation } from './TranslationProvider';

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t, locale } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const logoSrc = theme === 'dark' ? '/logo.png' : '/logo_whitemode.png';

  return (
    <footer className="border-t border-border bg-accent">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4">
              <Image
                src={logoSrc}
                alt="Logo"
                width={180}
                height={180}
                className="h-12 w-auto object-contain"
                quality={100}
                priority
              />
            </div>
            <p className="text-sm text-secondary">
              {t('common.description')}
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">{t('common.products')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/chat" className="text-secondary hover:text-foreground">EonfluxTech Chat</Link></li>
              <li><Link href="/tunneled" className="text-secondary hover:text-foreground">Tunneled</Link></li>
              <li><Link href="/benchmark" className="text-secondary hover:text-foreground">Benchmark</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">{t('common.company')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-secondary hover:text-foreground">{t('common.about')}</Link></li>
              <li><Link href="/blog" className="text-secondary hover:text-foreground">Blog</Link></li>
              <li><Link href="/contact" className="text-secondary hover:text-foreground">{t('common.contact')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-secondary hover:text-foreground">{t('footer.privacy_policy')}</Link></li>
              <li><Link href="/terms" className="text-secondary hover:text-foreground">{t('footer.terms_of_service')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-secondary">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
} 