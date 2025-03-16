'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getGumroadAuthUrl, getGumroadConnection, disconnectGumroad } from '@/lib/gumroad';
import { motion, AnimatePresence } from 'framer-motion';

interface GumroadConnectionProps {
  userId: string;
}

interface GumroadConnectionData {
  $id: string;
  gumroad_name: string;
  gumroad_email: string;
  gumroad_url?: string;
}

export default function GumroadConnection({ userId }: GumroadConnectionProps) {
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
      setConnection(data);
    } catch (err: any) {
      console.error('Error loading Gumroad connection:', err);
      setError(err.message || 'Failed to load Gumroad connection');
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
      
      // Get the auth URL and redirect
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
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {connection ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg border bg-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-[#FF90E8]/10 p-2">
                <Image
                  src="/gumroad-logo.svg"
                  alt="Gumroad"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </div>
              <div>
                <p className="font-medium">{connection.gumroad_name}</p>
                <p className="text-sm text-muted-foreground">{connection.gumroad_email}</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="text-sm text-destructive hover:text-destructive/80 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#FF90E8] text-white rounded-md font-medium hover:bg-[#FF90E8]/90 transition-colors"
        >
          <Image
            src="/gumroad-logo.svg"
            alt="Gumroad"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <span>Connect Gumroad</span>
        </motion.button>
      )}
    </div>
  );
} 