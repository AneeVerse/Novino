'use client';

import Script from 'next/script';
import { generateProductSchema } from '@/lib/seo';

interface ProductSchemaProps {
  product: {
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
  };
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const productSchema = generateProductSchema(product);

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(productSchema),
      }}
    />
  );
}

