import { generateBreadcrumbSchema } from '@/lib/seo';

interface BreadcrumbSchemaServerProps {
  items: Array<{ name: string; url: string }>;
}

export default function BreadcrumbSchemaServer({ items }: BreadcrumbSchemaServerProps) {
  const breadcrumbSchema = generateBreadcrumbSchema(items);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema),
      }}
    />
  );
}

