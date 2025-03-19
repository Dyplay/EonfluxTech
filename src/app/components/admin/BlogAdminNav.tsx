'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiList, FiPlus, FiHome } from 'react-icons/fi';

export default function BlogAdminNav() {
  const pathname = usePathname();
  
  const navItems = [
    { 
      href: '/admin/blog/manage', 
      label: 'All Posts', 
      icon: <FiList className="w-4 h-4 mr-2" />,
      match: ['/admin/blog/manage']
    },
    { 
      href: '/admin/blog', 
      label: 'Create New', 
      icon: <FiPlus className="w-4 h-4 mr-2" />,
      match: ['/admin/blog']
    },
    { 
      href: '/admin', 
      label: 'Admin Home', 
      icon: <FiHome className="w-4 h-4 mr-2" />,
      match: ['/admin']
    }
  ];
  
  // Check if we're on the edit page
  const isEditPage = pathname.startsWith('/admin/blog/edit/');
  
  return (
    <div className="bg-accent/50 rounded-lg border border-border mb-6">
      <div className="container">
        <nav className="flex flex-wrap gap-2 p-4">
          {navItems.map((item) => {
            // If we're on an edit page, the "All Posts" item should be considered active
            const isActive = isEditPage && item.href === '/admin/blog/manage' ? 
              true : 
              item.match.includes(pathname);
              
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-background hover:bg-accent'
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