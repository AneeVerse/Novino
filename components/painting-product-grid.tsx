"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

// Product data
const products = [
  {
    id: 1,
    name: "LA-DE-DA 450 PENDANT",
    price: "from $2,327",
    image: "/images/painting/image 5.png",
    category: "Mugs",
    height: 1 // Standard height
  },
  {
    id: 2,
    name: "LA-DE-DA CANDLE",
    price: "$120",
    image: "/images/painting/image 7.png",
    category: "Mugs",
    height: 1 // Standard height
  },
  {
    id: 3,
    name: "HEIRLOOM PENDANT",
    price: "$1,850",
    image: "/images/painting/image 6.png",
    category: "Feeds",
    height: 1.5 // Taller image
  },
  {
    id: 4,
    name: "DOME TABLE LAMP",
    price: "$780",
    image: "/images/painting/image 8.png",
    category: "Feeds",
    height: 1 // Standard height
  },
  {
    id: 5,
    name: "BRASS PENDANT",
    price: "$950",
    image: "/images/painting/image 6.png",
    category: "Books",
    height: 1 // Standard height
  },
  {
    id: 6,
    name: "MODERN SCONCE",
    price: "$480",
    image: "/images/painting/Screenshot 2025-04-17 023229 1.png",
    category: "Books",
    height: 1 // Standard height
  },
  {
    id: 7,
    name: "WALL LIGHT",
    price: "$380",
    image: "/images/painting/Screenshot 2025-04-17 023229 2.png",
    category: "Mugs",
    height: 1.2 // Slightly taller
  },
  {
    id: 8,
    name: "PENDANT LAMP",
    price: "$595",
    image: "/images/painting/Screenshot 2025-04-17 023229 3.png",
    category: "Feeds",
    height: 1.3 // Taller image
  }
]

// Note: The filter buttons should be in the parent component
// This component only renders the product grid

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
  products: propProducts = products, 
  categories: propCategories = ["All Products", "Books", "Mugs", "Costar", "Feeds"],
  viewAllText = "View all" 
}: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>(propCategories[0]);
  
  // Filter products based on active category
  const filteredProducts = propProducts.filter(product => 
    activeCategory === propCategories[0] ? true : product.category === activeCategory
  );

  // For debugging
  console.log("Filtered products:", filteredProducts);

  return (
    <div className="p-8 relative overflow-visible max-w-[2400px] mx-auto font-['Roboto_Mono'] min-h-[800px]" style={{ 
      backgroundImage: "url('/Container (2).png')",
      backgroundSize: "100% 100%", 
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center"
    }}>
      {/* Bottom right overlay */}
      <div className="absolute -bottom-[-13%] -right-[-600px] w-[1000px] h-[120%] pointer-events-none" style={{
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
          <div className="grid grid-cols-2 gap-4" style={{ overflow: 'visible' }}>
            {/* 
              First row - two images side by side 
              CUSTOMIZATION:
              - Change height from 250px to any value
              - For top margin: add "mt-4" or larger value
              - For alignment: add "ml-auto" (right) or "mx-auto" (center)
            */}
            <div className="mb-4" style={{ 
              // Left image position adjustments
              paddingRight: '20px', // Added right padding to move closer to center
              transform: 'translateX(-75px)', // Move left by 40px
            }}>
              <div className="relative" style={{ 
                height: '520px', 
                width: '620px', // Set specific width
                marginLeft: 'auto', // Push toward center
              }}>
                <Image
                  src={filteredProducts[0]?.image || "/images/painting/image 5.png"}
                  alt={(filteredProducts[0]?.name || "Product 1") as string}
                  fill
                  style={{ 
                    objectFit: 'contain',
                    // objectPosition: 'left center' // Uncomment to align image left
                  }}
                  priority
                />
              </div>
            </div>
            <div className="mb-4" style={{ 
              // Right image position adjustments
              paddingLeft: '20px', // Added left padding to move closer to center
              transform: 'translateX(-75px)', // Move left by 40px
            }}>
              <div className="relative" style={{ 
                height: '520px',
                width: '620px', // Set specific width
                marginRight: 'auto', // Push toward center
              }}>
                <Image
                  src={filteredProducts[3]?.image || "/images/painting/image 8.png"}
                  alt={(filteredProducts[3]?.name || "Product 4") as string}
                  fill
                  style={{ 
                    objectFit: 'contain',
                    // objectPosition: 'right center' // Uncomment to align image right
                  }}
                  priority
                />
              </div>
            </div>
            
            {/* 
              Second row - full width image
              CUSTOMIZATION:
              - Increase height for taller image
              - Add translate or margin to adjust vertical position
            */}
            <div className="col-span-2 mb-4" style={{ 
              transform: 'translateY(-30px)', // Move up by 30px
              display: 'flex',
              justifyContent: 'center',
              overflow: 'visible', // Allow content to overflow
              maxWidth: 'none', // Remove any max-width constraints
              width: '100vw', // Use full viewport width
              position: 'relative',
              left: '50%',
              right: '50%',
              marginLeft: '-50vw',
              marginRight: '-50vw',
            }}>
              <div className="relative" style={{ 
                height: '600px',
                width: '59.5vw', // Use viewport width instead of fixed pixels
                transform: 'translateX(26px)', // Move right by 30px
                maxWidth: 'none', // Remove any max-width constraints
              }}>
                <Image
                  src={filteredProducts[1]?.image || "/images/painting/image 7.png"}
                  alt={(filteredProducts[1]?.name || "Red Pendant") as string}
                  fill
                  sizes="90vw"
                  style={{ 
                    objectFit: 'contain',
                    maxWidth: 'none', // Remove any max-width constraints
                    width: '100%',
                    height: '100%',
                  }}
                  priority
                />
              </div>
            </div>
            
            {/* 
              Third row - two standard images
              CUSTOMIZATION: Same options as first row
            */}
            <div className="mb-4" style={{ 
              // Left image position adjustments
              paddingRight: '20px', // Added right padding to move closer to center
              transform: 'translate(-75px, -50px)', // Move left and further up
            }}>
              <div className="relative" style={{ 
                height: '520px',
                width: '620px', // Set specific width
                marginLeft: 'auto', // Push toward center
              }}>
                <Image
                  src={filteredProducts[2]?.image || "/images/painting/Screenshot 2025-04-17 023229 3.png"}
                  alt={(filteredProducts[2]?.name || "Product 3") as string}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>
            <div className="mb-4" style={{ 
              // Right image position adjustments
              paddingLeft: '20px', // Added left padding to move closer to center
              transform: 'translate(-75px, -50px)', // Move left and further up
            }}>
              <div className="relative" style={{ 
                height: '520px',
                width: '620px', // Set specific width
                marginRight: 'auto', // Push toward center
              }}>
                <Image
                  src={filteredProducts[4]?.image || "/images/painting/Screenshot 2025-04-17 023229 2.png"}
                  alt={(filteredProducts[4]?.name || "Product 5") as string}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>
            
            {/* 
              Fourth row - image 6.png alone spanning full width
              CUSTOMIZATION: Same options as second row
            */}
            <div className="col-span-2 mb-4" style={{ 
              transform: 'translateY(-80px)', // Move up even further
              display: 'flex',
              justifyContent: 'center',
              overflow: 'visible', // Allow content to overflow
              maxWidth: 'none', // Remove any max-width constraints
              width: '100vw', // Use full viewport width
              position: 'relative',
              left: '50%',
              right: '50%',
              marginLeft: '-50vw',
              marginRight: '-50vw',
            }}>
              <div className="relative" style={{ 
                height: '600px',
                width: '59.5vw', // Same as second row
                transform: 'translateX(26px)', // Same as second row
                maxWidth: 'none', // Remove any max-width constraints
              }}>
                <Image
                  src="/images/painting/image 6.png"
                  alt="LA-DE-DA Product"
                  fill
                  sizes="59.5vw"
                  style={{ 
                    objectFit: 'contain',
                    maxWidth: 'none', // Remove any max-width constraints
                    width: '100%',
                    height: '100%',
                  }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* View All Button */}
      <div className="mt-16 flex justify-center relative z-30">
        <button className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-white/20 transition-colors text-sm sm:text-base cursor-pointer font-['Roboto_Mono'] font-medium" style={{ borderRadius: '10px' }}>
          {viewAllText}
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

