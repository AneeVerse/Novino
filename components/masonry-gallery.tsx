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
      
      {/* Category Filters */}
      <div className="flex flex-wrap justify-center items-center gap-2 xs:gap-3 sm:gap-4 mb-8 mt-8 relative">
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
        
        {/* Shop Now button - aligned with category buttons */}
        <div className="absolute right-4 sm:right-6 z-10">
          <button className="bg-transparent border border-white text-white px-4 py-2 rounded flex items-center gap-2 text-sm hover:bg-white/10 transition-colors">
            Shop now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 16L18 12M18 12L14 8M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Masonry Gallery */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
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
            <div key={imageNum} className="overflow-hidden gallery-image-container mb-3">
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

      {/* Add some CSS for the masonry grid */}
      <style jsx global>{`
        .my-masonry-grid {
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
      `}</style>
    </div>
  );
} 