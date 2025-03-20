'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function PathTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't store login/register pages as previous path
    if (!pathname.includes('/login') && !pathname.includes('/register')) {
      localStorage.setItem('previousPath', pathname);
    }
  }, [pathname]);

  return null; // This component doesn't render anything
} 