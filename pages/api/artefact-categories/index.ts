import { NextApiRequest, NextApiResponse } from 'next';
import getSupabaseAdmin from '@/lib/supabase-admin';

export interface ArtefactCategory {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  order?: number;
  products: ArtefactProduct[];
  createdAt: string;
  updatedAt?: string;
}

export interface ArtefactProduct {
  id: string;
  name: string;
  description: string;
  basePrice: string;
  quantity: number;
  images: string[];
  metaDescription?: string;
  order: number; // For drag-and-drop ordering
  createdAt: string;
}

const supabase = getSupabaseAdmin();

const serializeCategory = (category: any) => {
  // Ensure name is always a string, not an object
  let name = category.name;
  if (typeof name === 'object' && name !== null) {
    // If name is an object, try to extract the name property
    name = name.name || name.toString() || 'Unnamed Category';
  }
  if (typeof name !== 'string') {
    name = String(name || 'Unnamed Category');
  }

  return {
    ...category,
    _id: category.id,
    id: category.id,
    name: name,
    description: typeof category.description === 'string' ? category.description : (category.description || ''),
    careGuide: category.care_guide || category.careGuide || '',
    measurement: category.measurement || '',
    gsm: category.gsm || '',
    order: typeof category.order_index === 'number' ? category.order_index : category.order,
    createdAt: category.created_at ?? category.createdAt,
    updatedAt: category.updated_at ?? category.updatedAt,
    products: Array.isArray(category.products) ? category.products : [],
  };
};

const sortCategoriesByOrder = (categoryList: any[]) => {
  return [...categoryList].sort((a, b) => {
    const orderA =
      typeof a.order_index === 'number'
        ? a.order_index
        : typeof a.order === 'number'
          ? a.order
          : Number.MAX_SAFE_INTEGER;
    const orderB =
      typeof b.order_index === 'number'
        ? b.order_index
        : typeof b.order === 'number'
          ? b.order
          : Number.MAX_SAFE_INTEGER;

    if (orderA === orderB) {
      const dateA = a.created_at
        ? new Date(a.created_at).getTime()
        : a.createdAt
          ? new Date(a.createdAt).getTime()
          : Infinity;
      const dateB = b.created_at
        ? new Date(b.created_at).getTime()
        : b.createdAt
          ? new Date(b.createdAt).getTime()
          : Infinity;
      return dateA - dateB;
    }

    return orderA - orderB;
  });
};

const getNextOrderValue = async () => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data || typeof data.order_index !== 'number') {
    return 0;
  }

  return data.order_index + 1;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('product_categories')
          .select('*')
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        const orderedCategories = sortCategoriesByOrder(data ?? []);
        const serializedCategories = orderedCategories.map(serializeCategory);
        res.status(200).json(serializedCategories);
        break;
      }

      case 'POST': {
        const nextOrder = await getNextOrderValue();
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('product_categories')
          .insert({
            name: req.body.name,
            description: req.body.description || '',
            care_guide: req.body.careGuide || req.body.care_guide || '',
            measurement: req.body.measurement || '',
            gsm: req.body.gsm || '',
            products: [],
            order_index: nextOrder,
            created_at: now,
            updated_at: now,
          })
          .select('*')
          .single();

        if (error) {
          throw error;
        }

        res.status(201).json(serializeCategory(data));
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message,
    });
  }
}

