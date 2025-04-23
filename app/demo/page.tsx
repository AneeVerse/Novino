"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, X, Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import VideoSection from "@/components/video-section"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import TestimonialCollection from "@/components/testimonial-collection"
import Footer from "@/components/footer"
import ProductTestimonial from "@/components/product-testimonial"
import MasonryGallery from "@/components/masonry-gallery"
import { useState, useEffect, useCallback, useRef } from "react"
import useEmblaCarousel from 'embla-carousel-react'
import "@fontsource/dm-serif-display"
import "@fontsource/roboto-mono"

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

export default function DemoPage() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    duration: 50
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(heroImages.length);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [showText, setShowText] = useState(false);

  // Filter products based on active category
  const filteredProducts = products.filter(product => 
    activeCategory === "All Products" ? true : product.category === activeCategory
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Initial load - delay text appearance
  useEffect(() => {
    // Delay showing text on initial load
    const timer = setTimeout(() => {
      setShowText(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle automatic sliding and slide tracking
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
      // No text animation on slide change
    };

    emblaApi.on('select', onSelect);
    setTotalSlides(emblaApi.scrollSnapList().length);

    // Initial selection
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Setup autoplay
  useEffect(() => {
    if (!emblaApi) return;

    const startAutoplay = () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
      autoplayRef.current = setTimeout(() => {
        emblaApi.scrollNext();
      }, 10000); // 10 seconds between slides
    };

    // Start autoplay
    startAutoplay();

    // Reset on slide change
    emblaApi.on('select', startAutoplay);
    emblaApi.on('pointerDown', () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    });
    emblaApi.on('pointerUp', startAutoplay);

    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
      emblaApi.off('select', startAutoplay);
      emblaApi.off('pointerDown', () => {});
      emblaApi.off('pointerUp', startAutoplay);
    };
  }, [emblaApi]);
  
  return (
    <main className="relative min-h-screen bg-[#2D2D2D] overflow-x-hidden">
      {/* Hero Section - Full width that extends to the top */}
      <div className="relative w-full h-[730px]">
        {/* Embla Carousel */}
        <div className="overflow-hidden w-full h-full" ref={emblaRef}>
          <div className="flex h-full">
            {heroImages.map((image, index) => (
              <div 
                key={index}
                className="relative flex-[0_0_100%] min-w-0 h-full"
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
          </div>
        </div>

        {/* NOVINO text overlay - IMPORTANT: limit its position to stay above the hero section only */}
        <div className="absolute inset-0 z-20 overflow-hidden" style={{ height: '730px', maxHeight: '730px' }}>
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
              opacity: 0.6,
              width: '100%',
              zIndex: -1,
              bottom: 'auto'
            }}
          ></div>
          <h1 
            className={`text-[#312F30] text-[160px] md:text-[230px] lg:text-[330px] font-dm-serif-display leading-none absolute w-full text-center ${showText ? 'animate-rise-up' : 'invisible opacity-0'}`}
            style={{ fontFamily: 'DM Serif Display, serif', top: '41%', left: '51%', transform: 'translate(-50%, 200%)', letterSpacing: '0.15em' }}
          >
            NOVINO
          </h1>
        </div>

      </div>

      {/* Clear separation from the hero section with negative margin to prevent overlap */}
      <div className="container mx-auto px-0 mt-4 z-50 relative" style={{ marginTop: '2rem', clear: 'both' }}>
        {/* ELEVATE ORDINARY WALLS Section */}
        <div className="mb-16 relative" style={{ position: 'relative', zIndex: 30 }}>
          <div className="max-w-[2400px] mx-auto pl-8">
            <div className="mb-8 sm:mb-16 p-6 rounded bg-[#2D2D2D]" style={{ position: 'relative', zIndex: 30 }}>
              <h2 className="text-white text-[24px] sm:text-[28px] md:text-[38px] font-medium uppercase leading-[1.171875em] mb-4 sm:mb-8 text-center font-['Roboto_Mono']">ELEVATE ORDINARY WALLS WITH EXTRAORDINARY GALLERIES</h2>
              <p className="text-white text-sm sm:text-base leading-normal text-center mx-auto max-w-3xl font-['Roboto_Mono']">Explore a world of fashion at StyleLoom, where trends meet affordability. Immerse yourself in the latest styles and seize exclusive promotions.</p>
            </div>
          </div>
        </div>

        {/* Gallery Grid - with negative margins to make it wider */}
        <div className="mb-16 relative">
          <MasonryGallery />
        </div>

        {/* Product Testimonial Section */}
        <div className="mb-16 relative z-10">
          <ProductTestimonial />
        </div>

        {/* Product Grid Section */}
        <div className="mb-16 relative z-10 font-['Roboto_Mono']">
          <div className="p-8 relative overflow-hidden max-w-[2400px] mx-auto" style={{ 
            backgroundImage: "url('/Container (2).png')",
            backgroundSize: "100% 100%", 
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            overflow: "visible"
          }}>
            {/* Bottom right overlay */}
            <div className="absolute bottom-[-90%] -right-[850px] w-[2000px] h-[220%] pointer-events-none" style={{
              zIndex: 20
            }}>
              <Image 
                src="/Ellipse 5.png"
                alt="Bottom right overlay effect"
                fill
                style={{ objectFit: 'contain', opacity: 0.8 }}
                priority
                className="mix-blend-screen"
              />
            </div>

            <div className="flex flex-col md:flex-row md:gap-8 relative z-10">
              {/* Right side: Product Grid (Moved up first to be displayed first) */}
              <div className="w-full md:w-1/2 order-1 md:order-2">
                <div className="grid grid-cols-2 gap-8">
                  {filteredProducts.slice(0, 2).map((product) => (
                    <div key={product.id} className="bg-white w-full max-w-[80%] mx-auto border border-white">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className={`object-contain ${product.category === "Mugs" ? "p-0 scale-125" : "p-4"}`}
                          style={product.category === "Mugs" ? { transform: 'scale(1.25)' } : {}}
                        />
                      </div>
                      <div className="p-4 bg-[#333333]">
                        <div className="text-white text-xs uppercase font-medium font-['Roboto_Mono']">{product.name}</div>
                        <div className="text-white text-sm font-medium mt-1 font-['Roboto_Mono']">{product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-8 mt-8">
                  {filteredProducts.slice(2, 4).map((product) => (
                    <div key={product.id} className="bg-white w-full max-w-[80%] mx-auto border border-white">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className={`object-contain ${product.category === "Mugs" ? "p-0 scale-125" : "p-4"}`}
                          style={product.category === "Mugs" ? { transform: 'scale(1.25)' } : {}}
                        />
                      </div>
                      <div className="p-4 bg-[#333333]">
                        <div className="text-white text-xs uppercase font-medium font-['Roboto_Mono']">{product.name}</div>
                        <div className="text-white text-sm font-medium mt-1 font-['Roboto_Mono']">{product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Left side: Categories and Title */}
              <div className="w-full md:w-1/2 mb-8 md:mb-0 order-2 md:order-1">
                <div className="pl-10">
                  <div className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2 font-['Roboto_Mono']">All Products</div>
                  <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-light mb-6 sm:mb-8 font-['Roboto_Mono']">Elevate Your Gallery</h2>

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
                        } px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-full transition-colors font-['Roboto_Mono']`}
                        onClick={() => setActiveCategory(category.name)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Two cards below filter on left side - now horizontal */}
                {/* To move cards UP/DOWN: adjust mt-[230px] value
                    To change card size: adjust max-w-[90%] value (larger % = bigger cards) */}
                <div className="grid grid-cols-2 gap-8 mt-[215px] pl-10">
                  {filteredProducts.slice(4, 6).map((product) => (
                    <div key={product.id} className="bg-white w-full max-w-[85%] mx-auto border border-white">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className={`object-contain ${product.category === "Mugs" ? "p-0 scale-125" : "p-4"}`}
                          style={product.category === "Mugs" ? { transform: 'scale(1.25)' } : {}}
                        />
                      </div>
                      <div className="p-4 bg-[#333333]">
                        <div className="text-white text-xs uppercase font-medium font-['Roboto_Mono']">{product.name}</div>
                        <div className="text-white text-sm font-medium mt-1 font-['Roboto_Mono']">{product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Shop Now Button */}
            <div className="mt-16 flex justify-center">
              <button className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-white/10 transition-colors text-sm sm:text-base cursor-pointer font-['Roboto_Mono']" style={{ borderRadius: '10px' }}>
                View all
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Move out of container for full width */}
      </div>

      {/* Video Section - Full width */}
      <div className="relative w-full h-[730px] bg-[#2D2D2D] mb-32">
        <VideoSection />
      </div>

      {/* New container for remaining sections */}
      <div className="container mx-auto px-0 z-10 relative">
        {/* Testimonial Collection */}
        <div className="mb-16">
          <TestimonialCollection />
        </div>

        {/* Blog Section */}
        <div className="mb-16">
          <BlogSection />
        </div>

        {/* Wardrobe Section */}
        <div className="relative mx-2 mb-16 overflow-hidden rounded-3xl max-w-[2400px]">
          {/* Full background image */}
          <div className="relative w-full h-[300px]">
            <Image 
              src="/images/wardrobe/b1 (1).png" 
              alt="Wardrobe background" 
              fill 
              className="object-cover"
              style={{
                objectPosition: '-200px center',
                transform: 'scale(1)',
              }}
              priority
            />
            
            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col md:flex-row items-center p-8 md:p-12">
              {/* Left content section */}
              <div className="md:w-3/5 z-10">
                <h2 className="text-black text-3xl md:text-4xl font-bold mb-4">ELEVATE YOUR WARDROBE</h2>
                <p className="text-black text-base md:text-lg max-w-2xl">
                  Don't miss out – experience the epitome of fashion by clicking 'Buy Now' and embrace a world of chic elegance delivered to your doorstep. Your style journey begins here.
                </p>
              </div>

              {/* Button section - aligned with circle */}
              <div className="md:absolute md:right-32 md:top-1/2 md:-translate-y-1/2 mt-6 md:mt-0 z-10">
                <Link
                  href="/shop"
                  className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  Shop Now
                  <span className="inline-block transform rotate-45">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <Footer />
      </div>

      {/* Add custom animation styles */}
      <style jsx global>{`
        @keyframes riseUp {
          0% {
            transform: translate(-50%, 200%);
            visibility: visible;
            opacity: 1;
          }
          100% {
            transform: translate(-50%, 50%);
            visibility: visible;
            opacity: 1;
          }
        }
        
        .animate-rise-up {
          animation: riseUp 2s ease-out forwards;
        }
      `}</style>
    </main>
  );
} 