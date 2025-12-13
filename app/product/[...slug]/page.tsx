// @ts-nocheck
"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronUp, ChevronDown, ArrowLeft, Plus, Minus, X, ChevronLeft, ChevronRight } from "lucide-react"
import paintingProductData from "@/public/data/painting-products.json"
import TestimonialCollection from "@/components/testimonial-collection"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import Footer from "@/components/footer"
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation"
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice, getProductUrl, slugifySegment } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import Preloader from "@/components/ui/preloader"
import { SITE_URL, generateProductSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import SchemaInjector from "@/components/seo/SchemaInjector"
import ProductTestimonial from "@/components/product-testimonial"

// Artefact products data
const artefactProducts = [
  {
    id: 1,
    name: "ANCIENT VASE",
    price: "$3250",
    image: "/images/mug-black.png",
    category: "Egyptian",
    description: "This ancient Egyptian vase features intricate hieroglyphics and traditional design elements. Handcrafted using techniques passed down through generations, it represents the artistic mastery of one of history's most enduring civilizations."
  },
  {
    id: 2,
    name: "STONE STATUE",
    price: "$4980",
    image: "/images/mug-white.png",
    category: "Egyptian",
    description: "Carved from limestone quarried from the banks of the Nile, this statue embodies the regal aesthetic of ancient Egyptian art. Its proportional harmony and stylized features reflect the spiritual and cultural traditions of its origin."
  },
  {
    id: 3,
    name: "JADE FIGURINE",
    price: "$2870",
    image: "/images/cycle1.png",
    category: "Asian",
    description: "This exquisite jade figurine showcases the meticulous craftsmanship of Asian artisans. The translucent stone has been carefully carved to reveal subtle details, embodying cultural symbolism and artistic precision."
  },
  {
    id: 4,
    name: "BRONZE BELL",
    price: "$1850",
    image: "/images/cycle2.png",
    category: "Asian",
    description: "This ceremonial bronze bell features detailed relief work and a rich patina developed over decades. Its resonant tone was once used in religious ceremonies, and its design reflects the sophisticated metallurgical knowledge of ancient Asian civilizations."
  },
  {
    id: 5,
    name: "MEDIEVAL CHALICE",
    price: "$5750",
    image: "/images/notebook-white.png",
    category: "European",
    description: "This ornate medieval chalice combines silver gilt with delicate enamel work. Used in religious ceremonies throughout the Middle Ages, it represents the intersection of European craftsmanship, religious devotion, and artistic expression."
  },
  {
    id: 6,
    name: "ORNATE SHIELD",
    price: "$7820",
    image: "/images/notebook-black.png",
    category: "European",
    description: "This decorative shield combines functional design with elaborate artistry. The heraldic imagery tells the story of its noble ownership, while the metalwork demonstrates the exceptional craftsmanship of European armories."
  },
  {
    id: 9,
    name: "OFFCUT WALL SCONCE",
    price: "$670",
    image: "/images/products/wall-sconce.jpg",
    category: "Artefacts",
    description: "Offcut is a poetic balance of shape and form. Pairing remnant stone from local suppliers, with a custom designed 'teacup' globe, every iteration of Offcut is unique.\n\nThe natural stone is hand selected and intently broken in house, while the soft white glass and LED module is custom designed to create a seamless, contemporary aesthetic."
  }
];

// Combine the product types
interface ProductWithDescription {
  id: number;
  name?: string;
  price?: string;
  basePrice?: string;
  image?: string;
  images?: string[];
  category: string;
  description?: string;
  variants?: any[];
  type?: string;
  specifications?: any;
  faqSection?: any;
  additionalImageUrl?: string;
  shortDescription?: string;
  logoUrl?: string;
  packProduct?: boolean; // For products that show name always visible in variant selector
}

// Helper type for accordion content
interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

// Price Reveal Component with Premium Flip Animation
function PriceReveal({ price }: { price: string }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative mb-8 w-full sm:w-fit">
      {/* Container with perspective for 3D effect */}
      <div
        className="relative h-20 w-full sm:h-24 sm:w-64 mx-auto sm:mx-0"
        style={{ perspective: '1000px' }}
      >
        {/* Card wrapper with 3D flip */}
        <div
          className="relative w-full h-full transition-all duration-1000 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front Face - Reveal Button */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <button
              onClick={() => setIsRevealed(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-full h-full group overflow-hidden"
            >
              {/* Animated gradient border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 via-white/40 to-white/20 p-[2px] transition-all duration-500 ${isHovered ? 'from-white/40 via-white/60 to-white/40 shadow-[0_0_30px_rgba(255,255,255,0.3)]' : ''
                }`}>
                <div className="absolute inset-[2px] rounded-2xl bg-gradient-to-br from-[#2D2D2D] via-[#1F1F1F] to-[#2D2D2D]" />
              </div>

              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
                }`}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl" />
              </div>

              {/* Shimmer animation */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000 ${isHovered ? 'translate-x-full' : ''
                  }`} style={{ width: '200%' }} />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2">
                <svg
                  className={`w-6 h-6 transition-all duration-300 ${isHovered ? 'scale-110 rotate-12' : 'scale-100'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>

                <span className={`font-['Roboto_Mono'] uppercase tracking-[0.25em] text-xs transition-all duration-300 ${isHovered ? 'text-white' : 'text-white/70'
                  }`}>
                  Reveal Price
                </span>

                <div className={`flex gap-1 transition-all duration-300 ${isHovered ? 'gap-2' : 'gap-1'}`}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full bg-white/40 transition-all duration-300 ${isHovered ? 'bg-white/80 scale-125' : ''
                        }`}
                      style={{
                        animationDelay: `${i * 150}ms`,
                        animation: isHovered ? 'pulse 1.5s ease-in-out infinite' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            </button>
          </div>

          {/* Back Face - Price Display */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Glowing border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/30 via-white/50 to-white/30 p-[2px] shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                <div className="absolute inset-[2px] rounded-2xl bg-gradient-to-br from-[#2D2D2D] via-[#1F1F1F] to-[#2D2D2D]" />
              </div>

              {/* Radial glow background */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
              </div>

              {/* Price text with glow */}
              <div className="relative z-10 text-center">
                <div className="text-2xl sm:text-3xl font-light font-['Roboto_Mono'] text-white tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                  {price}
                </div>
                <div className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/50 font-['Roboto_Mono']">
                  Exclusive Price
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-white/30 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-white/30 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-white/30 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-white/30 rounded-br-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles when not revealed */}
      {!isRevealed && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${3 + i}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Floating animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

export default function ProductDetail() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { toast } = useToast()
  const [product, setProduct] = useState<ProductWithDescription | undefined>(undefined)
  const [categoryName, setCategoryName] = useState<string>('')
  const [categoryDescription, setCategoryDescription] = useState<string>('')
  const [categoryDetails, setCategoryDetails] = useState<Array<{ label: string, value: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadedProduct, setHasLoadedProduct] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'api' | 'fallback'>('fallback')

  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [hoveredVariant, setHoveredVariant] = useState<any>(null); // For preview on hover
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isHoveringZoom, setIsHoveringZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [zoomPosition, setZoomPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);


  // Touch/swipe state for mobile image navigation
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  // Smooth swipe state for mobile gallery
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [touchOffset, setTouchOffset] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);
  const [isResettingPosition, setIsResettingPosition] = useState(false); // For seamless infinite scroll
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  // Modal image pinch-to-zoom state
  const [modalZoomScale, setModalZoomScale] = useState(1);
  const [modalZoomTranslate, setModalZoomTranslate] = useState({ x: 0, y: 0 });
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialZoomScale, setInitialZoomScale] = useState(1);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const modalImageRef = useRef<HTMLDivElement>(null);

  // Reset current image when switching products
  useEffect(() => {
    setCurrentImage(0);
  }, [product]);

  // Track image container dimensions for zoom calculation
  useEffect(() => {
    const updateDimensions = () => {
      if (imageContainerRef.current) {
        const rect = imageContainerRef.current.getBoundingClientRect();
        setImageDimensions({ width: rect.width, height: rect.height });
      }
    };

    // Initial update with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateDimensions, 100);

    // Also update immediately
    updateDimensions();

    // Update on window resize
    window.addEventListener('resize', updateDimensions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [product, currentImage]);

  // Handle mouse move for zoom
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate percentage position (0-100%)
    const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));

    setMousePosition({ x: percentX, y: percentY });

    // Update zoom container position
    setZoomPosition({
      top: rect.top,
      left: rect.right + 20
    });
  }, []);

  // Calculate zoom background position with bounds checking
  const getZoomBackgroundPosition = useCallback(() => {
    if (imageDimensions.width === 0 || imageDimensions.height === 0) {
      return { x: 0, y: 0 };
    }

    const zoomFactor = 3;
    const zoomBoxWidth = imageDimensions.width * 0.92; // Match reduced zoom box width
    const zoomBoxHeight = imageDimensions.height * 1.0; // Match left image height exactly
    const zoomedWidth = imageDimensions.width * zoomFactor;
    const zoomedHeight = imageDimensions.height * zoomFactor;

    // Calculate desired position (centering the point under cursor)
    let bgX = (mousePosition.x / 100) * zoomedWidth - zoomBoxWidth / 2;
    let bgY = (mousePosition.y / 100) * zoomedHeight - zoomBoxHeight / 2;

    // Clamp to keep within image bounds
    const maxX = zoomedWidth - zoomBoxWidth;
    const maxY = zoomedHeight - zoomBoxHeight;
    bgX = Math.max(0, Math.min(maxX, bgX));
    bgY = Math.max(0, Math.min(maxY, bgY));

    return { x: -bgX, y: -bgY };
  }, [mousePosition, imageDimensions, isTouchDevice]);

  // Handle mouse enter for zoom
  const handleMouseEnter = useCallback(() => {
    if (isTouchDevice) return;
    setIsHoveringZoom(true);
    setIsAutoScrolling(false);

    // Update dimensions and zoom position when entering hover
    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();

      // Update dimensions to ensure zoom works immediately
      setImageDimensions({ width: rect.width, height: rect.height });

      // Set zoom position
      setZoomPosition({
        top: rect.top,
        left: rect.right + 20
      });
    }
  }, [isTouchDevice]);

  // Handle mouse leave for zoom
  const handleMouseLeave = useCallback(() => {
    setIsHoveringZoom(false);
  }, []);

  // Minimum swipe distance (in pixels) to trigger navigation
  const minSwipeDistance = 50;

  // Detect touch devices (including tablets) to disable desktop hover zoom
  useEffect(() => {
    const detectTouch = () => {
      if (typeof window === 'undefined') return;
      const touchCapable =
        'ontouchstart' in window ||
        (navigator as any).maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;
      setIsTouchDevice(touchCapable);
      if (touchCapable) {
        setIsHoveringZoom(false);
      }
    };
    detectTouch();
    window.addEventListener('resize', detectTouch);
    return () => window.removeEventListener('resize', detectTouch);
  }, []);

  // Track image width for mobile swipe
  useEffect(() => {
    const updateImageWidth = () => {
      if (swipeContainerRef.current) {
        const rect = swipeContainerRef.current.getBoundingClientRect();
        setImageWidth(rect.width);
        // For infinite scroll: offset by 1 to account for the cloned first image at the beginning
        const currentImages = (hoveredVariant || selectedVariant)?.images || product?.images || [product?.image].filter(Boolean);
        if (currentImages.length > 1) {
          setTranslateX(-(currentImage + 1) * rect.width);
        } else {
          setTranslateX(-currentImage * rect.width);
        }
      }
    };

    const timeoutId = setTimeout(updateImageWidth, 100);
    updateImageWidth();
    window.addEventListener('resize', updateImageWidth);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateImageWidth);
    };
  }, [currentImage, product, hoveredVariant, selectedVariant]);

  // Sync translateX with currentImage when not swiping
  useEffect(() => {
    if (!isSwiping && imageWidth > 0) {
      // For infinite scroll: offset by 1 to account for the cloned first image
      const currentImages = (hoveredVariant || selectedVariant)?.images || product?.images || [product?.image].filter(Boolean);
      if (currentImages.length > 1) {
        setTranslateX(-(currentImage + 1) * imageWidth);
      } else {
        setTranslateX(-currentImage * imageWidth);
      }
    }
  }, [currentImage, imageWidth, isSwiping, hoveredVariant, selectedVariant, product]);

  // Handle touch start for smooth swipe
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
    setIsSwiping(true);
    setIsAutoScrolling(false);
    // Store initial translateX offset
    setTouchOffset(0);
  }, []);

  // Handle touch move for real-time sliding
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart || !imageWidth) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    // Prevent default scrolling during horizontal swipe
    e.preventDefault();
    e.stopPropagation();

    // Get current images array
    const currentImages = (hoveredVariant || selectedVariant)?.images || product?.images || [product?.image].filter(Boolean);
    const imageCount = currentImages.length;

    // Calculate offset from current position
    const offset = deltaX;
    setTouchOffset(offset);

    // Update translateX in real-time: base position + touch offset
    // For infinite scroll: offset by 1 to account for cloned first image
    const baseTranslateX = imageCount > 1 ? -(currentImage + 1) * imageWidth : -currentImage * imageWidth;
    let newTranslateX = baseTranslateX + offset;

    // No rubber band - allow infinite scrolling
    setTranslateX(newTranslateX);

    // Update touchEnd for momentum calculation
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  }, [touchStart, imageWidth, currentImage, hoveredVariant, selectedVariant, product]);

  // Handle touch end with momentum and snap
  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !imageWidth) {
      setIsSwiping(false);
      return;
    }

    const distanceX = touchStart.x - (touchEnd?.x || touchStart.x);
    const distanceY = touchStart.y - (touchEnd?.y || touchStart.y);
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    // Get current images array
    const currentImages = (hoveredVariant || selectedVariant)?.images || product?.images || [product?.image].filter(Boolean);
    const imageCount = currentImages.length;

    if (imageCount <= 1 || isVerticalSwipe) {
      // Reset to current image (no infinite scroll for single image)
      setTranslateX(-currentImage * imageWidth);
      setIsSwiping(false);
      setTouchStart(null);
      setTouchEnd(null);
      setTouchOffset(0);
      return;
    }

    // Calculate momentum and determine target image with enhanced smoothness
    const swipeThreshold = imageWidth * 0.20; // Reduced to 20% for easier, smoother swiping
    const absDistance = Math.abs(distanceX);

    let targetImage = currentImage;

    // Enhanced momentum detection - easier to trigger for smoother feel
    if (absDistance > swipeThreshold || absDistance > minSwipeDistance * 0.8) {
      if (distanceX > 0) {
        // Swipe left (show next image) - allow moving beyond bounds for infinite effect
        targetImage = currentImage + 1;
      } else {
        // Swipe right (show previous image) - allow moving to negative for infinite effect
        targetImage = currentImage - 1;
      }
    }

    // For infinite scroll: offset by 1 to account for cloned first image
    // Animate to target image with smooth transition
    setCurrentImage(targetImage);
    setTranslateX(-(targetImage + 1) * imageWidth);
    setIsAutoScrolling(false);
    setIsSwiping(false);
    setTouchStart(null);
    setTouchEnd(null);
    setTouchOffset(0);
  }, [touchStart, touchEnd, imageWidth, currentImage, hoveredVariant, selectedVariant, product]);

  // Helper function to calculate distance between two touch points
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle pinch-to-zoom and pan on modal image
  const handleModalImageTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture detected
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
      setInitialZoomScale(modalZoomScale);
      setPanStart(null); // Clear any pan
      setIsPanning(false);
    } else if (e.touches.length === 1 && modalZoomScale > 1) {
      // Single finger pan when zoomed
      setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setIsPanning(true);
    }
  }, [modalZoomScale]);

  const handleModalImageTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance) {
      // Pinch zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scaleChange = currentDistance / initialPinchDistance;
      const newScale = Math.min(Math.max(1, initialZoomScale * scaleChange), 4); // Limit between 1x and 4x
      setModalZoomScale(newScale);
    } else if (e.touches.length === 1 && isPanning && panStart && modalZoomScale > 1) {
      // Pan with single finger when zoomed
      e.preventDefault();
      const deltaX = e.touches[0].clientX - panStart.x;
      const deltaY = e.touches[0].clientY - panStart.y;

      // Update translate position
      setModalZoomTranslate(prev => ({
        x: prev.x + deltaX / modalZoomScale,
        y: prev.y + deltaY / modalZoomScale
      }));

      // Update pan start for next move
      setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  }, [initialPinchDistance, initialZoomScale, isPanning, panStart, modalZoomScale]);

  const handleModalImageTouchEnd = useCallback(() => {
    setInitialPinchDistance(null);
    setPanStart(null);
    setIsPanning(false);

    // Reset zoom if it's close to 1
    if (modalZoomScale < 1.1) {
      setModalZoomScale(1);
      setModalZoomTranslate({ x: 0, y: 0 });
    }
  }, [modalZoomScale]);

  // Reset zoom when modal opens/closes or image changes
  useEffect(() => {
    if (!isImageModalOpen) {
      setModalZoomScale(1);
      setModalZoomTranslate({ x: 0, y: 0 });
    }
  }, [isImageModalOpen, currentImage]);

  // Close modal on ESC key press, handle arrow navigation, and manage body classes
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!isImageModalOpen) return;

      if (e.key === 'Escape') {
        setIsImageModalOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setCurrentImage((prev) => {
          const images = product?.images || [product?.image];
          const length = images.length;
          return (prev - 1 + length) % length;
        });
      } else if (e.key === 'ArrowRight') {
        setCurrentImage((prev) => {
          const images = product?.images || [product?.image];
          const length = images.length;
          return (prev + 1) % length;
        });
      }
    };

    if (isImageModalOpen) {
      document.addEventListener('keydown', handleKeyboard);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Add class to body to signal modal is open (for navbar hiding)
      document.body.classList.add('image-modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('image-modal-open');
    };
  }, [isImageModalOpen, product]);



  // Next.js useParams returns string | string[] | undefined
  const rawSlugParam = (params as any)?.slug ?? (params as any)?.id
  const slugSegments = Array.isArray(rawSlugParam)
    ? rawSlugParam
    : rawSlugParam
      ? [rawSlugParam]
      : []

  const categorySegmentFromUrl =
    slugSegments.length > 1 ? slugSegments[slugSegments.length - 2] : null
  const productSegmentFromUrl =
    slugSegments.length > 0 ? slugSegments[slugSegments.length - 1] : null

  const normalizedCategoryFromUrl = categorySegmentFromUrl
    ? slugifySegment(categorySegmentFromUrl, { fallback: '' })
    : null
  const normalizedProductFromUrl = productSegmentFromUrl
    ? slugifySegment(productSegmentFromUrl, { fallback: '' })
    : null
  const normalizedCompositeSlugFromUrl =
    slugSegments.length > 0
      ? slugSegments
        .map((segment) => slugifySegment(segment, { fallback: '' }))
        .filter(Boolean)
        .join('/')
      : null

  const numericProductId =
    productSegmentFromUrl && /^[0-9]+$/.test(productSegmentFromUrl)
      ? parseInt(productSegmentFromUrl, 10)
      : null

  const productId =
    productSegmentFromUrl && productSegmentFromUrl !== 'undefined'
      ? productSegmentFromUrl
      : null
  const isValidId = typeof productId === 'string' && productId.length > 0
  const [isInvalidRoute, setIsInvalidRoute] = useState(false)

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Care Guide accordion state
  const [isCareGuideOpen, setIsCareGuideOpen] = useState(false);
  const toggleCareGuide = () => {
    setIsCareGuideOpen(!isCareGuideOpen);
  };

  // Function to fetch category data (reusable - same logic for category name, description, and care guide)
  const fetchCategoryData = async (product: ProductWithDescription) => {
    try {
      const catsRes = await fetch('/api/artefact-categories');
      if (catsRes.ok) {
        const cats = await catsRes.json();

        // Get category name from URL if available
        // URL has: "mouse-pads", Category has: "Mouse Pads"
        // Convert hyphenated URL to space-separated for matching
        const urlCategoryName = normalizedCategoryFromUrl || categorySegmentFromUrl;
        const urlCategoryNameWithSpaces = urlCategoryName?.toLowerCase().replace(/-/g, ' ') || '';
        const urlCategorySlug = urlCategoryName?.toLowerCase() || '';

        // Find the category that contains this product
        // Try multiple matching strategies:
        // 1. Match by URL category name (most reliable) - convert hyphens to spaces and match
        // 2. Match by category ID
        // 3. Match by category name (case-insensitive)
        // 4. Check if product exists in category's products array
        let catItem = cats.find((cat: any) => {
          const catName = cat.name?.toLowerCase() || '';
          const catNameSlug = catName.replace(/\s+/g, '-');

          // Match strategies:
          // 1. URL "mouse-pads" → "mouse pads" matches category "mouse pads"
          // 2. URL "mouse-pads" matches category slugified "mouse-pads"
          // 3. Direct name match
          const matchesByName = catName === urlCategoryNameWithSpaces;
          const matchesBySlug = catNameSlug === urlCategorySlug || catName === urlCategorySlug;

          return matchesByName || matchesBySlug;
        });

        // If not found by URL, try other methods
        if (!catItem) {
          catItem = cats.find((cat: any) => {
            const catId = (cat._id || cat.id)?.toString();
            const productCatId = product.category?.toString();
            const catName = cat.name?.toLowerCase() || '';
            const productCatName = product.category?.toLowerCase() || '';

            // Also check if this product exists in the category's products array
            const hasProduct = cat.products?.some((p: any) => {
              const pId = p.id?.toString();
              const prodId = product.id?.toString();
              return pId === prodId;
            });

            return catId === productCatId ||
              catName === productCatName ||
              hasProduct ||
              (catName && productCatName && catName.includes(productCatName)) ||
              (catName && productCatName && productCatName.includes(catName));
          });
        }

        // Set all category data (name, description, details)
        if (catItem) {
          setCategoryName(catItem?.name || product.category);
          setCategoryDescription(catItem?.description || '');

          // Get details from new format or convert legacy fields
          let details: Array<{ label: string, value: string }> = [];
          if (catItem.details && Array.isArray(catItem.details) && catItem.details.length > 0) {
            details = catItem.details;
          } else {
            // Convert legacy fields to details format
            if (catItem.size) details.push({ label: 'Size', value: catItem.size });
            if (catItem.thickness) details.push({ label: 'Thickness', value: catItem.thickness });
            if (catItem.frame) details.push({ label: 'Frame', value: catItem.frame });
            if (catItem.structure) details.push({ label: 'Structure', value: catItem.structure });
            if (catItem.material) details.push({ label: 'Material', value: catItem.material });
            if (catItem.care_guide || catItem.careGuide) details.push({ label: 'Care Guide', value: (catItem.care_guide || catItem.careGuide).trim() });
            if (catItem.measurement) details.push({ label: 'Measurement', value: catItem.measurement.trim() });
            if (catItem.gsm) details.push({ label: 'GSM', value: catItem.gsm.trim() });
          }

          setCategoryDetails(details);
        } else {
          setCategoryName(product.category);
          setCategoryDescription('');
          setCategoryDetails([]);
        }
      } else {
        setCategoryName(product.category);
        setCategoryDescription('');
        setCategoryDetails([]);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
      setCategoryName(product.category);
      setCategoryDescription('');
      setCategoryDetails([]);
    }
  };

  // Add the cart context and auth
  const { addToCart } = useCart();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const resolveStaticProduct = useCallback(
    (
      identifier: string | null,
      normalizedCategory?: string | null
    ): ProductWithDescription | undefined => {
      if (!identifier) return undefined

      const allStaticProducts = [
        ...paintingProductData,
        ...artefactProducts
      ] as unknown as ProductWithDescription[]

      const normalizedIdentifier = slugifySegment(identifier, { fallback: '' })
      const normalizedCategorySlug = normalizedCategory
        ? slugifySegment(normalizedCategory, { fallback: '' })
        : null
      const numericCandidate = /^[0-9]+$/.test(identifier)
        ? parseInt(identifier, 10)
        : null

      return allStaticProducts.find((item) => {
        const candidateId =
          typeof item.id === 'number'
            ? item.id
            : typeof item.id === 'string'
              ? parseInt(item.id, 10)
              : null

        if (numericCandidate !== null && candidateId === numericCandidate) {
          return true
        }

        const candidateCategorySlug = slugifySegment(item.category, { fallback: 'product' })
        const candidateNameSource =
          (item as any)?.slug ??
          item.name ??
          (item as any)?.title ??
          (typeof item.id !== 'undefined' ? item.id.toString() : '')
        const candidateNameSlug = slugifySegment(candidateNameSource, { fallback: '' })

        if (normalizedCategorySlug) {
          return (
            candidateCategorySlug === normalizedCategorySlug &&
            candidateNameSlug === normalizedIdentifier
          )
        }

        return (
          candidateNameSlug === normalizedIdentifier ||
          `${candidateCategorySlug}/${candidateNameSlug}` === normalizedIdentifier
        )
      })
    },
    []
  )

  useEffect(() => {
    if (product) {
      setHasLoadedProduct(true)
    }
  }, [product])

  const findProductInCategories = useCallback(
    async (
      identifier: string | null,
      normalizedCategory?: string | null,
      normalizedCompositeSlug?: string | null
    ): Promise<
      | {
        product: ProductWithDescription
        categoryName: string
        categoryDescription?: string
      }
      | null
    > => {
      if (!identifier) return null

      try {
        const res = await fetch(`/api/artefact-categories`, {
          next: { revalidate: 60 }
        })

        if (!res.ok) return null

        const categories = await res.json()
        const normalizedIdentifier = slugifySegment(identifier, { fallback: '' })

        for (const category of categories) {
          const categoryName = category?.name || 'Product'
          const categorySlug = slugifySegment(
            category?.slug ?? category?.name,
            { fallback: '' }
          )
          const categoryDescription = category?.description || ''
          const hasCategoryContext = Boolean(normalizedCategory)

          if (!Array.isArray(category?.products)) continue

          for (const product of category.products) {
            const productIdCandidate =
              typeof product?.id !== 'undefined'
                ? product.id.toString()
                : product?._id?.toString()
            const productSlug = slugifySegment(
              product?.slug ?? product?.name ?? productIdCandidate,
              { fallback: '' }
            )
            const compositeSlug =
              categorySlug && productSlug ? `${categorySlug}/${productSlug}` : null

            const matchesId =
              productIdCandidate && identifier && productIdCandidate === identifier
            const matchesSlug =
              !hasCategoryContext && productSlug === normalizedIdentifier
            const matchesComposite =
              normalizedCompositeSlug &&
              compositeSlug &&
              compositeSlug === normalizedCompositeSlug
            const matchesCategoryAndSlug =
              normalizedCategory &&
              categorySlug === normalizedCategory &&
              productSlug === normalizedIdentifier

            if (
              matchesId ||
              matchesSlug ||
              matchesComposite ||
              matchesCategoryAndSlug
            ) {
              const formattedProduct: ProductWithDescription = {
                id: productIdCandidate || productSlug,
                name: product?.name ?? product?.title,
                price: product?.price ?? product?.basePrice,
                basePrice: product?.basePrice ?? product?.price,
                image:
                  (Array.isArray(product?.images) && product.images[0]) ||
                  product?.image ||
                  '',
                images:
                  Array.isArray(product?.images) && product.images.length > 0
                    ? product.images
                    : product?.image
                      ? [product.image]
                      : [],
                category: categoryName,
                description: product?.description,
                variants: product?.variants,
                type: product?.type ?? category?.type,
                specifications: product?.specifications,
                faqSection: product?.faqSection,
                additionalImageUrl: product?.additionalImageUrl,
                slug: product?.slug ?? productIdCandidate ?? productSlug,
                shortDescription: product?.shortDescription ?? product?.summary ?? product?.tagline ?? product?.intro,
                logoUrl: product?.logoUrl ?? product?.logo ?? product?.brandLogo ?? product?.branding?.logoUrl
              }

              return {
                product: formattedProduct,
                categoryName,
                categoryDescription
              }
            }
          }
        }
      } catch (error) {
        console.error('Error searching categories for fallback product:', error)
      }

      return null
    },
    []
  )

  // If we detect an invalid route, we could redirect programmatically
  useEffect(() => {
    if (!isValidId && paintingProductData.length > 0) {
      const firstValidProduct = paintingProductData[0] as ProductWithDescription
      if (firstValidProduct?.id) {
        const redirectUrl = getProductUrl({
          id: firstValidProduct.id,
          slug: (firstValidProduct as any)?.slug,
          category: firstValidProduct.category,
          name: firstValidProduct.name
        })
        router.replace(redirectUrl)
      }
    }
  }, [isValidId, router])

  useEffect(() => {
    async function fetchProduct() {
      // Don't show loading state for subsequent fetches
      const firstLoad = !hasLoadedProduct;
      if (firstLoad) {
        setIsLoading(true);
      }

      if (!isValidId) {
        // If ID is invalid, show a featured product instead
        setIsInvalidRoute(true)

        // Get the first product from the static data as featured
        const featuredProduct = paintingProductData[0] || {
          id: 1,
          name: "ABSTRACT ELEGANCE",
          price: "$2,327",
          image: "/images/painting/2.1.png",
          category: "Oil",
          description: "Abstract Elegance explores the interplay of form and color in modern composition. This oil painting features bold brushstrokes and a rich palette that creates depth and emotion, inviting the viewer to find their own meaning within its layers."
        }

        setProduct(featuredProduct)
        setIsLoading(false)
        return
      }

      try {
        // Use string ID for the API call
        const safeProductId = productId as string
        console.log(`Fetching product with ID: ${safeProductId} from API...`);

        // Use absolute URL to avoid any path resolution issues
        const apiUrl = `/api/products/${safeProductId}`;
        console.log(`API URL: ${apiUrl}`);

        const startTime = Date.now();
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          // Use cache to enable instant loading
          cache: 'force-cache',
          next: { revalidate: 60 } // Revalidate every 60 seconds
        });
        const endTime = Date.now();

        console.log(`API response status: ${response.status} (took ${endTime - startTime}ms)`);

        if (response.ok) {
          const data = await response.json();
          console.log('API data received:', data);

          if (data && (data.id || data._id || data.slug)) {
            const desiredProductUrl = getProductUrl({
              id: data.id ?? data._id,
              slug: data.slug ?? undefined,
              category: data.category,
              name: data.name,
              type: data.type
            });
            const variantParam = searchParams.get('variant');
            const redirectUrl = variantParam
              ? `${desiredProductUrl}?variant=${variantParam}`
              : desiredProductUrl;
            const currentPathname = typeof window !== 'undefined' ? window.location.pathname : null;

            if (currentPathname && currentPathname !== desiredProductUrl) {
              console.log('Redirecting to canonical product URL:', redirectUrl);
              router.replace(redirectUrl);
              return;
            }

            // Parse ID correctly depending on type
            let productId: number;
            if (data.id && typeof data.id === 'number') {
              productId = data.id;
            } else if (data.id && typeof data.id === 'string') {
              productId = parseInt(data.id) || safeProductId;
            } else if (data._id) {
              // MongoDB ObjectId case - convert to numeric ID if possible, else use safe ID
              productId = typeof data._id === 'string' ?
                (data._id.match(/^[0-9]+$/) ? parseInt(data._id) : safeProductId) :
                safeProductId;
            } else {
              productId = safeProductId;
            }

            // Format API data to match our component needs
            const formattedProduct = {
              id: productId,
              name: data.name,
              price: data.price || data.basePrice,
              basePrice: data.basePrice || data.price,
              image: data.image,
              images: Array.isArray(data.images)
                ? data.images
                : (data.image ? [data.image] : []),
              category: data.category || 'Unknown',
              description: data.description,
              variants: Array.isArray(data.variants) ? data.variants : [],
              type: data.type,
              specifications: data.specifications,
              faqSection: data.faqSection,
              additionalImageUrl: data.additionalImageUrl,
              slug: data.slug,
              packProduct: data.packProduct || false // For variant label visibility
            };

            console.log('Using API data for product display:', formattedProduct);
            console.log('Product images:', formattedProduct.images);
            setProduct(formattedProduct);
            // Fetch category data (name, description, care guide) - same logic for all
            await fetchCategoryData(formattedProduct);
            // Initialize selected frame variant
            const frameVariants = Array.isArray(formattedProduct.variants)
              ? formattedProduct.variants.filter((v: any) => v.type === 'frame')
              : [];
            // Don't reset selectedVariant here - let the URL parameter effect handle it
            setDataSource('api');
            setError(null);
          } else {
            throw new Error('API returned data without ID');
          }
        } else {
          // If API fails, fallback to local data
          console.warn(`API request failed with status ${response.status}, using fallback data`);

          // Try to get response text for debugging
          let responseText = '';
          try {
            responseText = await response.text();
            console.error('API error response:', responseText);
          } catch (e) {
            console.error('Could not read API error response');
          }

          // Attempt to find the product in static data using slug or ID
          let fallbackProduct = resolveStaticProduct(
            safeProductId,
            normalizedCategoryFromUrl
          )
          let derivedCategoryName: string | undefined
          let derivedCategoryDescription: string | undefined

          if (!fallbackProduct) {
            const categoryMatch = await findProductInCategories(
              safeProductId,
              normalizedCategoryFromUrl,
              normalizedCompositeSlugFromUrl
            )

            if (categoryMatch) {
              fallbackProduct = categoryMatch.product
              derivedCategoryName = categoryMatch.categoryName
              derivedCategoryDescription = categoryMatch.categoryDescription
            }
          }

          // If still not found, use default
          if (!fallbackProduct) {
            fallbackProduct = paintingProductData[0] || {
              id: 1,
              name: "ABSTRACT ELEGANCE",
              price: "$2,327",
              image: "/images/painting/2.1.png",
              category: "Oil",
              description:
                "Abstract Elegance explores the interplay of form and color in modern composition. This oil painting features bold brushstrokes and a rich palette that creates depth and emotion, inviting the viewer to find their own meaning within its layers."
            }
          }

          console.log('Using fallback data for product display:', fallbackProduct);
          // Cast to full ProductWithDescription for type safety
          const typedFallback = fallbackProduct as unknown as ProductWithDescription;

          // Ensure the fallback product has images array
          if (!typedFallback.images && typedFallback.image) {
            typedFallback.images = [typedFallback.image];
          }

          // Initialize fallback selected variant if any
          const frameVars = Array.isArray(typedFallback.variants)
            ? typedFallback.variants.filter((v: any) => v.type === 'frame')
            : [];

          setProduct(typedFallback);
          setCategoryName(derivedCategoryName || typedFallback.category);
          setCategoryDescription(derivedCategoryDescription || '');
          // Fetch category data including care guide fields (same logic as main case)
          await fetchCategoryData(typedFallback);
          // Don't reset selectedVariant here - let the URL parameter effect handle it
          setDataSource('fallback');
          setError(`API Error (${response.status}): Could not load product from API, using fallback data`);
        }
      } catch (err) {
        console.error('Error fetching product:', err);

        // Fallback to local data or categories on error
        let fallbackProduct =
          resolveStaticProduct(productId, normalizedCategoryFromUrl)
        let derivedCategoryName: string | undefined
        let derivedCategoryDescription: string | undefined

        if (!fallbackProduct) {
          const categoryMatch = await findProductInCategories(
            productId,
            normalizedCategoryFromUrl,
            normalizedCompositeSlugFromUrl
          )

          if (categoryMatch) {
            fallbackProduct = categoryMatch.product
            derivedCategoryName = categoryMatch.categoryName
            derivedCategoryDescription = categoryMatch.categoryDescription
          }
        }

        if (!fallbackProduct) {
          fallbackProduct = paintingProductData[0] || {
            id: 1,
            name: "ABSTRACT ELEGANCE",
            price: "$2,327",
            image: "/images/painting/2.1.png",
            category: "Oil",
            description:
              "Abstract Elegance explores the interplay of form and color in modern composition. This oil painting features bold brushstrokes and a rich palette that creates depth and emotion, inviting the viewer to find their own meaning within its layers."
          }
        }

        console.log('Using fallback data after error:', fallbackProduct);
        const typedFallback = fallbackProduct as unknown as ProductWithDescription;

        // Ensure the fallback product has images array
        if (!typedFallback.images && typedFallback.image) {
          typedFallback.images = [typedFallback.image];
        }

        // Initialize fallback selected variant if any
        const frameVars = Array.isArray(typedFallback.variants)
          ? typedFallback.variants.filter((v: any) => v.type === 'frame')
          : [];

        // Don't reset selectedVariant here - let the URL parameter effect handle it
        setCategoryName(derivedCategoryName || typedFallback.category);
        setCategoryDescription(derivedCategoryDescription || '');
        setProduct(typedFallback);
        // Fetch category data including care guide fields (same logic as main case)
        await fetchCategoryData(typedFallback);
        setDataSource('fallback');
        setError("Could not load product from API, using fallback data");
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [
    productId,
    router,
    resolveStaticProduct,
    normalizedCategoryFromUrl,
    normalizedCompositeSlugFromUrl,
    findProductInCategories,
    searchParams
  ])

  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [previousImageSrc, setPreviousImageSrc] = useState<string | null>(null);
  const [currentImageOpacity, setCurrentImageOpacity] = useState(1);
  const [previousImageOpacity, setPreviousImageOpacity] = useState(0);

  // Auto-scroll through images
  useEffect(() => {
    if (!isAutoScrolling || !product?.images || product.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => {
        const nextIndex = (prev + 1) % (product.images?.length || 1);
        return nextIndex;
      });
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoScrolling, product?.images]);

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  // State for all fetched products (fetched once, never changes based on variant)
  const [allFetchedProducts, setAllFetchedProducts] = useState<any[]>([]);

  // State for category variants (products from same category - for variant selector)
  const [categoryVariants, setCategoryVariants] = useState<any[]>([]);

  // Computed: Related products filtered by design (updates when selectedVariant changes)
  const relatedProducts = useMemo(() => {
    if (!allFetchedProducts || allFetchedProducts.length === 0) return [];
    if (!product) return [];

    // Use selectedVariant if available, otherwise use main product
    const activeProductForDesign = selectedVariant || product;
    const currentProduct = allFetchedProducts.find((p: any) => String(p.id) === String(activeProductForDesign.id));

    // Get design story
    let currentDesignStory = currentProduct?.designStory ||
      currentProduct?.design_story ||
      activeProductForDesign.designStory ||
      activeProductForDesign.design_story;

    // If no explicit designStory, try to extract from name or URL
    if (!currentDesignStory) {
      if (selectedVariant) {
        // For variants, extract design from name by removing product types and articles
        const variantName = (activeProductForDesign.name || '').toLowerCase();

        // Remove product type words
        const productTypes = ['bottle', 'bottles', 'coaster', 'coasters', 'notebook', 'notebooks',
          'mug', 'mugs', 'desk', 'mat', 'mats', 'card', 'cards', 'pad', 'pads',
          'diary', 'diaries', 'painting', 'paintings'];

        let cleanName = variantName;
        productTypes.forEach(type => {
          cleanName = cleanName.replace(new RegExp(`\\b${type}\\b`, 'gi'), '');
        });

        // Remove articles only at the START of the name (not in middle like "Flowers of the Wild")
        cleanName = cleanName.replace(/^(the|a|an)\s+/gi, '').trim().replace(/\s+/g, ' ');

        if (cleanName) {
          currentDesignStory = cleanName;  // "The Sun Bottle" -> "sun"
        }
      } else {
        // For main product, extract from URL
        if (typeof window !== 'undefined') {
          const pathParts = window.location.pathname.split('/').filter(Boolean);
          currentDesignStory = pathParts[pathParts.length - 1];
        }
      }
    }

    console.log('🎨 Design Detection:', {
      usingVariant: !!selectedVariant,
      activeProductName: activeProductForDesign.name,
      extractedDesign: currentDesignStory
    });

    if (!currentDesignStory) return [];

    // Filter by design
    const normalizeDesign = (str: string) => {
      return String(str || '')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normalizedCurrentDesign = normalizeDesign(currentDesignStory);
    const currentProductIdStr = activeProductForDesign?.id ? String(activeProductForDesign.id) : '';

    return allFetchedProducts.filter((p: any) => {
      if (String(p.id) === currentProductIdStr) return false;

      let productDesign = p.designStory || p.design_story;
      if (!productDesign && p.slug) {
        const slugParts = String(p.slug).toLowerCase().split('/');
        productDesign = slugParts[slugParts.length - 1];
      }

      const normalizedProductDesign = normalizeDesign(productDesign || '');
      const normalizedProductName = normalizeDesign(p.name || '');

      return (normalizedProductDesign && normalizedProductDesign === normalizedCurrentDesign) ||
        (normalizedProductName && normalizedCurrentDesign && normalizedProductName.includes(normalizedCurrentDesign));
    });
  }, [allFetchedProducts, product, selectedVariant]);

  const testimonialItems = useMemo(() => {
    if (!relatedProducts || relatedProducts.length === 0) return [];

    // Filter products that have testimonialImage set, then map to testimonial format
    return relatedProducts
      .filter((relatedProduct) => relatedProduct.testimonialImage) // Only show products with testimonialImage
      .map((relatedProduct) => {
        const productLink = getProductUrl({
          id: relatedProduct.id,
          slug: relatedProduct.slug,
          category: relatedProduct.categoryName || relatedProduct.category,
          name: relatedProduct.name,
          title: relatedProduct.name,
          type: relatedProduct.type
        });

        return {
          image: relatedProduct.testimonialImage,
          altText: relatedProduct.name || "Novino design",
          quote: `"${relatedProduct.name || "This piece"} from the ${relatedProduct.categoryName || relatedProduct.category || "Novino"
            } collection is crafted with layers of narrative and material."`,
          author: relatedProduct.categoryName || relatedProduct.category || "Novino Design",
          link: productLink,
          category: relatedProduct.categoryName || relatedProduct.category || "Design",
          productName: relatedProduct.name || "Novino Design"
        };
      });
  }, [relatedProducts]);

  const testimonialCategoryLinks = useMemo(() => {
    if (!relatedProducts || relatedProducts.length === 0) return [];

    const categoryMap = new Map<string, { label: string; href: string }>();

    relatedProducts.forEach((relatedProduct) => {
      const label = (relatedProduct.categoryName || relatedProduct.category || "Design").toUpperCase();

      if (categoryMap.has(label)) return;

      const href = getProductUrl({
        id: relatedProduct.id,
        slug: relatedProduct.slug,
        category: relatedProduct.categoryName || relatedProduct.category,
        name: relatedProduct.name,
        title: relatedProduct.name,
        type: relatedProduct.type
      });

      categoryMap.set(label, { label, href });
    });

    return Array.from(categoryMap.values());
  }, [relatedProducts]);

  // Fetch related products from the same category using new artefact-categories API
  useEffect(() => {
    async function fetchRelatedProducts() {
      if (!product) return;

      try {
        const res = await fetch('/api/artefact-categories', {
          next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (res.ok) {
          const categories = await res.json();

          // Get all products from all categories
          const allProducts: any[] = [];
          categories.forEach((category: any) => {
            if (category.products && Array.isArray(category.products)) {
              category.products.forEach((p: any) => {
                // Read testimonialImage directly from product data if it exists
                const testimonialImg = p.testimonialImage && typeof p.testimonialImage === 'string' && p.testimonialImage.trim() !== ''
                  ? p.testimonialImage.trim()
                  : null;

                // Debug log for products with testimonial images
                if (testimonialImg) {
                  console.log(`Product ${p.name} has testimonialImage:`, testimonialImg);
                }

                allProducts.push({
                  id: p.id,
                  name: p.name,
                  price: p.basePrice,
                  basePrice: p.basePrice,
                  image: p.images?.[0] || '/images/placeholder.png',
                  images: p.images || [],
                  testimonialImage: testimonialImg,
                  category: category.name,
                  categoryId: category.id || category._id,
                  categoryName: category.name,
                  description: p.description || '',
                  shortDescription: p.shortDescription || '',
                  summary: p.summary || '',
                  tagline: p.tagline || '',
                  specifications: p.specifications,
                  faqSection: p.faqSection,
                  variants: p.variants,
                  designStory: p.designStory || p.design_story || null,
                  slug: p.slug,
                  type: p.type,
                  packProduct: p.packProduct || false // Include packProduct field for variant label visibility
                });
              });
            }
          });

          // Find the current product's category
          const currentCategory = categories.find((cat: any) => {
            return cat.products?.some((p: any) => p.id === product.id);
          });

          // Get the current product's design story if available
          // Use selectedVariant if available (when user clicks a variant), otherwise use the main product
          const activeProductForDesign = selectedVariant || product;
          const currentProduct = allProducts.find((p: any) => String(p.id) === String(activeProductForDesign.id));

          // Priority 1: Use explicit designStory from product data (API)
          let currentDesignStory = currentProduct?.designStory ||
            currentProduct?.design_story ||
            activeProductForDesign.designStory ||
            activeProductForDesign.design_story;

          // Priority 2: Extract from URL pathname if no designStory in database
          // This handles legacy products and products without designStory set
          if (!currentDesignStory && typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            // URL format: /product/coasters/butterfly -> get "butterfly"
            currentDesignStory = pathParts[pathParts.length - 1];
          }

          // Debug logging
          console.log('🔍 Debug: Current Product for Design Matching:', {
            usingVariant: !!selectedVariant,
            activeProductId: activeProductForDesign.id,
            activeProductName: activeProductForDesign.name,
            extractedDesignStory: currentDesignStory,
            pathname: typeof window !== 'undefined' ? window.location.pathname : null,
          });

          console.log('🔍 All products with design stories:',
            allProducts
              .map((p: any) => {
                const design = p.designStory || p.design_story || (p.slug ? String(p.slug).split('/').pop() : null);
                return {
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  designStory: design
                };
              })
              .filter((p: any) => p.designStory)
          );

          // Filter products: prioritize products with same design, then same category
          const currentProductIdStr = product?.id ? String(product.id) : '';
          let related = allProducts.filter((p: any) => {
            if (String(p.id) === currentProductIdStr) return false;

            // First priority: Match by design story if it exists
            if (currentDesignStory) {
              // Try explicit designStory field first
              let productDesign = p.designStory || p.design_story;

              // If no explicit designStory, try to extract from slug
              if (!productDesign && p.slug) {
                const slugParts = String(p.slug).toLowerCase().split('/');
                productDesign = slugParts[slugParts.length - 1];
              }

              // Normalize design names for comparison
              // Convert "life_cycle" to "life cycle", "the-sun" to "the sun", etc.
              const normalizeDesign = (str: string) => {
                return String(str || '')
                  .toLowerCase()
                  .replace(/[_-]/g, ' ')  // Replace underscores and dashes with spaces
                  .replace(/\s+/g, ' ')   // Replace multiple spaces with single space
                  .trim();
              };

              const normalizedCurrentDesign = normalizeDesign(currentDesignStory);
              const normalizedProductDesign = normalizeDesign(productDesign || '');
              const normalizedProductName = normalizeDesign(p.name || '');

              // Check if designs match OR product name contains the design
              const hasDesignMatch =
                (normalizedProductDesign && normalizedProductDesign === normalizedCurrentDesign) ||
                (normalizedProductName && normalizedCurrentDesign && normalizedProductName.includes(normalizedCurrentDesign));

              if (hasDesignMatch) {
                console.log('✅ Design match found:', p.name, 'with design:', currentDesignStory);
                return true;
              }
            }

            return false;
          });

          // If no products with same design found, fall back to category filtering
          if (related.length === 0) {
            related = allProducts.filter((p: any) => {
              if (String(p.id) === currentProductIdStr) return false;

              // If we found the category, match by category ID
              if (currentCategory) {
                const currentCatId = currentCategory.id || currentCategory._id;
                return String(p.categoryId) === String(currentCatId);
              }

              // Fallback: match by category name
              return p.categoryName === categoryName;
            });
          }

          // Also create a separate array for category-based variants (for variant selector)
          const categoryBasedVariants = allProducts.filter((p: any) => {
            if (String(p.id) === currentProductIdStr) return false;

            // Match by category only
            if (currentCategory) {
              const currentCatId = currentCategory.id || currentCategory._id;
              return String(p.categoryId) === String(currentCatId);
            }

            // Fallback: match by category name
            return p.categoryName === categoryName;
          });

          const matchType = currentDesignStory && related.length > 0 ? 'design' : 'category';
          console.log(`✅ Related products found by ${matchType}:`, related.length,
            currentDesignStory ? `(Design: ${currentDesignStory})` : `(Category: ${categoryName})`);
          console.log(`📦 Category variants found:`, categoryBasedVariants.length, `(Category: ${categoryName})`);

          setAllFetchedProducts(allProducts);  // Store all products
          setCategoryVariants(categoryBasedVariants);  // For SELECT VARIANT section
        } else {
          console.error('Failed to fetch related products');
          setAllFetchedProducts([]);
          setCategoryVariants([]);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
        setAllFetchedProducts([]);
        setCategoryVariants([]);
      }
    }

    fetchRelatedProducts();
  }, [product, categoryName]) // Only re-fetch when product or category changes, NOT variant

  // Restore variant from URL hash on mount and when hash changes
  useEffect(() => {
    if (!product || !categoryVariants || categoryVariants.length === 0) return;

    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (!hash) {
      // Clear variant if no hash
      setSelectedVariant(null);
      return;
    }

    // Extract variant ID from hash (format: #variant-123)
    const variantIdMatch = hash.match(/^#variant-(.+)$/);
    if (!variantIdMatch) return;

    const variantId = variantIdMatch[1];

    // Find variant in categoryVariants (same category products)
    const variant = categoryVariants.find((v: any) => String(v.id) === String(variantId));

    if (variant) {
      setSelectedVariant(variant);
      setCurrentImage(0);
      setIsAutoScrolling(false);
    } else {
      // If variant not found, clear hash
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      setSelectedVariant(null);
    }
  }, [product, categoryVariants, pathname]);

  // Listen for hash changes (e.g., when coming back from login)
  useEffect(() => {
    const handleHashChange = () => {
      if (!product || !categoryVariants || categoryVariants.length === 0) return;

      const hash = window.location.hash;
      if (!hash) {
        setSelectedVariant(null);
        return;
      }

      const variantIdMatch = hash.match(/^#variant-(.+)$/);
      if (!variantIdMatch) return;

      const variantId = variantIdMatch[1];
      const variant = categoryVariants.find((v: any) => String(v.id) === String(variantId));

      if (variant) {
        setSelectedVariant(variant);
        setCurrentImage(0);
        setIsAutoScrolling(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [product, relatedProducts]);


  // Add to cart handler
  const handleAddToCart = () => {
    // Check if user is authenticated
    if (!isAuthenticated && !isAuthLoading) {
      // Show toast notification
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "default",
      });

      // Get current product page URL with all query params and hash
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const currentUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '') + hash;
      const encodedRedirectUrl = encodeURIComponent(currentUrl);

      // Redirect to login with current page as redirect parameter (including hash)
      router.push(`/login?redirect=${encodedRedirectUrl}`);
      return;
    }

    // Wait for auth to be ready
    if (isAuthLoading) {
      return;
    }

    const cartSource = selectedVariant || product;

    if (!cartSource) {
      console.error('Product is undefined');
      alert('Error: Product information is missing.');
      return;
    }

    const cartSourceId = cartSource.id || product?.id;
    if (!cartSourceId) {
      console.error('Product missing ID:', cartSource);
      alert('Error: Product ID is missing. Cannot add to cart.');
      return;
    }

    // Prepare the cart item with all required fields
    const cartItem = {
      id: String(cartSourceId).trim(),
      name: cartSource.name || product?.name || 'Unnamed Product',
      price: displayedPrice,
      image: displayedImage || cartSource.image || product?.image || '',
      quantity: quantity || 1,
      variant: selectedVariant ? selectedVariant.name : undefined
    };

    console.log('Adding to cart:', {
      id: cartItem.id,
      name: cartItem.name,
      price: cartItem.price,
      quantity: cartItem.quantity
    });

    addToCart(cartItem);
  };

  const resolvedProductImage = product?.image || (product?.images && product.images.length > 0 ? product.images[0] : "/images/painting/2.1.png");
  const productPrice = product?.price || product?.basePrice || "$0";
  const productImages = product?.images && product.images.length > 0 ? product.images : [resolvedProductImage];
  const totalImages = productImages.length;

  // categoryVariants is now coming from the state set in the useEffect above
  // It contains products from the same category (for the variant selector)

  // Get the current image to display based on hover or selection
  // Priority: hoveredVariant > selectedVariant > original product
  const activeVariant = hoveredVariant || selectedVariant;

  const getPreferredDescription = (item?: any) => {
    if (!item) return '';
    const sources = [
      item.description,
      item.shortDescription,
      item.summary,
      item.tagline
    ];
    for (const text of sources) {
      if (typeof text === 'string' && text.trim().length > 0) {
        return text.trim();
      }
    }
    return '';
  };

  // Use variant data if hovering or selected, otherwise use product data
  const displayedName = activeVariant?.name || product?.name;
  const variantDescription = getPreferredDescription(activeVariant);
  const productDescription = getPreferredDescription(product);
  const displayedDescription = variantDescription || productDescription;
  const displayedPrice = activeVariant?.basePrice || activeVariant?.price || productPrice;
  const variantImages = activeVariant?.images && activeVariant.images.length > 0
    ? activeVariant.images
    : null;
  const primaryCategoryLabel = (categoryName || product?.category || '').trim();
  const heroProductName = (() => {
    const baseName = (displayedName || '').trim();
    if (!baseName && !primaryCategoryLabel) return '';
    if (!baseName) return primaryCategoryLabel;
    if (!primaryCategoryLabel) return baseName;
    const alreadyIncludesCategory = baseName.toLowerCase().includes(primaryCategoryLabel.toLowerCase());
    return alreadyIncludesCategory ? baseName : `${baseName} ${primaryCategoryLabel}`.trim();
  })();
  const heroIntroText =
    (product?.shortDescription && product.shortDescription.trim()) ||
    (product?.summary && product.summary.trim()) ||
    (product?.tagline && product.tagline.trim()) ||
    (categoryDescription && categoryDescription.trim()) ||
    (displayedDescription
      ? displayedDescription.replace(/\s+/g, ' ').trim().slice(0, 220)
      : '');
  const categoryNarrative =
    (categoryDescription && categoryDescription.trim()) ||
    heroIntroText ||
    '';
  const productLogoUrl = product?.logoUrl;

  const displayedImage = variantImages
    ? (currentImage < variantImages.length ? variantImages[currentImage] : variantImages[0])
    : (currentImage < productImages.length ? productImages[currentImage] : resolvedProductImage);

  useEffect(() => {
    if (!displayedImage) return;

    if (currentImageSrc === null) {
      setCurrentImageSrc(displayedImage);
      setCurrentImageOpacity(1);
      setPreviousImageSrc(null);
      setPreviousImageOpacity(0);
      return;
    }

    if (displayedImage === currentImageSrc) return;

    setPreviousImageSrc(currentImageSrc);
    setPreviousImageOpacity(1);

    setCurrentImageSrc(displayedImage);
    setCurrentImageOpacity(0);

    requestAnimationFrame(() => {
      setCurrentImageOpacity(1);
      setPreviousImageOpacity(0);
    });

    const timeout = setTimeout(() => {
      setPreviousImageSrc(null);
    }, 700);

    return () => clearTimeout(timeout);
  }, [displayedImage, currentImageSrc]);

  // Get display images array for thumbnails
  const displayImages = variantImages || productImages;

  const showInitialLoader = !hasLoadedProduct && (isLoading || !product)
  if (showInitialLoader) {
    return <Preloader ariaLabel="Loading Product" />
  }

  const productImage = resolvedProductImage;

  // Generate breadcrumbs
  const canonicalProductPath = getProductUrl({
    id: product.id,
    slug: (product as any)?.slug,
    category: categoryName || product.category,
    name: product.name,
    title: product.name,
    type: product.type
  });
  const canonicalProductUrl = `${SITE_URL}${canonicalProductPath}`;
  const productSlugPath = canonicalProductPath.replace(/^\/product\//, '');
  const productSlugOnly = productSlugPath.split('/').pop() || productSlugPath || productId?.toString() || '';
  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: categoryName || 'Products', url: `${SITE_URL}/${product.type === 'artefact' ? 'artefacts' : 'paintings'}` },
    { name: product.name || 'Product', url: canonicalProductUrl },
  ];

  // Generate schemas
  const productSchemaData = product ? {
    name: product.name || '',
    description: product.description || '',
    image: product.image,
    images: product.images,
    price: product.price,
    basePrice: product.basePrice,
    category: categoryName || product.category,
    slug: productSlugPath,
    id: product.id?.toString() || productSlugOnly,
    availability: 'https://schema.org/InStock',
    brand: 'Novino.io',
  } : null;

  // Prepare schemas for injection
  const schemas = [];
  if (product && productSchemaData) {
    schemas.push({
      id: 'product-schema',
      json: generateProductSchema(productSchemaData),
    });
    schemas.push({
      id: 'breadcrumb-schema',
      json: generateBreadcrumbSchema(breadcrumbs),
    });
    if (product.faqSection?.faqs && product.faqSection.faqs.length > 0) {
      schemas.push({
        id: 'faq-schema',
        json: generateFAQSchema(
          product.faqSection.faqs.map((faq: any) => ({
            question: faq.question || '',
            answer: faq.answer || '',
          }))
        ),
      });
    }
  }

  return (
    <div className="bg-[#2D2D2D] text-white min-h-screen overflow-x-hidden">
      {/* SEO Schema - Injected into head for Google crawler */}
      {schemas.length > 0 && <SchemaInjector schemas={schemas} />}

      {/* Zoom animation styles */}
      <style jsx>{`
        @keyframes zoomFadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Utility to hide scrollbars for horizontal scrolling */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      <div className="w-full px-0 md:px-0 pt-24 pb-0 overflow-x-hidden">

        {isInvalidRoute && (
          <div className="bg-[#3D3D3D] text-white p-4 mb-6 rounded-md mx-auto" style={{ maxWidth: "1440px" }}>
            <p className="text-center font-light">
              <span className="text-amber-400 font-medium">Featured Product</span> — The requested product was not found. Showing a featured item instead.
              <Link href="/paintings" className="ml-2 underline text-white/80 hover:text-white">
                Browse all paintings
              </Link>
            </p>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <div className={`text-xs py-1 px-3 rounded-full absolute top-24 right-4 z-20 ${dataSource === 'api' ? 'bg-green-600/70' : 'bg-orange-600/70'
            }`}>
            {dataSource === 'api' ? 'API Data' : 'Fallback Data'}
          </div>
        )}
        {hasLoadedProduct && isLoading && (
          <div className="fixed inset-x-0 top-0 h-1 bg-gradient-to-r from-white/10 via-white/60 to-white/10 animate-pulse z-30 pointer-events-none" />
        )}

        {/* Main product display - Clean layout without borders */}
        <div className="relative mb-16 mx-auto w-full" style={{ maxWidth: "1440px" }}>
          <div className="relative z-10 px-2 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Product media + purchase column */}
              <div className="order-1 lg:order-2 lg:col-span-9 grid grid-cols-1 md:grid-cols-7 gap-6 lg:gap-8">
                {/* Product Image Gallery - Main image with thumbnails */}
                <div
                  className="md:col-span-4 md:col-start-1 flex flex-col gap-4 order-1 md:order-1 lg:ml-12"
                  data-product-image
                >
                  {/* Design Name - Mobile only (above image) */}
                  {heroProductName && (
                    <div className="lg:hidden mb-2">
                      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80 text-center font-['Roboto_Mono']">
                        {heroProductName}
                      </p>
                    </div>
                  )}

                  {/* Mobile: Smooth side-by-side swipe gallery */}
                  <div
                    ref={swipeContainerRef}
                    className="lg:hidden relative w-full h-[360px] sm:h-[440px] select-none overflow-hidden rounded-[28px]"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => setIsImageModalOpen(true)}
                    style={{ touchAction: 'pan-y pinch-zoom' }}
                  >
                    {/* Circular gradient glow */}
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
                      style={{
                        width: '140%',
                        height: '140%',
                        background: 'radial-gradient(circle, rgba(245,233,215,0.85) 0%, rgba(232,204,173,0.6) 35%, rgba(196,181,170,0.35) 60%, rgba(120,100,85,0.15) 80%, rgba(45,45,45,0) 100%)',
                        borderRadius: '50%',
                        filter: 'blur(40px)',
                      }}
                    />

                    {/* Horizontal image container - infinite scroll with cloned images */}
                    <div
                      className="flex h-full"
                      style={{
                        transform: `translateX(${translateX}px)`,
                        transition: (isSwiping || isResettingPosition) ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        willChange: 'transform',
                        width: imageWidth > 0 ? `${(displayImages.length > 1 ? displayImages.length + 2 : displayImages.length) * imageWidth}px` : `${displayImages.length * 100}%`,
                      }}
                      onTransitionEnd={() => {
                        // Handle seamless infinite loop after transition completes
                        if (!isSwiping && displayImages.length > 1 && imageWidth > 0) {
                          const imageCount = displayImages.length;

                          // When currentImage goes beyond bounds, wrap it back
                          if (currentImage >= imageCount) {
                            // We've scrolled past the last real image to the cloned first image
                            // Jump back to the real first image (index 0) WITHOUT transition
                            const wrappedIndex = currentImage % imageCount;
                            setIsResettingPosition(true); // Disable transition
                            setCurrentImage(wrappedIndex);
                            setTranslateX(-(wrappedIndex + 1) * imageWidth);
                            // Re-enable transition after the instant jump
                            setTimeout(() => {
                              setIsResettingPosition(false);
                            }, 50);
                          } else if (currentImage < 0) {
                            // We've scrolled before the first real image to the cloned last image
                            // Jump forward to the real last image WITHOUT transition
                            const wrappedIndex = ((currentImage % imageCount) + imageCount) % imageCount;
                            setIsResettingPosition(true); // Disable transition
                            setCurrentImage(wrappedIndex);
                            setTranslateX(-(wrappedIndex + 1) * imageWidth);
                            // Re-enable transition after the instant jump
                            setTimeout(() => {
                              setIsResettingPosition(false);
                            }, 50);
                          }
                        }
                      }}
                    >
                      {/* For infinite scroll: render [last, ...all, first] */}
                      {displayImages.length > 1 && (
                        <div
                          className="relative flex-shrink-0 h-full bg-[#f7f3ee] overflow-hidden"
                          style={{
                            width: imageWidth > 0 ? `${imageWidth}px` : '100%',
                            minWidth: imageWidth > 0 ? `${imageWidth}px` : '100%',
                          }}
                        >
                          <div
                            className="relative w-full h-full overflow-hidden shadow-[0_12px_24px_-18px_rgba(0,0,0,0.45)]"
                            style={{
                              borderRadius: isSwiping ? '0px' : '28px',
                              transition: isSwiping ? 'none' : 'border-radius 0.3s ease-out'
                            }}
                          >
                            <Image
                              src={displayImages[displayImages.length - 1]}
                              alt={`${product.name || "Product Image"} - Clone`}
                              fill
                              style={{ objectFit: 'cover', objectPosition: 'center' }}
                              priority={false}
                              className="pointer-events-none"
                              draggable={false}
                            />
                          </div>
                        </div>
                      )}

                      {displayImages.map((imageUrl, index) => (
                        <div
                          key={index}
                          className="relative flex-shrink-0 h-full bg-[#f7f3ee] overflow-hidden"
                          style={{
                            width: imageWidth > 0 ? `${imageWidth}px` : '100%',
                            minWidth: imageWidth > 0 ? `${imageWidth}px` : '100%',
                          }}
                        >
                          <div
                            className="relative w-full h-full overflow-hidden shadow-[0_12px_24px_-18px_rgba(0,0,0,0.45)]"
                            style={{
                              borderRadius: isSwiping ? '0px' : '28px',
                              transition: isSwiping ? 'none' : 'border-radius 0.3s ease-out'
                            }}
                          >
                            <Image
                              src={imageUrl}
                              alt={`${product.name || "Product Image"} - View ${index + 1}`}
                              fill
                              style={{ objectFit: 'cover', objectPosition: 'center' }}
                              priority={index === 0}
                              className="pointer-events-none"
                              draggable={false}
                            />
                          </div>
                        </div>
                      ))}

                      {displayImages.length > 1 && (
                        <div
                          className="relative flex-shrink-0 h-full bg-[#f7f3ee] overflow-hidden"
                          style={{
                            width: imageWidth > 0 ? `${imageWidth}px` : '100%',
                            minWidth: imageWidth > 0 ? `${imageWidth}px` : '100%',
                          }}
                        >
                          <div
                            className="relative w-full h-full overflow-hidden shadow-[0_12px_24px_-18px_rgba(0,0,0,0.45)]"
                            style={{
                              borderRadius: isSwiping ? '0px' : '28px',
                              transition: isSwiping ? 'none' : 'border-radius 0.3s ease-out'
                            }}
                          >
                            <Image
                              src={displayImages[0]}
                              alt={`${product.name || "Product Image"} - Clone`}
                              fill
                              style={{ objectFit: 'cover', objectPosition: 'center' }}
                              priority={false}
                              className="pointer-events-none"
                              draggable={false}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Subtle overlay */}
                    <div
                      className="absolute inset-0 bg-white/0 pointer-events-none z-20 rounded-[28px]"
                    />

                    {/* Carousel Dots Indicator - Mobile Only */}
                    {displayImages.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-30 pointer-events-none">
                        {displayImages.map((_, index) => (
                          <div
                            key={index}
                            className="transition-all duration-300"
                            style={{
                              width: currentImage === index ? '24px' : '6px',
                              height: '6px',
                              borderRadius: '3px',
                              backgroundColor: currentImage === index ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)',
                              boxShadow: currentImage === index ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.2)'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Desktop: Original zoom functionality */}
                  <div
                    ref={imageContainerRef}
                    className="hidden lg:block relative w-full h-[500px] select-none group cursor-pointer overflow-visible"
                    onMouseEnter={!isTouchDevice ? (() => { handleMouseEnter(); setIsAutoScrolling(false); }) : undefined}
                    onMouseLeave={!isTouchDevice ? (() => { handleMouseLeave(); setIsAutoScrolling(false); }) : undefined}
                    onMouseMove={!isTouchDevice ? handleMouseMove : undefined}
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    {/* Circular gradient glow that overflows and blends with background */}
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
                      style={{
                        width: '140%',
                        height: '140%',
                        background: 'radial-gradient(circle, rgba(245,233,215,0.85) 0%, rgba(232,204,173,0.6) 35%, rgba(196,181,170,0.35) 60%, rgba(120,100,85,0.15) 80%, rgba(45,45,45,0) 100%)',
                        borderRadius: '50%',
                        filter: 'blur(40px)',
                      }}
                    />

                    {/* Image container with light background */}
                    <div className="relative w-full h-full bg-[#f7f3ee] rounded-[28px] overflow-hidden shadow-[0_12px_24px_-18px_rgba(0,0,0,0.45)] z-10">
                      {previousImageSrc && (
                        <Image
                          src={previousImageSrc}
                          alt={product.name || "Previous product image"}
                          fill
                          style={{ objectFit: 'cover', objectPosition: 'center', opacity: previousImageOpacity }}
                          priority
                          className="pointer-events-none transition-all duration-700 ease-out"
                          draggable={false}
                        />
                      )}
                      <Image
                        src={currentImageSrc ?? displayedImage ?? resolvedProductImage}
                        alt={product.name || "Product Image"}
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'center', opacity: currentImageOpacity }}
                        priority
                        className="pointer-events-none transition-all duration-700 ease-out group-hover:scale-[1.02]"
                        draggable={false}
                      />
                    </div>

                    {/* Subtle hover overlay */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-500 pointer-events-none z-20 rounded-[28px]" />
                  </div>

                  {/* Thumbnail Gallery - Desktop only, hidden on mobile */}
                  {displayImages.length > 1 && (
                    <div className="hidden lg:flex gap-2 justify-center flex-wrap">
                      {displayImages.map((imageUrl, i) => (
                        <button
                          key={i}
                          onMouseEnter={() => {
                            setCurrentImage(i);
                            setIsAutoScrolling(false);
                          }}
                          onClick={() => {
                            setCurrentImage(i);
                            setIsAutoScrolling(false);
                          }}
                          className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-2 transition-all duration-300 rounded-sm ${currentImage === i
                            ? 'border-white shadow-lg shadow-white/20'
                            : 'border-white/20 hover:border-white/50 opacity-70 hover:opacity-100'
                            }`}
                        >
                          <Image
                            src={imageUrl}
                            alt={`${product.name} view ${i + 1}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="pointer-events-none"
                            draggable={false}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price and cart actions */}
                <div className="md:col-span-3 md:col-start-5 flex flex-col justify-start items-center md:items-start order-2 md:order-2 py-4 md:py-8 px-4 md:pl-4 lg:pl-8 relative w-full">
                  {/* Select Product (acting as variants from same category) */}
                  {categoryVariants.length > 0 && (
                    <div className="flex flex-col gap-3 mb-8 w-full">
                      <div className="text-xs text-white/40 uppercase tracking-widest font-['Roboto_Mono'] text-center md:text-left w-full">
                        Select Variant
                      </div>

                      <div className="flex gap-2 overflow-x-auto scrollbar-hide md:flex-wrap md:justify-start justify-start w-full pb-2 -mx-2 px-2 md:mx-0 md:px-0">
                        {/* Current Product */}
                        <button
                          onClick={() => {
                            setSelectedVariant(null);
                            // Clear hash when selecting current product
                            if (typeof window !== 'undefined') {
                              window.history.replaceState(null, '', window.location.pathname + window.location.search);
                            }
                          }}
                          onMouseEnter={() => setHoveredVariant(null)}
                          onMouseLeave={() => setHoveredVariant(null)}
                          className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-2 transition-all duration-300 rounded-sm group ${
                            product.packProduct
                              ? !selectedVariant
                                ? 'border-white shadow-lg shadow-white/30 opacity-100'
                                : 'border-white/40 opacity-100'
                              : !selectedVariant
                                ? 'border-white shadow-lg shadow-white/20'
                                : 'border-white/20 hover:border-white/50 opacity-70 hover:opacity-100'
                          }`}
                          title={product.name}
                        >
                          <Image
                            src={productImages[0]}
                            alt={product.name || "Current"}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="pointer-events-none"
                            draggable={false}
                          />
                          {/* Tag-style label for pack products */}
                          {product.packProduct && (
                            <div className="absolute bottom-1.5 left-0 right-0 z-20 pointer-events-none px-1">
                              <div className="px-3 py-0.5 rounded-full bg-[#AE876D] w-fit mx-auto shadow-[0_0_25px_rgba(174,135,109,0.8)] brightness-110">
                                <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wide text-white font-['Roboto_Mono'] whitespace-nowrap drop-shadow-sm">
                                  {product.name}
                                </span>
                              </div>
                            </div>
                          )}
                        </button>

                        {/* Other Products in Category (treated as variants) - Hover to preview, Click to select */}
                        {categoryVariants.slice(0, 5).map((variant: any) => {
                          const isActiveVariant = selectedVariant?.id === variant.id;
                          const isHoveredVariant = hoveredVariant?.id === variant.id;

                          return (
                            <button
                              key={variant.id}
                              onMouseEnter={() => setHoveredVariant(variant)}
                              onMouseLeave={() => setHoveredVariant(null)}
                              onClick={() => {
                                const isAlreadySelected = selectedVariant?.id === variant.id;
                                if (!isAlreadySelected) {
                                  setSelectedVariant(variant);
                                  setHoveredVariant(null);
                                  setCurrentImage(0);
                                  setIsAutoScrolling(false);

                                  // Set hash in URL to track selected variant
                                  if (typeof window !== 'undefined') {
                                    const variantHash = `#variant-${variant.id}`;
                                    window.history.replaceState(
                                      null,
                                      '',
                                      window.location.pathname + window.location.search + variantHash
                                    );
                                  }
                                }
                              }}
                              className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-2 transition-all duration-300 rounded-sm group ${
                                variant.packProduct
                                  ? isActiveVariant
                                    ? 'border-white shadow-lg shadow-white/30 opacity-100'
                                    : 'border-white/40 opacity-100'
                                  : isActiveVariant
                                    ? 'border-white shadow-lg shadow-white/20'
                                    : isHoveredVariant
                                      ? 'border-white/60 opacity-100'
                                      : 'border-white/20 hover:border-white/50 opacity-70 hover:opacity-100'
                              }`}
                              title={variant.name}
                            >
                              <Image
                                src={variant.images?.[0] || variant.image || '/images/placeholder.png'}
                                alt={variant.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="pointer-events-none"
                                draggable={false}
                              />
                              {/* Tag-style label for pack products */}
                              {variant.packProduct && (
                                <div className="absolute bottom-1.5 left-0 right-0 z-20 pointer-events-none px-1">
                                  <div className="px-3 py-0.5 rounded-full bg-[#AE876D] w-fit mx-auto shadow-[0_0_25px_rgba(174,135,109,0.8)] brightness-110">
                                    <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wide text-white font-['Roboto_Mono'] whitespace-nowrap drop-shadow-sm">
                                      {variant.name}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Display hover preview hint */}
                      {hoveredVariant && (
                        <div className="text-xs text-white/40 font-['Roboto_Mono'] italic text-center md:text-left w-full">
                          Previewing: {hoveredVariant.name} • Click to select
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price - Reveal Animation */}
                  <div className="w-full flex justify-center md:justify-start">
                    <PriceReveal price={formatPrice(displayedPrice)} />
                  </div>

                  {/* Quantity and Add to Cart */}
                  <div className="flex flex-row items-center gap-3 mb-8 w-full">
                    <div className="flex items-center border border-white/20 rounded-sm overflow-hidden backdrop-blur-sm flex-shrink-0">
                      <button
                        onClick={decreaseQuantity}
                        className="w-10 h-12 flex items-center justify-center hover:bg-white/10 transition-all duration-300 text-lg font-light"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-['Roboto_Mono'] text-sm border-x border-white/10">{quantity}</span>
                      <button
                        onClick={increaseQuantity}
                        className="w-10 h-12 flex items-center justify-center hover:bg-white/10 transition-all duration-300 text-lg font-light"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="flex-1 h-12 min-w-[120px] bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 px-6 uppercase tracking-[0.18em] text-[11px] leading-none font-medium transition-all duration-300 rounded-sm transform hover:scale-[1.02] active:scale-[0.98] font-['Roboto_Mono'] flex items-center justify-center whitespace-nowrap"
                    >
                      Add to Cart
                    </button>
                  </div>

                  {/* Product Information Text */}
                  <p className="text-[10px] text-white/40 text-center md:text-left font-['Roboto_Mono'] -mt-4 px-2 md:px-0 w-full">
                    All the paintings are high definition digital copy of the original artwork
                  </p>

                  {/* Authentication Links - Only show if NOT logged in */}
                  {!isAuthenticated && (
                    <div className="pt-4 border-t border-white/10 mt-6 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 text-xs w-full">
                        <Link href={`/signup?redirect=${encodeURIComponent(canonicalProductPath)}`} className="text-white/40 hover:text-white/70 transition font-['Roboto_Mono'] uppercase tracking-wider text-center sm:text-left">
                          Are you new? Register
                        </Link>
                        <Link href={`/login?redirect=${encodeURIComponent(canonicalProductPath)}`} className="text-white/40 hover:text-white/70 transition font-['Roboto_Mono'] uppercase tracking-wider text-center sm:text-right">
                          Already registered? Login
                        </Link>
                      </div>
                    </div>
                  )}


                  {/* Care Guide - Collapsible Description Section - Always show */}
                  <div className="mt-6 border-t border-b border-white/10 pt-6 pb-6 w-full">
                    <button
                      type="button"
                      onClick={toggleCareGuide}
                      className="w-full flex justify-between items-center text-white text-sm font-medium text-left hover:text-white/80 transition-all duration-300 group"
                    >
                      <span className="uppercase tracking-wider font-['Roboto_Mono'] font-bold text-xs">Description</span>
                      <div className="flex items-center justify-center w-6 h-6 rounded-sm border border-white/20 group-hover:border-white/40 transition-all duration-300">
                        {isCareGuideOpen ? (
                          <Minus size={14} className="text-white/80 group-hover:text-white transition-colors" />
                        ) : (
                          <Plus size={14} className="text-white/80 group-hover:text-white transition-colors" />
                        )}
                      </div>
                    </button>
                    {isCareGuideOpen && (
                      <div className="mt-4 space-y-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                        {categoryDetails.length > 0 ? (
                          categoryDetails.map((detail, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pb-3 border-b border-white/5 last:border-b-0 last:pb-0">
                              <span className="text-white/50 text-xs font-medium sm:min-w-[110px] uppercase tracking-wider font-['Roboto_Mono']">{detail.label.toUpperCase()}</span>
                              <span className="text-white/80 text-xs leading-relaxed">{detail.value}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-white/40 text-xs italic">
                            No details available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Storytelling column (shown last on mobile) */}
              <div className="order-2 lg:order-1 lg:col-span-3 flex flex-col justify-start py-4 sm:py-8 lg:-mr-12 text-center lg:text-left items-center lg:items-start px-4 sm:px-0">
                {heroProductName && (
                  <>
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80 mb-3 font-['Roboto_Mono']">
                      {heroProductName}
                    </p>
                    <div className="mb-4">
                      <Image
                        src="/images/NOVINO -WHITE.png"
                        alt="Novino wordmark"
                        width={140}
                        height={32}
                        className="w-28 sm:w-32 h-auto object-contain opacity-90"
                        priority={false}
                      />
                    </div>
                  </>
                )}

                {displayedDescription && (
                  <div className="mb-5">
                    <div className="text-white/70 leading-relaxed text-base font-['Roboto_Mono'] transition-opacity duration-300">
                      <p className="whitespace-pre-line">{displayedDescription}</p>
                    </div>
                  </div>
                )}

                {productLogoUrl && (
                  <div className="mb-8">
                    <Image
                      src={productLogoUrl}
                      alt={`${displayedName || 'Product'} logo`}
                      width={240}
                      height={120}
                      className="w-auto h-16 sm:h-20 object-contain"
                    />
                  </div>
                )}

                {categoryNarrative && (
                  <div className="pt-6 border-t border-white/10">
                    <div className="text-white/60 leading-relaxed text-base font-['Roboto_Mono'] transition-opacity duration-300">
                      <p className="whitespace-pre-line">{categoryNarrative}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Zoom View Overlay - Desktop only - Positioned to the right */}
              {!isTouchDevice && isHoveringZoom && displayedImage && imageDimensions.width > 0 && (() => {
                const bgPos = getZoomBackgroundPosition();
                const zoomFactor = 3;
                // Reduce zoom box width to 92% to prevent right-side cutoff
                const zoomBoxWidth = imageDimensions.width > 0 ? imageDimensions.width * 0.92 : 460;
                const zoomBoxHeight = imageDimensions.height > 0 ? imageDimensions.height * 1.0 : 500;

                // Ensure zoom box doesn't overflow viewport on the right
                const maxLeft = typeof window !== 'undefined' ? window.innerWidth - zoomBoxWidth - 20 : zoomPosition.left;
                const adjustedLeft = Math.min(zoomPosition.left, maxLeft);

                return (
                  <div
                    className="hidden lg:block fixed z-50 pointer-events-none overflow-hidden bg-[#f7f3ee] rounded-[28px] shadow-2xl border-2 border-white/20"
                    style={{
                      top: `${zoomPosition.top}px`,
                      left: `${adjustedLeft}px`,
                      width: `${zoomBoxWidth}px`,
                      height: `${zoomBoxHeight}px`,
                      opacity: 1,
                      transition: 'opacity 0.15s ease-in-out',
                      animation: 'zoomFadeIn 0.2s ease-in-out',
                    }}
                  >
                    {/* Zoomed Image */}
                    <div
                      className="relative w-full h-full"
                      style={{
                        width: `${imageDimensions.width * zoomFactor}px`,
                        height: `${imageDimensions.height * zoomFactor}px`,
                        transform: `translate(${bgPos.x}px, ${bgPos.y}px)`,
                        transition: 'transform 0.05s ease-out',
                      }}
                    >
                      <Image
                        src={displayedImage}
                        alt="Zoomed product view"
                        fill
                        style={{ objectFit: 'cover' }}
                        className="pointer-events-none"
                        priority
                        unoptimized
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Image Modal with Right-Side Thumbnails */}
        {isImageModalOpen && (
          <div
            className="fixed inset-0 z-[1001] bg-black/60 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setIsImageModalOpen(false)}
            style={{ touchAction: 'pan-x pan-y' }}
          >
            {/* Close button - Top right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsImageModalOpen(false);
              }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[1020] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 group"
              aria-label="Close image"
              style={{ touchAction: 'auto' }}
            >
              <X size={20} className="sm:w-6 sm:h-6 text-white" />
            </button>

            {/* Main Container - Responsive Layout */}
            <div
              className="relative w-full h-full max-w-7xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 p-4 sm:p-8"
              onClick={(e) => e.stopPropagation()}
              style={{ touchAction: 'pan-x pan-y' }}
            >
              {/* Main Image Area */}
              <div
                className="relative flex-1 w-full h-full flex flex-col items-center justify-center sm:min-h-0"
                style={{ touchAction: 'pan-x pan-y' }}
              >
                {/* Navigation Arrows - only show if multiple images */}
                {displayImages.length > 1 && (
                  <>
                    {/* Left Arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
                      }}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-[1015] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                      aria-label="Previous image"
                      style={{ touchAction: 'auto' }}
                    >
                      <ChevronLeft size={24} className="text-white" />
                    </button>

                    {/* Right Arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage((prev) => (prev + 1) % displayImages.length);
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-[1015] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-white/80 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                      aria-label="Next image"
                      style={{ touchAction: 'auto' }}
                    >
                      <ChevronRight size={24} className="text-white" />
                    </button>
                  </>
                )}

                {/* Main Image - Full Height with Custom Pinch-to-Zoom */}
                <div
                  ref={modalImageRef}
                  className="relative w-full h-full min-h-[60vh] sm:min-h-0 overflow-hidden flex items-center justify-center"
                  onTouchStart={handleModalImageTouchStart}
                  onTouchMove={handleModalImageTouchMove}
                  onTouchEnd={handleModalImageTouchEnd}
                  style={{
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${modalZoomScale}) translate(${modalZoomTranslate.x}px, ${modalZoomTranslate.y}px)`,
                      transition: initialPinchDistance ? 'none' : 'transform 0.3s ease-out',
                      width: '100%',
                      height: '100%',
                      position: 'relative'
                    }}
                  >
                    <Image
                      src={displayImages[currentImage] || displayImages[0] || resolvedProductImage}
                      alt={`${product.name || "Product Image"} - View ${currentImage + 1}`}
                      fill
                      style={{
                        objectFit: 'contain',
                        objectPosition: 'center',
                        userSelect: 'none'
                      }}
                      className="pointer-events-none select-none"
                      draggable={false}
                      priority
                    />
                  </div>
                </div>

                {/* Mobile: Horizontal Thumbnail Strip at Bottom - Centered */}
                {displayImages.length > 1 && (
                  <div
                    className="flex sm:hidden flex-row gap-3 w-full justify-center overflow-x-auto py-3 px-2 absolute bottom-12 left-0 right-0 z-[1020] scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                    style={{ touchAction: 'pan-x' }}
                  >
                    {displayImages.map((imageUrl, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImage(i);
                        }}
                        className={`relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg border-2 transition-all duration-300 ${currentImage === i
                          ? 'border-white scale-105'
                          : 'border-white/30 active:border-white/60 opacity-60 active:opacity-100'
                          }`}
                        style={{ touchAction: 'auto' }}
                      >
                        <Image
                          src={imageUrl}
                          alt={`${product.name} thumbnail ${i + 1}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="pointer-events-none"
                          draggable={false}
                        />

                        {/* Active indicator */}
                        {currentImage === i && (
                          <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop: Vertical Thumbnail Strip on Right */}
              {displayImages.length > 1 && (
                <div className="hidden sm:flex flex-col gap-3 h-full max-h-[85vh] overflow-y-auto py-2 pr-4 pl-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {displayImages.map((imageUrl, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage(i);
                      }}
                      className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-lg border-2 transition-all duration-300 ${currentImage === i
                        ? 'border-white shadow-lg shadow-white/30 scale-105'
                        : 'border-white/30 hover:border-white/60 opacity-60 hover:opacity-100'
                        }`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${product.name} thumbnail ${i + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="pointer-events-none"
                        draggable={false}
                      />

                      {/* Active indicator */}
                      {currentImage === i && (
                        <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Specification section - Only show if specifications exist */}
        {product.specifications && (product.specifications.title || product.specifications.content || product.specifications.imageUrl) && (
          <div className="mx-auto border-t border-white/10 pt-12 pb-6 w-full" style={{ maxWidth: "1440px" }}>
            <h2 style={{ fontFamily: 'DM Serif Display' }} className="text-2xl font-light mb-8 px-4 md:px-6">Specifications</h2>
            <div className="flex flex-col md:flex-row gap-12 w-full py-8 px-4 md:px-6">
              {/* Image on the left (wider) */}
              {product.specifications.imageUrl && (
                <div className="md:w-7/12">
                  <div className="relative w-full pt-[100%]">
                    <Image
                      src={product.specifications.imageUrl}
                      alt="Product specifications diagram"
                      fill
                      style={{ objectFit: 'contain' }}
                      className="opacity-95"
                    />
                  </div>
                </div>
              )}

              {/* Specifications on the right */}
              {(product.specifications.title || product.specifications.content) && (
                <div className={`${product.specifications.imageUrl ? 'md:w-5/12' : 'w-full'} flex flex-col justify-center`}>
                  {product.specifications.title && (
                    <h5 style={{ fontFamily: 'DM Serif Display' }} className="text-white text-2xl mb-4 capitalize">
                      {product.specifications.title}
                    </h5>
                  )}
                  {product.specifications.content && (
                    <pre style={{ fontFamily: 'Roboto Mono' }} className="text-white/90 whitespace-pre-line text-base leading-relaxed">
                      {product.specifications.content}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQs section - accordion layout - Only show if FAQs exist */}
        {product.faqSection?.faqs && product.faqSection.faqs.length > 0 && (
          <div className="mx-auto border-t border-white/10 pt-20 pb-6 w-full" style={{ maxWidth: "1440px" }}>
            <h2 className="text-2xl font-light mb-8 px-0 md:px-6">FAQs</h2>
            <div className="flex flex-col-reverse md:flex-row gap-8 px-0 md:px-6">
              {/* FAQs list */}
              <div className={`w-full ${product.faqSection.imageUrl ? 'md:w-4/12' : 'md:w-full'} space-y-4 pt-8 ${product.faqSection.imageUrl ? 'md:pt-44' : 'md:pt-0'}`}>
                {product.faqSection.faqs.map((faq: any, index: number) => (
                  <div key={faq.id || index} className="border-b border-white/20 pb-4">
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full flex justify-between items-center text-white text-base font-medium text-left"
                    >
                      <span className="pr-4">{faq.question}</span>
                      {openFaqIndex === index ? <Minus size={24} /> : <Plus size={24} />}
                    </button>
                    {openFaqIndex === index && (
                      <p className="mt-2 text-white/80 text-sm whitespace-pre-line">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {/* FAQ Image on the right (wider) on desktop, top on mobile - Only show if image exists */}
              {product.faqSection.imageUrl && (
                <div className="w-full md:w-8/12">
                  <div className="relative w-full pt-[100%] md:pt-[100%]">
                    <Image
                      src={product.faqSection.imageUrl}
                      alt="Product image"
                      fill
                      style={{ objectFit: 'contain' }}
                      className="opacity-95"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full-width image section after FAQs - Only show if additionalImageUrl exists */}
        {product.additionalImageUrl && (
          <div className="relative w-full md:w-screen mt-16 mb-16 overflow-hidden" style={{ marginLeft: 'calc(-50vw + 50%)', maxWidth: '100vw' }}>
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>  {/* 16:9 aspect ratio */}
              <Image
                src={product.additionalImageUrl}
                alt="Product showcase"
                fill
                style={{ objectFit: 'cover' }}
                className="opacity-100"
                priority
              />
            </div>
          </div>
        )}


        {/* Design Stories - Product Testimonial - Only show if products with testimonialImage exist */}
        {testimonialItems.length > 0 && (
          <div className="mt-12 mb-16 mx-auto w-full" style={{ maxWidth: "1440px" }}>
            <div className="px-0 md:px-6">
              <ProductTestimonial
                items={testimonialItems}
                categoryLinks={testimonialCategoryLinks}
                title="Design Stories"
                subtitle="Design"
              />
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-16 mx-auto w-full" style={{ maxWidth: "1440px" }}>
            <div className="px-2 md:px-6">
              <h2 className="text-2xl sm:text-3xl font-light mb-8 text-center font-['Roboto_Mono'] tracking-wider">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {relatedProducts.slice(0, 3).map((relatedProduct) => {
                  const productImage = relatedProduct.images?.[0] || relatedProduct.image || '/images/placeholder.png';
                  const productName = relatedProduct.name || 'Untitled';
                  const productLink = getProductUrl({
                    id: relatedProduct.id,
                    slug: relatedProduct.slug,
                    category: relatedProduct.categoryName || relatedProduct.category,
                    name: relatedProduct.name,
                    title: relatedProduct.name,
                    type: relatedProduct.type
                  });

                  return (
                    <Link
                      href={productLink}
                      key={relatedProduct.id}
                      className="group"
                    >
                      <div className="h-full rounded-3xl overflow-hidden bg-gradient-to-br from-white/8 via-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-white/30 hover:shadow-2xl hover:shadow-black/30">
                        <div className="relative aspect-[5/4] bg-[#1F1F1F] overflow-hidden">
                          <Image
                            src={productImage}
                            alt={productName}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-5 sm:p-6 space-y-2">
                          <div className="text-xs uppercase tracking-[0.3em] text-white/60 font-['Roboto_Mono']">
                            {productName}
                          </div>
                          <h3 className="text-lg text-white font-medium tracking-wide group-hover:text-[#E5C29F] transition-colors font-['Roboto_Mono']">
                            {relatedProduct.categoryName || relatedProduct.type || 'Product'}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Testimonial Collection and Wardrobe Section - matching homepage width */}
      <div className="max-w-[1440px] mx-auto px-2 md:px-6 z-10 relative">
        {/* Testimonial Collection */}
        {/* <div className="mt-12 mb-16">
          <TestimonialCollection />
        </div> */}

        {/* Blog Section - reduced spacing */}
        {/* <div className="mt-8">
          <BlogSection />
        </div> */}

        {/* Wardrobe Section - reduced spacing */}
        <div className="mt-8 mb-16">
          <WardrobeSection />
        </div>
      </div>

      {/* Footer Section */}
      <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
        <div className="px-2 md:px-6">
          <Footer />
        </div>
      </div>


    </div>
  )

}
