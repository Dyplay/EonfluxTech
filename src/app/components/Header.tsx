'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/app/components/ThemeProvider';
import { account } from '@/lib/appwrite';
import { Models } from 'appwrite';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

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
          {[
            { href: '/docs', label: 'Documentation' },
            { href: '/components', label: 'Components' },
            { href: '/examples', label: 'Examples' },
            { href: 'https://github.com/Dyplay/foundation', label: 'GitHub' }
          ].map((link) => (
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

        <div className="flex flex-1 items-center justify-end space-x-4">
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
                    placeholder="Search documentation..."
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
              aria-label={isSearchOpen ? "Close search" : "Open search"}
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

          {/* Profile Dropdown or Sign In Button */}
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent transition-colors"
              >
                <div className="relative h-6 w-6 overflow-hidden rounded-full">
                  {user.prefs?.avatar ? (
                    <Image
                      src={user.prefs.avatar}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="24px"
                      priority
                    />
                  ) : (
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium">{user.name || user.email}</span>
                <motion.svg
                  animate={{ rotate: isProfileOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-background shadow-lg"
                  >
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-sm text-left text-destructive hover:bg-accent transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 