"use client"

import { lazy, Suspense } from "react"
import Preloader from "@/components/ui/preloader"
import { useArtefactCatalog } from "@/hooks/useArtefactCatalog"

// Eager imports
import ProductGrid from "@/components/product-grid"
import FeaturedProducts from "@/components/featured-products"

// Lazy load below-fold components
const VideoSection = lazy(() => import("@/components/video-section"))
const TestimonialCollection = lazy(() => import("@/components/testimonial-collection"))
const WardrobeSection = lazy(() => import("@/components/wardrobe-section"))
const Footer = lazy(() => import("@/components/footer"))

export default function ArtefactsPage() {

  const {
    artefactProducts,
    artefactCategoryOptions,
    loading
  } = useArtefactCatalog()
  const categories =
    artefactCategoryOptions.length > 0 ? artefactCategoryOptions : ["All Products"];

  if (loading) {
    return <Preloader ariaLabel="Loading Products" />;
  }

  return (
    <main className="relative min-h-screen bg-[#2D2D2D] pt-[80px]">
      {/* Product Grid Section - Full width */}
      <section className="relative z-10">
        <ProductGrid
          key={`artefact-grid-${artefactProducts.length}`}
          title="Bring the Patterns Home"
          subtitle="Choose the design that speaks to you."
          products={artefactProducts}
          categories={categories}
          viewAllText="See All Products"
          showViewAllButton={false}
          showOnePerCategoryInAll={false}
          maxAllProducts={0}
          mobileGridLayout={true}
        />
      </section>

      {/* Clear separation from the hero section with negative margin to prevent overlap */}
      <div className="container mx-auto px-2 md:px-0 mt-4 z-50 relative" style={{ clear: 'both' }}>
        {/* DISCOVER EXTRAORDINARY ARTIFACTS Section */}


        {/* Gallery Grid - with negative margins to make it wider */}
        {/* <div className="mb-16 mt-20 relative" style={{ position: 'relative', zIndex: 30 }}>
          <FeaturedProducts
            initialProducts={artefactProducts}
            title="Featured Products"
          />
        </div> */}
      </div>

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