'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from '@/app/components/AdminGuard';
import AdminNav from '@/app/components/admin/AdminNav';
import { FiDatabase, FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function SetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'error'>('untested');
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Function to test connection to Appwrite
  const testConnection = async () => {
    try {
      setIsTestingConnection(true);
      setConnectionStatus('untested');
      setConnectionMessage(null);
      
      // Create a test endpoint to verify Appwrite connection
      const response = await fetch('/api/test-appwrite-connection', {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('success');
        setConnectionMessage('Successfully connected to Appwrite!');
      } else {
        setConnectionStatus('error');
        setConnectionMessage(data.message || 'Failed to connect to Appwrite');
      }
    } catch (err: any) {
      console.error('Error testing connection:', err);
      setConnectionStatus('error');
      setConnectionMessage(err.message || 'An unexpected error occurred');
    } finally {
      setIsTestingConnection(false);
    }
  };

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
        console.error('Server returned error:', data);
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
  
  const renderTroubleshooting = () => (
    <div className="bg-accent/50 border border-border rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
      <p className="text-secondary mb-4">
        If you're experiencing issues setting up the database, check the following:
      </p>
      <ul className="list-disc list-inside space-y-2 text-secondary">
        <li>Ensure all environment variables are correctly set in your <code className="bg-background px-1 py-0.5 rounded">.env.local</code> file</li>
        <li>Make sure <code className="bg-background px-1 py-0.5 rounded">APPWRITE_API_KEY</code> has sufficient permissions (databases.write)</li>
        <li>Check that the database with ID <code className="bg-background px-1 py-0.5 rounded">{process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '(not set)'}</code> exists in Appwrite</li>
        <li>Verify your Appwrite project settings and network connectivity</li>
      </ul>
    </div>
  );
  
  const renderEnvironmentCheck = () => (
    <div className="bg-accent/50 border border-border rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-4">Variable</th>
              <th className="text-left py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4">NEXT_PUBLIC_APPWRITE_ENDPOINT</td>
              <td className="py-2 px-4">
                {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ? 
                  <span className="text-green-500">✓ Set</span> : 
                  <span className="text-red-500">✗ Missing</span>}
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">NEXT_PUBLIC_APPWRITE_PROJECT_ID</td>
              <td className="py-2 px-4">
                {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ? 
                  <span className="text-green-500">✓ Set</span> : 
                  <span className="text-red-500">✗ Missing</span>}
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">NEXT_PUBLIC_APPWRITE_DATABASE_ID</td>
              <td className="py-2 px-4">
                {process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ? 
                  <span className="text-green-500">✓ Set</span> : 
                  <span className="text-red-500">✗ Missing</span>}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4">APPWRITE_API_KEY</td>
              <td className="py-2 px-4">
                {process.env.APPWRITE_API_KEY ? 
                  <span className="text-green-500">✓ Set</span> : 
                  <span className="text-red-500">✗ Missing</span>}
                <span className="text-xs text-secondary ml-2">(server-side only)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-secondary mt-4">
        Note: Client-side can only check NEXT_PUBLIC_* variables. The API key can only be verified server-side.
      </p>
    </div>
  );

  return (
    <AdminGuard>
      
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
            <FiDatabase className="mr-2" /> Appwrite Connection Test
          </h2>
          <p className="text-secondary mb-6">
            Before setting up the database, verify that your application can connect to Appwrite using your credentials.
          </p>
          
          {connectionStatus !== 'untested' && (
            <div className={`mb-4 p-4 rounded-md ${
              connectionStatus === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
            }`}>
              <div className="flex items-center">
                {connectionStatus === 'success' ? (
                  <FiCheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <FiXCircle className="w-5 h-5 mr-2" />
                )}
                <span>{connectionMessage}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={testConnection}
            disabled={isTestingConnection}
            className="btn btn-secondary mr-4"
          >
            {isTestingConnection ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Testing connection...
              </>
            ) : (
              'Test Appwrite Connection'
            )}
          </button>
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
        
        {renderEnvironmentCheck()}
        {renderTroubleshooting()}
      </div>
    </AdminGuard>
  );
} 