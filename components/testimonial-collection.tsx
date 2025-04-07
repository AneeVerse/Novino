import Image from "next/image"
import { Twitter } from "lucide-react"

export default function TestimonialCollection() {
  return (
    <div className="bg-gradient-to-b from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] p-8 md:p-12 relative overflow-hidden">
      <div className="border border-dashed border-gray-500 rounded-lg p-8 relative">
        {/* Abstract design in top right */}
        <div className="absolute top-0 right-0 w-64 h-64">
          <Image src="/images/abstract-design.png" alt="Abstract design" width={300} height={300} className="object-contain" />
        </div>

        {/* Header section */}
        <div className="max-w-2xl mb-12">
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">THE STYLELOOM TESTIMONIAL COLLECTION.</h1>
          <p className="text-gray-400">At StyleLoom, our customers are the heartbeat of our brand.</p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-0">
          {/* Testimonial 1 */}
          <div className="border-r border-t border-dashed border-gray-500 p-6 relative">
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <Image src="/images/testimonals/sarah-thompson.png" alt="Sarah Thompson" width={70} height={70} className="rounded-full" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Sarah Thompson</h3>
                <p className="text-gray-400 text-sm">New York, USA</p>
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

            <p className="text-gray-300">
              StyleLoom exceeded my expectations. The gown&apos;s quality and design made me feel like a queen. Fast
              shipping, too!
            </p>

            {/* Bottom corner decoration */}
            <div className="absolute bottom-4 left-4">
              <div className="w-8 h-8 relative">
                <div className="absolute w-8 h-0.5 bg-white rotate-45 origin-left"></div>
                <div className="absolute w-8 h-0.5 bg-white -rotate-45 origin-left mt-6"></div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="border-r border-t border-dashed border-gray-500 p-6">
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <Image src="/images/testimonals/rajesh-patel.png" alt="Rajesh Patel" width={70} height={70} className="rounded-full" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Rajesh Patel</h3>
                <p className="text-gray-400 text-sm">Mumbai, India</p>
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

            <p className="text-gray-300">
              Absolutely love the style and warmth of the jacket. A perfect blend of fashion and functionality!
            </p>
          </div>

          {/* Testimonial 3 */}
          <div className="border-t border-dashed border-gray-500 p-6 relative">
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <Image src="/images/testimonals/emily-walker.png" alt="Emily Walker" width={70} height={70} className="rounded-full" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Emily Walker</h3>
                <p className="text-gray-400 text-sm">London, UK</p>
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

            <p className="text-gray-300">
              Adorable and comfortable! My daughter loves her new outfit. Thank you, StyleLoom, for dressing our little
              fashionista.
            </p>

            {/* Bottom corner decoration */}
            <div className="absolute bottom-4 right-4">
              <div className="w-8 h-8 relative">
                <div className="absolute w-8 h-0.5 bg-white rotate-45 origin-right"></div>
                <div className="absolute w-8 h-0.5 bg-white -rotate-45 origin-right mt-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

