import { NextApiRequest, NextApiResponse } from 'next';
import getSupabaseAdmin from '@/lib/supabase-admin';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const { id } = query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('product_categories')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Category not found' });
          }
          throw error;
        }

        res.status(200).json(serializeCategory(data));
        break;
      }

      case 'PUT': {
        const now = new Date().toISOString();
        const { 
          _id, 
          id: bodyId, 
          order, 
          order_index,
          createdAt,
          updatedAt,
          ...rest 
        } = req.body || {};

        // Only allow fields that exist in Supabase schema (use snake_case for database)
        const updatePayload: Record<string, any> = {
          name: rest.name,
          description: rest.description,
          care_guide: rest.careGuide || rest.care_guide || '',
          measurement: rest.measurement || '',
          gsm: rest.gsm || '',
          products: Array.isArray(rest.products) ? rest.products : rest.products || [],
          updated_at: now,
        };

        if (typeof (order_index ?? order) === 'number') {
          updatePayload.order_index = order_index ?? order;
        }

        const { data, error } = await supabase
          .from('product_categories')
          .update(updatePayload)
          .eq('id', id)
          .select('*')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Category not found' });
          }
          throw error;
        }

        res.status(200).json(serializeCategory(data));
        break;
      }

      case 'DELETE': {
        const { error } = await supabase
          .from('product_categories')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        res.status(200).json({ success: true, message: 'Category deleted' });
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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

