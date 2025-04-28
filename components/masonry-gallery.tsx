'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import Link from 'next/link';

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

type CategoryType = 'all' | string;

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
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{[key: string]: string}>({
    all: 'All'
  });
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        
        // Build category mapping
        const catMap: {[key: string]: string} = { all: 'All' };
        data.forEach((cat: any) => {
          if (cat.type === 'painting') {
            const id = cat._id || cat.id;
            if (id) catMap[id] = cat.name;
          }
        });
        
        setCategories(catMap);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
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
  
  // Filter products based on active category
  const filteredProducts = products.filter(product => {
    if (activeCategory === 'all') return true;
    return product.category === activeCategory || product.categoryId === activeCategory;
  });

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
        {Object.entries(categories).map(([categoryId, categoryName]) => (
          <div key={categoryId} className="relative inline-block my-4">
            <button 
              className={`relative z-10 px-3 sm:px-5 py-2 font-normal text-sm font-['Roboto Mono'] transition-colors ${
                activeCategory === categoryId ? "text-white" : "text-[#B3B3B2] hover:text-white"
              }`}
              onClick={() => setActiveCategory(categoryId)}
            >
              {categoryName}
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
        <div className="hidden sm:flex w-full sm:w-auto mt-4 sm:mt-0 sm:absolute right-4 sm:right-6 z-10 justify-center sm:justify-end">
          <Link href="/paintings" className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-white/10 transition-colors text-sm sm:text-base cursor-pointer" style={{ borderRadius: '10px' }}>
            View all
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
              <path d="M14 16L18 12M18 12L14 8M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="text-white text-lg">Loading gallery...</div>
        </div>
      )}

      {/* Masonry Gallery (Desktop) */}
      {!loading && (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {filteredProducts.map((product) => (
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
                  <span className="inline-block bg-white/90 text-black text-xs px-2 py-1 rounded mb-1">
                    {categories[product.categoryId || ''] || categories[product.category] || 'Painting'}
                  </span>
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
          {filteredProducts.map((product) => (
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
                  <span className="inline-block bg-white/90 text-black text-xs px-2 py-1 rounded mb-1">
                    {categories[product.categoryId || ''] || categories[product.category] || 'Painting'}
                  </span>
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
        <Link href="/paintings" className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-white/10 transition-colors text-sm sm:text-base cursor-pointer" style={{ borderRadius: '10px' }}>
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