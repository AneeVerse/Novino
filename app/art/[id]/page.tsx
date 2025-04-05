import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ArtDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-zinc-800 p-6 md:p-10">
      <Link href="/" className="flex items-center text-white mb-8 hover:underline">
        <ArrowLeft className="mr-2" size={16} />
        Back to Gallery
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Art Image */}
        <div className="bg-white p-4 border-2 border-black">
          <div className="relative aspect-square">
            <Image src="/images/gallery-grid.png" alt={`Abstract Art #${params.id}`} fill className="object-contain" />
          </div>
        </div>

        {/* Art Details */}
        <div>
          <h1 className="text-white text-3xl mb-2">Abstract Art #{params.id}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star key={i} size={16} fill="white" color="white" />
                ))}
            </div>
            <span className="text-gray-400 text-sm">(50 reviews)</span>
          </div>

          <div className="text-white text-2xl font-bold mb-6">$29.00</div>

          <p className="text-gray-300 mb-8">
            This unique black and white abstract design features intricate patterns and subtle colorful accents. Perfect
            for adding a touch of modern elegance to any space.
          </p>

          <div className="mb-8">
            <h3 className="text-white mb-2">Size</h3>
            <div className="flex gap-3">
              {["8×10″", "11×14″", "16×20″", "24×36″"].map((size) => (
                <button
                  key={size}
                  className="border border-white text-white px-3 py-1 text-sm hover:bg-white hover:text-black transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-white mb-2">Frame</h3>
            <div className="flex gap-3">
              {["None", "Black", "White", "Natural"].map((frame) => (
                <button
                  key={frame}
                  className="border border-white text-white px-3 py-1 text-sm hover:bg-white hover:text-black transition-colors"
                >
                  {frame}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full py-6 text-lg flex items-center justify-center gap-2">
            <ShoppingCart size={20} />
            Add to Cart
          </Button>
        </div>
      </div>
    </main>
  )
}

