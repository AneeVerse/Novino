export interface ProductVariant {
  id: string;
  name: string;
  type: 'frame' | 'color';
  price?: string;
  quantity: number;
  imageUrl?: string;
}

export interface ProductSpecification {
  title: string;
  content: string; // Rich text HTML content
  imageUrl?: string;
}

export interface ProductFaq {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSection {
  faqs: ProductFaq[];
  imageUrl?: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  basePrice: string;
  quantity: number;
  images: string[]; // Array of image URLs
  category: string;
  type: 'painting' | 'artefact';
  variants: ProductVariant[];
  specifications: ProductSpecification;
  faqSection: FaqSection;
  additionalImageUrl?: string;
  createdAt: string;
  updatedAt?: string;
} 