'use client';

import { useEffect, useState } from 'react';
import { getGumroadConnection, disconnectGumroad } from '@/lib/gumroad';
import { getGumroadAuthUrl } from '@/lib/gumroad';
import { Models } from 'appwrite';

interface GumroadConnectionData {
  gumroad_name: string;
  gumroad_email: string;
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  user_id?: string;
}

function isGumroadConnectionData(data: unknown): data is GumroadConnectionData {
  if (!data || typeof data !== 'object') return false;
  const d = data as any;
  return typeof d.gumroad_name === 'string' && typeof d.gumroad_email === 'string';
}

export default function GumroadConnection({ userId }: { userId: string }) {
  const [connection, setConnection] = useState<GumroadConnectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConnection();
  }, [userId]);

  const loadConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getGumroadConnection(userId);
      
      // Type guard to ensure data has the required properties
      if (isGumroadConnectionData(data)) {
        setConnection(data);
      } else {
        throw new Error('Invalid Gumroad connection data received');
      }
    } catch (err: any) {
      console.error('Error loading Gumroad connection:', err);
      setError(err.message || 'Failed to load Gumroad connection');
      setConnection(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    try {
      // Generate a random state
      const state = Math.random().toString(36).substring(2, 15);
      
      // Store it in localStorage before redirect
      window.localStorage.setItem('gumroad_oauth_state', state);
      
      // Get the auth URL with state
      const authUrl = getGumroadAuthUrl(state);
      window.location.href = authUrl;
    } catch (err: any) {
      console.error('Error initiating Gumroad connection:', err);
      setError(err.message || 'Failed to initiate Gumroad connection');
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await disconnectGumroad(userId);
      setConnection(null);
    } catch (err: any) {
      console.error('Error disconnecting Gumroad:', err);
      setError(err.message || 'Failed to disconnect Gumroad');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
        {error}
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your Gumroad account to manage your products and sales.
        </p>
        <button
          onClick={handleConnect}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors 
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
            disabled:pointer-events-none disabled:opacity-50 
            bg-primary text-primary-foreground shadow hover:bg-primary/90 
            h-9 px-4 py-2"
        >
          Connect Gumroad
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium">Connected Account</p>
        <p className="text-sm text-muted-foreground">{connection.gumroad_name}</p>
        <p className="text-sm text-muted-foreground">{connection.gumroad_email}</p>
      </div>
      <button
        onClick={handleDisconnect}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors 
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
          disabled:pointer-events-none disabled:opacity-50 
          border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground 
          h-9 px-4 py-2"
      >
        Disconnect
      </button>
    </div>
  );
} 