import Image from "next/image"
import { Play } from "lucide-react"

export default function VideoSection() {
  return (
    <div className="relative mb-16">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image src="/images/gallery-grid.png" alt="Video thumbnail" fill className="object-cover" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-white bg-opacity-80 rounded-full p-4 hover:bg-opacity-100 transition-all transform hover:scale-110">
            <Play size={24} className="text-black" />
          </button>
        </div>
      </div>
    </div>
  )
}

