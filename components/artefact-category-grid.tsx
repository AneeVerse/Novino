"use client";

import { useEffect, useMemo, useState } from 'react';
import { ArtefactCategory } from '@/app/dashboard/models/artefact';
import { Package, Trash2, Edit2, GripVertical } from 'lucide-react';
import ConfirmationDialog from './confirmation-dialog';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ArtefactCategoryGridProps {
  categories: ArtefactCategory[];
  onCategoryClick: (category: ArtefactCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditCategory: (category: ArtefactCategory) => void;
  onReorderCategories?: (order: { id: string; order: number }[]) => Promise<void> | void;
}

export default function ArtefactCategoryGrid({
  categories,
  onCategoryClick,
  onDeleteCategory,
  onEditCategory,
  onReorderCategories,
}: ArtefactCategoryGridProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; categoryId: string; categoryName: string }>({
    isOpen: false,
    categoryId: '',
    categoryName: '',
  });
  const [orderedCategories, setOrderedCategories] = useState<ArtefactCategory[]>([]);

  useEffect(() => {
    setOrderedCategories(sortCategories(categories));
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const previousOrder = [...orderedCategories];
    const oldIndex = orderedCategories.findIndex((category) => getCategoryId(category) === active.id);
    const newIndex = orderedCategories.findIndex((category) => getCategoryId(category) === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(orderedCategories, oldIndex, newIndex);
    setOrderedCategories(newOrder);

    if (!onReorderCategories) return;

    try {
      await onReorderCategories(
        newOrder.map((category, index) => ({
          id: getCategoryId(category),
          order: index,
        })),
      );
    } catch (error) {
      console.error('Failed to persist category order:', error);
      setOrderedCategories(previousOrder);
      alert('Failed to save the new category order. Please try again.');
    }
  };

  const sortableItems = useMemo(
    () => orderedCategories.map((category) => getCategoryId(category)),
    [orderedCategories],
  );

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
      {onReorderCategories && (
        <p className="text-white/60 text-sm mb-3 flex items-center gap-2">
          <GripVertical className="w-4 h-4" />
          Drag cards using the handle to change the order shown across the site.
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orderedCategories.map((category) => (
              <SortableCategoryCard
                key={getCategoryId(category)}
                category={category}
                onCategoryClick={() => onCategoryClick(category)}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}

type SortableCategoryCardProps = {
  category: ArtefactCategory;
  onCategoryClick: () => void;
  onDelete: (event: React.MouseEvent, categoryId: string, categoryName: string) => void;
  onEdit: (event: React.MouseEvent, category: ArtefactCategory) => void;
};

function SortableCategoryCard({
  category,
  onCategoryClick,
  onDelete,
  onEdit,
}: SortableCategoryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: getCategoryId(category),
  });

  const firstProduct = category.products?.[0];
  const thumbnailImage = firstProduct?.images?.[0];
  const productCount = category.products?.length || 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onCategoryClick}
      className={`group relative bg-[#1A1A1A] border border-[#333333] rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-emerald-500/10 ${isDragging ? 'ring-2 ring-emerald-400/50' : ''}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="absolute top-3 left-3 z-20 p-2 rounded-full bg-black/50 text-white/70 hover:text-white cursor-grab active:cursor-grabbing transition-colors"
        title="Drag to reorder"
        type="button"
      >
        <GripVertical className="w-4 h-4" />
      </button>

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
        <div className="absolute top-3 left-12 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
          onClick={(e) => onEdit(e, category)}
          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
          title="Edit category"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => onDelete(e, category.id || category._id || '', category.name)}
          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
          title="Delete category"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function getCategoryId(category: ArtefactCategory) {
  return category.id || category._id || category.name;
}

function sortCategories(categories: ArtefactCategory[]) {
  return [...categories].sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;

    if (orderA === orderB) {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    }

    return orderA - orderB;
  });
}


