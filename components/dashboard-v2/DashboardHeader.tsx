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
      {/* Left: Menu button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-[#222222] rounded-lg text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right side - empty for clean look */}
      <div></div>
    </header>
  );
}

