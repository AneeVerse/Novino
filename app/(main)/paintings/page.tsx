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
            className={`text-[#FFFFFF] text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] xl:text-[260px] font-dm-serif-display leading-none absolute w-full text-center ${showText ? 'animate-rise-up' : 'invisible opacity-0'}`}
            style={{ fontFamily: 'DM Serif Display, serif', top: '3%', left: '50%', transform: 'translate(-50%, 0%)' }}
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
      `}</style>
    </main>
  );
} 