'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import Link from 'next/link';
import { Loader } from './blog-section';

// We'll replace the static image configuration with API data
// const availableImages = Array.from({ length: 12 }, (_, i) => i + 1);

// Define categories for filtering
// We'll fetch these from the API instead
// const categories = {
//   all: availableImages,
//   mens: [1, 3, 6, 9, 11],
//   womens: [2, 4, 7, 10],
//   kids: [5, 8]
// };

interface Product {
  id: string | number;
  name?: string;
  price?: string;
  image: string;
  category: string;
  categoryId?: string;
  type: string;
}

export default function MasonryGallery() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        
        // Filter only paintings and map to our desired format
        const paintingProducts = data
          .filter((p: any) => p.type === 'painting')
          .map((p: any) => ({
            id: p.id || p._id,
            name: p.name,
            price: p.basePrice || p.price,
            image: p.images?.[0] || p.image,
            category: p.category, 
            categoryId: p.category,
            type: p.type
          }));
        
        setProducts(paintingProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Configure for more columns to match Figma design
  const breakpointColumnsObj = {
    default: 5,
    1200: 4,
    992: 3,
    768: 2,
    500: 1
  };

  return (
    // Add border around the entire gallery using CSS instead of background image
    <div
      className="relative w-full p-6 sm:p-8 overflow-hidden rounded-[28px]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='28' ry='28' stroke='rgba(255,255,255,0.8)' stroke-width='3' stroke-dasharray='20%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
      }}
    >
      {/* Left side overlay */}
      <div
        className="pointer-events-none absolute inset-y-[-10%] -left-[260px] w-[520px]"
        style={{ zIndex: 20 }}
      >
        <div className="hidden h-full w-full rounded-[32px] bg-gradient-to-r from-white/30 via-white/5 to-transparent blur-[110px] opacity-80 sm:block" />
      </div>

      {/* Right side overlay */}
      <div
        className="pointer-events-none absolute inset-y-[-10%] -right-[260px] w-[520px]"
        style={{ zIndex: 20 }}
      >
        <div className="hidden h-full w-full rounded-[32px] bg-gradient-to-l from-white/25 via-white/5 to-transparent blur-[110px] opacity-80 sm:block" />
      </div>
      
      {/* View all button (Desktop/Tablet) - Hidden on mobile */}
      <div className="hidden sm:flex justify-end mb-8 sm:mb-12 mt-8 relative z-10">
        <Link href="/paintings" className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-[#AE876D]/80 transition-colors text-sm sm:text-base cursor-pointer" style={{ borderRadius: '10px' }}>
          View all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
            <path d="M14 16L18 12M18 12L14 8M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <Loader />
      )}

      {/* Masonry Gallery (Desktop) */}
      {!loading && (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {products.map((product) => (
            <div key={product.id} className="overflow-hidden gallery-image-container md:mb-3">
              <Link href={`/product/${product.id}`} className="relative border-0 rounded-sm overflow-hidden block">
                <Image
                  src={product.image || "/images/placeholder.png"}
                  alt={product.name || "Painting"}
                  width={280}
                  height={280}
                  priority
                  className="w-full h-auto object-cover gallery-image"
                />
                <div className="gallery-image-overlay">
                  <h3 className="text-white text-xs font-medium">
                    {product.name} {product.price && `- ${product.price}`}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </Masonry>
      )}

      {/* Horizontal Scroll Gallery (Mobile) */}
      {!loading && (
        <div className="mobile-scroll-gallery flex overflow-x-auto space-x-3 pb-4 scrollbar-hide pl-1">
          {products.map((product) => (
            <div key={`mobile-${product.id}`} className="overflow-hidden gallery-image-container w-52 sm:w-60 flex-shrink-0">
              <Link href={`/product/${product.id}`} className="relative border-0 rounded-sm overflow-hidden block">
                <Image
                  src={product.image || "/images/placeholder.png"}
                  alt={product.name || "Painting"}
                  width={280}
                  height={280}
                  priority
                  className="w-full h-auto object-cover gallery-image"
                />
                <div className="gallery-image-overlay">
                  <h3 className="text-white text-xs font-medium">
                    {product.name} {product.price && `- ${product.price}`}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Shop Now button 2 (Mobile) - Shown only on mobile, below gallery */}
      <div className="flex sm:hidden w-full mt-6 z-10 justify-center">
        <Link href="/paintings" className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-[#AE876D]/80 transition-colors text-sm sm:text-base cursor-pointer" style={{ borderRadius: '10px' }}>
          View all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
            <path d="M14 16L18 12M18 12L14 8M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {/* Add some CSS for the masonry grid */}
      <style jsx global>{`
        .my-masonry-grid {
          display: flex; 
          width: auto;
          margin-left: -8px;
        }
        
        .my-masonry-grid_column {
          padding-left: 8px;
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
            margin-left: -4px;
          }
          
          .my-masonry-grid_column {
            padding-left: 4px;
          }
          
          .gallery-image-overlay {
            opacity: 1;
          }
        }
        
        /* Mobile Scroll Gallery Styles */
        .mobile-scroll-gallery {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .mobile-scroll-gallery::-webkit-scrollbar {
          display: none;
        }
        
        /* Media Query to show/hide based on screen size */
        @media (min-width: 768px) {
          .mobile-scroll-gallery {
            display: none;
          }
          
          .my-masonry-grid {
            display: flex;
          }
        }
        
        @media (max-width: 767px) {
          .mobile-scroll-gallery {
            display: flex;
          }
          
          .my-masonry-grid {
            display: none;
          }
        }
      `}</style>
    </div>
  );
} 