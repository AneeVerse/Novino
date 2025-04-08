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
    <div className="w-full bg-[#2D2D2D] py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-white text-5xl font-light mb-4">Blogs</h2>
          <p className="text-white/80 text-base">Find all the jewellery you will need here.</p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16 max-w-6xl mx-auto">
          {blogs.map((blog, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={blog.id} className="relative flex flex-col md:flex-row gap-8 md:gap-12">
                {/* Image */}
                <div className={`relative w-[200px] h-[200px] border border-white/20 flex-shrink-0 ${
                  isEven ? 'md:order-1' : 'md:order-2'
                }`}>
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className={`flex-1 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                  <h3 className="text-white text-2xl font-light mb-4">{blog.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-xs">{blog.description}</p>
                  <button className="bg-[#F5F5F5] text-black px-8 py-2.5 text-sm hover:bg-white transition-colors">
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

