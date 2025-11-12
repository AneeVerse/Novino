"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import VideoSection from "@/components/video-section"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import TestimonialCollection from "@/components/testimonial-collection"
import Footer from "@/components/footer"
import ProductGrid from "@/components/product-grid"
import { useState, useEffect } from "react"
import Preloader from "@/components/ui/preloader"

export default function PaintingsPage() {
  
  // State for categories and painting products
  const [categories, setCategories] = useState<string[]>([]);

  // State for dynamic painting products
  interface SimpleProduct {
    id: string;
    name: string;
    price: string;
    image: string;
    images?: string[];
    category: string;
    categoryId?: string;
  }
  const [paintingProducts, setPaintingProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch painting categories and products from new artefact-categories API
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/artefact-categories?t=' + Date.now(), {
          cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch categories');
        const categories = await res.json();
        
        console.log('📂 All categories:', categories.map((c: any) => c.name));
        
        // Get all products from categories that contain "painting" in the name (case-insensitive)
        const paintingProducts: SimpleProduct[] = [];
        const paintingCategoryNames: string[] = [];
        
        categories.forEach((category: any) => {
          // Check if category name contains "painting" (case-insensitive)
          if (category.name && category.name.toLowerCase().includes('painting')) {
            console.log('🎨 Found painting category:', category.name, '- Products:', category.products?.length || 0);
            paintingCategoryNames.push(category.name);
            
            if (category.products && Array.isArray(category.products)) {
              category.products.forEach((product: any) => {
                console.log('  ➕ Adding product:', product.name);
                paintingProducts.push({
                  id: product.id,
                  name: product.name,
                  price: product.basePrice,
                  image: product.images?.[0] || '',
                  images: product.images || [],
                  category: category.name,
                  categoryId: category.id || category._id
                });
              });
            }
          }
        });
        
        console.log('✅ Total painting products:', paintingProducts.length);
        
        // Set categories (for potential future filtering)
        setCategories(paintingCategoryNames.length > 1 ? ['All Paintings', ...paintingCategoryNames] : []);
        setPaintingProducts(paintingProducts);
      } catch (err) {
        console.error('Error fetching painting products:', err);
        setCategories([]);
        setPaintingProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaintings();
  }, []);
  
  if (loading) {
    return <Preloader ariaLabel="Loading Paintings" />;
  }
  
  return (
    <main className="relative min-h-screen bg-[#2D2D2D] pt-[80px]">
      {/* Product Grid Section - Full width */}
      <section className="relative z-10">
          <ProductGrid 
            key="painting-product-grid"
            title="Masterpiece Collection" 
            subtitle="Featured Collection" 
            products={paintingProducts}
            categories={categories}
            viewAllText="View all paintings"
            showViewAllButton={false}
          />
      </section>

      {/* Video Section - Full width */}
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[730px] bg-[#2D2D2D] mb-16 sm:mb-24 md:mb-32">
        <VideoSection />
      </div>

      {/* New container for remaining sections */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 z-10 relative">
        {/* Testimonial Collection */}
        <div className="mb-16">
          <TestimonialCollection />
        </div>

        {/* Blog Section */}
        {/* <div className="mb-16">
          <BlogSection />
        </div> */}

        {/* Wardrobe Section */}
        <div className="mb-16">
          <WardrobeSection />
        </div>

        {/* Footer Section */}
        <Footer />
      </div>
    </main>
  );
} 