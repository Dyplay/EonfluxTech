'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import * as authService from '@/lib/auth';
import { account } from '@/lib/appwrite';

// Define types
type User = {
  $id: string;
  email: string;
  name: string;
  prefs?: {
    admin?: boolean | string;
    [key: string]: any;
  };
  labels?: string[];
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: authService.AuthError | null }>;
  register: (email: string, password: string, name: string) => Promise<{ error: authService.AuthError | null }>;
  logout: () => Promise<{ error: authService.AuthError | null }>;
  checkIsAdmin: () => boolean;
  refetchUser: () => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout: async () => ({ error: null }),
  checkIsAdmin: () => false,
  refetchUser: async () => {},
});

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Refetch user data
  const refetchUser = async () => {
    try {
      // Directly fetch from Appwrite to get the most recent data
      const currentUser = await account.get();
      if (currentUser) {
        console.log("Refetched user data:", currentUser);
        setUser(currentUser as User);
      }
    } catch (err) {
      console.error("Error refetching user:", err);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      console.log("🔄 Starting session check...");
      try {
        // Try to get a current session to ensure we're logged in
        console.log("📝 Checking for current session...");
        const session = await account.getSession('current');
        console.log("✅ Session found:", session.$id);
        
        // If that succeeds, get the user
        console.log("👤 Fetching user data...");
        const currentUser = await account.get();
        if (currentUser && isMounted) {
          console.log("✨ User data loaded:", {
            id: currentUser.$id,
            name: currentUser.name,
            labels: currentUser.labels,
            prefs: currentUser.prefs
          });
          setUser(currentUser as User);
        }
      } catch (err) {
        console.error('❌ Session check error:', err);
        if (isMounted) {
          console.log("🔄 No valid session found, will redirect to login...");
          setUser(null);
          // Don't redirect immediately if we're already on the login page
          if (window.location.pathname !== '/login') {
            setTimeout(() => {
              if (isMounted) {
                console.log("🔄 Redirecting to login page...");
                window.location.href = '/login';
              }
            }, 2000);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Function to check if user is admin
  const checkIsAdmin = () => {
    if (!user) return false;
    
    console.log("Checking admin status:", { 
      userId: user.$id,
      labels: user.labels,
      prefs: user.prefs
    });
    
    // Check in labels first (this is what your user has)
    if (user.labels && Array.isArray(user.labels)) {
      if (user.labels.includes('admin')) {
        console.log("Admin found in labels");
        return true;
      }
    }
    
    // Fallback to checking in prefs
    if (user.prefs) {
      const adminValue = user.prefs.admin;
      if (
        adminValue === true || 
        adminValue === 'true' || 
        adminValue === 1 || 
        adminValue === '1'
      ) {
        console.log("Admin found in prefs");
        return true;
      }
    }
    
    return false;
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    const result = await authService.login(email, password);
    
    if (result.data && !result.error) {
      try {
        const currentUser = await account.get();
        console.log("Login user data:", currentUser);
        setUser(currentUser as User);
      } catch (err) {
        console.error("Error getting user after login:", err);
      }
    }
    
    setLoading(false);
    return { error: result.error };
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    const result = await authService.register(email, password, name);
    
    if (result.data && !result.error) {
      try {
        const currentUser = await account.get();
        setUser(currentUser as User);
      } catch (err) {
        console.error("Error getting user after registration:", err);
      }
    }
    
    setLoading(false);
    return { error: result.error };
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    const result = await authService.logout();
    
    if (!result.error) {
      setUser(null);
    }
    
    setLoading(false);
    return { error: result.error };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkIsAdmin,
    refetchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using the auth context
export function useAuth() {
  return useContext(AuthContext);
} 