"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BlogForm from '@/components/blog-form';
import TestimonialForm from '@/components/testimonial-form';
import { getValidImageUrl } from '@/lib/imageUtils';

// Define types for our data
interface Blog {
  id: string;
  _id?: string;
  title: string;
  slug?: string;
  description: string;
  content: string;
  image: string;
  createdAt: string;
}

interface Testimonial {
  id: string;
  _id?: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  socialIcon?: string;
  createdAt: string;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(tabParam || 'blogs');
  
  // State for forms
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | undefined>(undefined);
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | undefined>(undefined);
  
  // Form modes
  const [blogFormMode, setBlogFormMode] = useState<'add' | 'edit'>('add');
  const [testimonialFormMode, setTestimonialFormMode] = useState<'add' | 'edit'>('add');
  
  // Update activeTab when URL param changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Function to fetch data from API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch blogs
      const blogsResponse = await fetch('/api/blogs');
      if (!blogsResponse.ok) {
        throw new Error('Failed to fetch blogs');
      }
      const blogsData = await blogsResponse.json();
      
      // Process data to ensure it has id property
      const processedBlogs = blogsData.map((blog: any) => ({
        ...blog,
        id: blog._id || blog.id,
        // Generate slug from title if not provided
        slug: blog.slug || blog.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      }));
      
      // Fetch testimonials
      const testimonialsResponse = await fetch('/api/testimonials');
      if (!testimonialsResponse.ok) {
        throw new Error('Failed to fetch testimonials');
      }
      const testimonialsData = await testimonialsResponse.json();
      
      // Process data to ensure it has id property
      const processedTestimonials = testimonialsData.map((testimonial: any) => ({
        ...testimonial,
        id: testimonial._id || testimonial.id
      }));
      
      setBlogs(processedBlogs);
      setTestimonials(processedTestimonials);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
      
      // Fallback to sample data if API fails
      setBlogs(sampleBlogs);
      setTestimonials(sampleTestimonials);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hardcoded sample data for fallback
  const sampleBlogs = [
    {
      id: '1',
      title: "Diamond's Haven",
      description: "Mesmerising jewellery collection that encapsulates the essence of timeless elegance & sophistication",
      image: "/images/blog/Rectangle 13.png",
      content: "<p>Welcome to Diamond's Haven, where timeless elegance meets exquisite craftsmanship.</p>",
      createdAt: "2023-04-15T10:30:00Z"
    },
    {
      id: '2',
      title: "Silver Wolf",
      description: "Enchanting jewellery collection that echoes the untamed spirit of the wild",
      image: "/images/blog/Rectangle 12.png",
      content: "<p>Discover the untamed beauty of our Silver Wolf collection.</p>",
      createdAt: "2023-04-14T09:15:00Z"
    },
    {
      id: '3',
      title: "Couple Paradise",
      description: "Captivating jewellery collection that celebrates the eternal bond of love",
      image: "/images/blog/Rectangle 15.png",
      content: "<p>Celebrate your eternal bond with our Couple Paradise collection.</p>",
      createdAt: "2023-04-13T14:45:00Z"
    },
    {
      id: '4',
      title: "Gold Lava",
      description: "Radiant jewellery collection that captures the essence of molten gold",
      image: "/images/blog/Rectangle 14.png",
      content: "<p>Feel the warmth of molten gold with our Gold Lava collection.</p>",
      createdAt: "2023-04-12T11:20:00Z"
    }
  ];
  
  const sampleTestimonials = [
    {
      id: '1',
      name: "Sarah Thompson",
      location: "New York, USA",
      avatar: "/images/testimonals/sarah-thompson.png",
      rating: 5,
      comment: "StyleLoom exceeded my expectations. The gown's quality and design made me feel like a queen. Fast shipping, too!",
      createdAt: "2023-03-10T10:30:00Z"
    },
    {
      id: '2',
      name: "Rajesh Patel",
      location: "Mumbai, India",
      avatar: "/images/testimonals/rajesh-patel.png",
      rating: 5,
      comment: "Absolutely love the style and warmth of the jacket. A perfect blend of fashion and functionality!",
      createdAt: "2023-03-08T09:15:00Z"
    },
    {
      id: '3',
      name: "Emily Walker",
      location: "London, UK",
      avatar: "/images/testimonals/emily-walker.png",
      rating: 5,
      comment: "Adorable and comfortable! My daughter loves her new outfit. Thank you, StyleLoom, for dressing our little fashionista.",
      createdAt: "2023-03-05T14:45:00Z"
    }
  ];

  // Add new blog handler
  const handleAddBlog = () => {
    setCurrentBlog(undefined);
    setBlogFormMode('add');
    setShowBlogForm(true);
  };
  
  // Edit blog handler
  const handleEditBlog = (blog: Blog) => {
    setCurrentBlog(blog);
    setBlogFormMode('edit');
    setShowBlogForm(true);
  };
  
  // Delete blog handler
  const handleDeleteBlog = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blog');
      }
      
      // Refresh data after deletion
      fetchData();
    } catch (err: any) {
      console.error('Error deleting blog:', err);
      alert(err.message || 'Failed to delete blog');
    }
  };
  
  // Add new testimonial handler
  const handleAddTestimonial = () => {
    setCurrentTestimonial(undefined);
    setTestimonialFormMode('add');
    setShowTestimonialForm(true);
  };
  
  // Edit testimonial handler
  const handleEditTestimonial = (testimonial: Testimonial) => {
    setCurrentTestimonial(testimonial);
    setTestimonialFormMode('edit');
    setShowTestimonialForm(true);
  };
  
  // Delete testimonial handler
  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete testimonial');
      }
      
      // Refresh data after deletion
      fetchData();
    } catch (err: any) {
      console.error('Error deleting testimonial:', err);
      alert(err.message || 'Failed to delete testimonial');
    }
  };

  useEffect(() => {
    // Fetch data from API
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="bg-red-500/20 text-red-300 p-4 rounded max-w-md text-center">
          <h3 className="text-xl font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Content based on active tab */}
      {activeTab === 'blogs' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Manage Blogs</h1>
            <button 
              onClick={handleAddBlog}
              className="px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31] transition"
            >
              Add New Blog
            </button>
          </div>
          
          {/* Blog Table */}
          <div className="bg-[#222222] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1A1A1A] border-b border-[#333333]">
                  <th className="text-left p-4 text-white font-medium">Title</th>
                  <th className="text-left p-4 text-white font-medium hidden md:table-cell">Description</th>
                  <th className="text-left p-4 text-white font-medium hidden lg:table-cell">Date</th>
                  <th className="text-right p-4 text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-[#333333] hover:bg-[#2A2A2A]">
                    <td className="p-4 text-white">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                          <img src={getValidImageUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="truncate max-w-[200px]">{blog.title}</div>
                      </div>
                    </td>
                    <td className="p-4 text-white/70 hidden md:table-cell">
                      <div className="truncate max-w-[300px]">{blog.description}</div>
                    </td>
                    <td className="p-4 text-white/70 hidden lg:table-cell">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          href={`/blogs/${blog.slug || blog.id}`}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          View
                        </Link>
                        <button 
                          onClick={() => handleEditBlog(blog)}
                          className="px-3 py-1 bg-[#444444] text-white text-sm rounded hover:bg-[#555555]"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {blogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-white/70">
                      No blogs found. Click "Add New Blog" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'testimonials' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Manage Testimonials</h1>
            <button 
              onClick={handleAddTestimonial}
              className="px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31] transition"
            >
              Add New Testimonial
            </button>
          </div>
          
          {/* Testimonials Table */}
          <div className="bg-[#222222] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1A1A1A] border-b border-[#333333]">
                  <th className="text-left p-4 text-white font-medium">Name</th>
                  <th className="text-left p-4 text-white font-medium hidden md:table-cell">Comment</th>
                  <th className="text-left p-4 text-white font-medium hidden lg:table-cell">Rating</th>
                  <th className="text-right p-4 text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="border-b border-[#333333] hover:bg-[#2A2A2A]">
                    <td className="p-4 text-white">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                          <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium">{testimonial.name}</div>
                          <div className="text-sm text-white/70">{testimonial.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white/70 hidden md:table-cell">
                      <div className="truncate max-w-[300px]">{testimonial.comment}</div>
                    </td>
                    <td className="p-4 text-white/70 hidden lg:table-cell">
                      <div className="flex text-yellow-400">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEditTestimonial(testimonial)}
                          className="px-3 py-1 bg-[#444444] text-white text-sm rounded hover:bg-[#555555]"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {testimonials.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-white/70">
                      No testimonials found. Click "Add New Testimonial" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Overview tab */}
      {(!activeTab || activeTab === 'overview') && (
        <div>
          <h1 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#222222] p-6 rounded-lg">
              <h2 className="text-lg font-medium text-white mb-4">Blogs</h2>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-3xl font-bold text-white">{blogs.length}</div>
                  <div className="text-white/70">Total Blogs</div>
                </div>
                <Link 
                  href="/dashboard?tab=blogs"
                  className="px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31] transition"
                >
                  Manage Blogs
                </Link>
              </div>
            </div>
            
            <div className="bg-[#222222] p-6 rounded-lg">
              <h2 className="text-lg font-medium text-white mb-4">Testimonials</h2>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-3xl font-bold text-white">{testimonials.length}</div>
                  <div className="text-white/70">Total Testimonials</div>
                </div>
                <Link 
                  href="/dashboard?tab=testimonials"
                  className="px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31] transition"
                >
                  Manage Testimonials
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-[#222222] p-6 rounded-lg">
              <h2 className="text-lg font-medium text-white mb-4">Recent Blog Posts</h2>
              
              {blogs.slice(0, 3).map((blog) => (
                <div key={blog.id} className="flex items-center py-3 border-b border-[#333333] last:border-0">
                  <div className="w-12 h-12 rounded overflow-hidden mr-4 flex-shrink-0">
                    <img src={getValidImageUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{blog.title}</div>
                    <div className="text-sm text-white/70">{new Date(blog.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Link 
                    href={`/blogs/${blog.slug || blog.id}`}
                    className="ml-4 px-3 py-1 bg-[#444444] text-white text-sm rounded hover:bg-[#555555]"
                  >
                    View
                  </Link>
                </div>
              ))}
              
              {blogs.length === 0 && (
                <div className="text-center text-white/70 py-4">
                  No blogs found. Add some blogs to see them here.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Forms */}
      {showBlogForm && (
        <BlogForm 
          mode={blogFormMode} 
          blog={currentBlog} 
          onCancel={() => {
            setShowBlogForm(false);
            fetchData(); // Refresh data when form is closed
          }} 
        />
      )}
      
      {showTestimonialForm && (
        <TestimonialForm 
          mode={testimonialFormMode} 
          testimonial={currentTestimonial} 
          onCancel={() => {
            setShowTestimonialForm(false);
            fetchData(); // Refresh data when form is closed
          }} 
        />
      )}
    </div>
  );
} 