import React from "react";

export const metadata = {
  title: "Checkout | Novino.io",
  description: "Complete your purchase on Novino.io",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#2D2D2D]">
      {children}
    </div>
  );
} 