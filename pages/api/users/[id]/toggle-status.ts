import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const supabase = getSupabaseServiceRoleClient();

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get current user status
    const { data: user } = await supabase
      .from('profiles')
      .select('is_blocked')
      .eq('id', id)
      .single();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle blocked status
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: !user.is_blocked })
      .eq('id', id);

    if (error) {
      console.error('Error toggling user status:', error);
      return res.status(500).json({ message: 'Error updating user status' });
    }

    return res.status(200).json({
      message: user.is_blocked ? 'User unblocked' : 'User blocked',
      is_blocked: !user.is_blocked
    });
  } catch (err: any) {
    console.error('Error toggling user status:', err);
    return res.status(500).json({ message: 'Error toggling user status' });
  }
}