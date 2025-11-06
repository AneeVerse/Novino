// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronUp, ChevronDown, ArrowLeft, Plus, Minus } from "lucide-react"
import paintingProductData from "@/public/data/painting-products.json"
import TestimonialCollection from "@/components/testimonial-collection"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import Footer from "@/components/footer"
import { useRouter, useParams } from "next/navigation"
import { useCallback } from "react"
import { useCart } from '@/contexts/CartContext'
import Preloader from "@/components/ui/preloader"

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
}

// Helper type for accordion content
interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

export default function ProductDetail() {
  const router = useRouter()
  const params = useParams()
  const [product, setProduct] = useState<ProductWithDescription | undefined>(undefined)
  const [categoryName, setCategoryName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'api' | 'fallback'>('fallback')
  
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // Next.js useParams returns string | string[] | undefined
  const rawId = params?.id
  // Extract single string ID
  const paramId = Array.isArray(rawId) ? rawId[0] : rawId
  // Use raw string ID for API calls
  const productId = paramId && paramId !== 'undefined' ? paramId : null
  const isValidId = typeof productId === 'string' && productId.length > 0
  const [isInvalidRoute, setIsInvalidRoute] = useState(false)

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Add the cart context
  const { addToCart } = useCart();

  // If we detect an invalid route, we could redirect programmatically
  useEffect(() => {
    if (paramId === 'undefined' && paintingProductData.length > 0) {
      // If we have undefined in the URL, redirect to the first valid product
      const firstValidProduct = paintingProductData[0]
      if (firstValidProduct?.id) {
        router.replace(`/product/${firstValidProduct.id}`)
      }
    }
  }, [paramId, router])

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true)
      
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
          // Adding cache: 'no-store' to ensure fresh data always
          cache: 'no-store'
        });
        const endTime = Date.now();
        
        console.log(`API response status: ${response.status} (took ${endTime - startTime}ms)`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API data received:', data);
          
          if (data && (data.id || data._id)) {
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
              additionalImageUrl: data.additionalImageUrl
            };
            
            console.log('Using API data for product display:', formattedProduct);
            console.log('Product images:', formattedProduct.images);
            setProduct(formattedProduct);
            // Lookup category name
            try {
              const catsRes = await fetch('/api/categories');
              if (catsRes.ok) {
                const cats = await catsRes.json();
                const catItem = cats.find((cat: any) => (cat._id || cat.id) === formattedProduct.category);
                setCategoryName(catItem?.name || formattedProduct.category);
              } else {
                setCategoryName(formattedProduct.category);
              }
            } catch (e) {
              console.error('Error fetching categories:', e);
              setCategoryName(formattedProduct.category);
            }
            // Initialize selected frame variant
            const frameVariants = Array.isArray(formattedProduct.variants)
              ? formattedProduct.variants.filter((v: any) => v.type === 'frame')
              : [];
            setSelectedVariant(null);
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
          
          // Attempt to find the product in painting products first
          let fallbackProduct: ProductWithDescription | undefined = paintingProductData.find(p => p.id === safeProductId)
          
          // If not found in paintings, try to find in artefacts
          if (!fallbackProduct) {
            fallbackProduct = artefactProducts.find(p => p.id === safeProductId)
          }
          
          // If still not found, use default
          if (!fallbackProduct) {
            fallbackProduct = paintingProductData[0] || {
              id: 1,
              name: "ABSTRACT ELEGANCE",
              price: "$2,327",
              image: "/images/painting/2.1.png",
              category: "Oil",
              description: "Abstract Elegance explores the interplay of form and color in modern composition. This oil painting features bold brushstrokes and a rich palette that creates depth and emotion, inviting the viewer to find their own meaning within its layers."
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
          setCategoryName(typedFallback.category);
          setSelectedVariant(null);
          setDataSource('fallback');
          setError(`API Error (${response.status}): Could not load product from API, using fallback data`);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        
        // Fallback to local data on error
        const fallbackProduct = paintingProductData.find(p => p.id === productId) || 
          artefactProducts.find(p => p.id === productId) || 
          paintingProductData[0] || {
            id: 1,
            name: "ABSTRACT ELEGANCE",
            price: "$2,327",
            image: "/images/painting/2.1.png",
            category: "Oil",
            description: "Abstract Elegance explores the interplay of form and color in modern composition. This oil painting features bold brushstrokes and a rich palette that creates depth and emotion, inviting the viewer to find their own meaning within its layers."
          };
        
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
        setSelectedVariant(null);
        setCategoryName(typedFallback.category);
        setProduct(typedFallback);
        setDataSource('fallback');
        setError("Could not load product from API, using fallback data");
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProduct()
  }, [productId, router])

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

  // Related products - get 3 products from static data for now
  // This could be enhanced to fetch from API in the future
  const relatedProducts = isValidId && product?.id 
    ? paintingProductData.filter(p => p.id !== product.id).slice(0, 3)
    : paintingProductData.slice(1, 4) // If showing featured product, show other products as related

  // Add to cart handler
  const handleAddToCart = () => {
    if (product) {
      // Ensure product has a valid ID
      if (!product.id) {
        console.error('Product missing ID:', product);
        alert('Error: Product ID is missing. Cannot add to cart.');
        return;
      }
      
      // Prepare the cart item with all required fields
      const cartItem = {
        id: String(product.id).trim(), // Ensure ID is a string and trimmed
        name: product.name || 'Unnamed Product',
        price: displayedPrice,
        image: displayedImage || product.image || '',
        quantity: quantity || 1,
        variant: selectedVariant ? selectedVariant.name : undefined
      };
      
      console.log('Adding to cart:', {
        id: cartItem.id,
        name: cartItem.name,
        price: cartItem.price,
        quantity: cartItem.quantity
      });
      
      // Add to cart (this will automatically open the cart drawer)
      addToCart(cartItem);
    } else {
      console.error('Product is undefined');
      alert('Error: Product information is missing.');
    }
  };

  if (isLoading) {
    return <Preloader ariaLabel="Loading Product" />
  }

  if (!product) {
    return (
      <div className="bg-[#2D2D2D] text-white min-h-screen flex items-center justify-center">
        <div className="text-2xl">Product not found</div>
      </div>
    )
  }

  // Use either the image array or fallback to a single image
  const productImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : "/images/painting/2.1.png")
  // Use either price or basePrice, whichever is available
  const productPrice = product.price || product.basePrice || "$0"
  // Derive displayed values based on selected variant
  const displayedVariant = selectedVariant;
  const displayedPrice = displayedVariant?.price || productPrice;
  
  // Handle the product images array
  const productImages = product.images || [productImage];
  const totalImages = productImages.length;
  
  // Get the current image to display based on the current index
  const displayedImage = selectedVariant?.imageUrl || 
    (currentImage < productImages.length 
      ? productImages[currentImage] 
      : productImage);

  // Prepare color variants from product
  const colorVariants = Array.isArray(product?.variants)
    ? product.variants.filter((v: any) => v.type === 'color')
    : [];
  // Prepare frame variants from product
  const frameVariants = Array.isArray(product?.variants)
    ? product.variants.filter((v: any) => v.type === 'frame')
    : [];

  // Get basic color and frame for "unstyled" button state
  const hasSelectedColor = colorVariants.some(v => selectedVariant?.id === v.id);
  const hasSelectedFrame = frameVariants.some(v => selectedVariant?.id === v.id);

  return (
    <div className="bg-[#2D2D2D] text-white min-h-screen">
      <div className="w-full px-4 md:px-0 pt-24 pb-0">
       
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
          <div className={`text-xs py-1 px-3 rounded-full absolute top-24 right-4 z-20 ${
            dataSource === 'api' ? 'bg-green-600/70' : 'bg-orange-600/70'
          }`}>
            {dataSource === 'api' ? 'API Data' : 'Fallback Data'}
          </div>
        )}
       
        {/* Main product display - Clean layout without borders */}
        <div className="relative mb-16 mx-auto w-full" style={{ maxWidth: "1440px" }}>
          <div className="relative z-10 px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              {/* Left column - Product title and description */}
              <div className="lg:col-span-3 flex flex-col justify-start py-8">
                <div className="uppercase text-xs text-white/50 mb-3 tracking-wider font-['Roboto_Mono']">
                  {categoryName}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-8 tracking-wide font-['Roboto_Mono']" style={{ lineHeight: '1.2' }}>
                  {product.name?.toUpperCase()}
                </h1>
                
                <div className="text-white/70 leading-relaxed text-sm sm:text-base font-['Roboto_Mono']" style={{ maxWidth: '480px' }}>
                  <p className="whitespace-pre-line">{product.description}</p>
                </div>
              </div>

              {/* Right section - Product Image and Purchase Details */}
              <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
                {/* Product Image - Fixed size with drag scroll */}
                <div 
                  className="md:col-span-3 flex items-start justify-center order-1 md:order-1" 
                  data-product-image
                  onMouseEnter={() => setIsAutoScrolling(false)}
                  onMouseLeave={() => setIsAutoScrolling(true)}
                >
                  <div 
                    className="relative w-full h-[380px] sm:h-[480px] lg:h-[560px] overflow-hidden select-none group cursor-grab active:cursor-grabbing"
                    style={{ touchAction: 'pan-y' }}
                    onMouseDown={(e) => {
                      const startX = e.pageX;
                      let hasMoved = false;
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.pageX - startX;
                        
                        // If dragged more than 50px, change image
                        if (Math.abs(deltaX) > 50 && !hasMoved) {
                          hasMoved = true;
                          if (deltaX > 0) {
                            // Dragged right - go to previous image
                            setCurrentImage((prev) => prev === 0 ? productImages.length - 1 : prev - 1);
                          } else {
                            // Dragged left - go to next image
                            setCurrentImage((prev) => (prev + 1) % productImages.length);
                          }
                          setIsAutoScrolling(false);
                          setTimeout(() => setIsAutoScrolling(true), 5000);
                        }
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  >
                    <Image
                      src={displayedImage}
                      alt={product.name || "Product Image"}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                      className="pointer-events-none transition-all duration-300"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Price and cart actions */}
                <div className="md:col-span-2 flex flex-col justify-start order-2 md:order-2 py-8">
                    {/* Variant Options */}
                  {(frameVariants.length > 0 || colorVariants.length > 0) && (
                    <div className="flex flex-col gap-6 mb-8">
                      {colorVariants.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <div className="text-xs text-white/40 uppercase tracking-widest font-['Roboto_Mono']">Finish</div>
                          <div className="flex flex-wrap gap-3">
                            {colorVariants.map((variant: any) => (
                              <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${
                                  selectedVariant?.id === variant.id
                                    ? 'border-white ring-2 ring-white/30 ring-offset-2 ring-offset-[#2D2D2D]'
                                    : 'border-white/20 hover:border-white/40'
                                }`}
                                style={{ 
                                  backgroundColor: variant.colorCode || '#8B4513'
                                }}
                                title={variant.name}
                              />
                            ))}
                          </div>
                          {selectedVariant && colorVariants.some(v => v.id === selectedVariant.id) && (
                            <div className="text-xs text-white/60 font-['Roboto_Mono']">
                              {selectedVariant.name}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {frameVariants.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <div className="text-xs text-white/40 uppercase tracking-widest font-['Roboto_Mono']">Frame Type</div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              key="basic"
                              onClick={() => {
                                if (hasSelectedColor) {
                                  const currentColor = colorVariants.find(v => v.id === selectedVariant?.id);
                                  setSelectedVariant(currentColor);
                                } else {
                                  setSelectedVariant(null);
                                }
                              }}
                              className={`px-5 py-2.5 text-xs uppercase tracking-wide border transition-all font-['Roboto_Mono'] ${
                                !hasSelectedFrame
                                  ? 'border-white bg-white/10 text-white'
                                  : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'
                              }`}
                            >
                              Standard
                            </button>
                            {frameVariants.map((variant: any) => (
                              <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                className={`px-5 py-2.5 text-xs uppercase tracking-wide border transition-all font-['Roboto_Mono'] ${
                                  selectedVariant?.id === variant.id
                                    ? 'border-white bg-white/10 text-white'
                                    : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'
                                }`}
                              >
                                {variant.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-3xl font-light mb-2 font-['Roboto_Mono']">{displayedPrice}</div>
                  <div className="text-xs text-white/40 mb-6 font-['Roboto_Mono']">Inc. Tax • Lead time 6-8 weeks</div>
                  
                  {/* Quantity and Add to Cart */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center border border-white/20">
                      <button 
                        onClick={decreaseQuantity}
                        className="w-10 h-12 flex items-center justify-center hover:bg-white/5 transition text-lg font-light"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-['Roboto_Mono'] text-sm">{quantity}</span>
                      <button 
                        onClick={increaseQuantity}
                        className="w-10 h-12 flex items-center justify-center hover:bg-white/5 transition text-lg font-light"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={handleAddToCart}
                      className="flex-1 bg-white text-black hover:bg-white/90 py-3 px-6 uppercase tracking-widest text-xs font-medium transition-all font-['Roboto_Mono']"
                    >
                      Add to Cart
                    </button>
                  </div>
                  
                  {/* Trade Portal Link - Only show if user is NOT logged in */}
                  {!isLoggedIn && (
                    <div className="pt-6 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40 font-['Roboto_Mono']">Are you a specifier?</span>
                        <Link href="/login" className="uppercase tracking-wider text-white/70 hover:text-white transition font-['Roboto_Mono']">
                          Login to Trade Portal
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Image pagination - Centered below the entire product section */}
          {totalImages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12 pb-8">
              {productImages.map((imageUrl, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setCurrentImage(i);
                    setIsAutoScrolling(false); // Pause auto-scroll when user manually clicks
                    // Smooth scroll to top of product section
                    const productSection = document.querySelector('[data-product-image]');
                    if (productSection) {
                      productSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    // Resume auto-scroll after 10 seconds
                    setTimeout(() => setIsAutoScrolling(true), 10000);
                  }}
                  className={`text-base transition-all font-['Roboto_Mono'] cursor-pointer ${
                    currentImage === i 
                      ? 'text-white underline underline-offset-4 font-medium' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {i+1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Specification section - Always visible now */}
        <div className="mx-auto border-t border-white/10 pt-12 pb-6 w-full" style={{ maxWidth: "1440px" }}>
          <h2 style={{ fontFamily: 'DM Serif Display' }} className="text-2xl font-light mb-8 px-4 md:px-6">Specifications</h2>
          <div className="flex flex-col md:flex-row gap-12 w-full py-8 px-4 md:px-6">
            {/* Image on the left (wider) */}
            <div className="md:w-7/12">
              <div className="relative w-full pt-[100%]">
                <Image
                  src={product.specifications?.imageUrl || "/images/product/image 12.png"}
                  alt="Product specifications diagram"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="opacity-95"
                />
              </div>
            </div>
            
            {/* Specifications on the right */}
            <div className="md:w-5/12 flex flex-col justify-center">
              <h5 style={{ fontFamily: 'DM Serif Display' }} className="text-white text-2xl mb-4 capitalize">
                {product.specifications?.title}
              </h5>
              <pre style={{ fontFamily: 'Roboto Mono' }} className="text-white/90 whitespace-pre-line text-base leading-relaxed">
                {product.specifications?.content}
              </pre>
            </div>
          </div>
        </div>

        {/* FAQs section - accordion layout */}
        <div className="mx-auto border-t border-white/10 pt-20 pb-6 w-full" style={{ maxWidth: "1440px" }}>
          <h2 className="text-2xl font-light mb-8 px-4 md:px-6">FAQs</h2>
          <div className="flex flex-col-reverse md:flex-row gap-8 px-4 md:px-6">
            {/* FAQs list */}
            <div className="w-full md:w-4/12 space-y-4 pt-8 md:pt-44">
              {product.faqSection?.faqs.map((faq: any, index: number) => (
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
            {/* FAQ Image on the right (wider) on desktop, top on mobile */}
            <div className="w-full md:w-8/12">
              <div className="relative w-full pt-[100%] md:pt-[100%]">
                <Image
                  src={product.faqSection?.imageUrl || "/images/product/image (7).png"}
                  alt="Product image"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="opacity-95"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full-width image section after FAQs */}
        <div className="relative w-screen mt-16 mb-16 overflow-hidden" style={{ marginLeft: 'calc(-50vw + 50%)' }}>
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>  {/* 16:9 aspect ratio */}
            <Image
              src={product.additionalImageUrl || "/images/product/image 13.png"}
              alt="Product showcase"
              fill
              style={{ objectFit: 'cover' }}
              className="opacity-100"
              priority
            />
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 px-4 md:px-6 mx-auto w-full" style={{ maxWidth: "1440px" }}>
          <h2 className="text-2xl font-light mb-8 text-center">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {relatedProducts.map((relatedProduct) => (
              <Link 
                href={`/product/${relatedProduct.id}`} 
                key={relatedProduct.id}
                className="block group"
              >
                <div className="relative aspect-square bg-neutral-800/10 mb-3 overflow-hidden max-w-xs mx-auto">
                  <Image
                    src={relatedProduct.image}
                    alt={relatedProduct.name || "Related product"}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-light">{relatedProduct.name}</h3>
                  <p className="text-white/60 text-sm">From {relatedProduct.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Testimonial Collection */}
        <div className="mt-12">
          <TestimonialCollection />
        </div>

        {/* Blog Section - reduced spacing */}
        {/* <div className="mt-8">
          <BlogSection />
        </div> */}

        {/* Wardrobe Section - reduced spacing */}
        <div className="mt-8">
          <WardrobeSection />
        </div>
      </div>

      {/* Footer with specific width constraints and padding */}
      <div className="w-full px-4 md:px-6">
        <div className="mx-auto" style={{ maxWidth: "1440px" }}>
          <Footer />
        </div>
      </div>
    </div>
  )
} 