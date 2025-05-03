"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAdminAuth: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  isLoading: true,
  isAdminAuth: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname() || '';
  
  // Flag to indicate if this is admin authentication
  const isAdminAuth = pathname.includes('/admin') || pathname.includes('/dashboard');

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Only check localStorage if this is an admin route
        if (isAdminAuth) {
          const auth = localStorage.getItem('adminAuth');
          setIsAuthenticated(auth === 'true');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isAdminAuth]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === 'novino@admin' && password === 'novino@admin') {
      try {
        localStorage.setItem('adminAuth', 'true');
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error('Error during login:', error);
        return false;
      }
    }
    return false;
  };

  // Logout function
  const logout = () => {
    try {
      localStorage.removeItem('adminAuth');
      setIsAuthenticated(false);
      
      // Redirect directly to login without window reload
      router.push('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, isAdminAuth }}>
      {children}
    </AuthContext.Provider>
  );
} 