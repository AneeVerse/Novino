'use client';

import { useState } from 'react';
import { generateSku } from '@/lib/utils/sku';

interface SkuGeneratorProps {
    productName: string;
    onSkuChange?: (sku: string) => void;
    initialSku?: string;
}

/**
 * SKU Generator Component
 * Allows manual SKU entry or auto-generation from product name
 */
export function SkuGenerator({ productName, onSkuChange, initialSku = '' }: SkuGeneratorProps) {
    const [sku, setSku] = useState(initialSku);
    const [isManual, setIsManual] = useState(!!initialSku);

    const handleGenerate = () => {
        const generated = generateSku(productName, 1);
        setSku(generated);
        onSkuChange?.(generated);
        setIsManual(false);
    };

    const handleManualChange = (value: string) => {
        const formatted = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        setSku(formatted);
        onSkuChange?.(formatted);
        setIsManual(true);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
                SKU (Stock Keeping Unit)
            </label>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={sku}
                    onChange={(e) => handleManualChange(e.target.value)}
                    placeholder="PRODUCT-001"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500"
                />

                <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!productName}
                    className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 rounded-lg text-teal-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Auto-Generate
                </button>
            </div>

            {sku && (
                <div className="flex items-center gap-2 text-xs text-white/50">
                    {isManual ? (
                        <span>✏️ Custom SKU</span>
                    ) : (
                        <span>✨ Auto-generated from product name</span>
                    )}
                </div>
            )}

            {!productName && (
                <p className="text-xs text-amber-400">
                    ℹ️ Enter product name first to auto-generate SKU
                </p>
            )}

            {sku && /^[A-Z0-9]+-\d{3}$/.test(sku) && (
                <p className="text-xs text-green-400">
                    ✓ Valid SKU format
                </p>
            )}
        </div>
    );
}

/**
 * Simple SKU Display Component
 * For showing SKU in order lists, product cards, etc.
 */
interface SkuBadgeProps {
    sku: string;
    className?: string;
}

export function SkuBadge({ sku, className = '' }: SkuBadgeProps) {
    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-teal-500/10 border border-teal-500/30 rounded text-xs font-mono text-teal-400 ${className}`}>
            <span className="text-white/40">SKU:</span>
            <span className="font-semibold">{sku}</span>
        </div>
    );
}
