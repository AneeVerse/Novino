import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Create authenticated Supabase client
    const supabase = createPagesServerClient({ req, res });

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = session.user;
    const { id } = req.query;

    // Validate ID (should be UUID for Supabase)
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    // Find address and verify ownership
    const { data: address, error: findError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (address.user_id !== user.id) {
      return res.status(403).json({ message: 'Not authorized to access this address' });
    }

    switch (req.method) {
      case 'PUT':
        // Update address
        const { name, line1, line2, city, state, pincode, phone, isDefault } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (line1) updateData.line1 = line1;
        if (line2 !== undefined) updateData.line2 = line2;
        if (city) updateData.city = city;
        if (state) updateData.state = state;
        if (pincode) updateData.pincode = pincode;
        if (phone) updateData.phone = phone;
        if (isDefault !== undefined) updateData.is_default = isDefault;

        const { data: updatedAddress, error: updateError } = await supabase
          .from('addresses')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating address:', updateError);
          return res.status(500).json({ message: 'Error updating address' });
        }

        return res.status(200).json({
          message: 'Address updated successfully',
          address: updatedAddress
        });

      case 'DELETE':
        // Delete address
        const { error: deleteError } = await supabase
          .from('addresses')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Error deleting address:', deleteError);
          return res.status(500).json({ message: 'Error deleting address' });
        }

        return res.status(200).json({
          message: 'Address deleted successfully'
        });

      case 'PATCH':
        // Set as default address (trigger will handle removing default from others)
        const { data: defaultAddress, error: patchError } = await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', id)
          .select()
          .single();

        if (patchError) {
          console.error('Error setting default address:', patchError);
          return res.status(500).json({ message: 'Error setting default address' });
        }

        return res.status(200).json({
          message: 'Default address updated',
          address: defaultAddress
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
