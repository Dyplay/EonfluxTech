import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiEdit3, FiBookmark, FiSettings, FiBriefcase } from 'react-icons/fi';

export function PanelNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    {
      href: '/panel',
      icon: FiHome,
      label: 'Dashboard'
    },
    {
      href: '/panel/posts',
      icon: FiEdit3,
      label: 'Posts'
    },
    {
      href: '/panel/jobs',
      icon: FiBriefcase,
      label: 'Jobs'
    },
    {
      href: '/panel/saved',
      icon: FiBookmark,
      label: 'Saved'
    },
    {
      href: '/panel/settings',
      icon: FiSettings,
      label: 'Settings'
    }
  ];

  return (
    <nav className="flex flex-col gap-1">
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
          <item.icon className="w-5 h-5 mr-3" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
} 