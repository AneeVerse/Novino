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
    if (section === 'company' || section === 'help') {
      setOpenSections({
        ...openSections,
        company: !openSections.company,
        help: !openSections.company
      });
    } else if (section === 'resources' || section === 'faq') {
      setOpenSections({
        ...openSections,
        resources: !openSections.resources,
        faq: !openSections.resources
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
      <footer id="site-footer" className="relative mx-2 mb-12 max-w-[2400px]">
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
          
          {/* Mobile border overlay */}
          <div className="absolute inset-0 border-2 border-dashed border-white rounded-[20px] block sm:hidden"></div>
          {/* Desktop border overlay */}
          <div className="absolute inset-0 border-2 border-dashed border-white rounded-[20px] hidden sm:block pointer-events-none"></div>

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
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 relative z-10">
              {/* Brand Column */}
              <div className="col-span-2 sm:col-span-3 md:col-span-1">
                <h3 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4 font-['Roboto_Mono']">Novino.io</h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 font-satoshi">
                  We have clothes that suits your style and which you're proud to wear. From women to men.
                </p>
                <div className="flex gap-3">
                  <Link href="#" className="text-gray-300 hover:text-white">
                    <Twitter size={16} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </Link>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    <Facebook size={16} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </Link>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    <Instagram size={16} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </Link>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    <Youtube size={16} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
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
                    <h3 className="text-white text-base font-medium mb-3 font-satoshi">COMPANY</h3>
                    <ChevronRight 
                      size={16} 
                      className={`text-white transition-transform absolute mt-1 -mr-6 right-10 ${openSections.company ? 'rotate-90' : ''}`} 
                    />
                  </div>
                  <ul className={`space-y-1.5 overflow-hidden transition-all duration-300 ${openSections.company ? 'max-h-40' : 'max-h-0'}`}>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        About
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Features
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Works
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Career
                      </Link>
                    </li>
                  </ul>
                </div>
                
                {/* Desktop view with always visible links */}
                <div className="hidden sm:block">
                  <h3 className="text-white text-lg font-medium mb-4 font-satoshi">COMPANY</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        About
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Features
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Works
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Career
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Help Column */}
              <div>
                {/* Mobile view with collapsible sections */}
                <div className="sm:hidden">
                  <div 
                    className="flex items-start cursor-pointer relative" 
                    onClick={() => toggleSection('help')}
                  >
                    <h3 className="text-white text-base font-medium mb-3 font-satoshi">HELP</h3>
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
                  <h3 className="text-white text-lg font-medium mb-4 font-satoshi">HELP</h3>
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
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Account
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Manage Deliveries
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Orders
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
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
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Account
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Manage Deliveries
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Orders
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Customer Support
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Resources Column */}
              <div>
                {/* Mobile view with collapsible sections */}
                <div className="sm:hidden">
                  <div 
                    className="flex items-start cursor-pointer relative" 
                    onClick={() => toggleSection('resources')}
                  >
                    <h3 className="text-white text-base font-medium mb-3 font-satoshi">RESOURCES</h3>
                    <ChevronRight 
                      size={16} 
                      className={`text-white transition-transform absolute mt-1 -mr-6 right-10 ${openSections.resources ? 'rotate-90' : ''}`} 
                    />
                  </div>
                  <ul className={`space-y-1.5 overflow-hidden transition-all duration-300 ${openSections.resources ? 'max-h-40' : 'max-h-0'}`}>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Free eBooks
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        Development Tutorial
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        How to - Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-xs font-satoshi">
                        YouTube Playlist
                      </Link>
                    </li>
                  </ul>
                </div>
                
                {/* Desktop view with always visible links */}
                <div className="hidden sm:block">
                  <h3 className="text-white text-lg font-medium mb-4 font-satoshi">RESOURCES</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Free eBooks
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        Development Tutorial
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        How to - Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-300 hover:text-white text-sm font-satoshi">
                        YouTube Playlist
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 flex flex-col relative z-10">
              <div className="flex justify-between items-center">
                <div className="text-gray-300 text-xs sm:text-sm font-medium font-satoshi">Novino.io © 2000-2023, All Rights Reserved</div>
                <div className="hidden sm:flex items-center justify-center mx-4">
                  <img src="/images/Frame 53.png" alt="Payment Methods" className="h-6 sm:h-8" />
                </div>
                <a 
                href="https://www.aneeverse.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 text-xs sm:text-sm font-medium font-satoshi">Designed & Managed By Aneeverse</a>
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

