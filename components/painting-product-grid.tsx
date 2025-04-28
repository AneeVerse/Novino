"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import React from "react"
import productData from "@/public/data/painting-products.json"
import Link from "next/link"

interface Product {
  id: string | number;
  name?: string;
  title?: string;
  price?: string;
  date?: string;
  role?: string;
  image: string;
  category: string;
  categoryId?: string;
  height?: number;
}

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  products?: Product[];
  categories?: string[];
  viewAllText?: string;
}

export default function ProductGrid({ 
  title = "Elevate Your Gallery", 
  subtitle = "All Products", 
  products: propProducts = productData, 
  categories: propCategories = ["All Paintings", "Oil", "Acrylic", "Watercolor", "Mixed Media"],
  viewAllText = "View all" 
}: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All Paintings");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Simple direct filtering approach with improved category matching
  const filteredProducts = React.useMemo(() => {
    console.log("FILTERING - Active Category:", activeCategory);
    console.log("FILTERING - Products before filter:", propProducts);
    
    // For categories other than "All Paintings", strictly filter by category
    if (activeCategory !== "All Paintings") {
      const filtered = propProducts.filter(product => {
        // Match either by category name or category ID
        return product.category === activeCategory || 
               product.categoryId === activeCategory;
      });
      
      // Sort the filtered products by id to ensure consistent order
      filtered.sort((a, b) => Number(a.id) - Number(b.id));
      
      console.log(`FILTERING - Found ${filtered.length} products in category "${activeCategory}":`, filtered);
      return filtered;
    }
    
    // For "All Paintings", return all products but ensure no duplicate images
    const uniqueProducts: Product[] = [];
    const imageSet = new Set<string>();
    
    propProducts.forEach(product => {
      if (!imageSet.has(product.image)) {
        imageSet.add(product.image);
        uniqueProducts.push(product);
      }
    });
    
    console.log(`FILTERING - Found ${uniqueProducts.length} unique products for "All Paintings"`, uniqueProducts);
    return uniqueProducts;
  }, [propProducts, activeCategory]);

  useEffect(() => {
    console.log("COMPONENT - Active Category changed to:", activeCategory);
    console.log("COMPONENT - Filtered Products:", filteredProducts);
  }, [activeCategory, filteredProducts]);

  // Function to determine if product should be displayed full-width
  const isWideProduct = (product: Product, index: number): boolean => {
    // ONLY product with ID 3 (URBAN CANVAS) should be wide
    // And product with ID 8 (GEOMETRIC HARMONY)
    if (Number(product.id) === 3 || Number(product.id) === 8) return true;
    
    // Only use height if it's significantly large
    if (product.height && product.height > 1.4) return true;
    
    // No more automatic wide images based on position
    return false;
  }

  // Organize products for desktop view
  const organizedProducts = React.useMemo(() => {
    // Result will contain either single products (wide/full-width) or pairs of products (side-by-side)
    const result: { type: 'single' | 'pair'; products: Product[] }[] = [];
    let currentPair: Product[] = [];
    
    console.log("Organizing products:", filteredProducts);
    
    filteredProducts.forEach((product, index) => {
      const isWide = isWideProduct(product, index);
      console.log(`Product ${product.id} (${product.name}): isWide = ${isWide}, height = ${product.height}`);
      
      if (isWide) {
        // If we have products waiting in the pair, add them first
        if (currentPair.length > 0) {
          result.push({ type: 'pair', products: [...currentPair] });
          currentPair = [];
        }
        
        // Add the wide product as a single item
        result.push({ type: 'single', products: [product] });
      } else {
        // Add to the current pair
        currentPair.push(product);
        
        // If we have 2 products in the pair, add them to result
        if (currentPair.length === 2) {
          result.push({ type: 'pair', products: [...currentPair] });
          currentPair = [];
        }
      }
    });
    
    // Add any remaining products in the pair
    if (currentPair.length > 0) {
      result.push({ type: 'pair', products: [...currentPair] });
    }
    
    console.log("Organized result:", result);
    return result;
  }, [filteredProducts]);

  return (
    <div className="py-8 sm:pt-12 sm:pb-16 px-4 sm:px-6 relative overflow-visible max-w-[2400px] mx-auto font-['Roboto_Mono'] min-h-[600px] sm:min-h-[800px]" style={{ 
      backgroundImage: activeCategory === "All Paintings" 
        ? "url('/paint-product-all-border.png')" 
        : "url('/Container (2).png')",
      backgroundSize: "100% 100%", 
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center"
    }}>
      {/* Bottom right overlay */}
      <div className="absolute -bottom-[-30%] -right-[-650px] w-[1000px] h-[120%] pointer-events-none hidden md:block" style={{
        zIndex: 5
      }}>
        <Image 
          src="/Ellipse 3.png"
          alt="Background overlay effect"
          fill
          style={{ objectFit: 'contain', opacity: 0.9 }}
          priority
          className="mix-blend-screen"
        />
      </div>

      <div className="flex flex-col md:flex-row relative z-30">
        {/* Left side: Categories and Title */}
        <div className="w-full md:w-1/3 mb-8 md:mb-0 order-1 md:order-1">
          <div className="px-0 sm:pl-4 md:pl-6">
            <div className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2 font-['Roboto_Mono'] font-medium">{subtitle}</div>
            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-light mb-6 sm:mb-8 font-['Roboto_Mono'] relative">{title}</h2>

            {/* Category Filters - Displayed horizontally and wrapped */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 relative">
              {propCategories.map((category) => (
                <button
                  key={category}
                  className={`${
                    category === activeCategory 
                      ? "bg-white text-black font-medium" 
                      : "border border-white/60 text-white hover:bg-white/10 font-medium"
                  } px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-colors font-['Roboto_Mono']`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop View - Traditional Grid Layout */}
        <div className="hidden sm:block w-full md:w-2/3 order-2 md:order-2 md:-ml-8 overflow-visible">
          <div className="grid grid-cols-1 gap-y-6 sm:gap-y-10">
            {organizedProducts.map((group, groupIndex) => {
              // Single wide image
              if (group.type === 'single') {
                const product = group.products[0];
                return (
                  <div 
                    key={`single-${groupIndex}-${product.id}`}
                    className="relative w-full"
                  >
                    <Link href={`/product/${product.id}`} className="block relative h-[280px] sm:h-[350px] md:h-[450px] lg:h-[520px] overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
                      <Image
                        src={product.image}
                        alt={(product.name || `Product ${product.id}`) as string}
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 100vw"
                        priority
                      />
                      {product.name && (
                        <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 text-center py-2 px-2 text-white font-['Roboto_Mono'] text-xs sm:text-sm uppercase">
                          {product.name} {product.price && `- ${product.price}`}
                        </div>
                      )}
                    </Link>
                  </div>
                );
              } 
              // Pair of smaller images side by side
              else {
                return (
                  <div 
                    key={`pair-${groupIndex}`} 
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
                  >
                    {group.products.map((product, productIndex) => {
                      return (
                        <div 
                          key={`product-${product.id}`}
                          className="relative"
                        >
                          <Link href={`/product/${product.id}`} className="block relative h-[280px] sm:h-[350px] md:h-[450px] lg:h-[520px] overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
                            <Image
                              src={product.image}
                              alt={(product.name || `Product ${product.id}`) as string}
                              fill
                              style={{ objectFit: 'contain' }}
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 45vw, 45vw"
                              priority
                            />
                            {product.name && (
                              <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 text-center py-2 px-2 text-white font-['Roboto_Mono'] text-xs sm:text-sm uppercase">
                                {product.name} {product.price && `- ${product.price}`}
                              </div>
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* Mobile View - Horizontal Scrollable Layout */}
        <div className="sm:hidden w-full order-2 overflow-visible">
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE 10+
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory',
            }}
          >
            {filteredProducts.map((product, index) => (
              <div 
                key={`mobile-${product.id}`}
                className="flex-none w-[85%] mr-4 snap-start relative"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Link href={`/product/${product.id}`} className="block relative h-[350px] overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
                  <Image
                    src={product.image}
                    alt={(product.name || `Product ${product.id}`) as string}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="85vw"
                    priority
                  />
                  {product.name && (
                    <div className="absolute bottom-6 left-0 right-0 text-center py-2 px-2 text-white font-['Roboto_Mono'] text-xs uppercase">
                      {product.name} {product.price && `- ${product.price}`}
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom scrollbar style */}
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}

