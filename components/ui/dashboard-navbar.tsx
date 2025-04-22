"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DashboardNavbarContent() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  
  return (
    <nav className="w-full z-40 bg-[#222222] border-b border-[#333333] sticky top-0">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left section - Logo and Dashboard title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
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
          
          <Link href="/dashboard" className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center mr-3">
              <span className="text-[#222222] font-bold text-xl">N</span>
            </div>
            <span className="text-white text-xl font-bold">Dashboard</span>
          </Link>
        </div>
        
        {/* Center - Site Title */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="text-xl font-bold text-white/90 hover:text-white transition-colors">
            Novino.io
          </Link>
        </div>
        
        {/* Right section - User actions */}
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="text-white/70 hover:text-white text-sm transition-colors flex items-center"
          >
            <span className="mr-1.5">View Site</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </Link>
          
          <button className="text-white/70 hover:text-white transition-colors">
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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          
          <div className="w-9 h-9 bg-[#A47E3B] rounded-full flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
        </div>
      </div>
      
      {/* Dashboard navigation */}
      <div className="bg-[#1A1A1A] border-b border-[#333333] hidden sm:block">
        <div className="container mx-auto">
          <div className="flex space-x-1">
            <Link 
              href="/dashboard" 
              className={`px-4 py-3 text-sm font-medium ${
                pathname === '/dashboard' && !currentTab
                  ? 'text-white border-b-2 border-[#A47E3B]' 
                  : 'text-white/70 hover:text-white hover:bg-[#222222]'
              } transition-colors`}
            >
              Overview
            </Link>
            <Link 
              href="/dashboard?tab=blogs" 
              className={`px-4 py-3 text-sm font-medium ${
                currentTab === 'blogs'
                  ? 'text-white border-b-2 border-[#A47E3B]' 
                  : 'text-white/70 hover:text-white hover:bg-[#222222]'
              } transition-colors`}
            >
              Blogs
            </Link>
            <Link 
              href="/dashboard?tab=testimonials" 
              className={`px-4 py-3 text-sm font-medium ${
                currentTab === 'testimonials'
                  ? 'text-white border-b-2 border-[#A47E3B]' 
                  : 'text-white/70 hover:text-white hover:bg-[#222222]'
              } transition-colors`}
            >
              Testimonials
            </Link>
            <Link 
              href="/dashboard?tab=paintings" 
              className={`px-4 py-3 text-sm font-medium ${
                currentTab === 'paintings'
                  ? 'text-white border-b-2 border-[#A47E3B]' 
                  : 'text-white/70 hover:text-white hover:bg-[#222222]'
              } transition-colors`}
            >
              Paintings
            </Link>
            <Link 
              href="/dashboard?tab=artefacts" 
              className={`px-4 py-3 text-sm font-medium ${
                currentTab === 'artefacts'
                  ? 'text-white border-b-2 border-[#A47E3B]' 
                  : 'text-white/70 hover:text-white hover:bg-[#222222]'
              } transition-colors`}
            >
              Artefacts
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      {isOpen && (
        <div className="sm:hidden bg-[#1A1A1A] border-b border-[#333333]">
          <div className="container mx-auto py-2 px-4">
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/dashboard" 
                  className={`block px-4 py-2 text-sm ${
                    pathname === '/dashboard' && !currentTab
                      ? 'text-white bg-[#2A2A2A] font-medium rounded'
                      : 'text-white/70 hover:text-white hover:bg-[#2A2A2A] rounded'
                  } transition-colors`}
                >
                  Overview
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard?tab=blogs" 
                  className={`block px-4 py-2 text-sm ${
                    currentTab === 'blogs'
                      ? 'text-white bg-[#2A2A2A] font-medium rounded'
                      : 'text-white/70 hover:text-white hover:bg-[#2A2A2A] rounded'
                  } transition-colors`}
                >
                  Blogs
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard?tab=testimonials" 
                  className={`block px-4 py-2 text-sm ${
                    currentTab === 'testimonials'
                      ? 'text-white bg-[#2A2A2A] font-medium rounded'
                      : 'text-white/70 hover:text-white hover:bg-[#2A2A2A] rounded'
                  } transition-colors`}
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard?tab=paintings" 
                  className={`block px-4 py-2 text-sm ${
                    currentTab === 'paintings'
                      ? 'text-white bg-[#2A2A2A] font-medium rounded'
                      : 'text-white/70 hover:text-white hover:bg-[#2A2A2A] rounded'
                  } transition-colors`}
                >
                  Paintings
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard?tab=artefacts" 
                  className={`block px-4 py-2 text-sm ${
                    currentTab === 'artefacts'
                      ? 'text-white bg-[#2A2A2A] font-medium rounded'
                      : 'text-white/70 hover:text-white hover:bg-[#2A2A2A] rounded'
                  } transition-colors`}
                >
                  Artefacts
                </Link>
              </li>
              <li className="pt-2 mt-2 border-t border-[#333333]">
                <Link 
                  href="/" 
                  className="flex items-center px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors"
                >
                  <span className="mr-1.5">View Site</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}

export default function DashboardNavbar() {
  return (
    <Suspense fallback={<div className="w-full bg-[#222222] border-b border-[#333333] h-16"></div>}>
      <DashboardNavbarContent />
    </Suspense>
  );
} 