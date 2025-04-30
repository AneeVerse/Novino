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
import { Loader } from '@/components/blog-section'

// Hero carousel images
const heroImages = [
  {
    src: "/images/hero-section/bg01.png",
    alt: "Paintings hero image 1"
  },
  {
    src: "/images/hero-section/bg02.png", 
    alt: "Paintings hero image 2"
  },
  {
    src: "/images/hero-section/bg03.png",
    alt: "Paintings hero image 3"
  }
];

// Categories for the product grid
// const categories = ["All Paintings", "Oil", "Acrylic", "Watercolor", "Mixed Media"];

export default function PaintingsPage() {
  const [activeCategory, setActiveCategory] = useState("All Paintings");
  const [categories, setCategories] = useState<string[]>(["All Paintings"]);
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
  const [categoryMap, setCategoryMap] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        
        // Filter to get only painting categories
        const paintingCategories = data
          .filter((cat: any) => cat.type === 'painting')
          .map((cat: any) => cat.name);
          
        // Build category ID to name mapping
        const catMap: {[key: string]: string} = {};
        data.forEach((cat: any) => {
          if (cat.type === 'painting') {
            const id = cat._id || cat.id;
            if (id) catMap[id] = cat.name;
          }
        });
        setCategoryMap(catMap);
        
        // Always add "All Paintings" as the first option
        setCategories(["All Paintings", ...paintingCategories]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to default categories
        setCategories(["All Paintings", "Oil", "Acrylic", "Watercolor", "Mixed Media"]);
      }
    };
    fetchCategories();
  }, []);
  
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
            category: categoryMap[p.category] || p.category, // Use name from map if available
            categoryId: p.category // Store the category ID/reference
          }));
        setPaintingProducts(filtered);
      } catch (err) {
        console.error('Error fetching painting products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryMap]); // Add categoryMap as dependency to update products when categories load

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
    return <Loader />;
  }
  
  return (
    <main className="relative min-h-screen bg-[#2D2D2D] overflow-x-hidden">
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
            categories={categories}
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

        /* Mobile adjustment - move text down */
        @media (max-width: 767px) { /* Target screens smaller than md (768px) */
          .paintings-hero-text {
            top: 64%; /* Moved much lower */
            letter-spacing: 0.02em; /* Decreased letter spacing */
            font-size: 70px !important; /* Decreased font size */
            width: 95%;
          }
        }
      `}</style>
    </main>
  );
} 