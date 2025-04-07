import Image from "next/image"
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"

export default function ProductTestimonial() {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-8 md:gap-16">
        {/* Notebook Image in Circle */}
        <div className="relative w-full max-w-[320px] aspect-square rounded-full bg-[#a08675] flex items-center justify-center p-4">
          <div className="relative w-[85%] h-[85%]">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/notebook-white-CXjriO1tbsWMnXEdnpoLjLagrUg6hR.png"
              alt="Artistic notebook with abstract patterns"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="flex-1 text-white space-y-6 md:space-y-8">
          <h2 className="text-2xl md:text-3xl font-light">Product Testimonials</h2>

          {/* Star Rating */}
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            ))}
          </div>

          {/* Testimonial Quote */}
          <div className="space-y-4">
            <blockquote className="text-2xl md:text-4xl font-light leading-tight">
              "I've been feeling pretty stressed with my skin lately, so I picked up a set of HOLOCENA skincare. Oh my
              goodness!. It was AMAZING. My skin felt so soft and moisturized"
            </blockquote>
            <p className="text-sm md:text-base text-gray-300">- Customer Review</p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-6">
          <button className="text-white hover:text-gray-300 transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
          <button className="text-white hover:text-gray-300 transition-colors">
            <MoreVertical className="w-6 h-6" />
          </button>
          <button className="text-white hover:text-gray-300 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
} 