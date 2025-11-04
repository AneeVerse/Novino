"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardNavbar from "@/components/ui/dashboard-navbar";

function DashboardContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
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

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      
      <div className="container mx-auto px-4 py-8">
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