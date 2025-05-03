"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

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
    <div className="min-h-screen bg-[#1A1A1A] pt-0 pb-10">
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