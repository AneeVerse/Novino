import Image from "next/image"
import Link from "next/link"

const blogs = [
  {
    id: 1,
    title: "Botanical Haven",
    description: "Discover the perfect collection of botanical art to bring nature's elegance to your home.",
    image: "/images/notebook-white.png",
  },
  {
    id: 2,
    title: "Silver Wall",
    description: "Our monochromatic collection brings a touch of sophistication to any space.",
    image: "/images/notebook-black.png",
  },
  {
    id: 3,
    title: "Cosmic Paradise",
    description: "Otherworldly patterns that transport you to cosmic realms with every glance.",
    image: "/images/notebook-white.png",
  },
  {
    id: 4,
    title: "Gold Lava",
    description: "Molten perfection of bold lines and flowing patterns in our exclusive collection.",
    image: "/images/notebook-black.png",
  },
]

export default function BlogSection() {
  return (
    <div className="mb-16">
      <h2 className="text-center text-white text-2xl md:text-3xl font-light mb-2">Blogs</h2>
      <p className="text-center text-gray-400 text-sm mb-8">Find all the creativity you will need here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="group">
            <div className="relative aspect-[4/3] mb-4 overflow-hidden">
              <Image
                src={blog.image || "/placeholder.svg"}
                alt={blog.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="text-white text-lg mb-2">{blog.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{blog.description}</p>
            <Link
              href={`/blog/${blog.id}`}
              className="inline-block border border-white text-white px-4 py-1 text-sm hover:bg-white hover:text-black transition-colors"
            >
              VIEW DETAILS
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

