import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

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
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  // Create a MongoDB connection
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('products');

    switch (method) {
      case 'GET':
        // Get all products
        try {
          const products = await collection.find({}).sort({ createdAt: -1 }).toArray();
          
          // If no products found in MongoDB, use sample data
          if (!products || products.length === 0) {
            console.log('No products found in MongoDB, returning sample data');
            
            // Sample product data for fallback
            const sampleProducts = [
              {
                id: 1,
                _id: "sample_1",
                name: "Abstract Elegance",
                price: "$2,327",
                basePrice: "$2,327",
                image: "/images/painting/2.1.png",
                category: "Oil",
                type: "painting",
                description: "Abstract Elegance explores the interplay of form and color in modern composition. This oil painting features bold brushstrokes and a rich palette that creates depth and emotion, inviting the viewer to find their own meaning within its layers."
              },
              {
                id: 2,
                _id: "sample_2",
                name: "Serene Landscape",
                price: "$1,850",
                basePrice: "$1,850",
                image: "/images/painting/1.2.png",
                category: "Watercolor",
                type: "painting",
                description: "A peaceful watercolor landscape capturing the tranquility of nature. Soft brush strokes and delicate color blending create a sense of calm and serenity."
              },
              {
                id: 3,
                _id: "sample_3",
                name: "Ancient Vase",
                price: "$3,250",
                basePrice: "$3,250",
                image: "/images/mug-black.png",
                category: "Egyptian",
                type: "artefact",
                description: "This ancient Egyptian vase features intricate hieroglyphics and traditional design elements. Handcrafted using techniques passed down through generations, it represents the artistic mastery of one of history's most enduring civilizations."
              }
            ];
            
            return res.status(200).json(sampleProducts);
          }
          
          res.status(200).json(products);
        } catch (error) {
          console.error('Error fetching products:', error);
          res.status(500).json({ success: false, error: 'Failed to fetch products' });
        }
        break;

      case 'POST':
        // Create a new product
        const newProduct = {
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
          createdAt: new Date().toISOString()
        };
        
        const result = await collection.insertOne(newProduct);
        
        // Return the created product with its ID
        const createdProduct = {
          ...newProduct,
          _id: result.insertedId.toString(),
          id: result.insertedId.toString()
        };
        
        res.status(201).json(createdProduct);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  } finally {
    await client.close();
  }
} 