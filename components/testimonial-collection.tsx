import Image from "next/image"
import { Star, Twitter } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Thompson",
    twitter: "@sarahthompson",
    image: "/images/profile-sarah.png",
    rating: 5,
    text: "Styles have exceeded my expectations. The gentle touch of vibrant colors against the stark black and white is mesmerizing.",
  },
  {
    id: 2,
    name: "Rajesh Patel",
    twitter: "@rajeshpatel",
    image: "/images/profile-rajesh.png",
    rating: 5,
    text: "Absolutely love the style and warmth of the art. A perfect blend of abstract and geometric patterns.",
  },
  {
    id: 3,
    name: "Emily Walker",
    twitter: "@emilywalker",
    image: "/images/profile-emily.png",
    rating: 5,
    text: "Minimal and comfortable yet stylish. Perfect sizes for my walls. Thank you for creating such beautiful and functional pieces.",
  },
]

export default function TestimonialCollection() {
  return (
    <div className="border border-dashed border-white mb-16 bg-zinc-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 opacity-30">
        <Image
          src="/images/abstract-design.png"
          alt="Abstract design"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>

      <div className="p-6 md:p-10">
        <h2 className="text-white text-xl md:text-2xl uppercase mb-1">THE STYLELOOM TESTIMONIAL COLLECTION.</h2>
        <p className="text-gray-400 text-sm mb-8">
          All the testimonials from people who fell for the beauty of our decor.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="border border-dashed border-zinc-700 p-4 relative">
              {/* Profile and Twitter */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-white text-sm">{testimonial.name}</div>
                  <div className="flex items-center text-gray-400 text-xs">
                    <Twitter size={12} className="mr-1" />
                    {testimonial.twitter}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex mb-3">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star key={i} size={14} fill="#FFD700" color="#FFD700" />
                  ))}
              </div>

              {/* Testimonial */}
              <p className="text-gray-300 text-sm">{testimonial.text}</p>

              {/* Corner Decoration */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

