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
  const { method } = req;
  
  console.log('Categories API called with method:', method);
  console.log('Request body:', req.body);
  
  try {
    switch (method) {
      case 'GET': {
        // Categories are now derived from product_categories
        // Return empty array since categories are managed via product_categories
        res.status(200).json([]);
        break;
      }

      case 'POST': {
        // Categories are now managed via product_categories API
        res.status(400).json({ 
          success: false, 
          error: 'Categories are managed via /api/artefact-categories endpoint' 
        });
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
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 