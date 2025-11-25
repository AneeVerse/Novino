/**
 * API Route: Create Order in Shiprocket
 * POST /api/shiprocket/ship
 * 
 * Creates order in Shiprocket with product dimensions from category
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/shiprocket/orders';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { order_id } = await request.json();

        if (!order_id) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Step 1: Fetch order from Supabase
        const supabase = getSupabaseServiceRoleClient();
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found in database' },
                { status: 404 }
            );
        }

        // Step 2: Get delivery address
        const address = order.delivery_address || {};

        if (!address.pincode) {
            return NextResponse.json(
                { error: 'Order missing delivery pincode' },
                { status: 400 }
            );
        }

        // Step 3: Get product dimensions from category
        // Fallback to common Novino product sizes (based on Bottle/Cup dimensions)
        // These are conservative estimates to ensure courier charges are accurate
        let packageLength = 30;   // cm - covers most products  
        let packageBreadth = 26;  // cm - standard breadth
        let packageHeight = 10;   // cm - safe middle ground (between 1cm-33cm range)
        let packageWeight = 0.5;  // kg - safe overestimate (500g)

        // Try to get exact dimensions from the product's category
        if (order.items && order.items.length > 0) {
            const firstItem = order.items[0];
            if (firstItem.categoryId) {
                const { data: category } = await supabase
                    .from('product_categories')
                    .select('length, width, breadth, height, weight')
                    .eq('id', firstItem.categoryId)
                    .single();

                if (category && category.length > 0) {
                    packageLength = category.length || 30;
                    packageBreadth = category.breadth || category.width || 26;
                    packageHeight = category.height || 10;
                    packageWeight = category.weight || 0.5;
                }
            }
        }

        // Step 4: Create order in Shiprocket
        const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';

        console.log('Creating Shiprocket order:', {
            order_number: order.order_number,
            pickup_location: pickupLocation,
            delivery_pincode: address.pincode,
            dimensions: `${packageLength}×${packageBreadth}×${packageHeight} cm`,
            weight: `${packageWeight} kg`,
        });

        const shiprocketOrderResponse = await createOrder({
            order_id: order.order_number,
            order_date: new Date(order.created_at).toISOString().split('T')[0],
            pickup_location: pickupLocation,
            billing_customer_name: address.name || 'Customer',
            billing_last_name: '',
            billing_address: address.line1 || '',
            billing_city: address.city || '',
            billing_pincode: address.pincode,
            billing_state: address.state || '',
            billing_country: 'India',
            billing_email: address.email || 'noreply@novino.com',
            billing_phone: address.phone || '9999999999',
            shipping_is_billing: true,
            order_items: (order.items || []).map((item: any) => ({
                name: item.name,
                sku: item.sku || item.productId || item.id, // Use human-readable SKU first
                units: item.quantity,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: 0,
            })),
            payment_method: order.payment_status === 'paid' ? 'Prepaid' : 'COD',
            sub_total: order.total,
            length: packageLength,
            breadth: packageBreadth,
            height: packageHeight,
            weight: packageWeight,
        });

        console.log('Shiprocket response:', shiprocketOrderResponse);

        // Check if order creation was successful
        if (!shiprocketOrderResponse.order_id || !shiprocketOrderResponse.shipment_id) {
            return NextResponse.json(
                {
                    error: 'Failed to create Shiprocket order',
                    details: shiprocketOrderResponse,
                },
                { status: 400 }
            );
        }

        // Step 5: Save to Supabase with dimensions
        await supabase.from('shipments').insert({
            order_id: order.id,
            shiprocket_order_id: shiprocketOrderResponse.order_id,
            shiprocket_shipment_id: shiprocketOrderResponse.shipment_id,
            status: 'CREATED',
            courier_name: 'Pending Assignment',
            metadata: {
                created_at: new Date().toISOString(),
                message: 'Order created successfully',
                dimensions: {
                    length: packageLength,
                    breadth: packageBreadth,
                    height: packageHeight,
                    weight: packageWeight,
                },
            },
        });

        return NextResponse.json({
            success: true,
            order_id: shiprocketOrderResponse.order_id,
            shipment_id: shiprocketOrderResponse.shipment_id,
            message: '✅ Order created in Shiprocket! Now assign courier.',
            instructions: 'Login to Shiprocket → Orders → Find this order → Click "Ready to Ship" → Assign Courier',
        });

    } catch (error: any) {
        console.error('Shiprocket ship error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create shipment' },
            { status: 500 }
        );
    }
}
