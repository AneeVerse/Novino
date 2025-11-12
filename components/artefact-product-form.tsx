"use client";

import { useState, useEffect } from 'react';
import { X, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { ArtefactProduct } from '@/app/dashboard/models/artefact';

interface ArtefactProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<ArtefactProduct, 'id' | 'order' | 'createdAt'>) => void;
  product?: ArtefactProduct; // For editing
}

export default function ArtefactProductForm({ isOpen, onClose, onSubmit, product }: ArtefactProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    quantity: 1,
    images: [] as string[],
    metaDescription: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        quantity: product.quantity,
        images: product.images,
        metaDescription: product.metaDescription || '',
      });
    } else {
      // Reset form when adding new product
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        quantity: 1,
        images: [],
        metaDescription: '',
      });
      setImageInput('');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.basePrice.trim()) {
      return; // Form validation - fields will show as required
    }

    if (formData.images.length === 0) {
      return; // Form validation - at least one image needed
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        quantity: 1,
        images: [],
        metaDescription: '',
      });
      setImageInput('');
      
      // Close form immediately after successful submit
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      // Error handling - form will remain open for retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333333]">
          <h2 className="text-2xl font-bold text-white">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mouse Pad 1"
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Price <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="e.g., $100 or 100"
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product..."
                rows={4}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                min="0"
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Product Images <span className="text-red-400">*</span>
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1 px-4 py-2.5 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <Upload className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg border-2 border-[#333333] overflow-hidden bg-[#0A0A0A]">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded">
                        Thumbnail
                      </div>
                    )}
                  </div>
                ))}
                
                {formData.images.length === 0 && (
                  <div className="aspect-square rounded-lg border-2 border-dashed border-[#333333] flex flex-col items-center justify-center text-white/30">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">No images</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Meta Section */}
          <div className="space-y-4 pt-6 border-t border-[#333333]">
            <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              Meta Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="SEO description for this product..."
                rows={3}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#222222] text-white/80 rounded-lg hover:bg-[#2A2A2A] hover:text-white transition-all border border-[#333333]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

