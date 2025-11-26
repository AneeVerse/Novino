/**
 * API Route: Update Artefact Category
 * PUT /api/artefact-categories/[id]
/**
 * API Route: Update Artefact Category
 * PUT /api/artefact-categories/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = getSupabaseServiceRoleClient();
        const body = await request.json();

        // Await params in Next.js 15
        const { id } = await params;

        // Update the category with all fields including dimensions and products
        // NOTE: Database uses snake_case column names
        const updateData: any = {
            name: body.name,
            description: body.description,
            care_guide: body.careGuide,
            measurement: body.measurement,
            gsm: body.gsm,
            length: body.length || 0,
            width: body.width || 0,
            breadth: body.breadth || 0,
            height: body.height || 0,
            weight: body.weight || 0,
            updated_at: new Date().toISOString(),
        };

        // Include products array if provided (for updating products within category)
        if (body.products !== undefined) {
            updateData.products = body.products;
        }

        const { data, error } = await supabase
            .from('product_categories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update category' },
            { status: 500 }
        );
    }
}
