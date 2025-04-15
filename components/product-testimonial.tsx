"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

// Testimonial data
const testimonials = [
  {
    image: "/images/notebook-white.png",
    altText: "Artistic notebook with abstract patterns",
    quote: "I've been feeling pretty stressed with my skin lately, so I picked up a set of HOLOCENA skincare. Oh my goodness!. It was AMAZING. My skin felt so soft and moisturized",
    author: "Customer Review"
  },
  {
    image: "/images/notebook-black.png",
    altText: "Black artistic notebook with abstract patterns",
    quote: "The HOLOCENA notebook has completely transformed my journaling experience. The design is stunning and the quality is exceptional!",
    author: "Happy Customer"
  },
  {
    image: "/images/cupwhite.png",
    altText: "White mug with bicycle design",
    quote: "This mug isn't just beautiful, it's become my daily companion. The design sparks conversations and it keeps my coffee hot for hours!",
    author: "Coffee Enthusiast"
  },
  {
    image: "/images/cupblack.png",
    altText: "Black mug with bicycle design",
    quote: "I've collected many mugs over the years, but this one stands out. The black finish with the artistic design makes my morning ritual special.",
    author: "Design Lover"
  }
]

export default function ProductTestimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Add debugging logs to diagnose the issue
  useEffect(() => {
    // Component mounted
  }, []);
  
  // Simplified approach to handle testimonial changes
  const changeTestimonial = (index: number) => {
    if (index !== currentIndex && !isTransitioning) {
      setIsTransitioning(true);
      
      // Reset the transition state after animation completes
      setTimeout(() => {
        setCurrentIndex(index);
        
        // Short delay before removing the transition class to ensure smooth animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, 200);
      }, 300);
    }
  };

  const nextTestimonial = () => {
    if (!isTransitioning) {
      const nextIndex = (currentIndex + 1) % testimonials.length;
      changeTestimonial(nextIndex);
    }
  };

  const prevTestimonial = () => {
    if (!isTransitioning) {
      const prevIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
      changeTestimonial(prevIndex);
    }
  };
  
  // Safety timeout to reset isTransitioning if it gets stuck
  useEffect(() => {
    if (isTransitioning) {
      const safetyTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
      
      return () => clearTimeout(safetyTimer);
    }
  }, [isTransitioning]);

  const current = testimonials[currentIndex];

  return (
    <section
      className="relative w-full py-8 sm:py-16 md:py-24 overflow-visible bg-transparent"
    >
      <div className="relative mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 md:gap-12 lg:gap-16 px-4 sm:px-6 md:px-8">
        {/* Product Image in Circle */}
        <div className="relative w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px] mx-auto md:mx-0">
          {/* Main circle container */}
          <div
            className="relative w-full overflow-visible flex items-center justify-center z-10"
            style={{
              background: "radial-gradient(circle, rgba(196, 181, 170, 0.95) 65%, rgba(196, 181, 170, 0.8) 80%, rgba(196, 181, 170, 0.5) 90%, rgba(196, 181, 170, 0.2) 95%, rgba(196, 181, 170, 0) 100%)",
              borderRadius: "50%",
              aspectRatio: "1 / 1.2",
              height: "auto",
              boxShadow: "0 0 60px rgba(196, 181, 170, 0.3)"
            }}
          >
            <div className="relative w-[95%] h-[95%] z-10 py-4 overflow-hidden">
              <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <Image
                  src={current.image}
                  alt={current.altText}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 300px, (max-width: 768px) 350px, 400px"
                  style={{ transform: 'translateZ(0)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="flex-1 relative text-white h-auto sm:h-[350px] md:h-[400px] flex items-center mt-6 md:mt-0" style={{ fontFamily: '"IvyMode", serif' }}>
          <div className="flex w-full">
            {/* Main content */}
            <div className="flex-1 space-y-4 sm:space-y-6 md:space-y-8 pr-4 sm:pr-6 relative">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide" style={{ fontFamily: '"IvyMode", serif' }}>Product Testimonials</h2>

              {/* Star Rating */}
              <div className="flex space-x-3 sm:space-x-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Quote */}
              <div className="relative min-h-[180px] sm:min-h-[200px] md:min-h-[220px]">
                <div className={`absolute inset-0 flex flex-col justify-center transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <blockquote className="text-base sm:text-lg md:text-2xl lg:text-3xl font-normal leading-tight" style={{ fontFamily: '"IvyMode", serif' }}>
                    "{current.quote}"
                  </blockquote>
                  <p className="text-sm sm:text-base md:text-lg text-white/80 mt-2 sm:mt-3" style={{ fontFamily: '"IvyMode", serif' }}>- {current.author}</p>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex flex-col h-[220px] sm:h-[240px] justify-between items-center py-4">
              {/* Right arrow (for next) */}
              <button 
                onClick={nextTestimonial}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center relative cursor-pointer hover:bg-white/10 rounded-full transition-colors"
                disabled={isTransitioning}
                aria-label="Next testimonial"
                type="button"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/Arrow Right.png"
                    alt="Next"
                    width={16}
                    height={16}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
              </button>
              
              {/* Dots indicators */}
              <div className="flex flex-col space-y-3 sm:space-y-4 items-center">
                {testimonials.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => changeTestimonial(index)}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'}`}
                    aria-label={`Go to testimonial ${index + 1}`}
                    disabled={isTransitioning}
                    type="button"
                  />
                ))}
              </div>
              
              {/* Left arrow (for previous) */}
              <button 
                onClick={prevTestimonial}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center relative cursor-pointer hover:bg-white/10 rounded-full transition-colors"
                disabled={isTransitioning}
                aria-label="Previous testimonial"
                type="button"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/Arrow Left.png"
                    alt="Previous"
                    width={16}
                    height={16}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
