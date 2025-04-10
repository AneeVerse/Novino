"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, X, Star, ArrowRight, ChevronUp, ChevronDown } from "lucide-react"
import VideoSection from "@/components/video-section"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import TestimonialCollection from "@/components/testimonial-collection"
import Footer from "@/components/footer"
import ProductTestimonial from "@/components/product-testimonial"
import MasonryGallery from "@/components/masonry-gallery"
import ProductGrid from "@/components/product-grid"
import { useState } from "react"

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  
  return (
    <main className="relative min-h-screen bg-transparent overflow-x-hidden">
      {/* Background overlay simplified - removing gradients that aren't showing */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base background color */}
        <div className="absolute inset-0 bg-[#2D2D2D]"></div>
      </div>

      {/* Top padding for navbar spacing */}
      <div className="pt-4"></div>

      {/* Combined Container with border for Hero and Gallery */}
      <div className="mx-4 md:mx-6 mt-24 mb-8 z-10 relative rounded-[20px]">
        <div className="overflow-hidden rounded-[20px]">
          {/* Hero Section */}
          <div className="relative">
            {/* Adding gradient effects from Figma */}
            <div className="relative">
              {/* Left side gradient effects */}
              <div className="absolute left-0 top-0 w-full max-w-full h-full">
                <div className="absolute left-0 top-[20%] w-full max-w-[80%] h-[80%] bg-gradient-to-r from-white/60 via-white/30 to-transparent blur-[100px]"></div>
                <div className="absolute left-[10%] top-[40%] w-full max-w-[60%] h-[60%] bg-gradient-to-r from-white/40 via-white/20 to-transparent blur-[120px]"></div>
                <div className="absolute left-0 bottom-[10%] w-full max-w-[70%] h-[50%] bg-gradient-to-r from-white/50 via-white/25 to-transparent blur-[150px]"></div>
              </div>
            
              <div className="relative w-full h-[580px] md:h-[680px]">
                <Image
                  src="/images/hero-bg.png"
                  alt="Gallery wall with abstract art"
                  fill
                  className="object-cover rounded-[20px]"
                  priority
                />
                
                {/* Shop Now button in the correct position */}
                <div className="absolute bottom-[40%] left-1/2 transform -translate-x-1/2 z-50">
                  <Link 
                    href="/shop" 
                    className="box-border flex flex-row items-center justify-center p-[18px_24px] gap-1 isolate w-[148px] h-[63px] bg-white border border-dashed border-[#404040] rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-black text-base font-normal">Shop Now</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                      <path d="M14 16L18 12M18 12L14 8M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 z-50 pointer-events-none">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1330 1179" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
            <rect x="2" y="2" width="1326" height="1175" rx="19" stroke="white" strokeWidth="2" strokeDasharray="16 4" strokeOpacity="1" style={{ mixBlendMode: "normal" }}/>
          </svg>
        </div>

        {/* ELEVATE ORDINARY WALLS Section */}
        <div className="p-6 md:p-10 bg-[#2D2D2D] backdrop-blur-sm">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-16">
              <h1 className="text-white text-[28px] md:text-[38px] font-medium font-roboto uppercase leading-[1.171875em] mb-8 text-center">ELEVATE ORDINARY WALLS WITH EXTRAORDINARY GALLERIES</h1>
              <p className="text-white/60 text-base leading-normal text-center mx-auto max-w-3xl">Explore a world of fashion at StyleLoom, where trends meet affordability. Immerse yourself in the latest styles and seize exclusive promotions.</p>
            </div>
          </div>
        </div>

        {/* Gallery Grid - Now inside the border */}
        <div className="p-6 md:p-10 bg-[#2D2D2D] backdrop-blur-sm">
          {/* Gallery Grid - Replaced with MasonryGallery component */}
          <div className="relative w-full mb-8">
            <MasonryGallery />
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
        <div className="p-8 md:p-12 mb-16 bg-[#2D2D2D] relative overflow-hidden" style={{ 
          boxSizing: 'border-box',
          border: '2px dashed #FFFFFF',
          borderRadius: '20px',
          borderSpacing: '8px',
        }}>
          {/* Abstract gradient backgrounds to connect with upper sections */}
          <div className="absolute left-0 top-0 w-full max-w-[80%] h-[60%] bg-gradient-to-r from-white/30 via-white/15 to-transparent blur-[100px] pointer-events-none"></div>
          <div className="absolute right-0 bottom-0 w-[50%] h-[40%] bg-gradient-to-l from-white/20 via-white/10 to-transparent blur-[80px] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:gap-16 relative z-10">
            {/* Left side: Categories and Title */}
            <div className="md:w-[40%] mb-8 md:mb-0">
              <div className="text-sm text-gray-300 mb-2">All Products</div>
              <h2 className="text-white text-4xl font-light mb-8">Elevate Your Gallery</h2>

              {/* Category Filters - Displayed horizontally and wrapped */}
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "All Products", active: activeCategory === "All Products" },
                  { name: "Books", active: activeCategory === "Books" },
                  { name: "Mugs", active: activeCategory === "Mugs" },
                  { name: "Costar", active: activeCategory === "Costar" },
                  { name: "Feeds", active: activeCategory === "Feeds" },
                ].map((category) => (
                  <button
                    key={category.name}
                    className={`${
                      category.active 
                        ? "bg-white text-black" 
                        : "border border-white/30 text-white hover:bg-white/10"
                    } px-6 py-2 text-sm rounded-full transition-colors`}
                    onClick={() => setActiveCategory(category.name)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side: Product Grid */}
            <div className="md:w-[60%]">
              <ProductGrid category={activeCategory} />
              
              {/* Shop Now Button */}
              <div className="flex justify-center mt-8">
                <Link
                  href="/shop"
                  className="flex items-center gap-2 border border-white/30 text-white px-6 py-2 text-sm hover:bg-white/10 transition-colors rounded-sm"
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

