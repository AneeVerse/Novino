import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

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
  const {
    query: { id },
    method,
  } = req;

  // Create a MongoDB connection
  const client = new MongoClient(MONGODB_URI);

  console.log('Categories [id] API called with method:', method, 'for ID:', id);
  
  // If no database is available, provide fallback functionality
  if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017') {
    console.log('Using fallback data (no MongoDB connection)');
    
    // Simple in-memory fallback for testing
    if (method === 'GET') {
      // Mock returning a single category
      const sampleCategories = [
        { id: '1', name: 'Oil', type: 'painting', description: 'Oil paintings' },
        { id: '2', name: 'Acrylic', type: 'painting', description: 'Acrylic paintings' },
        { id: '3', name: 'Watercolor', type: 'painting', description: 'Watercolor paintings' },
        { id: '4', name: 'Mixed Media', type: 'painting', description: 'Mixed media paintings' },
        { id: '5', name: 'Egyptian', type: 'artefact', description: 'Egyptian artefacts' },
        { id: '6', name: 'Asian', type: 'artefact', description: 'Asian artefacts' },
        { id: '7', name: 'European', type: 'artefact', description: 'European artefacts' },
      ];
      
      const foundCategory = sampleCategories.find(cat => cat.id === id);
      
      if (foundCategory) {
        return res.status(200).json(foundCategory);
      } else {
        return res.status(404).json({ error: 'Category not found' });
      }
    }
    
    if (method === 'PUT') {
      return res.status(200).json({
        id: id as string,
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        updatedAt: new Date().toISOString()
      });
    }
    
    if (method === 'DELETE') {
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: `Method ${method} not allowed without database` });
  }

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('categories');

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

    switch (method) {
      case 'GET':
        // Get a single category by id
        const category = await collection.findOne(query);
        
        if (!category) {
          return res.status(404).json({ success: false, error: 'Category not found' });
        }
        
        res.status(200).json(category);
        break;

      case 'PUT':
        // Update a category
        const updateData: Partial<Category> = {
          name: req.body.name,
          type: req.body.type,
          description: req.body.description
        };
        
        const result = await collection.updateOne(
          query,
          { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, error: 'Category not found' });
        }
        
        const updatedCategory = await collection.findOne(query);
        res.status(200).json(updatedCategory);
        break;

      case 'DELETE':
        // Delete a category
        const deleteResult = await collection.deleteOne(query);
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ success: false, error: 'Category not found' });
        }
        
        res.status(200).json({ success: true });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  } finally {
    await client.close();
  }
} 