'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const router = useRouter();
  const { user, loading, checkIsAdmin } = useAuth();

  console.log("🏁 AdminGuard mounted", { 
    hasUser: !!user, 
    loading, 
    pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
  });

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const checkAdminStatus = async () => {
      console.log("🔍 Starting admin status check", { loading, hasUser: !!user });
      
      try {
        if (loading) {
          console.log("🔄 Still loading user data...");
          return;
        }
        
        if (!user && isMounted) {
          console.log("❌ No user data found - not logged in");
          setError('You must be logged in to access admin areas');
          setIsAdmin(false);
          setDebugInfo({ error: 'No user data', timestamp: new Date().toISOString() });
          
          timeoutId = setTimeout(() => {
            if (isMounted) {
              console.log("🔄 Redirecting to login page...");
              router.push('/login');
            }
          }, 2000);
          return;
        }
        
        if (isMounted) {
          console.log("👤 ADMIN GUARD - User data:", user ? {
            id: user.$id,
            name: user.name,
            labels: user.labels,
            prefs: user.prefs
          } : "No user data");
          
          setDebugInfo({ 
            userData: user ? {
              id: user.$id,
              name: user.name,
              labels: user.labels,
              prefs: user.prefs
            } : null,
            timestamp: new Date().toISOString()
          });
          
          const adminStatus = checkIsAdmin();
          console.log("🔑 Admin status check result:", adminStatus);
          
          if (isMounted) {
            setIsAdmin(adminStatus);
            
            if (!adminStatus) {
              console.log("❌ Admin access denied");
              setError('You do not have admin privileges');
              timeoutId = setTimeout(() => {
                if (isMounted) {
                  console.log("🔄 Redirecting to home page...");
                  router.push('/');
                }
              }, 2000);
            } else {
              console.log("✅ Admin access granted");
            }
          }
        }
      } catch (err: any) {
        console.error('🚨 Error checking admin status:', err);
        if (isMounted) {
          setError(err.message || 'Failed to verify admin status');
          setIsAdmin(false);
          setDebugInfo({ 
            error: err.message,
            timestamp: new Date().toISOString(),
            errorObject: JSON.stringify(err)
          });
          
          timeoutId = setTimeout(() => {
            if (isMounted) router.push('/');
          }, 2000);
        }
      }
    };
    
    checkAdminStatus();
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router, user, loading, checkIsAdmin]);

  // Show loading state while checking admin status
  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Verifying admin access...</p>
        <p className="text-sm text-muted-foreground mt-2">
          {loading ? "Loading user data..." : "Checking permissions..."}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Please wait...</p>
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
          <p className="mt-4 text-sm">Redirecting in 2 seconds...</p>
          
          {/* Debug information */}
          <details className="mt-4 text-left" open>
            <summary className="cursor-pointer text-xs">Debug Info</summary>
            <pre className="bg-black/10 p-2 rounded mt-2 text-xs overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
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
          <p className="mt-4 text-sm">Redirecting to home page in 2 seconds...</p>
          
          {/* Debug information */}
          <details className="mt-4 text-left" open>
            <summary className="cursor-pointer text-xs">Debug Info</summary>
            <pre className="bg-black/10 p-2 rounded mt-2 text-xs overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </motion.div>
      </div>
    );
  }

  // If user is admin, render the children
  return <>{children}</>;
} 