/**
 * Utility functions for handling image URLs
 */

// List of allowed image domains (should match the ones in next.config.mjs)
const allowedImageDomains = [
  'res.cloudinary.com',
  'images.unsplash.com',
  'img.freepik.com',
  'i.imgur.com',
  'lh3.googleusercontent.com',
  'githubusercontent.com',
  'cloudinary.com',
];

/**
 * Checks if an image URL is from a whitelisted domain
 * @param url The image URL to check
 * @returns boolean indicating if the URL is allowed
 */
export function isAllowedImageDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return allowedImageDomains.some(domain => urlObj.hostname.includes(domain));
  } catch (e) {
    // If URL is invalid, return false
    return false;
  }
}

/**
 * Gets a fallback image URL if the provided URL is not allowed
 * @param url The image URL to check
 * @param fallbackUrl The fallback URL to use if the provided URL is not allowed
 * @returns The original URL if allowed, otherwise the fallback URL
 */
export function getValidImageUrl(url: string, fallbackUrl: string = '/images/default-image.png'): string {
  if (!url) return fallbackUrl;
  
  return isAllowedImageDomain(url) ? url : fallbackUrl;
}

/**
 * Extract a public ID from a Cloudinary URL
 * @param url Cloudinary URL
 * @returns The public ID or null if not a valid Cloudinary URL
 */
export function getCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  try {
    // Example: https://res.cloudinary.com/demo/image/upload/v1612447788/sample.jpg
    const pattern = /cloudinary\.com\/[^\/]+\/image\/upload(?:\/[^\/]+)*\/([^\/]+)(?:\.[^\.]+)?$/;
    const match = url.match(pattern);
    
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
} 