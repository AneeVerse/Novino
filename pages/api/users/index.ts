import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET for listing users
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseServiceRoleClient();

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Fetch all users from auth.users (this is where users actually are)
    const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return res.status(500).json({ 
        message: 'Error fetching users',
        error: authError.message 
      });
    }

    // Get profiles to join with auth users for additional data
    const userIds = (authUsersData?.users || []).map(u => u.id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, is_blocked')
      .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']); // Dummy ID if no users

    // Create a map of profiles by user ID
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    // Transform auth users to include profile data
    // Map to dashboard expected format (camelCase with _id)
    const allUsers = (authUsersData?.users || []).map(user => {
      const profile = profileMap.get(user.id);
      return {
        _id: user.id, // Dashboard expects _id
        id: user.id, // Also include id for compatibility
        username: profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        display_name: profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
        isBlocked: profile?.is_blocked || false, // Dashboard expects camelCase
        is_blocked: profile?.is_blocked || false, // Also include snake_case for compatibility
        createdAt: user.created_at, // Dashboard expects camelCase
        created_at: user.created_at, // Also include snake_case for compatibility
        updated_at: user.updated_at || user.created_at
      };
    });

    // Sort by created_at descending (newest first)
    allUsers.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    // Apply pagination
    const totalUsers = allUsers.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = allUsers.slice(start, end);

    return res.status(200).json({
      users: paginatedUsers,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ 
      message: 'Error fetching users',
      error: err.message 
    });
  }
}
