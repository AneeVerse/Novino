import Image from "next/image"
import Link from "next/link"

export default function WardrobeSection() {
  return (
    <div className="relative bg-gray-200 rounded-3xl mx-4 md:mx-8 mb-16 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between">
        {/* Left content section */}
        <div className="p-8 md:p-12 md:w-2/3">
          <h2 className="text-black text-3xl md:text-4xl font-bold mb-4">ELEVATE YOUR WARDROBE</h2>
          <p className="text-gray-700 text-base md:text-lg max-w-2xl">
            Don't miss out – experience the epitome of fashion by clicking 'Buy Now' and embrace a world of chic elegance delivered to your doorstep. Your style journey begins here.
          </p>
        </div>

        {/* Right section with curved design and button */}
        <div className="relative md:w-1/3 h-full min-h-[200px] flex items-center justify-center">
          <div className="absolute right-0 top-0 bottom-0 w-full">
            <Image 
              src="/images/vector.png" 
              alt="Abstract curved design" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <Link
            href="/shop"
            className="relative z-10 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            Shop Now
            <span className="inline-block transform rotate-45">↗</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

