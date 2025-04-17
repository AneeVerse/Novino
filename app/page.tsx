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
import "@fontsource/dm-serif-display"

// Hero carousel images
const heroImages = [
  {
    src: "/images/hero-section/bg01.png",
    alt: "Novino hero image 1"
  },
  {
    src: "/images/hero-section/bg02.png", 
    alt: "Novino hero image 2"
  },
  {
    src: "/images/hero-section/bg03.png",
    alt: "Novino hero image 3"
  }
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Auto-rotate hero images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, []);
  
  return (
    <main className="relative min-h-screen bg-[#2D2D2D] overflow-x-hidden">
      {/* Hero Section - Full width that extends to the top */}
      <div className="relative w-full h-[730px]">
        {/* Carousel Images */}
        {heroImages.map((image, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentHeroIndex === index 
                ? 'opacity-100 z-10' 
                : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}

        {/* NOVINO text overlay */}
        <div className="absolute inset-0 z-20">
          {/* Semi-transparent light effect behind text */}
          <div 
            className="absolute w-full text-center" 
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, 44%)',
              height: '270px',
              background: '#E8B08A',
              filter: 'blur(60px)',
              opacity: 0.4,
              width: '50%',
              zIndex: -1,
              bottom: 'auto'
            }}
          ></div>
          <h1 
            className="text-white text-[150px] md:text-[200px] lg:text-[280px] font-dm-serif-display leading-none absolute w-full text-center"
            style={{ fontFamily: 'DM Serif Display, serif', top: '50%', left: '50%', transform: 'translate(-50%, 44%)' }}
          >
            NOVINO
          </h1>
        </div>
      </div>

      {/* Rest of the page content */}
      <div className="container mx-auto px-2 sm:px-3 md:px-[20px] mt-16 z-10 relative">
        {/* ELEVATE ORDINARY WALLS Section */}
        <div className="mb-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-8 sm:mb-16">
              <h2 className="text-white text-[24px] sm:text-[28px] md:text-[38px] font-medium uppercase leading-[1.171875em] mb-4 sm:mb-8 text-center">ELEVATE ORDINARY WALLS WITH EXTRAORDINARY GALLERIES</h2>
              <p className="text-white/60 text-sm sm:text-base leading-normal text-center mx-auto max-w-3xl">Explore a world of fashion at StyleLoom, where trends meet affordability. Immerse yourself in the latest styles and seize exclusive promotions.</p>
            </div>
          </div>
        </div>

        {/* Gallery Grid - with negative margins to make it wider */}
        <div className="mb-16 relative -mx-2 sm:-mx-4 md:-mx-[20px]">
          <MasonryGallery />
        </div>

        {/* Product Testimonial Section */}
        <div className="mb-16 relative z-10">
          <ProductTestimonial />
        </div>

        {/* Product Grid Section */}
        <div className="mb-16 relative z-10">
          <div className="p-6 sm:p-8 md:p-10 relative overflow-hidden" style={{ 
            boxSizing: 'border-box',
            border: '2px dashed #FFFFFF',
            borderRadius: '20px',
            borderSpacing: '8px'
          }}>
            <div className="flex flex-col md:flex-row md:gap-8 lg:gap-10 relative z-10">
              {/* Left side: Categories and Title */}
              <div className="w-full md:w-[30%] mb-8 md:mb-0">
                <div className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">All Products</div>
                <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-light mb-6 sm:mb-8">Elevate Your Gallery</h2>

                {/* Category Filters - Displayed horizontally and wrapped */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
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
                      } px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-full transition-colors mb-2`}
                      onClick={() => setActiveCategory(category.name)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right side: Product Grid */}
              <div className="w-full md:w-[70%]">
                <ProductGrid category={activeCategory} />
              </div>
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="mb-16">
          <VideoSection />
        </div>

        {/* Wardrobe Section */}
        <div className="mb-16">
          <WardrobeSection />
        </div>

        {/* Blog Section */}
        <div className="mb-16">
          <BlogSection />
        </div>

        {/* Testimonial Collection */}
        <div className="mb-16">
          <TestimonialCollection />
        </div>

        {/* Footer Section */}
        <Footer />
      </div>
    </main>
  );
}

