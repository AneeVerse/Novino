"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

function DashboardContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';

  useEffect(() => {
    // Only redirect if we're not already on the login page and auth has finished loading
    if (!isLoading && !isAuthenticated && !pathname.includes('/admin/login')) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-white text-xl">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !pathname.includes('/admin/login')) {
    return null; // Will redirect in the useEffect
  }

  const handleLogout = () => {
    // Set the state in localStorage directly first to avoid race conditions
    localStorage.removeItem('adminAuth');
    
    // Then call the context logout
    logout();
    
    // Navigate directly
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] pt-0 pb-10">
      <div className="bg-[#1E1E1E] py-4 px-6 mb-6 shadow-md flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-[#333333] hover:bg-[#444444] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
      <div className="container mx-auto pt-6 px-4">
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardContent>
        {children}
      </DashboardContent>
    </AuthProvider>
  );
} 