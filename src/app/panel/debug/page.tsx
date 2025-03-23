'use client';

import { useEffect, useState } from 'react';
import { account } from '@/lib/appwrite';
import { isUserAdmin, getCurrentUser } from '@/lib/auth';

export default function AdminDebugPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        // Try multiple methods to get user data
        setLoading(true);
        
        // Method 1: Direct account.get()
        try {
          const user = await account.get();
          console.log("Method 1 - Direct account.get():", user);
          setUserInfo(prev => ({ ...prev, method1: user }));
        } catch (e: any) {
          console.error("Method 1 failed:", e);
          setUserInfo(prev => ({ ...prev, method1Error: e.message }));
        }
        
        // Method 2: getCurrentUser()
        try {
          const { data, error } = await getCurrentUser();
          console.log("Method 2 - getCurrentUser():", { data, error });
          setUserInfo(prev => ({ ...prev, method2: data, method2Error: error }));
        } catch (e: any) {
          console.error("Method 2 failed:", e);
          setUserInfo(prev => ({ ...prev, method2Error: e.message }));
        }
        
        // Method 3: isUserAdmin()
        try {
          const isAdmin = await isUserAdmin();
          console.log("Method 3 - isUserAdmin():", isAdmin);
          setAdminStatus(isAdmin);
        } catch (e: any) {
          console.error("Method 3 failed:", e);
          setError(e.message);
        }
        
      } catch (e: any) {
        console.error("Debug info fetch failed:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDebugInfo();
  }, []);

  if (loading) {
    return (
      <div className="container p-8">
        <h1 className="text-xl font-bold mb-4">Admin Debug - Loading...</h1>
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container p-8">
      <h1 className="text-xl font-bold mb-4">Admin Debug Page</h1>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Admin Status: {adminStatus === null ? 'Unknown' : adminStatus ? 'Yes' : 'No'}</h2>
      </div>
      
      <div className="grid gap-6">
        <div className="bg-card p-4 rounded border border-border">
          <h2 className="font-semibold mb-2">Method 1: Direct account.get()</h2>
          <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-60">
            {JSON.stringify(userInfo?.method1 || userInfo?.method1Error || 'No data', null, 2)}
          </pre>
        </div>
        
        <div className="bg-card p-4 rounded border border-border">
          <h2 className="font-semibold mb-2">Method 2: getCurrentUser()</h2>
          <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-60">
            {JSON.stringify(userInfo?.method2 || userInfo?.method2Error || 'No data', null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
} 