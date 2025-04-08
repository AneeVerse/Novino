import Image from "next/image"
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"

export default function ProductTestimonial() {
  return (
    <section
      className="relative w-full py-16 md:py-24 overflow-hidden bg-transparent"
    >
      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24 px-4 md:px-8">
        {/* Notebook Image in Circle */}
        <div className="relative w-full max-w-[320px]">
          {/* Gradient background effect */}
          <div className="absolute -inset-16 bg-gradient-radial from-[#6b5750] via-[#3c3331]/80 to-transparent rounded-full blur-[80px]"></div>
          <div className="absolute -inset-10 bg-gradient-to-br from-[#6b5750] via-[#6b5750]/90 to-transparent rounded-full blur-[60px]"></div>
          <div className="absolute -inset-6 bg-gradient-to-r from-[#6b5750] via-[#3c3331]/90 to-transparent rounded-full blur-[40px]"></div>
          <div
            className="relative w-full overflow-hidden flex items-center justify-center z-10"
            style={{
              background: "#b8a99e",
              borderRadius: "50%",
              aspectRatio: "1 / 1.2",
              height: "auto",
              boxShadow: "0 0 40px rgba(107, 87, 80, 0.6)"
            }}
          >
            <div className="relative w-[85%] h-[85%] z-10">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/notebook-white-CXjriO1tbsWMnXEdnpoLjLagrUg6hR.png"
                alt="Artistic notebook with abstract patterns"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="flex-1 text-white space-y-8 md:space-y-10">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide">Product Testimonials</h2>

          {/* Star Rating */}
          <div className="flex gap-3.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            ))}
          </div>

          {/* Testimonial Quote */}
          <div className="space-y-4">
            <blockquote className="text-2xl md:text-[40px] font-normal leading-tight">
              "I've been feeling pretty stressed with my skin lately, so I picked up a set of HOLOCENA skincare. Oh my
              goodness!. It was AMAZING. My skin felt so soft and moisturized"
            </blockquote>
            <p className="text-base md:text-xl text-white/80">- Customer Review</p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 flex flex-col gap-6">
          <button className="text-white/90 hover:text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
          <button className="text-white/90 hover:text-white transition-colors">
            <MoreVertical className="w-6 h-6" />
          </button>
          <button className="text-white/90 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  )
}
