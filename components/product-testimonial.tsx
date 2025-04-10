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
    console.log("Component mounted - ready for interaction");
  }, []);
  
  // Simplified approach to handle testimonial changes
  const changeTestimonial = (index: number) => {
    console.log("changeTestimonial called with index:", index);
    console.log("Current state - currentIndex:", currentIndex, "isTransitioning:", isTransitioning);
    
    // Force reset isTransitioning if it's been true for too long (safety measure)
    if (isTransitioning) {
      console.log("Force resetting isTransitioning state");
      setIsTransitioning(false);
    }
    
    // Only proceed if trying to move to a different slide
    if (index !== currentIndex) {
      console.log("Condition passed, starting transition to index:", index);
      setIsTransitioning(true);
      setCurrentIndex(index);
      
      // Reset the transition state after animation completes
      console.log("Setting timeout to reset transition state after 600ms");
      setTimeout(() => {
        console.log("Timeout completed, setting isTransitioning to false");
        setIsTransitioning(false);
      }, 600);
    } else {
      console.log("Transition blocked - same index:", index === currentIndex);
    }
  };

  const nextTestimonial = () => {
    console.log("Next button clicked");
    const nextIndex = (currentIndex + 1) % testimonials.length;
    console.log("Calculated next index:", nextIndex);
    changeTestimonial(nextIndex);
  };

  const prevTestimonial = () => {
    console.log("Previous button clicked");
    const prevIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    console.log("Calculated previous index:", prevIndex);
    changeTestimonial(prevIndex);
  };
  
  // Safety timeout to reset isTransitioning if it gets stuck
  useEffect(() => {
    if (isTransitioning) {
      const safetyTimer = setTimeout(() => {
        setIsTransitioning(false);
        console.log("Safety timeout: reset isTransitioning state");
      }, 1000);
      
      return () => clearTimeout(safetyTimer);
    }
  }, [isTransitioning]);

  const current = testimonials[currentIndex];

  return (
    <section
      className="relative w-full py-16 md:py-24 overflow-visible bg-transparent"
    >
      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24 px-4 md:px-8 overflow-visible">
        {/* Product Image in Circle */}
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
            <div className={`relative w-[95%] h-[95%] z-10 py-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <Image
                src={current.image}
                alt={current.altText}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="flex-1 ml-auto relative text-white" style={{ fontFamily: '"IvyMode", serif' }}>
          <div className="flex">
            {/* Main content */}
            <div className="flex-1 space-y-8 md:space-y-10 pr-8">
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
                <blockquote className={`text-2xl md:text-[40px] font-normal leading-tight transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} style={{ fontFamily: '"IvyMode", serif' }}>
                  "{current.quote}"
                </blockquote>
                <p className={`text-base md:text-xl text-white/80 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} style={{ fontFamily: '"IvyMode", serif' }}>- {current.author}</p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex flex-col space-y-4 mt-6 z-20">
              {/* Right arrow (for next) */}
              <button 
                onClick={nextTestimonial}
                className="w-12 h-12 flex items-center justify-center relative cursor-pointer hover:bg-white/10 rounded-full transition-colors"
                disabled={isTransitioning}
                aria-label="Next testimonial"
                type="button"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/Arrow Right.png"
                    alt="Next"
                    width={24}
                    height={24}
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
              </button>
              
              {/* Dots indicators */}
              <div className="flex flex-col space-y-2 items-center py-2">
                {testimonials.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => changeTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'}`}
                    aria-label={`Go to testimonial ${index + 1}`}
                    disabled={isTransitioning}
                    type="button"
                  />
                ))}
              </div>
              
              {/* Left arrow (for previous) */}
              <button 
                onClick={prevTestimonial}
                className="w-12 h-12 flex items-center justify-center relative cursor-pointer hover:bg-white/10 rounded-full transition-colors"
                disabled={isTransitioning}
                aria-label="Previous testimonial"
                type="button"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/Arrow Left.png"
                    alt="Previous"
                    width={24}
                    height={24}
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
              </button>
            </div>
          </div>
          
          {/* Hidden dot indicators removed since we now have visible ones */}
        </div>
      </div>
    </section>
  )
}
