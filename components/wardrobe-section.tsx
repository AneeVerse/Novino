import Image from "next/image"
import Link from "next/link"

export default function WardrobeSection() {
  return (
    <div className="relative max-w-[1440px] mx-auto mb-16 overflow-hidden rounded-3xl border border-white/10">
      {/* Full background image */}
      <div className="relative w-full h-[420px] sm:h-[380px] md:h-[300px] overflow-hidden">
        <div className="absolute inset-0 wardrobe-image-wrapper">
          <Image
            src="/images/wardrobe/b1 (1).png"
            alt="Wardrobe background"
            fill
            className="object-cover wardrobe-bg-image"
            style={{
              objectPosition: 'left center',
              transform: 'scale(1)',
            }}
            priority
          />
        </div>

        {/* Refined dark gradient overlay - smoother transition */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 via-40% to-transparent z-0 pointer-events-none" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 md:p-8 z-10">
          <div className="max-w-xl flex flex-col items-start gap-6 md:gap-8">

            {/* Text Content */}
            <div className="space-y-4">
              <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-medium leading-tight drop-shadow-lg font-dm-serif-display">
                Art Born From Nature
              </h2>
              <p className="text-zinc-200 text-sm sm:text-base md:text-lg leading-relaxed drop-shadow-md font-light tracking-wide">
                Every piece starts with observation. A butterfly's wing. The sun's layers. Flowers that exist only in imagination. This work reflects the patterns, cycles, and uniqueness found in the natural world.
              </p>
            </div>
          </div>

          {/* Button - Positioned absolutely to center on the design circle */}
        <div className="mt-8 md:mt-0 flex-shrink-0 md:absolute md:right-24 md:top-[58%] md:-translate-y-1/2">
            <Link
              href="/artefacts"
              className="group bg-black/95 text-white px-6 py-3.5 rounded-full hover:bg-zinc-800 transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-sm font-medium tracking-wide shadow-lg hover:shadow-xl hover:scale-105 border border-white/10"
            >
              Explore the Journey
              <span className="inline-block transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">↗</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Responsive image positioning styles */}
      {/* Adjust --mobile-offset and --desktop-offset values to move image left (negative) or right (positive) */}
      <style dangerouslySetInnerHTML={{__html: `
        .wardrobe-image-wrapper {
          --mobile-offset: 0px; /* Adjust this: negative = left, positive = right */
          --desktop-offset: 0px; /* Adjust this: negative = left, positive = right */
          transform: translateX(var(--mobile-offset));
        }
        
        .wardrobe-bg-image {
          object-position: left center !important;
        }
        
        @media (min-width: 768px) {
          .wardrobe-image-wrapper {
            transform: translateX(var(--desktop-offset));
          }
          .wardrobe-bg-image {
            object-position: right center !important;
          }
        }
      `}} />
    </div>
  )
}
