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
  testimonialImage?: string; // Separate image for testimonial section
  order: number; // For drag-and-drop ordering
  createdAt: string;
  // Pack Product fields - for products that need custom dimensions (e.g., pack of 5)
  packProduct?: boolean; // When true, product name is always visible in variant selector
  length?: number; // Shipping dimension - overrides category
  width?: number; // Shipping dimension - overrides category
  breadth?: number; // Shipping dimension - overrides category
  height?: number; // Shipping dimension - overrides category
  weight?: number; // Shipping dimension - overrides category
}

export interface ArtefactCategory {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  order?: number;
  products: ArtefactProduct[];
  createdAt: string;
  updatedAt?: string;
  careGuide?: string;
  measurement?: string;
  gsm?: string;
  size?: string;
  thickness?: string;
  frame?: string;
  structure?: string;
  material?: string;
  length?: number;
  width?: number;
  breadth?: number;
  height?: number;
  weight?: number;
}

// Aliases for clarity (same interfaces, different names)
export type ProductCategory = ArtefactCategory;
export type Product = ArtefactProduct;

