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
import { TrendingUp, TrendingDown, FileText, MessageSquare, Image as ImageIcon, Package, Eye, Calendar, Clock, Plus, Edit, Trash2, ExternalLink, Star, Users } from 'lucide-react';
import ArtefactCategoryModal from '@/components/artefact-category-modal';
import ArtefactCategoryGrid from '@/components/artefact-category-grid';
import ArtefactCategoryDetail from '@/components/artefact-category-detail';
import ArtefactProductForm from '@/components/artefact-product-form';
import { ArtefactCategory, ArtefactProduct } from '@/app/dashboard/models/artefact';
import type { ShiprocketOrder } from '@/lib/services/shiprocket';

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
  yesterdaysOrders?: number;
  newOrders?: number;
  totalRevenue: number;
  todayRevenue?: number;
  yesterdayRevenue?: number;
  averageOrderValue: number;
  fetchedAt: string;
}

interface ShiprocketSalesPoint {
  date: string;
  label: string;
  totalRevenue: number;
  orderCount: number;
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

const buildShiprocketSalesSeries = (
  orders: ShiprocketOrder[] = [],
  range: { from: string; to: string }
): ShiprocketSalesPoint[] => {
  if (!range.from || !range.to) return [];

  const accumulator = orders.reduce<Record<string, ShiprocketSalesPoint>>((acc, order) => {
    const rawDate =
      (typeof order.created_at === 'string' && order.created_at) ||
      (typeof order.order_date === 'string' && order.order_date);
    if (!rawDate) {
      return acc;
    }
    const dayKey = rawDate.slice(0, 10);
    if (!dayKey) {
      return acc;
    }
    const totalValue = Number(order.total ?? order.sub_total ?? 0);
    const safeValue = Number.isFinite(totalValue) ? totalValue : 0;

    if (!acc[dayKey]) {
      acc[dayKey] = {
        date: dayKey,
        label: new Date(`${dayKey}T00:00:00`).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        totalRevenue: 0,
        orderCount: 0,
      };
    }

    acc[dayKey].totalRevenue = Number((acc[dayKey].totalRevenue + safeValue).toFixed(2));
    acc[dayKey].orderCount += 1;
    return acc;
  }, {});

  const series: ShiprocketSalesPoint[] = [];
  const start = new Date(`${range.from}T00:00:00`);
  const end = new Date(`${range.to}T00:00:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return Object.values(accumulator).sort((a, b) => a.date.localeCompare(b.date));
  }

  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const key = cursor.toISOString().slice(0, 10);
    const entry = accumulator[key];
    series.push(
      entry ?? {
        date: key,
        label: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalRevenue: 0,
        orderCount: 0,
      }
    );
  }

  return series;
};

function DashboardContent() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [paintings, setPaintings] = useState<Product[]>([]);
  const [artefacts, setArtefacts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; type: 'painting' | 'artefact' }[]>([]);
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
  const [activeTab, setActiveTab] = useState(tabParam || 'home');

  // Update activeTab when URL parameter changes
  useEffect(() => {
    if (searchParams) {
      setActiveTab(searchParams.get('tab') || 'home');
    }
  }, [searchParams]);

  const shiprocketRangePresets = [
    { label: '1d', days: 1 },
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
    const safeDays = Math.max(1, Math.floor(days));
    const to = new Date();
    const from = new Date();
    // Inclusive range: today counts as day 1
    from.setDate(from.getDate() - (safeDays - 1));
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      label: `Last ${safeDays} day${safeDays === 1 ? '' : 's'}`,
      days: safeDays,
    };
  };

  const [shiprocketRange, setShiprocketRange] = useState(() => makeRange(1));
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customFromDate, setCustomFromDate] = useState(makeRange(1).from);
  const [customToDate, setCustomToDate] = useState(makeRange(1).to);

  const handleCustomDateApply = () => {
    if (customFromDate && customToDate) {
      setShiprocketRange({
        from: customFromDate,
        to: customToDate,
        label: 'Custom range',
      });
      setShowCustomDatePicker(false);
    }
  };

  const [shiprocketMetrics, setShiprocketMetrics] = useState<ShiprocketOverviewMetrics | null>(null);
  const [shiprocketMetricsLoading, setShiprocketMetricsLoading] = useState(true);
  const [shiprocketMetricsError, setShiprocketMetricsError] = useState<string | null>(null);
  const [shiprocketSalesSeries, setShiprocketSalesSeries] = useState<ShiprocketSalesPoint[]>([]);
  const [shiprocketSalesLoading, setShiprocketSalesLoading] = useState(true);
  const [shiprocketSalesError, setShiprocketSalesError] = useState<string | null>(null);

  // Fixed metrics for Summary cards (always shows today/yesterday, not affected by date range)
  const [summaryMetrics, setSummaryMetrics] = useState<ShiprocketOverviewMetrics | null>(null);
  const [summaryMetricsLoading, setSummaryMetricsLoading] = useState(true);

  // Fixed metrics for Total counts (shows all-time totals, not affected by date range)
  const [totalMetrics, setTotalMetrics] = useState<ShiprocketOverviewMetrics | null>(null);
  const [totalMetricsLoading, setTotalMetricsLoading] = useState(true);

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

  // Fetch fixed metrics for Summary cards (always today/yesterday) and all-time totals
  // These are NOT affected by the date range selector
  useEffect(() => {
    let isMounted = true;

    const fetchFixedMetrics = async () => {
      setSummaryMetricsLoading(true);
      setTotalMetricsLoading(true);

      // Calculate date range for last 2 days (to capture today and yesterday)
      const today = new Date();
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      // Calculate date range for all-time (use a very early date like 1 year ago)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      try {
        // Fetch summary metrics (last 2 days for today/yesterday values)
        const summaryParams = new URLSearchParams({
          from: twoDaysAgo.toISOString().slice(0, 10),
          to: today.toISOString().slice(0, 10),
        });

        const summaryResponse = await fetch(`/api/shiprocket/overview?${summaryParams.toString()}`, {
          cache: 'no-store',
        });

        if (summaryResponse.ok) {
          const summaryPayload = await summaryResponse.json();
          if (isMounted) {
            setSummaryMetrics(summaryPayload.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch summary metrics:', err);
      } finally {
        if (isMounted) {
          setSummaryMetricsLoading(false);
        }
      }

      try {
        // Fetch total metrics (all-time values)
        const totalParams = new URLSearchParams({
          from: oneYearAgo.toISOString().slice(0, 10),
          to: today.toISOString().slice(0, 10),
        });

        const totalResponse = await fetch(`/api/shiprocket/overview?${totalParams.toString()}`, {
          cache: 'no-store',
        });

        if (totalResponse.ok) {
          const totalPayload = await totalResponse.json();
          if (isMounted) {
            setTotalMetrics(totalPayload.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch total metrics:', err);
      } finally {
        if (isMounted) {
          setTotalMetricsLoading(false);
        }
      }
    };

    fetchFixedMetrics();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency - only runs once on mount

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

        console.log('📊 Fetching Shiprocket data:', {
          from: shiprocketRange.from,
          to: shiprocketRange.to,
          label: shiprocketRange.label,
          url: `/api/shiprocket/overview?${params.toString()}`
        });

        const response = await fetch(`/api/shiprocket/overview?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to load Shiprocket overview');
        }

        const payload = await response.json();
        console.log('📈 Shiprocket metrics received:', payload.data);
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

    const fetchShiprocketSales = async () => {
      setShiprocketSalesLoading(true);
      setShiprocketSalesError(null);
      try {
        const params = new URLSearchParams({
          from: shiprocketRange.from,
          to: shiprocketRange.to,
          perPage: '200',
        });

        const response = await fetch(`/api/shiprocket/orders?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to load Shiprocket sales data');
        }

        const payload = await response.json();
        if (!isMounted) return;
        setShiprocketSalesSeries(buildShiprocketSalesSeries(payload.data ?? [], shiprocketRange));
      } catch (err) {
        if (!isMounted) return;
        setShiprocketSalesError(
          err instanceof Error ? err.message : 'Unable to load Shiprocket sales data'
        );
        setShiprocketSalesSeries([]);
      } finally {
        if (!isMounted) return;
        setShiprocketSalesLoading(false);
      }
    };

    fetchShiprocketMetrics();
    fetchShiprocketSales();

    return () => {
      isMounted = false;
    };
  }, [shiprocketRange.from, shiprocketRange.to]);

  const handleShiprocketRangeChange = (days: number) => {
    const next = makeRange(days);
    setShiprocketRange(next);
    setCustomFromDate(next.from);
    setCustomToDate(next.to);
  };

  // Fetch artefact categories
  const fetchArtefactCategories = async () => {
    try {
      const response = await fetch('/api/artefact-categories');
      if (response.ok) {
        const data = await response.json();
        // Map snake_case from database to camelCase for frontend
        const mappedData = data.map((cat: any) => {
          // Convert legacy fields to details array if details doesn't exist
          let details = cat.details || [];
          if (!details || !Array.isArray(details) || details.length === 0) {
            // Convert legacy fields to details format
            details = [];
            if (cat.size) details.push({ label: 'Size', value: cat.size });
            if (cat.thickness) details.push({ label: 'Thickness', value: cat.thickness });
            if (cat.frame) details.push({ label: 'Frame', value: cat.frame });
            if (cat.structure) details.push({ label: 'Structure', value: cat.structure });
            if (cat.material) details.push({ label: 'Material', value: cat.material });
            if (cat.care_guide || cat.careGuide) details.push({ label: 'Care Guide', value: cat.care_guide || cat.careGuide });
            if (cat.measurement) details.push({ label: 'Measurement', value: cat.measurement });
            if (cat.gsm) details.push({ label: 'GSM', value: cat.gsm });
          }

          return {
            ...cat,
            id: cat.id || cat._id,
            _id: cat._id || cat.id,
            details: details,
            length: cat.length || 0,
            width: cat.width || 0,
            breadth: cat.breadth || 0,
            height: cat.height || 0,
            weight: cat.weight || 0,
            createdAt: cat.created_at || cat.createdAt,
            updatedAt: cat.updated_at || cat.updatedAt,
          };
        });
        setArtefactCategories(sortCategoriesByOrder(mappedData));
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
  const handleSaveCategory = async (name: string, description: string, details?: Array<{ label: string, value: string }>, length?: string, width?: string, breadth?: string, height?: string, weight?: string) => {
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
            details: details || [],
            length: length ? parseFloat(length) : 0,
            width: width ? parseFloat(width) : 0,
            breadth: breadth ? parseFloat(breadth) : 0,
            height: height ? parseFloat(height) : 0,
            weight: weight ? parseFloat(weight) : 0,
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
          body: JSON.stringify({
            name,
            description,
            details: details || [],
            length: length ? parseFloat(length) : 0,
            width: width ? parseFloat(width) : 0,
            breadth: breadth ? parseFloat(breadth) : 0,
            height: height ? parseFloat(height) : 0,
            weight: weight ? parseFloat(weight) : 0,
          }),
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

    // Log to verify testimonialImage is being received
    console.log('Updating product with data:', {
      testimonialImage: productData.testimonialImage,
      hasTestimonialImage: 'testimonialImage' in productData
    });

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
  const shiprocketSalesTotal = shiprocketSalesSeries.reduce((sum, point) => sum + point.totalRevenue, 0);

  return (
    <div className="space-y-6">
      {/* Content sections based on activeTab */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Home</h1>
              <p className="text-white/60">Quick overview of your business metrics</p>
            </div>
            <div className="relative flex flex-col items-end gap-2">
              <button
                onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                className="flex items-center gap-2 text-white/60 hover:text-white text-sm cursor-pointer transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {shiprocketRange.label === 'Custom range'
                    ? `${shiprocketRange.from} to ${shiprocketRange.to}`
                    : `${shiprocketRange.label} (${shiprocketRange.from} -> ${shiprocketRange.to})`}
                </span>
              </button>

              {/* Quick presets (always visible) */}
              <div className="flex flex-wrap gap-2 justify-end">
                      {shiprocketRangePresets.map((preset) => (
                        <button
                          key={preset.label}
                    onClick={() => handleShiprocketRangeChange(preset.days)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${shiprocketRange.days === preset.days
                      ? 'bg-white text-black shadow-md shadow-white/20'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                            }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

              {/* Date Picker Dropdown */}
              {showCustomDatePicker && (
                <div className="absolute right-0 top-full mt-2 bg-[#2A2A2A] border border-white/20 rounded-xl p-4 z-50 shadow-xl min-w-[280px]">
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-white/80 mb-2">Select Date Range</div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-white/60 block mb-1">From</label>
                        <input
                          type="date"
                          value={customFromDate}
                          onChange={(e) => setCustomFromDate(e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 block mb-1">To</label>
                        <input
                          type="date"
                          value={customToDate}
                          onChange={(e) => setCustomToDate(e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCustomDatePicker(false)}
                        className="flex-1 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCustomDateApply}
                        disabled={!customFromDate || !customToDate}
                        className="flex-1 px-3 py-2 text-sm bg-[#A47E3B] hover:bg-[#8d6c58] disabled:bg-white/10 disabled:text-white/40 rounded-lg text-white font-medium transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Orders Card */}
              <Card
                onClick={() => router.push('/dashboard/orders')}
                className="bg-white/5 border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                      <Package className="w-6 h-6 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-3">Orders</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">
                            {shiprocketRange.days === 1 ? 'Today' : 'Range total'}
                          </span>
                          <span className="text-2xl font-bold text-white">
                            {shiprocketRange.days === 1
                              ? shiprocketMetrics?.todaysOrders ?? shiprocketMetrics?.totalOrders ?? 0
                              : shiprocketMetrics?.totalOrders ?? 0}
                          </span>
                        </div>
                        {shiprocketRange.days === 1 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">Yesterday</span>
                            <span className="text-xl font-semibold text-white/70">
                              {shiprocketMetrics?.yesterdaysOrders ?? 0}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Card */}
              <Card
                onClick={() => router.push('/dashboard/orders')}
                className="bg-white/5 border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-cyan-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-3">Revenue</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">
                            {shiprocketRange.days === 1 ? 'Today' : 'Range total'}
                          </span>
                          <span className="text-2xl font-bold text-white">
                            {formatCurrency(
                              shiprocketRange.days === 1
                                ? shiprocketMetrics?.todayRevenue ?? shiprocketMetrics?.totalRevenue ?? 0
                                : shiprocketMetrics?.totalRevenue ?? 0
                            )}
                          </span>
                        </div>
                        {shiprocketRange.days === 1 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">Yesterday</span>
                            <span className="text-xl font-semibold text-white/70">
                              {formatCurrency(shiprocketMetrics?.yesterdayRevenue ?? 0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Average Order Value Card */}
              <Card
                onClick={() => router.push('/dashboard/orders')}
                className="bg-white/5 border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-emerald-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-3">Avg Order Value</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">Current</span>
                          <span className="text-2xl font-bold text-white">
                            {formatCurrency(shiprocketMetrics?.averageOrderValue ?? 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">Period Total</span>
                          <span className="text-xl font-semibold text-white/70">
                            {formatCurrency(shiprocketMetrics?.totalRevenue ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions Needing Attention */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Actions Needing Your Attention Today</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* New Orders to Process */}
              <Card
                onClick={() => router.push('/dashboard/orders')}
                className="bg-white/5 border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                      <Package className="w-6 h-6 text-green-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white/60 mb-2">New Orders to be Processed</h3>
                      <p className="text-4xl font-bold text-white">
                        {totalMetrics?.newOrders ?? 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Orders in Period */}
              <Card
                onClick={() => router.push('/dashboard/orders')}
                className="bg-white/5 border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-xl">
                      <Clock className="w-6 h-6 text-orange-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white/60 mb-2">Total Orders</h3>
                      <p className="text-4xl font-bold text-white">
                        {totalMetrics?.totalOrders ?? 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prepaid Orders Only */}
              <Card
                onClick={() => router.push('/dashboard/orders')}
                className="bg-white/5 border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                      <Package className="w-6 h-6 text-green-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-3">Prepaid Orders</h3>
                      <p className="text-3xl font-bold text-white">
                        {totalMetrics?.prepaidOrders ?? 0}
                      </p>
                      <p className="text-sm text-white/50 mt-1">All orders are prepaid</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

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
              <span>
                {shiprocketRange.label === 'Custom range'
                  ? `${shiprocketRange.from} to ${shiprocketRange.to}`
                  : `${shiprocketRange.label} (${shiprocketRange.from} -> ${shiprocketRange.to})`}
              </span>
            </div>
          </div>

          {/* Shiprocket Overview - MOVED TO TOP */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#1E1E1E] via-[#171717] to-[#121212] border border-white/5 rounded-2xl p-6 shadow-[0px_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                <div className="flex-1 space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.35em] text-white/40 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A47E3B] animate-pulse" />
                    Orders
                  </div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-semibold text-white">Shipments dashboard</h2>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 border border-white/10 text-white/60">
                      Live
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    Synced{' '}
                    {shiprocketMetrics?.fetchedAt
                      ? new Date(shiprocketMetrics.fetchedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                      : 'just now'}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3">
                  <div className="flex flex-wrap items-center gap-2 relative">
                    {shiprocketRangePresets.map((preset) => {
                      const isActive = shiprocketRange.days === preset.days;
                      return (
                        <button
                          key={preset.label}
                          onClick={() => handleShiprocketRangeChange(preset.days)}
                          className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${isActive
                            ? 'bg-white text-black shadow-lg shadow-white/30'
                            : 'bg-white/10 text-white/70 border border-white/10 hover:text-white hover:bg-white/15'
                            }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                    {/* Calendar Date Picker Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                        className={`p-2 rounded-2xl transition-all duration-200 ${shiprocketRange.label === 'Custom range'
                          ? 'bg-white text-black shadow-lg shadow-white/30'
                          : 'bg-white/10 text-white/70 border border-white/10 hover:text-white hover:bg-white/15'
                          }`}
                        title="Custom date range"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>

                      {/* Calendar Dropdown */}
                      {showCustomDatePicker && (
                        <div className="absolute right-0 top-full mt-2 bg-[#2A2A2A] border border-white/20 rounded-xl p-4 z-50 shadow-xl min-w-[280px]">
                          <div className="space-y-4">
                            <div className="text-sm font-medium text-white/80 mb-2">Custom Date Range</div>
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs text-white/60 block mb-1">From</label>
                                <input
                                  type="date"
                                  value={customFromDate}
                                  onChange={(e) => setCustomFromDate(e.target.value)}
                                  className="w-full bg-[#1A1A1A] border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-white/60 block mb-1">To</label>
                                <input
                                  type="date"
                                  value={customToDate}
                                  onChange={(e) => setCustomToDate(e.target.value)}
                                  className="w-full bg-[#1A1A1A] border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowCustomDatePicker(false)}
                                className="flex-1 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleCustomDateApply}
                                disabled={!customFromDate || !customToDate}
                                className="flex-1 px-3 py-2 text-sm bg-[#A47E3B] hover:bg-[#8d6c58] disabled:bg-white/10 disabled:text-white/40 rounded-lg text-white font-medium transition-colors"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
                      title: 'Orders Placed',
                      value: shiprocketMetrics?.totalOrders ?? 0,
                      description: `${shiprocketRange.from} — ${shiprocketRange.to}`,
                    },
                    {
                      title: 'Delivered',
                      value: 0,
                      description: 'Completed fulfilments',
                    },
                    {
                      title: 'In Transit',
                      value: 0,
                      description: 'Moving through network',
                    },
                    {
                      title: 'Revenue',
                      value: shiprocketMetrics ? formatCurrency(shiprocketMetrics.totalRevenue) : 0,
                      description: `AVG ${shiprocketMetrics ? formatCurrency(shiprocketMetrics.averageOrderValue) : '₹0'}`,
                      isCurrency: true,
                    },
                  ].map((stat) => (
                    <Card
                      key={stat.title}
                      onClick={() => router.push('/dashboard/orders')}
                      className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/60 hover:border-white/10 hover:bg-white/5 transition-all duration-300 cursor-pointer"
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
              </div>
            </div>
          </div>

          {/* Shiprocket Sales Performance - MOVED BELOW */}
          <Card className="bg-[#111111] border border-white/5 rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.45)]">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-white text-2xl">Sales performance</CardTitle>
                <CardDescription className="text-white/60">
                  Shiprocket revenue • {new Date(shiprocketRange.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(shiprocketRange.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </CardDescription>
              </div>
              <div className="text-sm text-white/60">
                <span className="font-medium text-white">Last sync:</span>{' '}
                {shiprocketMetrics?.fetchedAt
                  ? new Date(shiprocketMetrics.fetchedAt).toLocaleString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })
                  : '—'}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Total revenue',
                    value:
                      shiprocketMetrics && !shiprocketSalesLoading
                        ? formatCurrency(shiprocketMetrics.totalRevenue)
                        : shiprocketSalesLoading
                          ? 'Loading…'
                          : formatCurrency(shiprocketSalesTotal),
                    helper: 'Gross sales for the selected range',
                  },
                  {
                    label: 'Average order value',
                    value: shiprocketMetrics ? formatCurrency(shiprocketMetrics.averageOrderValue) : '—',
                    helper: 'Across Shiprocket orders',
                  },
                  {
                    label: 'Orders counted',
                    value: shiprocketSalesLoading
                      ? '—'
                      : shiprocketSalesSeries.reduce((sum, point) => sum + point.orderCount, 0).toLocaleString(),
                    helper: 'Orders contributing to sales',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-wide text-white/50">{stat.label}</p>
                    <p className="text-3xl font-semibold text-white mt-2">{stat.value}</p>
                    <p className="text-xs text-white/40 mt-1">{stat.helper}</p>
                  </div>
                ))}
              </div>
              {shiprocketSalesError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {shiprocketSalesError}
                </div>
              ) : shiprocketSalesLoading && shiprocketSalesSeries.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-white/40 text-sm">
                  Loading Shiprocket sales…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={shiprocketSalesSeries}>
                    <defs>
                      <linearGradient id="shiprocketSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A47E3B" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#A47E3B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" opacity={0.6} />
                    <XAxis dataKey="label" stroke="#8D8D8D" tickLine={false} />
                    <YAxis
                      stroke="#8D8D8D"
                      tickFormatter={(value) => formatCurrency(value as number).replace('₹', '₹ ')}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1C1C1C',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      labelStyle={{ color: '#A47E3B' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalRevenue"
                      stroke="#F6C76A"
                      strokeWidth={2.4}
                      fillOpacity={1}
                      fill="url(#shiprocketSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Blogs Card */}
            <Card
              onClick={() => navigateToTab('blogs')}
              className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40 hover:border-white/15 hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                    Total Blogs
                  </CardTitle>
                  <div className="p-2 bg-blue-500/15 border border-blue-500/20 rounded-xl">
                    <FileText className="w-4 h-4 text-blue-300" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-white">{blogs.length}</div>
                  <Badge className="bg-white/5 text-white/70 border border-white/10">
                    <TrendingUp className="w-3 h-3 mr-1 text-emerald-300" />
                    Live
                  </Badge>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToTab('blogs');
                  }}
                  className="mt-4 w-full px-3 py-2 border border-white/10 hover:border-white/30 text-white/80 hover:text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Manage Blogs
                  <ExternalLink className="w-3 h-3" />
                </button>
              </CardContent>
            </Card>

            {/* Testimonials Card */}
            <Card
              onClick={() => navigateToTab('testimonials')}
              className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40 hover:border-white/15 hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                    Testimonials
                  </CardTitle>
                  <div className="p-2 bg-purple-500/15 border border-purple-500/20 rounded-xl">
                    <MessageSquare className="w-4 h-4 text-purple-300" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-white">{testimonials.length}</div>
                  <Badge className="bg-white/5 text-white/70 border border-white/10">
                    <TrendingUp className="w-3 h-3 mr-1 text-emerald-300" />
                    Live
                  </Badge>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToTab('testimonials');
                  }}
                  className="mt-4 w-full px-3 py-2 border border-white/10 hover:border-white/30 text-white/80 hover:text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Manage Testimonials
                  <ExternalLink className="w-3 h-3" />
                </button>
              </CardContent>
            </Card>

            {/* Products Card */}
            <Card
              onClick={() => navigateToTab('products')}
              className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40 hover:border-white/15 hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                    Products
                  </CardTitle>
                  <div className="p-2 bg-emerald-500/15 border border-emerald-500/20 rounded-xl">
                    <Package className="w-4 h-4 text-emerald-300" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-white">{artefactCategories.reduce((sum, cat) => sum + (cat.products?.length || 0), 0)}</div>
                  <Badge className="bg-white/5 text-white/70 border border-white/10">
                    <TrendingUp className="w-3 h-3 mr-1 text-emerald-300" />
                    Live
                  </Badge>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToTab('products');
                  }}
                  className="mt-4 w-full px-3 py-2 border border-white/10 hover:border-white/30 text-white/80 hover:text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  View Products
                  <ExternalLink className="w-3 h-3" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* User Statistics Section */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                onClick={() => router.push('/dashboard/users')}
                className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40 hover:border-white/15 hover:bg-white/5 transition-all duration-300 cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                      Active Users
                    </CardTitle>
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                      <Users className="w-4 h-4 text-emerald-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-semibold text-white tracking-tight">6</div>
                  <p className="text-sm mt-2 text-emerald-300">Currently active</p>
                </CardContent>
              </Card>

              <Card
                onClick={() => router.push('/dashboard/users')}
                className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40 hover:border-white/15 hover:bg-white/5 transition-all duration-300 cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                      Blocked Users
                    </CardTitle>
                    <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                      <Users className="w-4 h-4 text-rose-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-semibold text-white tracking-tight">0</div>
                  <p className="text-sm mt-2 text-rose-300">Account suspended</p>
                </CardContent>
              </Card>

              <Card
                onClick={() => router.push('/dashboard/users')}
                className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40 hover:border-white/15 hover:bg-white/5 transition-all duration-300 cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                      Total Users
                    </CardTitle>
                    <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30">
                      <Users className="w-4 h-4 text-sky-300" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-semibold text-white tracking-tight">6</div>
                  <p className="text-sm mt-2 text-sky-300">All registered</p>
                </CardContent>
              </Card>
            </div>

            {/* User Statistics Chart */}
            <Card className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40">
              <CardHeader>
                <CardTitle className="text-white">User Statistics</CardTitle>
                <CardDescription className="text-white/60">Distribution of user statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Active', value: 6, fill: '#4CAF50' },
                        { name: 'Blocked', value: 0, fill: '#F44336' }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                      <XAxis dataKey="name" tick={{ fill: '#A0A0A0' }} axisLine={{ stroke: '#2a2a2a' }} tickLine={false} />
                      <YAxis tick={{ fill: '#A0A0A0' }} axisLine={{ stroke: '#2a2a2a' }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1C1C1C',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {[
                          { name: 'Active', value: 6, fill: '#4CAF50' },
                          { name: 'Blocked', value: 0, fill: '#F44336' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Chart */}
            <Card className="lg:col-span-2 bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40">
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
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTestimonials" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
            <Card className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40">
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
        initialDetails={(editingCategory as any)?.details || []}
        initialLength={editingCategory?.length?.toString() || ''}
        initialWidth={editingCategory?.width?.toString() || ''}
        initialBreadth={editingCategory?.breadth?.toString() || ''}
        initialHeight={editingCategory?.height?.toString() || ''}
        initialWeight={editingCategory?.weight?.toString() || ''}
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