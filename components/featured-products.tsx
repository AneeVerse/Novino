'use client';

import { useState, useEffect, useRef } from 'react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefsMap = useRef<Map<number, HTMLDivElement>>(new Map());
  
  const setCardRef = (index: number, element: HTMLDivElement | null) => {
    if (element) {
      cardRefsMap.current.set(index, element);
    } else {
      cardRefsMap.current.delete(index);
    }
  };
  
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
            slug: p.slug // Include slug for URL generation
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

  // Track scroll position to detect centered card
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout | null = null;
    let isScrolling = false;

    const handleScroll = () => {
      // Use the scroll container's visual center for detection
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let closestCardIndex: number | null = null;
      let closestDistance = Infinity;

      // Check cards for center detection
      cardRefsMap.current.forEach((card, index) => {
        if (!card) return;

        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);

        // Pick the closest card to the container's center
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
    };

    // Use requestAnimationFrame for smoother scroll detection with debouncing
    let rafId: number | null = null;
    const scrollHandler = () => {
      isScrolling = true;
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Debounce: only update after scrolling stops for better mobile performance
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          handleScroll();
          rafId = null;
        });
      }, 50); // 50ms debounce to avoid excessive updates
    };

    // Check on mount
    setTimeout(handleScroll, 100); // Delay initial check to ensure layout is ready
    
    container.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [products]);

  // Enable smooth click-and-drag horizontal scrolling with momentum
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let hasMoved = false;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let momentumId: number | null = null;

    // Detect if it's a touch device
    const isTouchDevice = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    const applyMomentum = () => {
      if (Math.abs(velocity) > 0.3) {
        container.scrollLeft -= velocity;
        velocity *= 0.93; // Slightly reduced damping for longer momentum
        momentumId = requestAnimationFrame(applyMomentum);
      } else {
        velocity = 0;
        momentumId = null;
      }
    };

    const stopMomentum = () => {
      if (momentumId) {
        cancelAnimationFrame(momentumId);
        momentumId = null;
      }
      velocity = 0;
    };

    const onPointerDown = (e: PointerEvent) => {
      // On touch devices, let native scrolling handle it
      if (isTouchDevice() && e.pointerType === 'touch') {
        return;
      }

      // Don't interfere with text selection or right-clicks
      if (e.button !== 0) return;

      const target = e.target as HTMLElement;
      
      // Allow dragging even on links for better UX
      stopMomentum();
      isDragging = true;
      startX = e.pageX;
      lastX = e.pageX;
      lastTime = Date.now();
      startScrollLeft = container.scrollLeft;
      hasMoved = false;
      
      try { 
        container.setPointerCapture(e.pointerId); 
      } catch {}
      
      container.style.cursor = 'grabbing';
      container.style.scrollSnapType = 'none'; // Disable snap while dragging
      e.preventDefault(); // Prevent text selection
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      
      e.preventDefault();
      const x = e.pageX;
      const dx = x - startX;
      const now = Date.now();
      const dt = now - lastTime;

      // Calculate velocity for momentum with higher sensitivity
      if (dt > 0) {
        velocity = (x - lastX) / dt * 25; // High momentum for smooth scrolling
      }

      // Only consider it a drag if movement is significant (more than 3px)
      if (Math.abs(dx) > 3) {
        hasMoved = true;
      }

      // High scroll sensitivity for easy scrolling with minimal effort
      const scrollSensitivity = 2.2;
      container.scrollLeft = startScrollLeft - (dx * scrollSensitivity);
      lastX = x;
      lastTime = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      
      isDragging = false;
      container.style.cursor = 'grab';
      
      // Re-enable snap after a short delay to allow momentum
      setTimeout(() => {
        container.style.scrollSnapType = 'x mandatory';
      }, 100);

      // Apply momentum scrolling
      if (Math.abs(velocity) > 0.5) {
        applyMomentum();
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      // If user dragged significantly, prevent click
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        hasMoved = false;
      }
    };

    // Mouse/Pointer events
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('click', onClickCapture, true);

    return () => {
      stopMomentum();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('click', onClickCapture, true);
    };
  }, [products]);

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
      <div className="max-w-[2400px] mx-auto px-0 md:px-0">
        <h2 className="text-white text-lg sm:text-[24px] md:text-[28px] font-medium uppercase leading-[1.2em] md:leading-[1.171875em]  text-center font-['Roboto_Mono']">
          FEATURED PRODUCTS
        </h2>
        
        {/* Mobile & Desktop: Horizontal scroll with snap; desktop shows 3 cards */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 lg:gap-8 mt-6 overflow-x-auto scrollbar-hide pb-4 md:pb-0 px-6 md:px-0 items-center snap-x snap-mandatory select-none"
          style={{ 
            scrollSnapType: 'x mandatory',
            cursor: 'grab',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }}
        >
          {displayProducts.map((product, index) => {
            const isCentered = centeredCard === index;

            // Only the centered card scales up; others remain unchanged
            const contentScaleClass = isCentered ? 'scale-110 md:scale-115' : 'scale-100 md:scale-100';
            
            return (
              <div
                key={product.id}
                ref={(el) => setCardRef(index, el)}
                className={`flex flex-col relative w-[220px] min-w-[220px] md:w-1/3 md:min-w-[33.333%] flex-none snap-center ${isCentered ? 'z-10' : 'z-0'}`}
                style={{ 
                  scrollSnapAlign: 'center',
                  willChange: 'transform',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Link 
                  href={`/product/${product.slug || String(product.id)}`}
                  className="block group w-full h-full cursor-pointer"
                  style={{ cursor: 'inherit' }}
                >
                  <div 
                    className="relative w-full bg-[#2D2D2D] overflow-hidden"
                    style={{
                      aspectRatio: isCentered ? '1 / 1.15' : '1 / 1', // 15% taller when centered (reduced from 20%)
                      transition: 'aspect-ratio 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {/* Scaled image/content wrapper grows from center for equal crop */}
                    <div 
                      className={`relative w-full h-full transform-gpu origin-center ${contentScaleClass}`} 
                      style={{ 
                        willChange: 'transform',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {/* Main Image */}
                      <Image
                        src={product.image || "/images/placeholder.png"}
                        alt={product.name || "Featured product"}
                        fill
                        style={{ objectFit: 'cover' }}
                        className={`transition-opacity duration-300 ${product.images && product.images.length > 1 ? 'group-hover:opacity-0' : ''}`}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {/* Hover Image (Second Image) - Only show if available */}
                      {product.images && product.images.length > 1 && product.images[1] && (
                        <Image
                          src={product.images[1]}
                          alt={product.name || "Featured product"}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      )}
                    </div>

                    {/* Product Name - Bottom Left (not scaled, stays readable) */}
                    {product.name && (
                      <div className="absolute bottom-0 left-0 p-4 z-20 transition-transform duration-300 group-hover:-translate-y-8">
                        <h3 className="text-white text-xs sm:text-sm md:text-base font-['Roboto_Mono'] uppercase leading-tight">
                          {product.name}
                        </h3>
                      </div>
                    )}

                    {/* Hover Overlay - Finishes on Left, Price on Right (not scaled) */}
                    <div className="absolute inset-0 bg-black/20 transition-all duration-300 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 z-30 pointer-events-none">
                      <div className="flex justify-between items-end w-full gap-4 pointer-events-auto">
                        {/* Variants/Finishes - Bottom Left (Moves to name's original position on hover) */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="flex-shrink-0 min-w-0 transition-transform duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                            <div className="text-white text-xs sm:text-sm md:text-base font-['Roboto_Mono']">
                              {product.variants.length} {product.variants.length === 1 ? 'Finish' : 'Finishes'}
                            </div>
                          </div>
                        )}
                        
                        {/* Price - Bottom Right */}
                        <div className="flex-shrink-0 transition-transform duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                          {product.price && (
                            <div className="text-white text-xs sm:text-sm md:text-base font-['Roboto_Mono'] text-right">
                              {product.price.startsWith('$') ? product.price : `$${product.price}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom styles for smooth drag experience */}
      <style jsx>{`
        :global(.scrollbar-hide::-webkit-scrollbar) {
          display: none;
        }
        :global(.scrollbar-hide) {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

