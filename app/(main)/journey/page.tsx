"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import VideoSection from "@/components/video-section"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import TestimonialCollection from "@/components/testimonial-collection"
import Footer from "@/components/footer"
import ProductTestimonial from "@/components/product-testimonial"
import MasonryGallery from "@/components/masonry-gallery"
import { useState, useEffect, useRef } from "react"
import useEmblaCarousel from 'embla-carousel-react'

// Hero carousel images
const heroImages = [
  {
    src: "/images/hero-section/bg01.png",
    alt: "Journey hero image 1"
  },
  {
    src: "/images/hero-section/bg02.png", 
    alt: "Journey hero image 2"
  },
  {
    src: "/images/hero-section/bg03.png",
    alt: "Journey hero image 3"
  }
];

// Team members data
const teamMembers = [
  {
    id: 1,
    name: "ALEXANDRA CHEN",
    role: "Founder & Curator",
    image: "/images/mug-black.png"
  },
  {
    id: 2,
    name: "MARCUS THOMPSON",
    role: "Co-Founder & Art Director",
    image: "/images/mug-white.png"
  },
  {
    id: 3,
    name: "SARAH KIM",
    role: "Co-Founder & Operations",
    image: "/images/cycle1.png"
  },
  {
    id: 4,
    name: "JAMES WILSON",
    role: "Lead Curator",
    image: "/images/cycle2.png"
  },
  {
    id: 5,
    name: "ELENA RODRIGUEZ",
    role: "Marketing Director",
    image: "/images/notebook-white.png"
  },
  {
    id: 6,
    name: "MICHAEL CHANG",
    role: "Art Consultant",
    image: "/images/notebook-black.png"
  }
];

export default function JourneyPage() {
  const [activeCategory, setActiveCategory] = useState("All Team");
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    duration: 50
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(heroImages.length);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [showText, setShowText] = useState(false);

  // Initial load - delay text appearance
  useEffect(() => {
    // Delay showing text on initial load
    const timer = setTimeout(() => {
      setShowText(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle automatic sliding and slide tracking
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    setTotalSlides(emblaApi.scrollSnapList().length);

    // Initial selection
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Setup autoplay
  useEffect(() => {
    if (!emblaApi) return;

    const startAutoplay = () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
      autoplayRef.current = setTimeout(() => {
        emblaApi.scrollNext();
      }, 10000); // 10 seconds between slides
    };

    // Start autoplay
    startAutoplay();

    // Reset on slide change
    emblaApi.on('select', startAutoplay);
    emblaApi.on('pointerDown', () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    });
    emblaApi.on('pointerUp', startAutoplay);

    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
      emblaApi.off('select', startAutoplay);
      emblaApi.off('pointerDown', () => {});
      emblaApi.off('pointerUp', startAutoplay);
    };
  }, [emblaApi]);
  
  return (
    <main className="relative min-h-screen bg-[#2D2D2D] overflow-x-hidden">
      {/* Hero Section - Full width that extends to the top */}
      <div className="relative w-full h-[350px]">
        {/* Embla Carousel */}
        <div className="overflow-hidden w-full h-full" ref={emblaRef}>
          <div className="flex h-full">
            {heroImages.map((image, index) => (
              <div 
                key={index}
                className="relative flex-[0_0_100%] min-w-0 h-full"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* JOURNEY text overlay */}
        <div className="absolute inset-0 z-20 overflow-hidden" style={{ height: '350px', maxHeight: '350px' }}>
          {/* Semi-transparent light effect behind text */}
          <div 
            className="absolute w-full text-center" 
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, 44%)',
              height: '150px',
              background: '#E8B08A',
              filter: 'blur(60px)',
              opacity: 0.4,
              width: '50%',
              zIndex: -1,
              bottom: 'auto'
            }}
          ></div>
          <h1 
            className={`text-[#312F30] text-[80px] md:text-[120px] lg:text-[160px] font-dm-serif-display leading-none absolute w-full text-center ${showText ? 'animate-rise-up' : 'invisible opacity-0'}`}
            style={{ fontFamily: 'DM Serif Display, serif', top: '40%', left: '50%', transform: 'translate(-50%, 0%)' }}
          >
            JOURNEY
          </h1>
        </div>
      </div>

      {/* Clear separation from the hero section with negative margin to prevent overlap */}
      <div className="container mx-auto px-0 mt-4 z-50 relative" style={{ marginTop: '2rem', clear: 'both' }}>
        {/* OUR ARTISTIC JOURNEY Section */}
        <div className="mb-16 relative" style={{ position: 'relative', zIndex: 30 }}>
          <div className="max-w-[2400px] mx-auto pl-8">
            <div className="mb-8 sm:mb-16 p-6 rounded bg-[#2D2D2D]" style={{ position: 'relative', zIndex: 30 }}>
              <h2 className="text-white text-[24px] sm:text-[28px] md:text-[38px] font-medium uppercase leading-[1.171875em] mb-4 sm:mb-8 text-center font-['Roboto_Mono']">OUR ARTISTIC JOURNEY AND VISION</h2>
              <p className="text-white text-sm sm:text-base leading-normal text-center mx-auto max-w-3xl font-['Roboto_Mono']">Founded in 2018, Novino.io began as a passion project between three friends who shared a love for art and a vision to make extraordinary art accessible to everyone.</p>
            </div>
          </div>
        </div>

        {/* Gallery Grid - with negative margins to make it wider */}
        <div className="mb-16 relative">
          <MasonryGallery />
        </div>

        {/* Product Testimonial Section */}
        <div className="mb-16 relative z-10">
          <ProductTestimonial />
        </div>

        {/* Team Grid Section */}
        <div className="mb-16 relative z-10 font-['Roboto_Mono']">
          <div className="p-8 relative overflow-hidden max-w-[2400px] mx-auto" style={{ 
            backgroundImage: "url('/Container (2).png')",
            backgroundSize: "100% 100%", 
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            overflow: "visible"
          }}>
            {/* Bottom right overlay */}
            <div className="absolute bottom-[-90%] -right-[850px] w-[2000px] h-[220%] pointer-events-none" style={{
              zIndex: 20
            }}>
              <Image 
                src="/Ellipse 5.png"
                alt="Bottom right overlay effect"
                fill
                style={{ objectFit: 'contain', opacity: 0.8 }}
                priority
                className="mix-blend-screen"
              />
            </div>

            <div className="flex flex-col md:flex-row md:gap-8 relative z-10">
              {/* Right side: Team Grid */}
              <div className="w-full md:w-1/2 order-1 md:order-2">
                <div className="grid grid-cols-2 gap-8">
                  {teamMembers.slice(0, 2).map((member) => (
                    <div key={member.id} className="bg-white w-full max-w-[80%] mx-auto border border-white">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-contain p-4" 
                        />
                      </div>
                      <div className="p-4 bg-[#333333]">
                        <div className="text-white text-xs uppercase font-medium font-['Roboto_Mono']">{member.name}</div>
                        <div className="text-white text-sm font-medium mt-1 font-['Roboto_Mono']">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-8 mt-8">
                  {teamMembers.slice(2, 4).map((member) => (
                    <div key={member.id} className="bg-white w-full max-w-[80%] mx-auto border border-white">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-contain p-4" 
                        />
                      </div>
                      <div className="p-4 bg-[#333333]">
                        <div className="text-white text-xs uppercase font-medium font-['Roboto_Mono']">{member.name}</div>
                        <div className="text-white text-sm font-medium mt-1 font-['Roboto_Mono']">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Left side: Our Team Title */}
              <div className="w-full md:w-1/2 mb-8 md:mb-0 order-2 md:order-1">
                <div className="pl-10">
                  <div className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2 font-['Roboto_Mono']">Our Team</div>
                  <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-light mb-6 sm:mb-8 font-['Roboto_Mono']">Meet the Visionaries</h2>

                  <div className="text-white text-base mb-8 font-['Roboto_Mono'] max-w-md">
                    <p className="mb-4">
                      Our passionate team of art enthusiasts, curators, and experts work together to bring extraordinary art to your walls.
                    </p>
                    <p>
                      With backgrounds spanning fine arts, gallery management, and art history, our team ensures that every piece in our collection meets the highest standards of quality and artistic value.
                    </p>
                  </div>
                </div>
                
                {/* Two team members below on left side */}
                <div className="grid grid-cols-2 gap-8 mt-[75px] pl-10">
                  {teamMembers.slice(4, 6).map((member) => (
                    <div key={member.id} className="bg-white w-full max-w-[85%] mx-auto border border-white">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-contain p-4" 
                        />
                      </div>
                      <div className="p-4 bg-[#333333]">
                        <div className="text-white text-xs uppercase font-medium font-['Roboto_Mono']">{member.name}</div>
                        <div className="text-white text-sm font-medium mt-1 font-['Roboto_Mono']">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Our Values Button */}
            <div className="mt-16 flex justify-center">
              <button className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-white/10 transition-colors text-sm sm:text-base cursor-pointer font-['Roboto_Mono']" style={{ borderRadius: '10px' }}>
                Learn about our values
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section - Full width */}
      <div className="relative w-full h-[730px] bg-[#2D2D2D] mb-32">
        <VideoSection />
      </div>

      {/* New container for remaining sections */}
      <div className="container mx-auto px-0 z-10 relative">
        {/* Testimonial Collection */}
        <div className="mb-16">
          <TestimonialCollection />
        </div>

        {/* Blog Section */}
        <div className="mb-16">
          <BlogSection />
        </div>

        {/* Wardrobe Section */}
        <div className="mb-16">
          <WardrobeSection />
        </div>

        {/* Footer Section */}
        <Footer />
      </div>

      {/* Add custom animation styles */}
      <style jsx global>{`
        @keyframes riseUp {
          0% {
            transform: translate(-50%, 200%);
            visibility: visible;
            opacity: 1;
          }
          100% {
            transform: translate(-50%, 50%);
            visibility: visible;
            opacity: 1;
          }
        }
        
        .animate-rise-up {
          animation: riseUp 2s ease-out forwards;
        }
      `}</style>
    </main>
  );
} 