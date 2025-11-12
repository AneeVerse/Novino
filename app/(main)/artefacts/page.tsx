"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import VideoSection from "@/components/video-section"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import TestimonialCollection from "@/components/testimonial-collection"
import Footer from "@/components/footer"
import MasonryGallery from "@/components/masonry-gallery"
import ProductGrid from "@/components/product-grid"
import { useState, useEffect } from "react"
import Preloader from "@/components/ui/preloader"
import FeaturedProducts from "@/components/featured-products"

export default function ArtefactsPage() {
  
  // State for categories and artefact products
  const [categories, setCategories] = useState<string[]>(["All Artefacts"]);
  const [categoryMap, setCategoryMap] = useState<{[key: string]: string}>({});
  
  // State for dynamic artefact products
  interface SimpleProduct { 
    id: string; 
    name: string; 
    price: string; 
    image: string; 
    category: string;
    categoryId?: string;
  }
  const [artefactProducts, setArtefactProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        
        // Filter to get only artefact categories
        const artefactCategories = data
          .filter((cat: any) => cat.type === 'artefact')
          .map((cat: any) => cat.name);
          
        // Build category ID to name mapping
        const catMap: {[key: string]: string} = {};
        data.forEach((cat: any) => {
          if (cat.type === 'artefact') {
            const id = cat._id || cat.id;
            if (id) catMap[id] = cat.name;
          }
        });
        setCategoryMap(catMap);
        
        // Always add "All Artefacts" as the first option
        setCategories(["All Artefacts", ...artefactCategories]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to default categories
        setCategories(["All Artefacts", "Egyptian", "Asian", "European", "American"]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch artefact products from API
  useEffect(() => {
    async function fetchArtefacts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products?includeVariants=true');
        if (!res.ok) throw new Error('Failed to fetch artefacts');
        const data = await res.json();
        const filtered = data
          .filter((p: any) => p.type === 'artefact')
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
        setArtefactProducts(filtered);
      } catch (err) {
        console.error('Error fetching artefact products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchArtefacts();
  }, [categoryMap]); // Add categoryMap as dependency to update products when categories load
  
  if (loading) {
    return <Preloader ariaLabel="Loading Artefacts" />;
  }
  
  return (
    <main className="relative min-h-screen bg-[#2D2D2D] pt-[80px]">
      {/* Product Grid Section - Full width */}
      <section className="relative z-10">
          <ProductGrid 
            key="artefact-product-grid"
            title="Ancient Civilizations" 
            subtitle="Featured Collection" 
            products={artefactProducts}
            categories={categories}
            viewAllText="View all artefacts"
            showViewAllButton={false}
          />
      </section>

      {/* Clear separation from the hero section with negative margin to prevent overlap */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 mt-4 z-50 relative" style={{ marginTop: '2rem', clear: 'both' }}>
        {/* DISCOVER EXTRAORDINARY ARTIFACTS Section */}
        <div className="mb-16 relative" style={{ position: 'relative', zIndex: 30 }}>
          <div className="max-w-[2400px] mx-auto">
            <div className="mb-8 sm:mb-16 p-6 rounded" style={{ position: 'relative', zIndex: 30 }}>
              <h2 className="text-white text-[24px] sm:text-[28px] md:text-[38px] font-medium uppercase leading-[1.171875em] mb-4 sm:mb-8 text-center font-['Roboto_Mono']">DISCOVER EXTRAORDINARY ARTIFACTS WITH HISTORICAL SIGNIFICANCE</h2>
              <p className="text-white text-sm sm:text-base leading-normal text-center mx-auto max-w-3xl font-['Roboto_Mono']">Explore our curated collection of rare artifacts with cultural and historical importance from civilizations around the world.</p>
            </div>
          </div>
        </div>

        {/* Gallery Grid - with negative margins to make it wider */}
        <div className="mb-16 relative">
          <FeaturedProducts />
        </div>
      </div>

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