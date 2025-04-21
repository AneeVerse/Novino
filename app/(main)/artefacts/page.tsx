"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import VideoSection from "@/components/video-section"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import TestimonialCollection from "@/components/testimonial-collection"
import Footer from "@/components/footer"
import MasonryGallery from "@/components/masonry-gallery"
import ProductGrid from "@/components/product-grid"
import { useState, useEffect, useRef } from "react"
import useEmblaCarousel from 'embla-carousel-react'

// Hero carousel images
const heroImages = [
  {
    src: "/images/hero-section/bg01.png",
    alt: "Artefacts hero image 1"
  },
  {
    src: "/images/hero-section/bg02.png", 
    alt: "Artefacts hero image 2"
  },
  {
    src: "/images/hero-section/bg03.png",
    alt: "Artefacts hero image 3"
  }
];

// Product data
const products = [
  {
    id: 1,
    name: "ANCIENT VASE",
    price: "$3250",
    image: "/images/mug-black.png",
    category: "Egyptian"
  },
  {
    id: 2,
    name: "STONE STATUE",
    price: "$4980",
    image: "/images/mug-white.png",
    category: "Egyptian"
  },
  {
    id: 3,
    name: "JADE FIGURINE",
    price: "$2870",
    image: "/images/cycle1.png",
    category: "Asian"
  },
  {
    id: 4,
    name: "BRONZE BELL",
    price: "$1850",
    image: "/images/cycle2.png",
    category: "Asian"
  },
  {
    id: 5,
    name: "MEDIEVAL CHALICE",
    price: "$5750",
    image: "/images/notebook-white.png",
    category: "European"
  },
  {
    id: 6,
    name: "ORNATE SHIELD",
    price: "$7820",
    image: "/images/notebook-black.png",
    category: "European"
  }
];

// Categories for the product grid
const categories = ["All Artefacts", "Egyptian", "Asian", "European", "American"];

export default function ArtefactsPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    duration: 50
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(heroImages.length);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [showText, setShowText] = useState(false);

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
      <div className="relative w-full h-[350px]">
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

        {/* ARTEFACTS text overlay */}
        <div className="absolute inset-0 z-20 overflow-hidden" style={{ height: '350px', maxHeight: '350px' }}>
          {/* Semi-transparent light effect behind text */}
          <div 
            className="absolute w-full text-center" 
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, 44%)',
              height: '150px',
              background: '#E8B08A',
              filter: 'blur(60px)',
              opacity: 0.4,
              width: '50%',
              zIndex: -1,
              bottom: 'auto'
            }}
          ></div>
          <h1 
            className={`text-[#FFFFFF] text-[130px] md:text-[200px] lg:text-[260px] font-dm-serif-display leading-none absolute w-full text-center ${showText ? 'animate-rise-up' : 'invisible opacity-0'}`}
            style={{ fontFamily: 'DM Serif Display, serif', top: '3%', left: '50%', transform: 'translate(-50%, 0%)' }}
          >
            ARTEFACTS
          </h1>
        </div>
      </div>

      {/* Clear separation from the hero section with negative margin to prevent overlap */}
      <div className="container mx-auto px-0 mt-4 z-50 relative" style={{ marginTop: '2rem', clear: 'both' }}>
        {/* Product Grid Section */}
        <div className="mb-16 relative z-10 font-['Roboto_Mono']">
          <ProductGrid 
            title="Ancient Civilizations" 
            subtitle="Featured Collection" 
            products={products}
            categories={categories}
            viewAllText="View all artefacts"
          />
        </div>

        {/* DISCOVER EXTRAORDINARY ARTIFACTS Section */}
        <div className="mb-16 relative" style={{ position: 'relative', zIndex: 30 }}>
          <div className="max-w-[2400px] mx-auto">
            <div className="mb-8 sm:mb-16 p-6 rounded" style={{ position: 'relative', zIndex: 30 }}>
              <h2 className="text-white text-[24px] sm:text-[28px] md:text-[38px] font-medium uppercase leading-[1.171875em] mb-4 sm:mb-8 text-center font-['Roboto_Mono']">DISCOVER EXTRAORDINARY ARTIFACTS WITH HISTORICAL SIGNIFICANCE</h2>
              <p className="text-white text-sm sm:text-base leading-normal text-center mx-auto max-w-3xl font-['Roboto_Mono']">Explore our curated collection of rare artifacts with cultural and historical importance from civilizations around the world.</p>
            </div>
          </div>
        </div>

        {/* Gallery Grid - with negative margins to make it wider */}
        <div className="mb-16 relative">
          <MasonryGallery />
        </div>
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