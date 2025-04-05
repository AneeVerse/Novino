import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function CollectionPage() {
  return (
    <main className="min-h-screen bg-zinc-800 p-6 md:p-10">
      <Link href="/" className="flex items-center text-white mb-8 hover:underline">
        <ArrowLeft className="mr-2" size={16} />
        Back to Home
      </Link>

      <h1 className="text-white text-3xl md:text-4xl mb-6">Our Collection</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border border-zinc-700 p-4 bg-zinc-900">
            <div className="relative aspect-[3/4] mb-4">
              <Image src="/images/gallery-grid.png" alt={`Art piece ${i + 1}`} fill className="object-cover" />
            </div>
            <h3 className="text-white text-lg mb-2">Abstract Art #{i + 1}</h3>
            <p className="text-zinc-400 text-sm mb-4">Unique black and white abstract design with colorful accents.</p>
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">${(99 + i * 10).toFixed(2)}</span>
              <button className="bg-white text-black px-4 py-1 text-sm">Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

