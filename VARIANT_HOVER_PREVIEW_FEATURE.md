# Variant Hover Preview Feature

## Date: November 12, 2025

## Feature Overview

Implemented an interactive "Select Variant" section with hover preview functionality where:
- **Hover** over a variant thumbnail → Preview changes (image, name, description, price)
- **Click** on a variant thumbnail → Select and lock the variant
- **Fallback:** If no variants exist, shows similar products from the same category

---

## How It Works

### Hover to Preview
When you hover over a variant thumbnail:
- ✅ Main product image changes to variant image
- ✅ Product name changes to variant name
- ✅ Product description changes to variant description
- ✅ Price changes to variant price
- ✅ Image thumbnails switch to variant images
- ✅ Shows "Previewing: [Variant Name] • Click to select" hint
- ✅ Border turns lighter to indicate hover state

### Click to Select
When you click on a variant thumbnail:
- ✅ Variant is selected and locked in
- ✅ White border with shadow indicates selection
- ✅ Shows "Selected: [Variant Name]" below thumbnails
- ✅ All changes remain permanent until another variant is clicked
- ✅ Product stays selected when mouse leaves

### Default Option
- First thumbnail shows the original product
- Click "Default" to return to original product view
- Hover "Default" to preview original product

### Fallback Behavior
- If product has NO variants → Shows "Similar Products" instead
- Similar products are clickable links to other products in the same category
- Up to 6 similar products displayed

---

## Visual States

### Variant States
```
┌─────────────────────────────┐
│  SELECT VARIANT             │
├─────────────────────────────┤
│                             │
│  [Default] [V1] [V2] [V3]  │
│     ⬜      ⬜   ⬜   ⬜     │
│                             │
│  Selected: Variant 1        │
│  Type: frame                │
└─────────────────────────────┘

States:
⬜ Default/Unselected - White/20 border, 70% opacity
🔲 Hover Preview - White/60 border, 100% opacity
🟦 Selected - White border with shadow
```

### Preview Hint
```
Previewing: Blue Frame • Click to select
```

---

## Implementation Details

### State Management
```typescript
const [selectedVariant, setSelectedVariant] = useState<any>(null);
const [hoveredVariant, setHoveredVariant] = useState<any>(null);
```

### Display Priority
```typescript
// Priority: hoveredVariant > selectedVariant > original product
const activeVariant = hoveredVariant || selectedVariant;

const displayedName = activeVariant?.name || product.name;
const displayedDescription = activeVariant?.description || product.description;
const displayedPrice = activeVariant?.price || productPrice;
const displayedImage = variantImages || productImage;
```

### Hover Events
```typescript
<button
  onMouseEnter={() => setHoveredVariant(variant)}  // Preview on hover
  onMouseLeave={() => setHoveredVariant(null)}     // Remove preview
  onClick={() => setSelectedVariant(variant)}       // Select on click
>
```

---

## User Experience Flow

### Scenario 1: Product with Variants
1. User lands on product page → Sees original product
2. User hovers over "Blue Frame" variant → Sees blue frame preview
3. User hovers over "Red Frame" variant → Sees red frame preview
4. User clicks "Blue Frame" → Blue frame selected and locked
5. User can hover other variants to preview, but blue frame stays selected
6. User clicks "Default" → Returns to original product

### Scenario 2: Product without Variants
1. User lands on product page → Sees original product
2. Right sidebar shows "Similar Products" instead of "Select Variant"
3. User can click similar products to navigate to them

---

## Dynamic Content Changes

When hovering or selecting a variant, the following elements change:

### Left Column (About Section)
- ✅ Product name (with smooth opacity transition)
- ✅ Product description (with smooth opacity transition)

### Center Column (Image)
- ✅ Main product image
- ✅ Thumbnail gallery images
- ✅ Image count/navigation

### Right Column (Price/Info)
- ✅ Price display
- ✅ Selected variant information

---

## Transitions & Animations

- **Opacity transitions:** 300ms on name/description changes
- **Border transitions:** 300ms on hover/select states
- **Smooth switching:** Between variant previews
- **Visual feedback:** Different border colors for hover vs selected

---

## Conditional Logic

### Show Variants
```typescript
if (allVariants.length > 0) {
  // Show "Select Variant" section
  // Display: Default + All Variants
}
```

### Show Similar Products
```typescript
if (allVariants.length === 0 && similarProducts.length > 0) {
  // Show "Similar Products" section
  // Display: Up to 6 related products
}
```

---

## Benefits

✅ **Better Product Discovery** - Preview before committing
✅ **Instant Feedback** - See changes immediately on hover
✅ **Clear Selection** - Visual indicators for selected state
✅ **Flexible System** - Works with variants OR similar products
✅ **Smooth UX** - Transitions make changes feel polished
✅ **Informed Decisions** - See exactly what you're getting before selecting

---

## Testing

1. **Go to a product with variants** (if you have any)
2. **Hover over variants** → Should see image, name, description, price change
3. **Click a variant** → Should lock in the selection
4. **Hover other variants** → Should preview but keep selection
5. **Click "Default"** → Should return to original product
6. **Go to a product without variants** → Should show similar products

---

All done! The hover preview system is now fully functional! 🎨✨

