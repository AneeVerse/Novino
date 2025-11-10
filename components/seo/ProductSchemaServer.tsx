import { generateProductSchema } from '@/lib/seo';

interface ProductSchemaServerProps {
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

export default function ProductSchemaServer({ product }: ProductSchemaServerProps) {
  const productSchema = generateProductSchema(product);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(productSchema),
      }}
    />
  );
}

