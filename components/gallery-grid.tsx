import Image from "next/image"
import Link from "next/link"

export default function GalleryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Link key={i} href={`/art/${i + 1}`} className="group">
          <div className="border-2 border-black bg-white p-2 transition-transform group-hover:scale-[1.02]">
            <div className="relative aspect-[3/4]">
              <Image
                src="/placeholder.svg?height=400&width=300"
                alt={`Art piece ${i + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h3 className="mt-2 text-white text-sm">Abstract Art #{i + 1}</h3>
        </Link>
      ))}
    </div>
  )
}

