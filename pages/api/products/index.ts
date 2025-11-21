import { NextApiRequest, NextApiResponse } from 'next';
import getSupabaseAdmin from '@/lib/supabase-admin';

type ProductVariant = {
  id: string;
  name: string;
  type: string;
  price?: string;
  quantity: number;
  imageUrl?: string;
  images?: string[];
};

type ProductSpecification = {
  title: string;
  content: string;
  imageUrl?: string;
};

type ProductFaq = {
  id: string;
  question: string;
  answer: string;
};

type FaqSection = {
  faqs: ProductFaq[];
  imageUrl?: string;
};

type Product = {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  shortDescription?: string;
  price?: string;
  basePrice?: string;
  quantity?: number;
  image?: string;
  images?: string[];
  category: string;
  type: 'painting' | 'artefact';
  variants?: ProductVariant[];
  specifications?: ProductSpecification;
  faqSection?: FaqSection;
  additionalImageUrl?: string;
  featured?: boolean;
  featuredImageUrl?: string;
  logoUrl?: string;
  metaDescription?: string;
  slug?: string;
  createdAt?: string;
};

const supabase = getSupabaseAdmin();

const serializeStandaloneProduct = (product: any) => ({
  ...product,
  id: product.id,
  _id: product.id,
  price: product.price ?? product.base_price,
  basePrice: product.base_price ?? product.price,
  shortDescription: product.short_description ?? product.shortDescription,
  logoUrl: product.logo_url ?? product.logoUrl,
  image: product.image ?? product.images?.[0],
  images: Array.isArray(product.images) ? product.images : [],
  variants: Array.isArray(product.variants) ? product.variants : [],
  specifications: product.specifications,
  faqSection: product.faq_section,
  additionalImageUrl: product.additional_image_url,
  featuredImageUrl: product.featured_image_url,
  metaDescription: product.meta_description,
  createdAt: product.created_at ?? product.createdAt,
});

const flattenCategoryProducts = (categories: any[]) =>
  categories.flatMap((category) =>
    (Array.isArray(category.products) ? category.products : []).map((product: any) => ({
      ...product,
      id: product.id,
      _id: product.id,
      price: product.basePrice ?? product.price,
      basePrice: product.basePrice ?? product.price,
      image: product.images?.[0] || '',
      category: category.id,
      categoryName: category.name,
      type: 'artefact' as const,
      createdAt: product.createdAt,
      metaDescription: product.metaDescription,
    }))
  );

const buildVariantList = (products: any[]) => {
  const flattened: any[] = [];

  products.forEach((product) => {
    flattened.push(product);

    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((variant: ProductVariant) => {
        flattened.push({
          ...product,
          id: `${product.id}-variant-${variant.id}`,
          _id: `${product._id}-variant-${variant.id}`,
          name: variant.name,
          price: variant.price || product.price || product.basePrice,
          basePrice: variant.price || product.basePrice || product.price,
          image: variant.images?.[0] || variant.imageUrl || product.image,
          images: variant.images || (variant.imageUrl ? [variant.imageUrl] : product.images),
          quantity: variant.quantity,
          isVariant: true,
          variantId: variant.id,
          variantName: variant.name,
          variantType: variant.type,
          parentProductId: product.id,
          originalProduct: {
            id: product.id,
            name: product.name,
            category: product.category,
          },
        });
      });
    }
  });

  return flattened;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        try {
          // All products are now in product_categories table
          const { data, error } = await supabase
            .from('product_categories')
            .select('id, name, products, order_index, created_at')
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: true });

          if (error) {
            throw error;
          }

          const categoryProducts = flattenCategoryProducts(data ?? []);
          const combinedProducts = categoryProducts;

          if (combinedProducts.length === 0) {
            console.log('No products found in Supabase, returning sample data');
            const sampleProducts = [
              {
                id: 'sample_1',
                _id: 'sample_1',
                name: 'Abstract Elegance',
                price: '$2,327',
                basePrice: '$2,327',
                image: '/images/painting/2.1.png',
                category: 'Oil',
                type: 'painting' as const,
                description:
                  'Abstract Elegance explores the interplay of form and color in modern composition. This oil painting features bold brushstrokes and a rich palette that creates depth and emotion, inviting the viewer to find their own meaning within its layers.',
              },
              {
                id: 'sample_2',
                _id: 'sample_2',
                name: 'Serene Landscape',
                price: '$1,850',
                basePrice: '$1,850',
                image: '/images/painting/1.2.png',
                category: 'Watercolor',
                type: 'painting' as const,
                description:
                  'A peaceful watercolor landscape capturing the tranquility of nature. Soft brush strokes and delicate color blending create a sense of calm and serenity.',
              },
              {
                id: 'sample_3',
                _id: 'sample_3',
                name: 'Ancient Vase',
                price: '$3,250',
                basePrice: '$3,250',
                image: '/images/mug-black.png',
                category: 'Egyptian',
                type: 'artefact' as const,
                description:
                  'This ancient Egyptian vase features intricate hieroglyphics and traditional design elements. Handcrafted using techniques passed down through generations, it represents the artistic mastery of one of history\'s most enduring civilizations.',
              },
            ];

            return res.status(200).json(sampleProducts);
          }

          const includeVariants = req.query.includeVariants === 'true';

          if (includeVariants) {
            return res.status(200).json(buildVariantList(combinedProducts));
          }

          res.status(200).json(combinedProducts);
        } catch (error) {
          console.error('Error fetching products:', error);
          res.status(500).json({ success: false, error: 'Failed to fetch products' });
        }
        break;

      case 'POST': {
        // Products are now managed via product_categories API
        res.status(400).json({ 
          success: false, 
          error: 'Products are managed via /api/artefact-categories endpoint. Add products to a category.' 
        });
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}