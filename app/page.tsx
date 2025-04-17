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

// Product data
const products = [
  {
    id: 1,
    name: "LIGHTCOOL",
    price: "$22.5",
    image: "/images/mug-black.png",
    category: "Mugs"
  },
  {
    id: 2,
    name: "LIGHTCOOL",
    price: "$22.5",
    image: "/images/mug-white.png",
    category: "Mugs"
  },
  {
    id: 3,
    name: "CYCLEWING",
    price: "$35",
    image: "/images/cycle1.png",
    category: "Feeds"
  },
  {
    id: 4,
    name: "VELOCITY",
    price: "$32",
    image: "/images/cycle2.png",
    category: "Feeds"
  },
  {
    id: 5,
    name: "CLASSWING",
    price: "$20",
    image: "/images/notebook-white.png",
    category: "Books"
  },
  {
    id: 6,
    name: "HOLOCANE",
    price: "$23",
    image: "/images/notebook-black.png",
    category: "Books"
  }
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Filter products based on active category
  const filteredProducts = products.filter(product => 
    activeCategory === "All Products" ? true : product.category === activeCategory
  );

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
          <div className="max-w-[1200px] mx-auto pl-8">
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
          <div className="p-8 relative overflow-hidden" style={{ 
            boxSizing: 'border-box',
            border: '2px dashed #FFFFFF',
            borderRadius: '20px',
            borderSpacing: '8px'
          }}>
            <div className="flex flex-col md:flex-row md:gap-8 relative z-10">
              {/* Left side: Categories and Title */}
              <div className="w-full md:w-1/2 mb-8 md:mb-0">
                <div className="pl-10">
                  <div className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">All Products</div>
                  <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-light mb-6 sm:mb-8">Elevate Your Gallery</h2>

                  {/* Category Filters - Displayed horizontally and wrapped */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
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
                        } px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-full transition-colors`}
                        onClick={() => setActiveCategory(category.name)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Two cards below filter on left side - now horizontal */}
                <div className="grid grid-cols-2 gap-4 mt-[205px]">
                  {filteredProducts.slice(0, 2).map((product) => (
                    <div key={product.id} className="bg-white w-full max-w-[80%] mx-auto border border-white">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-4" 
                        />
                      </div>
                      <div className="p-4 bg-[#333333]">
                        <div className="text-white text-xs uppercase font-medium">{product.name}</div>
                        <div className="text-white text-sm font-medium mt-1">{product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side: Product Grid */}
              <div className="w-full md:w-1/2">
                <div className="grid grid-cols-2 gap-8">
                  {filteredProducts.slice(2, 4).map((product) => (
                    <div key={product.id} className="bg-white w-full max-w-[80%] mx-auto border border-white">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-4" 
                        />
                      </div>
                      <div className="p-4 bg-[#333333]">
                        <div className="text-white text-xs uppercase font-medium">{product.name}</div>
                        <div className="text-white text-sm font-medium mt-1">{product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-8 mt-8">
                  {filteredProducts.slice(4, 6).map((product) => (
                    <div key={product.id} className="bg-white w-full max-w-[80%] mx-auto border border-white">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-4" 
                        />
                      </div>
                      <div className="p-4 bg-[#333333]">
                        <div className="text-white text-xs uppercase font-medium">{product.name}</div>
                        <div className="text-white text-sm font-medium mt-1">{product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Shop Now Button */}
            <div className="mt-6 flex justify-center">
              <button className="border border-white bg-transparent text-white px-3 py-1.5 text-xs flex items-center gap-1 hover:bg-white/10 transition-colors">
                Shop now
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3536 4.35356C13.5488 4.15829 13.5488 3.84171 13.3536 3.64645L10.1716 0.464468C9.97631 0.269205 9.65973 0.269205 9.46447 0.464468C9.2692 0.65973 9.2692 0.976312 9.46447 1.17157L12.2929 4.00001L9.46447 6.82843C9.2692 7.02369 9.2692 7.34027 9.46447 7.53554C9.65973 7.7308 9.97631 7.7308 10.1716 7.53554L13.3536 4.35356ZM-4.37114e-08 4.5L13 4.5L13 3.5L4.37114e-08 3.5L-4.37114e-08 4.5Z" fill="white"/>
                </svg>
              </button>
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

