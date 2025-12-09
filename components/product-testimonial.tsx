"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef, useMemo } from "react"
import "@fontsource/roboto-mono"
import "@fontsource/dm-serif-display"

type TestimonialItem = {
  image: string
  altText: string
  quote: string
  author: string
  link?: string
  category?: string
  productName?: string
}

type CategoryLink = {
  label: string
  href: string
}

type ProductTestimonialProps = {
  items?: TestimonialItem[]
  categoryLinks?: CategoryLink[]
  title?: string
  subtitle?: string
}

// Default testimonial data
const defaultTestimonials: TestimonialItem[] = [
  {
    image: "/images/notebook-white.png",
    altText: "Artistic notebook with abstract patterns",
    quote: "I've been feeling pretty stressed with my skin lately, so I picked up a set of HOLOCENA skincare. Oh my goodness!. It was AMAZING. My skin felt so soft and moisturized",
    author: "Customer Review",
    productName: "Holocena Skincare"
  },
  {
    image: "/images/notebook-black.png",
    altText: "Black artistic notebook with abstract patterns",
    quote: "The HOLOCENA notebook has completely transformed my journaling experience. The design is stunning and the quality is exceptional!",
    author: "Happy Customer",
    productName: "Holocena Notebook"
  },
  {
    image: "/images/cupwhite.png",
    altText: "White mug with bicycle design",
    quote: "This mug isn't just beautiful, it's become my daily companion. The design sparks conversations and it keeps my coffee hot for hours!",
    author: "Coffee Enthusiast",
    productName: "Cyclist Mug"
  },
  {
    image: "/images/cupblack.png",
    altText: "Black mug with bicycle design",
    quote: "I've collected many mugs over the years, but this one stands out. The black finish with the artistic design makes my morning ritual special.",
    author: "Design Lover",
    productName: "Nightfall Mug"
  }
]

export default function ProductTestimonial({
  items,
  categoryLinks = [],
  title = "Product Testimonials",
  subtitle = "Design"
}: ProductTestimonialProps) {
  const testimonials = items && items.length > 0 ? items : defaultTestimonials
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEntering, setIsEntering] = useState(false); // Track entering animation
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right'); // Track animation direction
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
  }, [items?.length]);

  // Handle touch events for swiping on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    // Save the starting touch position
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;

    // Pause autoplay during user interaction
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Update end position as touch moves
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    // Don't process swipe if already transitioning
    if (isTransitioning) return;

    // Check if we have valid touch data
    if (touchStartX.current !== null && touchEndX.current !== null &&
      touchStartY.current !== null && touchEndY.current !== null) {
      // Calculate swipe distances
      const distanceX = touchEndX.current - touchStartX.current;
      const distanceY = touchEndY.current - touchStartY.current;

      // Check if horizontal swipe is more dominant than vertical scroll
      const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

      // Minimum swipe distance to register (50px)
      const minSwipeDistance = 50;

      // Only process horizontal swipes, not vertical scrolls
      if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > minSwipeDistance) {
          // Swiped right - go to previous
          prevTestimonial();
        } else if (distanceX < -minSwipeDistance) {
          // Swiped left - go to next
          nextTestimonial();
        }
      }
    }

    // Reset touch values
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  // Add debugging logs to diagnose the issue
  useEffect(() => {
    // Component mounted
  }, []);

  // Simplified approach to handle testimonial changes with direction
  const changeTestimonial = (index: number, direction: 'left' | 'right' = 'right') => {
    if (index !== currentIndex && !isTransitioning && !isEntering) {
      setSlideDirection(direction);
      setIsTransitioning(true); // Start exit animation

      // After exit animation, change image and start enter animation
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(index);
        setIsEntering(true); // Image starts from opposite side (no transition - instant position)

        // Small delay to allow the position to be set, then enable transition for smooth slide in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsEntering(false); // This triggers the smooth slide to center
          });
        });
      }, 450);
    }
  };

  const nextTestimonial = () => {
    if (!isTransitioning) {
      const nextIndex = (currentIndex + 1) % testimonials.length;
      changeTestimonial(nextIndex, 'left'); // Scroll left = exit left, enter from right
    }
  };

  const prevTestimonial = () => {
    if (!isTransitioning) {
      const prevIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
      changeTestimonial(prevIndex, 'right'); // Scroll right = exit right, enter from left
    }
  };

  // Safety timeout to reset isTransitioning if it gets stuck
  useEffect(() => {
    if (isTransitioning) {
      const safetyTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1500); // Reduced safety timeout

      return () => clearTimeout(safetyTimer);
    }
  }, [isTransitioning]);

  // Auto-scrolling functionality - always active
  useEffect(() => {
    const startAutoplay = () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);

      autoplayRef.current = setTimeout(() => {
        nextTestimonial();
      }, 5000); // 5 seconds - smooth auto-scroll timing
    };

    startAutoplay();

    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    };
  }, [currentIndex, isTransitioning, testimonials.length]);

  const current = testimonials[currentIndex];

  // Filter categoryLinks to only show the one matching the current product's category
  const filteredCategoryLinks = useMemo(() => {
    if (!current.category || categoryLinks.length === 0) return [];

    // Normalize category names for comparison (case-insensitive)
    const currentCategoryNormalized = current.category.toUpperCase().trim();

    // Find the category link that matches the current product's category
    const matchingLink = categoryLinks.find(link => {
      const linkLabelNormalized = link.label.toUpperCase().trim();
      return linkLabelNormalized === currentCategoryNormalized;
    });

    // Return only the matching link, or empty array if no match
    return matchingLink ? [matchingLink] : [];
  }, [current.category, categoryLinks, currentIndex]);

  return (
    <>
      <style>{`
        @media (max-width: 639px) {
          .product-testimonial-oval {
            aspect-ratio: 1 / 1.35 !important;
          }
        }
        @media (min-width: 640px) {
          .product-testimonial-oval {
            aspect-ratio: 1 / 1.2 !important;
          }
        }
      `}</style>
      <section
        className="relative w-full py-8 sm:py-16 md:py-24 overflow-visible bg-transparent"
      >
        <div
          className="relative mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 sm:gap-8 md:gap-12 lg:gap-16 px-4 sm:px-4 md:px-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ touchAction: 'pan-x pan-y' }}
          onTouchEnd={handleTouchEnd}
        >
          {/* Product Image in Circle */}
          <div className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px] mx-auto md:mx-0">
            {/* Main circle container */}
            <div
              className="relative w-full overflow-visible flex items-center justify-center z-10 product-testimonial-oval"
              style={{
                background: "radial-gradient(circle, rgba(196, 181, 170, 0.95) 65%, rgba(196, 181, 170, 0.8) 80%, rgba(196, 181, 170, 0.5) 90%, rgba(196, 181, 170, 0.2) 95%, rgba(196, 181, 170, 0) 100%)",
                borderRadius: "50%",
                aspectRatio: "1 / 1.35", // Default for mobile (taller)
                height: "auto"
              }}
            >
              {/* Mobile overlay (only visible on mobile) */}
              <div
                className="absolute left-1/2 top-1/2 w-[310px] h-[370px] -translate-x-1/2 -translate-y-1/2 sm:hidden z-0"
                style={{
                  background: '#E8B08A',
                  filter: 'blur(30px)',
                  opacity: 0.2,
                  borderRadius: '30%',
                }}
              ></div>
              <div className="relative w-full h-full z-10 flex items-center justify-center py-0" style={{ overflow: 'visible' }}>
                <div className="relative w-[120%] pb-[145%] overflow-visible rounded-[36px] bg-transparent" style={{ transform: 'scale(1.4)' }}>
                  <div
                    className="absolute inset-0"
                    style={{
                      transition: isEntering ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease-out',
                      opacity: isTransitioning ? 0 : 1,
                      transform: isTransitioning
                        ? `translateX(${slideDirection === 'left' ? '-60px' : '60px'})`
                        : isEntering
                          ? `translateX(${slideDirection === 'left' ? '60px' : '-60px'})`
                          : 'translateX(0)'
                    }}
                  >
                    <Image
                      src={current.image}
                      alt={current.altText}
                      fill
                      className="object-contain transform transition-transform duration-400 ease-in-out"
                      priority
                      sizes="(max-width: 640px) 280px, (max-width: 768px) 340px, 400px"
                      style={{ transform: 'translateZ(0)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Content */}
          <div className="flex-1 relative text-white h-auto sm:h-[350px] md:h-[400px] flex items-center mt-6 md:mt-0 ml-0 md:ml-6 w-full" style={{ fontFamily: '"Roboto Mono", monospace' }}>
            <div className="flex w-full items-start">
              {/* Main content */}
              <div className="flex-1 space-y-4 sm:space-y-6 md:space-y-8 pr-1 sm:pr-6 relative min-w-0">
                {/* Background blur effect */}
                <div
                  className="absolute -top-40 -left-64 z-0"
                  style={{
                    width: '100%',
                    height: '180%',
                    background: '#E8B08A',
                    filter: 'blur(60px)',
                    opacity: 0.2,
                    borderRadius: '30%',
                    transform: 'translate(-55%, 5%) rotate(-5deg)'
                  }}
                ></div>

                {/* Design/Product Name + Category Name - Side by side on all screens */}
                <div className="flex flex-row flex-nowrap items-center gap-2 sm:gap-3 relative z-10">
                  {current.productName && (
                    <span className="text-xs sm:text-lg md:text-xl font-semibold tracking-[0.15em] text-white uppercase whitespace-nowrap" style={{ fontFamily: '"Roboto Mono", monospace' }}>
                      {current.productName}
                    </span>
                  )}
                  {current.category && (
                    <span className="text-xs sm:text-lg md:text-xl font-semibold tracking-[0.15em] text-white uppercase whitespace-nowrap" style={{ fontFamily: '"Roboto Mono", monospace' }}>
                      {current.category}
                    </span>
                  )}
                </div>

                {/* Testimonial Quote */}
                <div className="relative min-h-[180px] sm:min-h-[200px] md:min-h-[220px] z-10 overflow-hidden">
                  <div
                    className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-out ${isTransitioning ? 'opacity-0 transform translate-y-[-20px]' : 'opacity-100 transform translate-y-0'
                      }`}
                  >
                    <blockquote className="text-base sm:text-lg md:text-2xl lg:text-3xl font-normal leading-tight pr-1 sm:pr-4" style={{ fontFamily: '"DM Serif Display", serif' }}>
                      "{current.quote}"
                    </blockquote>
                    <p className="text-sm sm:text-base md:text-lg text-white/80 mt-2 sm:mt-3 italic" style={{ fontFamily: '"Roboto Mono", monospace', fontStyle: 'italic' }}>- {current.author}</p>
                    {current.link && (
                      <Link
                        href={current.link}
                        className="inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.4em] text-white/80 hover:text-white mt-4 transition-colors"
                      >
                        View Design
                        <span className="text-base leading-none">↗</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Controls - visible on mobile, positioned on right */}
              <div className="flex flex-col h-[280px] sm:h-[320px] justify-between items-center py-6 w-8 md:w-auto ml-1 sm:ml-0 flex-shrink-0">
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
                <div className="flex flex-col space-y-3 sm:space-y-5 items-center">
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
    </>
  )
}
