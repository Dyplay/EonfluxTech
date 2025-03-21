'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminAccessCheck({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, checkIsAdmin } = useAuth();

  // Just for debugging
  useEffect(() => {
    if (user) {
      console.log("USER DATA IN ACCESS CHECK:", {
        id: user.$id,
        labels: user.labels,
        isAdmin: user.labels?.includes('admin'),
        checkIsAdmin: checkIsAdmin()
      });
    }
  }, [user, checkIsAdmin]);

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);
  }, []);

  // Separate effect for checking access
  useEffect(() => {
    // Skip if not mounted or still loading auth
    if (!mounted || loading) return;

    // Wait a bit to ensure user data is fully loaded
    const timer = setTimeout(() => {
      const isAdmin = checkIsAdmin();
      console.log(`🔒 ACCESS CHECK [${pathname}]:`, { 
        userId: user?.$id,
        userLabels: user?.labels,
        isAdminByFunc: isAdmin,
        checkMethod: 'labels.includes'
      });
      
      if (user && isAdmin) {
        console.log("✅ Admin access GRANTED");
        setHasAccess(true);
      } else {
        console.log("❌ Admin access DENIED", {
          hasUser: !!user,
          userObj: user,
          checkIsAdminResult: isAdmin
        });
        setHasAccess(false);
      }
      
      setAccessChecked(true);
    }, 2000); // Wait 2 seconds to be safe
    
    return () => clearTimeout(timer);
  }, [user, loading, checkIsAdmin, mounted, pathname]);

  // Final effect for redirect if needed
  useEffect(() => {
    // Only redirect after explicit access check is complete
    if (accessChecked && !hasAccess) {
      console.log("🚨 Redirecting to login due to access denial");
      router.push('/login');
    }
  }, [accessChecked, hasAccess, router]);

  // Show a loading state
  if (!mounted || loading || !accessChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-sm text-secondary">Verifying admin access...</p>
          <p className="text-xs text-muted-foreground mt-2">
            {loading ? "Loading authentication..." : "Checking permissions..."}
          </p>
        </div>
      </div>
    );
  }

  // If we get here, access is checked and granted
  return <>{children}</>;
} 