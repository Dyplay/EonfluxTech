'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { account } from '@/lib/appwrite';
import { Models } from 'appwrite';

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  isAdmin: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  const setPartialState = (newState: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const handleError = (error: any) => {
    console.error('Auth Error:', error);
    setPartialState({ 
      error: error.message || 'An error occurred',
      loading: false 
    });
  };

  const refreshUser = async () => {
    try {
      setPartialState({ loading: true, error: null });
      const user = await account.get();
      console.log('✅ User data refreshed:', {
        id: user.$id,
        name: user.name,
        labels: user.labels,
        prefs: user.prefs
      });
      setPartialState({ user, loading: false });
      return user;
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      handleError(error);
      setPartialState({ user: null });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setPartialState({ loading: true, error: null });
      await account.createEmailSession(email, password);
      await refreshUser();
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setPartialState({ loading: true, error: null });
      await account.deleteSession('current');
      setPartialState({ user: null, loading: false });
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setPartialState({ loading: true, error: null });
      await account.create('unique()', email, password, name);
      await login(email, password);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const isAdmin = (): boolean => {
    const user = state.user;
    if (!user) return false;

    // Check labels first (primary method)
    if (user.labels?.includes('admin')) {
      console.log('✅ Admin status found in labels');
      return true;
    }

    // Fallback to preferences
    const adminPref = user.prefs?.admin;
    if (adminPref === true || adminPref === 'true' || adminPref === '1') {
      console.log('✅ Admin status found in preferences');
      return true;
    }

    console.log('❌ No admin privileges found');
    return false;
  };

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const checkSession = async () => {
      try {
        console.log('🔄 AuthProvider: Checking session...');
        const session = await account.getSession('current');
        console.log('✅ AuthProvider: Session found:', session.$id);
        if (mounted) {
          await refreshUser();
        }
      } catch (error: any) {
        console.log('❌ AuthProvider: Session check failed:', error.message);
        
        // If we get a specific error about invalid session, retry a few times
        if (error.code === 401 && retryCount < maxRetries) {
          console.log(`🔄 AuthProvider: Retrying session check (${retryCount + 1}/${maxRetries})...`);
          retryCount++;
          setTimeout(checkSession, 1000); // Wait 1 second before retrying
          return;
        }

        if (mounted) {
          setPartialState({ 
            loading: false, 
            user: null,
            error: error.message 
          });
          
          // If we're on an admin page, redirect to login with return URL
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
            const returnTo = encodeURIComponent(window.location.pathname);
            window.location.href = `/login?returnTo=${returnTo}`;
          }
        }
      }
    };

    // Start session check
    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  const value = {
    ...state,
    login,
    logout,
    register,
    isAdmin,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 