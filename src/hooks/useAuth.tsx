'use client';

import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  
  const login = async (email: string, password: string) => {
    try {
      // ... existing login logic ...
      
      router.refresh(); // Refresh the page data
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  const signup = async (email: string, password: string, name: string) => {
    try {
      // ... existing signup logic ...
      
      router.refresh(); // Refresh the page data
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      // ... existing logout logic ...
      
      router.refresh(); // Refresh the page data
      return true;
    } catch (error) {
      throw error;
    }
  };

  // ... rest of the hook implementation
} 