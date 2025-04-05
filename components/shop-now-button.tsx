import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function ShopNowButton() {
  return (
    <Link href="/collection" className="inline-flex items-center bg-white text-black px-4 py-2 group">
      Shop Now
      <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={16} />
    </Link>
  )
}

