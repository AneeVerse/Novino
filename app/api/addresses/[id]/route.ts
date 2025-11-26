import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// PUT - Update address
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, phone, line1, line2, city, state, pincode, isDefault } = body;

        // Validate required fields
        if (!name || !line1 || !city || !state || !pincode || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify ownership
        const { data: existing } = await supabase
            .from('addresses')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (!existing) {
            return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
        }

        // If this is set as default, unset other default addresses
        if (isDefault) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)
                .neq('id', id);
        }

        const { data: address, error } = await supabase
            .from('addresses')
            .update({
                name,
                phone,
                line1,
                line2: line2 || null,
                city,
                state,
                pincode,
                is_default: isDefault || false,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating address:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ address });
    } catch (error: any) {
        console.error('Address update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete address
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership before deleting
        const { data: existing } = await supabase
            .from('addresses')
            .select('id, is_default')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (!existing) {
            return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
        }

        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting address:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // If deleted address was default, set another as default
        if (existing.is_default) {
            const { data: firstAddress } = await supabase
                .from('addresses')
                .select('id')
                .eq('user_id', user.id)
                .limit(1)
                .single();

            if (firstAddress) {
                await supabase
                    .from('addresses')
                    .update({ is_default: true })
                    .eq('id', firstAddress.id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Address deletion error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Set default address
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const { data: existing } = await supabase
            .from('addresses')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (!existing) {
            return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
        }

        // Unset all defaults
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id);

        // Set this one as default
        const { data: address, error } = await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error setting default address:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ address });
    } catch (error: any) {
        console.error('Set default address error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
