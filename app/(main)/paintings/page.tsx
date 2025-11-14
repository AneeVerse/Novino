"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import VideoSection from "@/components/video-section"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import TestimonialCollection from "@/components/testimonial-collection"
import Footer from "@/components/footer"
import ProductGrid from "@/components/product-grid"
import Preloader from "@/components/ui/preloader"
import { useArtefactCatalog } from "@/hooks/useArtefactCatalog"

export default function PaintingsPage() {
  
  const {
    paintingProducts,
    paintingCategoryOptions,
    loading
  } = useArtefactCatalog()
  const categories =
    paintingCategoryOptions.length > 0 ? paintingCategoryOptions : ["All Paintings"];
  
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
            hideCategoryFilters={true}
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