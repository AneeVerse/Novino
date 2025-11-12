// Product Category and Product Models
// Note: File name kept as artefact.ts for backward compatibility
// but these are now used for all product types

export interface ArtefactProduct {
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

export interface ArtefactCategory {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  products: ArtefactProduct[];
  createdAt: string;
  updatedAt?: string;
}

// Aliases for clarity (same interfaces, different names)
export type ProductCategory = ArtefactCategory;
export type Product = ArtefactProduct;

