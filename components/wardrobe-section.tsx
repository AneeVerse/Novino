import Image from "next/image"
import Link from "next/link"

export default function WardrobeSection() {
  return (
    <div className="relative bg-gray-200 mb-16 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="p-6 md:p-10 md:w-3/4">
          <h2 className="text-black text-xl md:text-2xl uppercase font-bold mb-4">ELEVATE YOUR WARDROBE</h2>
          <p className="text-gray-700 text-sm mb-6">
            Start this out - experience the mixture of fashion by clicking the New introduction a world of chic designs
            delivered to your doorstep. Your styling begins here.
          </p>
        </div>

        <div className="relative md:w-1/4 min-h-[150px]">
          <div className="absolute inset-0">
            <Image src="/images/vector.png" alt="Abstract design" fill className="object-cover" />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link
              href="/shop"
              className="bg-black text-white px-4 py-2 text-sm rounded-sm hover:bg-gray-800 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

