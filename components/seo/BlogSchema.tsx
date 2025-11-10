'use client';

import Script from 'next/script';
import { generateBlogPostingSchema } from '@/lib/seo';

interface BlogSchemaProps {
  blog: {
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
  };
}

export default function BlogSchema({ blog }: BlogSchemaProps) {
  const blogSchema = generateBlogPostingSchema(blog);

  return (
    <Script
      id="blog-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(blogSchema),
      }}
    />
  );
}

