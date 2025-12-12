import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, ChevronRight } from "lucide-react"
import "@fontsource/roboto-mono"
import Image from "next/image"
import { useState } from "react"

// Using local import for Satoshi font since npm package isn't available
export default function Footer() {
  // Define a type for the section names
  type SectionName = 'company' | 'help' | 'faq' | 'resources';

  // State to track which sections are open
  const [openSections, setOpenSections] = useState({
    company: false,
    help: false,
    faq: false,
    resources: false
  });

  // Function to toggle sections with the grouped behavior
  const toggleSection = (section: SectionName) => {
    if (section === 'company' || section === 'faq') {
      // QUICK LINKS and FAQ toggle together
      setOpenSections({
        ...openSections,
        company: !openSections.company,
        faq: !openSections.company
      });
    } else if (section === 'help') {
      // POLICY toggles independently
      setOpenSections({
        ...openSections,
        help: !openSections.help
      });
    } else {
      setOpenSections({
        ...openSections,
        [section]: !openSections[section]
      });
    }
  };

  return (
    <div className="relative overflow-hidden">
      <footer id="site-footer" className="relative max-w-[1440px] mx-auto mb-12">
        <div className="relative p-0 bg-[#292929] sm:bg-transparent" style={{
          backgroundImage: "none",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center"
        }}>
          {/* Add conditional background image for desktop */}
          <div className="absolute inset-0 hidden sm:block" style={{
            backgroundImage: "url('/footer.png')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            zIndex: -1
          }}></div>

          {/* Border overlay - matching testimonial style */}
          <div className="absolute inset-0 pointer-events-none" style={{
            border: '2px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
          }}></div>

          {/* Content container with padding */}
          <div className="relative p-8 z-10">
            {/* Gradient overlays - White */}
            {/* Main center glow */}
            <div className="absolute pointer-events-none" style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              height: '80%',
              zIndex: 5,
              background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 30%, rgba(255, 255, 255, 0.06) 50%, transparent 70%)',
              filter: 'blur(70px)',
              mixBlendMode: 'overlay'
            }}></div>

            {/* Bottom left glow */}
            <div className="absolute pointer-events-none" style={{
              bottom: '-20%',
              left: '-10%',
              width: '50%',
              height: '60%',
              zIndex: 5,
              background: 'radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)',
              filter: 'blur(50px)',
              mixBlendMode: 'overlay'
            }}></div>

            {/* Top right glow */}
            <div className="absolute pointer-events-none" style={{
              top: '-15%',
              right: '-5%',
              width: '45%',
              height: '55%',
              zIndex: 5,
              background: 'radial-gradient(ellipse at bottom left, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 30%, transparent 65%)',
              filter: 'blur(55px)',
              mixBlendMode: 'overlay'
            }}></div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 relative z-10">
              {/* Brand Column */}
              <div className="col-span-2 sm:col-span-3 md:col-span-1">
                <h3 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4 font-['Roboto_Mono']">Novino.io</h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 font-satoshi">
                  Elevate ordinary walls with extraordinary galleries. Transform your space with unique art pieces and artifacts.
                </p>
                <div className="flex gap-3">
                  {/* Keep only Instagram for now */}
                  <Link href="#" className="text-gray-300 hover:text-white">
                    <Instagram size={16} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </Link>
                </div>
              </div>

              {/* Company Column */}
              <div>
                {/* Mobile view with collapsible sections */}
                <div className="sm:hidden">
                  <div
                    className="flex items-start cursor-pointer relative"
                    onClick={() => toggleSection('company')}
                  >
                    <h3 className="text-white text-base font-medium mb-3 font-satoshi">QUICK LINKS</h3>
                    <ChevronRight
                      size={16}
                      className={`text-white transition-transform absolute mt-1 -mr-6 right-10 ${openSections.company ? 'rotate-90' : ''}`}
                    />
                  </div>
                  <ul className={`space-y-1.5 overflow-hidden transition-all duration-300 ${openSections.company ? 'max-h-40' : 'max-h-0'}`}>
                    <li>
                      <Link href="/paintings" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Paintings
                      </Link>
                    </li>
                    <li>
                      <Link href="/artefacts" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Artefacts
                      </Link>
                    </li>
                    <li>
                      <Link href="/journey" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Journey
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Desktop view with always visible links */}
                <div className="hidden sm:block">
                  <h3 className="text-white text-lg font-medium mb-4 font-satoshi">QUICK LINKS</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/paintings" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Paintings
                      </Link>
                    </li>
                    <li>
                      <Link href="/artefacts" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Artefacts
                      </Link>
                    </li>
                    <li>
                      <Link href="/journey" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Journey
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* FAQ Column */}
              <div>
                {/* Mobile view with collapsible sections */}
                <div className="sm:hidden">
                  <div
                    className="flex items-start cursor-pointer relative"
                    onClick={() => toggleSection('faq')}
                  >
                    <h3 className="text-white text-base font-medium mb-3 font-satoshi">FAQ</h3>
                    <ChevronRight
                      size={16}
                      className={`text-white transition-transform absolute mt-1 -mr-6 right-10 ${openSections.faq ? 'rotate-90' : ''}`}
                    />
                  </div>
                  <ul className={`space-y-1.5 overflow-hidden transition-all duration-300 ${openSections.faq ? 'max-h-40' : 'max-h-0'}`}>
                    <li>
                      <Link href="/profile" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Account
                      </Link>
                    </li>
                    <li>
                      <Link href="/profile" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <Link href="/blogs" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Help & FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Customer Support
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Desktop view with always visible links */}
                <div className="hidden sm:block">
                  <h3 className="text-white text-lg font-medium mb-4 font-satoshi">FAQ</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/profile" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Account
                      </Link>
                    </li>
                    <li>
                      <Link href="/profile" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <Link href="/blogs" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Help & FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Customer Support
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Policy Column */}
              <div>
                {/* Mobile view with collapsible sections */}
                <div className="sm:hidden">
                  <div
                    className="flex items-start cursor-pointer relative"
                    onClick={() => toggleSection('help')}
                  >
                    <h3 className="text-white text-base font-medium mb-3 font-satoshi">POLICY</h3>
                    <ChevronRight
                      size={16}
                      className={`text-white transition-transform absolute mt-1 -mr-6 right-10 ${openSections.help ? 'rotate-90' : ''}`}
                    />
                  </div>
                  <ul className={`space-y-1.5 overflow-hidden transition-all duration-300 ${openSections.help ? 'max-h-40' : 'max-h-0'}`}>
                    <li>
                      <Link href="/payment-policy" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Payment Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/shipping-policy" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Shipping Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms-conditions" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Terms & Conditions
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy-policy" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Desktop view with always visible links */}
                <div className="hidden sm:block">
                  <h3 className="text-white text-lg font-medium mb-4 font-satoshi">POLICY</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/payment-policy" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Payment Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/shipping-policy" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Shipping Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms-conditions" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Terms & Conditions
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy-policy" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Bottom Section */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 flex flex-col relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-center gap-3 sm:gap-4 text-center">
                <div className="text-gray-300 text-xs sm:text-sm font-medium font-satoshi">
                  Copyright © 2025 Novino.io.All Rights Reserved
                </div>
                <div className="hidden sm:flex items-center justify-center mx-4">
                  <img src="/images/Frame 53.png" alt="Payment Methods" className="h-6 sm:h-8" />
                </div>
                <a
                  href="https://www.aneeverse.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm font-medium font-satoshi hover:text-white transition-colors group"
                >
                  <span>Designed & Managed By Aneeverse</span>
                  <Image
                    src="/images/aneeverse-logo.svg"
                    alt="AneeVerse Logo"
                    width={24}
                    height={24}
                    className="h-5 w-5 sm:h-6 sm:w-6 opacity-100 group-hover:opacity-100 transition-opacity invert brightness-125"
                  />
                </a>
              </div>
              {/* Payment options for mobile */}
              <div className="flex sm:hidden items-center justify-center mt-4">
                <img src="/images/Frame 53.png" alt="Payment Methods" className="h-6" />
              </div>
            </div>

            {/* Add Satoshi font styles */}
            <style jsx global>{`
              @font-face {
                font-family: 'Satoshi';
                src: url('/fonts/Satoshi-Variable.woff2') format('woff2');
                font-weight: 300 900;
                font-style: normal;
                font-display: swap;
              }
              
              .font-satoshi {
                font-family: 'Satoshi', sans-serif;
              }
            `}</style>
          </div>
        </div>
      </footer>
    </div>
  )
}

