"use client";

import { useState } from 'react';
import { ArtefactCategory } from '@/app/dashboard/models/artefact';
import { Package, Trash2, Edit2 } from 'lucide-react';
import ConfirmationDialog from './confirmation-dialog';

interface ArtefactCategoryGridProps {
  categories: ArtefactCategory[];
  onCategoryClick: (category: ArtefactCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditCategory: (category: ArtefactCategory) => void;
}

export default function ArtefactCategoryGrid({
  categories,
  onCategoryClick,
  onDeleteCategory,
  onEditCategory,
}: ArtefactCategoryGridProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; categoryId: string; categoryName: string }>({
    isOpen: false,
    categoryId: '',
    categoryName: '',
  });

  const handleDelete = (e: React.MouseEvent, categoryId: string, categoryName: string) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, categoryId, categoryName });
  };

  const handleEdit = (e: React.MouseEvent, category: ArtefactCategory) => {
    e.stopPropagation();
    onEditCategory(category);
  };

  const confirmDelete = () => {
    onDeleteCategory(deleteConfirm.categoryId);
    setDeleteConfirm({ isOpen: false, categoryId: '', categoryName: '' });
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.categoryName}" and all its products? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, categoryId: '', categoryName: '' })}
        variant="danger"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => {
        const firstProduct = category.products?.[0];
        const thumbnailImage = firstProduct?.images?.[0];
        const productCount = category.products?.length || 0;

        return (
          <div
            key={category.id || category._id}
            onClick={() => onCategoryClick(category)}
            className="group relative bg-[#1A1A1A] border border-[#333333] rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-emerald-500/10"
          >
            {/* Thumbnail Image */}
            <div className="aspect-square bg-[#0A0A0A] relative overflow-hidden">
              {thumbnailImage ? (
                <img
                  src={thumbnailImage}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%230A0A0A" width="400" height="400"/%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Package className="w-16 h-16 text-white/20 mb-3" />
                  <span className="text-white/30 text-sm">No products yet</span>
                </div>
              )}

              {/* Product Count Badge */}
              {productCount > 0 && (
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-emerald-500 text-white text-sm font-semibold rounded-full shadow-lg">
                  {productCount}
                </div>
              )}

              {/* Category Label (appears on hover) */}
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                Category
              </div>
            </div>

            {/* Category Info */}
            <div className="p-4">
              <h3 className="text-white font-semibold text-lg mb-1 truncate">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-white/50 text-sm mb-2 line-clamp-2">
                  {category.description}
                </p>
              )}
              <p className="text-white/60 text-sm">
                {productCount} {productCount === 1 ? 'product' : 'products'}
              </p>
            </div>

            {/* Action Buttons (appear on hover) */}
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
              <button
                onClick={(e) => handleEdit(e, category)}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                title="Edit category"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => handleDelete(e, category.id || category._id || '', category.name)}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
      </div>
    </>
  );
}

