"use client";

import { Search, Bell, Menu, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    localStorage.removeItem('adminAuthToken');
    logout();
    window.location.href = '/admin/login';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#1A1A1A] border-b border-[#333333] flex items-center justify-between px-6">
      {/* Left: Menu button and Date Range */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-[#222222] rounded-lg text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Date Range Picker - matching Nuxt template */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-lg text-sm text-white/70">
            Nov 4, 2025 - Nov 18, 2025
          </div>
          <div className="px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-lg text-sm text-white/70">
            Daily
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-white/70 hover:text-white hover:bg-[#222222] rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Add button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="rounded-full">
              <Plus className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>New mail</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>New customer</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-3 px-3 py-2 hover:bg-[#222222] rounded-lg transition-colors text-white">
              <div className="w-8 h-8 bg-[#A47E3B] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              <span className="text-sm font-medium text-white hidden md:block">Admin</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#222222] border-[#333333]">
            <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#333333]" />
            <DropdownMenuItem className="text-white hover:bg-[#333333]">
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-[#333333]">
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#333333]" />
            <DropdownMenuItem onClick={handleLogout} className="text-white hover:bg-[#333333]">
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

