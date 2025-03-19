'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from '@/app/components/AdminGuard';
import AdminNav from '@/app/components/admin/AdminNav';
import { FiDatabase, FiArrowLeft } from 'react-icons/fi';

export default function SetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const setupDatabase = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      const response = await fetch('/api/setup-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to setup database');
      }
      
      setResult(data);
    } catch (err: any) {
      console.error('Error setting up database:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminGuard>
      <AdminNav />
      
      <div className="container max-w-4xl py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 rounded-full hover:bg-accent transition-colors mr-4"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">Database Setup</h1>
        </div>
        
        <div className="bg-accent/50 border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <FiDatabase className="mr-2" /> Blog Database Setup
          </h2>
          <p className="text-secondary mb-6">
            This action will set up the necessary database collections and attributes for the blog functionality. 
            If the collections already exist, this operation will not modify them.
          </p>
          
          <button
            onClick={setupDatabase}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Setting up database...
              </>
            ) : (
              'Setup Blog Database'
            )}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-6 text-red-600">
            <h3 className="font-semibold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6 text-green-600">
            <h3 className="font-semibold mb-2">Success</h3>
            <p>{result.message}</p>
            <pre className="mt-4 bg-background/50 p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </AdminGuard>
  );
} 