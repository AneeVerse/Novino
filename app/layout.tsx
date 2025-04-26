"use client";

import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/ui/navbar"
import DashboardNavbar from "@/components/ui/dashboard-navbar"
import { usePathname } from "next/navigation"
import "@fontsource/dm-serif-display"
import { CartProvider } from "@/contexts/CartContext"
import CartDrawer from "@/components/ui/cart-drawer"
import { useCart } from "@/contexts/CartContext"

const inter = Inter({ subsets: ["latin"] })

// Cart wrapper to use the cart context
function CartDrawerWrapper() {
  const { isCartOpen, closeCart } = useCart();
  return <CartDrawer isOpen={isCartOpen} onClose={closeCart} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Novino.io - Art Gallery</title>
        <meta name="description" content="Elevate ordinary walls with extraordinary galleries" />
      </head>
      <body className={`${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <CartProvider>
            {isDashboard ? (
              <div className="w-full">
                <DashboardNavbar />
              </div>
            ) : (
              <Navbar />
            )}
            {children}
            <CartDrawerWrapper />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}