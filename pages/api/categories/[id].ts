import { NextApiRequest, NextApiResponse } from 'next';
import getSupabaseAdmin from '@/lib/supabase-admin';

type Category = {
  _id?: string;
  id?: string;
  name: string;
  type: 'painting' | 'artefact';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

const supabase = getSupabaseAdmin();

const serializeCategory = (category: any): Category => ({
  ...category,
  _id: category.id,
  id: category.id,
  createdAt: category.created_at,
  updatedAt: category.updated_at,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req;

  if (!id || id === 'undefined') {
    console.error('Invalid ID provided:', id);
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid category ID provided' 
    });
  }

  console.log('Categories [id] API called with method:', method, 'for ID:', id);
  
  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return res.status(404).json({ success: false, error: 'Category not found' });
          }
          throw error;
        }

        res.status(200).json(serializeCategory(data));
        break;
      }

      case 'PUT': {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('categories')
          .update({
            name: req.body.name,
            type: req.body.type,
            description: req.body.description,
            updated_at: now,
          })
          .eq('id', id)
          .select('*')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return res.status(404).json({ success: false, error: 'Category not found' });
          }
          throw error;
        }

        res.status(200).json(serializeCategory(data));
        break;
      }

      case 'DELETE': {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        res.status(200).json({ success: true, id });
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
} 