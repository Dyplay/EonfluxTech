import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { Models, ID } from 'appwrite';

export function useAuth() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useAuth hook initializing");
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        console.log("Checking auth session");
        // First check if there's an active session
        const session = await account.getSession('current');
        console.log("Session result:", session ? "Active session" : "No session");
        
        if (session) {
          // If there's a session, get the user
          console.log("Getting user data");
          const user = await account.get();
          console.log("User data:", user.$id);
          setUser(user);
        } else {
          console.log("No active session, setting user to null");
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        console.log("Auth check complete, setting loading to false");
        setLoading(false);
      }
    };

    checkAuth();

    // Set up a listener for auth state changes if available
    try {
      const unsubscribe = (account as any).onAuthStateChange((event: string) => {
        console.log("Auth state change event:", event);
        if (event === 'sessions.end') {
          setUser(null);
        } else if (event === 'sessions.start') {
          account.get().then(user => setUser(user));
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error("Error setting up auth listener:", error);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await account.create(ID.unique(), email, password, name);
      await login(email, password);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error };
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };
} 