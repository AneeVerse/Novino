'use client';

import Script from 'next/script';
import { generateBreadcrumbSchema } from '@/lib/seo';

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const breadcrumbSchema = generateBreadcrumbSchema(items);

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema),
      }}
    />
  );
}

