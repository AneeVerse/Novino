"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const { getCartCount, openCart } = useCart();

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        // Try to authenticate with real credentials first
        const res = await fetch("/api/auth/me");
        
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error(err);
        setIsLoggedIn(false);
      }
    }
    
    checkAuth();
  }, [pathname]);

  // Track scroll position to change navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    
    // Check initial scroll position
    handleScroll();
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle cart icon click
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openCart();
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] bg-[#2D2D2D]/70 h-[80px]">
      <div className="relative max-w-[1440px] mx-auto h-full flex justify-between items-center px-4 md:px-0">
        {/* Left section - Menu items (Desktop) */}
        <div className="hidden md:flex items-center space-x-6 h-full md:pl-6">
          <Link href="/paintings" className="uppercase tracking-wider text-sm font-medium font-roboto-mono text-white">
            PAINTINGS
          </Link>
          <Link href="/artefacts" className="uppercase tracking-wider text-sm font-medium font-roboto-mono text-white">
            ARTEFACTS
          </Link>
          <Link href="/journey" className="uppercase tracking-wider text-sm font-medium font-roboto-mono text-white">
            JOURNEY
          </Link>
          <Link href="/journal" className="uppercase tracking-wider text-sm font-medium font-roboto-mono text-white">
            JOURNAL
          </Link>
        </div>
        
        {/* Hamburger menu (Mobile) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        
        {/* Center - Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center flex justify-center items-center h-full">
          <Link href="/" className="flex items-center justify-center text-xl md:text-2xl font-bold font-roboto-mono text-white">
            <div className="flex items-center">
              <Image
                src="/images/navbar/N Logo.png"
                alt="N Logo"
                width={24}
                height={24}
                className="w-[60px] h-[45px] md:w-[80px] md:h-[60px] object-contain"
                priority
              />
              <span className="relative top-1 md:top-[10px] -ml-5 md:-ml-6">ovino<span className="text-[#AE876D]">.</span>io</span>
            </div>
          </Link>
        </div>
        
        {/* Right section - Authentication */}
        <div className="flex items-center space-x-2 md:space-x-4 md:pr-6 ml-auto">
          <Link href={isLoggedIn ? "/profile" : "/login"} className="text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
          <button onClick={handleCartClick} className="text-white relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#AE876D] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-[#2D2D2D]/95 backdrop-blur-md py-4 shadow-lg z-[1001]">
            <div className="container mx-auto px-4">
              <ul className="space-y-4">
                <li>
                  <Link href="/paintings" className="text-base font-medium font-roboto-mono text-white hover:text-white/70 transition-colors block py-2 uppercase">
                    Paintings
                  </Link>
                </li>
                <li>
                  <Link href="/artefacts" className="text-base font-medium font-roboto-mono text-white hover:text-white/70 transition-colors block py-2 uppercase">
                    Artefacts
                  </Link>
                </li>
                <li>
                  <Link href="/journey" className="text-base font-medium font-roboto-mono text-white hover:text-white/70 transition-colors block py-2 uppercase">
                    Journey
                  </Link>
                </li>
                <li>
                  <Link href="/journal" className="text-base font-medium font-roboto-mono text-white hover:text-white/70 transition-colors block py-2 uppercase">
                    Journal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 