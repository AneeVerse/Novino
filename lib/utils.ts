import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a price to Indian Rupee format: Rs. XXX.00
 * @param price - Can be a number, string with/without currency symbols
 * @returns Formatted string like "Rs. 799.00"
 */
export function formatPrice(price: number | string): string {
  // Convert to number if string
  let numPrice: number;
  
  if (typeof price === 'string') {
    // Remove any currency symbols and commas
    const cleanPrice = price.replace(/[Rs.₹$,\s]/g, '');
    numPrice = parseFloat(cleanPrice);
  } else {
    numPrice = price;
  }
  
  // Handle invalid numbers
  if (isNaN(numPrice)) {
    return 'Rs. 0.00';
  }
  
  // Format to 2 decimal places
  const formatted = numPrice.toFixed(2);
  
  return `Rs. ${formatted}`;
}

/**
 * Get product URL - uses slug if available, otherwise falls back to ID
 */
export function slugifySegment(
  value: string | number | undefined | null,
  options: { fallback?: string } = {}
): string {
  const fallback = options.fallback ?? '';
  if (value === undefined || value === null) {
    return fallback;
  }

  const normalized = value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized.length > 0 ? normalized : fallback;
}

type ProductUrlInput = {
  id?: string | number
  slug?: string
  category?: string
  name?: string
  title?: string
  type?: string
}

export function getProductUrl(product: ProductUrlInput): string {
  const {
    slug,
    category,
    name,
    title,
    type,
    id
  } = product;

  const rawSlug = slug ?? name ?? title ?? (typeof id !== 'undefined' ? id.toString() : '');
  const hasCompositeSlug = typeof slug === 'string' && slug.includes('/');

  const productSlugSegment = slugifySegment(rawSlug, { fallback: 'product' });
  const categorySlugSegment = slugifySegment(category ?? type ?? 'product', { fallback: 'product' });

  const combinedSlug = hasCompositeSlug
    ? slug!.replace(/^\/+|\/+$/g, '')
    : `${categorySlugSegment}/${productSlugSegment}`;

  return `/product/${combinedSlug}`;
}
