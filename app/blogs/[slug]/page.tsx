"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getValidImageUrl } from '@/lib/imageUtils';
import BlogSection from '@/components/blog-section';
import WardrobeSection from '@/components/wardrobe-section';
import Footer from '@/components/footer';

interface Params {
  slug: string;
}

interface Blog {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  image: string;
}

// Simplified sample blog data for fallback
const sampleBlog = {
  id: '1',
  slug: 'diamonds-haven',
  title: "Diamonds Havens",
  description: "Mesmerising jewellery collection that encapsulates the essence of timeless elegance & sophistication",
  image: "/images/blog/Rectangle 13.png"
};

export default function BlogDetail() {
  const params = useParams() as { slug: string };
  const { slug } = params;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch blog data from API
  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) {
        setError('Invalid blog URL');
        setIsLoading(false);
        return;
      }
      
      try {
        // Try fetching by slug first
        let response = await fetch(`/api/blogs/slug/${slug}`);
        
        // If not found by slug and the slug looks like an ID (MongoDB ObjectId format)
        if (!response.ok && /^[0-9a-fA-F]{24}$/.test(slug as string)) {
          // Try fetching by ID as fallback
          response = await fetch(`/api/blogs/${slug}`);
        }
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Blog not found');
          }
          throw new Error('Failed to fetch blog');
        }
        
        const data = await response.json();
        // Ensure id is set correctly and only keep required fields
        const processedBlog = {
          id: data._id || data.id,
          title: data.title,
          slug: data.slug,
          description: data.description,
          image: data.image
        };
        
        setBlog(processedBlog);
      } catch (err: any) {
        console.error('Error fetching blog:', err);
        setError(err.message || 'Failed to load blog');
        
        // Check if the slug matches any of our sample blogs
        if (typeof slug === 'string') {
          const normalizedSlug = slug.toLowerCase();
          if (normalizedSlug === 'diamonds-haven') {
            setBlog(sampleBlog);
            setError(''); // Clear error if we found a matching sample blog
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlog();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2D2D2D] text-white flex items-center justify-center">
        <p className="text-2xl">Loading...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#2D2D2D] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-red-400 mb-4">{error || 'Blog not found'}</p>
          <Link 
            href="/journal" 
            className="inline-flex items-center text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Journal</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-transparent">
      {/* Back navigation */}
      <div className="container mx-auto px-4 pt-6">
        
          
      </div>

      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-12 mt-16 w-full">
        <div className="max-w-[2400px] mx-auto w-full">
          <div className="relative p-8 md:p-12" style={{ 
            backgroundImage: 'url("/images/product/Container (4).png")',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Side: Title and Description */}
              <div className="flex flex-col justify-center">
                <h1 className="text-white text-5xl md:text-6xl font-light mb-6">
                  {blog.title}
                </h1>
                <p className="text-white/80 text-xl">
                  {blog.description}
                </p>
              </div>
              
              {/* Right Side: Main Image */}
              <div className="flex items-center justify-center">
                <div className="relative w-full md:w-[80%] aspect-square">
                  <Image
                    src={getValidImageUrl(blog.image)}
                    alt={blog.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    className="rounded-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Blog Posts */}
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 mt-16 w-full">
        <div className="max-w-[2400px] mx-auto w-full">
          <BlogSection />
        </div>
      </div>
      
      {/* Wardrobe Section */}
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 mt-12 w-full">
        <div className="max-w-[2400px] mx-auto w-full">
          <WardrobeSection />
        </div>
      </div>
      
      {/* Footer */}
      <div className="w-full">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 w-full">
          <div className="max-w-[2400px] mx-auto w-full">
            <Footer />
          </div>
        </div>
      </div>
    </main>
  );
} 