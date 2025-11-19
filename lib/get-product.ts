import { ObjectId } from 'mongodb';
import connectToMongoDB from '@/lib/mongodb-client';

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

export async function getProduct(id: string): Promise<Product | null> {
    try {
        // Use cached MongoDB connection
        const { db } = await connectToMongoDB();
        const collection = db.collection('products');

        // Convert string ID to ObjectId if needed
        let objectId;
        try {
            if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
                objectId = new ObjectId(id);
            }
        } catch (e) {
            console.error('Invalid ObjectId:', e);
        }

        // Query by either ObjectId or string id
        const query = objectId
            ? { $or: [{ _id: objectId }, { id: id }] }
            : { id: id };

        let product = null;

        // First, try to find by slug (if the id doesn't look like an ObjectId or numeric ID)
        const isObjectId = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        const isNumeric = !isNaN(Number(id));

        if (!isObjectId && !isNumeric) {
            // Likely a slug, try to find by slug first
            product = await collection.findOne({ slug: id });
        }

        // If not found by slug, try the original query (by ID)
        if (!product) {
            product = await collection.findOne(query);
        }

        // If no result and id is numeric, try to find by numeric ID
        if (!product && isNumeric) {
            const numericId = parseInt(id as string, 10);
            product = await collection.findOne({ id: numericId });
        }

        // If still not found, search in productCategories collection
        if (!product) {
            const productCategoriesCollection = db.collection('productCategories');

            // Search for the product inside any category's products array
            const categoryWithProduct = await productCategoriesCollection.findOne({
                'products.id': id as string
            });

            if (categoryWithProduct) {
                // Find the specific product within the category
                const foundProduct = categoryWithProduct.products?.find((p: any) => p.id === id);

                if (foundProduct) {
                    // Transform the product to match the expected format
                    product = {
                        ...foundProduct,
                        _id: foundProduct.id,
                        id: foundProduct.id,
                        price: foundProduct.basePrice,
                        image: foundProduct.images?.[0] || '',
                        category: categoryWithProduct._id.toString(),
                        type: 'artefact' as const,
                        description: foundProduct.description || '',
                    };
                }
            }
        }

        if (!product) {
            return null;
        }

        // Add a numeric id property if it doesn't exist
        if (product && !product.id && product._id) {
            product.id = product._id.toString();
        }

        // Serialize ObjectId and dates to strings to be safe for Server Components -> Client Components
        return JSON.parse(JSON.stringify(product));
    } catch (err) {
        console.error('Product query error:', err);
        return null;
    }
}
