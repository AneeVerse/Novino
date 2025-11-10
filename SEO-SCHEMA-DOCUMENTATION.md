# SEO Schema Documentation

## Overview
This document provides a comprehensive overview of all SEO schema implementations in the Easy Visa website. The project uses structured data (JSON-LD) to enhance search engine visibility and rich results.

## Schema Types Implemented

### 1. LocalBusiness Schema
- **Type**: `LocalBusiness` (inherits from Organization)
- **File**: `src/components/seo/OrganizationSchema.jsx`
- **Usage**: Global (site-wide)
- **Integration**: `src/app/layout.js`

### 2. BreadcrumbList Schema
- **Type**: `BreadcrumbList`
- **File**: `src/components/seo/BreadcrumbSchema.jsx`
- **Usage**: Global (site-wide)
- **Integration**: `src/app/layout.js`

### 3. BlogPosting Schema
- **Type**: `BlogPosting`
- **File**: `src/components/seo/BlogSchema.jsx`
- **Usage**: Blog post pages only
- **Integration**: `src/app/(home)/(dynamic)/blogs/[slug]/page.js`

### 4. FAQPage Schema
- **Type**: `FAQPage`
- **File**: `src/components/seo/FAQSchema.jsx`
- **Usage**: Blog post pages (conditional)
- **Integration**: `src/app/(home)/(dynamic)/blogs/[slug]/page.js`

## Global Schemas (Site-wide)

### LocalBusiness Schema
**Location**: `src/components/seo/OrganizationSchema.jsx`

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Easy Visa",
  "alternateName": "Eazyvisas",
  "description": "Easy visa offers a range of visa consulting services to businesses, families and individuals. We partner with our clients from start to finish, focusing on their needs while developing effective strategies and solutions.",
  "url": "https://www.eazyvisas.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.eazyvisas.com/logo/main-logo.png",
    "width": 200,
    "height": 60
  },
  "telephone": "+91 88501 46905",
  "email": "info@eazyvisas.com",
  "foundingDate": "2020",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "61, CITI TOWER, SECTOR 15, CBD BELAPUR",
    "addressLocality": "NAVI MUMBAI",
    "addressRegion": "MAHARASHTRA",
    "postalCode": "400614",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "19.0176",
    "longitude": "73.0286"
  },
  "areaServed": [
    {
      "@type": "Country",
      "name": "India"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Global"
    }
  ],
  "serviceType": [
    "Visa Consulting Services",
    "Immigration Services",
    "Travel Documentation",
    "Visa Application Processing",
    "Business Visa Services",
    "Tourist Visa Services",
    "Student Visa Services"
  ],
  "priceRange": "$$",
  "currenciesAccepted": ["INR", "USD"],
  "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer"],
  "openingHours": "Mo-Sa 09:00-18:00",
  "sameAs": [
    "https://www.instagram.com/eazyvisas/?__pwa=1",
    "https://www.eazyvisas.com"
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+91 88501 46905",
      "contactType": "customer service",
      "email": "info@eazyvisas.com",
      "availableLanguage": ["English", "Hindi"],
      "areaServed": "IN"
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Visa Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Tourist Visa Services",
          "description": "Complete tourist visa application and processing services"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Business Visa Services",
          "description": "Business visa consultation and application services"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Student Visa Services",
          "description": "Student visa guidance and application processing"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Dummy Flight Booking",
          "description": "Temporary flight reservations for visa applications"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Dummy Hotel Booking",
          "description": "Temporary hotel reservations for visa applications"
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  },
  "knowsAbout": [
    "Visa Requirements",
    "Immigration Law",
    "Travel Documentation",
    "Schengen Visa",
    "Dubai Visa",
    "US Visa",
    "UK Visa",
    "Canada Visa"
  ]
}
```

### BreadcrumbList Schema
**Location**: `src/components/seo/BreadcrumbSchema.jsx`

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.eazyvisas.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://www.eazyvisas.com/services"
    }
  ]
}
```

## Page-Specific Schemas

### BlogPosting Schema
**Location**: `src/components/seo/BlogSchema.jsx`
**Used on**: Blog post pages (`/blogs/[slug]`)

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Blog Post Title",
  "name": "Blog Post Title",
  "description": "Blog post meta description",
  "url": "https://www.eazyvisas.com/blogs/post-slug",
  "datePublished": "2024-01-01T00:00:00.000Z",
  "dateModified": "2024-01-01T00:00:00.000Z",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://www.eazyvisas.com/author/author-slug",
    "image": {
      "@type": "ImageObject",
      "url": "author-image-url",
      "width": 400,
      "height": 400
    },
    "description": "Author bio",
    "sameAs": [
      "https://twitter.com/author",
      "https://linkedin.com/in/author"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "name": "Easy Visa",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.eazyvisas.com/logo/main-logo.png",
      "width": 200,
      "height": 60
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.eazyvisas.com/blogs/post-slug"
  },
  "image": {
    "@type": "ImageObject",
    "url": "main-image-url",
    "width": 1200,
    "height": 630,
    "caption": "Blog Post Title"
  },
  "articleSection": "Visa Services",
  "keywords": "visa services, immigration, travel documentation",
  "wordCount": 1500,
  "timeRequired": "PT8M",
  "inLanguage": "en-US",
  "isAccessibleForFree": true,
  "genre": "Travel and Immigration",
  "audience": {
    "@type": "Audience",
    "audienceType": "Travel enthusiasts, visa applicants, immigrants"
  },
  "about": [
    {
      "@type": "Thing",
      "name": "Category Name",
      "description": "Information about Category Name"
    }
  ]
}
```

### FAQPage Schema
**Location**: `src/components/seo/FAQSchema.jsx`
**Used on**: Blog post pages (when FAQ data exists)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "Blog Title - Frequently Asked Questions",
  "description": "Common questions and answers about Blog Title",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the visa processing time?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The visa processing time varies by country and visa type...",
        "dateCreated": "2024-01-01T00:00:00.000Z",
        "upvoteCount": 25,
        "author": {
          "@type": "Organization",
          "name": "Easy Visa"
        }
      },
      "answerCount": 1,
      "upvoteCount": 45,
      "dateCreated": "2024-01-01T00:00:00.000Z",
      "author": {
        "@type": "Organization",
        "name": "Easy Visa"
      }
    }
  ],
  "about": {
    "@type": "Thing",
    "name": "Visa Services",
    "description": "Information and guidance about visa and immigration services"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Visa applicants, travelers, immigrants"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Easy Visa",
    "url": "https://www.eazyvisas.com"
  }
}
```

## File Locations and Usage

### Schema Components Directory
**Path**: `src/components/seo/`

- `OrganizationSchema.jsx` - LocalBusiness schema component
- `BreadcrumbSchema.jsx` - BreadcrumbList schema component  
- `BlogSchema.jsx` - BlogPosting schema component
- `FAQSchema.jsx` - FAQPage schema component
- `index.js` - Exports all schema components

### Integration Points

#### Global Layout (`src/app/layout.js`)
```javascript
import OrganizationSchema from "../components/seo/OrganizationSchema";
import BreadcrumbSchema from "../components/seo/BreadcrumbSchema";

// In component:
<OrganizationSchema />
<BreadcrumbSchema />
```

#### Blog Post Pages (`src/app/(home)/(dynamic)/blogs/[slug]/page.js`)
```javascript
import BlogSchema from '../../../../../components/seo/BlogSchema';
import FAQSchema from '../../../../../components/seo/FAQSchema';

// In component:
<BlogSchema post={post} />
{post.faq && post.faq.length > 0 && <FAQSchema faqs={post.faq} pageTitle={post.title} />}
```

### Legacy Components (Replaced)
- `src/components/common/BreadcrumbsJsonLd.jsx` - Old breadcrumb implementation using next-seo

## Schema Features

### Dynamic Data Sources
- **Sanity CMS**: Blog posts, FAQ data, author information
- **URL Pathname**: Dynamic breadcrumb generation
- **Environment Variables**: Site URL configuration

### Helper Functions
- `extractTextFromBlocks()` - Converts Sanity block content to plain text
- `calculateReadingTime()` - Estimates reading time for blog posts
- `toTitleCase()` - Formats breadcrumb names

### Client-Side Rendering
All schema components use `"use client"` directive and Next.js `Script` component for optimal performance and SEO.