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

// Product data - We'll replace this with API data
// const products = [
//   {
//     id: 1,
//     name: "LIGHTCOOL",
//     price: "$22.5",
//     image: "/images/mug-black.png",
//     category: "Mugs"
//   },
//   ...
// ];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    duration: 50
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(heroImages.length);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [showText, setShowText] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Add states for categories and products
  const [categories, setCategories] = useState<string[]>(["All Products"]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<{[key: string]: string}>({});

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        
        // Build mapping between category IDs and names
        const catMap: {[key: string]: string} = {};
        data.forEach((cat: any) => {
          if (cat.type === 'artefact') {
            const id = cat._id || cat.id;
            if (id) catMap[id] = cat.name;
          }
        });
        setCategoryMap(catMap);
        
        // Get category names for various product types
        const productCategories = data
          .filter((cat: any) => cat.type === 'artefact')
          .map((cat: any) => cat.name);
          
        // Always add "All Products" as the first option
        setCategories(["All Products", ...productCategories]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to default categories
        setCategories(["All Products", "Books", "Mugs", "Costar", "Feeds"]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        
        // Get artefact products
        const artefactProducts = data
          .filter((p: any) => p.type === 'artefact')
          .map((p: any) => ({
            id: p.id || p._id,
            name: p.name,
            price: p.basePrice || p.price || "$0",
            image: p.images?.[0] || p.image || "/images/placeholder.png",
            category: p.category,
            categoryId: p.category // Store original category ID for reference
          }));
        
        setProducts(artefactProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback to hardcoded products if API fails
        setProducts([
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
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on active category
  const filteredProducts = products.filter(product => {
    if (activeCategory === "All Products") return true;
    
    // Match by either category ID or name
    return categoryMap[product.category] === activeCategory || // Match by mapped name
           product.category === activeCategory || // Direct match (rare)
           product.categoryId === activeCategory; // Match by ID
  });

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
      }, 7000); // 7 seconds between slides
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

  // Add scroll event listener for the text color transition
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      
      // Calculate transition percentage (0 to 100)
      // Adjust these values to control when the color change happens
      const startChange = 0;   // Start from first scroll
      const endChange = 300;   // End point for full color change (reduced for faster transition)
      const scrollRange = endChange - startChange;
      const currentScroll = Math.max(0, position - startChange);
      const percentage = Math.min(100, (currentScroll / scrollRange) * 100);
      
      // Apply the background position to control the color transition
      const heroText = document.querySelector('.novino-hero-text') as HTMLElement;
      if (heroText) {
        // This controls the gradient position - changing from 0% (white) to 100% (#312F30)
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

  return (
    <main className="relative min-h-screen bg-[#2D2D2D] overflow-x-hidden">
      {/* Hero Section - Full width that extends to the top */}
      <div className="relative w-full h-[600px] md:h-[730px]">
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
        <div className="absolute inset-0 z-20 overflow-hidden" style={{ height: '100%', maxHeight: '100%' }}>
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
          {/* Updated NOVINO text with custom class for scroll animation */}
          <h1 
            className={`novino-hero-text text-7xl sm:text-[160px] md:text-[230px] lg:text-[330px] font-dm-serif-display leading-none absolute w-full text-center ${showText ? 'animate-rise-up' : 'invisible opacity-0'}`}
          >
            NOVINO
          </h1>
        </div>

      </div>

      {/* Clear separation from the hero section with negative margin to prevent overlap */}
      <div className="container mx-auto px-4 md:px-0 mt-4 z-50 relative" style={{ clear: 'both' }}>
        {/* ELEVATE ORDINARY WALLS Section */}
        <div className="mb-16 relative" style={{ position: 'relative', zIndex: 30 }}>
          <div className="max-w-[2400px] mx-auto px-4 md:pl-8">
            <div className="mb-8 sm:mb-16 p-6 rounded bg-[#2D2D2D]" style={{ position: 'relative', zIndex: 30 }}>
              <h2 className="text-white text-lg sm:text-[24px] md:text-[38px] font-medium uppercase leading-[1.2em] md:leading-[1.171875em] mb-4 sm:mb-8 text-center font-['Roboto_Mono']">ELEVATE ORDINARY WALLS WITH EXTRAORDINARY GALLERIES</h2>
              <p className="text-white text-xs sm:text-sm md:text-base leading-normal text-center mx-auto max-w-3xl font-['Roboto_Mono']">Explore a world of fashion at StyleLoom, where trends meet affordability. Immerse yourself in the latest styles and seize exclusive promotions.</p>
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

            {/* Adjusted flex direction for mobile */}
            <div className="flex flex-col md:flex-row md:gap-8 relative z-10">
              {/* Right side: Product Grid - Change order for mobile */}
              <div className="w-full md:w-1/2 order-2 md:order-2">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p className="text-white">Loading products...</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop grid - hidden on mobile */}
                    <div className="hidden md:grid md:grid-cols-2 md:gap-8">
                      {filteredProducts.slice(0, 2).map((product) => (
                        <Link href={`/product/${product.id}`} key={product.id}>
                          <div className="bg-white w-full max-w-[80%] mx-auto border border-white hover:opacity-95 transition-opacity">
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
                        </Link>
                      ))}
                    </div>
                    {/* Desktop grid - hidden on mobile */}
                    <div className="hidden md:grid md:grid-cols-2 md:gap-8 md:mt-8">
                      {filteredProducts.slice(2, 4).map((product) => (
                        <Link href={`/product/${product.id}`} key={product.id}>
                          <div className="bg-white w-full max-w-[80%] mx-auto border border-white hover:opacity-95 transition-opacity">
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
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Left side: Categories and Title */}
              <div className="w-full md:w-1/2 mb-8 md:mb-0 order-1 md:order-1">
                {/* Adjusted padding for mobile */}
                <div className="px-4 md:px-0 md:pl-10 mt-8 md:mt-0">
                  <div className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2 font-['Roboto_Mono']">All Products</div>
                  <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-light mb-6 sm:mb-8 font-['Roboto_Mono']">Elevate Your Gallery</h2>

                  {/* Category Filters - Displayed horizontally and wrapped */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                    {categories.map((category) => (
                      <button
                        key={category}
                        className={`${
                          activeCategory === category
                            ? "bg-white text-black" 
                            : "border border-white/30 text-white hover:bg-white/10"
                        } px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-full transition-colors font-['Roboto_Mono']`}
                        onClick={() => setActiveCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                {!loading && (
                  <>
                    {/* Desktop grid - hidden on mobile */}
                    <div className="hidden md:grid md:grid-cols-2 md:gap-8 md:mt-[215px] md:pl-10">
                      {filteredProducts.slice(4, 6).map((product) => (
                        <Link href={`/product/${product.id}`} key={product.id}>
                          <div className="bg-white w-full max-w-[85%] mx-auto border border-white hover:opacity-95 transition-opacity">
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
                        </Link>
                      ))}
                    </div>

                    {/* Mobile horizontal scroll (hidden on md and up) - Moved outside the columns */}
                    <div className="w-full md:hidden flex flex-col mt-6 mb-6">
                      <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide px-2 items-start">
                        {/* Display all products in a single row for mobile */}
                        {filteredProducts.map((product) => (
                          <Link href={`/product/${product.id}`} key={`mobile-${product.id}`} className="flex-shrink-0 w-64">
                            <div className="bg-white w-full border border-white hover:opacity-95 transition-opacity">
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
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Shop Now Button */}
            <div className="mt-16 flex justify-center">
              <Link href="/artefacts" className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-white/10 transition-colors text-sm sm:text-base cursor-pointer font-['Roboto_Mono']" style={{ borderRadius: '10px' }}>
                View all
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
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
        .novino-hero-text {
          font-family: 'DM Serif Display', serif;
          /* Desktop styles */
          top: 41%;
          left: 51%;
          transform: translate(-50%, 200%); /* Initial position for animation */
          letter-spacing: 0.15em;
        }

        /* Mobile adjustment - move text down */
        @media (max-width: 767px) { /* Target screens smaller than md (768px) */
          .novino-hero-text {
            top: 77%; /* Moved much lower to match green marking */
            letter-spacing: 0.04em; /* Decreased letter spacing */
            font-size: 105px !important; /* Increased font size */
          }
        }
        
        /* Utility to hide scrollbars for horizontal scrolling */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </main>
  );
}

