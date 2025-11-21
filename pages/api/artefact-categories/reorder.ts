import { NextApiRequest, NextApiResponse } from 'next';
import getSupabaseAdmin from '@/lib/supabase-admin';

type CategoryOrderPayload = {
  id?: string;
  _id?: string;
  order?: number;
};

const supabase = getSupabaseAdmin();

const serializeCategory = (category: any) => ({
  ...category,
  _id: category.id,
  id: category.id,
  order: typeof category.order_index === 'number' ? category.order_index : category.order,
  createdAt: category.created_at ?? category.createdAt,
  updatedAt: category.updated_at ?? category.updatedAt,
  products: Array.isArray(category.products) ? category.products : [],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { order } = req.body;

  if (!Array.isArray(order)) {
    return res.status(400).json({ error: 'Order payload must be an array' });
  }

  const updates = order
    .map((item: CategoryOrderPayload, index: number) => {
      const id = item.id || item._id;
      if (!id) {
        return null;
      }

      const position = typeof item.order === 'number' ? item.order : index;
      return { id, position };
    })
    .filter(Boolean) as { id: string; position: number }[];

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid category IDs provided' });
  }

  try {
    const timestamp = new Date().toISOString();

    await Promise.all(
      updates.map(({ id, position }) =>
        supabase
          .from('product_categories')
          .update({ order_index: position, updated_at: timestamp })
          .eq('id', id)
      )
    );

    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const serialized = (data ?? []).map(serializeCategory);
    return res.status(200).json({ success: true, categories: serialized });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message,
    });
  }
}


