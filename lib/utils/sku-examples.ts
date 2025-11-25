/**
 * Example: How to Use SKU Generation
 * 
 * This file shows examples of how to integrate SKU generation
 * when creating or updating products in your dashboard or API routes.
 */

import { generateSku, generateCategorySku, getNextSequence } from '@/lib/utils/sku';

// -----------------------------------------------------------------
// Example 1: Simple SKU Generation
// -----------------------------------------------------------------

// When creating a product named "Butterfly Artefact"
const productName1 = "Butterfly Artefact";
const sku1 = generateSku(productName1, 1);
console.log(sku1); // Output: "BUTTERFLY-001"

// Another product
const productName2 = "Life Cycle";
const sku2 = generateSku(productName2, 1);
console.log(sku2); // Output: "LIFECYCL-001"

// -----------------------------------------------------------------
// Example 2: Category-Based SKU Generation
// -----------------------------------------------------------------

// When creating a product in a specific category
const categoryName = "Paintings";
const productName3 = "Beach Sunset";
const sku3 = generateCategorySku(categoryName, productName3, 1);
console.log(sku3); // Output: "PAINT-BEACH-001"

// -----------------------------------------------------------------
// Example 3: Auto-Increment Sequence Number
// -----------------------------------------------------------------

// Before creating a new product, check existing SKUs
const existingSkus = [
    "BUTTERFLY-001",
    "BUTTERFLY-002",
    "BUTTERFLY-003",
];

const nextSeq = getNextSequence(existingSkus);
console.log(nextSeq); // Output: 4

const newSku = generateSku("Butterfly", nextSeq);
console.log(newSku); // Output: "BUTTERFLY-004"

// -----------------------------------------------------------------
// Example 4: Integration in API Route
// -----------------------------------------------------------------

/*
// In your API route (e.g., app/api/products/route.ts)
import { generateSku } from '@/lib/utils/sku';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = getSupabaseServiceRoleClient();
  
  // Get existing products with similar name to find next sequence
  const { data: existingProducts } = await supabase
    .from('products')
    .select('sku')
    .ilike('sku', `${generateSkuPrefix(body.name)}%`);
  
  const existingSkus = existingProducts?.map(p => p.sku) || [];
  const nextSeq = getNextSequence(existingSkus);
  
  // Generate SKU
  const sku = generateSku(body.name, nextSeq);
  
  // Insert product with SKU
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: body.name,
      sku: sku, // ← Human-readable SKU
      price: body.price,
      // ... other fields
    })
    .select()
    .single();
    
  return NextResponse.json(data);
}
*/

// -----------------------------------------------------------------
// Example 5: Manual SKU Override
// -----------------------------------------------------------------

// You can also let users manually set their own SKUs
// Just validate the format first

import { isValidSku } from '@/lib/utils/sku';

const customSku = "CUSTOM-001";
if (isValidSku(customSku)) {
    console.log("Valid SKU format!"); // ✓
}

const invalidSku = "invalid sku";
if (!isValidSku(invalidSku)) {
    console.log("Invalid SKU format - please use: PREFIX-123"); // ✗
}

// -----------------------------------------------------------------
// Summary
// -----------------------------------------------------------------

/*
Your SKUs will now look like:
❌ Before: 17835249535882
✅ After:  BUTTER-001

Benefits:
1. Easy to remember and communicate
2. Easy to search in dashboard
3. Professional appearance
4. Can include category info
5. Sequential numbering for inventory tracking
*/
