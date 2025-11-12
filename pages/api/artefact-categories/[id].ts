import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'novino';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const { id } = query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('productCategories');

    switch (method) {
      case 'GET':
        // Get single category
        const category = await collection.findOne({ _id: new ObjectId(id) });

        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }

        const serializedCategory = {
          ...category,
          _id: category._id.toString(),
          id: category._id.toString(),
        };

        res.status(200).json(serializedCategory);
        break;

      case 'PUT':
        // Update category (including products)
        const updateData = {
          ...req.body,
          updatedAt: new Date().toISOString(),
        };

        // Remove _id and id from update data to avoid conflicts
        delete updateData._id;
        delete updateData.id;

        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: 'Category not found' });
        }

        // Fetch the updated category
        const updatedCategory = await collection.findOne({ _id: new ObjectId(id) });

        res.status(200).json({
          ...updatedCategory,
          _id: updatedCategory!._id.toString(),
          id: updatedCategory!._id.toString(),
        });
        break;

      case 'DELETE':
        // Delete category
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Category deleted' });
        break;

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
  } finally {
    await client.close();
  }
}

