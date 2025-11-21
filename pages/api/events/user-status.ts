import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Get user ID from query
  const userId = req.query.userId as string;

  if (!userId) {
    res.write(`data: ${JSON.stringify({ error: 'Missing userId' })}\n\n`);
    res.end();
    return;
  }

  try {
    const supabase = getSupabaseServiceRoleClient();

    // Check user status from Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_blocked')
      .eq('id', userId)
      .single();

    if (profile?.is_blocked) {
      res.write(
        `data: ${JSON.stringify({
          type: 'blocked',
          message: 'Your account has been blocked'
        })}\n\n`
      );
    } else {
      res.write(
        `data: ${JSON.stringify({
          type: 'active',
          message: 'Account is active'
        })}\n\n`
      );
    }

    res.end();
  } catch (error) {
    console.error('Error checking user status:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to check status' })}\n\n`);
    res.end();
  }
}