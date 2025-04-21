"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react"
import paintingProductData from "@/public/data/painting-products.json"

// Artefact products data
const artefactProducts = [
  {
    id: 1,
    name: "ANCIENT VASE",
    price: "$3250",
    image: "/images/mug-black.png",
    category: "Egyptian",
    description: "This ancient Egyptian vase features intricate hieroglyphics and traditional design elements. Handcrafted using techniques passed down through generations, it represents the artistic mastery of one of history's most enduring civilizations."
  },
  {
    id: 2,
    name: "STONE STATUE",
    price: "$4980",
    image: "/images/mug-white.png",
    category: "Egyptian",
    description: "Carved from limestone quarried from the banks of the Nile, this statue embodies the regal aesthetic of ancient Egyptian art. Its proportional harmony and stylized features reflect the spiritual and cultural traditions of its origin."
  },
  {
    id: 3,
    name: "JADE FIGURINE",
    price: "$2870",
    image: "/images/cycle1.png",
    category: "Asian",
    description: "This exquisite jade figurine showcases the meticulous craftsmanship of Asian artisans. The translucent stone has been carefully carved to reveal subtle details, embodying cultural symbolism and artistic precision."
  },
  {
    id: 4,
    name: "BRONZE BELL",
    price: "$1850",
    image: "/images/cycle2.png",
    category: "Asian",
    description: "This ceremonial bronze bell features detailed relief work and a rich patina developed over decades. Its resonant tone was once used in religious ceremonies, and its design reflects the sophisticated metallurgical knowledge of ancient Asian civilizations."
  },
  {
    id: 5,
    name: "MEDIEVAL CHALICE",
    price: "$5750",
    image: "/images/notebook-white.png",
    category: "European",
    description: "This ornate medieval chalice combines silver gilt with delicate enamel work. Used in religious ceremonies throughout the Middle Ages, it represents the intersection of European craftsmanship, religious devotion, and artistic expression."
  },
  {
    id: 6,
    name: "ORNATE SHIELD",
    price: "$7820",
    image: "/images/notebook-black.png",
    category: "European",
    description: "This decorative shield combines functional design with elaborate artistry. The heraldic imagery tells the story of its noble ownership, while the metalwork demonstrates the exceptional craftsmanship of European armories."
  },
  {
    id: 9,
    name: "OFFCUT WALL SCONCE",
    price: "$670",
    image: "/images/products/wall-sconce.jpg",
    category: "Artefacts",
    description: "Offcut is a poetic balance of shape and form. Pairing remnant stone from local suppliers, with a custom designed 'teacup' globe, every iteration of Offcut is unique.\n\nThe natural stone is hand selected and intently broken in house, while the soft white glass and LED module is custom designed to create a seamless, contemporary aesthetic."
  }
];

// Combine the product types
interface ProductWithDescription {
  id: number;
  name?: string;
  price?: string;
  image: string;
  category: string;
  description?: string;
}

// Helper type for accordion content
interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id)
  
  // Attempt to find the product in painting products first
  let product: ProductWithDescription | undefined = paintingProductData.find(p => p.id === productId)
  
  // If not found in paintings, try to find in artefacts
  if (!product) {
    product = artefactProducts.find(p => p.id === productId)
  }
  
  // If still not found, use default
  if (!product) {
    product = {
      id: 1,
      name: "ABSTRACT ELEGANCE",
      price: "$2,327",
      image: "/images/painting/2.1.png",
      category: "Oil",
      description: "Abstract Elegance explores the interplay of form and color in modern composition. This oil painting features bold brushstrokes and a rich palette that creates depth and emotion, inviting the viewer to find their own meaning within its layers."
    }
  }

  const [quantity, setQuantity] = useState(1)
  const [selectedFinish, setSelectedFinish] = useState("Natural")
  const [openAccordion, setOpenAccordion] = useState<string | null>("specifications")
  const [currentImage, setCurrentImage] = useState(1)

  const finishOptions = ["Natural", "Whiskey", "Midnight"]
  const totalImages = 11

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  // Specifications section content
  const specifications: AccordionItem = {
    title: "Specifications",
    content: (
      <div className="text-white/80 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h5 className="text-white text-sm mb-1">Dimensions</h5>
            <p className="text-sm">30 × 40 cm</p>
          </div>
          <div>
            <h5 className="text-white text-sm mb-1">Medium</h5>
            <p className="text-sm">{product.category}</p>
          </div>
          <div>
            <h5 className="text-white text-sm mb-1">Created</h5>
            <p className="text-sm">2023</p>
          </div>
        </div>
        
        <div>
          <h5 className="text-white text-sm mb-1">About the {product.category === "Oil" || product.category === "Acrylic" || product.category === "Watercolor" || product.category === "Mixed Media" ? "Painting" : "Artefact"}</h5>
          <p className="text-sm leading-relaxed">{product.description}</p>
        </div>
      </div>
    )
  }

  // FAQs section content
  const faqs: AccordionItem = {
    title: "FAQs",
    content: (
      <div className="text-white/80 space-y-4">
        <div>
          <h5 className="text-white text-sm mb-1">Do you ship internationally?</h5>
          <p className="text-sm">Yes, we offer worldwide shipping with tracking and insurance for all paintings.</p>
        </div>
        <div>
          <h5 className="text-white text-sm mb-1">What is the return policy?</h5>
          <p className="text-sm">We accept returns within 14 days of delivery if the painting is in its original condition.</p>
        </div>
        <div>
          <h5 className="text-white text-sm mb-1">Do you offer framing services?</h5>
          <p className="text-sm">Yes, custom framing options are available at an additional cost. Please contact us for details.</p>
        </div>
      </div>
    )
  }

  // Related products - simplified version
  const relatedProducts = paintingProductData.filter(p => p.id !== productId).slice(0, 2)

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  return (
    <div className="bg-[#2D2D2D] text-white min-h-screen">
      <div className="container mx-auto px-4 pt-32 pb-12 max-w-7xl">
       

        {/* Main product display with container image */}
        <div className="relative mb-12">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'url("/images/product/Container (4).png")',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}></div>

          <div className="relative z-10 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Left column - Product title and description */}
              <div className="flex flex-col justify-center">
                <div className="uppercase text-xs text-white/60 mb-1">{product.category}</div>
                <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-wide">
                  {product.name?.split(' ').map(word => 
                    <span key={word} className="capitalize">{word.toLowerCase()} </span>
                  )}
                </h1>
                
                <div className="prose prose-lg prose-invert max-w-none text-white/80">
                  <p className="whitespace-pre-line text-base">{product.description}</p>
                </div>
              </div>

              {/* Middle column - Product Image */}
              <div className="flex items-center justify-center">
                <div className="relative w-full aspect-square">
                  {/* Ellipse overlay */}
                  <div className="absolute inset-0 -z-10 overflow-hidden" 
                    style={{
                      backgroundImage: 'url("/images/product/Ellipse 11.png")',
                      backgroundSize: '120% 120%',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      width: '200%',
                      height: '200%',
                      top: '-45%',
                      left: '-50%',
                      opacity: 0.8,
                      mixBlendMode: 'screen'
                    }}>
                  </div>
                  <Image
                    src={product.image}
                    alt={product.name || "Product Image"}
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                  />
                </div>
              </div>

              {/* Right column - Price and cart actions */}
              <div className="flex flex-col justify-center">
                <div className="text-2xl font-light mb-4">{product.price} <span className="text-xs text-white/60 ml-1">inc Tax</span></div>
                
                {/* Finish options */}
                <div className="mb-6">
                  <h3 className="uppercase text-xs text-white/60 mb-2">Frame</h3>
                  <div className="flex flex-wrap gap-2">
                    {finishOptions.map((finish) => (
                      <button 
                        key={finish}
                        onClick={() => setSelectedFinish(finish)}
                        className={`px-4 py-2 text-xs border ${
                          selectedFinish === finish 
                            ? 'border-white text-white' 
                            : 'border-white/30 text-white/70 hover:border-white/50'
                        }`}
                      >
                        {finish}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-white/60 mb-4">Lead time 6-8 weeks</div>
                
                <div className="flex items-center gap-2 mb-6">
                  <button 
                    onClick={decreaseQuantity}
                    className="w-8 h-8 flex items-center justify-center border border-white/20 hover:bg-white/5 transition"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button 
                    onClick={increaseQuantity}
                    className="w-8 h-8 flex items-center justify-center border border-white/20 hover:bg-white/5 transition"
                  >
                    +
                  </button>
                  
                  <button className="ml-4 flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 uppercase tracking-widest text-sm transition">
                    Add to Cart
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-white/10">
                  <span className="text-white/60 text-xs">Are you a specifier?</span>
                  <Link href="/login" className="uppercase tracking-wider text-white/70 hover:text-white transition text-xs">
                    LOGIN TO TRADE PORTAL
                  </Link>
                </div>
              </div>
            </div>

            {/* Image pagination */}
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalImages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentImage(i+1)}
                  className={`w-6 h-6 flex items-center justify-center text-xs ${currentImage === i+1 ? 'text-white' : 'text-white/50'}`}
                >
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Accordion sections */}
        <div className="max-w-3xl mx-auto border-t border-white/10">
          {/* Specifications section */}
          <div className="border-b border-white/10">
            <button 
              onClick={() => toggleAccordion("specifications")}
              className="w-full py-4 flex justify-between items-center text-left"
            >
              <h2 className="text-xl font-light">{specifications.title}</h2>
              {openAccordion === "specifications" ? (
                <ChevronUp className="w-5 h-5 text-white/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/60" />
              )}
            </button>
            <div className={`overflow-hidden transition-all ${openAccordion === "specifications" ? "max-h-[1000px] pb-6" : "max-h-0"}`}>
              {specifications.content}
            </div>
          </div>

          {/* FAQs section */}
          <div className="border-b border-white/10">
            <button 
              onClick={() => toggleAccordion("faqs")}
              className="w-full py-4 flex justify-between items-center text-left"
            >
              <h2 className="text-xl font-light">{faqs.title}</h2>
              {openAccordion === "faqs" ? (
                <ChevronUp className="w-5 h-5 text-white/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/60" />
              )}
            </button>
            <div className={`overflow-hidden transition-all ${openAccordion === "faqs" ? "max-h-[500px] pb-6" : "max-h-0"}`}>
              {faqs.content}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-2xl font-light mb-8 text-center">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedProducts.map((relatedProduct) => (
              <Link 
                href={`/product/${relatedProduct.id}`} 
                key={relatedProduct.id}
                className="block group"
              >
                <div className="relative aspect-square bg-neutral-800/10 mb-4 overflow-hidden">
                  <Image
                    src={relatedProduct.image}
                    alt={relatedProduct.name || "Related product"}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="transition-transform group-hover:scale-105"
                  />
                </div>
                <h3 className="text-lg font-light">{relatedProduct.name}</h3>
                <p className="text-white/60 text-sm">From {relatedProduct.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 