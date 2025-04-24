'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';

// Define a larger set of available images from the grid-gallery folder
const availableImages = Array.from({ length: 12 }, (_, i) => i + 1);

// Define categories and assign images to each
const categories = {
  all: availableImages,
  mens: [1, 3, 6, 9, 11],
  womens: [2, 4, 7, 10],
  kids: [5, 8]
};

type CategoryType = 'all' | 'mens' | 'womens' | 'kids';

export default function MasonryGallery() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [images, setImages] = useState<number[]>(categories.all);

  useEffect(() => {
    setImages(categories[activeCategory]);
  }, [activeCategory]);

  // Configure for more columns to match Figma design
  const breakpointColumnsObj = {
    default: 5,
    1200: 4,
    992: 3,
    768: 2,
    500: 1
  };

  return (
    // Add border around the entire gallery
    <div className="w-full p-3 sm:p-4 relative" style={{ 
      backgroundImage: "url('/Container (2).png')",
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      backgroundOrigin: "border-box",
      overflow: "visible"
    }}>
      {/* Left side overlay */}
      <div className="absolute top-[-20%] -left-[300px] w-[800px] h-[120%] pointer-events-none" style={{
        zIndex: 20
      }}>
        <Image 
          src="/Ellipse 2 (1).png"
          alt="Left overlay effect"
          fill
          style={{ objectFit: 'contain', opacity: 0.8 }}
          priority
          className="mix-blend-screen"
        />
      </div>

      {/* Right side overlay */}
      <div className="absolute top-[5%] -right-[300px] w-[800px] h-[120%] pointer-events-none" style={{
        zIndex: 20
      }}>
        <Image 
          src="/Ellipse 4.png"
          alt="Right overlay effect"
          fill
          style={{ objectFit: 'contain', opacity: 0.8 }}
          priority
          className="mix-blend-screen"
        />
      </div>
      
      {/* Category Filters - Adjusted main container margin for mobile */}
      <div className="flex flex-wrap justify-center items-center gap-2 xs:gap-3 sm:gap-4 mb-8 sm:mb-12 mt-8 relative">
        {Object.keys(categories).map((category) => (
          <div key={category} className="relative inline-block my-4">
            <button 
              className={`relative z-10 px-3 sm:px-5 py-2 font-normal text-sm font-['Roboto Mono'] transition-colors ${
                activeCategory === category ? "text-white" : "text-[#B3B3B2] hover:text-white"
              }`}
              onClick={() => setActiveCategory(category as CategoryType)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
            <div className="absolute inset-0 z-0 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 100 55" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <rect 
                  x="1" y="1" 
                  width="98%" height="53" 
                  rx="10" 
                  stroke="white" 
                  strokeOpacity="1" 
                  strokeDasharray="16 4" 
                  style={{ mixBlendMode: "normal" }}
                />
              </svg>
            </div>
          </div>
        ))}
        
        {/* Shop Now button 1 (Desktop/Tablet) - Hidden on mobile */}
        {/* Added hidden sm:flex */}
        <div className="hidden sm:flex w-full sm:w-auto mt-4 sm:mt-0 sm:absolute right-4 sm:right-6 z-10 justify-center sm:justify-end">
          <button className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-white/10 transition-colors text-sm sm:text-base cursor-pointer" style={{ borderRadius: '10px' }}>
            View all
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
              <path d="M14 16L18 12M18 12L14 8M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Masonry Gallery (Desktop) - Controlled by CSS now */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        // Removed hidden md:flex, CSS handles display
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {images.map((imageNum) => {
          // Use modulo to handle more images than we might have available
          const imgIndex = (imageNum % 12) + 1;
          
          // Determine which category this image belongs to
          let imageCategory = "All";
          if (categories.mens.includes(imageNum)) imageCategory = "Mens";
          else if (categories.womens.includes(imageNum)) imageCategory = "Womens";
          else if (categories.kids.includes(imageNum)) imageCategory = "Kids";
          
          return (
            // Added md:mb-3 for desktop margin
            <div key={imageNum} className="overflow-hidden gallery-image-container md:mb-3">
              <div className="relative border-0 rounded-sm overflow-hidden">
                <Image
                  src={`/images/grid-gallery/bg3 ${imgIndex}.png`}
                  alt={`Abstract art ${imgIndex}`}
                  width={280}
                  height={280}
                  priority
                  className="w-full h-auto object-cover gallery-image"
                />
                <div className="gallery-image-overlay">
                  <span className="inline-block bg-white/90 text-black text-xs px-2 py-1 rounded mb-1">
                    {imageCategory}
                  </span>
                  <h3 className="text-white text-xs font-medium">Abstract Art {imgIndex}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </Masonry>

      {/* Horizontal Scroll Gallery (Mobile) - Controlled by CSS now */}
      {/* Added mobile-scroll-gallery class, removed md:hidden */}
      <div className="mobile-scroll-gallery flex overflow-x-auto space-x-3 pb-4 scrollbar-hide pl-1">
        {images.map((imageNum) => {
          // Use modulo to handle more images than we might have available
          const imgIndex = (imageNum % 12) + 1;
          
          // Determine which category this image belongs to
          let imageCategory = "All";
          if (categories.mens.includes(imageNum)) imageCategory = "Mens";
          else if (categories.womens.includes(imageNum)) imageCategory = "Womens";
          else if (categories.kids.includes(imageNum)) imageCategory = "Kids";
          
          return (
            // Apply mobile-specific styles: fixed width, no shrinking
            <div key={`mobile-${imageNum}`} className="overflow-hidden gallery-image-container w-52 sm:w-60 flex-shrink-0">
              <div className="relative border-0 rounded-sm overflow-hidden">
                <Image
                  src={`/images/grid-gallery/bg3 ${imgIndex}.png`}
                  alt={`Abstract art ${imgIndex}`}
                  width={280} // Base width/height for aspect ratio
                  height={280} // Base width/height for aspect ratio
                  priority
                  className="w-full h-auto object-cover gallery-image"
                />
                {/* Overlay always visible on mobile (handled by existing CSS) */}
                <div className="gallery-image-overlay">
                  <span className="inline-block bg-white/90 text-black text-xs px-2 py-1 rounded mb-1">
                    {imageCategory}
                  </span>
                  <h3 className="text-white text-xs font-medium">Abstract Art {imgIndex}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shop Now button 2 (Mobile) - Shown only on mobile, below gallery */}
      {/* Added sm:hidden */}
      <div className="flex sm:hidden w-full mt-6 z-10 justify-center">
        <button className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-white/10 transition-colors text-sm sm:text-base cursor-pointer" style={{ borderRadius: '10px' }}>
          View all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
            <path d="M14 16L18 12M18 12L14 8M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Add some CSS for the masonry grid */}
      <style jsx global>{`
        .my-masonry-grid {
          /* Keep display: flex; */
          display: flex; 
          width: auto;
          margin-left: -8px; /* Smaller gap to match Figma design */
        }
        
        .my-masonry-grid_column {
          padding-left: 8px; /* Smaller horizontal spacing */
        }
        
        .gallery-image-container {
          transition: transform 0.3s ease-in-out;
          margin-bottom: 8px;
        }
        
        .gallery-image-container:hover {
          transform: translateY(-3px);
        }
        
        .gallery-image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px;
          background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }
        
        .gallery-image-container:hover .gallery-image-overlay {
          opacity: 1;
        }
        
        @media (max-width: 640px) {
          .my-masonry-grid {
            margin-left: -4px; /* Even less spacing for mobile */
          }
          
          .my-masonry-grid_column {
            padding-left: 4px; /* Even less spacing for mobile */
          }
          
          .gallery-image-overlay {
            padding: 6px;
            opacity: 1; /* Always show overlay on mobile for better UX */
          }
        }

        /* Explicitly control display based on screen size */
        @media (max-width: 767px) { /* Mobile */
          .my-masonry-grid {
            display: none !important; /* Hide Masonry */
          }
          .mobile-scroll-gallery {
            display: flex !important; /* Show Scroll */
          }
        }

        @media (min-width: 768px) { /* Desktop */
          .my-masonry-grid {
            display: flex !important; /* Show Masonry (as required by library) */
          }
          .mobile-scroll-gallery {
            display: none !important; /* Hide Scroll */
          }
        }

        /* Utility to hide scrollbars (optional but often desired for horizontal scroll) */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
} 