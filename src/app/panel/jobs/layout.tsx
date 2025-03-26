'use client';

import { motion } from 'framer-motion';
import { FiBriefcase, FiUsers, FiSettings, FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/panel/jobs', label: 'All Jobs', icon: FiBriefcase },
  { href: '/panel/jobs/assignments', label: 'Assignments', icon: FiUsers },
  { href: '/panel/jobs/settings', label: 'Settings', icon: FiSettings },
];

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-foreground"
          >
            Job Management
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/panel/jobs/new"
              className="btn btn-primary flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Create New Job
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex space-x-4 mb-8"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-accent hover:bg-accent/80 text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
} 