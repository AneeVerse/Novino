"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getValidImageUrl } from "@/lib/imageUtils";

interface Blog {
  id: string;
  _id?: string;
  title: string;
  slug?: string;
  description: string;
  image: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        
        const data = await response.json();
        
        const processedBlogs = data.map((blog: any) => ({
          ...blog,
          id: blog._id || blog.id,
          slug: blog.slug || blog.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        }));
        
        setBlogs(processedBlogs);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  const containerStyle = {
    backgroundColor: "#333333",
    minHeight: "100vh",
    width: "100%"
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div className="max-w-[1440px] mx-auto">
          <div className="pt-16 sm:pt-20 md:pt-24">
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 px-4 md:px-8">
              <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-light font-['Italiana']">Our Blogs</h1>
              <p className="text-white text-sm sm:text-base mt-4">Loading blogs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="max-w-[1440px] mx-auto">
        <div className="pt-16 sm:pt-20 md:pt-24">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 px-4 md:px-8">
            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-light font-['Italiana']">Our Blogs</h1>
            <p className="text-white text-sm sm:text-base mt-4">Explore our complete collection of jewellery articles and stories.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 pb-16 px-4 md:px-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                <div className="relative mb-4 sm:mb-0">
                  <div className="border border-[#A47E3B] w-full sm:w-[280px] h-[200px] sm:h-[240px] relative overflow-hidden z-10">
                    <img 
                      src={getValidImageUrl(blog.image)} 
                      alt={blog.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Decorative box behind image */}
                  <div className="absolute -top-2 -right-2 border border-[#E8B08A] w-full sm:w-[280px] h-[200px] sm:h-[240px] z-0"></div>
                </div>
                <div className="flex-1 min-w-0 relative z-10 text-center sm:text-left">
                  <h3 className="text-white font-['Italiana'] font-normal text-2xl sm:text-3xl leading-tight mb-3 sm:mb-4">{blog.title}</h3>
                  <p className="text-neutral-200 text-sm sm:text-base mb-4 sm:mb-6">{blog.description}</p>
                  <Link 
                    href={`/blogs/${blog.slug || blog.id}`} 
                    className="inline-flex flex-row justify-center items-center px-4 py-3 sm:p-5 gap-2.5 w-[120px] sm:w-[140px] h-[45px] sm:h-[55px] bg-[#FFF4E9] text-black text-xs sm:text-sm font-medium"
                    style={{ borderRadius: '0px 20px', whiteSpace: 'nowrap' }}
                  >
                    VIEW DETAILS
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 