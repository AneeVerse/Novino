import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a price to a currency string
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Get product URL - uses slug if available, otherwise falls back to ID
 */
export function getProductUrl(product: { id: string | number; slug?: string }): string {
  return `/product/${product.slug || product.id}`;
}
