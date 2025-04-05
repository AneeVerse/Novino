import Image from "next/image"
import { Star } from "lucide-react"

// Product data
const products = [
  {
    id: 1,
    name: "GLASSWAVE",
    price: "$29",
    rating: 5.0,
    reviews: 50,
    image: "/images/notebook-white.png",
  },
  {
    id: 2,
    name: "HOLOCENA",
    price: "$23",
    rating: 4.9,
    reviews: 41,
    image: "/images/notebook-black.png",
  },
  {
    id: 3,
    name: "RHAPSODY",
    price: "$15",
    rating: 4.8,
    reviews: 45,
    image: "/images/mug-white.png",
  },
  {
    id: 4,
    name: "LIGHTWORK",
    price: "$22.5",
    rating: 5.0,
    reviews: 50,
    image: "/images/mug-black.png",
  },
]

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product.id} className="bg-zinc-900 group">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="p-3">
            <div className="text-gray-400 text-xs uppercase mb-1">{product.name}</div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-white font-medium">{product.price}</div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} size={12} fill="white" color="white" />
                    ))}
                </div>
                <span className="text-gray-400 text-xs">{product.reviews}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

