"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import VideoSection from "@/components/video-section"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import TestimonialCollection from "@/components/testimonial-collection"
import Footer from "@/components/footer"
import ProductTestimonial from "@/components/product-testimonial"
import MasonryGallery from "@/components/masonry-gallery"
import ProductGrid from "@/components/product-grid"
import { useState, useEffect, useRef } from "react"
import useEmblaCarousel from 'embla-carousel-react'

// Hero carousel images
const heroImages = [
  {
    src: "/images/hero-section/bg01.png",
    alt: "Journal hero image 1"
  },
  {
    src: "/images/hero-section/bg02.png", 
    alt: "Journal hero image 2"
  },
  {
    src: "/images/hero-section/bg03.png",
    alt: "Journal hero image 3"
  }
];

// Article data
const articles = [
  {
    id: 1,
    title: "THE RENAISSANCE OF DIGITAL ART",
    date: "May 15, 2023",
    image: "/images/mug-black.png",
    category: "Digital Art"
  },
  {
    id: 2,
    title: "VISION BEHIND MINIMALISM",
    date: "April 28, 2023",
    image: "/images/mug-white.png",
    category: "Interviews"
  },
  {
    id: 3,
    title: "BUILDING AN ART COLLECTION",
    date: "April 10, 2023",
    image: "/images/cycle1.png",
    category: "Collecting"
  },
  {
    id: 4,
    title: "HISTORY OF ABSTRACT EXPRESSIONISM",
    date: "March 22, 2023",
    image: "/images/cycle2.png",
    category: "History"
  },
  {
    id: 5,
    title: "UPCOMING EXHIBITIONS IN NYC",
    date: "March 5, 2023",
    image: "/images/notebook-white.png",
    category: "Events"
  },
  {
    id: 6,
    title: "COLOR THEORY FOR COLLECTORS",
    date: "February 18, 2023",
    image: "/images/notebook-black.png",
    category: "Collecting"
  }
];

// Categories for the article grid
const categories = ["All Articles", "Digital Art", "Interviews", "Collecting", "History", "Events"];

export default function JournalPage() {
  const [activeCategory, setActiveCategory] = useState("All Articles");
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    duration: 50
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(heroImages.length);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [showText, setShowText] = useState(false);

  // Filter articles based on active category
  const filteredArticles = articles.filter(article => 
    activeCategory === "All Articles" ? true : article.category === activeCategory
  );

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

        {/* JOURNAL text overlay */}
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
            className={`text-[#312F30] text-[80px] md:text-[120px] lg:text-[160px] font-dm-serif-display leading-none absolute w-full text-center ${showText ? 'animate-rise-up' : 'invisible opacity-0'}`}
            style={{ fontFamily: 'DM Serif Display, serif', top: '40%', left: '50%', transform: 'translate(-50%, 0%)' }}
          >
            JOURNAL
          </h1>
        </div>
      </div>

      {/* Clear separation from the hero section with negative margin to prevent overlap */}
      <div className="container mx-auto px-0 mt-4 z-50 relative" style={{ marginTop: '2rem', clear: 'both' }}>
        {/* INSIGHTS & STORIES Section */}
        <div className="mb-16 relative" style={{ position: 'relative', zIndex: 30 }}>
          <div className="max-w-[2400px] mx-auto pl-8">
            <div className="mb-8 sm:mb-16 p-6 rounded bg-[#2D2D2D]" style={{ position: 'relative', zIndex: 30 }}>
              <h2 className="text-white text-[24px] sm:text-[28px] md:text-[38px] font-medium uppercase leading-[1.171875em] mb-4 sm:mb-8 text-center font-['Roboto_Mono']">INSIGHTS, INTERVIEWS, AND STORIES FROM FINE ART</h2>
              <p className="text-white text-sm sm:text-base leading-normal text-center mx-auto max-w-3xl font-['Roboto_Mono']">Explore our journal for in-depth articles, artist interviews, and thought-provoking perspectives on the fascinating world of art.</p>
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

        {/* Articles Grid Section */}
        <div className="mb-16 mt-10 relative z-10 font-['Roboto_Mono']">
          <ProductGrid 
            title="Latest Articles" 
            subtitle="Art Journal" 
            products={articles}
            categories={categories}
            viewAllText="View all articles"
          />
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