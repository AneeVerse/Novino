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
            title="Bring the Patterns Home" 
            subtitle="Choose the design that speaks to you. Each product features one of five nature-inspired patterns created through direct observation and imagination." 
            products={artefactProducts}
            categories={categories}
            viewAllText="See All Products"
            showViewAllButton={false}
            showOnePerCategoryInAll={false}
            maxAllProducts={0}
          />
      </section>

      {/* Clear separation from the hero section with negative margin to prevent overlap */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 mt-4 z-50 relative" style={{ marginTop: '2rem', clear: 'both' }}>
        {/* DISCOVER EXTRAORDINARY ARTIFACTS Section */}
      

        {/* Gallery Grid - with negative margins to make it wider */}
        <div className="mb-16 relative">
          <FeaturedProducts 
            initialProducts={artefactProducts} 
            title="Featured Products"
          />
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