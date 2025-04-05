import Image from "next/image"
import { Star, ChevronUp, ChevronDown } from "lucide-react"

export default function TestimonialSection() {
  return (
    <div className="relative bg-zinc-800 py-8 md:py-12">
      <div className="text-center mb-4 text-gray-300">Product Testimonials</div>

      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 p-4 md:p-6">
        {/* Testimonial Image */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0">
          <Image src="/images/notebook-white.png" alt="Abstract art notebook" fill className="object-cover" />
        </div>

        {/* Testimonial Content */}
        <div className="flex-1">
          {/* Stars */}
          <div className="flex mb-3">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star key={i} size={16} fill="white" color="white" />
              ))}
          </div>

          {/* Quote */}
          <blockquote className="text-white text-lg md:text-xl font-light italic mb-3">
            "I've been feeling pretty stressed with my skin lately, so I picked up a set of HOLOCENA skincare. Oh my
            goodness. It was AMAZING. My skin felt so soft and moisturized!"
          </blockquote>

          {/* Author */}
          <div className="text-gray-300 text-sm">Caroline Appel</div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex flex-col gap-2 absolute right-4 top-1/2 transform -translate-y-1/2">
          <button className="text-white p-1">
            <ChevronUp size={16} />
          </button>
          <button className="text-white p-1">
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

