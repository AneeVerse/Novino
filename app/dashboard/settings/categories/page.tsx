"use client";

import { useState, useEffect, Suspense } from 'react';
import { Edit, Trash, Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  type: 'painting' | 'artefact';
  description?: string;
}

function CategoriesContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams ? searchParams.get('type') : null;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'painting' | 'artefact'>(
    typeParam === 'artefact' ? 'artefact' : 'painting'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        console.log("Fetched categories:", data);
        
        // Ensure each category has a valid ID
        const processedData = data.map((cat: any) => ({
          ...cat,
          id: cat.id || cat._id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
        
        setCategories(processedData);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to load categories');
        
        // Fallback sample data
        const fallbackData = [
          { id: '1', name: 'Oil', type: 'painting' as 'painting', description: 'Oil paintings' },
          { id: '2', name: 'Acrylic', type: 'painting' as 'painting', description: 'Acrylic paintings' },
          { id: '3', name: 'Watercolor', type: 'painting' as 'painting', description: 'Watercolor paintings' },
          { id: '4', name: 'Mixed Media', type: 'painting' as 'painting', description: 'Mixed media paintings' },
          { id: '5', name: 'Egyptian', type: 'artefact' as 'artefact', description: 'Egyptian artefacts' },
          { id: '6', name: 'Asian', type: 'artefact' as 'artefact', description: 'Asian artefacts' },
          { id: '7', name: 'European', type: 'artefact' as 'artefact', description: 'European artefacts' },
        ];
        console.log("Using fallback data:", fallbackData);
        setCategories(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Filter categories by active tab
  const filteredCategories = categories
    .filter(category => category.type === activeTab && category.id) // Ensure we have an ID
    .map(category => ({
      ...category,
      id: category.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

  // Refresh categories data
  const refreshCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      console.log("Refreshed categories:", data);
      setCategories(data);
    } catch (err: any) {
      console.error('Error refreshing categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category creation or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear messages
    setError('');
    setSuccessMessage('');
    
    if (!categoryName.trim()) {
      setError('Category name is required');
      return;
    }
    
    try {
      const categoryData = {
        ...(formMode === 'edit' && currentCategory ? { id: currentCategory.id } : {}),
        name: categoryName,
        type: activeTab,
        description: categoryDescription
      };
      
      // Ensure we have a proper ID for the endpoint
      let endpoint = '/api/categories';
      if (formMode === 'edit' && currentCategory) {
        // For edit operations, ensure we have the ID in the URL
        endpoint = `/api/categories/${currentCategory.id}`;
      }
      
      const method = formMode === 'add' ? 'POST' : 'PUT';
      
      console.log(`Submitting ${method} request to ${endpoint}`, categoryData);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error("API error response:", errorData);
          throw new Error(errorData.error || (formMode === 'add' 
            ? 'Failed to create category' 
            : 'Failed to update category'));
        } catch (jsonErr) {
          throw new Error(formMode === 'add' 
            ? 'Failed to create category' 
            : 'Failed to update category');
        }
      }
      
      let result;
      try {
        result = await response.json();
        console.log("API success response:", result);
      } catch (jsonErr) {
        console.warn("Success response did not contain JSON");
        // If no result from API, create a fallback result
        result = {
          ...categoryData,
          id: currentCategory?.id || Date.now().toString()
        };
      }
      
      // Normalize the result to handle both MongoDB and fallback data formats
      const normalizedResult = {
        id: result.id || result._id || currentCategory?.id || Date.now().toString(),
        name: result.name || categoryName,
        type: result.type || activeTab,
        description: result.description || categoryDescription
      };
      
      if (formMode === 'add') {
        setCategories([...categories, normalizedResult]);
      } else {
        setCategories(categories.map(cat => 
          cat.id === normalizedResult.id ? normalizedResult : cat
        ));
      }
      
      // Reset form
      resetForm();
      // Show success message
      setSuccessMessage(formMode === 'add' 
        ? 'Category created successfully!' 
        : 'Category updated successfully!');
      
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.message || 'Failed to save category');
    }
  };

  // Handle category deletion
  const handleDelete = async (id: string) => {
    if (!id || id === 'undefined') {
      setError('Cannot delete: Invalid category ID');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    // Clear messages
    setError('');
    setSuccessMessage('');
    
    console.log(`Attempting to delete category with ID: ${id}`);
    
    // Find the category before we delete it
    const categoryToDelete = categories.find(cat => cat.id === id);
    if (!categoryToDelete) {
      console.error(`Could not find category with ID ${id} in local state`);
    } else {
      console.log('Category to delete:', categoryToDelete);
    }
    
    // Optimistically remove from local state right away
    setCategories(prev => prev.filter(category => category.id !== id));
    
    // Now perform the API call
    let apiSuccess = false;
    try {
      // Ensure we use the right API endpoint format
      const endpoint = `/api/categories/${id}`;
      console.log(`Calling DELETE on endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });
      
      console.log(`Delete response status: ${response.status}`);
      
      if (response.ok) {
        apiSuccess = true;
        try {
          const result = await response.json();
          console.log("Delete response data:", result);
        } catch (err) {
          // Handle case where response body might be empty
          console.log("Delete successful but no JSON response");
          apiSuccess = true;
        }
      } else {
        console.warn('Category deletion API returned non-ok status:', response.status);
        try {
          const errorData = await response.json();
          console.error("Delete error response:", errorData);
        } catch (err) {
          console.error("Delete error with no JSON response");
        }
      }
    } catch (err: any) {
      console.error('Error deleting category API call:', err);
    }

    // We already removed from local state, so just show appropriate message
    if (!apiSuccess) {
      setSuccessMessage('Category removed from view');
      setError('Warning: Could not delete on server, but removed locally.');
    } else {
      // Show success message
      setSuccessMessage('Category deleted successfully!');
    }
  };

  // Reset form state
  const resetForm = () => {
    setShowForm(false);
    setFormMode('add');
    setCurrentCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    // Don't clear messages here, as they should persist after form close
  };

  // Edit category
  const handleEdit = (category: Category) => {
    console.log("Editing category:", category);
    setCurrentCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setFormMode('edit');
    setShowForm(true);
  };

  return (
    <div className="container mx-auto pt-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Categories</h1>
          <div className="flex items-center mt-2">
            <Link href="/dashboard" className="text-[#A47E3B] hover:underline">
              Dashboard
            </Link>
            <span className="mx-2 text-white/50">›</span>
            <span className="text-white/70">Categories</span>
          </div>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setShowForm(true);
            setFormMode('add');
          }}
          className="px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31] transition flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add New Category
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#444444] mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('painting')}
            className={`px-4 py-2 ${
              activeTab === 'painting'
                ? 'text-[#A47E3B] border-b-2 border-[#A47E3B] font-medium'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Painting Categories
          </button>
          <button
            onClick={() => setActiveTab('artefact')}
            className={`px-4 py-2 ${
              activeTab === 'artefact'
                ? 'text-[#A47E3B] border-b-2 border-[#A47E3B] font-medium'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Artefact Categories
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-300 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/20 text-green-300 p-4 rounded mb-6">
          {successMessage}
        </div>
      )}

      {/* Category Form */}
      {showForm && (
        <div className="bg-[#222222] p-6 rounded-lg mb-8">
          <h2 className="text-xl font-medium text-white mb-4">
            {formMode === 'add' ? 'Add New Category' : 'Edit Category'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-white mb-2">
                  Category Name*
                </label>
                <input
                  type="text"
                  id="name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-white mb-2">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-[#333333] text-white/70 rounded hover:bg-[#444444] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31]"
              >
                {formMode === 'add' ? 'Add Category' : 'Update Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-[#222222] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1A1A1A] border-b border-[#333333]">
              <th className="text-left p-4 text-white font-medium">Name</th>
              <th className="text-left p-4 text-white font-medium">Description</th>
              <th className="text-right p-4 text-white font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id} className="border-b border-[#333333] hover:bg-[#2A2A2A]">
                <td className="p-4 text-white">{category.name}</td>
                <td className="p-4 text-white/70">{category.description || '-'}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 bg-[#333333] text-white/70 rounded-full hover:bg-[#444444] hover:text-white"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        console.log("Delete clicked for category:", category);
                        if (!category.id) {
                          setError('Cannot delete category: missing ID');
                          return;
                        }
                        handleDelete(category.id);
                      }}
                      className="p-2 bg-[#392222] text-[#ff9494] rounded-full hover:bg-[#4a2b2b] hover:text-white"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCategories.length === 0 && (
              <tr key="no-categories">
                <td colSpan={3} className="p-4 text-center text-white/50">
                  No categories found. Add a new category to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto pt-8 px-4">
        <div className="text-white">Loading categories...</div>
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
} 