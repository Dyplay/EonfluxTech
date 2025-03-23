'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminGuard from '@/app/components/AdminGuard';

export default function EnvTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testEnvVars = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Testing environment variables...');
        const response = await fetch('/api/admin/env-test');
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        setResult(data);
      } catch (err: any) {
        console.error('Error testing environment variables:', err);
        setError(err.message || 'Failed to test environment variables');
      } finally {
        setLoading(false);
      }
    };

    testEnvVars();
  }, []);

  return (
    <AdminGuard>
      <div className="container max-w-4xl py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-2">Environment Variables Test</h1>
          <p className="text-muted-foreground mb-8">
            Testing if environment variables are properly configured
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
          <div className="space-y-6">
            <div className="p-6 bg-card rounded-lg border border-border">
              <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
              
              {result.success ? (
                <div className="p-4 bg-green-500/10 text-green-500 rounded-md mb-4">
                  <p className="font-medium">{result.message}</p>
                </div>
              ) : (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md mb-4">
                  <p className="font-medium">Error: {result.message}</p>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Key Variables</h3>
                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm">
                    {JSON.stringify(result.variables, null, 2)}
                  </pre>
                </div>
              </div>
              
              {result.allEnvKeys && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">All Environment Variables (Names Only)</h3>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto max-h-60">
                    <pre className="text-sm">
                      {JSON.stringify(result.allEnvKeys, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-2">Next Steps</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Check if <code className="bg-muted px-1 py-0.5 rounded">APPWRITE_API_KEY</code> is properly set</li>
                <li>Visit <a href="/admin/key-test" className="text-primary hover:underline">API Key Test Page</a> to test the API key format</li>
                <li>Visit <a href="/admin/test" className="text-primary hover:underline">API Test Page</a> to test if the API key works with Appwrite</li>
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
    </AdminGuard>
  );
} 