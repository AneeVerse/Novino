"use client";

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface DetailField {
  id: string;
  label: string;
  value: string;
}

interface ArtefactCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, details: DetailField[], length?: string, width?: string, breadth?: string, height?: string, weight?: string) => void;
  mode?: 'create' | 'edit';
  initialName?: string;
  initialDescription?: string;
  initialDetails?: DetailField[];
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
  initialDetails = [],
  initialLength = '',
  initialWidth = '',
  initialBreadth = '',
  initialHeight = '',
  initialWeight = ''
}: ArtefactCategoryModalProps) {
  const [categoryName, setCategoryName] = useState(initialName);
  const [categoryDescription, setCategoryDescription] = useState(initialDescription);
  const [details, setDetails] = useState<DetailField[]>(initialDetails.length > 0 ? initialDetails : [{ id: Date.now().toString(), label: '', value: '' }]);
  const [length, setLength] = useState(initialLength);
  const [width, setWidth] = useState(initialWidth);
  const [breadth, setBreadth] = useState(initialBreadth);
  const [height, setHeight] = useState(initialHeight);
  const [weight, setWeight] = useState(initialWeight);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Existing labels and values from database for suggestions
  const [existingLabels, setExistingLabels] = useState<string[]>([]);
  const [labelSuggestions, setLabelSuggestions] = useState<{ [key: string]: string[] }>({});

  // Fetch existing labels and values from database for suggestions
  React.useEffect(() => {
    const fetchExistingOptions = async () => {
      try {
        const response = await fetch('/api/artefact-categories');
        if (response.ok) {
          const categories = await response.json();
          const allLabels = new Set<string>();
          const labelValueMap: { [key: string]: Set<string> } = {};
          
          categories.forEach((cat: any) => {
            // Parse details JSON if exists
            if (cat.details && Array.isArray(cat.details)) {
              cat.details.forEach((detail: any) => {
                if (detail.label && detail.value) {
                  allLabels.add(detail.label);
                  if (!labelValueMap[detail.label]) {
                    labelValueMap[detail.label] = new Set();
                  }
                  labelValueMap[detail.label].add(detail.value);
                }
              });
            }
            
            // Also check legacy fields
            const legacyFields = [
              { label: 'Size', value: cat.size },
              { label: 'Thickness', value: cat.thickness },
              { label: 'Frame', value: cat.frame },
              { label: 'Structure', value: cat.structure },
              { label: 'Material', value: cat.material },
              { label: 'Care Guide', value: cat.care_guide || cat.careGuide },
              { label: 'Measurement', value: cat.measurement },
              { label: 'GSM', value: cat.gsm },
            ];
            
            legacyFields.forEach(field => {
              if (field.value) {
                allLabels.add(field.label);
                if (!labelValueMap[field.label]) {
                  labelValueMap[field.label] = new Set();
                }
                labelValueMap[field.label].add(field.value);
              }
            });
          });
          
          setExistingLabels(Array.from(allLabels).sort());
          const suggestions: { [key: string]: string[] } = {};
          Object.keys(labelValueMap).forEach(label => {
            suggestions[label] = Array.from(labelValueMap[label]).sort();
          });
          setLabelSuggestions(suggestions);
        }
      } catch (error) {
        console.error('Error fetching existing options:', error);
      }
    };
    
    if (isOpen) {
      fetchExistingOptions();
    }
  }, [isOpen]);

  // Update form when initial values change
  React.useEffect(() => {
    setCategoryName(initialName);
    setCategoryDescription(initialDescription);
    setDetails(initialDetails.length > 0 ? initialDetails : [{ id: Date.now().toString(), label: '', value: '' }]);
    setLength(initialLength);
    setWidth(initialWidth);
    setBreadth(initialBreadth);
    setHeight(initialHeight);
    setWeight(initialWeight);
  }, [initialName, initialDescription, initialDetails, initialLength, initialWidth, initialBreadth, initialHeight, initialWeight]);

  // Add new detail field
  const addDetailField = () => {
    setDetails([...details, { id: Date.now().toString(), label: '', value: '' }]);
  };

  // Remove detail field
  const removeDetailField = (id: string) => {
    if (details.length > 1) {
      setDetails(details.filter(d => d.id !== id));
    }
  };

  // Update detail field
  const updateDetailField = (id: string, field: 'label' | 'value', value: string) => {
    setDetails(details.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      return; // Form validation - field will show as required
    }

    setIsSubmitting(true);
    try {
      // Filter out empty details
      const validDetails = details.filter(d => d.label.trim() && d.value.trim());
      await onSubmit(categoryName, categoryDescription, validDetails, length, width, breadth, height, weight);
      setCategoryName('');
      setCategoryDescription('');
      setDetails([{ id: Date.now().toString(), label: '', value: '' }]);
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

          {/* Dynamic Detail Fields */}
          <div className="mb-6 space-y-4 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/80">Description Details (shown in product Description + section)</h3>
              <button
                type="button"
                onClick={addDetailField}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-xs transition-all"
                disabled={isSubmitting}
              >
                <Plus size={14} />
                Add Detail
              </button>
            </div>

            {details.map((detail, index) => (
              <div key={detail.id} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={detail.label}
                      onChange={(e) => updateDetailField(detail.id, 'label', e.target.value)}
                      placeholder="Label (e.g., Size, Care Guide)"
                      className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                      disabled={isSubmitting}
                      list={`label-suggestions-${index}`}
                    />
                    {existingLabels.length > 0 && (
                      <datalist id={`label-suggestions-${index}`}>
                        {existingLabels.map((label, idx) => (
                          <option key={idx} value={label} />
                        ))}
                      </datalist>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={detail.value}
                      onChange={(e) => updateDetailField(detail.id, 'value', e.target.value)}
                      placeholder="Value (e.g., 42.75 cm x 32.75 cm)"
                      className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                      disabled={isSubmitting}
                      list={`value-suggestions-${index}`}
                    />
                    {labelSuggestions[detail.label] && labelSuggestions[detail.label].length > 0 && (
                      <datalist id={`value-suggestions-${index}`}>
                        {labelSuggestions[detail.label].map((value, idx) => (
                          <option key={idx} value={value} />
                        ))}
                      </datalist>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDetailField(detail.id)}
                  disabled={details.length === 1 || isSubmitting}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove this detail"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
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

