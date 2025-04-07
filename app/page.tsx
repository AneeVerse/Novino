import Image from "next/image"
import Link from "next/link"
import { Menu, X, Star, ArrowRight, ChevronUp, ChevronDown } from "lucide-react"
import VideoSection from "@/components/video-section"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import TestimonialCollection from "@/components/testimonial-collection"
import Footer from "@/components/footer"
import ProductTestimonial from "@/components/product-testimonial"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-transparent">
      {/* Background overlay simplified - removing gradients that aren't showing */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base background color */}
        <div className="absolute inset-0 bg-[#2D2D2D]"></div>
      </div>

      {/* Top padding matches bottom to center the navbar */}
      <div className="pt-2"></div>

      {/* Navigation with balanced vertical alignment */}
      <nav className="flex items-center justify-between p-4 md:p-6 py-3 relative z-10 bg-[#2D2D2D]">
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
      </nav>

      {/* Combined Container with border for Hero and Gallery */}
      <div className="mx-4 md:mx-6 mt-6 mb-8 z-10 relative border-[3px] border-dashed border-white rounded-[20px] overflow-hidden">
        {/* Hero Section */}
        <div className="relative">
          {/* Adding gradient effects from Figma */}
          <div className="relative">
            {/* Background gradient effects */}
            <div className="absolute -top-[200px] right-[25%] w-[400px] h-[400px] rounded-full bg-[#E8B08A]/40 blur-[300px] z-0"></div>
            <div className="absolute -top-[100px] left-[10%] w-[300px] h-[300px] rounded-full bg-white/20 blur-[200px] z-0"></div>
          
            <div className="relative w-full h-[500px] md:h-[600px]">
              <Image
                src="/images/hero-bg.png"
                alt="Gallery wall with abstract art"
                fill
                className="object-cover"
                priority
              />
              
              {/* Shop Now button in the correct position - middle bottom */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
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
          </div>
        </div>

        {/* ELEVATE ORDINARY WALLS Section */}
        <div className="p-6 md:p-10 bg-[#2D2D2D] backdrop-blur-sm">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-16">
              <h1 className="text-white text-[38px] font-medium font-roboto uppercase leading-[1.171875em] mb-8 text-center whitespace-nowrap">ELEVATE ORDINARY WALLS WITH EXTRAORDINARY GALLERIES</h1>
              <p className="text-white/60 text-base leading-none text-center whitespace-nowrap">Explore a world of fashion at StyleLoom, where trends meet affordability. Immerse yourself in the latest styles and seize exclusive promotions.</p>
            </div>

            {/* Category Filters */}
            <div className="flex justify-center items-center gap-6 mb-16">
              {["All", "Mens", "Womens", "Kids"].map((category) => (
                <button 
                  key={category} 
                  className="min-w-[120px] border border-dashed border-white/20 px-6 py-2.5 text-white/40 text-sm font-light hover:text-white hover:border-white transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Grid - Now inside the border */}
        <div className="p-6 md:p-10 bg-[#2D2D2D] backdrop-blur-sm">
          {/* Gallery Grid */}
          <div className="relative w-full mb-8">
            <Image
              src="/images/gallery-grid.png"
              alt="Gallery of abstract art pieces"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Product Testimonial Section - Now outside the border */}
      <div className="mx-4 md:mx-6 mb-8 relative z-10">
        <div className="bg-[#2D2D2D]">
          <ProductTestimonial />
        </div>
      </div>

      {/* Product Grid Section */}
      <div className="mx-4 md:mx-6 relative z-10">
        <div className="border border-dashed border-white p-6 md:p-8 mb-16 bg-[#2D2D2D]">
          <div className="mb-6">
            <div className="text-sm text-gray-300">All Products</div>
            <h2 className="text-white text-2xl md:text-3xl font-light">Elevate Your Gallery</h2>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { name: "All Products", active: true },
              { name: "Books", active: false },
              { name: "Mugs", active: false },
              { name: "Decor", active: false },
              { name: "Kids", active: false },
            ].map((category) => (
              <button
                key={category.name}
                className={`border border-dashed ${category.active ? "border-white text-white" : "border-gray-500 text-gray-400"} px-3 py-1 text-xs rounded-sm`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Product Grid - Updated to match design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white">
              <div className="relative aspect-square overflow-hidden">
                <Image src="/images/notebook-white.png" alt="GLASSWAVE" fill className="object-cover" />
              </div>
              <div className="bg-zinc-900 p-3">
                <div className="text-gray-400 text-xs uppercase mb-1">GLASSWAVE</div>
                <div className="flex justify-between items-center">
                  <div className="text-white font-medium">$20</div>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} size={12} fill="white" color="white" />
                        ))}
                    </div>
                    <span className="text-gray-400 text-xs">5.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white">
              <div className="relative aspect-square overflow-hidden">
                <Image src="/images/notebook-black.png" alt="HOLOCANE" fill className="object-cover" />
              </div>
              <div className="bg-zinc-900 p-3">
                <div className="text-gray-400 text-xs uppercase mb-1">HOLOCANE</div>
                <div className="flex justify-between items-center">
                  <div className="text-white font-medium">$23</div>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} size={12} fill="white" color="white" />
                        ))}
                    </div>
                    <span className="text-gray-400 text-xs">5.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white">
              <div className="relative aspect-square overflow-hidden">
                <Image src="/images/mug-white.png" alt="INAMORATA" fill className="object-cover" />
              </div>
              <div className="bg-zinc-900 p-3">
                <div className="text-gray-400 text-xs uppercase mb-1">INAMORATA</div>
                <div className="flex justify-between items-center">
                  <div className="text-white font-medium">$12</div>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} size={12} fill={i < 4.5 ? "white" : "none"} color="white" />
                        ))}
                    </div>
                    <span className="text-gray-400 text-xs">4.5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white">
              <div className="relative aspect-square overflow-hidden">
                <Image src="/images/mug-black.png" alt="LIGHTCOOL" fill className="object-cover" />
              </div>
              <div className="bg-zinc-900 p-3">
                <div className="text-gray-400 text-xs uppercase mb-1">LIGHTCOOL</div>
                <div className="flex justify-between items-center">
                  <div className="text-white font-medium">$22.5</div>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} size={12} fill="white" color="white" />
                        ))}
                    </div>
                    <span className="text-gray-400 text-xs">5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Now Button */}
          <div className="flex justify-center mt-8">
            <Link
              href="/shop"
              className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 text-sm hover:bg-zinc-700 transition-colors"
            >
              Shop now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <VideoSection />

      {/* Testimonial Collection Section */}
      <TestimonialCollection />

      {/* Blog Section */}
      <BlogSection />

      {/* Wardrobe CTA Section */}
      <WardrobeSection />

      {/* Footer */}
      <Footer />
    </main>
  )
}

