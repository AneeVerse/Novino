import React from "react";

export const metadata = {
  title: "Shopping Cart | Novino.io",
  description: "View and manage the items in your shopping cart on Novino.io",
};

export default function CartLayout({
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