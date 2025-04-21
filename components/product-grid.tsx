"use client"

import { useState } from "react"
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
  id: number;
  name?: string;
  title?: string;
  price?: string;
  date?: string;
  role?: string;
  image: string;
  category: string;
}

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  products?: Product[];
  categories?: string[];
  viewAllText?: string;
  showViewAllButton?: boolean;
}

export default function ProductGrid({ 
  title = "Elevate Your Gallery", 
  subtitle = "All Products", 
  products: propProducts = products, 
  categories: propCategories = ["All Products", "Books", "Mugs", "Costar", "Feeds"],
  viewAllText = "View all",
  showViewAllButton = true
}: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>(propCategories[0]);
  
  // Filter products based on active category
  const filteredProducts = propProducts.filter(product => 
    activeCategory === propCategories[0] ? true : product.category === activeCategory
  );

  return (
    <div className="p-8 relative overflow-hidden max-w-[2400px] mx-auto font-['Roboto_Mono']" style={{ 
      backgroundImage: "url('/Container (2).png')",
      backgroundSize: "100% 100%", 
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      overflow: "visible"
    }}>
      {/* Bottom right overlay */}
      <div className="absolute -bottom-[-13%] -right-[-600px] w-[1300px] h-[120%] pointer-events-none" style={{
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
        {/* Right side: Product Grid */}
        <div className="w-full md:w-1/2 order-1 md:order-2">
          <div className="grid grid-cols-2 gap-8">
            {filteredProducts.slice(0, 2).map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <div className="bg-white w-full max-w-[80%] mx-auto border border-white hover:opacity-95 transition-opacity">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={(product.name || product.title || "Product") as string}
                      fill
                      className="object-contain p-4" 
                    />
                  </div>
                  <div className="p-4 bg-[#333333]">
                    <div className="text-white text-xs uppercase font-medium font-['Roboto_Mono']">{product.name || product.title}</div>
                    <div className="text-white text-sm font-medium mt-1 font-['Roboto_Mono']">{product.price || product.date || product.role}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-8 mt-8">
            {filteredProducts.slice(2, 4).map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <div className="bg-white w-full max-w-[80%] mx-auto border border-white hover:opacity-95 transition-opacity">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={(product.name || product.title || "Product") as string}
                      fill
                      className="object-contain p-4" 
                    />
                  </div>
                  <div className="p-4 bg-[#333333]">
                    <div className="text-white text-xs uppercase font-medium font-['Roboto_Mono']">{product.name || product.title}</div>
                    <div className="text-white text-sm font-medium mt-1 font-['Roboto_Mono']">{product.price || product.date || product.role}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Left side: Categories and Title */}
        <div className="w-full md:w-1/2 mb-8 md:mb-0 order-2 md:order-1">
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
          
          {/* Two cards below filter on left side - now horizontal */}
          <div className="grid grid-cols-2 gap-8 mt-[165px] pl-10">
            {filteredProducts.slice(4, 6).map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <div className="bg-white w-full max-w-[85%] mx-auto border border-white hover:opacity-95 transition-opacity">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={(product.name || product.title || "Product") as string}
                      fill
                      className="object-contain p-4" 
                    />
                  </div>
                  <div className="p-4 bg-[#333333]">
                    <div className="text-white text-xs uppercase font-medium font-['Roboto_Mono']">{product.name || product.title}</div>
                    <div className="text-white text-sm font-medium mt-1 font-['Roboto_Mono']">{product.price || product.date || product.role}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* View All Button */}
      {showViewAllButton && (
        <div className="mt-16 flex justify-center relative z-30">
          <button className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-white/20 transition-colors text-sm sm:text-base cursor-pointer font-['Roboto_Mono'] font-medium" style={{ borderRadius: '10px' }}>
            {viewAllText}
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

