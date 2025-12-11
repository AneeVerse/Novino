"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, useUser, useSupabaseClient, type Session, type User } from '@supabase/auth-helpers-react';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdminAuth: boolean;
  getAuthToken: () => string | null;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  session: null,
  logout: async () => { },
  isLoading: true,
  isAdminAuth: false,
  getAuthToken: () => null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const pathname = usePathname() || '';

  const [isLoading, setIsLoading] = useState(true);
  const [hasAdminToken, setHasAdminToken] = useState(false);

  // Flag to indicate if this is admin authentication
  const isAdminAuth = pathname.includes('/admin') || pathname.includes('/dashboard');

  // Check for admin token in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminAuthToken');
      setHasAdminToken(!!adminToken);
    }
  }, []);

  // Check initial auth state
  useEffect(() => {
    // Wait for session to be loaded
    if (session !== undefined) {
      setIsLoading(false);
    }
  }, [session]);

  // User is authenticated if they have either:
  // 1. A valid Supabase session
  // 2. An admin token in localStorage (for hardcoded admin)
  const isAuthenticated = (!!session && !!user) || hasAdminToken;

  // Function to get the auth token (access token from session or admin token)
  const getAuthToken = (): string | null => {
    if (session?.access_token) {
      return session.access_token;
    }
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminAuthToken');
    }
    return null;
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear cart from localStorage before signing out
      if (typeof window !== 'undefined') {
        localStorage.removeItem('novinoCart');
        localStorage.removeItem('adminAuthToken');
        setHasAdminToken(false);
      }

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Use window.location.href for a clean redirect that resets all React state
      // This prevents the redirect loop caused by stale auth state
      if (isAdminAuth) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      session,
      logout,
      isLoading,
      isAdminAuth,
      getAuthToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}
