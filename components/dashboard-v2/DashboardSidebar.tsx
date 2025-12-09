"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Users,
  Settings,
  MessageSquare,
  ChevronRight,
  ChevronUp,
  FileText,
  Package,
  ShoppingCart,
  X,
  Search,
  LogOut,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import type { ElementType } from "react";
import { cn } from "@/lib/utils";

export interface DashboardSidebarNavItem {
  name: string;
  href: string;
  icon: ElementType;
  badge?: string;
  children?: { name: string; href: string }[];
  activeMatcher?: (context: {
    pathname: string;
    searchParams: URLSearchParams | null;
  }) => boolean;
}

interface DashboardSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navItems?: DashboardSidebarNavItem[];
  footerItems?: DashboardSidebarNavItem[];
  logoHref?: string;
  logoLabel?: string;
}

export default function DashboardSidebar({
  open,
  onOpenChange,
  navItems,
  footerItems,
  logoHref,
  logoLabel,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    // Remove admin token first
    localStorage.removeItem('adminAuthToken');
    // Close the dropdown
    setUserDropdownOpen(false);
    // The logout function in AuthContext handles the redirect
    await logout();
  };

  const handleGoToMainPage = () => {
    router.push('/');
  };

  const defaultNavItems: DashboardSidebarNavItem[] = [
    {
      name: "Home",
      href: "/dashboard-v2",
      icon: Home,
    },
    {
      name: "Customers",
      href: "/dashboard-v2/customers",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/dashboard-v2/settings",
      icon: Settings,
      children: [
        { name: "General", href: "/dashboard-v2/settings" },
        { name: "Members", href: "/dashboard-v2/settings/members" },
        { name: "Notifications", href: "/dashboard-v2/settings/notifications" },
        { name: "Security", href: "/dashboard-v2/settings/security" },
      ],
    },
    {
      name: "Blogs",
      href: "/dashboard-v2/blogs",
      icon: FileText,
    },
    {
      name: "Products",
      href: "/dashboard-v2/products",
      icon: Package,
    },
    {
      name: "Orders",
      href: "/dashboard-v2/orders",
      icon: ShoppingCart,
    },
    {
      name: "Testimonials",
      href: "/dashboard-v2/testimonials",
      icon: MessageSquare,
    },
  ];

  const defaultFooterItems: DashboardSidebarNavItem[] = [];

  const resolvedNavItems = navItems ?? defaultNavItems;
  const resolvedFooterItems = footerItems ?? defaultFooterItems;
  const hasFooterItems = resolvedFooterItems.length > 0;
  const resolvedLogoHref = logoHref ?? "/dashboard-v2";
  const resolvedLogoLabel = logoLabel ?? "Novino";

  const normalizeHref = (href: string) => {
    if (!href || href.startsWith("http")) return href;
    const cleanHref = href.split("?")[0] || "/";
    return cleanHref.endsWith("/") && cleanHref !== "/" ? cleanHref.slice(0, -1) : cleanHref;
  };

  const isActive = (href: string) => {
    const normalizedHref = normalizeHref(href);
    if (!pathname || !normalizedHref || normalizedHref.startsWith("http")) {
      return false;
    }
    if (normalizedHref === "/") {
      return pathname === "/";
    }
    return pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
  };

  const getItemActiveState = (item: DashboardSidebarNavItem) => {
    if (typeof item.activeMatcher === "function") {
      return item.activeMatcher({
        pathname: pathname || "",
        searchParams,
      });
    }
    return isActive(item.href);
  };

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar - Collapsible on hover */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-[#1A1A1A] border-r border-[#333333] flex flex-col z-50 transition-all duration-300 ease-in-out group",
          "w-[70px] hover:w-64", // Collapsed by default, expands on hover
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 border-b border-[#333333] flex items-center justify-center lg:justify-between px-4 lg:px-6 overflow-hidden">
          <Link href={resolvedLogoHref} className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 bg-[#A47E3B] rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">{resolvedLogoLabel}</span>
          </Link>
          <button
            onClick={() => onOpenChange(false)}
            className="lg:hidden p-2 hover:bg-[#222222] rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar - Hidden when collapsed */}
        <div className="px-3 py-4 border-b border-[#333333] opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Q Search…"
              className="w-full pl-10 pr-4 py-2 bg-[#222222] border border-[#333333] rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#A47E3B] focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {resolvedNavItems.map((item) => {
              const Icon = item.icon;
              const active = getItemActiveState(item);
              const hasChildren = item.children && item.children.length > 0;
              const isSubmenuOpen = openSubmenu === item.name;

              return (
                <li key={item.name}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                          active
                            ? "bg-[#222222] text-white"
                            : "text-white/70 hover:bg-[#222222] hover:text-white"
                        )}
                      >
                        <div className="flex items-center space-x-3 min-w-0 overflow-hidden">
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.name}</span>
                        </div>
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 transition-all text-white/50 opacity-0 group-hover:opacity-100 duration-300",
                            isSubmenuOpen && "rotate-90"
                          )}
                        />
                      </button>
                      {isSubmenuOpen && (
                        <ul className="mt-1 ml-8 space-y-1">
                          {item.children?.map((child) => (
                            <li key={child.name}>
                              <Link
                                href={child.href}
                                className={cn(
                                  "block px-3 py-2 text-sm rounded-lg transition-colors",
                                  pathname === child.href
                                    ? "bg-[#222222] text-white font-medium"
                                    : "text-white/60 hover:bg-[#222222] hover:text-white"
                                )}
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        active
                          ? "bg-[#222222] text-white"
                          : "text-white/70 hover:bg-[#222222] hover:text-white"
                      )}
                    >
                      <div className="flex items-center space-x-3 min-w-0 overflow-hidden">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Footer items */}
          {hasFooterItems && (
            <ul className="mt-auto pt-4 space-y-1 border-t border-[#333333]">
              {resolvedFooterItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-white/70 hover:bg-[#222222] hover:text-white rounded-lg transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {/* User section at bottom with dropdown */}
        <div className="border-t border-[#333333] p-4 relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-full flex items-center space-x-3 px-3 py-2 overflow-hidden hover:bg-[#222222] rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-[#A47E3B] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              N
            </div>
            <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-left">
              <p className="text-sm font-medium text-white truncate">novino</p>
              <p className="text-xs text-white/60 truncate">business@novino.io</p>
            </div>
            <ChevronUp className={cn(
              "w-4 h-4 text-white/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0",
              userDropdownOpen && "rotate-180"
            )} />
          </button>

          {/* Dropdown menu */}
          {userDropdownOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#222222] border border-[#333333] rounded-lg shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#333333]">
                <p className="text-xs text-white/50 uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-medium text-white mt-1">novino</p>
              </div>
              <button
                onClick={handleGoToMainPage}
                className="w-full flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-[#333333] hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">Go to Main Page</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-[#333333] hover:text-white transition-colors border-t border-[#333333]"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

