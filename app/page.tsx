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
import FeaturedProducts from "@/components/featured-products"
import { useState, useEffect, useCallback, useRef } from "react"
import "@fontsource/dm-serif-display"
import "@fontsource/roboto-mono"
import ProductGrid from "@/components/product-grid"
import Preloader from "@/components/ui/preloader"

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
  const [showText, setShowText] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // State for filtering in the ProductGrid
  const [gridActiveCategory, setGridActiveCategory] = useState("All Products");
  
  // Ref for smooth parallax effect without re-renders
  const heroImageRef = useRef<HTMLDivElement>(null);
  
  // Debug when grid category changes
  useEffect(() => {
    console.log("Grid category changed to:", gridActiveCategory);
  }, [gridActiveCategory]);
  
  // Add states for categories and products
  const [categories, setCategories] = useState<string[]>(["All Products"]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<{[key: string]: string}>({});

  // Fetch categories from new artefact-categories API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/artefact-categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        
        // Extract category names
        const categoryNames = data.map((cat: any) => cat.name);
        
        // Build mapping between category IDs and names
        const catMap: {[key: string]: string} = {};
        data.forEach((cat: any) => {
          const id = cat._id || cat.id;
          if (id) catMap[id] = cat.name;
        });
        setCategoryMap(catMap);
          
        // Always add "All Products" as the first option
        setCategories(["All Products", ...categoryNames]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to default categories
        setCategories(["All Products"]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products from new artefact-categories API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/artefact-categories?t=' + Date.now(), {
          cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch products');
        const categories = await res.json();
        
        // Get ALL products from all categories (filtering handled by ProductGrid)
        const allProducts: Product[] = [];
        categories.forEach((category: any) => {
          if (category.products && Array.isArray(category.products)) {
            category.products.forEach((product: any) => {
              allProducts.push({
                id: product.id,
                name: product.name,
                price: product.basePrice,
                image: product.images?.[0] || '/images/placeholder.png',
                images: product.images || [],
                category: category.name,
                categoryId: category.id || category._id
              });
            });
          }
        });
        
        setProducts(allProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
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

  // Initial load - delay text appearance
  useEffect(() => {
    // Delay showing text on initial load
    const timer = setTimeout(() => {
      setShowText(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Add scroll event listener for parallax effect and text color transition
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      const position = window.scrollY;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollPosition(position);
          
          // Parallax effect - directly manipulate DOM for butter-smooth scrolling
          if (heroImageRef.current) {
            const parallaxValue = position * 0.5;
            heroImageRef.current.style.transform = `translate3d(0, ${parallaxValue}px, 0)`;
          }
          
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
          
          ticking = false;
        });
        
        ticking = true;
      }
    };
    
    // Only add the scroll listener after the initial animation completes
    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      // Initial call to set correct position
      handleScroll();
    }, 1500); // Match this with the rise-up animation duration
    
    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) {
    return <Preloader ariaLabel="Loading Home" />;
  }

  return (
    <main className="relative min-h-screen bg-[#2D2D2D]">
      {/* Hero Section - Full width that extends to the top */}
      <div className="relative w-full h-[600px] md:h-[740px] overflow-hidden">
        {/* Hero Image with Parallax Effect */}
        <div 
          ref={heroImageRef}
          className="absolute inset-0 w-full h-full"
          style={{
            willChange: 'transform',
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          <Image
            src="/images/hero-section/HERO.jpg"
            alt="Novino hero background"
            fill
            className="object-cover"
            priority
            style={{
              transform: 'translate3d(0, 0, 0)'
            }}
          />
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
            className={`novino-hero-text text-7xl sm:text-[160px] md:text-[230px] lg:text-[300px] font-dm-serif-display leading-none absolute w-full text-center ${showText ? 'animate-rise-up' : 'invisible opacity-0'}`}
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
            <div className="mb-8 sm:mb-16 p-6 rounded " style={{ position: 'relative', zIndex: 30 }}>
              <h2 className="text-white text-lg sm:text-[24px] md:text-[38px] font-medium uppercase leading-[1.2em] md:leading-[1.171875em] mb-4 sm:mb-8 text-center font-['Roboto_Mono']">ELEVATE ORDINARY WALLS WITH EXTRAORDINARY GALLERIES</h2>
              <p className="text-white text-xs sm:text-sm md:text-base leading-normal text-center mx-auto max-w-3xl font-['Roboto_Mono']">Explore a world of fashion at StyleLoom, where trends meet affordability. Immerse yourself in the latest styles and seize exclusive promotions.</p>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="mb-16 relative" style={{ position: 'relative', zIndex: 30 }}>
          <FeaturedProducts />
        </div>

        {/* Gallery Grid - with negative margins to make it wider */}
        {/* <div className="mb-16 relative" style={{ overflowX: 'hidden', overflowY: 'visible' }}>
          <MasonryGallery />
        </div> */}

        {/* Product Testimonial Section */}
        {/* <div className="mb-16 relative z-10">
          <ProductTestimonial />
        </div> */}

        {/* Move out of container for full width */}
      </div>

      {/* Product Grid Section */}
      <section className="relative z-10 mt-12 sm:mt-20">
        <ProductGrid 
          key="home-product-grid"
          title="Elevate Your Gallery" 
          subtitle="All Products" 
          products={products}
          categories={categories}
          viewAllText="View all"
          showViewAllButton={true}
          activeCategory={gridActiveCategory}
          onCategoryChange={setGridActiveCategory}
          showOnePerCategoryInAll={true}
        />
      </section>

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
            transform: translate(-50%, 53%);
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
          top: 44%;
          left: 51.5%;
          transform: translate(-50%, 200%); /* Initial position for animation */
          letter-spacing: 0.23em;
        }

        /* Mobile adjustment - move text down, smaller, and slightly left */
        @media (max-width: 767px) { /* Target screens smaller than md (768px) */
          .novino-hero-text {
            top: 78%;
            left: 50%; /* Shift slightly to the left */
            letter-spacing: 0.04em;
            font-size: 88px !important; /* Smaller font size */
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

