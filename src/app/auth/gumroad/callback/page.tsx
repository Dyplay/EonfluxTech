'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { exchangeCodeForToken, getGumroadUserInfo, saveGumroadConnection } from '@/lib/gumroad';

export default function GumroadCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get state from URL
        const state = searchParams.get('state');
        if (!state) {
          throw new Error('No state parameter provided');
        }

        // Get stored state
        const storedState = window.localStorage.getItem('gumroad_oauth_state');
        if (!storedState) {
          throw new Error('No stored state found');
        }

        // Clear stored state immediately
        window.localStorage.removeItem('gumroad_oauth_state');

        // Validate state
        if (state !== storedState) {
          throw new Error('State parameter mismatch');
        }

        // Get code
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('No code parameter provided');
        }

        // Exchange code for token
        const tokenData = await exchangeCodeForToken(code);
        if (!tokenData || !tokenData.access_token) {
          throw new Error('Failed to get access token');
        }

        // Get Gumroad user info
        const userInfo = await getGumroadUserInfo(tokenData.access_token);
        if (!userInfo || !userInfo.user) {
          throw new Error('Failed to get user info');
        }

        // Get current user
        const currentUser = await account.get();

        // Save connection
        await saveGumroadConnection(
          currentUser.$id,
          userInfo.user.id,
          tokenData.access_token,
          userInfo.user.email,
          userInfo.user.name,
          userInfo.user.url
        );

        // Redirect back to profile
        router.push('/profile?connected=true');
      } catch (err: any) {
        console.error('Error in Gumroad callback:', err);
        setError(err.message || 'Failed to connect Gumroad account');
      }
    };

    // Only run if we have search params
    if (searchParams.get('state') || searchParams.get('code')) {
      handleCallback();
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 text-center">
          <div className="mb-4 text-destructive">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Connection Failed</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => router.push('/profile')}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Connecting your Gumroad account...</p>
      </div>
    </div>
  );
} 