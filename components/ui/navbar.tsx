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
      
      <div className="relative container mx-auto px-[50px] 2xl:px-[15px] flex justify-between items-center py-6">
        {/* Left section - Hamburger and Products */}
        <div className="flex items-center space-x-6">
          {/* Custom hamburger button on left */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-[70px] h-[54px] bg-white rounded-[10px] flex justify-center items-center"
              aria-label="Toggle menu"
            >
              <div className="absolute" style={{ bottom: '16px', left: '15px', width: '40px', height: '8px' }}>
                <Image 
                  src="/icons/hamburger-line-1.svg" 
                  alt="Menu" 
                  width={40} 
                  height={8}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute" style={{ top: '16px', left: '15px', width: '40px', height: '8px' }}>
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
          <div className="relative">
            <Link 
              href="/products" 
              className="font-mono font-bold text-[15px] text-white z-10 relative px-5 py-[14px] inline-block"
            >
              Products
            </Link>
            <div className="absolute inset-0 -left-1 z-0 pointer-events-none">
              <svg width="120" height="54" viewBox="0 0 120 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.41846" y="0.5" width="118" height="53" rx="10.5" stroke="white" strokeOpacity="1" strokeDasharray="5 5" style={{ mixBlendMode: "normal" }}/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Center - Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <Link href="/" className="text-2xl font-bold font-mono text-white">
            Novino.io
          </Link>
        </div>
        
        {/* Right section - Cart and Contact */}
        <div className="flex items-center space-x-6">
          {/* Cart button - Using Figma icon */}
          <button 
            className="flex items-center justify-center bg-[#1A1A1A] rounded-[10px] p-[15px]" 
            aria-label="Shopping Cart"
          >
            <Image 
              src="/icons/figma-cart-icon.svg"
              alt="Cart"
              width={22}
              height={22}
              className="w-[22px] h-[22px]"
            />
          </button>
          
          {/* Contact button */}
          <button className="hidden md:flex font-mono font-bold text-[15px] text-[#0F0F0F] bg-white rounded-xl px-[24px] py-[14px]">
            Contact
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white py-4 shadow-lg">
            <div className="container mx-auto px-4">
              <ul className="space-y-4">
                <li>
                  <Link href="/" className="text-lg font-mono">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-lg font-mono">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-lg font-mono">
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