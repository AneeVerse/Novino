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
export function getProductUrl(product: { id: string | number; slug?: string }): string {
  return `/product/${product.slug || product.id}`;
}
