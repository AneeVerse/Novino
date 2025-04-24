"use client";

import { useState, useEffect } from "react";
import Image from "next/image"
import "@fontsource/roboto-mono"

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
  }
];

export default function TestimonialCollection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        
        setTestimonials(processedTestimonials);
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
      <div className="mx-2 mb-16 relative overflow-hidden">
        <div className="relative p-4 sm:p-8 flex flex-col items-start" style={{ 
          boxSizing: 'border-box',
          border: '2px dashed #FFFFFF',
          borderRadius: '20px',
          borderSpacing: '8px',
        }}>
          <div className="max-w-2xl mb-6 sm:mb-12 relative z-10">
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 font-['Roboto_Mono']">THE STYLELOOM TESTIMONIAL COLLECTION.</h1>
            <p className="text-gray-300 text-sm sm:text-base font-['Roboto_Mono']">Loading testimonials...</p>
          </div>
        </div>
      </div>
    );
  }

  // Limit to 3 testimonials for display
  const displayTestimonials = testimonials.slice(0, 3);

  return (
    <div className="mx-2 mb-16 relative overflow-visible">
      {/* Main container with dashed border - matched to Figma */}
      <div className="relative flex flex-col items-start w-full overflow-visible" style={{ 
        boxSizing: 'border-box',
        border: '2px dashed #FFFFFF',
        borderRadius: '20px',
      }}>
        {/* Middle overlay */}
        <div className="absolute top-[120%] left-[50%] w-[3000px] h-[300%] pointer-events-none" style={{
          transform: 'translate(-50%, -50%)',
          zIndex: 5
        }}>
          <Image 
            src="/Ellipse 9.png"
            alt="Middle overlay effect"
            fill
            style={{ objectFit: 'contain', opacity: 0.6 }}
            priority
            className="mix-blend-screen"
          />
        </div>

        {/* Corner accents using the provided images */}
        <div className="absolute bottom-0 left-0 w-8 sm:w-12 h-8 sm:h-12">
          <Image 
            src="/images/Abstract Design (1).png" 
            alt="Corner design" 
            width={40} 
            height={40} 
            className="object-contain"
          />
        </div>
        <div className="absolute bottom-0 right-0 w-8 sm:w-12 h-8 sm:h-12">
          <Image 
            src="/images/Abstract Design.png" 
            alt="Corner design" 
            width={40} 
            height={40} 
            className="object-contain"
          />
        </div>

        {/* Abstract design in top right - controllable positioning */}
        <div className="absolute top-[-2px] -right-12 w-0 h-0 sm:w-24 md:w-64 sm:h-24 md:h-64 overflow-visible" style={{
          // You can adjust these values to move the container
          transform: 'translate(var(--container-x, 0px), var(--container-y, 0px))'
        }}>
          <Image 
            src="/images/testimonals/abstract.png" 
            alt="Abstract design" 
            width={330} 
            height={330} 
            className="hidden sm:block object-contain max-w-none sm:scale-50 md:scale-100" 
            style={{ 
              position: 'absolute',
              // You can adjust these values to move the image within the container
              right: '50px',  // Positive moves left, negative moves right
              top: '0px',    // Positive moves down, negative moves up
              transform: 'translate(var(--image-x, 0px), var(--image-y, 0px))'
            }}
          />
        </div>

        {/* Header section */}
        <div className="w-full p-4 sm:p-8">
          <div className="max-w-2xl mb-6 sm:mb-12 relative z-10">
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 font-['Roboto_Mono']">THE STYLELOOM TESTIMONIAL COLLECTION.</h1>
            <p className="text-gray-300 text-sm sm:text-base font-['Roboto_Mono']">At StyleLoom, our customers are the heartbeat of our brand.</p>
          </div>
        </div>

        {/* Testimonials grid with dashed borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 w-full">
          {displayTestimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className={`p-4 sm:p-8 border-t-2 border-dashed border-white ${
                index === 0 ? "md:border-r-2 md:border-r-dashed md:border-r-white" : 
                index === 1 ? "md:border-r-2 md:border-r-dashed md:border-r-white" : 
                ""
              }`}
              style={{ minHeight: '100%' }}
            >
              <div className="flex items-center mb-4">
                <div className="mr-3">
                  <Image src={testimonial.avatar} alt={testimonial.name} width={50} height={50} className="rounded-full w-10 h-10 sm:w-[50px] sm:h-[50px]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm sm:text-base font-['Roboto_Mono']">{testimonial.name}</h3>
                  <p className="text-gray-300 text-xs sm:text-sm font-['Roboto_Mono']">{testimonial.location}</p>
                </div>
                <div className="ml-auto">
                  <Image src={testimonial.socialIcon || "/images/Capa 2.png"} alt="Social icon" width={16} height={16} className="object-contain w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div className="flex mb-3 sm:mb-4" style={{ color: '#E8B08A' }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                ))}
              </div>

              <p className="text-white text-sm sm:text-base break-words whitespace-normal font-['Roboto_Mono']">
                {testimonial.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

