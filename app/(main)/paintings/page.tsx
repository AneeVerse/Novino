"use client"

import { lazy, Suspense } from "react"
import Preloader from "@/components/ui/preloader"
import { useArtefactCatalog } from "@/hooks/useArtefactCatalog"

// Eager imports
import ProductGrid from "@/components/product-grid"

// Lazy load below-fold components
const VideoSection = lazy(() => import("@/components/video-section"))
const TestimonialCollection = lazy(() => import("@/components/testimonial-collection"))
const WardrobeSection = lazy(() => import("@/components/wardrobe-section"))
const Footer = lazy(() => import("@/components/footer"))

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
          title="Five Designs, Five Stories"
          subtitle="Each painting explores a different aspect of nature and life -- from the unique journey of butterflies to the infinite layers of the sun. These are reflections of what exists around us and within us."
          products={paintingProducts}
          categories={categories}
          viewAllText="View all paintings"
          showViewAllButton={false}
          hideCategoryFilters={true}
        />
      </section>

      {/* Video Section - Full width */}
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[730px] bg-[#2D2D2D] mb-16 sm:mb-24 md:mb-32">
        <Suspense fallback={<div className="w-full h-full bg-[#2D2D2D]" />}>
          <VideoSection />
        </Suspense>
      </div>

      {/* New container for remaining sections */}
      <div className="container mx-auto px-2 sm:px-6 md:px-8 z-10 relative">
        {/* Testimonial Collection - Temporarily hidden */}
        {/* <div className="mb-16">
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <TestimonialCollection />
          </Suspense>
        </div> */}

        {/* Blog Section */}
        {/* <div className="mb-16">
          <BlogSection />
        </div> */}

        {/* Wardrobe Section */}
        <div className="mb-16">
          <Suspense fallback={<div className="min-h-[200px]" />}>
            <WardrobeSection />
          </Suspense>
        </div>

        {/* Footer Section */}
        <Suspense fallback={<div className="min-h-[300px]" />}>
          <Footer />
        </Suspense>
      </div>
    </main>
  );
} 