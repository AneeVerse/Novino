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
    <div className="w-full bg-[#333333] py-20">
      <div className="mx-4 md:mx-8 max-w-full">
        {/* Header - Making sure it matches Figma design */}
        <div className="text-center mb-20 relative z-50">
          <h2 className="text-white text-5xl font-light mb-4 font-['Italiana'] relative z-50">Blogs</h2>
          <p className="text-white text-base opacity-90">Find all the jewellery you will need here.</p>
        </div>

        {/* Main Container */}
        <div className="mx-auto">
          {/* First Row */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-20">
            {/* Left Item */}
            <div className="flex-1 flex gap-6 items-start">
              {/* Image with decorative border */}
              <div className="relative">
                <div className="border border-[#A47E3B] w-[240px] h-[200px] relative overflow-hidden z-10">
                  <img 
                    src="/images/blog/Rectangle 13.png" 
                    alt="Diamond's Haven" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative box behind image */}
                <div className="absolute -top-2 -right-2 border border-[#E8B08A] w-[240px] h-[200px] z-0"></div>
              </div>
              <div className="min-w-0 relative z-10">
                <h3 className="text-white font-['Italiana'] font-normal text-[32px] leading-[38px] mb-3">Diamond's Haven</h3>
                <p className="text-neutral-200 text-sm mb-4">Mesmerising jewellery collection that encapsulates the essence of timeless elegance & sophistication</p>
                <a 
                  href="#" 
                  className="inline-flex flex-row justify-center items-center p-5 gap-2.5 w-[140px] h-[55px] bg-[#FFF4E9] text-black text-sm font-medium"
                  style={{ borderRadius: '0px 20px', whiteSpace: 'nowrap' }}
                >
                  VIEW DETAILS
                </a>
              </div>
            </div>

            {/* Right Item */}
            <div className="flex-1 flex gap-6 items-start">
              {/* Image with decorative border */}
              <div className="relative">
                <div className="border border-[#A47E3B] w-[240px] h-[200px] relative overflow-hidden z-10">
                  <img 
                    src="/images/blog/Rectangle 12.png" 
                    alt="Silver Wolf" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative box behind image */}
                <div className="absolute -top-2 -right-2 border border-[#E8B08A] w-[240px] h-[200px] z-0"></div>
              </div>
              <div className="min-w-0 relative z-10">
                <h3 className="text-white font-['Italiana'] font-normal text-[32px] leading-[38px] mb-3">Silver Wolf</h3>
                <p className="text-neutral-200 text-sm mb-4">Enchanting jewellery collection that echoes the untamed spirit of the wild</p>
                <a 
                  href="#" 
                  className="inline-flex flex-row justify-center items-center p-5 gap-2.5 w-[140px] h-[55px] bg-[#FFF4E9] text-black text-sm font-medium"
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
            <div className="flex-1 flex gap-6 items-start">
              <div className="min-w-0 relative z-10">
                <h3 className="text-white font-['Italiana'] font-normal text-[32px] leading-[38px] mb-3">Couple Paradise</h3>
                <p className="text-neutral-200 text-sm mb-4">Captivating jewellery collection that celebrates the eternal bond of love</p>
                <a 
                  href="#" 
                  className="inline-flex flex-row justify-center items-center p-5 gap-2.5 w-[140px] h-[55px] bg-[#FFF4E9] text-black text-sm font-medium"
                  style={{ borderRadius: '0px 20px', whiteSpace: 'nowrap' }}
                >
                  VIEW DETAILS
                </a>
              </div>
              {/* Image with decorative border */}
              <div className="relative">
                <div className="border border-[#A47E3B] w-[240px] h-[200px] relative overflow-hidden z-10">
                  <img 
                    src="/images/blog/Rectangle 15.png" 
                    alt="Couple Paradise" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative box behind image */}
                <div className="absolute -top-2 -right-2 border border-[#E8B08A] w-[240px] h-[200px] z-0"></div>
              </div>
            </div>

            {/* Right Item */}
            <div className="flex-1 flex gap-6 items-start">
              <div className="min-w-0 relative z-10">
                <h3 className="text-white font-['Italiana'] font-normal text-[32px] leading-[38px] mb-3">Gold Lava</h3>
                <p className="text-neutral-200 text-sm mb-4">Radiant jewellery collection that captures the essence of molten gold</p>
                <a 
                  href="#" 
                  className="inline-flex flex-row justify-center items-center p-5 gap-2.5 w-[140px] h-[55px] bg-[#FFF4E9] text-black text-sm font-medium"
                  style={{ borderRadius: '0px 20px', whiteSpace: 'nowrap' }}
                >
                  VIEW DETAILS
                </a>
              </div>
              {/* Image with decorative border */}
              <div className="relative">
                <div className="border border-[#A47E3B] w-[240px] h-[200px] relative overflow-hidden z-10">
                  <img 
                    src="/images/blog/Rectangle 14.png" 
                    alt="Gold Lava" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative box behind image */}
                <div className="absolute -top-2 -right-2 border border-[#E8B08A] w-[240px] h-[200px] z-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

