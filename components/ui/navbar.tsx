"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { X, Image as ImageIcon, Archive, Map, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { getCartCount } = useCart();
  const { isAuthenticated } = useAuth();

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

  // Track scroll position to change navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      // Make navbar solid as soon as scrolling starts (even within hero section)
      if (window.scrollY > 0) {
        setScrolled(true); // Scrolling - make solid
      } else {
        setScrolled(false); // At top - keep fully transparent
      }
    };

    // Add scroll event listener with passive for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Check if image modal is open (by checking body class)
  useEffect(() => {
    const checkModalState = () => {
      setIsImageModalOpen(document.body.classList.contains('image-modal-open'));
    };

    // Check initially
    checkModalState();

    // Watch for changes using MutationObserver
    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle cart icon click - navigate to cart page
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/cart');
  };

  // Check if we're on the home page or product page
  const isHomePage = pathname === '/';
  const isProductPage = pathname.startsWith('/product/');
  const shouldBeTransparent = isHomePage || isProductPage;

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[1000] h-[80px] transition-all duration-300 ${scrolled || !shouldBeTransparent ? 'bg-[#2D2D2D]' : 'bg-transparent'
        } ${isImageModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="relative max-w-[1440px] mx-auto h-full flex justify-between items-center px-4 md:px-6 lg:px-8">
          {/* Left section - Menu items (Tablet & Desktop) */}
          <div className="hidden md:flex items-center space-x-3 md:space-x-4 lg:space-x-6 h-full">
            <Link href="/paintings" className="uppercase tracking-wider text-xs md:text-[11px] lg:text-sm font-medium font-roboto-mono text-white">
              PAINTINGS
            </Link>
            <Link href="/artefacts" className="uppercase tracking-wider text-xs md:text-[11px] lg:text-sm font-medium font-roboto-mono text-white">
              ARTEFACTS
            </Link>
            <Link href="/journey" className="uppercase tracking-wider text-xs md:text-[11px] lg:text-sm font-medium font-roboto-mono text-white">
              JOURNEY
            </Link>
            {/* <Link href="/journal" className="uppercase tracking-wider text-xs md:text-[11px] lg:text-sm font-medium font-roboto-mono text-white">
              JOURNAL
            </Link> */}
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
            <Link
              href="/"
              className="flex items-center justify-center text-2xl md:text-2xl lg:text-3xl xl:text-4xl font-dm-serif-display tracking-[0.15em] md:tracking-[0.18em] lg:tracking-[0.2em] text-white uppercase"
            >
              NOVINO
            </Link>
          </div>

          {/* Right section - Authentication */}
          <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 ml-auto">
            <Link href={isAuthenticated ? "/profile" : "/login"} className="text-white">
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

      {/* Full screen mobile menu - slides from top with smooth animation */}
      <div
        className={`fixed inset-0 bg-[#222222] z-[999] md:hidden overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-8 pointer-events-none'
          } ${isImageModalOpen ? 'opacity-0 pointer-events-none' : ''}`}
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        <div className="h-[80px]"></div> {/* Space for navbar */}
        <div className="container mx-auto px-6 py-12 h-[calc(100vh-80px)] flex flex-col overflow-y-auto">
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
            </ul>
          </div>

          <div className="mt-auto pb-8">
            <div className="flex flex-col items-center space-y-4 w-full">
              {isAuthenticated ? (
                /* Show Logout when user is signed in */
                <Link
                  href="/profile"
                  className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white text-lg font-semibold py-3 rounded-full text-center transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  My Account
                </Link>
              ) : (
                /* Show Login and Register when user is not signed in */
                <>
                  <Link
                    href="/login"
                    className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white text-lg font-semibold py-3 rounded-full text-center transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full border-2 border-[#AE876D] text-[#AE876D] text-lg font-semibold py-3 rounded-full text-center transition-colors hover:bg-[#AE876D]/10"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;