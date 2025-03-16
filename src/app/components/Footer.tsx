'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/app/components/ThemeProvider';

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const logoSrc = theme === 'dark' ? '/logo.png' : '/logo_whitemode.png';

  return (
    <footer className="border-t border-border bg-accent">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4">
              <Image
                src={logoSrc}
                alt="Logo"
                width={180}
                height={180}
                className="h-12 w-auto object-contain"
                quality={100}
                priority
              />
            </div>
            <p className="text-sm text-secondary">
              Where universal and simple software is built. Creating open-source technologies that empower developers and users alike.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/chat" className="text-secondary hover:text-foreground">EonfluxTech Chat</Link></li>
              <li><Link href="/tunneled" className="text-secondary hover:text-foreground">Tunneled</Link></li>
              <li><Link href="/benchmark" className="text-secondary hover:text-foreground">Benchmark</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-secondary hover:text-foreground">About Us</Link></li>
              <li><Link href="/blog" className="text-secondary hover:text-foreground">Blog</Link></li>
              <li><Link href="/contact" className="text-secondary hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-secondary hover:text-foreground">Privacy</Link></li>
              <li><Link href="/terms" className="text-secondary hover:text-foreground">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-secondary">© EonfluxTech 2024. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 