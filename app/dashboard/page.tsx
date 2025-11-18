"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import BlogForm from '@/components/blog-form';
import TestimonialForm from '@/components/testimonial-form';
import EnhancedProductForm from '@/components/enhanced-product-form';
import { getValidImageUrl } from '@/lib/imageUtils';
import { Product as EnhancedProduct } from '@/app/dashboard/models/product';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, FileText, MessageSquare, Image as ImageIcon, Package, Eye, Calendar, Clock, Plus, Edit, Trash2, ExternalLink, Star } from 'lucide-react';
import ArtefactCategoryModal from '@/components/artefact-category-modal';
import ArtefactCategoryGrid from '@/components/artefact-category-grid';
import ArtefactCategoryDetail from '@/components/artefact-category-detail';
import ArtefactProductForm from '@/components/artefact-product-form';
import { ArtefactCategory, ArtefactProduct } from '@/app/dashboard/models/artefact';

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
  shortDescription?: string;
  logoUrl?: string;
  createdAt?: string;
}

interface ShiprocketOverviewMetrics {
  totalOrders: number;
  codOrders: number;
  prepaidOrders: number;
  todaysOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  fetchedAt: string;
}

const sortCategoriesByOrder = (categories: ArtefactCategory[]) => {
  return [...categories].sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;

    if (orderA === orderB) {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    }

    return orderA - orderB;
  });
};

function DashboardContent() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [paintings, setPaintings] = useState<Product[]>([]);
  const [artefacts, setArtefacts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string; name: string; type: 'painting' | 'artefact'}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New Artefact Category System States
  const [artefactCategories, setArtefactCategories] = useState<ArtefactCategory[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<ArtefactCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ArtefactCategory | null>(null);
  const [showCategoryDetail, setShowCategoryDetail] = useState(false);
  const [showArtefactProductForm, setShowArtefactProductForm] = useState(false);
  const [currentArtefactProduct, setCurrentArtefactProduct] = useState<ArtefactProduct | undefined>(undefined);
  const [isReorderingCategories, setIsReorderingCategories] = useState(false);
  
  // Get tab from URL parameter
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get('tab') : null;
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  
  // Update activeTab when URL parameter changes
  useEffect(() => {
    if (searchParams) {
      setActiveTab(searchParams.get('tab') || 'overview');
    }
  }, [searchParams]);

  const shiprocketRangePresets = [
    { label: '7d', days: 7 },
    { label: '14d', days: 14 },
    { label: '30d', days: 30 },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);

  
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

  const makeRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      label: `Last ${days} days`,
    };
  };

  const [shiprocketRange, setShiprocketRange] = useState(() => makeRange(14));
  const [shiprocketMetrics, setShiprocketMetrics] = useState<ShiprocketOverviewMetrics | null>(null);
  const [shiprocketMetricsLoading, setShiprocketMetricsLoading] = useState(true);
  const [shiprocketMetricsError, setShiprocketMetricsError] = useState<string | null>(null);

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
    fetchArtefactCategories();
  }, []);
  
  useEffect(() => {
    let isMounted = true;

    const fetchShiprocketMetrics = async () => {
      setShiprocketMetricsLoading(true);
      setShiprocketMetricsError(null);
      try {
        const params = new URLSearchParams({
          from: shiprocketRange.from,
          to: shiprocketRange.to,
        });

        const response = await fetch(`/api/shiprocket/overview?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to load Shiprocket overview');
        }

        const payload = await response.json();
        if (!isMounted) return;
        setShiprocketMetrics(payload.data);
      } catch (err) {
        if (!isMounted) return;
        setShiprocketMetricsError(
          err instanceof Error ? err.message : 'Unable to load Shiprocket overview'
        );
      } finally {
        if (!isMounted) return;
        setShiprocketMetricsLoading(false);
      }
    };

    fetchShiprocketMetrics();

    return () => {
      isMounted = false;
    };
  }, [shiprocketRange.from, shiprocketRange.to]);

  const handleShiprocketRangeChange = (days: number) => {
    const next = makeRange(days);
    setShiprocketRange(next);
  };

  // Fetch artefact categories
  const fetchArtefactCategories = async () => {
    try {
      const response = await fetch('/api/artefact-categories');
      if (response.ok) {
        const data = await response.json();
        setArtefactCategories(sortCategoriesByOrder(data));
      }
    } catch (error) {
      console.error('Error fetching artefact categories:', error);
    }
  };

  const handleReorderCategories = async (orderedList: { id: string; order: number }[]) => {
    if (isReorderingCategories) return;

    setIsReorderingCategories(true);
    try {
      const response = await fetch('/api/artefact-categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderedList }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder categories');
      }

      const data = await response.json();
      if (Array.isArray(data.categories)) {
        setArtefactCategories(sortCategoriesByOrder(data.categories));
      } else {
        await fetchArtefactCategories();
      }
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    } finally {
      setIsReorderingCategories(false);
    }
  };
  
  // Create or update artefact category
  const handleSaveCategory = async (name: string, description: string) => {
    try {
      if (categoryModalMode === 'edit' && editingCategory) {
        // Update existing category
        const response = await fetch(`/api/artefact-categories/${editingCategory.id || editingCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...editingCategory,
            name, 
            description,
            updatedAt: new Date().toISOString()
          }),
        });
        
        if (response.ok) {
          await fetchArtefactCategories();
          setEditingCategory(null);
        }
      } else {
        // Create new category
        const response = await fetch('/api/artefact-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        });
        
        if (response.ok) {
          await fetchArtefactCategories();
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Open modal to create new category
  const handleCreateCategoryClick = () => {
    setCategoryModalMode('create');
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  // Open modal to edit existing category
  const handleEditCategory = (category: ArtefactCategory) => {
    setCategoryModalMode('edit');
    setEditingCategory(category);
    setShowCategoryModal(true);
  };
  
  // Update artefact category
  const handleUpdateCategory = async (category: ArtefactCategory) => {
    try {
      const response = await fetch(`/api/artefact-categories/${category.id || category._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      
      if (response.ok) {
        await fetchArtefactCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };
  
  // Delete artefact category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/artefact-categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchArtefactCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };
  
  // Add product to category
  const handleAddProduct = async (productData: Omit<ArtefactProduct, 'id' | 'order' | 'createdAt'>) => {
    if (!selectedCategory) return;
    
    const newProduct: ArtefactProduct = {
      ...productData,
      id: Date.now().toString(),
      order: selectedCategory.products?.length || 0,
      createdAt: new Date().toISOString(),
    };
    
    const updatedCategory = {
      ...selectedCategory,
      products: [...(selectedCategory.products || []), newProduct],
      updatedAt: new Date().toISOString(),
    };
    
    // Update in database
    await handleUpdateCategory(updatedCategory);
    
    // Immediately update local state to show in UI
    setSelectedCategory(updatedCategory);
    
    // Refresh the categories list to update thumbnails
    await fetchArtefactCategories();
  };
  
  // Edit artefact product in category
  const handleEditArtefactProduct = (product: ArtefactProduct) => {
    setCurrentArtefactProduct(product);
    setShowArtefactProductForm(true);
  };
  
  // Update product in category
  const handleUpdateProduct = async (productData: Omit<ArtefactProduct, 'id' | 'order' | 'createdAt'>) => {
    if (!selectedCategory || !currentArtefactProduct) return;
    
    const updatedProducts = selectedCategory.products.map(p =>
      p.id === currentArtefactProduct.id
        ? { ...p, ...productData }
        : p
    );
    
    const updatedCategory = {
      ...selectedCategory,
      products: updatedProducts,
      updatedAt: new Date().toISOString(),
    };
    
    // Update in database
    await handleUpdateCategory(updatedCategory);
    
    // Immediately update local state to show in UI
    setSelectedCategory(updatedCategory);
    
    // Refresh the categories list to update thumbnails
    await fetchArtefactCategories();
  };
  
  // Delete artefact product from category
  const handleDeleteArtefactProduct = (productId: string) => {
    // This is handled in the category detail component
  };

  // Function to handle editing a blog
  const handleEditBlog = (blog: Blog) => {
    setCurrentBlog(blog);
    setBlogFormMode('edit');
    setShowBlogForm(true);
  };

  // Function to handle deleting a blog  
  const handleDeleteBlog = async (id: string) => {
    // Note: Consider adding confirmation dialog here too
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
    // Note: Consider adding confirmation dialog here too
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

  // Function to handle editing a painting product
  const handleEditPaintingProduct = (product: Product) => {
    setCurrentProduct(product);
    setProductType(product.type);
    setProductFormMode('edit');
    setShowProductForm(true);
  };

  // Function to handle deleting a product
  const handleDeleteProduct = async (id: string) => {
    // Note: Consider adding confirmation dialog here too
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

  // Helper function to navigate to a tab
  const navigateToTab = (tab: string) => {
    router.push(`/dashboard${tab === 'overview' ? '' : `?tab=${tab}`}`);
  };

  // Helper function to get category name from ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
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

  // Generate chart data
  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        blogs: Math.floor(Math.random() * 5) + 1,
        testimonials: Math.floor(Math.random() * 3) + 1,
        products: Math.floor(Math.random() * 4) + 1
      };
    });
    return last7Days;
  };

  const pieData = [
    { name: 'Products', value: artefactCategories.reduce((sum, cat) => sum + (cat.products?.length || 0), 0), color: '#10B981' },
    { name: 'Categories', value: artefactCategories.length, color: '#059669' },
    { name: 'Blogs', value: blogs.length, color: '#8B6F3E' },
  ];

  return (
    <div className="space-y-6">
      {/* Content sections based on activeTab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
              <p className="text-white/60">Welcome back! Here's what's happening with your art gallery.</p>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Shiprocket Overview */}
          <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#1E1E1E] via-[#171717] to-[#121212] border border-white/5 rounded-2xl p-6 shadow-[0px_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="flex-1 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.35em] text-white/40 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A47E3B] animate-pulse" />
                  Shiprocket
                </div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-semibold text-white">Fulfilment overview</h2>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 border border-white/10 text-white/60">
                    Live
                  </span>
                </div>
                <p className="text-sm text-white/60">
                  Data synced{' '}
                  {shiprocketMetrics?.fetchedAt
                    ? new Date(shiprocketMetrics.fetchedAt).toLocaleString()
                    : 'just now'}
                </p>
              </div>
              <div className="flex flex-col items-start gap-3">
                <span className="text-xs tracking-wide text-white/40 uppercase">Range</span>
                <div className="flex flex-wrap items-center gap-2">
                  {shiprocketRangePresets.map((preset) => {
                    const isActive = shiprocketRange.label === `Last ${preset.days} days`;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => handleShiprocketRangeChange(preset.days)}
                        className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-white text-black shadow-lg shadow-white/30'
                            : 'bg-white/10 text-white/70 border border-white/10 hover:text-white hover:bg-white/15'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {shiprocketMetricsError && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl px-4 py-3">
                {shiprocketMetricsError}
              </div>
            )}

            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    title: "Today's Orders",
                    value: shiprocketMetrics?.todaysOrders ?? 0,
                    description: 'Orders created today',
                  },
                  {
                    title: 'Total Orders',
                    value: shiprocketMetrics?.totalOrders ?? 0,
                    description: `Period ${shiprocketRange.from} → ${shiprocketRange.to}`,
                  },
                  {
                    title: 'COD Orders',
                    value: shiprocketMetrics?.codOrders ?? 0,
                    description: 'Cash on Delivery share',
                  },
                  {
                    title: 'Avg. Order Value',
                    value: shiprocketMetrics ? formatCurrency(shiprocketMetrics.averageOrderValue) : 0,
                    description: 'Across current range',
                    isCurrency: true,
                  },
                ].map((stat) => (
                  <Card
                    key={stat.title}
                    className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/60 hover:border-white/10 transition-all duration-300"
                  >
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium text-white/70">{stat.title}</CardTitle>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-semibold text-white tracking-tight">
                        {shiprocketMetricsLoading && !shiprocketMetrics ? (
                          <span className="animate-pulse text-white/30">•••</span>
                        ) : stat.isCurrency ? (
                          stat.value
                        ) : (
                          Number(stat.value || 0).toLocaleString()
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-3">{stat.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/60">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Shipment details</CardTitle>
                    <CardDescription className="text-white/60">
                      Quick snapshot of fulfilment split
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
                    {[
                      {
                        label: 'Total shipments',
                        value: shiprocketMetrics?.totalOrders ?? 0,
                      },
                      {
                        label: 'COD share',
                        value: shiprocketMetrics?.codOrders ?? 0,
                      },
                      {
                        label: 'Prepaid share',
                        value: shiprocketMetrics?.prepaidOrders ?? 0,
                      },
                      {
                        label: "Today's orders",
                        value: shiprocketMetrics?.todaysOrders ?? 0,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur"
                      >
                        <p className="text-xs uppercase tracking-wide text-white/40">{item.label}</p>
                        <p className="text-3xl font-semibold mt-2">
                          {shiprocketMetricsLoading && !shiprocketMetrics ? (
                            <span className="animate-pulse text-white/40">•••</span>
                          ) : (
                            Number(item.value || 0).toLocaleString()
                          )}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/60">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Revenue summary</CardTitle>
                    <CardDescription className="text-white/60">
                      Gross value across the selected range
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="bg-gradient-to-r from-[#A47E3B]/30 to-transparent rounded-2xl p-5 border border-[#A47E3B]/40">
                      <p className="text-xs uppercase tracking-wide text-white/70">Total revenue</p>
                      <p className="text-4xl font-semibold text-white mt-2">
                        {shiprocketMetricsLoading && !shiprocketMetrics ? (
                          <span className="animate-pulse text-white/40">•••</span>
                        ) : shiprocketMetrics ? (
                          formatCurrency(shiprocketMetrics.totalRevenue)
                        ) : (
                          '--'
                        )}
                      </p>
                      <p className="text-xs text-white/60 mt-2">
                        Avg order value{' '}
                        {shiprocketMetrics ? formatCurrency(shiprocketMetrics.averageOrderValue) : '—'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Blogs Card */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white/70">Total Blogs</CardTitle>
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-white">{blogs.length}</div>
                  <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12%
                  </Badge>
                </div>
                <button 
                  onClick={() => navigateToTab('blogs')}
                  className="mt-4 w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Manage Blogs
                  <ExternalLink className="w-3 h-3" />
                </button>
              </CardContent>
            </Card>

            {/* Testimonials Card */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white/70">Testimonials</CardTitle>
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-white">{testimonials.length}</div>
                  <Badge className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8%
                  </Badge>
                </div>
                <button 
                  onClick={() => navigateToTab('testimonials')}
                  className="mt-4 w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Manage Testimonials
                  <ExternalLink className="w-3 h-3" />
                </button>
              </CardContent>
            </Card>

            {/* Products Card */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white/70">Products</CardTitle>
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Package className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-white">{artefactCategories.reduce((sum, cat) => sum + (cat.products?.length || 0), 0)}</div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +20%
                  </Badge>
                </div>
                <button 
                  onClick={() => navigateToTab('products')}
                  className="mt-4 w-full px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  View Products
                  <ExternalLink className="w-3 h-3" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Chart */}
            <Card className="lg:col-span-2 bg-[#1A1A1A] border-[#333333]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#A47E3B]" />
                  Content Activity
                </CardTitle>
                <CardDescription className="text-white/60">Last 7 days overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getChartData()}>
                    <defs>
                      <linearGradient id="colorBlogs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTestimonials" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis dataKey="name" stroke="#888888" />
                    <YAxis stroke="#888888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222222', border: '1px solid #333333', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="blogs" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBlogs)" />
                    <Area type="monotone" dataKey="testimonials" stroke="#a855f7" fillOpacity={1} fill="url(#colorTestimonials)" />
                    <Area type="monotone" dataKey="products" stroke="#10b981" fillOpacity={1} fill="url(#colorProducts)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Content Distribution */}
            <Card className="bg-[#1A1A1A] border-[#333333]">
              <CardHeader>
                <CardTitle className="text-white">Content Distribution</CardTitle>
                <CardDescription className="text-white/60">Total items by category</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222222', border: '1px solid #333333', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Blog Posts */}
            <Card className="lg:col-span-2 bg-[#1A1A1A] border-[#333333]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Recent Blog Posts</CardTitle>
                    <CardDescription className="text-white/60">Latest published content</CardDescription>
                  </div>
                  <button 
                    onClick={() => navigateToTab('blogs')}
                    className="text-[#A47E3B] hover:text-[#C4A962] text-sm font-medium transition-colors"
                  >
                    View All →
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {blogs.length === 0 ? (
                  <div className="text-center py-12 text-white/50">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No blogs found. Create your first blog post!</p>
                  </div>
                ) : (
                  blogs.slice(0, 4).map((blog) => (
                    <div key={blog.id} className="flex items-center gap-4 p-3 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] transition-all duration-200 group">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#333333]">
                        <img 
                          src={getValidImageUrl(blog.image)} 
                          alt={blog.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate group-hover:text-[#A47E3B] transition-colors">
                          {blog.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center text-xs text-white/50">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <Badge variant="outline" className="text-xs border-[#333333] text-white/70">
                            Published
                          </Badge>
                        </div>
                      </div>
                      <Link 
                        href={`/blogs/${blog.slug || blog.id}`}
                        className="px-3 py-2 bg-[#333333] hover:bg-[#A47E3B] text-white text-sm rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Link>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-[#A47E3B]/10 to-[#8B6F3E]/5 border-[#A47E3B]/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-white/60">Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => {
                    setCurrentBlog(undefined);
                    setBlogFormMode('add');
                    setShowBlogForm(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-[#1A1A1A] hover:bg-[#222222] text-white rounded-lg transition-all duration-200 group border border-[#333333] hover:border-[#A47E3B]"
                >
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <Plus className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">Create New Blog</span>
                </button>
                
                <button
                  onClick={() => {
                    setCurrentTestimonial(undefined);
                    setTestimonialFormMode('add');
                    setShowTestimonialForm(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-[#1A1A1A] hover:bg-[#222222] text-white rounded-lg transition-all duration-200 group border border-[#333333] hover:border-[#A47E3B]"
                >
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                    <Plus className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium">Add Testimonial</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentProduct(undefined);
                    setProductType('painting');
                    setProductFormMode('add');
                    setShowProductForm(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-[#1A1A1A] hover:bg-[#222222] text-white rounded-lg transition-all duration-200 group border border-[#333333] hover:border-[#A47E3B]"
                >
                  <div className="p-2 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                    <Plus className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-sm font-medium">Add Painting</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentProduct(undefined);
                    setProductType('artefact');
                    setProductFormMode('add');
                    setShowProductForm(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-[#1A1A1A] hover:bg-[#222222] text-white rounded-lg transition-all duration-200 group border border-[#333333] hover:border-[#A47E3B]"
                >
                  <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                    <Plus className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium">Add Artefact</span>
                </button>

                <div className="pt-3 border-t border-[#333333]">
                  <Link
                    href="/"
                    className="w-full flex items-center gap-3 p-3 bg-[#1A1A1A] hover:bg-[#222222] text-white rounded-lg transition-all duration-200 group border border-[#333333] hover:border-[#A47E3B]"
                  >
                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                      <ExternalLink className="w-4 h-4 text-white/70" />
                    </div>
                    <span className="text-sm font-medium">View Live Site</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      
      {activeTab === 'blogs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Manage Blogs</h1>
              <p className="text-white/60">Create and manage your blog posts</p>
            </div>
            <button 
              onClick={() => {
                setCurrentBlog(undefined);
                setBlogFormMode('add');
                setShowBlogForm(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add New Blog
            </button>
          </div>
          
          {/* Blog Cards Grid */}
          {blogs.length === 0 ? (
            <Card className="bg-[#1A1A1A] border-[#333333]">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Blogs Yet</h3>
                <p className="text-white/60 text-center mb-6 max-w-sm">
                  Start creating engaging blog posts to share with your audience.
                </p>
                <button 
                  onClick={() => {
                    setCurrentBlog(undefined);
                    setBlogFormMode('add');
                    setShowBlogForm(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Blog
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Card key={blog.id} className="bg-[#1A1A1A] border-[#333333] hover:border-blue-500/40 transition-all duration-300 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden bg-[#222222]">
                    <img 
                      src={getValidImageUrl(blog.image)} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-500/90 text-white border-0 backdrop-blur-sm">
                        Published
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="text-white/60 line-clamp-2 mt-2">
                      {blog.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-white/50">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(blog.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Link 
                        href={`/blogs/${blog.slug || blog.id}`}
                        className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <button 
                        onClick={() => handleEditBlog(blog)}
                        className="flex-1 px-3 py-2 bg-[#222222] hover:bg-[#2A2A2A] text-white/80 hover:text-white text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white text-sm rounded-lg transition-all duration-200 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Manage Testimonials</h1>
              <p className="text-white/60">View and manage customer testimonials</p>
            </div>
            <button 
              onClick={() => {
                setCurrentTestimonial(undefined);
                setTestimonialFormMode('add');
                setShowTestimonialForm(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add New Testimonial
            </button>
          </div>
          
          {/* Testimonials Cards Grid */}
          {testimonials.length === 0 ? (
            <Card className="bg-[#1A1A1A] border-[#333333]">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Testimonials Yet</h3>
                <p className="text-white/60 text-center mb-6 max-w-sm">
                  Start collecting customer testimonials to build trust and credibility.
                </p>
                <button 
                  onClick={() => {
                    setCurrentTestimonial(undefined);
                    setTestimonialFormMode('add');
                    setShowTestimonialForm(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Testimonial
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="bg-[#1A1A1A] border-[#333333] hover:border-purple-500/40 transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{testimonial.name}</CardTitle>
                        <CardDescription className="text-white/60 mt-1">{testimonial.location}</CardDescription>
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} 
                            />
                          ))}
                          <span className="text-sm text-white/50 ml-2">({testimonial.rating}/5)</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-4 italic">
                      "{testimonial.comment}"
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => handleEditTestimonial(testimonial)}
                        className="flex-1 px-3 py-2 bg-[#222222] hover:bg-[#2A2A2A] text-white/80 hover:text-white text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white text-sm rounded-lg transition-all duration-200 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Products Tab - New Category-Based System */}
      {activeTab === 'products' && !showCategoryDetail && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Manage Products</h1>
              <p className="text-white/60">Organize your products by categories</p>
            </div>
            <button 
              onClick={handleCreateCategoryClick}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Category
            </button>
          </div>
          
          {/* Category Cards Grid */}
          {artefactCategories.length === 0 ? (
            <Card className="bg-[#1A1A1A] border-[#333333]">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Categories Yet</h3>
                <p className="text-white/60 text-center mb-6 max-w-sm">
                  Create categories to organize your products (like Mouse Pads, Desk Mats, etc.).
                </p>
                <button 
                  onClick={handleCreateCategoryClick}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Category
                </button>
              </CardContent>
            </Card>
          ) : (
            <ArtefactCategoryGrid
              categories={artefactCategories}
              onCategoryClick={(category) => {
                setSelectedCategory(category);
                setShowCategoryDetail(true);
              }}
              onDeleteCategory={handleDeleteCategory}
              onEditCategory={handleEditCategory}
              onReorderCategories={handleReorderCategories}
            />
          )}
        </div>
      )}
      
      {/* Category Detail Overlay */}
      {activeTab === 'products' && selectedCategory && (
        <ArtefactCategoryDetail
          category={selectedCategory}
          isOpen={showCategoryDetail}
          onClose={() => {
            setShowCategoryDetail(false);
            setSelectedCategory(null);
            fetchArtefactCategories(); // Refresh categories when closing
          }}
          onUpdateCategory={handleUpdateCategory}
          onAddProduct={() => {
            setCurrentArtefactProduct(undefined);
            setShowArtefactProductForm(true);
          }}
          onEditProduct={handleEditArtefactProduct}
          onDeleteProduct={handleDeleteArtefactProduct}
        />
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
      
      {/* Artefact Category Modal */}
      <ArtefactCategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSaveCategory}
        mode={categoryModalMode}
        initialName={editingCategory?.name || ''}
        initialDescription={editingCategory?.description || ''}
      />
      
      {/* Artefact Product Form */}
      {showArtefactProductForm && (
        <ArtefactProductForm
          isOpen={showArtefactProductForm}
          onClose={() => {
            setShowArtefactProductForm(false);
            setCurrentArtefactProduct(undefined);
          }}
          onSubmit={currentArtefactProduct ? handleUpdateProduct : handleAddProduct}
          product={currentArtefactProduct}
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
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#A47E3B] border-t-transparent rounded-full animate-spin"></div>
    </div>}>
      <DashboardContent />
    </Suspense>
  );
} 