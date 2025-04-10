'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';

// Define available images from the grid-gallery folder
const availableImages = [3, 4, 5, 6, 7, 8, 9, 10, 11];

// Define categories and assign images to each
const categories = {
  all: availableImages,
  mens: [3, 6, 9],
  womens: [4, 7, 10],
  kids: [5, 8, 11]
};

type CategoryType = 'all' | 'mens' | 'womens' | 'kids';

export default function MasonryGallery() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [images, setImages] = useState<number[]>(categories.all);

  useEffect(() => {
    setImages(categories[activeCategory]);
  }, [activeCategory]);

  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="w-full">
      {/* Category Filters */}
      <div className="flex flex-wrap justify-center items-center gap-6 mb-16">
        {Object.keys(categories).map((category) => (
          <div key={category} className="relative inline-block">
            <button 
              className={`relative z-10 px-8 py-3.5 font-normal text-[18px] font-['Roboto Mono'] transition-colors ${
                activeCategory === category ? "text-white" : "text-[#B3B3B2] hover:text-white"
              }`}
              onClick={() => setActiveCategory(category as CategoryType)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
            <div className="absolute inset-0 z-0 pointer-events-none">
              <svg width="100%" height="55" viewBox="0 0 100 55" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <rect 
                  x="1" y="1" 
                  width="98%" height="53" 
                  rx="10" 
                  stroke="white" 
                  strokeOpacity="1" 
                  strokeDasharray="5 5" 
                  style={{ mixBlendMode: "normal" }}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Masonry Gallery */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {images.map((imageNum) => {
          // Determine which category this image belongs to
          let imageCategory = "All";
          if (categories.mens.includes(imageNum)) imageCategory = "Mens";
          else if (categories.womens.includes(imageNum)) imageCategory = "Womens";
          else if (categories.kids.includes(imageNum)) imageCategory = "Kids";
          
          return (
            <div key={imageNum} className="overflow-hidden gallery-image-container">
              <div className="relative border border-dashed border-white/30 rounded-md overflow-hidden">
                <Image
                  src={`/images/grid-gallery/bg3 ${imageNum}.png`}
                  alt={`Abstract art ${imageNum}`}
                  width={400}
                  height={400}
                  priority
                  className="w-full h-auto object-cover gallery-image"
                />
                <div className="gallery-image-overlay">
                  <span className="inline-block bg-white/90 text-black text-xs px-2 py-1 rounded mb-2">
                    {imageCategory}
                  </span>
                  <h3 className="text-white text-sm font-medium">Abstract Art {imageNum}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </Masonry>
    </div>
  );
} 