import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'novino';

type CategoryOrderPayload = {
  id?: string;
  _id?: string;
  order?: number;
};

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

      const position =
        typeof item.order === 'number' ? item.order : index;

      return {
        id,
        order: position,
      };
    })
    .filter(Boolean) as { id: string; order: number }[];

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid category IDs provided' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('productCategories');

    const timestamp = new Date().toISOString();

    await collection.bulkWrite(
      updates.map(({ id, order }) => ({
        updateOne: {
          filter: { _id: new ObjectId(id) },
          update: {
            $set: {
              order,
              updatedAt: timestamp,
            },
          },
        },
      }))
    );

    const categories = await collection
      .find({})
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    const orderedCategories = sortCategoriesByOrder(categories);
    const serialized = orderedCategories.map(serializeCategory);

    return res.status(200).json({ success: true, categories: serialized });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message,
    });
  } finally {
    await client.close();
  }
}


