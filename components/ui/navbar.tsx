"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled ? "backdrop-filter backdrop-blur-md" : ""
    }`}>
      {/* Dynamic background based on scroll position */}
      <div className={`absolute inset-0 h-full overflow-hidden transition-opacity duration-300 ${
        scrolled ? "opacity-100" : "opacity-0"
      }`}>
        {/* Background styling only visible when scrolled */}
        <div className="absolute inset-0 bg-[#2D2D2D]/80 backdrop-blur-md"></div>
        
        {/* Right side gradient - only visible when scrolled */}
        <div className="absolute right-0 top-0 w-full max-w-full h-full opacity-50 pointer-events-none">
          <div className="absolute right-0 -top-[5%] w-full max-w-[100%] h-[30%] bg-gradient-to-l from-white/50 via-white/25 to-transparent blur-[80px]"></div>
          <div className="absolute right-0 top-0 w-full max-w-[90%] h-[40%] bg-gradient-to-l from-white/40 via-white/20 to-transparent blur-[120px]"></div>
        </div>
        
        {/* Left side gradient - only visible when scrolled */}
        <div className="absolute left-0 top-0 w-full max-w-full h-full opacity-30 pointer-events-none">
          <div className="absolute left-0 top-[20%] w-full max-w-[80%] h-[80%] bg-gradient-to-r from-white/30 via-white/15 to-transparent blur-[100px]"></div>
        </div>
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 md:px-[50px] 2xl:px-[15px] flex justify-between items-center py-3 sm:py-4 md:py-6">
        {/* Left section - Hamburger and Products */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Custom hamburger button on left */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-[50px] h-[40px] sm:w-[60px] sm:h-[48px] md:w-[70px] md:h-[54px] bg-white rounded-[8px] sm:rounded-[10px] flex justify-center items-center"
              aria-label="Toggle menu"
            >
              <div className="absolute bottom-[12px] left-[12px] sm:bottom-[14px] sm:left-[13px] md:bottom-[16px] md:left-[15px] w-[30px] h-[6px] sm:w-[35px] sm:h-[7px] md:w-[40px] md:h-[8px]">
                <Image 
                  src="/icons/hamburger-line-1.svg" 
                  alt="Menu" 
                  width={40} 
                  height={8}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute top-[12px] left-[12px] sm:top-[14px] sm:left-[13px] md:top-[16px] md:left-[15px] w-[30px] h-[6px] sm:w-[35px] sm:h-[7px] md:w-[40px] md:h-[8px]">
                <Image 
                  src="/icons/hamburger-line-2.svg" 
                  alt="Menu" 
                  width={40} 
                  height={8}
                  className="w-full h-auto"
                />
              </div>
            </button>
          </div>
          
          {/* Products link with SVG border */}
          <div className="relative hidden sm:block">
            <Link 
              href="/products" 
              className="font-mono font-bold text-[13px] sm:text-[14px] md:text-[15px] text-white z-10 relative px-3 sm:px-4 md:px-5 py-[10px] sm:py-[12px] md:py-[14px] inline-block"
            >
              Products
            </Link>
            <div className="absolute inset-0 -left-1 z-0 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 120 54" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <rect x="1.41846" y="0.5" width="118" height="53" rx="10.5" stroke="white" strokeOpacity="1" strokeDasharray="5 5" style={{ mixBlendMode: "normal" }}/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Center - Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <Link href="/" className="text-lg sm:text-xl md:text-2xl font-bold font-mono text-white">
            Novino.io
          </Link>
        </div>
        
        {/* Right section - Cart and Contact */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Cart button - Using Figma icon */}
          <button 
            className="flex items-center justify-center bg-[#1A1A1A] rounded-[8px] sm:rounded-[10px] p-[10px] sm:p-[12px] md:p-[15px]" 
            aria-label="Shopping Cart"
          >
            <Image 
              src="/icons/figma-cart-icon.svg"
              alt="Cart"
              width={22}
              height={22}
              className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px]"
            />
          </button>
          
          {/* Contact button */}
          <button className="hidden md:flex font-mono font-bold text-[15px] text-[#0F0F0F] bg-white rounded-xl px-[24px] py-[14px]">
            Contact
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-[#2D2D2D]/95 backdrop-blur-md py-4 shadow-lg z-50">
            <div className="container mx-auto px-4">
              <ul className="space-y-4">
                <li>
                  <Link href="/" className="text-base sm:text-lg font-mono text-white hover:text-white/70 transition-colors block py-2">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-base sm:text-lg font-mono text-white hover:text-white/70 transition-colors block py-2">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/art" className="text-base sm:text-lg font-mono text-white hover:text-white/70 transition-colors block py-2">
                    Art Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-base sm:text-lg font-mono text-white hover:text-white/70 transition-colors block py-2">
                    Contact
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