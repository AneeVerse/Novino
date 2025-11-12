'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductVariant {
  id: string;
  name: string;
  type: 'frame' | 'color';
  price?: string;
  quantity: number;
  imageUrl?: string;
}

interface Product {
  id: string | number;
  name?: string;
  price?: string;
  image: string;
  images?: string[];
  variants?: ProductVariant[];
  categoryId?: string;
  type?: string;
  featured?: boolean;
  featuredImageUrl?: string;
  slug?: string;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [centeredCard, setCenteredCard] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefsMap = useRef<Map<number, HTMLDivElement>>(new Map());
  
  // Transform-based infinite scroll refs
  const translateX = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const totalWidth = useRef(0);
  const wasDraggingRef = useRef(false);
  
  const setCardRef = (index: number, element: HTMLDivElement | null) => {
    if (element) {
      cardRefsMap.current.set(index, element);
    } else {
      cardRefsMap.current.delete(index);
    }
  };
  
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch latest products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        
        // Get all featured products, sort by latest (createdAt)
        const featuredProducts = data
          .filter((p: any) => p.featured === true)
          .sort((a: any, b: any) => {
            // Sort by createdAt if available, otherwise by id
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
          })
          .map((p: any) => ({
            id: p.id || p._id,
            name: p.name,
            price: p.basePrice || p.price,
            image: p.featuredImageUrl || p.images?.[0] || p.image || "/images/placeholder.png",
            images: p.images || (p.image ? [p.image] : []),
            variants: p.variants || [],
            category: p.category,
            categoryId: p.category,
            type: p.type,
            featured: p.featured,
            slug: p.slug || p._id || p.id // Ensure we always have a slug in the URL so API fetch works
          }));
        
        // Duplicate products for infinite loop (like the example code)
        const duplicatedProducts = [...featuredProducts, ...featuredProducts];
        setProducts(duplicatedProducts);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Calculate total width of one set of products for infinite loop
  const calculateWidth = useCallback(() => {
    if (scrollContainerRef.current && products.length > 0) {
      const firstChild = scrollContainerRef.current.children[0] as HTMLElement;
      if (firstChild) {
        // Get the original products count (half of duplicated)
        const originalCount = products.length / 2;
        const cardWidth = firstChild.offsetWidth;
        // Get computed gap from CSS (gap-8 = 32px on mobile, gap-12 = 48px on desktop)
        const computedStyle = window.getComputedStyle(scrollContainerRef.current);
        const gap = parseFloat(computedStyle.gap) || 32;
        totalWidth.current = (cardWidth + gap) * originalCount;
      }
    }
  }, [products]);

  // Detect centered card based on current transform position
  const detectCenteredCard = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !container.parentElement) return;

    // Use the parent container (the overflow-hidden wrapper) to get the viewport center
    const parentRect = container.parentElement.getBoundingClientRect();
    const viewportCenter = parentRect.left + parentRect.width / 2;

    let closestCardIndex: number | null = null;
    let closestDistance = Infinity;

    // Check all cards for center detection
    cardRefsMap.current.forEach((card, index) => {
      if (!card) return;

      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(viewportCenter - cardCenter);

      // Pick the closest card to the viewport's center
      if (distance < closestDistance) {
        closestDistance = distance;
        closestCardIndex = index;
      }
    });

    // Only update if the centered card actually changed
    setCenteredCard(prev => {
      if (prev !== closestCardIndex) {
        return closestCardIndex;
      }
      return prev;
    });
  }, []);

  // Continuous centered card detection with requestAnimationFrame
  useEffect(() => {
    if (products.length === 0) return;
    
    let rafId: number | null = null;
    const updateCenter = () => {
      detectCenteredCard();
      rafId = requestAnimationFrame(updateCenter);
    };

    // Initial detection after layout
    setTimeout(detectCenteredCard, 100);
    
    // Start continuous detection loop
    rafId = requestAnimationFrame(updateCenter);
    window.addEventListener('resize', detectCenteredCard);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', detectCenteredCard);
    };
  }, [products, detectCenteredCard]);

  // Handle Pointer Events for Drag with Infinite Loop (same logic as CreativeSection)
  const handlePointerDown = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent text selection and default behaviors
    isDragging.current = true;
    wasDraggingRef.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    scrollLeft.current = translateX.current;
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e: React.PointerEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    
    e.preventDefault(); // Prevent default touch/pointer behaviors
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX;
    const walk = (x - startX.current) * 2; // Same sensitivity as CreativeSection
    translateX.current = scrollLeft.current + walk;
    
    // Infinite loop logic - exact same as CreativeSection
    if (totalWidth.current > 0) {
      // Moving right (negative translateX, showing later cards)
      if (Math.abs(translateX.current) >= totalWidth.current) {
        translateX.current = 0; // Reset to beginning
        scrollLeft.current = 0;
        startX.current = x;
      }
      // Moving left (positive translateX, going backwards) - wrap around to end
      else if (translateX.current > 0) {
        translateX.current = -totalWidth.current + translateX.current;
        scrollLeft.current = translateX.current;
        startX.current = x;
      }
    }
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.transform = `translateX(${translateX.current}px)`;
    }
    
    // Mark as dragging if moved significantly
    if (Math.abs(walk) > 5) {
      wasDraggingRef.current = true;
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
    
    // Reset drag flag after a short delay
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 100);
  };

  // Initialize width calculation and setup
  useEffect(() => {
    calculateWidth();
    window.addEventListener('resize', calculateWidth);

    return () => {
      window.removeEventListener('resize', calculateWidth);
    };
  }, [calculateWidth]);

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

  // Use all featured products
  const displayProducts = products;

  return (
    <div className="container mx-auto px-0 md:px-0 mb-16 md:mb-24">
      <div className="max-w-[1440px] mx-auto px-0 md:px-0">
        <h2 className="text-white text-lg sm:text-[24px] md:text-[28px] font-medium uppercase leading-[1.2em] md:leading-[1.171875em]  text-center font-['Roboto_Mono']">
          FEATURED PRODUCTS
        </h2>
        
        {/* Mobile & Desktop: Transform-based infinite scroll; desktop shows 3 cards */}
        <div 
          className="mt-6 overflow-hidden relative pb-12 md:pb-16"
          style={{ 
            paddingTop: '3rem',
            paddingBottom: '4rem'
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <div
            ref={scrollContainerRef}
            className="flex gap-8 md:gap-12 px-4 md:px-6 items-start w-max will-change-transform cursor-grab active:cursor-grabbing select-none"
            style={{
              transform: `translateX(${translateX.current}px)`,
            }}
          >
          {displayProducts.map((product, index) => {
            const isCentered = centeredCard === index;
            
            return (
              <div
                key={`${product.id}-${index}`}
                ref={(el) => setCardRef(index, el)}
                className={`flex flex-col relative w-[75%] min-w-[75%] md:w-[calc((1440px-96px)/3)] md:min-w-[calc((1440px-96px)/3)] flex-none ${isCentered ? 'z-10' : 'z-0'}`}
                style={{ 
                  willChange: 'transform'
                }}
              >
                <Link 
                  href={`/product/${product.slug || String(product.id)}`}
                  className="block w-full cursor-pointer"
                  style={{ cursor: 'inherit' }}
                  draggable={false}
                  onClick={(e) => {
                    // Prevent navigation if user was dragging
                    if (wasDraggingRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <div 
                    className="relative w-full bg-[#2D2D2D] overflow-hidden rounded-sm"
                    style={{
                      aspectRatio: '1 / 1',
                      transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.7s cubic-bezier(0.4, 0, 0.2, 1), filter 0.7s ease',
                      transform: isCentered ? 'scale(1.18) translateY(-16px)' : 'scale(0.96)',
                      boxShadow: isCentered 
                        ? isMobile 
                          ? '0 15px 30px -10px rgba(0, 0, 0, 0.4), 0 8px 16px -8px rgba(0, 0, 0, 0.3)' 
                          : '0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 12px 24px -8px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06)'
                        : isMobile
                          ? '0 4px 8px -2px rgba(0, 0, 0, 0.2)'
                          : '0 6px 12px -3px rgba(0, 0, 0, 0.3), 0 3px 6px -2px rgba(0, 0, 0, 0.2)',
                      filter: isCentered ? 'brightness(1.08) contrast(1.02)' : 'brightness(0.88) contrast(0.95)'
                    }}
                  >
                    {/* Image wrapper - NO hover effects */}
                    <div 
                      className="relative w-full h-full transform-gpu origin-center"
                    >
                      {/* Main Image - Always show first image, no hover change */}
                      <Image
                        src={product.image || "/images/placeholder.png"}
                        alt={product.name || "Featured product"}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, calc((1440px - 96px) / 3)"
                      />
                    </div>

                    {/* Product Name - Bottom Left */}
                    {product.name && (
                      <div className="absolute bottom-0 left-0 p-4 z-20">
                        <h3 className="text-white text-xs sm:text-sm md:text-base font-['Roboto_Mono'] uppercase leading-tight">
                          {product.name}
                        </h3>
                      </div>
                    )}

                    {/* Price - Only show on centered card, bottom right */}
                    {isCentered && product.price && (
                      <div className="absolute bottom-0 right-0 p-4 z-20">
                        <div className="text-white text-xs sm:text-sm md:text-base font-['Roboto_Mono'] text-right">
                          {product.price.startsWith('$') ? product.price : `$${product.price}`}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}

