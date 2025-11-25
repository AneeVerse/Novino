/**
 * API Route: Get Available Couriers for Order
 * POST /api/shiprocket/get-couriers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceability } from '@/lib/shiprocket/orders';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

type Dimensions = {
    length: number;
    breadth: number;
    height: number;
    weight: number;
};

const DEFAULT_DIMENSIONS: Dimensions = {
    length: 30,
    breadth: 26,
    height: 10,
    weight: 0.5,
};

const getDefaultPickupPincode = () =>
    process.env.SHIPROCKET_WAREHOUSE_PINCODE ||
    process.env.SHIPROCKET_PICKUP_PINCODE ||
    '400614';

function sanitizeNumber(value: any, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

async function resolveDimensions(
    order: any,
    supabase: ReturnType<typeof getSupabaseServiceRoleClient>,
    shipmentDimensions?: Partial<Dimensions> | null
): Promise<Dimensions> {
    // Priority 1: Use stored shipment dimensions if available
    if (shipmentDimensions?.length && shipmentDimensions?.breadth && shipmentDimensions?.height && shipmentDimensions?.weight) {
        console.log('[Courier] Using stored shipment dimensions:', shipmentDimensions);
        return {
            length: shipmentDimensions.length,
            breadth: shipmentDimensions.breadth,
            height: shipmentDimensions.height,
            weight: shipmentDimensions.weight,
        };
    }

    // Priority 2: Look up dimensions from product category
    const dimensions = { ...DEFAULT_DIMENSIONS };
    const firstItem = Array.isArray(order.items) ? order.items[0] : null;
    
    if (!firstItem) {
        console.log('[Courier] No items in order, using defaults:', dimensions);
        return dimensions;
    }

    let categoryId =
        firstItem?.categoryId ||
        firstItem?.category_id ||
        firstItem?.category?.id ||
        null;

    // If categoryId not in item, find it by searching categories for this product
    // Priority: productId > SKU > name (to avoid matching wrong category when same SKU/name exists in multiple categories)
    const productId = firstItem.productId || firstItem.id;
    const itemSku = firstItem.sku;
    const itemName = firstItem.name;
    
    if (!categoryId && productId) {
        try {
            const { data: allCategories } = await supabase
                .from('product_categories')
                .select('id, name, products, length, width, breadth, height, weight');
            
            if (allCategories) {
                let foundCategory: any = null;
                const productIdStr = String(productId);
                const itemSkuUpper = itemSku ? itemSku.trim().toUpperCase() : '';
                const itemNameLower = itemName ? itemName.trim().toLowerCase() : '';
                
                // First pass: Try exact productId match (most reliable)
                for (const cat of allCategories) {
                    if (Array.isArray(cat.products)) {
                        const product = cat.products.find((p: any) => {
                            const pIdStr = p.id ? String(p.id) : '';
                            const pIdStrAlt = p._id ? String(p._id) : '';
                            return pIdStr === productIdStr || pIdStrAlt === productIdStr;
                        });
                        if (product) {
                            foundCategory = cat;
                            categoryId = cat.id;
                            console.log('[Courier] Found category by productId:', cat.name, 'productId:', productIdStr);
                            break;
                        }
                    }
                }
                
                // Second pass: If no productId match, try SKU match
                if (!foundCategory && itemSkuUpper) {
                    for (const cat of allCategories) {
                        if (Array.isArray(cat.products)) {
                            const product = cat.products.find((p: any) => {
                                const pSku = p.sku ? p.sku.trim().toUpperCase() : '';
                                return itemSkuUpper && pSku && itemSkuUpper === pSku;
                            });
                            if (product) {
                                foundCategory = cat;
                                categoryId = cat.id;
                                console.log('[Courier] Found category by SKU:', cat.name, 'SKU:', itemSkuUpper);
                                break;
                            }
                        }
                    }
                }
                
                // Third pass: If still no match, try name match (least reliable)
                if (!foundCategory && itemNameLower) {
                    for (const cat of allCategories) {
                        if (Array.isArray(cat.products)) {
                            const product = cat.products.find((p: any) => {
                                const pName = p.name ? p.name.trim().toLowerCase() : '';
                                return itemNameLower && pName && itemNameLower === pName;
                            });
                            if (product) {
                                foundCategory = cat;
                                categoryId = cat.id;
                                console.log('[Courier] Found category by name:', cat.name, 'name:', itemNameLower);
                                break;
                            }
                        }
                    }
                }
                
                // If we found a category, use its dimensions directly
                if (foundCategory && foundCategory.length && Number(foundCategory.length) > 0) {
                    dimensions.length = sanitizeNumber(foundCategory.length);
                    if (foundCategory.breadth && Number(foundCategory.breadth) > 0) {
                        dimensions.breadth = sanitizeNumber(foundCategory.breadth);
                    } else if (foundCategory.width && Number(foundCategory.width) > 0) {
                        dimensions.breadth = sanitizeNumber(foundCategory.width);
                    }
                    dimensions.height = sanitizeNumber(foundCategory.height);
                    dimensions.weight = sanitizeNumber(foundCategory.weight);
                    console.log(`[Courier] Using dimensions from category "${foundCategory.name}":`, dimensions);
                    return dimensions;
                }
            }
        } catch (error) {
            console.warn('[Courier] Failed to search categories for product:', error);
        }
    }

    if (categoryId) {
        try {
            const { data: category } = await supabase
                .from('product_categories')
                .select('length, width, breadth, height, weight, name')
                .eq('id', categoryId)
                .single();

            if (category) {
                // Only use category dimensions if they're actually set (not 0 or null)
                if (category.length && Number(category.length) > 0) {
                    dimensions.length = sanitizeNumber(category.length);
                }
                if (category.breadth && Number(category.breadth) > 0) {
                    dimensions.breadth = sanitizeNumber(category.breadth);
                } else if (category.width && Number(category.width) > 0) {
                    dimensions.breadth = sanitizeNumber(category.width);
                }
                if (category.height && Number(category.height) > 0) {
                    dimensions.height = sanitizeNumber(category.height);
                }
                if (category.weight && Number(category.weight) > 0) {
                    dimensions.weight = sanitizeNumber(category.weight);
                }
                console.log(`[Courier] Using dimensions from category "${category.name}":`, dimensions);
            } else {
                console.log('[Courier] Category not found, using defaults:', dimensions);
            }
        } catch (error) {
            console.warn('[Courier] Failed to load category dimensions:', error);
        }
    } else {
        console.log('[Courier] No categoryId found, using defaults:', dimensions);
    }

    return dimensions;
}

export async function POST(request: NextRequest) {
    try {
        const { order_id } = await request.json();

        if (!order_id) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServiceRoleClient();
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        const address = order.delivery_address || {};
        if (!address?.pincode) {
            return NextResponse.json(
                { error: 'Order missing delivery pincode' },
                { status: 400 }
            );
        }

        const { data: shipmentRows } = await supabase
            .from('shipments')
            .select('shiprocket_shipment_id, metadata')
            .eq('order_id', order.id)
            .order('created_at', { ascending: false })
            .limit(1);

        const shipment = shipmentRows && shipmentRows.length > 0 ? shipmentRows[0] : null;
        const shipmentDimensions = shipment?.metadata?.dimensions ?? null;
        const dimensions = await resolveDimensions(order, supabase, shipmentDimensions);

        const pickupPostcode = getDefaultPickupPincode();
        const declaredValue = sanitizeNumber(order.total ?? order.subtotal, 0);
        const paymentMethod = (order.payment_method || '').toString().toLowerCase();
        const codFlag = paymentMethod.includes('cod') ? 1 : 0;

        const serviceability = await getServiceability({
            pickup_postcode: pickupPostcode,
            delivery_postcode: address.pincode,
            weight: dimensions.weight,
            length: dimensions.length,
            breadth: dimensions.breadth,
            height: dimensions.height,
            declared_value: declaredValue,
            cod: codFlag,
            shipment_id: shipment?.shiprocket_shipment_id,
            rate_calculator: 1,
        });

        const couriers = serviceability.data.available_courier_companies;
        const recommendedId =
            (serviceability.data as any)?.recommended_courier_company_id ||
            (serviceability.data as any)?.shiprocket_recommended_courier_id ||
            null;
        const promiseRecommendedId = (serviceability.data as any)?.promise_recommended_courier_company_id || null;

        console.log('[Shiprocket][Serviceability] meta', {
            availableCount: couriers?.length || 0,
            keys: Object.keys(serviceability.data || {}),
            recommendedId,
            promiseRecommendedId,
        });

        if (!couriers || couriers.length === 0) {
            return NextResponse.json(
                { error: 'No couriers available for this route' },
                { status: 400 }
            );
        }

        couriers.sort((a, b) => (sanitizeNumber(a.rate) || 0) - (sanitizeNumber(b.rate) || 0));

        return NextResponse.json({
            success: true,
            couriers: couriers.map((c) => {
                const totalRate =
                    sanitizeNumber((c as any).total_amount) ||
                    sanitizeNumber((c as any).charges) ||
                    sanitizeNumber(c.rate);

                return {
                    id: c.courier_company_id,
                    name: c.courier_name,
                    rate: sanitizeNumber(c.rate),
                    total_rate: totalRate,
                    estimated_delivery_days: c.estimated_delivery_days,
                    freight_charge: sanitizeNumber(c.freight_charge),
                    cod_charges: sanitizeNumber(c.cod_charges),
                    chargeable_weight: sanitizeNumber((c as any).chargeable_weight, dimensions.weight),
                    fuel_surcharge: sanitizeNumber((c as any).fuel_surcharge),
                    rto_charges: sanitizeNumber((c as any).rto_charges),
                    rating: sanitizeNumber((c as any).rating, c.delivery_performance),
                    pickup_date: (c as any).pickup_date,
                    delivery_type: (c as any).delivery_type ?? ((c as any).is_surface ? 'Surface' : 'Air'),
                };
            }),
        });

    } catch (error: any) {
        console.error('Get couriers error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get couriers' },
            { status: 500 }
        );
    }
}
