'use client';

import { useState } from 'react';
import { account } from '@/lib/appwrite';
import { useAuth } from '@/hooks/useAuth';

export function GrantAdminAccess() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, refetchUser } = useAuth();

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Get current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        setMessage('You must be logged in');
        return;
      }
      
      // Set admin preference for current user
      const updatedPrefs = await account.updatePrefs({ 
        admin: true 
      });
      
      setMessage(`Admin privileges granted to yourself! Preferences updated: ${JSON.stringify(updatedPrefs)}`);
      
      // Refetch user data
      await refetchUser();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-4">Grant Admin Access</h3>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleGrantAdmin}>
        <div className="flex gap-2">
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
          >
            {loading ? 'Processing...' : 'Grant Admin To Yourself'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Current user: {user?.$id || 'Not logged in'}</p>
        <p>Admin status: {user?.prefs?.admin ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
} 