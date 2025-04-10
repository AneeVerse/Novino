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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {filteredProducts.map((product) => (
        <div key={product.id} className="overflow-hidden" style={{ borderRadius: '4px', border: '2px solid white' }}>
          <div className="relative aspect-square overflow-hidden">
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-contain p-4" 
            />
          </div>
          <div className="p-4">
            <div className="text-white text-sm font-medium mb-2">{product.name}</div>
            <div className="flex justify-between items-center">
              <div className="text-white text-lg font-medium">{product.price}</div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < product.rating || Math.round(product.rating) === 5 ? "white" : "none"} 
                        color="white" 
                      />
                    ))}
                </div>
                <span className="text-white text-sm">{product.rating}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

