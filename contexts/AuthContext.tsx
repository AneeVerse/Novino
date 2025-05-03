"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Function to encode to Base64 safely in both browser and Node.js environments
function safeBtoa(str: string): string {
  try {
    // For browser
    if (typeof window !== 'undefined' && window.btoa) {
      return window.btoa(str);
    }
    // For Node.js
    return Buffer.from(str).toString('base64');
  } catch (error) {
    console.error('Error encoding to base64:', error);
    throw error;
  }
}

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAdminAuth: boolean;
  getAuthToken: () => string | null;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  isLoading: true,
  isAdminAuth: false,
  getAuthToken: () => null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sseConnection, setSseConnection] = useState<EventSource | null>(null);
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
          const token = localStorage.getItem('adminAuthToken');
          setIsAuthenticated(!!token);
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

  // Set up SSE connection for real-time status updates
  useEffect(() => {
    // Skip if not authenticated, still loading, or this is an admin auth
    if (!isAuthenticated || isLoading || isAdminAuth) {
      // Cleanup any existing connection when conditions change
      if (sseConnection) {
        sseConnection.close();
        setSseConnection(null);
      }
      return;
    }

    // Create EventSource connection
    const eventSource = new EventSource('/api/events/user-status');
    setSseConnection(eventSource);

    // Set up event listeners
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle blocked event
        if (data.event === 'blocked') {
          logout();
          alert('Your account has been blocked. Please contact support.');
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      setSseConnection(null);
    };

    // Clean up on unmount
    return () => {
      eventSource.close();
      setSseConnection(null);
    };
  }, [isAuthenticated, isLoading, isAdminAuth]);

  // Periodically check if user is still allowed to be logged in (not blocked)
  useEffect(() => {
    // Skip if not authenticated or still loading
    if (!isAuthenticated || isLoading) return;

    // For admin users (using adminAuthToken), we don't need to check
    // as admins can't be blocked, so only check for regular users with cookie auth
    if (isAdminAuth) return;

    // Function to check user status
    const checkUserStatus = async () => {
      try {
        const res = await fetch('/api/auth/check-status');
        
        if (res.status === 403) {
          // User is blocked, force logout
          const data = await res.json();
          logout();
          // Show message to user
          alert(data.message || 'Your account has been blocked. Please contact support.');
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };

    // Check immediately on login
    checkUserStatus();

    // Then set up periodic checks (every 15 seconds)
    const intervalId = setInterval(checkUserStatus, 15000);

    // Clean up the interval on unmount
    return () => clearInterval(intervalId);
  }, [isAuthenticated, isLoading, isAdminAuth]);

  // Function to get the auth token
  const getAuthToken = (): string | null => {
    try {
      return localStorage.getItem('adminAuthToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === 'novino@admin' && password === 'novino@admin') {
      try {
        // Create a simple JWT-like token with timestamp and admin info
        const token = safeBtoa(JSON.stringify({
          userId: 'admin-1',
          email: email,
          username: 'Admin',
          isAdmin: true,
          createdAt: new Date().toISOString()
        }));
        
        localStorage.setItem('adminAuthToken', token);
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
      localStorage.removeItem('adminAuthToken');
      setIsAuthenticated(false);
      
      // Close SSE connection if exists
      if (sseConnection) {
        sseConnection.close();
        setSseConnection(null);
      }
      
      // Redirect directly to login without window reload
      router.push('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
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