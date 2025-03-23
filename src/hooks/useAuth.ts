import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { Models, ID } from 'appwrite';

export function useAuth() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const session = await account.get();
        setUser(session);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const session = await account.createEmailPasswordSession(email, password);
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

  const checkIsAdmin = () => {
    if (!user) return false;
    
    // Check for admin in labels first (preferred method)
    if (user.labels && Array.isArray(user.labels) && user.labels.includes('admin')) {
      console.log("✅ Admin found in labels:", user.labels);
      return true;
    }
    
    // Fallback: Check for admin in preferences
    const adminPref = user.prefs?.admin;
    if (adminPref === true || adminPref === 'true' || adminPref === '1' || adminPref === 1) {
      console.log("✅ Admin found in preferences:", adminPref);
      return true;
    }
    
    console.log("❌ No admin privileges found for user:", user.$id);
    return false;
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    checkIsAdmin,
  };
} 