'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { motion } from 'framer-motion';

interface AdminGuardState {
  status: 'loading' | 'unauthorized' | 'forbidden' | 'authorized';
  message: string | null;
  debugInfo: any;
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();
  const [state, setState] = useState<AdminGuardState>({
    status: 'loading',
    message: null,
    debugInfo: null
  });

  useEffect(() => {
    console.log('🔒 AdminGuard: Checking access...', {
      path: pathname,
      hasUser: !!user,
      loading
    });

    let redirectTimer: NodeJS.Timeout;

    const checkAccess = () => {
      // Still loading auth state
      if (loading) {
        setState({
          status: 'loading',
          message: 'Loading user data...',
          debugInfo: { loading: true, timestamp: new Date().toISOString() }
        });
        return;
      }

      // No user (unauthorized)
      if (!user) {
        console.log('❌ AdminGuard: No user found');
        setState({
          status: 'unauthorized',
          message: 'Please log in to access this area',
          debugInfo: { error: 'No user found', timestamp: new Date().toISOString() }
        });
        redirectTimer = setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // User exists but not admin (forbidden)
      if (!isAdmin()) {
        console.log('🚫 AdminGuard: User not admin', {
          userId: user.$id,
          labels: user.labels,
          prefs: user.prefs
        });
        setState({
          status: 'forbidden',
          message: 'You do not have permission to access this area',
          debugInfo: {
            user: {
              id: user.$id,
              name: user.name,
              email: user.email,
              labels: user.labels,
              prefs: user.prefs
            },
            timestamp: new Date().toISOString()
          }
        });
        redirectTimer = setTimeout(() => router.push('/'), 2000);
        return;
      }

      // User is admin (authorized)
      console.log('✅ AdminGuard: Access granted');
      setState({
        status: 'authorized',
        message: null,
        debugInfo: {
          user: {
            id: user.$id,
            name: user.name,
            email: user.email,
            labels: user.labels,
            prefs: user.prefs
          },
          timestamp: new Date().toISOString()
        }
      });
    };

    checkAccess();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [user, loading, pathname, router, isAdmin]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Verifying access...</p>
        <p className="text-sm text-muted-foreground mt-2">{state.message}</p>
      </div>
    );
  }

  if (state.status === 'unauthorized' || state.status === 'forbidden') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md text-center"
        >
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>{state.message}</p>
          <p className="mt-4 text-sm">
            Redirecting to {state.status === 'unauthorized' ? 'login' : 'home'} page...
          </p>
          
          <details className="mt-4 text-left" open>
            <summary className="cursor-pointer text-xs">Debug Info</summary>
            <pre className="bg-black/10 p-2 rounded mt-2 text-xs overflow-auto max-h-40">
              {JSON.stringify(state.debugInfo, null, 2)}
            </pre>
          </details>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
} 