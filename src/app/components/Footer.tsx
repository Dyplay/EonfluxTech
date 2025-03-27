'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/app/components/ThemeProvider';
import { useTranslation } from './TranslationProvider';
import { getGithubRepos, GitHubRepo } from '@/lib/github';

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const data = await getGithubRepos();
      // Sort by stars and get top 3
      const topRepos = data
        .sort((a: GitHubRepo, b: GitHubRepo) => b.stargazers_count - a.stargazers_count)
        .slice(0, 3);
      setRepos(topRepos);
    } catch (error) {
      console.error('Error fetching repos:', error);
    }
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null;

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
              {repos.map((repo) => (
                <li key={repo.id}>
                  <Link 
                    href={repo.html_url} 
                    className="text-secondary hover:text-foreground"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repo.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">{t('common.company')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-secondary hover:text-foreground">{t('common.about')}</Link></li>
              <li><Link href="/blog" className="text-secondary hover:text-foreground">Blog</Link></li>
              <li><Link href="/contact" className="text-secondary hover:text-foreground">{t('common.contact')}</Link></li>
              <li><Link href="/career" className="text-secondary hover:text-foreground">Careers</Link></li>
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
          <p className="text-sm text-secondary">
            © {currentYear} EonfluxTech. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
} 