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
        <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between p-8 md:p-12">
          {/* Left content section */}
          <div className="md:w-2/3 z-10">
            <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">ELEVATE YOUR WARDROBE</h2>
            <p className="text-gray-200 text-base md:text-lg max-w-2xl">
              Don't miss out – experience the epitome of fashion by clicking 'Shop Now' and embrace a world of chic elegance delivered to your doorstep. Your style journey begins here.
            </p>
          </div>

          {/* Button section */}
          <div className="mt-6 md:mt-0 md:w-1/3 flex justify-center md:justify-end z-10">
            <Link
              href="/shop"
              className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
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

