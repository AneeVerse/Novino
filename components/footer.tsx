import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-zinc-900/80 backdrop-blur-sm border-t border-dashed border-zinc-700 py-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <h3 className="text-white text-lg mb-4">Novino.io</h3>
            <p className="text-gray-400 text-sm mb-4">
              Elevate your space with our curated collection of abstract art and designer home goods.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Youtube size={18} />
              </Link>
            </div>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white text-lg mb-4">COMPANY</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Site Map
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h3 className="text-white text-lg mb-4">HELP</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Delivery Details
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* FAQ & Resources Column */}
          <div>
            <h3 className="text-white text-lg mb-4">FAQ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Account
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Manage Deliveries
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Payments
                </Link>
              </li>
            </ul>

            <h3 className="text-white text-lg mt-6 mb-4">RESOURCES</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Free eBooks
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Development Tutorial
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  How to - Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  YouTube Playlist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 pt-6 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">© Novino.io 2023-2025. All Rights Reserved.</div>

          <div className="flex gap-2">
            <img src="/placeholder.svg?height=20&width=30" alt="Visa" className="h-6" />
            <img src="/placeholder.svg?height=20&width=30" alt="Mastercard" className="h-6" />
            <img src="/placeholder.svg?height=20&width=30" alt="Amex" className="h-6" />
            <img src="/placeholder.svg?height=20&width=30" alt="PayPal" className="h-6" />
            <img src="/placeholder.svg?height=20&width=30" alt="Apple Pay" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  )
}

