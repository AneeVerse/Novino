"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getValidImageUrl } from '@/lib/imageUtils';

interface Params {
  slug: string;
}

interface Blog {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  image: string;
  author: {
    name: string;
    role?: string;
    image?: string;
  };
  readTime?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Hardcoded sample blog data for fallback
const sampleBlog = {
  id: '1',
  slug: 'diamonds-haven',
  title: "Diamonds Havens",
  description: "Mesmerising jewellery collection that encapsulates the essence of timeless elegance & sophistication",
  content: `
    <p>Welcome to Diamond's Haven, where timeless elegance meets exquisite craftsmanship. Our collection celebrates the unparalleled beauty of diamonds, carefully curated to offer you the finest selection of jewelry pieces that embody sophistication and style.</p>
    
    <h2>The Allure of Diamonds</h2>
    
    <p>For centuries, diamonds have captivated hearts with their brilliant sparkle and enduring strength. At Diamond's Haven, we honor this legacy by selecting only the most exceptional diamonds for our collection. Each stone is meticulously chosen for its superior cut, clarity, color, and carat weight – the 4Cs that determine a diamond's true value.</p>
    
    <p>Our master jewelers then transform these precious gems into wearable works of art, designed to make you feel extraordinary on every occasion. From classic solitaires to contemporary designs, our pieces blend traditional craftsmanship with modern aesthetics to create jewelry that transcends trends.</p>
    
    <h2>Signature Collections</h2>
    
    <p>Explore our signature collections, each telling its own unique story:</p>
    
    <ul>
      <li><strong>Celestial Dreams</strong> - Inspired by the night sky, featuring diamonds set in cosmic patterns</li>
      <li><strong>Eternal Embrace</strong> - Celebrating love with intertwining designs symbolizing togetherness</li>
      <li><strong>Royal Heritage</strong> - Luxurious pieces reminiscent of aristocratic elegance</li>
      <li><strong>Modern Minimalist</strong> - Clean, architectural designs for the contemporary connoisseur</li>
    </ul>
    
    <h2>Ethical Sourcing</h2>
    
    <p>We believe that true beauty should never come at the expense of others. That's why we are committed to ethical sourcing practices, ensuring every diamond in our collection is conflict-free and obtained through responsible mining methods. Our dedication to sustainability extends to our use of recycled precious metals whenever possible, minimizing our environmental footprint.</p>
    
    <h2>Personalized Experience</h2>
    
    <p>At Diamond's Haven, we understand that choosing the perfect diamond piece is a deeply personal journey. Our knowledgeable consultants are dedicated to guiding you through our collection, helping you find or create jewelry that resonates with your personal style and story.</p>
    
    <h2>Visit Diamond's Haven</h2>
    
    <p>Experience the allure of our mesmerizing jewellery collection in person. Visit our elegant boutique to discover how Diamond's Haven can become part of your most cherished moments and memories.</p>
  `,
  image: "/images/blog/Rectangle 13.png",
  author: {
    name: "Jane Smith",
    role: "Jewelry Expert",
    image: "/images/default-author.png"
  },
  readTime: 5,
  publishedAt: "2023-04-15T10:30:00Z",
  createdAt: "2023-04-15T10:30:00Z",
  updatedAt: "2023-04-15T10:30:00Z"
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
        // Ensure id is set correctly
        const processedBlog = {
          ...data,
          id: data._id || data.id
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

  const formattedDate = new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <main className="min-h-screen bg-[#2D2D2D]">
      {/* Back navigation */}
      <div className="container mx-auto px-4 pt-6">
        <Link 
          href="/journal" 
          className="inline-flex items-center text-white/80 hover:text-white transition-colors"
        >
          <span className="text-sm">Home</span>
        </Link>
      </div>

      {/* Hero Section - Blog Title */}
      <div className="w-full py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-white text-[40px] md:text-[64px] font-dm-serif-display leading-tight mb-4"
              style={{ fontFamily: 'DM Serif Display, serif' }}>
            {blog.title}
          </h1>
          <p className="text-white text-lg md:text-xl max-w-3xl">
            {blog.description}
          </p>
          <div className="mt-4 flex items-center text-white/70">
            <span>{formattedDate}</span>
            {blog.readTime && (
              <span className="ml-4">{blog.readTime} min read</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Featured Image - Takes up 8 columns on large screens */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="relative w-full aspect-square md:aspect-[4/3] bg-[#3A3A3A] overflow-hidden rounded-sm border border-[#A47E3B]">
              <img 
                src={getValidImageUrl(blog.image)} 
                alt={blog.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Article Content - Takes up 4 columns on large screens */}
          <div className="lg:col-span-5 xl:col-span-4">
            {/* Author Info if available */}
            {blog.author && (
              <div className="mb-8">
                <div className="flex items-center">
                  {blog.author.image && (
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <img 
                        src={getValidImageUrl(blog.author.image, '/images/default-author.png')} 
                        alt={blog.author.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-white font-medium">{blog.author.name}</div>
                    {blog.author.role && (
                      <div className="text-white/70 text-sm">{blog.author.role}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Blog Content */}
            <div 
              className="prose prose-invert max-w-none prose-headings:font-dm-serif-display prose-headings:font-normal prose-p:text-white/90 prose-li:text-white/90"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Call to Action */}
            <div className="mt-12">
              <Link 
                href="/journal" 
                className="inline-flex flex-row justify-center items-center px-6 py-3 gap-2.5 bg-[#E8B08A] text-white text-sm font-medium"
                style={{ borderRadius: '0px 20px', whiteSpace: 'nowrap' }}
              >
                VIEW ALL ARTICLES
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 