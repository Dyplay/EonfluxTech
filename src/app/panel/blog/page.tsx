'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BlogPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to blog management page
    router.push('/panel/blog/manage');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      <p className="ml-3 text-gray-500 dark:text-gray-400">Redirecting to blog management...</p>
    </div>
  );
}