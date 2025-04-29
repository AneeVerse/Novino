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
      <footer className="relative mx-2 mb-12 max-w-[2400px]">
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

          {/* Content container with padding */}
          <div className="relative p-8 z-10">
            {/* White overlay */}
            <div className="absolute bottom-[-100%] -right-[10px] w-[1500px] h-[300%] pointer-events-none" style={{
              zIndex: 5,
              transform: 'rotate(90deg)',
              opacity: 0.6,
              position: 'absolute'
            }}>
              <Image 
                src="/Ellipse 4.png"
                alt="Footer overlay effect"
                fill
                style={{ objectFit: 'contain' }}
                priority
                className="mix-blend-screen"
              />
            </div>

            {/* Gradient effects similar to the product section */}
            <div className="absolute left-[10%] top-0 w-[60%] h-[50%] bg-gradient-to-r from-white/20 via-white/10 to-transparent blur-[100px] pointer-events-none"></div>
            <div className="absolute right-[20%] bottom-0 w-[40%] h-[60%] bg-gradient-to-l from-white/15 via-white/10 to-transparent blur-[80px] pointer-events-none"></div>
            
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
                <div 
                  className="flex items-start cursor-pointer relative" 
                  onClick={() => toggleSection('company')}
                >
                  <h3 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4 font-satoshi">COMPANY</h3>
                  <ChevronRight 
                    size={16} 
                    className={`text-white transition-transform absolute mt-1 -mr-6 right-10 ${openSections.company ? 'rotate-90' : ''}`} 
                  />
                </div>
                <ul className={`space-y-1.5 sm:space-y-2 overflow-hidden transition-all duration-300 ${openSections.company ? 'max-h-40' : 'max-h-0'}`}>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Works
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Career
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Help Column */}
              <div>
                <div 
                  className="flex items-start cursor-pointer relative" 
                  onClick={() => toggleSection('help')}
                >
                  <h3 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4 font-satoshi">HELP</h3>
                  <ChevronRight 
                    size={16} 
                    className={`text-white transition-transform absolute mt-1 -mr-6 right-10 ${openSections.help ? 'rotate-90' : ''}`} 
                  />
                </div>
                <ul className={`space-y-1.5 sm:space-y-2 overflow-hidden transition-all duration-300 ${openSections.help ? 'max-h-40' : 'max-h-0'}`}>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Customer Support
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Delivery Details
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>

              {/* FAQ Column */}
              <div>
                <div 
                  className="flex items-start cursor-pointer relative" 
                  onClick={() => toggleSection('faq')}
                >
                  <h3 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4 font-satoshi">FAQ</h3>
                  <ChevronRight 
                    size={16} 
                    className={`text-white transition-transform absolute mt-1 -mr-6 right-10 ${openSections.faq ? 'rotate-90' : ''}`} 
                  />
                </div>
                <ul className={`space-y-1.5 sm:space-y-2 overflow-hidden transition-all duration-300 ${openSections.faq ? 'max-h-40' : 'max-h-0'}`}>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Account
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Manage Deliveries
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Payments
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Resources Column */}
              <div>
                <div 
                  className="flex items-start cursor-pointer relative" 
                  onClick={() => toggleSection('resources')}
                >
                  <h3 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4 font-satoshi">RESOURCES</h3>
                  <ChevronRight 
                    size={16} 
                    className={`text-white transition-transform absolute mt-1 -mr-6 right-10 ${openSections.resources ? 'rotate-90' : ''}`} 
                  />
                </div>
                <ul className={`space-y-1.5 sm:space-y-2 overflow-hidden transition-all duration-300 ${openSections.resources ? 'max-h-40' : 'max-h-0'}`}>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Free eBooks
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      Development Tutorial
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      How to - Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm font-satoshi">
                      YouTube Playlist
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 flex flex-col relative z-10">
              <div className="flex justify-between items-center">
                <div className="text-gray-300 text-xs sm:text-sm font-medium font-satoshi">Novino.io © 2000-2023, All Rights Reserved</div>
                <div className="flex items-center justify-center mx-4">
                  <img src="/images/Frame 53.png" alt="Payment Methods" className="h-6 sm:h-8" />
                </div>
                <div className="text-gray-300 text-xs sm:text-sm font-medium font-satoshi">Designed & Managed By Aneeverse.com</div>
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

