'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminNav from '@/app/components/admin/AdminNav';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApiKey = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Testing API key with Appwrite...');
        const response = await fetch('/api/admin/test');
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        setResult(data);
      } catch (err: any) {
        console.error('Error testing API key:', err);
        setError(err.message || 'Failed to test API key');
      } finally {
        setLoading(false);
      }
    };

    testApiKey();
  }, []);

  return (
    <div>
      <AdminNav />
      <div className="container max-w-4xl py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-2">Appwrite API Test</h1>
          <p className="text-muted-foreground mb-8">
            Testing if the Appwrite API key can successfully connect to Appwrite
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-6 bg-destructive/10 text-destructive rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : result ? (
          <div className="p-6 bg-card rounded-lg border border-border">
            <h2 className="text-xl font-bold mb-4">API Key Test Results</h2>
            
            {result.success ? (
              <div className="p-4 bg-green-500/10 text-green-500 rounded-md mb-4">
                <p className="font-medium">{result.message}</p>
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md mb-4">
                <p className="font-medium">Error: {result.message}</p>
              </div>
            )}
            
            {result.userCount !== undefined && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p><span className="font-medium">User Count:</span> {result.userCount}</p>
              </div>
            )}
            
            {result.error && (
              <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
                <h3 className="text-lg font-medium mb-2">Error Details</h3>
                <p>{result.error}</p>
                {result.code && <p className="mt-2"><span className="font-medium">Code:</span> {result.code}</p>}
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-medium mb-2">Next Steps</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Visit <a href="/admin/key-test" className="text-primary hover:underline">API Key Test Page</a> to check the API key format</li>
                <li>Visit <a href="/admin/env-test" className="text-primary hover:underline">Environment Variables Test</a> to check environment variables</li>
                <li>Visit <a href="/admin" className="text-primary hover:underline">Admin Dashboard</a> to see if real data is displayed</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-amber-500/10 text-amber-500 rounded-lg">
            <p>No result received from the API.</p>
          </div>
        )}
      </div>
    </div>
  );
} 