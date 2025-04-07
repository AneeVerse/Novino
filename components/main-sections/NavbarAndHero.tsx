import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function NavbarAndHero() {
  return (
    <div className="relative min-h-screen bg-black">
      {/* Super visible background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Center gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D2D2D] via-[#3D3D3D] to-[#2D2D2D]"></div>
        
        {/* Side gradients */}
        <div className="absolute -left-64 top-0 bottom-0 w-[800px] bg-gradient-to-r from-[#2D2D2D] to-transparent mix-blend-overlay"></div>
        <div className="absolute -right-64 top-0 bottom-0 w-[800px] bg-gradient-to-l from-[#2D2D2D] to-transparent mix-blend-overlay"></div>
        
        {/* Glow effects */}
        <div className="absolute top-64 left-1/4 w-[600px] h-[600px] rounded-full bg-white/10 blur-[80px] mix-blend-plus-lighter"></div>
        <div className="absolute bottom-64 right-1/4 w-[600px] h-[600px] rounded-full bg-white/10 blur-[80px] mix-blend-plus-lighter"></div>
      </div>

      {/* Fixed Navbar with glass effect */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="absolute inset-0 bg-[#2D2D2D] backdrop-blur-sm"></div>
        <div className="relative flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-6">
            <button className="text-white">
              <Menu size={24} />
            </button>
            <div className="border border-dashed border-white px-3 py-1">
              <span className="text-white text-sm">Products</span>
            </div>
          </div>
          <div className="text-white text-xl font-light">Novino.io</div>
          <div className="flex items-center gap-4">
            <button className="text-white">
              <X size={20} />
            </button>
            <button className="bg-white px-4 py-1 text-sm rounded-sm">Contact</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 z-10">
        <div className="border-[3px] border-dashed border-white mx-4 md:mx-6 rounded-[20px] overflow-hidden relative">
          <div className="relative">
            <div className="relative w-full h-[500px] md:h-[600px]">
              <Image
                src="/images/hero-bg.png"
                alt="Gallery wall with abstract art"
                fill
                className="object-cover"
                priority
              />
              
              {/* Content overlay */}
              <div className="absolute inset-0 flex items-center justify-end p-8 md:p-16">
                <div className="bg-[#9F8575] max-w-md p-8 rounded-lg">
                  <h2 className="text-white text-3xl md:text-4xl font-light mb-4">
                    Elevate ordinary walls with extraordinary galleries.
                  </h2>
                  <Link 
                    href="#" 
                    className="inline-block text-white border-b border-white pb-1"
                  >
                    VIEW COLLECTION
                  </Link>
                </div>
              </div>
              
              {/* Shop Now button */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <Link 
                  href="/shop" 
                  className="inline-flex items-center gap-2 bg-[#1F1F1F] text-white px-6 py-4 rounded-xl hover:bg-[#333] transition-colors"
                >
                  <span>Shop Now</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 16L18 12M18 12L14 8M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Main Content - transparent background to show the gradients */}
            <div className="relative backdrop-blur-sm p-8 md:p-12 bg-black/30">
              <div className="max-w-[1200px] mx-auto">
                <div className="mb-20">
                  <h1 className="text-white text-[38px] font-medium font-roboto uppercase leading-[1.171875em] mb-8 text-center whitespace-nowrap">
                    ELEVATE ORDINARY WALLS WITH EXTRAORDINARY GALLERIES
                  </h1>
                  <p className="text-white/60 text-base leading-none text-center">
                    Explore a world of fashion at StyleLoom, where trends meet affordability. Immerse yourself in the latest styles and seize exclusive promotions.
                  </p>
                </div>

                {/* Category Filters */}
                <div className="flex justify-center items-center gap-6 mb-20">
                  {["All", "Mens", "Womens", "Kids"].map((category) => (
                    <button 
                      key={category} 
                      className="min-w-[120px] border border-dashed border-white/20 px-6 py-2.5 text-white/40 text-sm font-light hover:text-white hover:border-white transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] relative bg-zinc-800 rounded-lg overflow-hidden">
                      <Image
                        src={`/images/gallery-${i + 1}.png`}
                        alt={`Gallery image ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 