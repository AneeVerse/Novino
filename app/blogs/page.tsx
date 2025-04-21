"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
        // Fallback to sample data if API fails
        setBlogs([
          {
            id: '1',
            title: "Gold Lava",
            slug: "gold-lava",
            description: "Radiant jewellery collection that captures the essence of molten gold",
            image: "/images/blog/Rectangle 13.png"
          },
          {
            id: '2',
            title: "Silver Harmony",
            slug: "silver-harmony",
            description: "Elegant silverware that brings timeless sophistication to your collection",
            image: "/images/blog/Rectangle 14.png"
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#2D2D2D] min-h-screen text-white">
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-light mb-4">Journal</h1>
            <p className="text-white/80">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2D2D2D] min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light mb-4">Journal</h1>
          <p className="text-white/80">Explore our collection of articles and stories</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {blogs.map((blog) => (
            <Link 
              href={`/blogs/${blog.slug || blog.id}`}
              key={blog.id}
              className="group"
            >
              <div className="flex flex-col">
                <div className="relative w-full h-80 mb-6 overflow-hidden">
                  <Image
                    src={getValidImageUrl(blog.image)}
                    alt={blog.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h2 className="text-2xl font-light mb-2 group-hover:text-[#E8B08A] transition-colors">
                  {blog.title}
                </h2>
                <p className="text-white/70">
                  {blog.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 