import type { NextApiRequest, NextApiResponse } from 'next';
import Address from '@/models/Address';
import connectToDatabase from '@/lib/db';
import { getTokenFromReq, verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    let userInfo;
    try {
      userInfo = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!userInfo || !userInfo.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Connect to database
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        // Get all addresses for the authenticated user
        const addresses = await Address.find({ userId: userInfo.userId })
          .sort({ isDefault: -1, createdAt: -1 }); // Default first, then by creation date

        return res.status(200).json({ addresses });

      case 'POST':
        // Create new address for the authenticated user
        const { name, line1, line2, city, state, pincode, phone, isDefault } = req.body;

        // Validate required fields
        if (!name || !line1 || !city || !state || !pincode || !phone) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create address
        const newAddress = await Address.create({
          userId: userInfo.userId,
          name,
          line1,
          line2: line2 || '',
          city,
          state,
          pincode,
          phone,
          isDefault: isDefault || false
        });

        return res.status(201).json({ 
          message: 'Address created successfully',
          address: newAddress
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in addresses API:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

