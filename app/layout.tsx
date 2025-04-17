"use client";

import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/ui/navbar"
import DashboardNavbar from "@/components/ui/dashboard-navbar"
import { usePathname } from "next/navigation"
import "@fontsource/dm-serif-display"

const inter = Inter({ subsets: ["latin"] })

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
          {isDashboard ? (
            <div className="w-full">
              <DashboardNavbar />
            </div>
          ) : (
            <Navbar />
          )}
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}