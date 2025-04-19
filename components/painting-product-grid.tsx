"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import React from "react"
import productData from "@/public/data/painting-products.json"

interface Product {
  id: number;
  name?: string;
  title?: string;
  price?: string;
  date?: string;
  role?: string;
  image: string;
  category: string;
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
  
  // Simple direct filtering approach
  const filteredProducts = React.useMemo(() => {
    console.log("FILTERING - Active Category:", activeCategory);
    console.log("FILTERING - Products before filter:", propProducts);
    
    // For categories other than "All Paintings", strictly filter by category
    if (activeCategory !== "All Paintings") {
      const filtered = propProducts.filter(product => product.category === activeCategory);
      
      // Sort the filtered products by id to ensure consistent order
      filtered.sort((a, b) => a.id - b.id);
      
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

  return (
    <div className="p-8 pb-16 relative overflow-visible max-w-[2400px] mx-auto font-['Roboto_Mono'] min-h-[800px]" style={{ 
      backgroundImage: "url('/Container (2).png')",
      backgroundSize: "100% 100%", 
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center"
    }}>
      {/* Bottom right overlay */}
      <div className="absolute -bottom-[-30%] -right-[-650px] w-[1000px] h-[120%] pointer-events-none" style={{
        zIndex: 5
      }}>
        {/* 
          POSITIONING GUIDE:
          - To move RIGHT: increase the right value (make it less negative) e.g. -right-[650px]
          - To move LEFT: decrease the right value (make it more negative) e.g. -right-[1050px]
          - To move UP: increase the bottom value (make it less negative) e.g. bottom-[-50%]
          - To move DOWN: decrease the bottom value (make it more negative) e.g. bottom-[-130%]
          - You can also adjust width and height with w-[2000px] and h-[220%]
        */}
        <Image 
          src="/Ellipse 3.png"
          alt="Background overlay effect"
          fill
          style={{ objectFit: 'contain', opacity: 0.9 }}
          priority
          className="mix-blend-screen"
        />
      </div>

      <div className="flex flex-col md:flex-row md:gap-8 relative z-30">
        {/* Left side: Categories and Title */}
        <div className="w-full md:w-1/3 mb-8 md:mb-0 order-2 md:order-1">
          <div className="pl-10">
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
                  } px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-full transition-colors font-['Roboto_Mono']`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Custom Grid */}
        <div className="w-full md:w-2/3 order-1 md:order-2 md:-ml-16" style={{
          overflow: 'visible' // Allow content to overflow
        }}>
          {(activeCategory === "Mixed Media" && filteredProducts.length === 2) || 
           (activeCategory === "Acrylic" && filteredProducts.length >= 1) ||
           (activeCategory === "Oil" && filteredProducts.length >= 1) ||
           (activeCategory === "Watercolor" && filteredProducts.length >= 1) ? (
            // Special layout for category-specific displays
            <div className="grid grid-cols-2 gap-4" style={{ overflow: 'visible' }}>
              {/* First item */}
              <div className="col-span-2 mb-4" style={{ 
                transform: 'translateY(-5px)',
                display: 'flex',
                justifyContent: 'center',
                overflow: 'visible',
                maxWidth: 'none',
                width: '100vw',
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
                pointerEvents: 'none',
              }}>
                <div className="relative" style={{ 
                  height: '600px',
                  width: '59.5vw',
                  transform: 'translateX(26px)',
                  maxWidth: 'none',
                }}>
                  {filteredProducts[0] && (
                    <Image
                      src={filteredProducts[0].image}
                      alt={(filteredProducts[0].name || "Product 1") as string}
                      fill
                      sizes="90vw"
                      style={{ 
                        objectFit: 'contain',
                        maxWidth: 'none',
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'auto',
                      }}
                      priority
                    />
                  )}
                </div>
              </div>
              
              {/* Second item at the bottom (only for Mixed Media with 2 items) */}
              {activeCategory === "Mixed Media" && filteredProducts.length === 2 && (
                <div className="col-span-2 mb-4" style={{ 
                  transform: 'translateY(-40px)',
                  display: 'flex',
                  justifyContent: 'center',
                  overflow: 'visible',
                  maxWidth: 'none',
                  width: '100vw',
                  position: 'relative',
                  left: '50%',
                  right: '50%',
                  marginLeft: '-50vw',
                  marginRight: '-50vw',
                  pointerEvents: 'none',
                }}>
                  <div className="relative" style={{ 
                    height: '600px',
                    width: '59.5vw',
                    transform: 'translateX(26px)',
                    maxWidth: 'none',
                  }}>
                    {filteredProducts[1] && (
                      <Image
                        src={filteredProducts[1].image}
                        alt={(filteredProducts[1].name || "Product 2") as string}
                        fill
                        sizes="59.5vw"
                        style={{ 
                          objectFit: 'contain',
                          maxWidth: 'none',
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'auto',
                        }}
                        priority
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Standard layout for other categories
            <div className="grid grid-cols-2 gap-4" style={{ overflow: 'visible' }}>
              {/* First row - images 0 and 1 (2.1.png and 2.2.png) */}
              <div className="mb-4" style={{ 
                paddingRight: '20px',
                transform: 'translateX(-75px)',
              }}>
                <div className="relative" style={{ 
                  height: '520px', 
                  width: '620px',
                  marginLeft: 'auto',
                }}>
                  {filteredProducts[0] ? (
                    <Image
                      src={filteredProducts[0].image}
                      alt={(filteredProducts[0].name || "Product 1") as string}
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-white">No product available</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-4" style={{ 
                paddingLeft: '20px',
                transform: 'translateX(-75px)',
              }}>
                <div className="relative" style={{ 
                  height: '520px',
                  width: '620px',
                  marginRight: 'auto',
                }}>
                  {filteredProducts[1] ? (
                    <Image
                      src={filteredProducts[1].image}
                      alt={(filteredProducts[1].name || "Product 2") as string}
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-white">No product available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Second row - image 2 (3.png) full width */}
              <div className="col-span-2 mb-4" style={{ 
                transform: 'translateY(-30px)',
                display: 'flex',
                justifyContent: 'center',
                overflow: 'visible',
                maxWidth: 'none',
                width: '100vw',
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
              }}>
                <div className="relative" style={{ 
                  height: '600px',
                  width: '59.5vw',
                  transform: 'translateX(26px)',
                  maxWidth: 'none',
                }}>
                  {filteredProducts[2] ? (
                    <Image
                      src={filteredProducts[2].image}
                      alt={(filteredProducts[2].name || "Product 3") as string}
                      fill
                      sizes="90vw"
                      style={{ 
                        objectFit: 'contain',
                        maxWidth: 'none',
                        width: '100%',
                        height: '100%',
                      }}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-white">No product available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Third row - images 3 and 4 (4.1.png and 4.2.png) */}
              <div className="mb-4" style={{ 
                paddingRight: '20px',
                transform: 'translate(-75px, -50px)',
              }}>
                <div className="relative" style={{ 
                  height: '520px',
                  width: '620px',
                  marginLeft: 'auto',
                }}>
                  {filteredProducts[3] ? (
                    <Image
                      src={filteredProducts[3].image}
                      alt={(filteredProducts[3].name || "Product 4") as string}
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-white">No product available</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-4" style={{ 
                paddingLeft: '20px',
                transform: 'translate(-75px, -50px)',
              }}>
                <div className="relative" style={{ 
                  height: '520px',
                  width: '620px',
                  marginRight: 'auto',
                }}>
                  {filteredProducts[4] ? (
                    <Image
                      src={filteredProducts[4].image}
                      alt={(filteredProducts[4].name || "Product 5") as string}
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-white">No product available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Fourth row - images 5 and 6 (5.1.png and 5.2.png) */}
              <div className="mb-4" style={{ 
                paddingRight: '20px',
                transform: 'translate(-75px, -40px)',
              }}>
                <div className="relative" style={{ 
                  height: '520px',
                  width: '620px',
                  marginLeft: 'auto',
                }}>
                  {filteredProducts[5] ? (
                    <Image
                      src={filteredProducts[5].image}
                      alt={(filteredProducts[5].name || "Product 6") as string}
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-white">No product available</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-4" style={{ 
                paddingLeft: '20px',
                transform: 'translate(-75px, -40px)',
              }}>
                <div className="relative" style={{ 
                  height: '520px',
                  width: '620px',
                  marginRight: 'auto',
                }}>
                  {filteredProducts[6] ? (
                    <Image
                      src={filteredProducts[6].image}
                      alt={(filteredProducts[6].name || "Product 7") as string}
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-white">No product available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Fifth row - image 7 (6.png) full width */}
              <div className="col-span-2 mb-4" style={{ 
                transform: 'translateY(-60px)',
                display: 'flex',
                justifyContent: 'center',
                overflow: 'visible',
                maxWidth: 'none',
                width: '100vw',
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
              }}>
                <div className="relative" style={{ 
                  height: '600px',
                  width: '59.5vw',
                  transform: 'translateX(26px)',
                  maxWidth: 'none',
                }}>
                  {filteredProducts[7] ? (
                    <Image
                      src={filteredProducts[7].image}
                      alt={(filteredProducts[7].name || "Product 8") as string}
                      fill
                      sizes="59.5vw"
                      style={{ 
                        objectFit: 'contain',
                        maxWidth: 'none',
                        width: '100%',
                        height: '100%',
                      }}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-white">No product available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

