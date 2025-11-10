/**
 * SEO Utility Functions
 * Provides helper functions for generating SEO metadata and schema markup
 */

export const SITE_NAME = 'Novino.io';
export const SITE_DESCRIPTION = 'Elevate ordinary walls with extraordinary galleries. Discover unique art pieces, paintings, and artefacts.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://novino.io');
export const SITE_IMAGE = `${SITE_URL}/images/og-image.png`;

export interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * Generate default metadata for pages
 */
export function generateMetadata(config: SEOConfig = {}) {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    tags = [],
    noindex = false,
    nofollow = false,
  } = config;

  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageDescription = description || SITE_DESCRIPTION;
  const pageImage = image || SITE_IMAGE;
  const pageUrl = url || SITE_URL;

  const metadata: any = {
    title: pageTitle,
    description: pageDescription,
    keywords: tags.length > 0 ? tags.join(', ') : 'art gallery, paintings, artefacts, art collection, contemporary art, fine art',
    authors: [{ name: author || SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: pageUrl,
      siteName: SITE_NAME,
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: '@novino',
      site: '@novino',
    },
    alternates: {
      canonical: pageUrl,
    },
  };

  if (publishedTime) {
    metadata.publishedTime = publishedTime;
  }

  if (modifiedTime) {
    metadata.modifiedTime = modifiedTime;
  }

  return metadata;
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 200,
      height: 60,
    },
    description: SITE_DESCRIPTION,
    sameAs: [
      // Add social media links here
      // 'https://www.facebook.com/novino',
      // 'https://www.instagram.com/novino',
      // 'https://www.twitter.com/novino',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };
}

/**
 * Generate LocalBusiness schema (if applicable)
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}#organization`,
    name: SITE_NAME,
    image: SITE_IMAGE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: process.env.NEXT_PUBLIC_BUSINESS_STREET || 'Online Art Gallery',
      addressLocality: process.env.NEXT_PUBLIC_BUSINESS_CITY || 'Global',
      addressRegion: process.env.NEXT_PUBLIC_BUSINESS_REGION || '',
      postalCode: process.env.NEXT_PUBLIC_BUSINESS_POSTAL || '',
      addressCountry: process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || 'US',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Global',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };
}

/**
 * Generate Product schema
 */
export function generateProductSchema(product: {
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
}) {
  const productUrl = product.slug 
    ? `${SITE_URL}/product/${product.slug}`
    : product.id 
    ? `${SITE_URL}/product/${product.id}`
    : SITE_URL;

  const productImage = product.images?.[0] || product.image || SITE_IMAGE;
  const price = product.basePrice || product.price || '0';
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images || (product.image ? [product.image] : [SITE_IMAGE]),
    url: productUrl,
    sku: product.id || product.slug,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE_NAME,
    },
    category: product.category || 'Art',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: numericPrice,
      availability: product.availability || 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/**
 * Generate BlogPosting schema
 */
export function generateBlogPostingSchema(blog: {
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
}) {
  const blogUrl = `${SITE_URL}/blogs/${blog.slug}`;
  const blogImage = blog.image || SITE_IMAGE;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    name: blog.title,
    description: blog.description,
    url: blogUrl,
    image: {
      '@type': 'ImageObject',
      url: blogImage,
      width: 1200,
      height: 630,
    },
    datePublished: blog.publishedTime || new Date().toISOString(),
    dateModified: blog.modifiedTime || blog.publishedTime || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: blog.author?.name || SITE_NAME,
      image: blog.author?.image,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': blogUrl,
    },
    articleSection: 'Art & Culture',
    keywords: 'art, gallery, paintings, artefacts, art collection',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

