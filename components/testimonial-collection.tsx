import Image from "next/image"

export default function TestimonialCollection() {
  return (
    <div className="mx-4 md:mx-8 mb-16 relative overflow-hidden">
      {/* Main container with dashed border - matched to Figma */}
      <div className="relative p-4 sm:p-8 flex flex-col items-start" style={{ 
        boxSizing: 'border-box',
        border: '2px dashed #FFFFFF',
        borderRadius: '20px',
        borderSpacing: '8px',
      }}>
        {/* Corner accents using the provided images */}
        <div className="absolute bottom-0 left-0 w-8 sm:w-12 h-8 sm:h-12">
          <Image 
            src="/images/Abstract Design (1).png" 
            alt="Corner design" 
            width={40} 
            height={40} 
            className="object-contain"
          />
        </div>
        <div className="absolute bottom-0 right-0 w-8 sm:w-12 h-8 sm:h-12">
          <Image 
            src="/images/Abstract Design.png" 
            alt="Corner design" 
            width={40} 
            height={40} 
            className="object-contain"
          />
        </div>

        {/* Abstract design in top right */}
        <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64">
          <Image src="/images/abstract-design.png" alt="Abstract design" width={300} height={300} className="object-contain" />
        </div>

        {/* Header section */}
        <div className="max-w-2xl mb-6 sm:mb-12 relative z-10">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">THE STYLELOOM TESTIMONIAL COLLECTION.</h1>
          <p className="text-gray-300 text-sm sm:text-base">At StyleLoom, our customers are the heartbeat of our brand.</p>
        </div>

        {/* Testimonials grid with dashed borders - corrected to match Figma */}
        <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4 sm:gap-6 md:gap-0">
          {/* Testimonial 1 */}
          <div className="p-4 sm:p-6 border-2 border-dashed border-white md:border-t-2 md:border-r-0 md:border-l-0 md:border-b-0 rounded-lg md:rounded-none" style={{ 
            borderRight: 'none',
            borderLeft: 'none',
            borderBottom: 'none',
          }}>
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <Image src="/images/testimonals/sarah-thompson.png" alt="Sarah Thompson" width={50} height={50} className="rounded-full w-10 h-10 sm:w-[50px] sm:h-[50px]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">Sarah Thompson</h3>
                <p className="text-gray-300 text-xs sm:text-sm">New York, USA</p>
              </div>
              <div className="ml-auto">
                <Image src="/images/Capa 2.png" alt="Twitter" width={16} height={16} className="object-contain w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="flex text-yellow-400 mb-3 sm:mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>

            <p className="text-white text-sm sm:text-base">
              StyleLoom exceeded my expectations. The gown&apos;s quality and design made me feel like a queen. Fast
              shipping, too!
            </p>
          </div>

          {/* Testimonial 2 - Now visible on mobile */}
          <div className="p-4 sm:p-6 border-2 border-dashed border-white md:border-t-2 md:border-r-1 md:border-l-1 md:border-b-0 rounded-lg md:rounded-none max-md:border-r-0 max-md:border-l-0" style={{ 
            borderTop: '2px dashed #FFFFFF',
            borderBottom: 'none'
          }}>
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <Image src="/images/testimonals/rajesh-patel.png" alt="Rajesh Patel" width={50} height={50} className="rounded-full w-10 h-10 sm:w-[50px] sm:h-[50px]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">Rajesh Patel</h3>
                <p className="text-gray-300 text-xs sm:text-sm">Mumbai, India</p>
              </div>
              <div className="ml-auto">
                <Image src="/images/Capa 2.png" alt="Twitter" width={16} height={16} className="object-contain w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="flex text-yellow-400 mb-3 sm:mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>

            <p className="text-white text-sm sm:text-base">
              Absolutely love the style and warmth of the jacket. A perfect blend of fashion and functionality!
            </p>
          </div>

          {/* Testimonial 3 - Now visible on mobile */}
          <div className="p-4 sm:p-6 border-2 border-dashed border-white md:border-t-2 md:border-r-0 md:border-l-0 md:border-b-0 rounded-lg md:rounded-none max-md:border-r-0 max-md:border-l-0" style={{ 
            borderTop: '2px dashed #FFFFFF',
            borderRight: 'none',
            borderBottom: 'none'
          }}>
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <Image src="/images/testimonals/emily-walker.png" alt="Emily Walker" width={50} height={50} className="rounded-full w-10 h-10 sm:w-[50px] sm:h-[50px]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">Emily Walker</h3>
                <p className="text-gray-300 text-xs sm:text-sm">London, UK</p>
              </div>
              <div className="ml-auto">
                <Image src="/images/Capa 2.png" alt="Twitter" width={16} height={16} className="object-contain w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="flex text-yellow-400 mb-3 sm:mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>

            <p className="text-white text-sm sm:text-base">
              Adorable and comfortable! My daughter loves her new outfit. Thank you, StyleLoom, for dressing our little
              fashionista.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

