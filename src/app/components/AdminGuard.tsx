'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isUserAdmin } from '@/lib/auth';
import { motion } from 'framer-motion';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await isUserAdmin();
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          router.push('/');
        }
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message || 'Failed to verify admin status');
        setIsAdmin(false);
        
        // Redirect after a short delay to show the error
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };
    
    checkAdminStatus();
  }, [router]);

  // Show loading state while checking admin status
  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md text-center"
        >
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>{error}</p>
          <p className="mt-4 text-sm">Redirecting to home page...</p>
        </motion.div>
      </div>
    );
  }

  // If user is not admin, we're already redirecting
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md text-center"
        >
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>You don't have permission to access the admin dashboard.</p>
          <p className="mt-4 text-sm">Redirecting to home page...</p>
        </motion.div>
      </div>
    );
  }

  // If user is admin, render the children
  return <>{children}</>;
} 