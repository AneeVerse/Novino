import Image from "next/image"
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"

export default function ProductTestimonial() {
  return (
    <section
      className="relative w-full py-16 md:py-24 overflow-visible bg-transparent"
    >
      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24 px-4 md:px-8 overflow-visible">
        {/* Notebook Image in Circle */}
        <div className="relative w-full max-w-[500px] overflow-visible -ml-16">
          {/* Gradient background effect - much more expanded */}
          <div className="absolute -inset-64 bg-gradient-radial from-[#6b5750] via-[#3c3331]/90 to-transparent blur-[160px] z-0"></div>
          <div className="absolute -inset-48 bg-gradient-to-br from-[#6b5750] via-[#6b5750]/95 to-transparent blur-[140px] z-0"></div>
          <div className="absolute -inset-32 bg-gradient-to-r from-[#6b5750] via-[#3c3331]/95 to-transparent blur-[120px] z-0"></div>
          <div className="absolute -inset-16 bg-gradient-to-tr from-[#6b5750] via-[#3c3331] to-transparent blur-[100px] z-0"></div>
          <div
            className="relative w-full overflow-visible flex items-center justify-center z-10"
            style={{
              background: "#b8a99e",
              borderRadius: "50%",
              aspectRatio: "1 / 1.2",
              height: "auto",
              boxShadow: "0 0 80px rgba(107, 87, 80, 0.8)"
            }}
          >
            <div className="relative w-[95%] h-[95%] z-10 py-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/notebook-white-CXjriO1tbsWMnXEdnpoLjLagrUg6hR.png"
                alt="Artistic notebook with abstract patterns"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="flex-1 ml-auto relative left-24 text-white space-y-8 md:space-y-10" style={{ fontFamily: '"IvyMode", serif' }}>
          <h2 className="text-2xl md:text-3xl font-light tracking-wide" style={{ fontFamily: '"IvyMode", serif' }}>Product Testimonials</h2>

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
            <blockquote className="text-2xl md:text-[40px] font-normal leading-tight" style={{ fontFamily: '"IvyMode", serif' }}>
              "I've been feeling pretty stressed with my skin lately, so I picked up a set of HOLOCENA skincare. Oh my
              goodness!. It was AMAZING. My skin felt so soft and moisturized"
            </blockquote>
            <p className="text-base md:text-xl text-white/80" style={{ fontFamily: '"IvyMode", serif' }}>- Customer Review</p>
          </div>
        </div>
      </div>
    </section>
  )
}
