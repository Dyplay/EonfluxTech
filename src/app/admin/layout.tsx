'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import AdminGuard from '@/components/AdminGuard';
import Link from 'next/link';
import {
  FiHome, FiUsers, FiEdit3, FiSettings, FiMenu, FiX, FiLogOut,
  FiDatabase, FiKey, FiFileText, FiSun, FiMoon
} from 'react-icons/fi';

type Theme = 'light' | 'dark';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<Theme>('light');

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
    { href: '/admin', label: 'Dashboard', icon: <FiHome size={18} /> },
    { href: '/admin/users', label: 'Users', icon: <FiUsers size={18} /> },
    { href: '/admin/blog/manage', label: 'Blog', icon: <FiEdit3 size={18} /> },
    { href: '/admin/settings', label: 'Settings', icon: <FiSettings size={18} /> },
    { 
      label: 'Developer', 
      icon: <FiDatabase size={18} />,
      children: [
        { href: '/admin/key-test', label: 'API Key Test', icon: <FiKey size={16} /> },
        { href: '/admin/test', label: 'Appwrite Test', icon: <FiDatabase size={16} /> },
        { href: '/admin/env-test', label: 'Environment', icon: <FiSettings size={16} /> },
      ]
    },
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
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <AdminGuard>
      <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out md:translate-x-0 md:static`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white p-2 rounded">
                  <FiSettings size={18} />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 overflow-y-auto">
              <div className="space-y-1">
                {navItems.map((item, i) => 
                  item.children ? (
                    <div key={i} className="mb-4">
                      <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </div>
                      <div className="mt-1 pl-4 space-y-1">
                        {item.children.map((child, j) => (
                          <Link
                            key={j}
                            href={child.href}
                            className={`flex items-center px-3 py-2 text-sm rounded-md ${
                              isActive(child.href) 
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {child.icon}
                            <span className="ml-3">{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={i}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive(item.href) 
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  )
                )}
              </div>
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || 'email@example.com'}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="ml-auto p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
                </button>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Logout"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
          {/* Top bar */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            >
              <FiMenu size={24} />
            </button>
            <div className="text-lg font-semibold text-gray-900 dark:text-white md:hidden">
              Admin Panel
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full hidden md:inline-flex">
                {user?.labels?.includes('admin') ? 'Admin' : 'Staff'}
              </span>
              <button
                onClick={toggleTheme}
                className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
} 