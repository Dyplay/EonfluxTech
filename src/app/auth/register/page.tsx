'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { account } from '@/lib/appwrite';
import { ID } from 'appwrite';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create user account
      await account.create(
        ID.unique(),
        email,
        password,
        name
      ).catch((err: Error) => {
        console.error('Registration error:', err);
        if ((err as any).type === 'user_already_exists') {
          throw new Error('An account with this email already exists');
        }
        throw new Error('Registration failed. This might be caused by your browser\'s privacy settings.');
      });

      // Log in the user
      await account.createSession(email, password).catch((err: Error) => {
        console.error('Login error after registration:', err);
        throw new Error('Account created but login failed. Try disabling tracking protection.');
      });

      // Verify the session
      await account.get().catch((err: Error) => {
        console.error('Session verification error:', err);
        throw new Error('Could not verify account. Please try logging in manually.');
      });

      router.push('/profile');
    } catch (err: any) {
      console.error('Error during registration:', err);
      setError(err.message || 'Registration failed. Please check your browser settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card border border-border rounded-lg p-6"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive mb-4">{error}</p>
            <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded">
              <p className="font-medium mb-2">Having trouble signing up?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Disable your adblocker for this site</li>
                <li>Turn off tracking protection</li>
                <li>Try using Chrome or Edge browser</li>
                <li>Check your browser&apos;s privacy settings</li>
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
