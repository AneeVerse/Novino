"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ArtefactCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, careGuide?: string, measurement?: string, gsm?: string, length?: string, width?: string, breadth?: string, height?: string, weight?: string) => void;
  mode?: 'create' | 'edit';
  initialName?: string;
  initialDescription?: string;
  initialCareGuide?: string;
  initialMeasurement?: string;
  initialGsm?: string;
  initialLength?: string;
  initialWidth?: string;
  initialBreadth?: string;
  initialHeight?: string;
  initialWeight?: string;
}

export default function ArtefactCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialName = '',
  initialDescription = '',
  initialCareGuide = '',
  initialMeasurement = '',
  initialGsm = '',
  initialLength = '',
  initialWidth = '',
  initialBreadth = '',
  initialHeight = '',
  initialWeight = ''
}: ArtefactCategoryModalProps) {
  const [categoryName, setCategoryName] = useState(initialName);
  const [categoryDescription, setCategoryDescription] = useState(initialDescription);
  const [careGuide, setCareGuide] = useState(initialCareGuide);
  const [measurement, setMeasurement] = useState(initialMeasurement);
  const [gsm, setGsm] = useState(initialGsm);
  const [length, setLength] = useState(initialLength);
  const [width, setWidth] = useState(initialWidth);
  const [breadth, setBreadth] = useState(initialBreadth);
  const [height, setHeight] = useState(initialHeight);
  const [weight, setWeight] = useState(initialWeight);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when initial values change
  React.useEffect(() => {
    setCategoryName(initialName);
    setCategoryDescription(initialDescription);
    setCareGuide(initialCareGuide);
    setMeasurement(initialMeasurement);
    setGsm(initialGsm);
    setLength(initialLength);
    setWidth(initialWidth);
    setBreadth(initialBreadth);
    setHeight(initialHeight);
    setWeight(initialWeight);
  }, [initialName, initialDescription, initialCareGuide, initialMeasurement, initialGsm, initialLength, initialWidth, initialBreadth, initialHeight, initialWeight]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      return; // Form validation - field will show as required
    }

    setIsSubmitting(true);
    try {
      await onSubmit(categoryName, categoryDescription, careGuide, measurement, gsm, length, width, breadth, height, weight);
      setCategoryName('');
      setCategoryDescription('');
      setCareGuide('');
      setMeasurement('');
      setGsm('');
      setLength('');
      setWidth('');
      setBreadth('');
      setHeight('');
      setWeight('');
      onClose();
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Wider and Scrollable */}
      <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#1A1A1A] z-10 pb-4 border-b border-white/10">
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

          {/* Care Guide Fields */}
          <div className="mb-6 space-y-4 border-t border-white/10 pt-4">
            <h3 className="text-sm font-medium text-white/80 mb-3">Description Details (shown in product Description + section)</h3>

            <div>
              <label htmlFor="careGuide" className="block text-sm font-medium text-white/80 mb-2">
                Care Guide
              </label>
              <input
                type="text"
                id="careGuide"
                value={careGuide}
                onChange={(e) => setCareGuide(e.target.value)}
                placeholder="e.g., Handle with care"
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="measurement" className="block text-sm font-medium text-white/80 mb-2">
                Measurement
              </label>
              <input
                type="text"
                id="measurement"
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                placeholder="e.g., 9 inch"
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="gsm" className="block text-sm font-medium text-white/80 mb-2">
                GSM
              </label>
              <input
                type="text"
                id="gsm"
                value={gsm}
                onChange={(e) => setGsm(e.target.value)}
                placeholder="e.g., No GSM"
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Shipping Dimensions */}
          <div className="mb-6 space-y-4 border-t border-white/10 pt-4">
            <h3 className="text-sm font-medium text-white/80 mb-3">📦 Shipping Dimensions (for Shiprocket)</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="length" className="block text-xs font-medium text-white/60 mb-1.5">
                  Length (cm)
                </label>
                <input
                  type="number"
                  id="length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="30"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="width" className="block text-xs font-medium text-white/60 mb-1.5">
                  Width (cm)
                </label>
                <input
                  type="number"
                  id="width"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="26"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="breadth" className="block text-xs font-medium text-white/60 mb-1.5">
                  Breadth (cm)
                </label>
                <input
                  type="number"
                  id="breadth"
                  value={breadth}
                  onChange={(e) => setBreadth(e.target.value)}
                  placeholder="7"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-xs font-medium text-white/60 mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="8"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="weight" className="block text-xs font-medium text-white/60 mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.322"
                  step="0.001"
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                  disabled={isSubmitting}
                />
              </div>
            </div>
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

