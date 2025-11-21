import getSupabaseAdmin from '@/lib/supabase-admin';

export type ProductVariant = {
    id: string;
    name: string;
    type: 'frame' | 'color';
    price?: string;
    quantity: number;
    imageUrl?: string;
};

export type ProductSpecification = {
    title: string;
    content: string;
    imageUrl?: string;
};

export type ProductFaq = {
    id: string;
    question: string;
    answer: string;
};

export type FaqSection = {
    faqs: ProductFaq[];
    imageUrl?: string;
};

export type Product = {
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
    updatedAt?: string;
};

const supabase = getSupabaseAdmin();

const serializeStandaloneProduct = (product: any) => ({
    ...product,
    _id: product.id,
    id: product.id,
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
    updatedAt: product.updated_at ?? product.updatedAt,
});

const toCategoryProduct = (category: any, product: any) => ({
    ...product,
    _id: product.id,
    id: product.id,
    price: product.basePrice ?? product.price,
    basePrice: product.basePrice ?? product.price,
    image: product.images?.[0] || '',
    category: category.id,
    categoryName: category.name,
    type: 'artefact' as const,
    description: product.description || '',
});

// Standalone products table removed - all products are in product_categories
async function findStandaloneProductRow(identifier: string) {
    return null;
}

async function findCategoryProduct(identifier: string) {
    const { data, error } = await supabase
        .from('product_categories')
        .select('id, name, products')
        .order('order_index', { ascending: true });

    if (error) {
        throw error;
    }

    for (const category of data ?? []) {
        const products = Array.isArray(category.products) ? category.products : [];
        const matched = products.find(
            (product: any) =>
                product.id === identifier ||
                product.slug === identifier ||
                String(product.id) === identifier
        );

        if (matched) {
            return toCategoryProduct(category, matched);
        }
    }

    return null;
}

export async function getProduct(id: string): Promise<Product | null> {
    try {
        const standalone = await findStandaloneProductRow(id);
        if (standalone) {
            return JSON.parse(JSON.stringify(serializeStandaloneProduct(standalone)));
        }

        const categoryProduct = await findCategoryProduct(id);
        if (categoryProduct) {
            return JSON.parse(JSON.stringify(categoryProduct));
        }

        return null;
    } catch (err) {
        console.error('Product query error:', err);
        return null;
    }
}
