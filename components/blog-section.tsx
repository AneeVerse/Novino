"use client";

import { useState, useEffect } from "react";
import Image from "next/image"
import Link from "next/link"
import { getValidImageUrl } from "@/lib/imageUtils"
import "@fontsource/italiana"
import "@fontsource/dm-serif-display"
import "@fontsource/roboto-mono"
import "@fontsource/mulish"

interface Blog {
  id: string;
  _id?: string;
  title: string;
  slug?: string;
  description: string;
  image: string;
}

// Fallback sample blogs
const sampleBlogs = [
  {
    id: 1,
    slug: "diamonds-haven",
    title: "Diamond's Haven",
    description: "Mesmerising jewellery collection that encapsulates the essence of timeless elegance & sophistication",
    image: "/images/blog/Rectangle 13.png",
  },
  {
    id: 2,
    slug: "silver-wolf",
    title: "Silver Wolf",
    description: "Enchanting jewellery collection that echoes the untamed spirit of the wild",
    image: "/images/blog/Rectangle 12.png",
  },
  {
    id: 3,
    slug: "couple-paradise",
    title: "Couple Paradise",
    description: "Captivating jewellery collection that celebrates the eternal bond of love",
    image: "/images/blog/Rectangle 15.png",
  },
  {
    id: 4,
    slug: "gold-lava",
    title: "Gold Lava",
    description: "Radiant jewellery collection that captures the essence of molten gold",
    image: "/images/blog/Rectangle 14.png",
  },
];

export default function BlogSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        
        const data = await response.json();
        
        // Process blogs to ensure they have id and slug
        const processedBlogs = data.map((blog: any) => ({
          ...blog,
          id: blog._id || blog.id,
          // Generate slug from title if not provided
          slug: blog.slug || blog.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        }));
        
        setBlogs(processedBlogs);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        // Fallback to sample data
        setBlogs(sampleBlogs.map(blog => ({
          ...blog,
          id: String(blog.id)
        })));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  // Display loading state (optional)
  if (isLoading) {
    return (
      <div className="w-full py-10 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="text-center mb-10 sm:mb-16 md:mb-20 relative z-50">
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-light mb-2 sm:mb-4 font-['DM_Serif_Display'] relative z-50">Blogs</h2>
            <p className="text-white text-sm sm:text-base opacity-90 font-['Roboto_Mono']">Loading blog content...</p>
          </div>
        </div>
      </div>
    );
  }

  // Limit to 4 blogs
  const displayBlogs = blogs.slice(0, 4);
  const firstRow = displayBlogs.slice(0, 2);
  const secondRow = displayBlogs.slice(2, 4);

  return (
    <div className="w-full py-10 sm:py-16 md:py-20">
      <div className="max-w-[2400px] mx-2">
        {/* Header - Making sure it matches Figma design */}
        <div className="text-center mb-10 sm:mb-16 md:mb-20 relative z-50">
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-light font-['DM_Serif_Display'] relative z-50 mb-2">Blogs</h2>
          <p className="text-white text-sm sm:text-base opacity-90 mb-4 font-['Roboto_Mono']">Find all the jewellery you will need here.</p>
          <div className="absolute top-0 right-4 sm:right-8 z-50">
            <Link 
              href="/blogs"
              className="inline-flex items-center px-6 py-2 border-2 border-dashed border-white text-white hover:bg-white/10 transition-colors text-sm sm:text-base cursor-pointer gap-2"
              style={{ borderRadius: '10px' }}
            >
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 16L18 12M18 12L14 8M18 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Main Container */}
        <div className="w-full">
          {/* First Row */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-12 sm:mb-16 md:mb-20">
            {firstRow.map((blog, index) => (
              <div key={blog.id} className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                {/* Image with decorative border */}
                <div className="relative mb-4 sm:mb-0">
                  <div className="border border-[#A47E3B] w-full sm:w-[240px] h-[160px] sm:h-[200px] relative overflow-hidden z-10">
                    <img 
                      src={getValidImageUrl(blog.image)} 
                      alt={blog.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Decorative box behind image */}
                  <div className="absolute -top-2 -right-2 border border-[#E8B08A] w-full sm:w-[240px] h-[160px] sm:h-[200px] z-0"></div>
                </div>
                <div className="min-w-0 relative z-10 text-center sm:text-left">
                  <h3 className="text-white font-['Italiana'] font-normal text-2xl sm:text-[28px] md:text-[32px] leading-tight mb-2 sm:mb-3">{blog.title}</h3>
                  <p className="text-neutral-200 text-xs sm:text-sm mb-4 font-['Mulish']">{blog.description}</p>
                  <Link 
                    href={`/blogs/${blog.slug || blog.id}`} 
                    className="inline-flex flex-row justify-center items-center px-4 py-3 sm:p-5 gap-2.5 w-[120px] sm:w-[140px] h-[45px] sm:h-[55px] bg-[#E8B08A] text-white text-xs sm:text-sm font-medium font-['Mulish']"
                    style={{ borderRadius: '0px 20px', whiteSpace: 'nowrap' }}
                  >
                    VIEW DETAILS
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row */}
          {secondRow.length > 0 && (
            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
              {secondRow.map((blog, index) => (
                <div key={blog.id} className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                  {/* On mobile, show image first, then text */}
                  <div className="relative order-1 sm:order-2 mb-4 sm:mb-0 sm:ml-auto">
                    <div className="border border-[#A47E3B] w-full sm:w-[240px] h-[160px] sm:h-[200px] relative overflow-hidden z-10">
                      <img 
                        src={getValidImageUrl(blog.image)} 
                        alt={blog.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Decorative box behind image */}
                    <div className="absolute -top-2 -right-2 border border-[#E8B08A] w-full sm:w-[240px] h-[160px] sm:h-[200px] z-0"></div>
                  </div>
                  <div className="min-w-0 relative z-10 text-center sm:text-right order-2 sm:order-1">
                    <h3 className="text-white font-['Italiana'] font-normal text-2xl sm:text-[28px] md:text-[32px] leading-tight mb-2 sm:mb-3">{blog.title}</h3>
                    <p className="text-neutral-200 text-xs sm:text-sm mb-4 font-['Mulish']">{blog.description}</p>
                    <Link 
                      href={`/blogs/${blog.slug || blog.id}`} 
                      className="inline-flex flex-row justify-center items-center px-4 py-3 sm:p-5 gap-2.5 w-[120px] sm:w-[140px] h-[45px] sm:h-[55px] bg-[#E8B08A] text-white text-xs sm:text-sm font-medium font-['Mulish']"
                      style={{ borderRadius: '0px 20px', whiteSpace: 'nowrap' }}
                    >
                      VIEW DETAILS
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

