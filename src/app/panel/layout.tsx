'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import AdminGuard from '@/components/AdminGuard';
import AdminNav from '@/app/components/admin/AdminNav';
import Link from 'next/link';
import {
  FiHome, FiUsers, FiEdit3, FiDatabase, 
  FiKey, FiFileText, FiSun, FiMoon, FiLogOut, FiChevronDown, FiSettings
} from 'react-icons/fi';

type Theme = 'light' | 'dark';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<Theme>('light');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setTheme(savedTheme);
    } else {
      // Default to light if no theme is found
      setTheme('light');
    }
  }, []);

  // Update HTML class and localStorage when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const navItems = [
    { href: '/panel', label: 'Dashboard', icon: <FiHome size={18} /> },
    { href: '/panel/users', label: 'Users', icon: <FiUsers size={18} /> },
    { href: '/panel/blog/manage', label: 'Blog', icon: <FiEdit3 size={18} /> },
  ];

  const developerItems = [
    { href: '/panel/key-test', label: 'API Key Test', icon: <FiKey size={16} /> },
    { href: '/panel/test', label: 'Appwrite Test', icon: <FiDatabase size={16} /> },
    { href: '/panel/env-test', label: 'Environment', icon: <FiSettings size={16} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/panel') {
      return pathname === '/panel';
    }
    return pathname.startsWith(href);
  };

  return (
    <AdminGuard>
      <div className={`min-h-screen bg-gray-50 dark:bg-[rgb(16,8,24)] ${theme === 'dark' ? 'dark' : ''}`}>
        <AdminNav />

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
} 