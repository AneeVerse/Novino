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
import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/contexts/AuthContext"
import NavigationLoading from "@/components/navigation-loading"
import { Toaster } from "@/components/ui/toaster"
import Analytics from "@/components/analytics"
import { useEffect } from "react"

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
  const isAdminRoute = pathname?.startsWith('/admin') || isDashboard;
  const isLinkoPage = pathname?.startsWith('/linko.page/');
  const isVCardPage = pathname?.startsWith('/vcard');

  useEffect(() => {
    const scrollToFooter = () => {
      if (typeof window === "undefined") return;
      if (window.location.hash === "#site-footer") {
        window.setTimeout(() => {
          const footerEl = document.getElementById("site-footer");
          if (footerEl) {
            const footerTop = footerEl.getBoundingClientRect().top + window.scrollY;
            const bottomPosition = Math.min(
              footerTop + footerEl.offsetHeight,
              document.documentElement.scrollHeight
            );
            window.scrollTo({ top: bottomPosition, behavior: "smooth" });
          } else {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
          }
        }, 150);
      }
    };

    scrollToFooter();
    window.addEventListener("hashchange", scrollToFooter);
    return () => window.removeEventListener("hashchange", scrollToFooter);
  }, [pathname]);
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Novino.io - Art Gallery</title>
        <link rel="icon" type="image/gif" href="/images/preloader.gif" />
        <link rel="shortcut icon" type="image/gif" href="/images/preloader.gif" />
        <link rel="apple-touch-icon" href="/images/preloader.gif" />
        <meta name="description" content="Elevate ordinary walls with extraordinary galleries" />
        <meta name="keywords" content="art gallery, paintings, artefacts, art collection, contemporary art, fine art, decorative art" />
        <meta name="author" content="Novino.io" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2D2D2D" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_SITE_URL || "https://novino.io"} />
        <meta property="og:title" content="Novino.io - Art Gallery" />
        <meta property="og:description" content="Elevate ordinary walls with extraordinary galleries" />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || "https://novino.io"}/images/og-image.png`} />
        <meta property="og:site_name" content="Novino.io" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={process.env.NEXT_PUBLIC_SITE_URL || "https://novino.io"} />
        <meta name="twitter:title" content="Novino.io - Art Gallery" />
        <meta name="twitter:description" content="Elevate ordinary walls with extraordinary galleries" />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || "https://novino.io"}/images/og-image.png`} />
        
        {/* Additional SEO Meta Tags */}
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || "https://novino.io"} />
        <link rel="alternate" type="application/rss+xml" title="Novino.io RSS Feed" href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://novino.io"}/feed.xml`} />
        
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
          />
        )}
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Novino.io",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://novino.io",
              "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://novino.io"}/logo.png`,
                "width": 200,
                "height": 60
              },
              "description": "Elevate ordinary walls with extraordinary galleries. Discover unique art pieces, paintings, and artefacts.",
              "sameAs": [],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["English"]
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://novino.io"}#organization`,
              "name": "Novino.io",
              "image": `${process.env.NEXT_PUBLIC_SITE_URL || "https://novino.io"}/images/og-image.png`,
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://novino.io",
              "description": "Elevate ordinary walls with extraordinary galleries. Discover unique art pieces, paintings, and artefacts.",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": process.env.NEXT_PUBLIC_BUSINESS_STREET || "Online Art Gallery",
                "addressLocality": process.env.NEXT_PUBLIC_BUSINESS_CITY || "Global",
                "addressRegion": process.env.NEXT_PUBLIC_BUSINESS_REGION || "",
                "postalCode": process.env.NEXT_PUBLIC_BUSINESS_POSTAL || "",
                "addressCountry": process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || "US"
              },
              "areaServed": {
                "@type": "Country",
                "name": "Global"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["English"]
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SessionProvider 
            refetchInterval={isAdminRoute ? 0 : undefined}
            refetchOnWindowFocus={!isAdminRoute}
          >
            <AuthProvider>
              <CartProvider>
                {isDashboard ? (
                  <div className="w-full">
                    <DashboardNavbar />
                  </div>
                ) : !isLinkoPage && !isVCardPage ? (
                  <Navbar />
                ) : null}
                <NavigationLoading />
                {children}
                {!isLinkoPage && !isVCardPage && <CartDrawerWrapper />}
                <Toaster />
                <Analytics />
              </CartProvider>
            </AuthProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}