'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
// ... other imports

export default function AdminBlogContent() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, loading, checkIsAdmin } = useAuth();

  useEffect(() => {
    setMounted(true);
    
    // Redirect if not authenticated or not admin
    if (!loading && (!user || !checkIsAdmin())) {
      router.push('/login');
    }
  }, [user, loading, router, checkIsAdmin]);

  // Don't render anything until mounted and auth checked
  if (!mounted || loading || !user || !checkIsAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Rest of the component remains the same
  return (
    <div className="container py-8">
      {/* Your admin page content */}
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {/* Add your admin content here */}
    </div>
  );
} 