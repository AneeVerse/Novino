"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import VideoSection from "@/components/video-section"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import TestimonialCollection from "@/components/testimonial-collection"
import Footer from "@/components/footer"
import PaintingProductGrid from "@/components/painting-product-grid"
import { useState, useEffect, useRef } from "react"
import useEmblaCarousel from 'embla-carousel-react'
import Preloader from "@/components/ui/preloader"

// Hero carousel images
const heroImages = [
  {
    src: "/images/hero-section/AKV_2111 (Custom).jpg",
    alt: "Paintings hero image 1"
  },
  {
    src: "/images/hero-section/AKV_2113 (Custom).jpg", 
    alt: "Paintings hero image 2"
  },
  {
    src: "/images/hero-section/AKV_2112 (Custom).jpg",
    alt: "Paintings hero image 3"
  },
  {
    src: "/images/hero-section/HERO.jpg",
    alt: "Paintings hero image 4"
  }
];

// Categories for the product grid
// const categories = ["All Paintings", "Oil", "Acrylic", "Watercolor", "Mixed Media"];

export default function PaintingsPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    duration: 50
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(heroImages.length);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [showText, setShowText] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // State for dynamic painting products
  interface SimpleProduct {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
    categoryId?: string;
  }
  const [paintingProducts, setPaintingProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch painting products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        const filtered = data
          .filter((p: any) => p.type === 'painting')
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.basePrice || p.price,
            image: p.images?.[0] || p.image,
            category: p.category,
            categoryId: p.category
          }));
        setPaintingProducts(filtered);
      } catch (err) {
        console.error('Error fetching painting products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Initial load - delay text appearance
  useEffect(() => {
    // Delay showing text on initial load
    const timer = setTimeout(() => {
      setShowText(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Add scroll event listener for the text color transition
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      // Calculate transition percentage (0 to 100)
      const startChange = 0;
      const endChange = 300;
      const scrollRange = endChange - startChange;
      const currentScroll = Math.max(0, position - startChange);
      const percentage = Math.min(100, (currentScroll / scrollRange) * 100);
      // Apply the background position to control the color transition
      const heroText = document.querySelector('.paintings-hero-text') as HTMLElement;
      if (heroText) {
        heroText.style.backgroundPosition = `0% ${percentage}%`;
      }
    };
    // Only add the scroll listener after the initial animation completes
    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScroll);
      // Initial call to set correct position
      handleScroll();
    }, 1500); // Match this with the rise-up animation duration
    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
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
  
  if (loading) {
    return <Preloader ariaLabel="Loading Paintings" />;
  }
  
  return (
    <main className="relative min-h-screen bg-[#2D2D2D]">
      {/* Hero Section - Full width that extends to the top */}
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px]">
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

        {/* PAINTINGS text overlay */}
        <div className="absolute inset-0 z-20 overflow-hidden h-full">
          {/* Semi-transparent light effect behind text */}
          <div 
            className="absolute w-3/4 sm:w-1/2 text-center" 
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, 44%)',
              height: '100px',
              background: '#E8B08A',
              filter: 'blur(60px)',
              opacity: 0.4,
              zIndex: -1,
              bottom: 'auto'
            }}
          ></div>
          <h1 
            className={`paintings-hero-text text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] xl:text-[260px] font-dm-serif-display leading-none absolute w-full text-center ${showText ? 'animate-rise-up' : 'invisible opacity-0'}`}
          >
            PAINTINGS
          </h1>
        </div>
      </div>

      {/* Container for main content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 mt-4 z-50 relative">
        {/* Product Grid Section */}
        <div className="mb-16 relative z-10 font-['Roboto_Mono']">
          <PaintingProductGrid 
            title="Masterpiece Collection" 
            subtitle="Featured Collection" 
            products={paintingProducts}
            viewAllText="View all paintings"
          />
        </div>
      </div>

      {/* Video Section - Full width */}
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[730px] bg-[#2D2D2D] mb-16 sm:mb-24 md:mb-32">
        <VideoSection />
      </div>

      {/* New container for remaining sections */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 z-10 relative">
        {/* Testimonial Collection */}
        <div className="mb-16">
          <TestimonialCollection />
        </div>

        {/* Blog Section */}
        {/* <div className="mb-16">
          <BlogSection />
        </div> */}

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

        /* Add styles for the hero text */
        .paintings-hero-text {
          font-family: 'DM Serif Display', serif;
          /* Desktop styles */
          top: 2%;
          left: 50%;
          transform: translate(-50%, 200%); /* Initial position for animation */
          letter-spacing: 0.05em;
          color: transparent;
          background-image: linear-gradient(to bottom, white 0%, white 50%, #312F30 50%, #312F30 100%);
          background-size: 100% 200%;
          background-position: 0% 0%;
          background-clip: text;
          -webkit-background-clip: text;
          transition: background-position 0.2s ease-out;
          width: 90%;
        }

        /* Mobile adjustment - move text down, smaller, and slightly left */
        @media (max-width: 767px) { /* Target screens smaller than md (768px) */
          .paintings-hero-text {
            top: 68%;
            left: 50%; /* Shift slightly to the left */
            letter-spacing: 0.04em;
            font-size: 60px !important; /* Smaller font size */
            width: 95%;
          }
        }
      `}</style>
    </main>
  );
} 