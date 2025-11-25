"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardSidebar, { DashboardSidebarNavItem } from "@/components/dashboard-v2/DashboardSidebar";
import DashboardHeader from "@/components/dashboard-v2/DashboardHeader";
import { Home, FileText, MessageSquare, Package, ShoppingCart, Users } from "lucide-react";

const legacyNavItems: DashboardSidebarNavItem[] = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: Home,
    activeMatcher: ({ pathname, searchParams }) =>
      pathname === "/dashboard" && !searchParams?.get("tab"),
  },
  {
    name: "Blogs",
    href: "/dashboard?tab=blogs",
    icon: FileText,
    activeMatcher: ({ pathname, searchParams }) =>
      pathname === "/dashboard" && searchParams?.get("tab") === "blogs",
  },
  {
    name: "Testimonials",
    href: "/dashboard?tab=testimonials",
    icon: MessageSquare,
    activeMatcher: ({ pathname, searchParams }) =>
      pathname === "/dashboard" && searchParams?.get("tab") === "testimonials",
  },
  {
    name: "Products",
    href: "/dashboard?tab=products",
    icon: Package,
    activeMatcher: ({ pathname, searchParams }) =>
      pathname === "/dashboard" && searchParams?.get("tab") === "products",
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
];

function DashboardContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <DashboardSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        navItems={legacyNavItems}
        logoHref="/dashboard"
        logoLabel="Novino"
      />
      <div className="lg:pl-[70px]"> {/* Changed from pl-64 to match collapsed sidebar */}
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6">
          {children}
        </main>
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