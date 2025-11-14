"use client"

import VideoSection from "@/components/video-section"
import BlogSection from "@/components/blog-section"
import WardrobeSection from "@/components/wardrobe-section"
import TestimonialCollection from "@/components/testimonial-collection"
import Footer from "@/components/footer"
import ProductGrid from "@/components/product-grid"
import Preloader from "@/components/ui/preloader"
import { useArtefactCatalog } from "@/hooks/useArtefactCatalog"
import FeaturedProducts from "@/components/featured-products"

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
            title="Our Collection" 
            subtitle="Featured Products" 
            products={artefactProducts}
            categories={categories}
            viewAllText="View all products"
            showViewAllButton={false}
            showOnePerCategoryInAll={false}
            maxAllProducts={0}
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
          <FeaturedProducts initialProducts={artefactProducts} />
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