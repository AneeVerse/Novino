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
  const [categoryMap, setCategoryMap] = useState<{[key: string]: string}>({});

  // State for dynamic painting products
  interface SimpleProduct {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
    categoryId?: string;
  }
  const [paintingProducts, setPaintingProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        
        // Filter to get only painting categories
        // Build category ID to name mapping
        const catMap: {[key: string]: string} = {};
        data.forEach((cat: any) => {
          if (cat.type === 'painting') {
            const id = cat._id || cat.id;
            if (id) catMap[id] = cat.name;
          }
        });
        setCategoryMap(catMap);
        
        // Don't show any category filters
        setCategories([]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Don't show any category filters
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);
  
  // Fetch painting products from API
  useEffect(() => {
    async function fetchPaintings() {
      try {
        setLoading(true);
        const res = await fetch('/api/products?includeVariants=true');
        if (!res.ok) throw new Error('Failed to fetch paintings');
        const data = await res.json();
        const filtered = data
          .filter((p: any) => p.type === 'painting')
          .map((p: any) => ({
            id: p.id || p._id,
            name: p.name,
            price: p.basePrice || p.price,
            image: p.images?.[0] || p.image,
            images: p.images || (p.image ? [p.image] : []),
            category: categoryMap[p.category] || p.category, // Use name from map if available
            categoryId: p.category, // Store the category ID/reference
            isVariant: p.isVariant || false,
            variantId: p.variantId,
            variantName: p.variantName,
            variantType: p.variantType,
            parentProductId: p.parentProductId || p.id
          }));
        setPaintingProducts(filtered);
      } catch (err) {
        console.error('Error fetching painting products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPaintings();
  }, [categoryMap]); // Add categoryMap as dependency to update products when categories load
  
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