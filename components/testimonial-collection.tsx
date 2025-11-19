"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import "@fontsource/roboto-mono";
import { Loader } from './blog-section';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  _id?: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  socialIcon?: string;
}

// Sample testimonials for fallback
const sampleTestimonials = [
  {
    id: '1',
    name: "Sarah Thompson",
    location: "New York, USA",
    avatar: "/images/testimonals/sarah-thompson.png",
    rating: 5,
    comment: "StyleLoom exceeded my expectations. The gown's quality and design made me feel like a queen. Fast shipping, too!",
    socialIcon: "/images/Capa 2.png"
  },
  {
    id: '2',
    name: "Rajesh Patel",
    location: "Mumbai, India",
    avatar: "/images/testimonals/rajesh-patel.png",
    rating: 5,
    comment: "Absolutely love the style and warmth of the jacket. A perfect blend of fashion and functionality!",
    socialIcon: "/images/Capa 2.png"
  },
  {
    id: '3',
    name: "Emily Walker",
    location: "London, UK",
    avatar: "/images/testimonals/emily-walker.png",
    rating: 5,
    comment: "Adorable and comfortable! My daughter loves her new outfit. Thank you, StyleLoom, for dressing our little fashionista.",
    socialIcon: "/images/Capa 2.png"
  },
  {
    id: '4',
    name: "Michael Chen",
    location: "Singapore",
    avatar: "/images/testimonals/sarah-thompson.png", // Fallback avatar
    rating: 5,
    comment: "The attention to detail is incredible. Every stitch feels intentional. Will definitely be a returning customer.",
    socialIcon: "/images/Capa 2.png"
  },
  {
    id: '5',
    name: "Sofia Rodriguez",
    location: "Madrid, Spain",
    avatar: "/images/testimonals/emily-walker.png", // Fallback avatar
    rating: 4,
    comment: "Beautiful aesthetics and great customer service. The packaging itself was a work of art.",
    socialIcon: "/images/Capa 2.png"
  }
];

export default function TestimonialCollection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 1 },
      '(min-width: 1024px)': { slidesToScroll: 1 }
    }
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }

        const data = await response.json();

        // Process testimonials to ensure they have id
        const processedTestimonials = data.map((testimonial: any) => ({
          ...testimonial,
          id: testimonial._id || testimonial.id,
          socialIcon: testimonial.socialIcon || '/images/Capa 2.png'
        }));

        setTestimonials(processedTestimonials.length > 0 ? processedTestimonials : sampleTestimonials);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        // Fallback to sample data
        setTestimonials(sampleTestimonials);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Display loading state
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-2 mb-12 relative overflow-hidden">
      {/* Main container with dashed border - matched to Figma */}
      <div className="relative flex flex-col w-full overflow-hidden bg-zinc-900/30 backdrop-blur-sm" style={{
        boxSizing: 'border-box',
        border: '2px dashed rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
      }}>

        {/* Background Gradients */}
        <div className="absolute pointer-events-none inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
        </div>

        {/* Corner accents */}
        <div className="absolute bottom-0 left-0 w-8 sm:w-12 h-8 sm:h-12 hidden sm:block z-10 opacity-50">
          <Image
            src="/images/Abstract Design (1).png"
            alt="Corner design"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <div className="absolute bottom-0 right-0 w-8 sm:w-12 h-8 sm:h-12 hidden sm:block z-10 opacity-50">
          <Image
            src="/images/Abstract Design.png"
            alt="Corner design"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Abstract design top right */}
        <div className="absolute top-[-30px] right-[-20px] w-32 h-32 md:w-64 md:h-64 z-0 opacity-20 md:opacity-40 pointer-events-none">
          <Image
            src="/images/testimonals/abstract.png"
            alt="Abstract design"
            fill
            className="object-contain"
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-4 md:p-8">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
            <div className="max-w-2xl">
              <h1 className="text-white text-2xl md:text-4xl font-bold mb-3 font-['Roboto_Mono'] tracking-tight">
                What People Say
              </h1>
              <p className="text-gray-400 text-sm md:text-base font-['Roboto_Mono'] max-w-lg">
                Stories from those who connect with the art. Real experiences from our valued community.
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={scrollPrev}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 group"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={scrollNext}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 group"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div className="overflow-hidden -mx-4 px-4 py-4" ref={emblaRef}>
            <div className="flex touch-pan-y gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0"
                >
                  <div className="h-full p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 group flex flex-col relative">

                    {/* Quote Icon */}
                    <div className="absolute top-6 right-6 text-white/10 group-hover:text-white/20 transition-colors">
                      <Quote size={32} />
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-white/10">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-bold font-['Roboto_Mono'] text-sm md:text-base leading-tight">
                          {testimonial.name}
                        </h3>
                        <p className="text-gray-400 text-xs md:text-sm font-['Roboto_Mono'] mt-1">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex mb-2 text-[#E8B08A]">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={i < testimonial.rating ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth={i < testimonial.rating ? "0" : "1.5"}
                          className="w-4 h-4 md:w-5 md:h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-gray-300 text-sm md:text-base font-['Roboto_Mono'] leading-relaxed flex-grow">
                      "{testimonial.comment}"
                    </p>

                    {/* Social Icon */}
                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
                      <Image
                        src={testimonial.socialIcon || "/images/Capa 2.png"}
                        alt="Social platform"
                        width={18}
                        height={18}
                        className="opacity-50 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
