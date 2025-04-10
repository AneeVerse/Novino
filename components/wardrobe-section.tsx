import Image from "next/image"
import Link from "next/link"

export default function WardrobeSection() {
  return (
    <div className="relative mx-4 md:mx-8 mb-16 overflow-hidden rounded-3xl">
      {/* Full background image */}
      <div className="relative w-full h-[333px]">
        <Image 
          src="/images/Container (1).png" 
          alt="Wardrobe background" 
          fill 
          className="object-cover"
          priority
        />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col md:flex-row items-center p-8 md:p-12">
          {/* Left content section */}
          <div className="md:w-3/5 z-10">
            <h2 className="text-black text-3xl md:text-4xl font-bold mb-4">ELEVATE YOUR WARDROBE</h2>
            <p className="text-black text-base md:text-lg max-w-2xl">
              Don't miss out – experience the epitome of fashion by clicking 'Buy Now' and embrace a world of chic elegance delivered to your doorstep. Your style journey begins here.
            </p>
          </div>

          {/* Button section - aligned with circle */}
          <div className="md:absolute md:right-36 md:top-1/2 md:-translate-y-1/2 mt-6 md:mt-0 z-10">
            <Link
              href="/shop"
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              Shop Now
              <span className="inline-block transform rotate-45">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

