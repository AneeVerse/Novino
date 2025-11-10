import { generateFAQSchema } from '@/lib/seo';

interface FAQSchemaServerProps {
  faqs: Array<{ question: string; answer: string }>;
}

export default function FAQSchemaServer({ faqs }: FAQSchemaServerProps) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const faqSchema = generateFAQSchema(faqs);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema),
      }}
    />
  );
}

