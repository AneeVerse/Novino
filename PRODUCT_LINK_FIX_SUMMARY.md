# Product Link and Category Filter Fix

## Date: November 12, 2025

## Issues Fixed

### Issue 1: Product Cards Opening Fallback Data ✅

**Problem:** When clicking on product cards from the homepage or artefacts page, the product detail page was showing "Fallback Data" instead of the actual product details.

**Root Cause:** The `/api/products/[id]` endpoint was only searching in the old `products` collection, but the new product system stores products inside the `productCategories` collection.

**Solution:** Updated `pages/api/products/[id].ts` to search in BOTH collections:
1. First searches in the old `products` collection (for backward compatibility)
2. If not found, searches in the `productCategories` collection
3. When found in `productCategories`, transforms the product data to match the expected format

**Code Changes:**
- File: `pages/api/products/[id].ts`
- Lines: 115-144 (added fallback search logic)

**How it works:**
```typescript
// If product not found in products collection...
const categoryWithProduct = await productCategoriesCollection.findOne({
  'products.id': id as string
});

// Find the specific product within the category
const foundProduct = categoryWithProduct.products?.find((p: any) => p.id === id);

// Transform to expected format
product = {
  ...foundProduct,
  _id: foundProduct.id,
  id: foundProduct.id,
  price: foundProduct.basePrice,
  image: foundProduct.images?.[0] || '',
  category: categoryWithProduct._id.toString(),
  type: 'artefact',
  description: foundProduct.description || '',
};
```

### Issue 2: Category Filtering Logic ✅

**Expected Behavior:**
- **Homepage:** Show ONE product per category (the first/top product from drag-and-drop order)
- **Artefacts Page - "All Products" selected:** Show ALL products from ALL categories
- **Artefacts Page - Specific category selected:** Show ALL products from that specific category only

**Current Implementation:**
The artefacts page (`app/(main)/artefacts/page.tsx`) already:
1. Fetches ALL products from all categories (lines 66-99)
2. Passes them to the `ProductGrid` component
3. The `ProductGrid` component handles the category filtering automatically

This is working correctly as designed. When "All Products" is selected, all products are shown. When a specific category is clicked, only products from that category are displayed.

## Testing Instructions

1. **Restart your development server:**
   ```powershell
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Test Product Links:**
   - Go to the homepage (localhost:3000)
   - Click on any product card
   - Verify that:
     - The correct product details load (not fallback data)
     - The "Fallback Data" badge should NOT appear
     - Product name, images, description, and price are correct
     - Category information appears in the "About" section

3. **Test Category Filtering on Artefacts Page:**
   - Go to `/artefacts` page
   - Click "All Products" - should show all products from all categories
   - Click a specific category name - should show only products from that category
   - Verify product counts match expectations

4. **Test Homepage Display:**
   - Verify homepage shows only ONE product per category
   - The product shown should be the first/top product (based on drag-and-drop order in dashboard)

## Technical Notes

- The API now supports both old and new product systems
- Product IDs from the new system (timestamp-based strings) are properly handled
- Category information is correctly passed from the `productCategories` collection
- No breaking changes to existing functionality

## Next Steps (Optional Enhancements)

1. Consider migrating all old products from the `products` collection to the new `productCategories` system
2. Add product slug support for better SEO URLs
3. Add caching for improved performance
4. Consider adding a migration script to move old products to the new system

