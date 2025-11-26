import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// GET - Fetch all addresses for authenticated user
export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[Addresses][GET] Auth error', authError?.message);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: addresses, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching addresses:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ addresses });
    } catch (error: any) {
        console.error('Addresses API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new address
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[Addresses][POST] Auth error', authError?.message);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, phone, line1, line2, city, state, pincode, isDefault } = body;

        // Validate required fields
        if (!name || !line1 || !city || !state || !pincode || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // If this is set as default, unset other default addresses
        if (isDefault) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);
        }

        const { data: address, error } = await supabase
            .from('addresses')
            .insert({
                user_id: user.id,
                name,
                phone,
                line1,
                line2: line2 || null,
                city,
                state,
                pincode,
                is_default: isDefault || false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating address:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ address });
    } catch (error: any) {
        console.error('Address creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
