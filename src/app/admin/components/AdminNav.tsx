'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiEdit3, FiBookmark, FiBriefcase } from 'react-icons/fi';

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    {
      href: '/admin',
      icon: FiHome,
      label: 'Dashboard'
    },
    {
      href: '/admin/posts',
      icon: FiEdit3,
      label: 'Posts'
    },
    {
      href: '/admin/jobs',
      icon: FiBriefcase,
      label: 'Jobs'
    },
    {
      href: '/admin/saved',
      icon: FiBookmark,
      label: 'Saved'
    }
  ];

  return (
    <nav className="flex space-x-4 mb-8">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            isActive(item.href)
              ? 'bg-primary text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <item.icon className="w-5 h-5 mr-2" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
} 