"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { X, Image as ImageIcon, Archive, Map, FileText } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const { getCartCount, openCart } = useCart();

  // Close mobile menu when path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
    <>
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
              {isOpen ? (
                <X size={24} />
              ) : (
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
              )}
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
        </div>
      </nav>
      
      {/* Full screen mobile menu - slides from top */}
      <div 
        className={`fixed inset-0 bg-[#222222] z-[999] transform transition-transform duration-500 ease-in-out md:hidden ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="h-[80px]"></div> {/* Space for navbar */}
        <div className="container mx-auto px-6 py-12 h-[calc(100vh-80px)] flex flex-col">
          <div className="flex-1">
            <ul className="space-y-8">
              <li className="border-b border-[#333333] pb-6">
                <Link 
                  href="/paintings" 
                  className="text-2xl font-medium font-roboto-mono text-white hover:text-[#AE876D] transition-colors flex items-center justify-between"
                  onClick={() => setIsOpen(false)}
                >
                  PAINTINGS
                  <ImageIcon size={26} className="text-[#AE876D]" />
                </Link>
              </li>
              <li className="border-b border-[#333333] pb-6">
                <Link 
                  href="/artefacts" 
                  className="text-2xl font-medium font-roboto-mono text-white hover:text-[#AE876D] transition-colors flex items-center justify-between"
                  onClick={() => setIsOpen(false)}
                >
                  ARTEFACTS
                  <Archive size={26} className="text-[#AE876D]" />
                </Link>
              </li>
              <li className="border-b border-[#333333] pb-6">
                <Link 
                  href="/journey" 
                  className="text-2xl font-medium font-roboto-mono text-white hover:text-[#AE876D] transition-colors flex items-center justify-between"
                  onClick={() => setIsOpen(false)}
                >
                  JOURNEY
                  <Map size={26} className="text-[#AE876D]" />
                </Link>
              </li>
              <li className="border-b border-[#333333] pb-6">
                <Link 
                  href="/journal" 
                  className="text-2xl font-medium font-roboto-mono text-white hover:text-[#AE876D] transition-colors flex items-center justify-between"
                  onClick={() => setIsOpen(false)}
                >
                  JOURNAL
                  <FileText size={26} className="text-[#AE876D]" />
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="mt-auto pb-8">
            <div className="flex flex-col items-center space-y-6">
              <Link 
                href={isLoggedIn ? "/profile" : "/login"} 
                className="text-white hover:text-[#AE876D] transition-colors text-lg"
                onClick={() => setIsOpen(false)}
              >
                {isLoggedIn ? "MY ACCOUNT" : "LOGIN / REGISTER"}
              </Link>
              <div className="flex space-x-6">
                <a href="#" className="text-white hover:text-[#AE876D]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#AE876D]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#AE876D]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0a 4.106 4.106 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar; 