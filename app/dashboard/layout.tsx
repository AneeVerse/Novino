"use client";

import { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1A1A1A] pt-0 pb-10">
      <div className="container mx-auto pt-6 px-4">
        {children}
      </div>
    </div>
  );
} 