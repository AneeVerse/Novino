'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string | number;
  name?: string;
  price?: string;
  image: string;
  categoryId?: string;
  type?: string;
  featured?: boolean;
  featuredImageUrl?: string;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch latest products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        
        // Get featured products, sort by latest (createdAt), and take first 3
        const featuredProducts = data
          .filter((p: any) => p.featured === true)
          .sort((a: any, b: any) => {
            // Sort by createdAt if available, otherwise by id
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
          })
          .slice(0, 3) // Get only the latest 3
          .map((p: any) => ({
            id: p.id || p._id,
            name: p.name,
            price: p.basePrice || p.price,
            image: p.featuredImageUrl || p.images?.[0] || p.image || "/images/placeholder.png",
            category: p.category,
            categoryId: p.category,
            type: p.type,
            featured: p.featured
          }));
        
        setProducts(featuredProducts);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-0 mb-16">
        <div className="flex justify-center items-center h-96">
          <div className="text-white font-['Roboto_Mono']">Loading...</div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  // Ensure we have exactly 3 products (pad with empty if needed)
  const displayProducts = [...products].slice(0, 3);
  while (displayProducts.length < 3) {
    displayProducts.push({
      id: `placeholder-${displayProducts.length}`,
      name: '',
      price: '',
      image: '/images/placeholder.png',
    });
  }

  return (
    <div className="container mx-auto px-4 md:px-0 mb-6">
      <div className="max-w-[2400px] mx-auto">
        <h2 className="text-white text-lg sm:text-[24px] md:text-[28px] font-medium uppercase leading-[1.2em] md:leading-[1.171875em]  text-center font-['Roboto_Mono']">
          FEATURED PRODUCTS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mt-6">
          {/* Left Product - Smaller height */}
          <div className="flex flex-col relative">
            <Link 
              href={`/product/${displayProducts[0].id}`}
              className="block group"
            >
              <div className="relative w-full h-[400px] md:h-[450px] lg:h-[500px] bg-[#2D2D2D] overflow-visible mb-8">
                <Image
                  src={displayProducts[0].image || "/images/placeholder.png"}
                  alt={displayProducts[0].name || "Featured product"}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="transition-transform group-hover:opacity-90"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              {displayProducts[0].name && (
                <div className="text-center relative z-10">
                  <h3 className="text-white text-sm md:text-base font-['Roboto_Mono'] uppercase">
                    {displayProducts[0].name}
                  </h3>
                  {displayProducts[0].price && (
                    <p className="text-white/70 text-xs md:text-sm font-['Roboto_Mono']">
                      {displayProducts[0].price}
                    </p>
                  )}
                </div>
              )}
            </Link>
          </div>

          {/* Middle Product - Taller height */}
          <div className="flex flex-col relative">
            <Link 
              href={`/product/${displayProducts[1].id}`}
              className="block group"
            >
              <div className="relative w-full h-[500px] md:h-[550px] lg:h-[600px] bg-[#2D2D2D] overflow-visible mb-8">
                <Image
                  src={displayProducts[1].image || "/images/placeholder.png"}
                  alt={displayProducts[1].name || "Featured product"}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="transition-transform group-hover:opacity-90"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              {displayProducts[1].name && (
                <div className="text-center relative z-10">
                  <h3 className="text-white text-sm md:text-base font-['Roboto_Mono'] uppercase">
                    {displayProducts[1].name}
                  </h3>
                  {displayProducts[1].price && (
                    <p className="text-white/70 text-xs md:text-sm font-['Roboto_Mono']">
                      {displayProducts[1].price}
                    </p>
                  )}
                </div>
              )}
            </Link>
          </div>

          {/* Right Product - Smaller height */}
          <div className="flex flex-col relative">
            <Link 
              href={`/product/${displayProducts[2].id}`}
              className="block group"
            >
              <div className="relative w-full h-[400px] md:h-[450px] lg:h-[500px] bg-[#2D2D2D] overflow-visible mb-8">
                <Image
                  src={displayProducts[2].image || "/images/placeholder.png"}
                  alt={displayProducts[2].name || "Featured product"}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="transition-transform group-hover:opacity-90"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              {displayProducts[2].name && (
                <div className="text-center relative z-10">
                  <h3 className="text-white text-sm md:text-base font-['Roboto_Mono'] uppercase">
                    {displayProducts[2].name}
                  </h3>
                  {displayProducts[2].price && (
                    <p className="text-white/70 text-xs md:text-sm font-['Roboto_Mono']">
                      {displayProducts[2].price}
                    </p>
                  )}
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

