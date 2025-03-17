'use client';

import { useEffect, useState } from 'react';
import { getGumroadConnection, disconnectGumroad } from '@/lib/gumroad';
import { getGumroadAuthUrl } from '@/lib/gumroad';
import { Models } from 'appwrite';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface GumroadConnectionData {
  $id: string;
  user_id: string;
  gumroad_user_id: string;
  access_token: string;
  gumroad_email: string;
  gumroad_name: string;
  gumroad_url?: string | null;
  created_at?: string;
  last_updated?: string;
}

function isGumroadConnectionData(data: unknown): data is GumroadConnectionData {
  if (!data || typeof data !== 'object') return false;
  const d = data as any;
  return (
    typeof d.gumroad_user_id === 'string' &&
    typeof d.access_token === 'string' &&
    typeof d.gumroad_email === 'string' &&
    typeof d.gumroad_name === 'string'
  );
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
      
      if (!data) {
        setConnection(null);
        return;
      }

      // Type guard to ensure data has the required properties
      if (isGumroadConnectionData(data)) {
        setConnection(data);
      } else {
        console.error('Invalid connection data:', data);
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
      <div className="p-6 space-y-4 bg-card rounded-lg border border-border">
        <div className="flex items-center space-x-3">
          <div className="relative h-8 w-8">
            <Image
              src="/gumroad-logo.svg"
              alt="Gumroad Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h3 className="font-medium">Gumroad Integration</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Gumroad account to manage your products and sales.
            </p>
          </div>
        </div>
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
    <div className="p-6 space-y-4 bg-card rounded-lg border border-border">
      <div className="flex items-center space-x-3">
        <div className="relative h-8 w-8">
          <Image
            src="/gumroad-logo.svg"
            alt="Gumroad Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h3 className="font-medium">Connected Gumroad Account</h3>
          <p className="text-sm text-muted-foreground">{connection.gumroad_name}</p>
          <p className="text-sm text-muted-foreground">{connection.gumroad_email}</p>
        </div>
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