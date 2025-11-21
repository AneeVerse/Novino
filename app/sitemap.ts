import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/db';
import Blog from '@/models/Blog';
import { getProductUrl } from '@/lib/utils';
import getSupabaseAdmin from '@/lib/supabase-admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'https://novino.io';

const supabase = getSupabaseAdmin();

const serializeStandaloneProduct = (product: any) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  category: product.category,
  type: product.type,
  createdAt: product.created_at ?? product.createdAt,
  updatedAt: product.updated_at ?? product.updatedAt,
});

const flattenCategoryProducts = (categories: any[]) =>
  categories.flatMap((category) =>
    (Array.isArray(category.products) ? category.products : []).map((product: any) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: category.name,
      type: 'artefact' as const,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt ?? product.createdAt,
    }))
  );

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/paintings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/artefacts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/journey`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Dynamic routes - Products
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    // All products are now in product_categories table
    const { data, error } = await supabase
      .from('product_categories')
      .select('id, name, products');

    if (error) {
      throw error;
    }

    const categoryProducts = flattenCategoryProducts(data ?? []);
    const combined = categoryProducts;

    productRoutes = combined.map((product) => {
      const productPath = getProductUrl({
        id: product.id,
        slug: product.slug ?? undefined,
        category: product.category,
        name: product.name,
        title: product.name,
        type: product.type,
      });
      return {
        url: `${baseUrl}${productPath}`,
        lastModified: product.updatedAt
          ? new Date(product.updatedAt)
          : product.createdAt
            ? new Date(product.createdAt)
            : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // Dynamic routes - Blogs
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectToDatabase();
    const blogs = await Blog.find({}).select('slug updatedAt createdAt').lean();
    
    blogRoutes = blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt ? new Date(blog.updatedAt) : blog.createdAt ? new Date(blog.createdAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}

