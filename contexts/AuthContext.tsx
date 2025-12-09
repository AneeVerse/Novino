"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession, useUser, useSupabaseClient, type Session, type User } from '@supabase/auth-helpers-react';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdminAuth: boolean;
  getAuthToken: () => string | null;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  session: null,
  login: async () => false,
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

  // Login function for admin (hardcoded for now)
  // For regular users, use Supabase client directly in login page
  const login = async (email: string, password: string): Promise<boolean> => {
    // Admin hardcoded login
    if (email === 'business@novino.io' && password === 'Dontchangeme@01') {
      // For admin, we could create a special admin user in Supabase
      // or keep this localStorage approach for backward compatibility
      try {
        const token = btoa(JSON.stringify({
          userId: 'admin-1',
          email: email,
          username: 'Admin',
          isAdmin: true,
          createdAt: new Date().toISOString()
        }));

        if (typeof window !== 'undefined') {
          localStorage.setItem('adminAuthToken', token);
          setHasAdminToken(true);
        }
        return true;
      } catch (error) {
        console.error('Error during admin login:', error);
        return false;
      }
    }

    // Regular user login via Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        console.error('Login error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
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

      // Redirect to login
      if (isAdminAuth) {
        router.push('/admin/login');
      } else {
        router.push('/login');
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
      login,
      logout,
      isLoading,
      isAdminAuth,
      getAuthToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}