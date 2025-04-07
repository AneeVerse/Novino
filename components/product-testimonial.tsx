import Image from "next/image"
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"

export default function ProductTestimonial() {
  return (
    <section 
      className="relative w-full py-16 md:py-24 overflow-hidden"
      style={{ 
        boxShadow: "none"
      }}
    >
      {/* Soft vignette overlay - made transparent */}
      <div className="absolute inset-0 pointer-events-none opacity-0"></div>
      
      {/* Warm glow from left - made transparent */}
      <div className="absolute -left-[10%] top-[20%] w-[70%] h-[60%] opacity-0 rounded-full blur-[100px]"></div>
      
      {/* Extended warm glow - made transparent */}
      <div className="absolute inset-0 pointer-events-none opacity-0"></div>
      
      {/* Subtle noise texture for depth - made transparent */}
      <div className="absolute inset-0 opacity-0 mix-blend-overlay pointer-events-none"></div>

      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24 px-4 md:px-8">
        {/* Notebook Image in Circle with organic outer glow */}
        <div className="relative w-full max-w-[320px]">
          {/* Far extended sparse gradient */}
          <div 
            className="absolute -inset-32 z-0"
            style={{
              background: `
                radial-gradient(
                  ellipse 150% 120% at 70% 40%,
                  rgba(99, 81, 72, 0.4) 0%,
                  rgba(99, 81, 72, 0.2) 20%,
                  rgba(99, 81, 72, 0.1) 40%,
                  transparent 70%
                ),
                radial-gradient(
                  ellipse 140% 140% at 30% 60%,
                  rgba(99, 81, 72, 0.3) 0%,
                  rgba(99, 81, 72, 0.15) 30%,
                  transparent 60%
                )
              `,
              filter: "blur(40px)",
              transform: "rotate(-25deg)"
            }}
          ></div>
          
          {/* Mid-range sparse glow */}
          <div 
            className="absolute -inset-20 z-0"
            style={{
              background: `
                radial-gradient(
                  ellipse 130% 110% at 60% 45%,
                  rgba(99, 81, 72, 0.5) 0%,
                  rgba(99, 81, 72, 0.2) 40%,
                  transparent 80%
                ),
                radial-gradient(
                  ellipse 120% 130% at 40% 55%,
                  rgba(99, 81, 72, 0.4) 10%,
                  rgba(99, 81, 72, 0.1) 50%,
                  transparent 90%
                )
              `,
              filter: "blur(35px)",
              transform: "rotate(15deg)"
            }}
          ></div>

          {/* Closer asymmetric glow */}
          <div 
            className="absolute -inset-12 z-0"
            style={{
              background: `
                radial-gradient(
                  ellipse 120% 140% at 55% 40%,
                  rgba(99, 81, 72, 0.6) 0%,
                  rgba(99, 81, 72, 0.3) 30%,
                  rgba(99, 81, 72, 0.1) 60%,
                  transparent 90%
                )
              `,
              filter: "blur(25px)",
              transform: "rotate(-5deg)"
            }}
          ></div>
        
          {/* Image container */}
          <div 
            className="relative w-full aspect-square rounded-full overflow-hidden flex items-center justify-center z-10"
            style={{ 
              background: "linear-gradient(135deg, #635148 0%, #4A3C36 100%)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4), inset 0 2px 15px rgba(255, 255, 255, 0.25)" 
            }}
          >
            {/* Ambient glow inside the circle */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(
                    ellipse 140% 140% at 60% 45%,
                    rgba(99, 81, 72, 0.7) 0%,
                    rgba(99, 81, 72, 0.4) 30%,
                    rgba(99, 81, 72, 0.1) 60%,
                    transparent 100%
                  )
                `
              }}
            ></div>
            
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
            <p className="text-base md:text-xl text-white/80">
              - Customer Review
            </p>
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