"use client";

import { useState, useEffect } from 'react';
import { X, Upload, Trash2, Image as ImageIcon, ArrowLeft, ArrowRight } from 'lucide-react';
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
    testimonialImage: '',
    packProduct: false,
    length: '',
    width: '',
    breadth: '',
    height: '',
    weight: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInput, setImageInput] = useState('');
  const [testimonialImageInput, setTestimonialImageInput] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        quantity: product.quantity,
        images: product.images,
        metaDescription: product.metaDescription || '',
        testimonialImage: product.testimonialImage || '',
        packProduct: product.packProduct || false,
        length: product.length?.toString() || '',
        width: product.width?.toString() || '',
        breadth: product.breadth?.toString() || '',
        height: product.height?.toString() || '',
        weight: product.weight?.toString() || '',
      });
      setTestimonialImageInput(product.testimonialImage || '');
    } else {
      // Reset form when adding new product
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        quantity: 1,
        images: [],
        metaDescription: '',
        testimonialImage: '',
        packProduct: false,
        length: '',
        width: '',
        breadth: '',
        height: '',
        weight: '',
      });
      setImageInput('');
      setTestimonialImageInput('');
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
      // Prepare form data with proper types for dimensions
      const submitData = {
        name: formData.name,
        description: formData.description,
        basePrice: formData.basePrice,
        quantity: formData.quantity,
        images: formData.images,
        metaDescription: formData.metaDescription,
        testimonialImage: formData.testimonialImage,
        packProduct: formData.packProduct,
        ...(formData.packProduct && formData.length ? { length: parseFloat(formData.length) } : {}),
        ...(formData.packProduct && formData.width ? { width: parseFloat(formData.width) } : {}),
        ...(formData.packProduct && formData.breadth ? { breadth: parseFloat(formData.breadth) } : {}),
        ...(formData.packProduct && formData.height ? { height: parseFloat(formData.height) } : {}),
        ...(formData.packProduct && formData.weight ? { weight: parseFloat(formData.weight) } : {}),
      };
      await onSubmit(submitData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        quantity: 1,
        images: [],
        metaDescription: '',
        testimonialImage: '',
        packProduct: false,
        length: '',
        width: '',
        breadth: '',
        height: '',
        weight: '',
      });
      setImageInput('');
      setTestimonialImageInput('');
      
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

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newImages.length) {
        return prev; // Out of bounds, no change
      }

      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

      return {
        ...prev,
        images: newImages,
      };
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
                  placeholder="e.g., Rs. 799.00 or 799"
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Pack Product Checkbox */}
            <div className="flex items-center gap-3 py-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.packProduct}
                  onChange={(e) => setFormData({ ...formData, packProduct: e.target.checked })}
                  className="sr-only peer"
                  disabled={isSubmitting}
                />
                <div className="w-5 h-5 border-2 border-[#444444] rounded bg-[#0A0A0A] peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                  {formData.packProduct && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </label>
              <span className="text-sm font-medium text-amber-400">Pack Product</span>
              <span className="text-xs text-white/40">(Name always visible in variant selector)</span>
            </div>

            {/* Shipping Dimensions - Only shown when Pack Product is checked */}
            {formData.packProduct && (
              <div className="space-y-4 p-4 bg-[#0A0A0A] border border-amber-500/30 rounded-lg">
                <h4 className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  📦 Shipping Dimensions
                  <span className="text-xs text-white/40 font-normal">(Overrides category dimensions)</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">
                      Length (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                      placeholder="30"
                      step="0.01"
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      placeholder="26"
                      step="0.01"
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">
                      Breadth (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.breadth}
                      onChange={(e) => setFormData({ ...formData, breadth: e.target.value })}
                      placeholder="7"
                      step="0.01"
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="8"
                      step="0.01"
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-white/60 mb-1.5">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="0.322"
                      step="0.001"
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}

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
                    <div className="absolute inset-x-2 top-2 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, 'left')}
                        className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 disabled:opacity-40"
                        disabled={index === 0 || isSubmitting}
                        aria-label="Move image left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, 'right')}
                        className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 disabled:opacity-40"
                        disabled={index === formData.images.length - 1 || isSubmitting}
                        aria-label="Move image right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                        aria-label="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
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

            {/* Testimonial Image */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Testimonial Image
                <span className="text-xs text-white/50 ml-2">(Optional - Different image for testimonial section)</span>
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={testimonialImageInput}
                  onChange={(e) => setTestimonialImageInput(e.target.value)}
                  onBlur={(e) => setFormData({ ...formData, testimonialImage: e.target.value.trim() })}
                  placeholder="Enter testimonial image URL"
                  className="flex-1 px-4 py-2.5 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  disabled={isSubmitting}
                />
              </div>

              {/* Testimonial Image Preview */}
              {formData.testimonialImage && (
                <div className="mt-3">
                  <div className="relative w-full max-w-xs aspect-square rounded-lg border-2 border-[#333333] overflow-hidden bg-[#0A0A0A]">
                    <img
                      src={formData.testimonialImage}
                      alt="Testimonial preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
                      Testimonial
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    This image will be used in the testimonial section instead of the first product image
                  </p>
                </div>
              )}
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

