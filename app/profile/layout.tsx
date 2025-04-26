import React from "react";

export const metadata = {
  title: "My Account | Novino.io",
  description: "Manage your Novino account, orders, addresses, and security settings",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 