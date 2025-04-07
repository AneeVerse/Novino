import Image from "next/image"
import { Twitter } from "lucide-react"

interface TestimonialProps {
  name: string
  location: string
  image: string
  review: string
}

const testimonials: TestimonialProps[] = [
  {
    name: "Sarah Thompson",
    location: "New York, USA",
    image: "/images/testimonals/sarah-thompson.png",
    review: "StyleLoom exceeded my expectations. The gown's quality and design made me feel like a queen. Fast shipping, too!"
  },
  {
    name: "Rajesh Patel",
    location: "Mumbai, India",
    image: "/images/testimonals/rajesh-patel.png",
    review: "Absolutely love the style and warmth of the jacket. A perfect blend of fashion and functionality!"
  },
  {
    name: "Emily Walker",
    location: "London, UK",
    image: "/images/testimonals/emily-walker.png",
    review: "Adorable and comfortable! My daughter loves her new outfit. Thank you, StyleLoom, for dressing our little fashionista."
  }
]

export default function TestimonialSection() {
  return (
    <section className="relative w-full bg-[#1A1A1A] overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top left gradient */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-[100px] opacity-20" />
        {/* Add more gradient positions as you show them */}
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="border border-dashed border-gray-500 rounded-lg p-8 relative">
          {/* Abstract design in top right */}
          <div className="absolute top-0 right-0 w-64 h-64">
            <Image 
              src="/images/abstract-design.png" 
              alt="Abstract design" 
              width={300} 
              height={300} 
              className="object-contain" 
            />
          </div>

          {/* Header section */}
          <div className="max-w-2xl mb-12">
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
              THE STYLELOOM TESTIMONIAL COLLECTION.
            </h1>
            <p className="text-gray-400">
              At StyleLoom, our customers are the heartbeat of our brand.
            </p>
          </div>

          {/* Testimonials grid */}
          <div className="grid md:grid-cols-3 gap-0">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className={`border-t border-dashed border-gray-500 p-6 relative
                  ${index !== 2 ? 'border-r' : ''}`}
              >
                <div className="flex items-center mb-4">
                  <div className="mr-3">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={70}
                      height={70}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-400 text-sm">{testimonial.location}</p>
                  </div>
                  <div className="ml-auto">
                    <Twitter className="text-gray-400 h-5 w-5" />
                  </div>
                </div>

                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-300">{testimonial.review}</p>

                {/* Corner decorations */}
                {index === 0 && (
                  <div className="absolute bottom-4 left-4">
                    <div className="w-8 h-8 relative">
                      <div className="absolute w-8 h-0.5 bg-white rotate-45 origin-left"></div>
                      <div className="absolute w-8 h-0.5 bg-white -rotate-45 origin-left mt-6"></div>
                    </div>
                  </div>
                )}
                {index === 2 && (
                  <div className="absolute bottom-4 right-4">
                    <div className="w-8 h-8 relative">
                      <div className="absolute w-8 h-0.5 bg-white rotate-45 origin-right"></div>
                      <div className="absolute w-8 h-0.5 bg-white -rotate-45 origin-right mt-6"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 