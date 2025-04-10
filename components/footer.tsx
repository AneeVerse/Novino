import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-dashed border-zinc-700 py-10 relative z-10 mt-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div>
            <h3 className="text-white text-lg font-medium mb-4">Novino.io</h3>
            <p className="text-gray-300 text-sm mb-4">
              We have clothes that suits your style and which you're proud to wear. From women to men.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="text-gray-300 hover:text-white">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Youtube size={18} />
              </Link>
            </div>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white text-lg font-medium mb-4">COMPANY</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Career
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h3 className="text-white text-lg font-medium mb-4">HELP</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Delivery Details
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* FAQ Column */}
          <div>
            <h3 className="text-white text-lg font-medium mb-4">FAQ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Account
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Manage Deliveries
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Payments
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources Column */}
          <div>
            <h3 className="text-white text-lg font-medium mb-4">RESOURCES</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Free eBooks
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  Development Tutorial
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  How to - Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm">
                  YouTube Playlist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 pt-6 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-300 text-sm font-medium mb-4 md:mb-0">Novino.io © 2000-2023, All Rights Reserved</div>

          <div className="flex gap-2">
            <img src="/images/Frame 53.png" alt="Payment Methods" className="h-8" />
          </div>
        </div>
      </div>
    </footer>
  )
}

