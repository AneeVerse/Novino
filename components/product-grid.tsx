"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

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
]

// Note: The filter buttons should be in the parent component
// This component only renders the product grid

interface Product {
  id: number | string;
  name?: string;
  title?: string;
  price?: string;
  date?: string;
  role?: string;
  image: string;
  images?: string[];
  category: string;
  categoryId?: string;
}

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  products?: Product[];
  categories?: string[];
  viewAllText?: string;
  showViewAllButton?: boolean;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function ProductGrid({ 
  title = "Elevate Your Gallery", 
  subtitle = "All Products", 
  products: propProducts = products, 
  categories: propCategories = ["All Products", "Books", "Mugs", "Costar", "Feeds"],
  viewAllText = "Discover the collection",
  showViewAllButton = true,
  activeCategory: propActiveCategory,
  onCategoryChange
}: ProductGridProps) {
  // Use internal state only if no external state is provided
  const [internalActiveCategory, setInternalActiveCategory] = useState<string>(propCategories[0]);
  const [hoveredProductId, setHoveredProductId] = useState<number | string | null>(null);
  
  // Use external category state if provided, otherwise use internal
  const activeCategory = propActiveCategory !== undefined ? propActiveCategory : internalActiveCategory;
  
  // Re-sync when categories change
  useEffect(() => {
    // Reset to the first category when categories change
    setInternalActiveCategory(propCategories[0]);
    console.log("Categories changed, resetting to:", propCategories[0]);
  }, [propCategories]);
  
  // Handle category change, update parent if callback is provided
  const handleCategoryChange = (category: string) => {
    console.log("Category clicked:", category);
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      setInternalActiveCategory(category);
    }
  };
  
  // Filter products based on active category with improved category matching
  const filteredProducts = propProducts.filter(product => {
    // Skip filtering if "All Products" or similar is selected
    if (activeCategory === propCategories[0]) return true; 
    // Only match products where category or categoryId matches exactly
    return product.category === activeCategory || product.categoryId === activeCategory;
  });

  const displayProducts = filteredProducts.slice(0, 9);

  return (
    <section className="w-full font-['Roboto_Mono']">
      {/* Hero banner with background image */}
      <div className="relative w-full min-h-[480px] sm:min-h-[560px] lg:min-h-[620px] overflow-hidden ">
        <Image
          src="/images/hero-section/bg03.png"
          alt="Framed artwork gallery wall"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-[#2D2D2D]/95 mix-blend-multiply"></div>
        <div className="absolute inset-x-0 bottom-0 h-44 sm:h-52 bg-gradient-to-b from-transparent via-[#2D2D2D]/70 to-[#2D2D2D]"></div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 py-24 sm:py-32 text-center text-white space-y-6">
          <span className="block text-sm sm:text-base uppercase tracking-[0.8em] text-white/70">{subtitle}</span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.12em]">
            Elevate Your Gallery
          </h2>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-6">
            {propCategories.map((category) => (
              <button
                key={category}
                className={`px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm transition-all duration-200 backdrop-blur ${
                  category === activeCategory
                    ? "bg-white text-black font-semibold shadow-lg shadow-white/20"
                    : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product cards */}
      <div className="relative max-w-[1440px] mx-auto px-6 sm:px-10 -mt-12 sm:-mt-44 pb-16">
        {/* Mobile: Horizontal Scroll */}
        <div className="sm:hidden flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth -mx-6 px-6"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {displayProducts.map((product) => {
            const isHovered = hoveredProductId === product.id;
            const displayImage = isHovered && product.images && product.images[1] 
              ? product.images[1] 
              : product.image;
            
            return (
              <Link 
                href={`/product/${product.id}`} 
                key={product.id} 
                className="group flex-none w-[280px] snap-center"
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <div className="h-[380px] rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:shadow-2xl hover:shadow-black/30">
                  <div className="relative w-full h-full bg-[#1F1F1F] overflow-hidden">
                    <Image
                      key={displayImage}
                      src={displayImage}
                      alt={(product.name || product.title || "Product") as string}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-105"
                      sizes="280px"
                    />
                    {/* Bottom shadow gradient for text visibility */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"></div>
                    
                    {/* Text overlay at bottom - animates on hover */}
                    <div className="absolute inset-x-0 bottom-0 p-5 z-10 transition-all duration-300 group-hover:-translate-y-2">
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-[0.3em] text-white/90 drop-shadow-lg transition-all duration-300">
                          {product.category}
                        </div>
                        <h3 className="text-lg text-white font-medium tracking-wide group-hover:text-[#E5C29F] transition-colors drop-shadow-lg">
                          {product.name || product.title || "Untitled"}
                        </h3>
                        {/* Price - hidden by default, shows on hover */}
                        {(product.price || product.date || product.role) && (
                          <p className="text-sm text-white/80 drop-shadow-lg opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-10 transition-all duration-300">
                            {product.price || product.date || product.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayProducts.map((product) => {
            const isHovered = hoveredProductId === product.id;
            const displayImage = isHovered && product.images && product.images[1] 
              ? product.images[1] 
              : product.image;
            
            return (
              <Link 
                href={`/product/${product.id}`} 
                key={product.id} 
                className="group"
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <div className="h-[480px] rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-white/30 hover:shadow-2xl hover:shadow-black/30">
                  <div className="relative w-full h-full bg-[#1F1F1F] overflow-hidden">
                    <Image
                      key={displayImage}
                      src={displayImage}
                      alt={(product.name || product.title || "Product") as string}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                    />
                    {/* Bottom shadow gradient for text visibility */}
                    <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"></div>
                    
                    {/* Text overlay at bottom - animates on hover */}
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-10 transition-all duration-300 group-hover:-translate-y-3">
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-[0.3em] text-white/90 drop-shadow-lg transition-all duration-300">
                          {product.category}
                        </div>
                        <h3 className="text-lg text-white font-medium tracking-wide group-hover:text-[#E5C29F] transition-colors drop-shadow-lg">
                          {product.name || product.title || "Untitled"}
                        </h3>
                        {/* Price - hidden by default, shows on hover */}
                        {(product.price || product.date || product.role) && (
                          <p className="text-sm text-white/80 drop-shadow-lg opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-10 transition-all duration-300">
                            {product.price || product.date || product.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state for mobile */}
        {displayProducts.length === 0 && (
          <div className="sm:hidden rounded-3xl border border-white/10 backdrop-blur-sm p-12 text-center text-white/80 drop-shadow-lg mx-6">
            No products found in this category yet. Please check back soon.
          </div>
        )}

        {/* Empty state for desktop */}
        {displayProducts.length === 0 && (
          <div className="hidden sm:block rounded-3xl border border-white/10 backdrop-blur-sm p-12 text-center text-white/80 drop-shadow-lg">
            No products found in this category yet. Please check back soon.
          </div>
        )}

        {showViewAllButton && (
          <div className="mt-12 flex justify-center">
            <Link
              href="/artefacts"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all duration-200 text-sm sm:text-base"
            >
              {viewAllText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Hide scrollbar for mobile horizontal scroll */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

