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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
    { href: '/docs', label: 'Documentation' },
    { href: '/components', label: 'Components' },
    { href: '/products', label: 'Products' },
    { href: '/examples', label: 'Examples' },
    { href: '/translator-test', label: 'Translator Test' },
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
          aria-label="Toggle menu"
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
            aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
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
                    placeholder="Search..."
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

          {/* Profile Dropdown or Sign In Button - Hidden on Mobile */}
          <div className="hidden md:block">
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
                      className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card dark:bg-gray-800 border border-border dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-foreground dark:text-gray-100 hover:bg-accent dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Profile
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-foreground dark:text-gray-100 hover:bg-accent dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Admin
                          </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-accent dark:hover:bg-gray-700 transition-colors"
                        >
                          Sign Out
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
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-t border-border dark:border-gray-700 bg-background dark:bg-gray-800"
          >
            <nav className="container py-4">
              <ul className="space-y-4">
                {navigationLinks.map((link) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className="block text-lg font-medium text-foreground dark:text-gray-100 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}

                {/* Search Button */}
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                >
                  <div className="pt-4 mt-4 border-t border-border dark:border-gray-700">
                    <button
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                      className="flex items-center w-full px-4 py-2 text-lg font-medium text-foreground dark:text-gray-100 hover:text-primary transition-colors"
                    >
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </button>
                    <AnimatePresence>
                      {isSearchOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pt-2">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search..."
                                className="w-full h-10 pl-10 pr-4 rounded-md border border-input dark:border-gray-600 bg-background dark:bg-gray-700 text-foreground dark:text-gray-100 text-sm transition-colors
                                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:focus-visible:ring-gray-500
                                  placeholder:text-muted-foreground dark:placeholder:text-gray-400"
                                autoFocus
                              />
                              <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.li>

                {/* Theme Toggle Button */}
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: 0.25 }}
                >
                  <button
                    onClick={toggleTheme}
                    className="flex items-center w-full px-4 py-2 text-lg font-medium text-foreground dark:text-gray-100 hover:text-primary transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <svg
                          className="h-5 w-5 mr-2"
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
                        </svg>
                        Light Mode
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5 mr-2"
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
                        </svg>
                        Dark Mode
                      </>
                    )}
                  </button>
                </motion.li>

                {/* User Account Section */}
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                  className="pt-4 mt-4 border-t border-border dark:border-gray-700"
                >
                  {isLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : user ? (
                    <div className="space-y-4">
                      <div className="flex items-center px-4 py-2">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full mr-3">
                          {user.prefs?.avatar ? (
                            <Image
                              src={user.prefs.avatar}
                              alt="Profile"
                              fill
                              className="object-cover"
                              sizes="40px"
                              priority
                            />
                          ) : (
                            <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary text-lg font-medium">
                              {user.name?.charAt(0) || user.email?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.name || 'User'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-foreground dark:text-gray-100 hover:bg-accent dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-sm text-foreground dark:text-gray-100 hover:bg-accent dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Admin
                          </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-accent dark:hover:bg-gray-700 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-lg font-medium text-foreground dark:text-gray-100 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}
                </motion.li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 