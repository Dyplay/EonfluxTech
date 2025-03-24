'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { TranslationProvider } from "@/app/components/TranslationProvider";
import { AuthProvider } from '@/lib/auth/AuthProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
} 