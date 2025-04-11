import Image from "next/image"
import { Star } from "lucide-react"

// Product data
const products = [
  {
    id: 1,
    name: "CLASSWING",
    price: "$20",
    rating: 5.0,
    reviews: 50,
    image: "/images/notebook-white.png",
    category: "Books"
  },
  {
    id: 2,
    name: "HOLOCANE",
    price: "$23",
    rating: 5.0,
    reviews: 50,
    image: "/images/notebook-black.png",
    category: "Books"
  },
  {
    id: 3,
    name: "INAMORATA",
    price: "$12",
    rating: 4.5,
    reviews: 45,
    image: "/images/mug-white.png",
    category: "Mugs"
  },
  {
    id: 4,
    name: "LIGHTCOOL",
    price: "$22.5",
    rating: 5.0,
    reviews: 50,
    image: "/images/mug-black.png",
    category: "Mugs"
  },
]

// Define props type for ProductGrid
type ProductGridProps = {
  category?: string;
}

export default function ProductGrid({ category = "All Products" }: ProductGridProps) {
  // Filter products based on category prop
  const filteredProducts = category === "All Products" 
    ? products 
    : products.filter(product => product.category === category);

  return (
    <div className="grid grid-cols-2 gap-6 md:gap-8" style={{ maxWidth: "100%" }}>
      {filteredProducts.map((product) => (
        <div key={product.id} className="overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-white">
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-contain p-4" 
            />
          </div>
          <div className="p-5 md:p-6 bg-[#333333]">
            <div className="text-white text-sm md:text-base font-medium mb-4">{product.name}</div>
            
            <div className="flex justify-between items-center">
              <div className="text-white text-lg md:text-xl font-medium">{product.price}</div>
              
              <div className="flex flex-col items-center">
                <div className="flex gap-1">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <svg 
                        key={i} 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill={(i < Math.floor(product.rating)) ? "white" : "none"}
                        stroke="white" 
                        strokeWidth="1.5"
                        className="w-3.5 h-3.5 md:w-4 md:h-4"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                </div>
                <span className="text-white text-[10px] md:text-xs mt-1">{product.rating}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

