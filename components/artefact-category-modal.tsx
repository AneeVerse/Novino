"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ArtefactCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
  mode?: 'create' | 'edit';
  initialName?: string;
  initialDescription?: string;
}

export default function ArtefactCategoryModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  mode = 'create',
  initialName = '',
  initialDescription = ''
}: ArtefactCategoryModalProps) {
  const [categoryName, setCategoryName] = useState(initialName);
  const [categoryDescription, setCategoryDescription] = useState(initialDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when initial values change
  React.useEffect(() => {
    setCategoryName(initialName);
    setCategoryDescription(initialDescription);
  }, [initialName, initialDescription]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      return; // Form validation - field will show as required
    }

    setIsSubmitting(true);
    try {
      await onSubmit(categoryName, categoryDescription);
      setCategoryName('');
      setCategoryDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'edit' ? 'Edit Category' : 'Create Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="categoryName" className="block text-sm font-medium text-white/80 mb-2">
              Category Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Mouse Pads, Desk Mats, Keyboards"
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="categoryDescription" className="block text-sm font-medium text-white/80 mb-2">
              Description
            </label>
            <textarea
              id="categoryDescription"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              placeholder="Optional description for this category..."
              rows={3}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
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
              {isSubmitting 
                ? (mode === 'edit' ? 'Updating...' : 'Creating...')
                : (mode === 'edit' ? 'Update Category' : 'Create Category')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

