"use server";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server";

export async function PUT(request: NextRequest) {
    try {
        const { order } = await request.json();

        if (!Array.isArray(order)) {
            return NextResponse.json(
                { error: "Invalid order format. Expected an array of { id, order }." },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServiceRoleClient();

        // Update each category's order
        const updatePromises = order.map(({ id, order: orderIndex }) =>
            supabase
                .from("product_categories")
                .update({ order: orderIndex, updated_at: new Date().toISOString() })
                .eq("id", id)
        );

        const results = await Promise.all(updatePromises);

        // Check for errors
        const errors = results.filter((result) => result.error);
        if (errors.length > 0) {
            console.error("Some category order updates failed:", errors);
            return NextResponse.json(
                { error: "Some category order updates failed" },
                { status: 500 }
            );
        }

        // Fetch updated categories
        const { data: categories, error: fetchError } = await supabase
            .from("product_categories")
            .select("*")
            .order("order", { ascending: true });

        if (fetchError) {
            console.error("Failed to fetch updated categories:", fetchError);
            return NextResponse.json(
                { error: "Failed to fetch updated categories" },
                { status: 500 }
            );
        }

        return NextResponse.json({ categories, success: true });
    } catch (error) {
        console.error("Error reordering categories:", error);
        return NextResponse.json(
            { error: "Failed to reorder categories" },
            { status: 500 }
        );
    }
}
