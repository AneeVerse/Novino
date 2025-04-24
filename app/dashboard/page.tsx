"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import BlogForm from '@/components/blog-form';
import TestimonialForm from '@/components/testimonial-form';
import EnhancedProductForm from '@/components/enhanced-product-form';
import { getValidImageUrl } from '@/lib/imageUtils';
import { Product as EnhancedProduct } from '@/app/dashboard/models/product';

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

// Define product-related types
interface ProductVariant {
  id: string;
  name: string;
  type: 'frame' | 'color';
  price?: string;
  quantity: number;
  imageUrl?: string;
}

interface ProductSpecification {
  title: string;
  content: string;
  imageUrl?: string;
}

interface ProductFaq {
  id: string;
  question: string;
  answer: string;
}

interface FaqSection {
  faqs: ProductFaq[];
  imageUrl?: string;
}

// Define the Product interface with enhanced properties
interface Product {
  id: string;
  _id?: string;
  name: string;
  price?: string;
  basePrice?: string;
  description: string;
  image?: string;
  images?: string[];
  category: string;
  type: 'painting' | 'artefact';
  quantity?: number;
  variants?: ProductVariant[];
  specifications?: ProductSpecification;
  faqSection?: FaqSection;
  additionalImageUrl?: string;
  createdAt?: string;
}

function DashboardContent() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [paintings, setPaintings] = useState<Product[]>([]);
  const [artefacts, setArtefacts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string; name: string; type: 'painting' | 'artefact'}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for forms
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | undefined>(undefined);
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | undefined>(undefined);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(undefined);
  
  // Form modes
  const [blogFormMode, setBlogFormMode] = useState<'add' | 'edit'>('add');
  const [testimonialFormMode, setTestimonialFormMode] = useState<'add' | 'edit'>('add');
  const [productFormMode, setProductFormMode] = useState<'add' | 'edit'>('add');
  const [productType, setProductType] = useState<'painting' | 'artefact'>('painting');

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
      
      // Fetch products
      const productsResponse = await fetch('/api/products');
      if (!productsResponse.ok) {
        throw new Error('Failed to fetch products');
      }
      const productsData = await productsResponse.json();
      
      // Process products and separate into paintings and artefacts
      const processedProducts = productsData.map((product: any) => {
        // Convert to a format compatible with our UI
        const processedProduct: Product = {
          id: product._id || product.id,
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.basePrice || product.price,
          image: product.images?.[0] || product.image || '',
          category: product.category,
          type: product.type,
          createdAt: product.createdAt
        };
        return processedProduct;
      });
      
      const paintingsData = processedProducts.filter((product: Product) => product.type === 'painting');
      const artefactsData = processedProducts.filter((product: Product) => product.type === 'artefact');
      
      // Fetch categories
      try {
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.map((cat: any) => ({
            id: cat._id || cat.id,
            name: cat.name,
            type: cat.type
          })));
        }
      } catch (categoryErr) {
        console.error('Error fetching categories:', categoryErr);
        // Fallback categories if API fails
        setCategories([
          { id: '1', name: 'Oil', type: 'painting' },
          { id: '2', name: 'Acrylic', type: 'painting' },
          { id: '3', name: 'Watercolor', type: 'painting' },
          { id: '4', name: 'Mixed Media', type: 'painting' },
          { id: '5', name: 'Egyptian', type: 'artefact' },
          { id: '6', name: 'Asian', type: 'artefact' },
          { id: '7', name: 'European', type: 'artefact' }
        ]);
      }
      
      setBlogs(processedBlogs);
      setTestimonials(processedTestimonials);
      setPaintings(paintingsData);
      setArtefacts(artefactsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
      
      // Fallback to sample data if API fails
      setBlogs(sampleBlogs);
      setTestimonials(sampleTestimonials);
      setPaintings(samplePaintings);
      setArtefacts(sampleArtefacts);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Function to handle editing a blog
  const handleEditBlog = (blog: Blog) => {
    setCurrentBlog(blog);
    setBlogFormMode('edit');
    setShowBlogForm(true);
  };

  // Function to handle deleting a blog
  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blog');
      }
      
      // Remove the blog from the state
      setBlogs(blogs.filter(blog => blog.id !== id));
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog. Please try again.');
    }
  };

  // Function to handle editing a testimonial
  const handleEditTestimonial = (testimonial: Testimonial) => {
    setCurrentTestimonial(testimonial);
    setTestimonialFormMode('edit');
    setShowTestimonialForm(true);
  };

  // Function to handle deleting a testimonial
  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete testimonial');
      }
      
      // Remove the testimonial from the state
      setTestimonials(testimonials.filter(testimonial => testimonial.id !== id));
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      alert('Failed to delete testimonial. Please try again.');
    }
  };

  // Function to handle editing a product
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setProductType(product.type);
    setProductFormMode('edit');
    setShowProductForm(true);
  };

  // Function to handle deleting a product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      // Remove the product from the state
      setPaintings(paintings.filter(product => product.id !== id));
      setArtefacts(artefacts.filter(product => product.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Transform the simple product to enhanced format for the form
  const convertToEnhancedProduct = (product: Product | undefined): EnhancedProduct | undefined => {
    if (!product) return undefined;

    // Removed automatic fetch in convertToEnhancedProduct to prevent infinite loops

    return {
      id: product.id,
      _id: product._id,
      name: product.name,
      description: product.description,
      basePrice: product.price || product.basePrice || '',
      quantity: product.quantity || 1,
      images: product.images || (product.image ? [product.image] : []),
      category: product.category,
      type: product.type,
      variants: product.variants || [],
      specifications: product.specifications || {
        title: '',
        content: ''
      },
      faqSection: product.faqSection || {
        faqs: []
      },
      additionalImageUrl: product.additionalImageUrl || '',
      createdAt: product.createdAt || new Date().toISOString()
    };
  };

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
      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-[#A47E3B] text-white' : 'bg-[#222222] text-white/70 hover:bg-[#333333]'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('blogs')}
          className={`px-4 py-2 rounded ${activeTab === 'blogs' ? 'bg-[#A47E3B] text-white' : 'bg-[#222222] text-white/70 hover:bg-[#333333]'}`}
        >
          Blogs
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2 rounded ${activeTab === 'testimonials' ? 'bg-[#A47E3B] text-white' : 'bg-[#222222] text-white/70 hover:bg-[#333333]'}`}
        >
          Testimonials
        </button>
        <button
          onClick={() => setActiveTab('paintings')}
          className={`px-4 py-2 rounded ${activeTab === 'paintings' ? 'bg-[#A47E3B] text-white' : 'bg-[#222222] text-white/70 hover:bg-[#333333]'}`}
        >
          Paintings
        </button>
        <button
          onClick={() => setActiveTab('artefacts')}
          className={`px-4 py-2 rounded ${activeTab === 'artefacts' ? 'bg-[#A47E3B] text-white' : 'bg-[#222222] text-white/70 hover:bg-[#333333]'}`}
        >
          Artefacts
        </button>
        <Link 
          href="/dashboard/settings/categories"
          className="px-4 py-2 rounded bg-[#222222] text-white/70 hover:bg-[#333333]"
        >
          Categories
        </Link>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'blogs' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Manage Blogs</h1>
            <button 
              onClick={() => {
                setCurrentBlog(undefined);
                setBlogFormMode('add');
                setShowBlogForm(true);
              }}
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
              onClick={() => {
                setCurrentTestimonial(undefined);
                setTestimonialFormMode('add');
                setShowTestimonialForm(true);
              }}
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
      
      {/* Paintings Tab */}
      {activeTab === 'paintings' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Manage Paintings</h1>
            <div className="flex space-x-2">
              <Link 
                href="/dashboard/settings/categories?type=painting"
                className="px-4 py-2 bg-[#333333] text-white rounded hover:bg-[#444444] transition"
              >
                Manage Categories
              </Link>
              <button 
                onClick={() => {
                  setCurrentProduct(undefined);
                  setProductType('painting');
                  setProductFormMode('add');
                  setShowProductForm(true);
                }}
                className="px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31] transition"
              >
                Add New Painting
              </button>
            </div>
          </div>
          
          {/* Paintings Table */}
          <div className="bg-[#222222] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1A1A1A] border-b border-[#333333]">
                  <th className="text-left p-4 text-white font-medium">Name</th>
                  <th className="text-left p-4 text-white font-medium hidden md:table-cell">Price</th>
                  <th className="text-left p-4 text-white font-medium hidden lg:table-cell">Category</th>
                  <th className="text-right p-4 text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paintings.map((product) => (
                  <tr key={product.id} className="border-b border-[#333333] hover:bg-[#2A2A2A]">
                    <td className="p-4 text-white">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                          <img src={getValidImageUrl(product.image ?? '')} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="truncate max-w-[200px]">{product.name}</div>
                      </div>
                    </td>
                    <td className="p-4 text-white/70 hidden md:table-cell">
                      {product.price}
                    </td>
                    <td className="p-4 text-white/70 hidden lg:table-cell">
                      {product.category}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-1 bg-[#333333] text-white/70 rounded hover:bg-[#444444] hover:text-white text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-1 bg-[#392222] text-[#ff9494] rounded hover:bg-[#4a2b2b] hover:text-white text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {paintings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-white/50">
                      No paintings found. Add a new painting to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Artefacts Tab */}
      {activeTab === 'artefacts' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Manage Artefacts</h1>
            <div className="flex space-x-2">
              <Link 
                href="/dashboard/settings/categories?type=artefact"
                className="px-4 py-2 bg-[#333333] text-white rounded hover:bg-[#444444] transition"
              >
                Manage Categories
              </Link>
              <button 
                onClick={() => {
                  setCurrentProduct(undefined);
                  setProductType('artefact');
                  setProductFormMode('add');
                  setShowProductForm(true);
                }}
                className="px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31] transition"
              >
                Add New Artefact
              </button>
            </div>
          </div>
          
          {/* Artefacts Table */}
          <div className="bg-[#222222] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1A1A1A] border-b border-[#333333]">
                  <th className="text-left p-4 text-white font-medium">Name</th>
                  <th className="text-left p-4 text-white font-medium hidden md:table-cell">Price</th>
                  <th className="text-left p-4 text-white font-medium hidden lg:table-cell">Category</th>
                  <th className="text-right p-4 text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {artefacts.map((product) => (
                  <tr key={product.id} className="border-b border-[#333333] hover:bg-[#2A2A2A]">
                    <td className="p-4 text-white">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                          <img src={getValidImageUrl(product.image ?? '')} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="truncate max-w-[200px]">{product.name}</div>
                      </div>
                    </td>
                    <td className="p-4 text-white/70 hidden md:table-cell">
                      {product.price}
                    </td>
                    <td className="p-4 text-white/70 hidden lg:table-cell">
                      {product.category}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-1 bg-[#333333] text-white/70 rounded hover:bg-[#444444] hover:text-white text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-1 bg-[#392222] text-[#ff9494] rounded hover:bg-[#4a2b2b] hover:text-white text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {artefacts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-white/50">
                      No artefacts found. Add a new artefact to get started.
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
                <button 
                  onClick={() => setActiveTab('blogs')}
                  className="px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31] transition"
                >
                  Manage Blogs
                </button>
              </div>
            </div>
            
            <div className="bg-[#222222] p-6 rounded-lg">
              <h2 className="text-lg font-medium text-white mb-4">Testimonials</h2>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-3xl font-bold text-white">{testimonials.length}</div>
                  <div className="text-white/70">Total Testimonials</div>
                </div>
                <button 
                  onClick={() => setActiveTab('testimonials')}
                  className="px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31] transition"
                >
                  Manage Testimonials
                </button>
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
      
      {showProductForm && (
        <EnhancedProductForm 
          mode={productFormMode} 
          product={convertToEnhancedProduct(currentProduct)}
          productType={productType}
          categories={categories.filter(cat => 
            cat.type === productType
          )}
          onCancel={() => {
            setShowProductForm(false);
            fetchData(); // Refresh data when form is closed
          }} 
        />
      )}
    </div>
  );
}

// Sample data for testing
const sampleBlogs = [
  {
    id: '1',
    title: 'Sample Blog Post 1',
    description: 'This is a sample blog post description.',
    content: 'Sample content goes here...',
    image: '/images/blog-placeholder.jpg',
    createdAt: new Date().toISOString()
  },
  // ... more sample blogs if needed
];

const sampleTestimonials = [
  {
    id: '1',
    name: 'John Doe',
    location: 'New York',
    avatar: '/images/avatar-placeholder.jpg',
    rating: 5,
    comment: 'This is a sample testimonial comment.',
    createdAt: new Date().toISOString()
  },
  // ... more sample testimonials if needed
];

const samplePaintings = [
  {
    id: '1',
    name: "AUTUMN BREEZE",
    price: "$1,250",
    category: "Oil",
    description: "A vibrant autumn landscape with rich colors depicting the changing of seasons.",
    image: "/images/mug-black.png",
    type: 'painting' as 'painting',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: "SERENITY",
    price: "$950",
    category: "Acrylic",
    description: "An abstract piece conveying tranquility through soft blue and green tones.",
    image: "/images/mug-white.png",
    type: 'painting' as 'painting',
    createdAt: new Date().toISOString()
  },
];

const sampleArtefacts = [
  {
    id: '1',
    name: "ANCIENT VASE",
    price: "$3,250",
    category: "Egyptian",
    description: "This ancient Egyptian vase features intricate hieroglyphics and traditional design elements.",
    image: "/images/mug-black.png",
    type: 'artefact' as 'artefact',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: "JADE FIGURINE",
    price: "$2,870",
    category: "Asian",
    description: "This exquisite jade figurine showcases the meticulous craftsmanship of Asian artisans.",
    image: "/images/cycle1.png",
    type: 'artefact' as 'artefact',
    createdAt: new Date().toISOString()
  },
];

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[70vh]">
      <div className="text-white text-xl">Loading dashboard...</div>
    </div>}>
      <DashboardContent />
    </Suspense>
  );
} 