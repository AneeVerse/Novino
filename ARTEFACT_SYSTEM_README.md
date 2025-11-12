# New Artefact Category System - Documentation

## Overview
The artefact management system has been completely redesigned with a category-based structure that follows industry-standard product listing patterns (similar to Shopify, WooCommerce, etc.).

## Key Features

### 1. **Category-Based Organization**
- Products (variants) are organized into categories
- Each category has its own card with a thumbnail
- The thumbnail is automatically taken from the first product in the category

### 2. **Create Category**
- Click "Create Category" button (top right)
- A popup modal appears
- Enter category name (e.g., "Mouse Pads", "Desk Mats", "Keyboards")
- Category is created with an empty product list

### 3. **Category Cards**
- Display category name
- Show product count
- Thumbnail from first product
- Click to open full-screen detail view

### 4. **Full-Screen Category Detail View**
- Opens when clicking a category card
- Industry-standard overlay interface
- Shows all products (variants) in that category
- "Add Product" button to add new variants

### 5. **Add/Edit Products (Variants)**
- Simplified form with only:
  - **Basic Info Section:**
    - Product Name
    - Price
    - Description
    - Quantity
    - Product Images (multiple)
  - **Meta Section:**
    - Meta Description (for SEO)

### 6. **Drag & Drop Reordering**
- Products can be reordered by dragging
- Grab handle on the left of each product card
- The first product's image becomes the category thumbnail
- Order is automatically saved

### 7. **Product Display**
- Each product shows:
  - Thumbnail image
  - Name, description, price
  - Quantity and image count
  - Edit and Delete buttons
- Products are displayed as cards in a list

## Technical Implementation

### New API Routes
- `GET /api/artefact-categories` - Fetch all categories
- `POST /api/artefact-categories` - Create new category
- `GET /api/artefact-categories/[id]` - Fetch single category
- `PUT /api/artefact-categories/[id]` - Update category (including products)
- `DELETE /api/artefact-categories/[id]` - Delete category

### Data Structure
```typescript
interface ArtefactCategory {
  _id?: string;
  id?: string;
  name: string;
  products: ArtefactProduct[];
  createdAt: string;
  updatedAt?: string;
}

interface ArtefactProduct {
  id: string;
  name: string;
  description: string;
  basePrice: string;
  quantity: number;
  images: string[];
  metaDescription?: string;
  order: number; // For drag-and-drop ordering
  createdAt: string;
}
```

### Components Created
1. `ArtefactCategoryModal` - Create category popup
2. `ArtefactCategoryGrid` - Display category cards
3. `ArtefactCategoryDetail` - Full-screen category view with drag-drop
4. `ArtefactProductForm` - Add/Edit product form (Basic + Meta only)

### Database Collection
- Collection: `artefactCategories`
- Each document contains the category and all its products

## User Flow

1. **Dashboard → Artefacts Tab**
   - See all category cards
   - Click "Create Category" (top right)

2. **Create Category**
   - Modal popup opens
   - Enter category name
   - Click "Create Category"

3. **Click Category Card**
   - Full-screen overlay opens
   - See all products in category
   - Empty state if no products

4. **Add Products**
   - Click "Add Product"
   - Fill in Basic Info (name, price, description, quantity, images)
   - Fill in Meta (meta description)
   - Click "Add Product"

5. **Reorder Products**
   - Drag products by the grip handle
   - Drop to new position
   - First product's image = category thumbnail

6. **Edit/Delete Products**
   - Click Edit icon to modify
   - Click Delete icon to remove

## Migration Notes
- Old artefact system is replaced entirely
- New system starts fresh (no migration of old data)
- Old artefacts can still be accessed if needed
- API routes remain separate from old product system

## Benefits
✅ Industry-standard UI/UX
✅ Better organization with categories
✅ Simple product form (Basic + Meta only)
✅ Intuitive drag-and-drop reordering
✅ First product = category thumbnail
✅ Full-screen overlay for better focus
✅ Clean, modern design with Novino branding

## Notes
- Categories are specific to artefacts only
- Each category can have unlimited products (variants)
- Products are stored within the category document
- Drag-and-drop uses @dnd-kit library (industry standard)
- All forms have validation and error handling

