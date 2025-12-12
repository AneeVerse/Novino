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

        // Fetch categories once for name lookups (and dimensions fallback)
        const { data: allCategories } = await supabase
            .from('product_categories')
            .select('id, name, products, length, width, breadth, height, weight');

        // Try to get exact dimensions from the product's category
        if (order.items && order.items.length > 0) {
            const firstItem = order.items[0];
            let categoryId = firstItem.categoryId || firstItem.category_id;
            let foundCategory: any = null;
            
            console.log('[Shiprocket][Dimensions] Looking up dimensions for item:', {
                itemId: firstItem.id,
                productId: firstItem.productId,
                name: firstItem.name,
                categoryId: categoryId
            });
            
            // If categoryId not in item, find it by searching categories for this product
            // Priority: productId > SKU > name (to avoid matching wrong category when same SKU/name exists in multiple categories)
            if (!categoryId) {
                if (allCategories) {
                    const productId = firstItem.productId || firstItem.id;
                    const productIdStr = productId ? String(productId) : '';
                    const itemSku = firstItem.sku ? firstItem.sku.trim().toUpperCase() : '';
                    const itemName = firstItem.name ? firstItem.name.trim().toLowerCase() : '';
                    
                    // First pass: Try exact productId match (most reliable)
                    for (const cat of allCategories) {
                        if (Array.isArray(cat.products)) {
                            const product = cat.products.find((p: any) => {
                                const pIdStr = p.id ? String(p.id) : '';
                                const pIdStrAlt = p._id ? String(p._id) : '';
                                return pIdStr === productIdStr || pIdStrAlt === productIdStr;
                            });
                            if (product) {
                                categoryId = cat.id;
                                foundCategory = cat;
                                console.log('[Shiprocket][Dimensions] Found category by productId:', cat.name, 'productId:', productIdStr);
                                break;
                            }
                        }
                    }
                    
                    // Second pass: If no productId match, try SKU match
                    if (!foundCategory && itemSku) {
                        for (const cat of allCategories) {
                            if (Array.isArray(cat.products)) {
                                const product = cat.products.find((p: any) => {
                                    const pSku = p.sku ? p.sku.trim().toUpperCase() : '';
                                    return itemSku && pSku && itemSku === pSku;
                                });
                                if (product) {
                                    categoryId = cat.id;
                                    foundCategory = cat;
                                    console.log('[Shiprocket][Dimensions] Found category by SKU:', cat.name, 'SKU:', itemSku);
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Third pass: If still no match, try name match (least reliable)
                    if (!foundCategory && itemName) {
                        for (const cat of allCategories) {
                            if (Array.isArray(cat.products)) {
                                const product = cat.products.find((p: any) => {
                                    const pName = p.name ? p.name.trim().toLowerCase() : '';
                                    return itemName && pName && itemName === pName;
                                });
                                if (product) {
                                    categoryId = cat.id;
                                    foundCategory = cat;
                                    console.log('[Shiprocket][Dimensions] Found category by name:', cat.name, 'name:', itemName);
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if (categoryId) {
                // Use already fetched category or fetch it
                if (!foundCategory) {
                    foundCategory = allCategories?.find((cat: any) => cat.id === categoryId) || null;
                }

                if (foundCategory) {
                    // Only use category dimensions if they're actually set (not 0 or null)
                    if (foundCategory.length && Number(foundCategory.length) > 0) {
                        packageLength = Number(foundCategory.length);
                    }
                    if (foundCategory.breadth && Number(foundCategory.breadth) > 0) {
                        packageBreadth = Number(foundCategory.breadth);
                    } else if (foundCategory.width && Number(foundCategory.width) > 0) {
                        packageBreadth = Number(foundCategory.width);
                    }
                    if (foundCategory.height && Number(foundCategory.height) > 0) {
                        packageHeight = Number(foundCategory.height);
                    }
                    if (foundCategory.weight && Number(foundCategory.weight) > 0) {
                        packageWeight = Number(foundCategory.weight);
                    }
                    console.log('[Shiprocket][Dimensions] Using category dimensions:', {
                        category: foundCategory.name,
                        dimensions: `${packageLength}×${packageBreadth}×${packageHeight} cm`,
                        weight: `${packageWeight} kg`
                    });
                } else {
                    console.warn('[Shiprocket][Dimensions] Category not found, using defaults');
                }
            } else {
                console.warn('[Shiprocket][Dimensions] No categoryId found for item, using defaults');
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
            source: 'category_dimensions', // Indicates dimensions came from category
        });

        const resolveCategoryName = (item: any) => {
            if (!allCategories || !Array.isArray(allCategories)) {
                // Fallback to whatever is present inline
                return (
                    item?.category_name ||
                    item?.categoryName ||
                    item?.category ||
                    item?.categoryId ||
                    item?.category_id ||
                    ''
                );
            }

            // Prefer matching against our catalog first (id -> productId/sku/name)
            const categoryId = item?.categoryId || item?.category_id;
            if (categoryId) {
                const cat = allCategories.find((c: any) => c.id === categoryId);
                if (cat?.name) return cat.name;
            }

            const productId = item?.productId || item?.id;
            const productIdStr = productId ? String(productId) : '';
            const itemSku = item?.sku ? item.sku.trim().toUpperCase() : '';
            const itemName = item?.name ? item.name.trim().toLowerCase() : '';

            // First: Try exact productId match (most reliable - same product can't be in multiple categories)
            if (productIdStr) {
                for (const cat of allCategories) {
                    if (!Array.isArray(cat.products)) continue;
                    const product = cat.products.find((p: any) => {
                        const pIdStr = p.id ? String(p.id) : '';
                        const pIdStrAlt = p._id ? String(p._id) : '';
                        return pIdStr === productIdStr || pIdStrAlt === productIdStr;
                    });
                    if (product) {
                        return cat.name || '';
                    }
                }
            }

            // Second: Try SKU match (less reliable - same SKU might exist in multiple categories)
            if (itemSku) {
                for (const cat of allCategories) {
                    if (!Array.isArray(cat.products)) continue;
                    const product = cat.products.find((p: any) => {
                        const pSku = p.sku ? p.sku.trim().toUpperCase() : '';
                        return itemSku && pSku && itemSku === pSku;
                    });
                    if (product) {
                        return cat.name || '';
                    }
                }
            }

            // Third: Try name match (least reliable)
            if (itemName) {
                for (const cat of allCategories) {
                    if (!Array.isArray(cat.products)) continue;
                    const product = cat.products.find((p: any) => {
                        const pName = p.name ? p.name.trim().toLowerCase() : '';
                        return itemName && pName && itemName === pName;
                    });
                    if (product) {
                        return cat.name || '';
                    }
                }
            }

            // Finally, fallback to inline category fields if catalog match not found
            return (
                item?.category_name ||
                item?.categoryName ||
                item?.category ||
                item?.categoryId ||
                item?.category_id ||
                ''
            );
        };

        const buildItemName = (item: any, categoryName?: string) => {
            const design = (item?.name || '').toString().trim();
            const category = (categoryName || resolveCategoryName(item)).toString().trim();
            const combined = [design, category].filter(Boolean).join(' ').trim();
            return combined || design || category || item?.sku || 'Item';
        };

        const orderPayload = {
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
            order_items: (order.items || []).map((item: any) => {
                const categoryName = resolveCategoryName(item);
                const finalName = buildItemName(item, categoryName);
                console.log('[Shiprocket][ItemName] Building name:', {
                    itemId: item.id,
                    productId: item.productId,
                    sku: item.sku,
                    originalName: item.name,
                    categoryName: categoryName,
                    finalName: finalName
                });
                return {
                    name: finalName,
                    sku: item.sku || item.productId || item.id, // Use human-readable SKU first
                    units: item.quantity,
                    selling_price: item.price,
                    discount: 0,
                    tax: 0,
                    hsn: 0,
                };
            }),
            payment_method: order.payment_status === 'paid' ? 'Prepaid' : 'COD',
            sub_total: order.total,
            length: packageLength,
            breadth: packageBreadth,
            height: packageHeight,
            weight: packageWeight,
        };

        console.log('[Shiprocket][CreateOrder] Sending payload with dimensions:', {
            length: orderPayload.length,
            breadth: orderPayload.breadth,
            height: orderPayload.height,
            weight: orderPayload.weight,
            order_id: orderPayload.order_id
        });
        console.log('[Shiprocket][CreateOrder] Order items being sent:', JSON.stringify(orderPayload.order_items, null, 2));

        const shiprocketOrderResponse = await createOrder(orderPayload);

        console.log('[Shiprocket][CreateOrder] Response:', {
            order_id: shiprocketOrderResponse.order_id,
            shipment_id: shiprocketOrderResponse.shipment_id,
            status: shiprocketOrderResponse.status,
            sent_dimensions: {
                length: orderPayload.length,
                breadth: orderPayload.breadth,
                height: orderPayload.height,
                weight: orderPayload.weight
            }
        });

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
