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

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    duration: 50
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(heroImages.length);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

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

  // Handle automatic sliding and slide tracking
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
      // Force animation to restart by changing key
      setAnimationKey(prev => prev + 1);
    };

    emblaApi.on('select', onSelect);
    setTotalSlides(emblaApi.scrollSnapList().length);

    // Initial animation
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
              opacity: 0.4,
              width: '50%',
              zIndex: -1,
              bottom: 'auto'
            }}
          ></div>
          <h1 
            key={animationKey}
            className="text-white text-[150px] md:text-[200px] lg:text-[280px] font-dm-serif-display leading-none absolute w-full text-center animate-rise-up"
            style={{ fontFamily: 'DM Serif Display, serif', top: '50%', left: '50%', transform: 'translate(-50%, 50%)' }}
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
            backgroundPosition: "center"
          }}>
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
                          className="object-contain p-4" 
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
                          className="object-contain p-4" 
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
                <div className="grid grid-cols-2 gap-4 mt-[205px]">
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
              <button className="border border-white bg-transparent text-white px-3 py-1.5 text-xs flex items-center gap-1 hover:bg-white/10 transition-colors font-['Roboto_Mono']">
                Shop now
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3536 4.35356C13.5488 4.15829 13.5488 3.84171 13.3536 3.64645L10.1716 0.464468C9.97631 0.269205 9.65973 0.269205 9.46447 0.464468C9.2692 0.65973 9.2692 0.976312 9.46447 1.17157L12.2929 4.00001L9.46447 6.82843C9.2692 7.02369 9.2692 7.34027 9.46447 7.53554C9.65973 7.7308 9.97631 7.7308 10.1716 7.53554L13.3536 4.35356ZM-4.37114e-08 4.5L13 4.5L13 3.5L4.37114e-08 3.5L-4.37114e-08 4.5Z" fill="white"/>
                </svg>
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
        <div className="mb-16">
          <WardrobeSection />
        </div>

        {/* Footer Section */}
        <Footer />
      </div>

      {/* Add custom animation styles */}
      <style jsx global>{`
        @keyframes riseUp {
          0% {
            transform: translate(-50%, 200%);
          }
          100% {
            transform: translate(-50%, 50%);
          }
        }
        
        .animate-rise-up {
          animation: riseUp 2s ease-out forwards;
        }
      `}</style>
    </main>
  );
}

