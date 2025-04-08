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

      {/* Combined Container with border for Hero and Gallery */}
      <div className="mx-4 md:mx-6 mt-28 mb-8 z-10 relative border-[3px] border-dashed border-white rounded-[20px] overflow-hidden">
        {/* Hero Section */}
        <div className="relative">
          {/* Adding gradient effects from Figma */}
          <div className="relative">
            {/* Left side gradient effects */}
            <div className="absolute left-0 top-0 w-[1000px] h-full">
              <div className="absolute left-0 top-[20%] w-[800px] h-[800px] bg-gradient-to-r from-white/60 via-white/30 to-transparent blur-[100px]"></div>
              <div className="absolute left-[10%] top-[40%] w-[600px] h-[600px] bg-gradient-to-r from-white/40 via-white/20 to-transparent blur-[120px]"></div>
              <div className="absolute left-0 bottom-[10%] w-[700px] h-[500px] bg-gradient-to-r from-white/50 via-white/25 to-transparent blur-[150px]"></div>
            </div>
          
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
          <div className="flex flex-col md:flex-row md:gap-8">
            {/* Left side: Categories and Title */}
            <div className="md:w-1/3 mb-8 md:mb-0">
              <div className="text-sm text-gray-300">All Products</div>
              <h2 className="text-white text-2xl md:text-3xl font-light mb-8">Elevate Your Gallery</h2>

              {/* Category Filters - Displayed vertically on left side */}
              <div className="flex flex-col gap-3">
                {[
                  { name: "All Products", active: true },
                  { name: "Books", active: false },
                  { name: "Mugs", active: false },
                  { name: "Costar", active: false },
                  { name: "Feeds", active: false },
                ].map((category) => (
                  <button
                    key={category.name}
                    className={`border border-dashed rounded-full py-2 px-4 text-sm ${
                      category.active 
                        ? "bg-white text-black border-transparent" 
                        : "border-white/30 text-white hover:bg-white/10"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side: Product Grid */}
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white">
                  <div className="relative aspect-square overflow-hidden">
                    <Image src="/images/notebook-white.png" alt="GLASSWAVE" fill className="object-cover" />
                  </div>
                  <div className="bg-zinc-900 p-3">
                    <div className="text-gray-200 text-sm uppercase mb-1">GLASSWAVE</div>
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
                    <div className="text-gray-200 text-sm uppercase mb-1">HOLOCANE</div>
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
                    <div className="text-gray-200 text-sm uppercase mb-1">INAMORATA</div>
                    <div className="flex justify-between items-center">
                      <div className="text-white font-medium">$12</div>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <Star key={i} size={12} fill={i < 4 ? "white" : "none"} color="white" />
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
                    <div className="text-gray-200 text-sm uppercase mb-1">LIGHTCOOL</div>
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

