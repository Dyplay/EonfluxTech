'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { account } from '@/lib/appwrite';
import { exchangeCodeForToken, getGumroadUserInfo, saveGumroadConnection } from '@/lib/gumroad';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('Authorization code not found. This might be caused by an adblocker or privacy settings.');
        }

        // Exchange code for token
        const tokenData = await exchangeCodeForToken(code).catch(err => {
          console.error('Token exchange error:', err);
          throw new Error('Failed to connect. Please check if your browser is blocking third-party requests.');
        });

        if (!tokenData || !tokenData.access_token) {
          throw new Error('Unable to authenticate. Try disabling your adblocker or using a different browser.');
        }

        // Get Gumroad user info
        const userInfo = await getGumroadUserInfo(tokenData.access_token).catch(err => {
          console.error('User info error:', err);
          throw new Error('Could not fetch user information. This might be caused by privacy settings.');
        });

        if (!userInfo || !userInfo.user) {
          throw new Error('User information not available. Please try again or use a different browser.');
        }

        // Get current user
        const currentUser = await account.get().catch(err => {
          console.error('Appwrite error:', err);
          throw new Error('Session error. Try disabling tracking protection or using a different browser.');
        });

        // Save connection
        await saveGumroadConnection(
          currentUser.$id,
          userInfo.user.id,
          tokenData.access_token,
          userInfo.user.email,
          userInfo.user.name,
          userInfo.user.url
        );

        router.push('/profile?connected=true');
      } catch (err: any) {
        console.error('Error in Gumroad callback:', err);
        setError(err.message || 'Connection failed. Please check your browser settings.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
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
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
              <p className="font-medium mb-2">Troubleshooting Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Disable your adblocker for this site</li>
                <li>Turn off tracking protection</li>
                <li>Try using Chrome or Edge browser</li>
                <li>Check your browser&apos;s privacy settings</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Return to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Connecting your Gumroad account...</p>
      </div>
    </div>
  );
}

export default function GumroadCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
} 