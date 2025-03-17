'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/app/components/ThemeProvider';
import { account } from '@/lib/appwrite';
import { Models } from 'appwrite';
import { useTranslation } from './TranslationProvider';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { t, locale } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        
        // Check if user is admin
        setIsAdmin(userData?.prefs?.admin === true || userData?.prefs?.admin === 'true');
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const logoSrc = theme === 'dark' ? '/logo.png' : '/logo_whitemode.png';

  const navigationLinks = [
    { href: '/docs', label: t('common.documentation') },
    { href: '/components', label: t('common.components') },
    { href: '/products', label: t('common.products') },
    { href: '/examples', label: t('common.examples') },
    { href: '/translator-test', label: t('common.translator_test') },
    { href: 'https://github.com/EonfluxTech-com', label: 'GitHub' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center mr-6">
          <Image 
            src={logoSrc}
            alt="Logo"
            width={150}
            height={150}
            className="h-12 w-auto object-contain"
            quality={100}
            priority
          />
        </Link>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="relative text-sm font-medium group px-1"
            >
              <span className="relative z-10 transition-colors duration-300">
                {link.label}
              </span>
              <span className="absolute inset-0 bg-primary/10 rounded-lg scale-x-0 scale-y-0 opacity-0 group-hover:scale-x-100 group-hover:scale-y-100 group-hover:opacity-100 -z-0 transition-all duration-300 ease-out" />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300 ease-out" />
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden ml-auto mr-4 p-2 rounded-md hover:bg-accent transition-colors"
          aria-label={t('common.toggle_menu')}
        >
          <motion.div
            className="w-6 h-5 flex flex-col justify-between"
            animate={isMobileMenuOpen ? "open" : "closed"}
          >
            <motion.span
              className="w-full h-0.5 bg-foreground rounded-full origin-center"
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: 45, y: 10 }
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="w-full h-0.5 bg-foreground rounded-full"
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 }
              }}
              transition={{ duration: 0.1 }}
            />
            <motion.span
              className="w-full h-0.5 bg-foreground rounded-full origin-center"
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: -45, y: -10 }
              }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        </button>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label={theme === 'dark' ? t('common.switch_to_light') : t('common.switch_to_dark')}
          >
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.svg
                  key="sun"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </motion.svg>
              ) : (
                <motion.svg
                  key="moon"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>

          {/* Search Bar */}
          <div className="relative hidden md:flex items-center">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <input
                    type="text"
                    placeholder={t('common.search')}
                    className="w-full h-9 rounded-md border border-input px-3 py-1
                      text-sm shadow-sm transition-colors
                      focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                      placeholder:text-muted-foreground"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="ml-2 p-2 rounded-md hover:bg-accent transition-colors"
              aria-label={isSearchOpen ? t('common.close_search') : t('common.open_search')}
            >
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.svg
                    key="close"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="search"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* User Profile */}
          {!isLoading && (
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-1 rounded-md hover:bg-accent transition-colors"
                    aria-label={t('common.toggle_profile')}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 rounded-md bg-background border shadow-lg z-50"
                      >
                        <div className="p-4 border-b">
                          <p className="font-medium">{user.name || t('common.user')}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/profile"
                            className="flex items-center w-full p-2 text-sm rounded-md hover:bg-accent transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            {t('common.profile')}
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center w-full p-2 text-sm rounded-md hover:bg-accent transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              {t('common.admin_dashboard')}
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full p-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                          >
                            {t('common.logout')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {t('common.login')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t"
          >
            <div className="container py-4 space-y-4">
              <nav className="flex flex-col space-y-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-2 py-1 rounded-md hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              
              <div className="pt-4 border-t">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder={t('common.search')}
                    className="flex-1 h-9 rounded-md border border-input px-3 py-1
                      text-sm shadow-sm transition-colors
                      focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                      placeholder:text-muted-foreground"
                  />
                  <button
                    className="ml-2 p-2 rounded-md hover:bg-accent transition-colors"
                    aria-label={t('common.search')}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 