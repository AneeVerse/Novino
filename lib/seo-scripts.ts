/**
 * Server-side SEO Script Generators
 * These functions generate JSON-LD script tags that can be injected directly into HTML
 */

import { 
  generateOrganizationSchema, 
  generateLocalBusinessSchema,
  generateProductSchema,
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
  generateFAQSchema
} from './seo';

/**
 * Generate Organization schema script tag
 */
export function getOrganizationSchemaScript(): string {
  const organizationSchema = generateOrganizationSchema();
  const localBusinessSchema = generateLocalBusinessSchema();
  
  return `
    <script type="application/ld+json">
      ${JSON.stringify(organizationSchema, null, 2)}
    </script>
    <script type="application/ld+json">
      ${JSON.stringify(localBusinessSchema, null, 2)}
    </script>
  `;
}

/**
 * Generate Product schema script tag
 */
export function getProductSchemaScript(product: {
  name: string;
  description: string;
  image?: string;
  images?: string[];
  price?: string;
  basePrice?: string;
  category?: string;
  slug?: string;
  id?: string;
  availability?: string;
  brand?: string;
}): string {
  const productSchema = generateProductSchema(product);
  
  return `
    <script type="application/ld+json">
      ${JSON.stringify(productSchema, null, 2)}
    </script>
  `;
}

/**
 * Generate Blog schema script tag
 */
export function getBlogSchemaScript(blog: {
  title: string;
  description: string;
  image?: string;
  slug: string;
  author?: {
    name: string;
    image?: string;
  };
  publishedTime?: string;
  modifiedTime?: string;
  content?: string;
}): string {
  const blogSchema = generateBlogPostingSchema(blog);
  
  return `
    <script type="application/ld+json">
      ${JSON.stringify(blogSchema, null, 2)}
    </script>
  `;
}

/**
 * Generate Breadcrumb schema script tag
 */
export function getBreadcrumbSchemaScript(items: Array<{ name: string; url: string }>): string {
  const breadcrumbSchema = generateBreadcrumbSchema(items);
  
  return `
    <script type="application/ld+json">
      ${JSON.stringify(breadcrumbSchema, null, 2)}
    </script>
  `;
}

/**
 * Generate FAQ schema script tag
 */
export function getFAQSchemaScript(faqs: Array<{ question: string; answer: string }>): string {
  if (!faqs || faqs.length === 0) {
    return '';
  }
  
  const faqSchema = generateFAQSchema(faqs);
  
  return `
    <script type="application/ld+json">
      ${JSON.stringify(faqSchema, null, 2)}
    </script>
  `;
}

