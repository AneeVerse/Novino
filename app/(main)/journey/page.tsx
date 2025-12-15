"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Footer from "@/components/footer"
import { useState, useEffect } from "react"

const designStories = [
  {
    title: "Butterfly",
    description: "Every journey is different. Each pattern is unique. No two are the same.",
    image: "https://ik.imagekit.io/gkkczwgam/PANTINGS/AKV_2172%20(Custom).jpg?updatedAt=1762174641317"
  },
  {
    title: "Life Cycle",
    description: "We're all caught in the web of traditions, people, and pressures. The colorful moments and the dark ones are woven together.",
    image: "https://ik.imagekit.io/gkkczwgam/PANTINGS/AKV_2169%20(Custom).jpg?updatedAt=1762174639381"
  },
  {
    title: "Flowers of the Wild",
    description: "These don't exist in nature. They're born from imagination. Each bloom is entirely fictional and unique.",
    image: "https://ik.imagekit.io/gkkczwgam/PANTINGS/AKV_2370-Edit-2%20(Custom).jpg?updatedAt=1762174642186"
  },
  {
    title: "The Sun",
    description: "The source of everything. Layers within layers. Black and white capturing something eternal and infinite.",
    image: "https://ik.imagekit.io/gkkczwgam/PANTINGS/AKV_2171%20(Custom).jpg?updatedAt=1762174641900"
  },
  {
    title: "Time Cycle",
    description: "Small circles merge into bigger ones. Every timeline has different patterns — bright, dark, emotional. All connected.",
    image: "https://ik.imagekit.io/gkkczwgam/PANTINGS/AKV_2170%20(Custom).jpg?updatedAt=1762174641327"
  }
];

export default function JourneyPage() {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const heroText = document.querySelector('.journey-hero-text') as HTMLElement;
      if (!heroText) return;
      const percentage = Math.min(100, window.scrollY / 3);
      heroText.style.backgroundPosition = `0% ${percentage}%`;
    };

    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }, 1200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#2D2D2D]">
      {/* Hero Section */}
      <div className="relative w-full h-[360px] sm:h-[420px]">
        <Image
          src="/images/hero-section/bg03.png"
          alt="Novino journey"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 z-20 overflow-hidden">
          <div
            className="absolute w-full text-center"
            style={{
              top: '55%',
              left: '50%',
              transform: 'translate(-50%, 44%)',
              height: '160px',
              background: '#E8B08A',
              filter: 'blur(60px)',
              opacity: 0.35,
              width: '50%',
              zIndex: -1
            }}
          ></div>
          <h1
            className={`journey-hero-text text-[120px] md:text-[200px] lg:text-[260px] font-dm-serif-display leading-none absolute w-full text-center ${showText ? 'animate-rise-up' : 'invisible opacity-0'}`}
          >
            JOURNEY
          </h1>
        </div>
      </div>

      {/* Intro Sections */}
      <section className="w-full py-20 bg-[#2D2D2D]">
        <div className="container mx-auto px-2 md:px-8">
          <div className="space-y-14 max-w-[1200px] mx-auto">
            <div className="flex flex-col gap-4">
              <h2 className="text-white text-3xl sm:text-4xl font-light font-['DM_Serif_Display']">Where It Started</h2>
              <p className="text-white/80 text-lg leading-relaxed font-['Roboto_Mono']">
                The sun. That's where this started. As a child, there was an emotional pull toward it — a feeling that all creative energy comes from there.
                Black and white lines trying to show something infinite. That feeling never left.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-white text-3xl sm:text-4xl font-light font-['DM_Serif_Display']">What Nature Shows</h2>
              <p className="text-white/80 text-lg leading-relaxed font-['Roboto_Mono']">
                Butterflies don't repeat patterns. Flowers in the wild are all different. Time moves in overlapping circles.
                Nature became the teacher. The goal was never to copy what exists but to see what's already there — the uniqueness, the cycles, the layers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Observation Section */}
      <section className="w-full py-20 bg-[#1F1F1F]">
        <div className="container mx-auto px-2 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-white text-3xl sm:text-4xl font-light font-['DM_Serif_Display']">How the Work Happens</h3>
              <p className="text-white/80 text-lg leading-relaxed font-['Roboto_Mono']">
                Each painting begins with observation. A trek. A moment spent looking at how butterflies move or how flowers grow.
                Then imagination fills in the rest. What if these flowers existed only in the mind? What if each butterfly wing told a different story?
                What if time could be drawn as circles within circles?
              </p>
            </div>
            <div className="relative h-[320px] sm:h-[420px] rounded-[32px] overflow-hidden border border-white/10">
              <Image
                src="https://ik.imagekit.io/gkkczwgam/PANTINGS/AKV_2172%20(Custom).jpg?updatedAt=1762174641317"
                alt="Journey inspiration"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Design Stories */}
      <section className="w-full py-20 bg-[#2D2D2D]">
        <div className="container mx-auto px-2 md:px-8">
          <div className="flex flex-col gap-4 mb-12 text-center max-w-[1200px] mx-auto">
            <h3 className="text-white text-3xl sm:text-4xl font-light font-['DM_Serif_Display']">What the Designs Mean</h3>
            <p className="text-white/80 text-lg leading-relaxed font-['Roboto_Mono']">
              Five interpretations. Five reflections on the way nature moves, grows, and leaves marks on memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designStories.map((story) => (
              <div
                key={story.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#1B1B1B]/80"
              >
                <div className="relative h-64">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-500 group-hover:opacity-0" />
                </div>
                <div className="p-6 space-y-3">
                  <h4 className="text-white text-2xl font-light font-['DM_Serif_Display']">{story.title}</h4>
                  <p className="text-white/70 text-sm leading-relaxed font-['Roboto_Mono']">{story.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Black and White Section */}
      <section className="w-full py-20 bg-[#1F1F1F]">
        <div className="container mx-auto px-2 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <h3 className="text-white text-3xl sm:text-4xl font-light font-['DM_Serif_Display']">Why Black and White</h3>
              <p className="text-white/80 text-lg leading-relaxed font-['Roboto_Mono']">
                Most of the work stays in black and white. Color comes in later, if at all. The focus is on patterns and structure.
                That's where the story lives — in the tension between contrast, in the quiet spaces between lines.
              </p>
            </div>
            <div className="order-1 md:order-2 relative h-[320px] sm:h-[420px] rounded-[32px] overflow-hidden border border-white/10">
              <Image
                src="https://ik.imagekit.io/gkkczwgam/PANTINGS/AKV_2171%20(Custom).jpg?updatedAt=1762174641900"
                alt="Black and white study"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Reflection Section */}
      <section className="w-full py-20 bg-[#2D2D2D]">
        <div className="container mx-auto px-2 md:px-8">
          <div className="max-w-[1200px] mx-auto text-center space-y-6">
            <h3 className="text-white text-3xl sm:text-4xl font-light font-['DM_Serif_Display']">What You're Seeing</h3>
            <p className="text-white/80 text-lg leading-relaxed font-['Roboto_Mono']">
              These aren't decorations. They're reflections of how nature works. Each piece tries to show something real about life,
              time, and the world around us. The more you look, the more you see.
            </p>
            <div className="flex justify-center pt-4">
              <Link
                href="/artefacts"
                className="inline-flex items-center gap-3 px-6 py-3 bg-[#AE876D] hover:bg-[#8d6c58] text-white font-medium text-lg transition-all duration-300 rounded-full shadow-[0_0_20px_rgba(174,135,109,0.5)] hover:shadow-[0_0_30px_rgba(174,135,109,0.7)] font-['Roboto_Mono']"
              >
                See All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <div className="max-w-[1440px] mx-auto px-2 md:px-6 z-10 relative">
        <Footer />
      </div>

      <style jsx global>{`
        @keyframes riseUp {
          0% {
            transform: translate(-50%, 200%);
            visibility: visible;
            opacity: 1;
          }
          100% {
            transform: translate(-50%, 55%);
            visibility: visible;
            opacity: 1;
          }
        }
        
        .animate-rise-up {
          animation: riseUp 2s ease-out forwards;
        }

        .journey-hero-text {
          font-family: 'DM Serif Display', serif;
          top: 13%;
          left: 50%;
          transform: translate(-50%, 200%);
          letter-spacing: 0.05em;
          color: transparent;
          background-image: linear-gradient(to bottom, white 0%, white 50%, #312F30 50%, #312F30 100%);
          background-size: 100% 200%;
          background-position: 0% 0%;
          background-clip: text;
          -webkit-background-clip: text;
          transition: background-position 0.2s ease-out;
          width: 90%;
        }

        @media (max-width: 767px) {
          .journey-hero-text {
            top: 73%;
            letter-spacing: 0.02em;
            font-size: 70px !important;
            width: 95%;
          }
        }
      `}</style>
    </main>
  );
}

