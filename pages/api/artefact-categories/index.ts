import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'novino';

export interface ArtefactCategory {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
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

    switch (method) {
      case 'GET':
        // Get all artefact categories
        const categories = await collection.find({}).sort({ createdAt: -1 }).toArray();
        
        // Serialize the categories
        const serializedCategories = categories.map(cat => ({
          ...cat,
          _id: cat._id.toString(),
          id: cat._id.toString(),
        }));
        
        res.status(200).json(serializedCategories);
        break;

      case 'POST':
        // Create a new artefact category
        const newCategory: ArtefactCategory = {
          name: req.body.name,
          description: req.body.description || '',
          products: [],
          createdAt: new Date().toISOString(),
        };

        const result = await collection.insertOne(newCategory);

        const createdCategory = {
          ...newCategory,
          _id: result.insertedId.toString(),
          id: result.insertedId.toString(),
        };

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

