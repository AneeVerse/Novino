import Image from "next/image"
import { useState } from "react"

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

// Define props type for ProductGrid
type ProductGridProps = {
  category?: string;
}

export default function ProductGrid({ category = "All Products" }: ProductGridProps) {
  // Filter products based on category
  const filteredProducts = category === "All Products" 
    ? products 
    : products.filter(product => product.category === category);

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
      {filteredProducts.map((product) => (
        <div key={product.id} className="bg-white">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-2" 
            />
          </div>
          <div className="p-3 bg-[#333333]">
            <div className="text-white text-xs uppercase font-medium">{product.name}</div>
            <div className="text-white text-sm font-medium mt-1">{product.price}</div>
          </div>
        </div>
      ))}
      
      {/* Shop Now Button */}
      <div className="md:col-span-2 mt-4 flex justify-center">
        <button className="border border-white bg-transparent text-white px-3 py-1.5 text-xs flex items-center gap-1 hover:bg-white/10 transition-colors">
          Shop now
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.3536 4.35356C13.5488 4.15829 13.5488 3.84171 13.3536 3.64645L10.1716 0.464468C9.97631 0.269205 9.65973 0.269205 9.46447 0.464468C9.2692 0.65973 9.2692 0.976312 9.46447 1.17157L12.2929 4.00001L9.46447 6.82843C9.2692 7.02369 9.2692 7.34027 9.46447 7.53554C9.65973 7.7308 9.97631 7.7308 10.1716 7.53554L13.3536 4.35356ZM-4.37114e-08 4.5L13 4.5L13 3.5L4.37114e-08 3.5L-4.37114e-08 4.5Z" fill="white"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

