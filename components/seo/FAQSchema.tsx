'use client';

import Script from 'next/script';
import { generateFAQSchema } from '@/lib/seo';

interface FAQSchemaProps {
  faqs: Array<{ question: string; answer: string }>;
}

export default function FAQSchema({ faqs }: FAQSchemaProps) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const faqSchema = generateFAQSchema(faqs);

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema),
      }}
    />
  );
}

