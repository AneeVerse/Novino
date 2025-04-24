import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection URI (would typically be in env variables)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'novino';

type ProductVariant = {
  id: string;
  name: string;
  type: 'frame' | 'color';
  price?: string;
  quantity: number;
  imageUrl?: string;
};

type ProductSpecification = {
  title: string;
  content: string;
  imageUrl?: string;
};

type ProductFaq = {
  id: string;
  question: string;
  answer: string;
};

type FaqSection = {
  faqs: ProductFaq[];
  imageUrl?: string;
};

type Product = {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price?: string;
  basePrice?: string;
  quantity?: number;
  image?: string;
  images?: string[];
  category: string;
  type: 'painting' | 'artefact';
  variants?: ProductVariant[];
  specifications?: ProductSpecification;
  faqSection?: FaqSection;
  additionalImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
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

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('products');

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

    // Log the query for debugging
    console.log('MongoDB query:', JSON.stringify(query));

    switch (method) {
      case 'GET':
        // Get a single product by id
        try {
          // First try the original query
          let product = await collection.findOne(query);
          
          // If no result and id is numeric, try to find by numeric ID
          if (!product && !isNaN(Number(id))) {
            const numericId = parseInt(id as string, 10);
            console.log('Trying numeric ID query:', numericId);
            product = await collection.findOne({ id: numericId });
          }
          
          // If no product found, return 404
          if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
          }
          
          // Add a numeric id property if it doesn't exist
          if (product && !product.id && product._id) {
            product.id = product._id.toString();
          }
          
          // Disable caching for product details to ensure fresh data always
          res.setHeader('Cache-Control', 'no-store, max-age=0');
          
          res.status(200).json(product);
        } catch (err) {
          console.error('Product query error:', err);
          return res.status(500).json({ success: false, error: 'Error querying product' });
        }
        break;

      case 'PUT':
        // Update a product with enhanced properties
        const updateData: Partial<Product> = {
          name: req.body.name,
          description: req.body.description,
          // Handle both price formats
          price: req.body.price || req.body.basePrice,
          basePrice: req.body.basePrice || req.body.price,
          quantity: req.body.quantity || 1,
          // Handle both image formats
          image: req.body.image || (req.body.images && req.body.images.length > 0 ? req.body.images[0] : ''),
          images: req.body.images || (req.body.image ? [req.body.image] : []),
          category: req.body.category,
          type: req.body.type,
          // Add enhanced product properties
          variants: req.body.variants || [],
          specifications: req.body.specifications || { title: '', content: '' },
          faqSection: req.body.faqSection || { faqs: [] },
          additionalImageUrl: req.body.additionalImageUrl,
          updatedAt: new Date().toISOString()
        };
        
        const result = await collection.updateOne(
          query,
          { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        const updatedProduct = await collection.findOne(query);
        res.status(200).json(updatedProduct);
        break;

      case 'DELETE':
        // Delete a product
        const deleteResult = await collection.deleteOne(query);
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ success: false, error: 'Product not found' });
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