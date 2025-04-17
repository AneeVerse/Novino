import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative mx-2 max-w-[2400px]">
      <div className="relative">
        {/* Gradient effects similar to the product section */}
        <div className="absolute left-[10%] top-0 w-[60%] h-[50%] bg-gradient-to-r from-white/20 via-white/10 to-transparent blur-[100px] pointer-events-none"></div>
        <div className="absolute right-[20%] bottom-0 w-[40%] h-[60%] bg-gradient-to-l from-white/15 via-white/10 to-transparent blur-[80px] pointer-events-none"></div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 relative z-10">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <h3 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4">Novino.io</h3>
            <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
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
            <h3 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4">COMPANY</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Career
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h3 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4">HELP</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Delivery Details
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* FAQ Column */}
          <div>
            <h3 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4">FAQ</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Account
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Manage Deliveries
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Payments
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources Column */}
          <div>
            <h3 className="text-white text-base sm:text-lg font-medium mb-3 sm:mb-4">RESOURCES</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Free eBooks
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  Development Tutorial
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  How to - Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                  YouTube Playlist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-zinc-800 flex flex-col relative z-10">
          <div className="text-gray-300 text-xs sm:text-sm font-medium mb-4 text-left">Novino.io © 2000-2023, All Rights Reserved</div>

          <div className="flex justify-center w-full mb-4">
            <img src="/images/Frame 53.png" alt="Payment Methods" className="h-6 sm:h-8" />
          </div>
        </div>
      </div>
    </footer>
  )
}

