import Image from "next/image"
import { Twitter } from "lucide-react"

export default function TestimonialCollection() {
  return (
    <div className="p-8 md:p-12 relative overflow-hidden">
      {/* Main container with dashed border - matched to Figma */}
      <div className="relative p-8 flex flex-col items-start" style={{ 
        boxSizing: 'border-box',
        border: '2px dashed #FFFFFF',
        borderRadius: '20px',
        borderSpacing: '8px',
      }}>
        {/* Corner accents using the provided images */}
        <div className="absolute bottom-0 left-0 w-12 h-12">
          <Image 
            src="/images/Abstract Design (1).png" 
            alt="Corner design" 
            width={40} 
            height={40} 
            className="object-contain"
          />
        </div>
        <div className="absolute bottom-0 right-0 w-12 h-12">
          <Image 
            src="/images/Abstract Design.png" 
            alt="Corner design" 
            width={40} 
            height={40} 
            className="object-contain"
          />
        </div>

        {/* Abstract design in top right */}
        <div className="absolute top-0 right-0 w-64 h-64">
          <Image src="/images/abstract-design.png" alt="Abstract design" width={300} height={300} className="object-contain" />
        </div>

        {/* Header section */}
        <div className="max-w-2xl mb-12">
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">THE STYLELOOM TESTIMONIAL COLLECTION.</h1>
          <p className="text-gray-300">At StyleLoom, our customers are the heartbeat of our brand.</p>
        </div>

        {/* Testimonials grid with dashed borders - corrected to match Figma */}
        <div className="grid grid-cols-1 md:grid-cols-3 w-full">
          {/* Testimonial 1 */}
          <div className="p-6" style={{ 
            borderTop: '2px dashed #FFFFFF',
            borderRight: '2px dashed #FFFFFF',
            borderLeft: 'none',
            borderBottom: 'none'
          }}>
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <Image src="/images/testimonals/sarah-thompson.png" alt="Sarah Thompson" width={70} height={70} className="rounded-full" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Sarah Thompson</h3>
                <p className="text-gray-300 text-sm">New York, USA</p>
              </div>
              <div className="ml-auto">
                <Twitter className="text-gray-300 h-5 w-5" />
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

            <p className="text-white">
              StyleLoom exceeded my expectations. The gown&apos;s quality and design made me feel like a queen. Fast
              shipping, too!
            </p>
          </div>

          {/* Testimonial 2 */}
          <div className="p-6" style={{ 
            borderTop: '2px dashed #FFFFFF',
            borderRight: '2px dashed #FFFFFF',
            borderLeft: 'none',
            borderBottom: 'none'
          }}>
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <Image src="/images/testimonals/rajesh-patel.png" alt="Rajesh Patel" width={70} height={70} className="rounded-full" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Rajesh Patel</h3>
                <p className="text-gray-300 text-sm">Mumbai, India</p>
              </div>
              <div className="ml-auto">
                <Twitter className="text-gray-300 h-5 w-5" />
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

            <p className="text-white">
              Absolutely love the style and warmth of the jacket. A perfect blend of fashion and functionality!
            </p>
          </div>

          {/* Testimonial 3 */}
          <div className="p-6" style={{ 
            borderTop: '2px dashed #FFFFFF',
            borderRight: 'none',
            borderLeft: 'none',
            borderBottom: 'none'
          }}>
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <Image src="/images/testimonals/emily-walker.png" alt="Emily Walker" width={70} height={70} className="rounded-full" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Emily Walker</h3>
                <p className="text-gray-300 text-sm">London, UK</p>
              </div>
              <div className="ml-auto">
                <Twitter className="text-gray-300 h-5 w-5" />
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

            <p className="text-white">
              Adorable and comfortable! My daughter loves her new outfit. Thank you, StyleLoom, for dressing our little
              fashionista.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

