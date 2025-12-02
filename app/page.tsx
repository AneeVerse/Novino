"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react"
import "@fontsource/dm-serif-display"
import "@fontsource/roboto-mono"
import Preloader from "@/components/ui/preloader"
import { useArtefactCatalog } from "@/hooks/useArtefactCatalog"

// Eager imports for above-fold content
import FeaturedProducts from "@/components/featured-products"
import ProductGrid from "@/components/product-grid"

// Lazy load below-fold components
const VideoSection = lazy(() => import("@/components/video-section"))
const TestimonialCollection = lazy(() => import("@/components/testimonial-collection"))
const WardrobeSection = lazy(() => import("@/components/wardrobe-section"))
const Footer = lazy(() => import("@/components/footer"))

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

  const {
    products,
    paintingProducts,
    categoryOptions,
    categoryMap,
    loading
  } = useArtefactCatalog()
  const categories = categoryOptions;

  // Filter products based on active category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeCategory === "All Products") return true;

      const mappedName = product.categoryId
        ? categoryMap[product.categoryId]
        : product.category;

      return (
        mappedName === activeCategory ||
        product.category === activeCategory ||
        product.categoryId === activeCategory
      );
    });
  }, [products, activeCategory, categoryMap]);

  // Featured products derived from catalog hook
  const featuredPaintingProducts = useMemo(() => {
    if (paintingProducts.length <= 1) {
      return paintingProducts;
    }

    return [...paintingProducts].sort((a: any, b: any) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [paintingProducts]);

  // Initial load - delay text appearance
  useEffect(() => {
    // Delay showing text on initial load
    const timer = setTimeout(() => {
      setShowText(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Scroll to footer when arriving with hash
  useEffect(() => {
    if (typeof window === "undefined") return;

    const scrollToFooter = () => {
      if (window.location.hash === "#site-footer") {
        window.setTimeout(() => {
          const footerEl = document.getElementById("site-footer");
          if (footerEl) {
            const footerTop = footerEl.getBoundingClientRect().top + window.scrollY;
            const bottomPosition = Math.min(
              footerTop + footerEl.offsetHeight,
              document.body.scrollHeight
            );
            window.scrollTo({ top: bottomPosition, behavior: "smooth" });
          } else {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          }
        }, 150);
      }
    };

    if (!loading) {
      scrollToFooter();
    }

    window.addEventListener("hashchange", scrollToFooter);
    return () => window.removeEventListener("hashchange", scrollToFooter);
  }, [loading]);

  // Add scroll event listener for smooth parallax effect and text color transition
  useEffect(() => {
    let requestAnimationFrameId: number;
    let scrollY = window.scrollY;
    let currentScroll = scrollY;
    let isScrolling = false;

    const handleScroll = () => {
      scrollY = window.scrollY;
      isScrolling = true;
    };

    const update = () => {
      // Skip updates if not scrolling and hero is out of view
      if (!isScrolling && currentScroll > 1200) {
        requestAnimationFrameId = requestAnimationFrame(update);
        return;
      }

      isScrolling = false;

      // Lerp formula: current = current + (target - current) * factor
      const diff = scrollY - currentScroll;

      // Adaptive factor: faster when scrolling up to prevent gaps
      const factor = diff < 0 ? 0.15 : 0.02;

      // Only update if there's a noticeable difference or if we're near the top (active area)
      if (Math.abs(diff) > 0.01 || scrollY < 1000) {
        // If at the very top, snap immediately to avoid any gap
        if (scrollY < 5) {
          currentScroll = 0;
        } else {
          currentScroll += diff * factor;
        }

        // Parallax effect - directly manipulate DOM for butter-smooth scrolling
        // Only apply if within view range to save resources
        if (heroImageRef.current && currentScroll < 1200) {
          // Clamp the parallax value to scrollY to prevent gaps at the top when scrolling up quickly
          const parallaxValue = Math.min(currentScroll * 0.5, scrollY);
          heroImageRef.current.style.transform = `translate3d(0, ${parallaxValue}px, 0)`;
        }

        // Text Color Transition
        // Calculate transition percentage (0 to 100)
        const startChange = 0;   // Start from first scroll
        const endChange = 300;   // End point for full color change
        const scrollRange = endChange - startChange;
        const scrollForText = Math.max(0, currentScroll - startChange);
        const percentage = Math.min(100, (scrollForText / scrollRange) * 100);

        // Apply the background position to control the color transition
        const heroText = document.querySelector('.novino-hero-text') as HTMLElement;
        if (heroText && currentScroll < 800) {
          // This controls the gradient position - changing from 0% (white) to 100% (#312F30)
          heroText.style.backgroundPosition = `0% ${percentage}%`;
        }
      }

      requestAnimationFrameId = requestAnimationFrame(update);
    };

    // Only add the scroll listener after the initial animation completes
    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      update(); // Start loop
    }, 1500); // Match this with the rise-up animation duration

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(requestAnimationFrameId);
    };
  }, []);

  if (loading) {
    return <Preloader ariaLabel="Loading Home" />;
  }

  return (
    <main className="relative min-h-screen bg-[#2D2D2D]">
      {/* Hero Section - Full width that extends to the top */}
      <div className="relative w-full overflow-hidden" style={{ height: 'clamp(100vh, 100vh, 100vh)' }}>
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
            className={`novino-hero-text text-[161px] sm:text-[161px] md:text-[231px] lg:text-[296px] font-dm-serif-display leading-none absolute w-full text-center ${showText ? 'animate-rise-up' : 'invisible opacity-0'}`}
          >
            NOVINO
          </h1>
        </div>

      </div>

      <div className="container mx-auto px-4 md:px-0 mt-4 z-50 relative" style={{ clear: 'both' }}>
        {/* Featured Products Section */}
        <div className="mb-16 mt-20 relative" style={{ position: 'relative', zIndex: 30 }}>
          <FeaturedProducts initialProducts={featuredPaintingProducts} />
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
          title="Bring the Patterns Home"
          subtitle="Choose the design that speaks to you."
          products={products}
          categories={categories}
          viewAllText="See All Products"
          showViewAllButton={true}
          activeCategory={gridActiveCategory}
          onCategoryChange={setGridActiveCategory}
          showOnePerCategoryInAll={true}
        />
      </section>

      {/* Video Section - Full width */}
      {/* <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[730px] bg-[#2D2D2D] mb-16 sm:mb-24 md:mb-32">
        <Suspense fallback={<div className="w-full h-full bg-[#2D2D2D]" />}>
          <VideoSection />
        </Suspense>
      </div> */}

      {/* New container for remaining sections */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 z-10 relative">
        {/* Testimonial Collection */}
        <div className="mb-16">
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <TestimonialCollection />
          </Suspense>
        </div>

        {/* Blog Section */}
        {/* <div className="mb-16">
          <BlogSection />
        </div> */}

        {/* Wardrobe Section */}
        <div className="mb-16">
          <Suspense fallback={<div className="min-h-[200px]" />}>
            <WardrobeSection />
          </Suspense>
        </div>

        {/* Footer Section */}
        <Suspense fallback={<div className="min-h-[300px]" />}>
          <Footer />
        </Suspense>
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

        /* Mobile adjustment - move text down a bit more, smaller */
        @media (max-width: 767px) { /* Target screens smaller than md (768px) */
          .novino-hero-text {
            top: 83%; /* Moved down slightly from 78% */
            left: 50%;
            letter-spacing: 0.04em;
            font-size: 92px !important;
          }
        }

        /* Tablet adjustment - responsive sizing and positioning */
        @media (min-width: 768px) and (max-width: 1023px) { /* Tablet range */
          .novino-hero-text {
            top: 50%; /* Better centered for tablets */
            left: 51%;
            letter-spacing: 0.15em;
            font-size: 180px !important; /* Mid-size between mobile and desktop */
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

