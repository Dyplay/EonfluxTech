'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiSettings, FiKey, FiDatabase, FiUsers, FiEdit3 } from 'react-icons/fi';

export default function AdminNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/panel', label: 'Dashboard', icon: <FiHome className="mr-2" /> },
    { href: '/panel/users', label: 'Users', icon: <FiUsers className="mr-2" /> },
    { href: '/panel/blog/manage', label: 'Blog', icon: <FiEdit3 className="mr-2" /> },
    { href: '/panel/setup', label: 'Setup', icon: <FiSettings className="mr-2" /> },
    { href: '/panel/key-test', label: 'API Key Test', icon: <FiKey className="mr-2" /> },
    { href: '/panel/test', label: 'Appwrite Test', icon: <FiDatabase className="mr-2" /> },
    { href: '/panel/env-test', label: 'Env Variables', icon: <FiSettings className="mr-2" /> },
  ];
  
  return (
    <div className="bg-card border-b border-border mb-6">
      <div className="container max-w-7xl">
        <nav className="flex overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 