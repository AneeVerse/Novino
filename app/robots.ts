import { MetadataRoute } from 'next';

/**
 * robots.ts - Search Engine Crawler Configuration
 * 
 * This file generates robots.txt that tells search engines which pages
 * they can and cannot crawl/index on your website.
 * 
 * What it does:
 * - Allows search engines to index public pages (homepage, products, blogs)
 * - Blocks private areas (admin, dashboard, user profiles, API routes)
 * - Prevents indexing of sensitive pages (checkout, cart, payment)
 * - Points crawlers to your sitemap.xml for better SEO
 * 
 * Best Practices Applied:
 * ✅ Blocks all private/user routes
 * ✅ Blocks API endpoints
 * ✅ Blocks authentication pages
 * ✅ Blocks checkout/payment flows
 * ✅ Includes sitemap reference
 * ✅ Environment-aware URL handling
 */

// Get the site URL from environment variables with proper fallback
const getSiteUrl = (): string => {
  // Priority: NEXT_PUBLIC_SITE_URL > NEXT_PUBLIC_VERCEL_URL > default
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  // Default fallback for production
  return 'https://novino.io';
};

const SITE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Default rule for all search engines
        userAgent: '*',
        allow: '/',
        disallow: [
          // Private user areas
          '/dashboard',
          '/dashboard-v2',
          '/admin',
          '/profile',
          
          // Authentication pages (shouldn't be indexed)
          '/login',
          '/signup',
          '/auth',
          
          // Shopping cart & checkout (sensitive user data)
          '/cart',
          '/checkout',
          '/payment',
          
          // API endpoints (no need to index)
          '/api',
          
          // Internal/testing pages
          '/demo',
          '/shiprocket',
          
          // User-generated content that shouldn't be indexed
          '/vcard',
        ],
      },
      {
        // Specific rules for Googlebot (can be more lenient if needed)
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard-v2',
          '/admin',
          '/api',
          '/cart',
          '/checkout',
          '/payment',
          '/profile',
          '/login',
          '/signup',
          '/auth',
        ],
      },
      {
        // Block bad bots and scrapers
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MJ12bot',
          'Baiduspider',
        ],
        disallow: '/',
      },
    ],
    // Point search engines to your sitemap for better crawling
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

