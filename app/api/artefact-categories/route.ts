/**
 * API Route: Artefact Categories
 * GET /api/artefact-categories - Fetch all categories
 * POST /api/artefact-categories - Create new category
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

// GET - Fetch all categories
export async function GET() {
    try {
        const supabase = getSupabaseServiceRoleClient();

        const { data, error } = await supabase
            .from('product_categories')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// POST - Create new category
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseServiceRoleClient();
        const body = await request.json();

        const { data, error } = await supabase
            .from('product_categories')
            .insert({
                name: body.name,
                description: body.description,
                care_guide: body.careGuide || '',
                measurement: body.measurement || '',
                gsm: body.gsm || '',
                length: body.length || 0,
                width: body.width || 0,
                breadth: body.breadth || 0,
                height: body.height || 0,
                weight: body.weight || 0,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Create error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create category' },
            { status: 500 }
        );
    }
}
