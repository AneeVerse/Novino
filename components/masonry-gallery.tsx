'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import Link from 'next/link';
import { Loader } from './blog-section';
import { formatPrice, getProductUrl } from '@/lib/utils';

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

  // Define different fixed heights for images to create varied shapes (cycling pattern)
  const getImageSize = (index: number) => {
    const sizes = [
      { height: '280px' },      // Image 1 - Medium square-ish
      { height: '320px' },      // Image 2 - Taller
      { height: '240px' },      // Image 3 - Shorter
      { height: '380px' },      // Image 4 - Very tall
      { height: '260px' },      // Image 5 - Medium
      { height: '340px' },      // Image 6 - Tall
      { height: '220px' },      // Image 7 - Short
      { height: '300px' },      // Image 8 - Medium tall
    ];
    return sizes[index % sizes.length];
  };

  // Define different aspect ratios for mobile to create varied shapes
  const getMobileAspectRatio = (index: number) => {
    const ratios = [
      '1/1',      // Image 1 - Square
      '4/3',      // Image 2 - Landscape
      '3/4',      // Image 3 - Portrait
      '16/9',     // Image 4 - Wide landscape
      '2/3',      // Image 5 - Portrait
      '1/1',      // Image 6 - Square
      '5/4',      // Image 7 - Slightly tall
      '4/5',      // Image 8 - Portrait
    ];
    return ratios[index % ratios.length];
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
      
      {/* Main Title and Subtitle */}
      <div className="relative z-10 mb-8 sm:mb-12 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wider mb-2">
              PAINTING
            </h2>
            <p className="text-white/80 text-sm sm:text-base">
              Explore our collection of exquisite paintings
            </p>
          </div>
          {/* View all button (Desktop/Tablet) - Hidden on mobile */}
          <div className="hidden sm:flex">
            <Link href="/paintings" className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-[#AE876D]/80 transition-colors text-sm sm:text-base cursor-pointer" style={{ borderRadius: '10px' }}>
              View all
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
                <path d="M14 16L18 12M18 12L14 8M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
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
          {products.map((product, index) => {
            const sizeConfig = getImageSize(index);
            const productLink = getProductUrl({
              id: product.id,
              slug: (product as any)?.slug,
              category: product.category,
              name: product.name,
              title: product.name,
              type: product.type
            });
            return (
              <div key={product.id} className="overflow-hidden gallery-image-container md:mb-3">
                <Link href={productLink} className="relative border-0 rounded-sm overflow-hidden block w-full">
                  {/* Product name above image */}
                  <div className="gallery-card-heading">
                    <span className="text-white text-xs font-semibold uppercase tracking-wider">
                      {product.name || "Painting"}
                    </span>
                  </div>
                  <div 
                    className="relative w-full gallery-image-wrapper"
                    style={{
                      height: sizeConfig.height,
                      width: '100%',
                    }}
                  >
                    {/* Fixed height container with object-cover to fill */}
                    <img
                      src={product.image || "/images/placeholder.png"}
                      alt={product.name || "Painting"}
                      className="w-full h-full object-cover gallery-image"
                      loading="lazy"
                      style={{ display: 'block' }}
                    />
                  </div>
                  <div className="gallery-image-overlay">
                    <h3 className="text-white text-xs font-medium">
                      {product.price && formatPrice(product.price)}
                    </h3>
                  </div>
                </Link>
              </div>
            );
          })}
        </Masonry>
      )}

      {/* Horizontal Scroll Gallery (Mobile) */}
      {!loading && (
        <div className="mobile-scroll-gallery flex overflow-x-auto space-x-4 pb-4 scrollbar-hide pl-1">
          {products.map((product, index) => {
            const aspectRatio = getMobileAspectRatio(index);
            const productLink = getProductUrl({
              id: product.id,
              slug: (product as any)?.slug,
              category: product.category,
              name: product.name,
              title: product.name,
              type: product.type
            });
            return (
              <div key={`mobile-${product.id}`} className="overflow-hidden gallery-image-container w-52 sm:w-60 flex-shrink-0">
                <Link href={productLink} className="relative border-0 rounded-sm overflow-hidden block w-full">
                  {/* Product name above image */}
                  <div className="gallery-card-heading">
                    <span className="text-white text-xs font-semibold uppercase tracking-wider">
                      {product.name || "Painting"}
                    </span>
                  </div>
                  <div 
                    className="relative w-full gallery-image-wrapper"
                    style={{
                      aspectRatio: aspectRatio,
                    }}
                  >
                    {/* Fixed aspect ratio container with object-cover to fill */}
                    <img
                      src={product.image || "/images/placeholder.png"}
                      alt={product.name || "Painting"}
                      className="w-full h-full object-cover gallery-image"
                      loading="lazy"
                      style={{ display: 'block' }}
                    />
                  </div>
                  <div className="gallery-image-overlay">
                    <h3 className="text-white text-xs font-medium">
                      {product.price && formatPrice(product.price)}
                    </h3>
                  </div>
                </Link>
              </div>
            );
          })}
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
          margin-left: -16px;
        }
        
        .my-masonry-grid_column {
          padding-left: 16px;
        }
        
        .gallery-image-container {
          transition: transform 0.3s ease-in-out;
          margin-bottom: 16px;
          width: 100%;
        }
        
        .gallery-card-heading {
          padding: 10px 0 8px 0;
          margin-bottom: 6px;
          min-height: 32px;
        }
        
        .gallery-card-heading span {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          letter-spacing: 1px;
          font-size: 11px;
          opacity: 0.9;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .gallery-image-wrapper {
          width: 100%;
          display: block;
          position: relative;
          overflow: hidden;
        }
        
        .gallery-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
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
            margin-left: -12px;
          }
          
          .my-masonry-grid_column {
            padding-left: 12px;
          }
          
          .gallery-image-container {
            margin-bottom: 12px;
          }
          
          .gallery-card-heading {
            padding: 8px 0 6px 0;
            margin-bottom: 4px;
            min-height: 28px;
          }
          
          .gallery-card-heading span {
            font-size: 10px;
            letter-spacing: 0.5px;
            -webkit-line-clamp: 2;
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