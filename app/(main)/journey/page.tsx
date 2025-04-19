"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Footer from "@/components/footer"
import { useState, useEffect, useRef } from "react"

export default function JourneyPage() {
  const [activeTab, setActiveTab] = useState(1);
  const [showText, setShowText] = useState(false);

  // Initial load - delay text appearance
  useEffect(() => {
    // Delay showing text on initial load
    const timer = setTimeout(() => {
      setShowText(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <main className="relative min-h-screen bg-[#2D2D2D] overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative w-full h-[350px]">
                <Image
          src="/images/journey/journey-hero.webp"
          alt="Novino journey"
                  fill
                  className="object-cover"
          priority
                />

        {/* JOURNEY text overlay */}
        <div className="absolute inset-0 z-20 overflow-hidden" style={{ height: '350px', maxHeight: '350px' }}>
          {/* Semi-transparent light effect behind text */}
          <div 
            className="absolute w-full text-center" 
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, 44%)',
              height: '150px',
              background: '#E8B08A',
              filter: 'blur(60px)',
              opacity: 0.4,
              width: '50%',
              zIndex: -1,
              bottom: 'auto'
            }}
          ></div>
          <h1 
            className={`text-[#312F30] text-[80px] md:text-[120px] lg:text-[160px] font-dm-serif-display leading-none absolute w-full text-center ${showText ? 'animate-rise-up' : 'invisible opacity-0'}`}
            style={{ fontFamily: 'DM Serif Display, serif', top: '40%', left: '50%', transform: 'translate(-50%, 0%)' }}
          >
            JOURNEY
          </h1>
        </div>
      </div>

      {/* Mission Statement Section */}
      <div className="w-full py-16 md:py-24 bg-[#2D2D2D]">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-[1000px] mx-auto text-center">
            <h2 className="text-white text-[32px] md:text-[40px] lg:text-[48px] font-dm-serif-display mb-8"
                style={{ fontFamily: 'DM Serif Display, serif' }}>
              WE CREATE EXCEPTIONAL PIECES THAT DEFINE ARTISTIC SPACES.
            </h2>
            <p className="text-white/90 text-lg leading-relaxed mb-8 font-['Roboto_Mono']">
              At Novino.io we create some of the most innovative and beautiful art available internationally. 
              Our products are entirely designed in house with a focus on premium quality, 
              innovation and timelessness and we are proud to have been recognised with many of 
              the highest design accolades available.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="w-full py-16 bg-[#232323]">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div>
              <h3 className="text-white text-2xl md:text-3xl font-semibold mb-6 font-['Roboto_Mono']">Artistic Innovation.</h3>
              <p className="text-white/80 leading-relaxed font-['Roboto_Mono']">
                Our collections follow a distinctive aesthetic, with each new range we ensure 
                that we push ourselves to create artworks that are new and innovative yet familiar. 
                We find the balance between something new, but also complementary to our existing 
                collections. This means our customers can use different ranges throughout a project 
                that sync together harmoniously.
              </p>
            </div>
            <div>
              <h3 className="text-white text-2xl md:text-3xl font-semibold mb-6 font-['Roboto_Mono']">Materials are paramount.</h3>
              <p className="text-white/80 leading-relaxed font-['Roboto_Mono']">
                We engage process led design, this means we consider the latest artistic techniques 
                and procedures and work this into a new aesthetic from the inside out. We design 
                without constraint and make products from the finest materials available. We have 
                the freedom to create without restriction and we believe that a well made product, 
                crafted from the best materials is paramount to our success.
              </p>
            </div>
            <div>
              <h3 className="text-white text-2xl md:text-3xl font-semibold mb-6 font-['Roboto_Mono']">Design details.</h3>
              <p className="text-white/80 leading-relaxed font-['Roboto_Mono']">
                We are so proud of what we create that we stamp our products with our maker's trademark, 
                our Novino signature. This identifies our distinctive quality of craftsmanship over any 
                others in the market. We fuss over the smallest details, this is paramount to our design 
                approach. We believe design should be seamless. From opening the packaging and holding 
                one of our artworks you can instantly feel the quality of the materials and exceptional 
                craftsmanship.
              </p>
            </div>
            <div>
              <h3 className="text-white text-2xl md:text-3xl font-semibold mb-6 font-['Roboto_Mono']">Global Reach.</h3>
              <p className="text-white/80 leading-relaxed font-['Roboto_Mono']">
                Novino.io is strategically partnered with several international boutique artisans offering 
                world leading artistic principles and exceptional quality. Our pieces are made to the same 
                exacting standards that one would come to expect from any of the finest design houses globally. 
                With several international distribution points and tailored international logistics, Novino.io 
                products are made to be sent throughout the globe.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Tabs Section */}
      <div className="w-full py-16 md:py-20 bg-[#2D2D2D]">
        <div className="container mx-auto px-6 md:px-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center mb-12 gap-4">
            <button 
              className={`px-6 py-3 border ${activeTab === 1 ? 'bg-[#E8B08A] text-black border-[#E8B08A]' : 'border-white/30 text-white'} rounded-md font-['Roboto_Mono'] transition-colors`}
              onClick={() => setActiveTab(1)}
            >
              RESIDENTIAL
            </button>
            <button 
              className={`px-6 py-3 border ${activeTab === 2 ? 'bg-[#E8B08A] text-black border-[#E8B08A]' : 'border-white/30 text-white'} rounded-md font-['Roboto_Mono'] transition-colors`}
              onClick={() => setActiveTab(2)}
            >
              COMMERCIAL & GALLERIES
            </button>
            <button 
              className={`px-6 py-3 border ${activeTab === 3 ? 'bg-[#E8B08A] text-black border-[#E8B08A]' : 'border-white/30 text-white'} rounded-md font-['Roboto_Mono'] transition-colors`}
              onClick={() => setActiveTab(3)}
            >
              COMMISSIONS & CONSULTING
            </button>
        </div>

          {/* Tab Content */}
          <div className="max-w-[1000px] mx-auto">
            {/* Tab 1 */}
            <div className={`${activeTab === 1 ? 'block' : 'hidden'}`}>
              <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                <div className="md:w-1/2 mb-6 md:mb-0">
                  <div className="relative h-[350px] md:h-[450px] w-full">
                    <Image 
                      src="/images/mug-black.png"
                      alt="Residential Art"
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-white text-3xl md:text-4xl font-light mb-6 font-['DM_Serif_Display']">RESIDENTIAL</h3>
                  <p className="text-white/80 leading-relaxed mb-6 font-['Roboto_Mono']">
                    We take careful consideration to envisage the homes and people of whom our art will be enjoyed. 
                    With every piece we design, we aim to create a unique feature that becomes a talking point in the home.
                  </p>
                  <p className="text-white/80 leading-relaxed font-['Roboto_Mono']">
                    We strive to create heirloom pieces with a timeless feel, to suit virtually any interior.
                    Our residential art collections blend form and function to create stunning focal points
                    for homes around the world.
                  </p>
                </div>
              </div>
        </div>

            {/* Tab 2 */}
            <div className={`${activeTab === 2 ? 'block' : 'hidden'}`}>
              <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                <div className="md:w-1/2 mb-6 md:mb-0">
                  <div className="relative h-[350px] md:h-[450px] w-full">
                    <Image 
                      src="/images/mug-white.png"
                      alt="Commercial Art"
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-white text-3xl md:text-4xl font-light mb-6 font-['DM_Serif_Display']">COMMERCIAL & GALLERIES</h3>
                  <p className="text-white/80 leading-relaxed mb-6 font-['Roboto_Mono']">
                    Over the past decade, our art has featured in galleries, restaurants, hotels and offices across the globe. 
                    The robust quality of our solid design construction, ensures a long lasting product and the timeless style
                    along with natural materials complement the interior of any space.
                  </p>
                  <p className="text-white/80 leading-relaxed font-['Roboto_Mono']">
                    For large commercial projects we can adapt our designs and pricing structure accordingly. 
                    We work directly with architects and designers to achieve the perfect solution, specific to the project.
                  </p>
                </div>
              </div>
        </div>

            {/* Tab 3 */}
            <div className={`${activeTab === 3 ? 'block' : 'hidden'}`}>
              <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                <div className="md:w-1/2 mb-6 md:mb-0">
                  <div className="relative h-[350px] md:h-[450px] w-full">
                    <Image 
                      src="/images/notebook-black.png"
                      alt="Art Commissions"
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-white text-3xl md:text-4xl font-light mb-6 font-['DM_Serif_Display']">COMMISSIONS & CONSULTING</h3>
                  <p className="text-white/80 leading-relaxed mb-6 font-['Roboto_Mono']">
                    We're an innovative design studio, with a niche team of artists specialising in various mediums,
                    with a unique and modern aesthetic. Art is our forte, but we are equally as passionate about bringing
                    design ideas to life for others too.
                  </p>
                  <p className="text-white/80 leading-relaxed font-['Roboto_Mono']">
                    With a wealth of knowledge in artistic techniques and construction methods, combined with
                    creative partners across the globe, we offer design concepts, modelling, prototyping and
                    manufacturing to clients worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Projects Section */}
      <div className="w-full py-16 md:py-24 bg-[#232323]">
        <div className="container mx-auto px-6 md:px-8">
          <h2 className="text-white text-4xl md:text-5xl font-light text-center mb-16 font-['DM_Serif_Display']">Featured Projects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Project 1 */}
            <div className="bg-[#2D2D2D] overflow-hidden">
              <div className="relative h-[280px]">
                <Image 
                  src="/images/cycle1.png"
                  alt="Gallery Installation"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-white text-xl md:text-2xl font-light mb-2 font-['DM_Serif_Display']">Lumière Gallery</h3>
                <p className="text-white/70 mb-4 text-sm font-['Roboto_Mono']">Residential · New York</p>
                <p className="text-white/80 text-sm mb-4 font-['Roboto_Mono']">A stunning contemporary art installation in a renovated historical building.</p>
                <Link href="#" className="inline-flex items-center text-[#E8B08A] hover:underline font-['Roboto_Mono']">
                  View Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Project 2 */}
            <div className="bg-[#2D2D2D] overflow-hidden">
              <div className="relative h-[280px]">
                <Image 
                  src="/images/cycle2.png"
                  alt="Modern Art Collection"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-white text-xl md:text-2xl font-light mb-2 font-['DM_Serif_Display']">Alpine Retreat</h3>
                <p className="text-white/70 mb-4 text-sm font-['Roboto_Mono']">Residential · Switzerland</p>
                <p className="text-white/80 text-sm mb-4 font-['Roboto_Mono']">A raw and unapologetic alpine landscape informs this hillside home art collection.</p>
                <Link href="#" className="inline-flex items-center text-[#E8B08A] hover:underline font-['Roboto_Mono']">
                  View Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
      </div>

            {/* Project 3 */}
            <div className="bg-[#2D2D2D] overflow-hidden">
              <div className="relative h-[280px]">
                <Image 
                  src="/images/notebook-white.png"
                  alt="Hotel Art Installation"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-white text-xl md:text-2xl font-light mb-2 font-['DM_Serif_Display']">Cascade Hotel</h3>
                <p className="text-white/70 mb-4 text-sm font-['Roboto_Mono']">Commercial · Tokyo</p>
                <p className="text-white/80 text-sm mb-4 font-['Roboto_Mono']">A custom installation based on our signature collection for a stunning 6m high lobby.</p>
                <Link href="#" className="inline-flex items-center text-[#E8B08A] hover:underline font-['Roboto_Mono']">
                  View Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="w-full py-16 md:py-24 bg-[#2D2D2D]">
        <div className="container mx-auto px-6 md:px-8">
          <h2 className="text-white text-4xl md:text-5xl font-light text-center mb-16 font-['DM_Serif_Display']">Meet the Visionaries</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="relative w-[220px] h-[220px] mx-auto mb-6 overflow-hidden rounded-full border-4 border-[#E8B08A]">
                <Image 
                  src="/images/mug-black.png"
                  alt="Alexandra Chen"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-white text-xl font-medium mb-1 font-['DM_Serif_Display']">ALEXANDRA CHEN</h3>
              <p className="text-[#E8B08A] mb-4 font-['Roboto_Mono']">Founder & Curator</p>
              <p className="text-white/80 text-sm max-w-[300px] mx-auto font-['Roboto_Mono']">
                With over 15 years of experience in fine art, Alexandra leads our creative vision with passion and dedication.
              </p>
            </div>
            
            {/* Team Member 2 */}
            <div className="text-center">
              <div className="relative w-[220px] h-[220px] mx-auto mb-6 overflow-hidden rounded-full border-4 border-[#E8B08A]">
                <Image 
                  src="/images/mug-white.png"
                  alt="Marcus Thompson"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-white text-xl font-medium mb-1 font-['DM_Serif_Display']">MARCUS THOMPSON</h3>
              <p className="text-[#E8B08A] mb-4 font-['Roboto_Mono']">Co-Founder & Art Director</p>
              <p className="text-white/80 text-sm max-w-[300px] mx-auto font-['Roboto_Mono']">
                Marcus combines his innovative design approach with a deep understanding of art history to create timeless pieces.
              </p>
        </div>

            {/* Team Member 3 */}
            <div className="text-center md:col-span-2 lg:col-span-1">
              <div className="relative w-[220px] h-[220px] mx-auto mb-6 overflow-hidden rounded-full border-4 border-[#E8B08A]">
                <Image 
                  src="/images/cycle1.png"
                  alt="Sarah Kim"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-white text-xl font-medium mb-1 font-['DM_Serif_Display']">SARAH KIM</h3>
              <p className="text-[#E8B08A] mb-4 font-['Roboto_Mono']">Co-Founder & Operations</p>
              <p className="text-white/80 text-sm max-w-[300px] mx-auto font-['Roboto_Mono']">
                Sarah ensures our art reaches collectors worldwide while maintaining our commitment to quality and excellence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram Section */}
      <div className="w-full py-16 md:py-24 bg-transparent">
        <div className="container mx-auto px-6 md:px-8 text-center">
          <h2 className="text-white text-3xl md:text-4xl font-light mb-4 font-['DM_Serif_Display']">Join us on Instagram</h2>
          <p className="text-white/80 mb-12 max-w-[600px] mx-auto font-['Roboto_Mono']">
            Follow us to be the first to see our latest creations, artist spotlights, and behind-the-scenes moments.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1000px] mx-auto">
            <div className="relative aspect-square">
              <Image 
                src="/images/mug-black.png"
                alt="Instagram post"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square">
              <Image 
                src="/images/mug-white.png"
                alt="Instagram post"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square">
              <Image 
                src="/images/cycle1.png"
                alt="Instagram post"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square">
              <Image 
                src="/images/cycle2.png"
                alt="Instagram post"
                fill
                className="object-cover"
              />
            </div>
        </div>

          <div className="mt-8">
            <Link href="https://instagram.com" className="inline-flex items-center text-[#E8B08A] hover:underline text-lg font-['Roboto_Mono']">
              @NOVINO.IO
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Add custom animation styles */}
      <style jsx global>{`
        @keyframes riseUp {
          0% {
            transform: translate(-50%, 200%);
            visibility: visible;
            opacity: 1;
          }
          100% {
            transform: translate(-50%, 50%);
            visibility: visible;
            opacity: 1;
          }
        }
        
        .animate-rise-up {
          animation: riseUp 2s ease-out forwards;
        }
      `}</style>
    </main>
  );
} 