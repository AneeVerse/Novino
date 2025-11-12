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
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { useCart } from '@/contexts/CartContext'
import Preloader from "@/components/ui/preloader"
import { SITE_URL, generateProductSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import SchemaInjector from "@/components/seo/SchemaInjector"

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
  const searchParams = useSearchParams()
  const [product, setProduct] = useState<ProductWithDescription | undefined>(undefined)
  const [categoryName, setCategoryName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'api' | 'fallback'>('fallback')
  
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [hoveredVariant, setHoveredVariant] = useState<any>(null); // For preview on hover
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Reset current image when variant changes
  useEffect(() => {
    setCurrentImage(0);
  }, [selectedVariant]);

  // Auto-select variant from URL query parameter
  useEffect(() => {
    const variantId = searchParams.get('variant');
    console.log('Variant selection effect - variantId from URL:', variantId);
    
    if (!product || !product.variants) {
      console.log('Product or variants not loaded yet');
      return;
    }
    
    if (variantId && Array.isArray(product.variants)) {
      const foundVariant = product.variants.find((v: any) => v.id === variantId);
      if (foundVariant) {
        if (foundVariant.id !== selectedVariant?.id) {
          console.log('Auto-selecting variant from URL:', foundVariant.name, 'ID:', foundVariant.id);
          setSelectedVariant(foundVariant);
        }
      } else {
        console.log('Variant not found with ID:', variantId, 'Available variants:', product.variants.map((v: any) => v.id));
      }
    } else if (!variantId && selectedVariant) {
      // No variant in URL but one is selected - reset to default
      console.log('No variant in URL, resetting to default');
      setSelectedVariant(null);
    }
  }, [searchParams, product]);

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
            // Check if product has a slug and we're currently using an ID in the URL
            // If so, redirect to the slug URL for better SEO
            if (data.slug && (safeProductId === data._id?.toString() || safeProductId === data.id?.toString() || /^[0-9a-fA-F]{24}$/.test(safeProductId))) {
              // We're using an ID but product has a slug - redirect to slug URL
              // Preserve the variant query parameter if present
              const variantParam = searchParams.get('variant');
              const redirectUrl = variantParam 
                ? `/product/${data.slug}?variant=${variantParam}`
                : `/product/${data.slug}`;
              console.log('Redirecting to slug URL:', redirectUrl);
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
              slug: data.slug
            };
            
            console.log('Using API data for product display:', formattedProduct);
            console.log('Product images:', formattedProduct.images);
            setProduct(formattedProduct);
            // Lookup category name
            try {
              const catsRes = await fetch('/api/categories');
              if (catsRes.ok) {
                const cats = await catsRes.json();
                // Convert both to strings for comparison
                const catItem = cats.find((cat: any) => {
                  const catId = (cat._id || cat.id)?.toString();
                  const productCatId = formattedProduct.category?.toString();
                  return catId === productCatId;
                });
                setCategoryName(catItem?.name || formattedProduct.category);
                console.log('Category found:', catItem?.name, 'for ID:', formattedProduct.category);
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
          // Don't reset selectedVariant here - let the URL parameter effect handle it
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
        // Don't reset selectedVariant here - let the URL parameter effect handle it
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

  // State for dynamic related products
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  
  // Fetch related products from the same category
  useEffect(() => {
    async function fetchRelatedProducts() {
      if (!product) return;
      
      try {
        // Fetch all products with variants expanded and categories
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products?includeVariants=true'),
          fetch('/api/categories')
        ]);
        
        if (productsRes.ok && categoriesRes.ok) {
          const allProducts = await productsRes.json();
          const categories = await categoriesRes.json();
          
          // Create a map of category IDs to names
          const categoryMap: {[key: string]: string} = {};
          categories.forEach((cat: any) => {
            const catId = (cat._id || cat.id)?.toString();
            if (catId) {
              categoryMap[catId] = cat.name;
            }
          });
          
          // Filter products: prioritize same category, fallback to same type
          const productCategoryId = product.category?.toString();
          
          // Helper function to check if a product is different from current product
          const isDifferentProduct = (p: any) => {
            // For variants, check against parent product ID
            if (p.isVariant && p.parentProductId) {
              const productId = product.id?.toString();
              const productMongoId = product._id?.toString();
              const productSlug = product.slug;
              const parentId = p.parentProductId?.toString();
              
              // If variant's parent matches current product, exclude it
              if (parentId === productId || parentId === productMongoId || parentId === productSlug) {
                return false;
              }
            }
            
            // Compare all possible ID formats
            const pId = p.id?.toString();
            const pMongoId = p._id?.toString();
            const pSlug = p.slug;
            
            const productId = product.id?.toString();
            const productMongoId = product._id?.toString();
            const productSlug = product.slug;
            
            // If any ID matches, it's the same product
            if (pId && productId && pId === productId) return false;
            if (pMongoId && productMongoId && pMongoId === productMongoId) return false;
            if (pSlug && productSlug && pSlug === productSlug) return false;
            if (pId && productMongoId && pId === productMongoId) return false;
            if (pMongoId && productId && pMongoId === productId) return false;
            
            return true;
          };
          
          // First, get same category products (including variants)
          const sameCategoryProducts = allProducts.filter((p: any) => {
            const pCategoryId = p.category?.toString();
            // For variants, check if parent product category matches
            // Variants inherit category from parent product
            return pCategoryId === productCategoryId && isDifferentProduct(p);
          });
          
          // If we don't have enough, add same type products
          let related = [...sameCategoryProducts];
          if (related.length < 3) {
            const sameTypeProducts = allProducts.filter((p: any) => {
              const notAlreadyIncluded = !related.some(r => {
                // Check if product is already included (handle both regular and variant IDs)
                const rId = r._id?.toString() || r.id?.toString();
                const pId = p._id?.toString() || p.id?.toString();
                const rSlug = r.slug;
                const pSlug = p.slug;
                
                return (rId && pId && rId === pId) || 
                       (rSlug && pSlug && rSlug === pSlug) ||
                       (r.isVariant && p.isVariant && r.variantId === p.variantId);
              });
              return p.type === product.type && isDifferentProduct(p) && notAlreadyIncluded;
            });
            related = [...related, ...sameTypeProducts];
          }
          
          // Map category IDs to names and limit to 3
          const relatedWithNames = related.slice(0, 3).map((p: any) => ({
            ...p,
            categoryName: categoryMap[p.category?.toString()] || p.category || 'Product'
          }));
          
          console.log('Related products found:', relatedWithNames.length, 'for category:', productCategoryId);
          setRelatedProducts(relatedWithNames);
        } else {
          // Fallback to static data if API fails
          const fallback = paintingProductData
            .filter(p => p.id !== product.id && p.category === product.category)
            .slice(0, 3);
          setRelatedProducts(fallback);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
        // Fallback to static data
        const fallback = paintingProductData
          .filter(p => p.id !== product.id)
          .slice(0, 3);
        setRelatedProducts(fallback);
      }
    }
    
    fetchRelatedProducts();
  }, [product])

  // Handle variant selection and update URL
  const handleVariantSelect = (variant: any | null) => {
    setSelectedVariant(variant);
    
    // Update URL with variant parameter using replace to avoid navigation
    const currentPath = window.location.pathname;
    if (variant) {
      router.replace(`${currentPath}?variant=${variant.id}`, { scroll: false });
    } else {
      router.replace(currentPath, { scroll: false });
    }
  };

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

  // Show loading while fetching or if product is not yet loaded
  if (isLoading || !product) {
    return <Preloader ariaLabel="Loading Product" />
  }

  // Use either the image array or fallback to a single image
  const productImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : "/images/painting/2.1.png")
  // Use either price or basePrice, whichever is available
  const productPrice = product.price || product.basePrice || "$0"
  
  // Handle the product images array
  const productImages = product.images || [productImage];
  const totalImages = productImages.length;
  
  // Get the current image to display based on the current index
  // Use hoveredVariant for preview, otherwise use selectedVariant
  // Priority: hovered/selected variant images[currentImage] > variant imageUrl > product images[currentImage]
  const activeVariant = hoveredVariant || selectedVariant;
  
  // Derive displayed values based on active variant (hovered or selected)
  const displayedVariant = activeVariant;
  const displayedPrice = displayedVariant?.price || productPrice;
  const variantImages = activeVariant?.images && activeVariant.images.length > 0 
    ? activeVariant.images 
    : null;
  
  const displayedImage = variantImages 
    ? (currentImage < variantImages.length ? variantImages[currentImage] : variantImages[0])
    : activeVariant?.imageUrl 
      ? activeVariant.imageUrl
      : (currentImage < productImages.length ? productImages[currentImage] : productImage);

  // Get ALL variants (not filtered by type)
  const allVariants = Array.isArray(product?.variants) ? product.variants : [];

  // Generate breadcrumbs
  const productUrl = product.slug || product.id?.toString() || productId?.toString() || '';
  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: categoryName || 'Products', url: `${SITE_URL}/${product.type === 'artefact' ? 'artefacts' : 'paintings'}` },
    { name: product.name || 'Product', url: `${SITE_URL}/product/${productUrl}` },
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
    slug: product.slug || productUrl,
    id: product.id?.toString() || productUrl,
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
    <div className="bg-[#2D2D2D] text-white min-h-screen">
      {/* SEO Schema - Injected into head for Google crawler */}
      {schemas.length > 0 && <SchemaInjector schemas={schemas} />}
      
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
          <div className="relative z-10 px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left column - Product title and description */}
              <div className="lg:col-span-3 flex flex-col justify-start py-8 pr-4 lg:pr-8">
                <div className="uppercase text-xs text-white/50 mb-3 tracking-wider font-['Roboto_Mono']">
                  {categoryName}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-3xl font-light mb-8 tracking-wide font-['Roboto_Mono']" style={{ lineHeight: '1.2' }}>
                  {activeVariant ? activeVariant.name?.toUpperCase() : product.name?.toUpperCase()}
                </h1>
                
                <div className="text-white/70 leading-relaxed text-sm sm:text-base lg:text-base font-['Roboto_Mono']">
                  <p className="whitespace-pre-line">{product.description}</p>
                </div>
              </div>

              {/* Right section - Product Image and Purchase Details */}
              <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-7 gap-6 lg:gap-8">
                {/* Product Image Gallery - Main image with thumbnails */}
                <div 
                  className="md:col-span-4 md:col-start-1 flex flex-col gap-4 order-1 md:order-1 md:ml-12" 
                  data-product-image
                >
                  {/* Main Product Image */}
                  <div 
                    className="relative w-full h-[360px] sm:h-[440px] lg:h-[500px] overflow-hidden select-none bg-black/20 rounded-sm group cursor-pointer"
                  onMouseEnter={() => setIsAutoScrolling(false)}
                  onMouseLeave={() => setIsAutoScrolling(true)}
                >
                    <Image
                      src={displayedImage}
                      alt={product.name || "Product Image"}
                      fill
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                      priority
                      className="pointer-events-none transition-all duration-700 ease-out group-hover:scale-105"
                      draggable={false}
                    />
                    
                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-500 pointer-events-none" />
                  </div>

                  {/* Thumbnail Gallery - show variant images if variant active, otherwise product images */}
                  {(() => {
                    const imagesToShow = activeVariant?.images && activeVariant.images.length > 0 
                      ? activeVariant.images 
                      : productImages;
                    
                    return imagesToShow.length > 1 ? (
                      <div className="flex gap-2 justify-center flex-wrap">
                        {imagesToShow.map((imageUrl, i) => (
                          <button
                            key={i}
                            onMouseEnter={() => {
                              setCurrentImage(i);
                              setIsAutoScrolling(false);
                            }}
                            onClick={() => {
                              setCurrentImage(i);
                              setIsAutoScrolling(false);
                              setTimeout(() => setIsAutoScrolling(true), 10000);
                            }}
                            className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-2 transition-all duration-300 rounded-sm ${
                              currentImage === i 
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
                    ) : null;
                  })()}
                </div>

                {/* Price and cart actions */}
                <div className="md:col-span-3 md:col-start-5 flex flex-col justify-start order-2 md:order-2 py-8 pl-4 lg:pl-8">
                  {/* Variant Options - Show ALL variants + main product */}
                  {allVariants.length > 0 && (
                    <div className="flex flex-col gap-3 mb-8" onMouseLeave={() => setHoveredVariant(null)}>
                      <div className="text-xs text-white/40 uppercase tracking-widest font-['Roboto_Mono']">Select Variant</div>
                      
                      <div className="flex gap-2 flex-wrap">
                        {/* Main Product as Default Option */}
                        <button
                          onClick={() => handleVariantSelect(null)}
                          onMouseEnter={() => setHoveredVariant(null)}
                          onMouseLeave={() => setHoveredVariant(null)}
                          className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-2 transition-all duration-300 rounded-sm group ${
                            !selectedVariant
                              ? 'border-white shadow-lg shadow-white/20' 
                              : 'border-white/20 hover:border-white/50 opacity-70 hover:opacity-100'
                          }`}
                          title={product.name}
                        >
                          <Image
                            src={productImages[0]}
                            alt={product.name || "Default"}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="pointer-events-none"
                            draggable={false}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          <div className="absolute bottom-1 left-1 right-1 text-[8px] text-white/90 truncate uppercase font-['Roboto_Mono'] opacity-0 group-hover:opacity-100 transition-opacity">
                            Default
                          </div>
                        </button>
                        
                        {/* All Variants */}
                        {allVariants.map((variant: any) => (
                          <button
                            key={variant.id}
                            onMouseEnter={() => setHoveredVariant(variant)}
                            onMouseLeave={() => setHoveredVariant(null)}
                            onClick={() => handleVariantSelect(variant)}
                            className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-2 transition-all duration-300 rounded-sm group ${
                              selectedVariant?.id === variant.id
                                ? 'border-white shadow-lg shadow-white/20' 
                                : 'border-white/20 hover:border-white/50 opacity-70 hover:opacity-100'
                            }`}
                            title={variant.name}
                          >
                            <Image
                              src={variant.images?.[0] || variant.imageUrl || productImages[0]}
                              alt={variant.name}
                              fill
                              style={{ objectFit: 'cover' }}
                              className="pointer-events-none"
                              draggable={false}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="absolute bottom-1 left-1 right-1 text-[8px] text-white/90 truncate uppercase font-['Roboto_Mono'] opacity-0 group-hover:opacity-100 transition-opacity">
                              {variant.name}
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {/* Display selected variant info */}
                      {selectedVariant && (
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="text-sm text-white font-['Roboto_Mono']">
                            {selectedVariant.name}
                          </div>
                          {selectedVariant.type && (
                            <div className="text-xs text-white/60 font-['Roboto_Mono']">
                              Type: {selectedVariant.type}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-3xl font-light mb-2 font-['Roboto_Mono']">Rs {displayedPrice}</div>
                  <div className="text-xs text-white/40 mb-6 font-['Roboto_Mono']">Inc. Tax • Lead time 6-8 weeks</div>
                  
                  {/* Quantity and Add to Cart */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center border border-white/20 rounded-sm overflow-hidden backdrop-blur-sm">
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
                      className="flex-1 bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 py-3 px-6 uppercase tracking-widest text-xs font-medium transition-all duration-300 rounded-sm transform hover:scale-[1.02] active:scale-[0.98] font-['Roboto_Mono']"
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
        </div>

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
            <h2 className="text-2xl font-light mb-8 px-4 md:px-6">FAQs</h2>
            <div className="flex flex-col-reverse md:flex-row gap-8 px-4 md:px-6">
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
          <div className="relative w-screen mt-16 mb-16 overflow-hidden" style={{ marginLeft: 'calc(-50vw + 50%)' }}>
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-16 mx-auto w-full" style={{ maxWidth: "1440px" }}>
            <div className="px-4 md:px-6">
              <h2 className="text-2xl sm:text-3xl font-light mb-8 text-center font-['Roboto_Mono'] tracking-wider">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {relatedProducts.map((relatedProduct) => {
                  const productImage = relatedProduct.images?.[0] || relatedProduct.image || '/images/placeholder.png';
                  const productPrice = relatedProduct.basePrice || relatedProduct.price || 'Price on request';
                  const productName = relatedProduct.name || 'Untitled';
                  
                  // Use parent product ID for variants, otherwise use the product's own ID
                  // For variants, add the variantId as a query parameter to auto-select it
                  const productLink = relatedProduct.isVariant && relatedProduct.parentProductId 
                    ? `/product/${relatedProduct.parentProductSlug || relatedProduct.parentProductId}?variant=${relatedProduct.variantId}`
                    : `/product/${relatedProduct.slug || relatedProduct._id || relatedProduct.id}`;
                  
                  return (
                    <Link 
                      href={productLink} 
                      key={relatedProduct._id || relatedProduct.id}
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
                            {relatedProduct.categoryName || relatedProduct.type || 'Product'}
                          </div>
                          <h3 className="text-lg text-white font-medium tracking-wide group-hover:text-[#E5C29F] transition-colors font-['Roboto_Mono']">
                            {productName}
                          </h3>
                          <p className="text-sm text-white/60 font-['Roboto_Mono']">
                            Rs {productPrice}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Testimonial Collection */}
        <div className="mt-12 mb-16 mx-auto w-full" style={{ maxWidth: "1440px" }}>
          <div className="px-4 md:px-6">
            <TestimonialCollection />
          </div>
        </div>

        {/* Blog Section - reduced spacing */}
        {/* <div className="mt-8">
          <BlogSection />
        </div> */}

        {/* Wardrobe Section - reduced spacing */}
        <div className="mt-8 mb-16 mx-auto w-full" style={{ maxWidth: "1440px" }}>
          <div className="px-4 md:px-6">
            <WardrobeSection />
          </div>
        </div>
      </div>
      <div className="mt-12 mb-16 mx-auto w-full" style={{ maxWidth: "1440px" }}>
          <div className="px-4 md:px-6">
            <Footer />
          </div>
        </div>
      
        
    </div>
  )
} 
