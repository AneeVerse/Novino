import Image from "next/image"

const blogs = [
  {
    id: 1,
    title: "Diamond's Haven",
    description: "Mesmerising jewellery collection that encapsulates the essence of timeless elegance & sophistication",
    image: "/images/blog/Screenshot from 2025-04-08 15-32-04.png",
  },
  {
    id: 2,
    title: "Silver Wolf",
    description: "Enchanting jewellery collection that echoes the untamed spirit of the wild",
    image: "/images/blog/Screenshot from 2025-04-08 15-32-18.png",
  },
  {
    id: 3,
    title: "Couple Paradise",
    description: "Captivating jewellery collection that celebrates the eternal bond of love",
    image: "/images/blog/Screenshot from 2025-04-08 15-32-31.png",
  },
  {
    id: 4,
    title: "Gold Lava",
    description: "Radiant jewellery collection that captures the essence of molten gold",
    image: "/images/blog/Screenshot from 2025-04-08 15-32-42.png",
  },
]

export default function BlogSection() {
  return (
    <div className="w-full bg-[#333333] py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header - Making sure it matches Figma design */}
        <div className="text-center mb-20 relative z-50">
          <h2 className="text-white text-5xl font-light mb-4 font-serif relative z-50">Blogs</h2>
          <p className="text-white text-base opacity-90">Find all the jewellery you will need here.</p>
        </div>

        {/* Main Container */}
        <div className="max-w-6xl mx-auto">
          {/* First Row */}
          <div className="flex flex-col md:flex-row gap-16 mb-20">
            {/* Left Item */}
            <div className="flex-1 flex gap-6 items-start">
              <div className="border border-white/80 min-w-[150px] max-w-[150px] h-[150px] relative overflow-hidden">
                <img 
                  src="/images/blog/Screenshot from 2025-04-08 15-32-04.png" 
                  alt="Diamond's Haven" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 relative z-10">
                <h3 className="text-white text-2xl font-light mb-3">Diamond's Haven</h3>
                <p className="text-neutral-200 text-sm mb-4">Mesmerising jewellery collection that encapsulates the essence of timeless elegance & sophistication</p>
                <a href="#" className="inline-block bg-[#F5F5F5] hover:bg-white text-black px-6 py-2 text-sm font-medium transition-colors">
                  VIEW DETAILS
                </a>
              </div>
            </div>

            {/* Right Item */}
            <div className="flex-1 flex gap-6 items-start">
              <div className="border border-white/80 min-w-[150px] max-w-[150px] h-[150px] relative overflow-hidden">
                <img 
                  src="/images/blog/Screenshot from 2025-04-08 15-32-18.png" 
                  alt="Silver Wolf" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 relative z-10">
                <h3 className="text-white text-2xl font-light mb-3">Silver Wolf</h3>
                <p className="text-neutral-200 text-sm mb-4">Enchanting jewellery collection that echoes the untamed spirit of the wild</p>
                <a href="#" className="inline-block bg-[#F5F5F5] hover:bg-white text-black px-6 py-2 text-sm font-medium transition-colors">
                  VIEW DETAILS
                </a>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="flex flex-col md:flex-row gap-16">
            {/* Left Item */}
            <div className="flex-1 flex gap-6 items-start">
              <div className="min-w-0 relative z-10">
                <h3 className="text-white text-2xl font-light mb-3">Couple Paradise</h3>
                <p className="text-neutral-200 text-sm mb-4">Captivating jewellery collection that celebrates the eternal bond of love</p>
                <a href="#" className="inline-block bg-[#F5F5F5] hover:bg-white text-black px-6 py-2 text-sm font-medium transition-colors">
                  VIEW DETAILS
                </a>
              </div>
              <div className="border border-white/80 min-w-[150px] max-w-[150px] h-[150px] relative overflow-hidden">
                <img 
                  src="/images/blog/Screenshot from 2025-04-08 15-32-31.png" 
                  alt="Couple Paradise" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Item */}
            <div className="flex-1 flex gap-6 items-start">
              <div className="min-w-0 relative z-10">
                <h3 className="text-white text-2xl font-light mb-3">Gold Lava</h3>
                <p className="text-neutral-200 text-sm mb-4">Radiant jewellery collection that captures the essence of molten gold</p>
                <a href="#" className="inline-block bg-[#F5F5F5] hover:bg-white text-black px-6 py-2 text-sm font-medium transition-colors">
                  VIEW DETAILS
                </a>
              </div>
              <div className="border border-white/80 min-w-[150px] max-w-[150px] h-[150px] relative overflow-hidden">
                <img 
                  src="/images/blog/Screenshot from 2025-04-08 15-32-42.png" 
                  alt="Gold Lava" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

