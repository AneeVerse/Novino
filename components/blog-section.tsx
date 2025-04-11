import Image from "next/image"

const blogs = [
  {
    id: 1,
    title: "Diamond's Haven",
    description: "Mesmerising jewellery collection that encapsulates the essence of timeless elegance & sophistication",
    image: "/images/blog/Rectangle 13.png",
  },
  {
    id: 2,
    title: "Silver Wolf",
    description: "Enchanting jewellery collection that echoes the untamed spirit of the wild",
    image: "/images/blog/Rectangle 12.png",
  },
  {
    id: 3,
    title: "Couple Paradise",
    description: "Captivating jewellery collection that celebrates the eternal bond of love",
    image: "/images/blog/Rectangle 15.png",
  },
  {
    id: 4,
    title: "Gold Lava",
    description: "Radiant jewellery collection that captures the essence of molten gold",
    image: "/images/blog/Rectangle 14.png",
  },
]

export default function BlogSection() {
  return (
    <div className="w-full bg-[#333333] py-10 sm:py-16 md:py-20">
      <div className="mx-4 md:mx-8 max-w-full">
        {/* Header - Making sure it matches Figma design */}
        <div className="text-center mb-10 sm:mb-16 md:mb-20 relative z-50">
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-light mb-2 sm:mb-4 font-['Italiana'] relative z-50">Blogs</h2>
          <p className="text-white text-sm sm:text-base opacity-90">Find all the jewellery you will need here.</p>
        </div>

        {/* Main Container */}
        <div className="mx-auto">
          {/* First Row */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-12 sm:mb-16 md:mb-20">
            {/* Left Item */}
            <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
              {/* Image with decorative border */}
              <div className="relative mb-4 sm:mb-0">
                <div className="border border-[#A47E3B] w-full sm:w-[240px] h-[160px] sm:h-[200px] relative overflow-hidden z-10">
                  <img 
                    src="/images/blog/Rectangle 13.png" 
                    alt="Diamond's Haven" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative box behind image */}
                <div className="absolute -top-2 -right-2 border border-[#E8B08A] w-full sm:w-[240px] h-[160px] sm:h-[200px] z-0"></div>
              </div>
              <div className="min-w-0 relative z-10 text-center sm:text-left">
                <h3 className="text-white font-['Italiana'] font-normal text-2xl sm:text-[28px] md:text-[32px] leading-tight mb-2 sm:mb-3">Diamond's Haven</h3>
                <p className="text-neutral-200 text-xs sm:text-sm mb-4">Mesmerising jewellery collection that encapsulates the essence of timeless elegance & sophistication</p>
                <a 
                  href="#" 
                  className="inline-flex flex-row justify-center items-center px-4 py-3 sm:p-5 gap-2.5 w-[120px] sm:w-[140px] h-[45px] sm:h-[55px] bg-[#FFF4E9] text-black text-xs sm:text-sm font-medium"
                  style={{ borderRadius: '0px 20px', whiteSpace: 'nowrap' }}
                >
                  VIEW DETAILS
                </a>
              </div>
            </div>

            {/* Right Item */}
            <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
              {/* Image with decorative border */}
              <div className="relative mb-4 sm:mb-0">
                <div className="border border-[#A47E3B] w-full sm:w-[240px] h-[160px] sm:h-[200px] relative overflow-hidden z-10">
                  <img 
                    src="/images/blog/Rectangle 12.png" 
                    alt="Silver Wolf" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative box behind image */}
                <div className="absolute -top-2 -right-2 border border-[#E8B08A] w-full sm:w-[240px] h-[160px] sm:h-[200px] z-0"></div>
              </div>
              <div className="min-w-0 relative z-10 text-center sm:text-left">
                <h3 className="text-white font-['Italiana'] font-normal text-2xl sm:text-[28px] md:text-[32px] leading-tight mb-2 sm:mb-3">Silver Wolf</h3>
                <p className="text-neutral-200 text-xs sm:text-sm mb-4">Enchanting jewellery collection that echoes the untamed spirit of the wild</p>
                <a 
                  href="#" 
                  className="inline-flex flex-row justify-center items-center px-4 py-3 sm:p-5 gap-2.5 w-[120px] sm:w-[140px] h-[45px] sm:h-[55px] bg-[#FFF4E9] text-black text-xs sm:text-sm font-medium"
                  style={{ borderRadius: '0px 20px', whiteSpace: 'nowrap' }}
                >
                  VIEW DETAILS
                </a>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            {/* Left Item */}
            <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
              {/* On mobile, show image first, then text */}
              <div className="relative order-1 sm:order-2 mb-4 sm:mb-0 sm:ml-auto">
                <div className="border border-[#A47E3B] w-full sm:w-[240px] h-[160px] sm:h-[200px] relative overflow-hidden z-10">
                  <img 
                    src="/images/blog/Rectangle 15.png" 
                    alt="Couple Paradise" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative box behind image */}
                <div className="absolute -top-2 -right-2 border border-[#E8B08A] w-full sm:w-[240px] h-[160px] sm:h-[200px] z-0"></div>
              </div>
              <div className="min-w-0 relative z-10 text-center sm:text-right order-2 sm:order-1">
                <h3 className="text-white font-['Italiana'] font-normal text-2xl sm:text-[28px] md:text-[32px] leading-tight mb-2 sm:mb-3">Couple Paradise</h3>
                <p className="text-neutral-200 text-xs sm:text-sm mb-4">Captivating jewellery collection that celebrates the eternal bond of love</p>
                <a 
                  href="#" 
                  className="inline-flex flex-row justify-center items-center px-4 py-3 sm:p-5 gap-2.5 w-[120px] sm:w-[140px] h-[45px] sm:h-[55px] bg-[#FFF4E9] text-black text-xs sm:text-sm font-medium"
                  style={{ borderRadius: '0px 20px', whiteSpace: 'nowrap' }}
                >
                  VIEW DETAILS
                </a>
              </div>
            </div>

            {/* Right Item */}
            <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
              {/* On mobile, show image first, then text */}
              <div className="relative order-1 sm:order-2 mb-4 sm:mb-0 sm:ml-auto">
                <div className="border border-[#A47E3B] w-full sm:w-[240px] h-[160px] sm:h-[200px] relative overflow-hidden z-10">
                  <img 
                    src="/images/blog/Rectangle 14.png" 
                    alt="Gold Lava" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative box behind image */}
                <div className="absolute -top-2 -right-2 border border-[#E8B08A] w-full sm:w-[240px] h-[160px] sm:h-[200px] z-0"></div>
              </div>
              <div className="min-w-0 relative z-10 text-center sm:text-right order-2 sm:order-1">
                <h3 className="text-white font-['Italiana'] font-normal text-2xl sm:text-[28px] md:text-[32px] leading-tight mb-2 sm:mb-3">Gold Lava</h3>
                <p className="text-neutral-200 text-xs sm:text-sm mb-4">Radiant jewellery collection that captures the essence of molten gold</p>
                <a 
                  href="#" 
                  className="inline-flex flex-row justify-center items-center px-4 py-3 sm:p-5 gap-2.5 w-[120px] sm:w-[140px] h-[45px] sm:h-[55px] bg-[#FFF4E9] text-black text-xs sm:text-sm font-medium"
                  style={{ borderRadius: '0px 20px', whiteSpace: 'nowrap' }}
                >
                  VIEW DETAILS
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

