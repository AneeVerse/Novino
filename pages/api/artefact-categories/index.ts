import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'novino';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('productCategories');

    const serializeCategory = (category: any) => ({
      ...category,
      _id: category._id.toString(),
      id: category._id.toString(),
    });

    const sortCategoriesByOrder = (categoryList: any[]) => {
      return [...categoryList].sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
        const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;

        if (orderA === orderB) {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Infinity;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Infinity;
          return dateA - dateB;
        }

        return orderA - orderB;
      });
    };

    const getNextOrderValue = async () => {
      const lastCategory = await collection
        .find({})
        .sort({ order: -1 })
        .limit(1)
        .toArray();

      if (lastCategory.length === 0) {
        return 0;
      }

      const currentOrder =
        typeof lastCategory[0].order === 'number' ? lastCategory[0].order : -1;
      return currentOrder + 1;
    };

    switch (method) {
      case 'GET':
        // Get all artefact categories
        const categories = await collection
          .find({})
          .sort({ order: 1, createdAt: 1 })
          .toArray();
        const orderedCategories = sortCategoriesByOrder(categories);
        
        // Serialize the categories
        const serializedCategories = orderedCategories.map(serializeCategory);
        
        res.status(200).json(serializedCategories);
        break;

      case 'POST':
        // Create a new artefact category
        const nextOrder = await getNextOrderValue();
        const newCategory: ArtefactCategory = {
          name: req.body.name,
          description: req.body.description || '',
          products: [],
          order: nextOrder,
          createdAt: new Date().toISOString(),
        };

        const result = await collection.insertOne(newCategory);

        const createdCategory = serializeCategory({
          ...newCategory,
          _id: result.insertedId,
        });

        res.status(201).json(createdCategory);
        break;

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
  } finally {
    await client.close();
  }
}

