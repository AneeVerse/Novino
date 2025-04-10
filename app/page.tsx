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
import { useState, useEffect } from "react"

// Hero carousel images
const heroImages = [
  {
    src: "/images/hero-bg.png",
    alt: "Gallery wall with abstract art"
  },
  {
    src: "/images/hero-2.png", 
    alt: "Colorful painting of a couple walking at night"
  },
  {
    src: "/images/hero3.png",
    alt: "Abstract geometric painting with orange and blue"
  }
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isHeroTransitioning, setIsHeroTransitioning] = useState(false);
  
  // Hero carousel navigation
  const nextHeroImage = () => {
    if (!isHeroTransitioning) {
      setIsHeroTransitioning(true);
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
      setTimeout(() => setIsHeroTransitioning(false), 500);
    }
  };

  const prevHeroImage = () => {
    if (!isHeroTransitioning) {
      setIsHeroTransitioning(true);
      setCurrentHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
      setTimeout(() => setIsHeroTransitioning(false), 500);
    }
  };
  
  return (
    <main className="relative min-h-screen bg-transparent overflow-x-hidden">
      {/* Background overlay with base color only */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base background color */}
        <div className="absolute inset-0 bg-[#2D2D2D]"></div>
        
        {/* Left side gradient effects with reduced opacity */}
        <div className="absolute left-0 top-0 w-full max-w-full h-full opacity-30">
          <div className="absolute left-0 top-[20%] w-full max-w-[80%] h-[80%] bg-gradient-to-r from-white/30 via-white/15 to-transparent blur-[100px]"></div>
          <div className="absolute left-[10%] top-[40%] w-full max-w-[60%] h-[60%] bg-gradient-to-r from-white/20 via-white/10 to-transparent blur-[120px]"></div>
          <div className="absolute left-0 bottom-[10%] w-full max-w-[70%] h-[50%] bg-gradient-to-r from-white/25 via-white/12 to-transparent blur-[150px]"></div>
        </div>
        
        {/* Right side gradient effects - extended higher up with increased intensity */}
        <div className="absolute right-0 top-0 w-full max-w-full h-full opacity-50">
          {/* Navbar-level gradient with higher intensity */}
          <div className="absolute right-0 -top-[5%] w-full max-w-[100%] h-[30%] bg-gradient-to-l from-white/50 via-white/25 to-transparent blur-[80px]"></div>
          <div className="absolute right-0 top-0 w-full max-w-[90%] h-[40%] bg-gradient-to-l from-white/40 via-white/20 to-transparent blur-[120px]"></div>
          <div className="absolute right-0 top-[10%] w-full max-w-[80%] h-[60%] bg-gradient-to-l from-white/30 via-white/15 to-transparent blur-[100px]"></div>
          <div className="absolute right-[5%] top-[30%] w-full max-w-[60%] h-[60%] bg-gradient-to-l from-white/20 via-white/10 to-transparent blur-[120px]"></div>
          <div className="absolute right-0 bottom-[10%] w-full max-w-[70%] h-[50%] bg-gradient-to-l from-white/25 via-white/12 to-transparent blur-[150px]"></div>
        </div>
      </div>

      {/* Top padding for navbar spacing */}
      <div className="pt-4"></div>

      {/* Combined Container with border for Hero and Gallery */}
      <div className="mx-4 md:mx-6 mt-24 mb-8 z-10 relative rounded-[20px] overflow-visible">
        <div className="overflow-hidden rounded-[20px]">
          {/* Hero Section */}
          <div className="relative">
            <div className="relative w-full h-[580px] md:h-[680px]">
              {/* Carousel Images */}
              {heroImages.map((image, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    currentHeroIndex === index 
                      ? 'opacity-100 z-10' 
                      : 'opacity-0 z-0'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover rounded-[20px]"
                    priority={index === 0}
                  />
                </div>
              ))}

              {/* Navigation Controls - Positioned at top right */}
              <div className="absolute top-6 right-6 flex flex-col space-y-4 z-50">
                {/* Right Arrow (for next) */}
                <button 
                  onClick={nextHeroImage}
                  className="w-12 h-12 flex items-center justify-center relative cursor-pointer hover:bg-black/30 rounded-full transition-all outline-none"
                  aria-label="Next image"
                  type="button"
                  style={{ zIndex: 9999 }}
                >
                  <Image
                    src="/images/Arrow Right.png"
                    alt="Next"
                    width={24}
                    height={24}
                    style={{ pointerEvents: 'none' }}
                  />
                </button>
                
                {/* Dots indicators - visible but styling matches Figma */}
                <div className="flex flex-col space-y-3 items-center py-2">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentHeroIndex === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
                      }`}
                      onClick={() => {
                        if (!isHeroTransitioning) {
                          setIsHeroTransitioning(true);
                          setCurrentHeroIndex(index);
                          setTimeout(() => setIsHeroTransitioning(false), 500);
                        }
                      }}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Left Arrow (for previous) */}
                <button 
                  onClick={prevHeroImage}
                  className="w-12 h-12 flex items-center justify-center relative cursor-pointer hover:bg-black/30 rounded-full transition-all outline-none"
                  aria-label="Previous image"
                  type="button"
                  style={{ zIndex: 9999 }}
                >
                  <Image
                    src="/images/Arrow Left.png"
                    alt="Previous"
                    width={24}
                    height={24}
                    style={{ pointerEvents: 'none' }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 z-50 pointer-events-none">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1330 1179" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
            <rect x="2" y="2" width="1326" height="1175" rx="19" stroke="white" strokeWidth="2" strokeDasharray="16 4" strokeOpacity="1" style={{ mixBlendMode: "normal" }}/>
          </svg>
        </div>

        {/* Remove the space div and position button between sections */}
        {/* Create space between hero and ELEVATE section for button */}
        <div className="relative h-16 -mt-8"> 
          {/* Shop Now button positioned between sections */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-[70%] z-[100]">
            <Link 
              href="/shop" 
              className="box-border flex flex-row items-center justify-center p-[18px_24px] gap-1 isolate w-[160px] h-[63px] bg-white border border-dashed border-[#404040] rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
            >
              <span className="text-black text-base font-normal">Shop Now</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                <path d="M14 16L18 12M18 12L14 8M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* ELEVATE ORDINARY WALLS Section with transparent background */}
        <div className="p-6 md:p-10">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-16">
              <h1 className="text-white text-[28px] md:text-[38px] font-medium font-roboto uppercase leading-[1.171875em] mb-8 text-center">ELEVATE ORDINARY WALLS WITH EXTRAORDINARY GALLERIES</h1>
              <p className="text-white/60 text-base leading-normal text-center mx-auto max-w-3xl">Explore a world of fashion at StyleLoom, where trends meet affordability. Immerse yourself in the latest styles and seize exclusive promotions.</p>
            </div>
          </div>
        </div>

        {/* Gallery Grid - Now inside the border */}
        <div className="p-6 md:p-10">
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

