"use client";

import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, GripVertical, ArrowLeft } from 'lucide-react';
import { ArtefactCategory, ArtefactProduct } from '@/app/dashboard/models/artefact';
import ConfirmationDialog from './confirmation-dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ArtefactCategoryDetailProps {
  category: ArtefactCategory;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCategory: (category: ArtefactCategory) => void;
  onAddProduct: () => void;
  onEditProduct: (product: ArtefactProduct) => void;
  onDeleteProduct: (productId: string) => void;
}

// Sortable Product Card Component
function SortableProductCard({ product, onEdit, onDelete }: {
  product: ArtefactProduct;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[#1A1A1A] border border-[#333333] rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all group ${
        isDragging ? 'shadow-2xl shadow-emerald-500/20' : ''
      }`}
    >
      <div className="flex gap-4 p-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Product Image */}
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-[#0A0A0A] flex-shrink-0">
          <img
            src={product.images[0] || '/images/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg mb-1 truncate">{product.name}</h3>
          <p className="text-white/60 text-sm mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-emerald-400 font-semibold">{product.basePrice}</span>
            <span className="text-white/40">Qty: {product.quantity}</span>
            <span className="text-white/40">{product.images.length} image(s)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArtefactCategoryDetail({
  category,
  isOpen,
  onClose,
  onUpdateCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: ArtefactCategoryDetailProps) {
  const [products, setProducts] = useState<ArtefactProduct[]>(category.products || []);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: '',
    productName: '',
  });

  // Update products when category changes
  React.useEffect(() => {
    setProducts(category.products || []);
  }, [category.products]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!isOpen) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);

      const reorderedProducts = arrayMove(products, oldIndex, newIndex).map((p, index) => ({
        ...p,
        order: index,
      }));

      setProducts(reorderedProducts);

      // Update category with new order
      const updatedCategory = {
        ...category,
        products: reorderedProducts,
        updatedAt: new Date().toISOString(),
      };

      onUpdateCategory(updatedCategory);
    }
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    setDeleteConfirm({ isOpen: true, productId, productName });
  };

  const confirmDeleteProduct = () => {
    const updatedProducts = products.filter(p => p.id !== deleteConfirm.productId);
    setProducts(updatedProducts);
    
    const updatedCategory = {
      ...category,
      products: updatedProducts,
      updatedAt: new Date().toISOString(),
    };
    
    onUpdateCategory(updatedCategory);
    onDeleteProduct(deleteConfirm.productId);
    setDeleteConfirm({ isOpen: false, productId: '', productName: '' });
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteProduct}
        onCancel={() => setDeleteConfirm({ isOpen: false, productId: '', productName: '' })}
        variant="danger"
      />

      <div className="fixed inset-0 z-50 bg-[#0A0A0A] overflow-y-auto animate-in fade-in slide-in-from-right duration-300">
        {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#333333]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white/60" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{category.name}</h1>
                {category.description && (
                  <p className="text-white/70 text-sm mb-1">{category.description}</p>
                )}
                <p className="text-white/60 text-sm">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onAddProduct}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <Plus className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Products Yet</h3>
            <p className="text-white/60 text-center mb-6 max-w-sm">
              Start adding products (variants) to this category.
            </p>
            <button
              onClick={onAddProduct}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Your First Product
            </button>
          </div>
        ) : (
          <>
            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Tip:</strong> Drag and drop products to reorder them. The first product's image will be used as the category thumbnail.
              </p>
            </div>

            {/* Products List with Drag & Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={products.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {products.map((product) => (
                    <SortableProductCard
                      key={product.id}
                      product={product}
                      onEdit={() => onEditProduct(product)}
                      onDelete={() => handleDeleteProduct(product.id, product.name)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>
      </div>
    </>
  );
}

