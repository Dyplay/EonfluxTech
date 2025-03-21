'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminAccessCheck({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, checkIsAdmin, refetchUser } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      setMounted(true);
      
      // Refetch user data to ensure it's fresh
      if (!loading) {
        await refetchUser();
      }
    };
    
    initialize();
  }, [refetchUser, loading]);

  useEffect(() => {
    // Only perform checks after mounting and when authentication is complete
    if (!mounted || loading) return;
    
    console.log(`AdminAccessCheck [${pathname}]:`, { 
      userId: user?.$id,
      isAdmin: checkIsAdmin(),
      userPrefs: user?.prefs,
      userLabels: user?.labels
    });
    
    // Delay to prevent flashing content and redirects
    const timer = setTimeout(() => {
      if (user && checkIsAdmin()) {
        console.log("✅ Admin access granted");
        setAccessGranted(true);
      } else {
        console.log("❌ Access denied, redirecting to login");
        router.push('/login');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, loading, router, checkIsAdmin, mounted, pathname]);

  // Show loading while checking
  if (!mounted || loading || (!accessGranted && user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-sm text-secondary">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show access denied message (this will show briefly before redirect)
  if (!user || !accessGranted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-xl">Access Denied</p>
          <p className="text-secondary">You don't have permission to access this page.</p>
          <p className="text-sm text-secondary mt-2">
            {user ? "Your account doesn't have admin privileges." : "Please log in first."}
          </p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => router.push('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 