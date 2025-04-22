import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

// MongoDB connection URI (would typically be in env variables)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'novino';

type Category = {
  _id?: string;
  id?: string;
  name: string;
  type: 'painting' | 'artefact';
  description?: string;
  createdAt?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  // Create a MongoDB connection
  const client = new MongoClient(MONGODB_URI);
  
  console.log('Categories API called with method:', method);
  console.log('Request body:', req.body);
  
  // If no database is available, provide fallback functionality
  if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017') {
    console.log('Using fallback data (no MongoDB connection)');
    
    // Simple in-memory fallback for testing
    if (method === 'GET') {
      return res.status(200).json([
        { id: '1', name: 'Oil', type: 'painting', description: 'Oil paintings' },
        { id: '2', name: 'Acrylic', type: 'painting', description: 'Acrylic paintings' },
        { id: '3', name: 'Watercolor', type: 'painting', description: 'Watercolor paintings' },
        { id: '4', name: 'Mixed Media', type: 'painting', description: 'Mixed media paintings' },
        { id: '5', name: 'Egyptian', type: 'artefact', description: 'Egyptian artefacts' },
        { id: '6', name: 'Asian', type: 'artefact', description: 'Asian artefacts' },
        { id: '7', name: 'European', type: 'artefact', description: 'European artefacts' },
      ]);
    }
    
    if (method === 'POST') {
      const newCategory = {
        id: Date.now().toString(),
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        createdAt: new Date().toISOString()
      };
      
      return res.status(201).json(newCategory);
    }
    
    return res.status(405).json({ error: `Method ${method} not allowed without database` });
  }
  
  // Proceed with MongoDB if available
  try {
    await client.connect();
    console.log('Connected to MongoDB database');
    
    const db = client.db(MONGODB_DB);
    const collection = db.collection('categories');

    switch (method) {
      case 'GET':
        // Get all categories
        const categories = await collection.find({}).sort({ name: 1 }).toArray();
        res.status(200).json(categories);
        break;

      case 'POST':
        // Create a new category
        const newCategory = {
          name: req.body.name,
          type: req.body.type,
          description: req.body.description,
          createdAt: new Date().toISOString()
        };
        
        const result = await collection.insertOne(newCategory);
        
        // Return the created category with its ID
        const createdCategory = {
          ...newCategory,
          _id: result.insertedId.toString(),
          id: result.insertedId.toString()
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
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    try {
      await client.close();
      console.log('MongoDB connection closed');
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
  }
} 