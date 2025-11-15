import type { NextApiRequest, NextApiResponse } from 'next';
import Address from '@/models/Address';
import connectToDatabase from '@/lib/db';
import { getTokenFromReq, verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

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

    const { id } = req.query;

    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    // Find address and verify ownership
    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (address.userId !== userInfo.userId) {
      return res.status(403).json({ message: 'Not authorized to access this address' });
    }

    switch (req.method) {
      case 'PUT':
        // Update address
        const { name, line1, line2, city, state, pincode, phone, isDefault } = req.body;

        // Update fields
        if (name) address.name = name;
        if (line1) address.line1 = line1;
        if (line2 !== undefined) address.line2 = line2;
        if (city) address.city = city;
        if (state) address.state = state;
        if (pincode) address.pincode = pincode;
        if (phone) address.phone = phone;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await address.save();

        return res.status(200).json({ 
          message: 'Address updated successfully',
          address 
        });

      case 'DELETE':
        // Delete address
        await Address.findByIdAndDelete(id);

        return res.status(200).json({ 
          message: 'Address deleted successfully'
        });

      case 'PATCH':
        // Set as default address
        address.isDefault = true;
        await address.save(); // The pre-save hook will handle removing default from others

        return res.status(200).json({ 
          message: 'Default address updated',
          address 
        });

      default:
        res.setHeader('Allow', ['PUT', 'DELETE', 'PATCH']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in address API:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

