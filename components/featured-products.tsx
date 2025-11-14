'use client';

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, getProductUrl } from '@/lib/utils';

interface FeaturedProduct {
  id: string | number;
  name?: string;
  price?: string | number;
  image: string;
  images?: string[];
  category?: string;
  categoryId?: string;
  slug?: string | number;
  createdAt?: string;
}

interface FeaturedProductsProps {
  initialProducts: FeaturedProduct[];
}

export default function FeaturedProducts({ initialProducts }: FeaturedProductsProps) {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
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

  // Initialize products from props
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      const duplicatedProducts = [...initialProducts, ...initialProducts];
      setProducts(duplicatedProducts);
      translateX.current = 0;
      setCenteredCard(0);
    } else {
      setProducts([]);
      translateX.current = 0;
      setCenteredCard(null);
    }
  }, [initialProducts]);

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
    
    const container = scrollContainerRef.current;
    const containerRect = container?.parentElement?.getBoundingClientRect();

    if (container && containerRect) {
      const firstCard = cardRefsMap.current.get(0);
      if (firstCard) {
        const firstCardRect = firstCard.getBoundingClientRect();
        const firstCardCenter = firstCardRect.left + firstCardRect.width / 2;
        const viewportCenter = containerRect.left + containerRect.width / 2;
        const offset = viewportCenter - firstCardCenter;

        translateX.current = offset;
        container.style.transform = `translateX(${translateX.current}px)`;
        if (centeredCard === null) {
          setCenteredCard(0);
        }
      }
    }

    let rafId: number | null = null;
    const updateCenter = () => {
      detectCenteredCard();
      rafId = requestAnimationFrame(updateCenter);
    };

    detectCenteredCard();
    rafId = requestAnimationFrame(updateCenter);
    window.addEventListener('resize', detectCenteredCard);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', detectCenteredCard);
    };
  }, [products]);

  // Handle Pointer Events for Drag with Infinite Loop (same logic as CreativeSection)
  const handlePointerDown = (e: React.MouseEvent | React.PointerEvent | React.TouchEvent) => {
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

  const handlePointerMove = (e: React.MouseEvent | React.PointerEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    
    e.preventDefault(); // Prevent default touch/pointer behaviors
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX;
    const walk = (x - startX.current) * 0.8; // Reduced sensitivity from 2 to 0.8 for smoother scroll
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
      
      // Smooth snap to nearest centered card
      const container = scrollContainerRef.current;
      const containerRect = container.parentElement?.getBoundingClientRect();
      if (containerRect) {
        const viewportCenter = containerRect.left + containerRect.width / 2;
        
        let closestCardIndex: number | null = null;
        let closestDistance = Infinity;
        
        // Find the closest card to center
        cardRefsMap.current.forEach((card, index) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const distance = Math.abs(viewportCenter - cardCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestCardIndex = index;
          }
        });
        
        // Snap to the closest card with smooth animation
        if (closestCardIndex !== null) {
          const closestCard = cardRefsMap.current.get(closestCardIndex);
          if (closestCard) {
            const cardRect = closestCard.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const offset = viewportCenter - cardCenter;
            
            // Apply smooth snap with transition
            translateX.current += offset;
            container.style.transition = 'transform 0.3s ease-out';
            container.style.transform = `translateX(${translateX.current}px)`;
            
            // Remove transition after animation
            setTimeout(() => {
              if (container) {
                container.style.transition = '';
              }
            }, 300);
          }
        }
      }
    }
    
    // Reset drag flag after a short delay
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 100);
  };

  // Handle wheel/touchpad scroll for horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    // Only handle horizontal scroll, let vertical scroll pass through to page
    const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    
    // If it's a vertical scroll (scrolling page up/down), don't interfere
    if (!isHorizontalScroll) {
      return; // Let the page scroll naturally
    }
    
    // Prevent default browser behavior for horizontal scroll only
    e.preventDefault();
    e.stopPropagation();
    
    // Use deltaX for horizontal scroll
    const delta = e.deltaX;
    
    // Apply scroll with reduced sensitivity (0.6x) for smoother control
    translateX.current -= delta * 0.6;
    
    // Infinite loop logic - same as drag
    if (totalWidth.current > 0) {
      // Moving right (negative translateX, showing later cards)
      if (Math.abs(translateX.current) >= totalWidth.current) {
        translateX.current = 0; // Reset to beginning
      }
      // Moving left (positive translateX, going backwards) - wrap around to end
      else if (translateX.current > 0) {
        translateX.current = -totalWidth.current + translateX.current;
      }
    }
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.transform = `translateX(${translateX.current}px)`;
    }
  };

  // Add wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const container = scrollContainerRef.current?.parentElement;
    if (!container) return;

    const wheelHandler = (e: WheelEvent) => {
      // Only prevent default for horizontal scroll, let vertical scroll work
      const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      
      if (isHorizontalScroll) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Add listener with passive: false to allow preventDefault
    container.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, []);

  // Initialize width calculation and setup
  useEffect(() => {
    calculateWidth();
    window.addEventListener('resize', calculateWidth);

    return () => {
      window.removeEventListener('resize', calculateWidth);
    };
  }, [calculateWidth]);

  // Center the first card on initial load
  useEffect(() => {
    if (products.length === 0 || !scrollContainerRef.current) return;
    
    const centerFirstCard = () => {
      const container = scrollContainerRef.current;
      const containerRect = container?.parentElement?.getBoundingClientRect();
      
      if (container && containerRect) {
        const firstCard = cardRefsMap.current.get(0);
        if (firstCard) {
          const firstCardRect = firstCard.getBoundingClientRect();
          const firstCardCenter = firstCardRect.left + firstCardRect.width / 2;
          const viewportCenter = containerRect.left + containerRect.width / 2;
          const offset = viewportCenter - firstCardCenter;
          
          // Set initial position to center the first card
          translateX.current = offset;
          container.style.transform = `translateX(${translateX.current}px)`;
        }
      }
    };
    
    // Wait for layout to complete
    setTimeout(centerFirstCard, 200);
  }, [products]);

  if (products.length === 0) {
    return null;
  }

  // Use all featured products
  const displayProducts = products;

  return (
    <div className="container mx-auto px-0 md:px-0 mb-16 md:mb-24">
      <div className="max-w-[1440px] mx-auto px-0 md:px-0">
        <h2 className="text-white text-lg sm:text-[24px] md:text-[28px] font-medium uppercase leading-[1.2em] md:leading-[1.171875em] text-center font-['Roboto_Mono'] mb-8 md:mb-12">
          FEATURED PRODUCTS
        </h2>
        
        {/* Mobile & Desktop: Transform-based infinite scroll; desktop shows 3 cards */}
        <div 
          className="overflow-hidden relative pb-12 md:pb-16"
          style={{ 
            paddingTop: '4rem',
            paddingBottom: '2rem'
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onWheel={handleWheel}
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
                  href={getProductUrl({
                    id: product.id,
                    slug: product.slug ? String(product.slug) : undefined,
                    category: product.category,
                    name: product.name || product.title,
                    type: product.type
                  })}
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
                          {formatPrice(product.price)}
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

