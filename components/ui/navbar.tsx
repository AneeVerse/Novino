"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#312F30] z-50 py-6">
      <div className="container mx-auto px-8 sm:px-12 flex justify-between items-center">
        {/* Left section - Hamburger and Products */}
        <div className="flex items-center space-x-4">
          {/* Custom hamburger button on left */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-[82px] h-[63px] bg-white rounded-[12px] flex justify-center items-center"
              aria-label="Toggle menu"
            >
              <span className="font-mono font-bold text-black text-lg">
                ..
              </span>
              <div className="absolute" style={{ bottom: '18px', left: '17px', width: '48px', height: '9px' }}>
                <Image 
                  src="/icons/hamburger-line-1.svg" 
                  alt="Menu" 
                  width={48} 
                  height={9}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute" style={{ top: '18px', left: '17px', width: '48px', height: '9px' }}>
                <Image 
                  src="/icons/hamburger-line-2.svg" 
                  alt="Menu" 
                  width={48} 
                  height={9}
                  className="w-full h-auto"
                />
              </div>
            </button>
          </div>
          
          {/* Products link */}
          <Link href="/products" className="font-mono font-bold text-lg text-white border border-white border-dashed rounded-xl px-6 py-4">
            Products
          </Link>
        </div>
        
        {/* Center - Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <Link href="/" className="text-2xl font-bold font-mono text-white">
            Novino.io
          </Link>
        </div>
        
        {/* Right section - Cart and Contact */}
        <div className="flex items-center space-x-4">
          {/* Cart button - Using Figma icon */}
          <button 
            className="flex items-center justify-center bg-[#1A1A1A] rounded-[12px] p-[18px]" 
            aria-label="Shopping Cart"
          >
            <Image 
              src="/icons/figma-cart-icon.svg"
              alt="Cart"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
          
          {/* Contact button */}
          <button className="hidden md:flex font-mono font-bold text-[#0F0F0F] bg-white rounded-xl px-[30px] py-[18px]">
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