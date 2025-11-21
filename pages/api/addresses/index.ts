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

    switch (req.method) {
      case 'GET':
        // Get all addresses for the authenticated user
        const { data: addresses, error: getError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });

        if (getError) {
          console.error('Error fetching addresses:', getError);
          return res.status(500).json({ message: 'Error fetching addresses' });
        }

        return res.status(200).json({ addresses: addresses || [] });

      case 'POST':
        // Create new address for the authenticated user
        const { name, line1, line2, city, state, pincode, phone, isDefault } = req.body;

        // Validate required fields
        if (!name || !line1 || !city || !state || !pincode || !phone) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if similar address already exists (same line1, city, state, pincode for same user)
        const { data: existingAddresses } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('line1', line1.trim())
          .eq('city', city.trim())
          .eq('state', state.trim())
          .eq('pincode', pincode.trim());

        // If exact duplicate exists, return it instead of creating new
        if (existingAddresses && existingAddresses.length > 0) {
          // Check if line2 matches if provided
          const exactMatch = existingAddresses.find(addr => {
            const existingLine2 = addr.line2 || '';
            const newLine2 = (line2 || '').trim();
            return existingLine2 === newLine2;
          });

          if (exactMatch) {
            return res.status(200).json({
              message: 'Address already exists',
              address: exactMatch
            });
          }
        }

        // Create address
        const { data: newAddress, error: createError } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            name: name.trim(),
            line1: line1.trim(),
            line2: (line2 || '').trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            phone: phone.trim(),
            is_default: isDefault || false
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating address:', createError);
          return res.status(500).json({ 
            message: 'Error creating address',
            error: createError.message 
          });
        }

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
