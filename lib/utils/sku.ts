/**
 * SKU Generation Utilities
 * Creates human-friendly SKU codes from product names
 */

/**
 * Generate a clean SKU prefix from a product name
 * Examples:
 *   "Butterfly Artefact" → "BUTTER"
 *   "Life Cycle" → "LIFECYC"
 *   "Beach Sunset Painting" → "BEACHSUN"
 */
export function generateSkuPrefix(productName: string, maxLength: number = 8): string {
    // Remove special characters and spaces
    const cleaned = productName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');

    // Take first maxLength characters
    return cleaned.substring(0, maxLength);
}

/**
 * Generate a complete SKU code
 * Format: PREFIX-NNN (e.g., "BUTTER-001", "LIFECYC-042")
 */
export function generateSku(productName: string, sequenceNumber: number = 1): string {
    const prefix = generateSkuPrefix(productName);
    const sequence = sequenceNumber.toString().padStart(3, '0');
    return `${prefix}-${sequence}`;
}

/**
 * Generate SKU with category prefix
 * Format: CATEGORY-PREFIX-NNN (e.g., "PAINT-BEACH-001", "ART-BUTTER-001")
 */
export function generateCategorySku(
    categoryName: string,
    productName: string,
    sequenceNumber: number = 1
): string {
    const catPrefix = generateSkuPrefix(categoryName, 5);
    const prodPrefix = generateSkuPrefix(productName, 5);
    const sequence = sequenceNumber.toString().padStart(3, '0');
    return `${catPrefix}-${prodPrefix}-${sequence}`;
}

/**
 * Parse SKU to get readable components
 * "BUTTER-001" → { prefix: "BUTTER", sequence: 1 }
 */
export function parseSku(sku: string): { prefix: string; sequence: number } | null {
    const match = sku.match(/^([A-Z0-9]+)-(\d+)$/);
    if (!match) return null;

    return {
        prefix: match[1],
        sequence: parseInt(match[2], 10),
    };
}

/**
 * Validate SKU format
 */
export function isValidSku(sku: string): boolean {
    return /^[A-Z0-9]+-\d{3,}$/.test(sku);
}

/**
 * Get next sequence number for a product prefix
 * @param existingSkus - Array of existing SKUs with the same prefix
 */
export function getNextSequence(existingSkus: string[]): number {
    if (existingSkus.length === 0) return 1;

    const sequences = existingSkus
        .map(parseSku)
        .filter((parsed): parsed is { prefix: string; sequence: number } => parsed !== null)
        .map(parsed => parsed.sequence);

    if (sequences.length === 0) return 1;

    return Math.max(...sequences) + 1;
}
