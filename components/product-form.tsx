import { useState, useEffect, useRef } from "react";
import { getValidImageUrl } from "@/lib/imageUtils";

interface Product {
  id?: string;
  _id?: string;
  name: string;
  price: string;
  description: string;
  image: string;
  category: string;
  type: 'painting' | 'artefact';
  createdAt?: string;
}

interface ProductFormProps {
  mode: 'add' | 'edit';
  product?: Product;
  productType: 'painting' | 'artefact';
  onCancel: () => void;
}

export default function ProductForm({ mode, product, productType, onCancel }: ProductFormProps) {
  // State for form fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageInputType, setImageInputType] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState("");
  
  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Category options based on product type
  const categoryOptions = productType === 'painting'
    ? ["Oil", "Acrylic", "Watercolor", "Mixed Media"]
    : ["Egyptian", "Asian", "European", "American"];
  
  // Initialize form with existing product data if editing
  useEffect(() => {
    if (mode === 'edit' && product) {
      setName(product.name || "");
      setPrice(product.price || "");
      setDescription(product.description || "");
      setImage(product.image || "");
      setCategory(product.category || "");
      
      // Set preview image
      if (product.image) {
        setPreviewImage(getValidImageUrl(product.image));
        setImageUrl(product.image);
        // If image looks like a URL, switch to URL input type
        if (product.image.startsWith('http')) {
          setImageInputType('url');
        }
      }
    } else {
      // Set default category for new products
      setCategory(categoryOptions[0]);
    }
  }, [mode, product, categoryOptions]);
  
  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
      
      // Store file for form submission
      // (In a real app, you would upload this to a storage service and get a URL)
      // This is just for the UI preview
    }
  };
  
  // Handle URL input change
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setPreviewImage(url);
      setImage(url);
    } else {
      setPreviewImage(null);
      setImage("");
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Validate required fields
      if (!name || !price || !description || !category) {
        throw new Error("Please fill in all required fields");
      }
      
      // Use image URL if provided, otherwise use default
      let imageUrl = image;
      if (!imageUrl) {
        imageUrl = productType === 'painting' 
          ? "/images/mug-white.png" 
          : "/images/mug-black.png";
      }
      
      const productData = {
        ...(mode === 'edit' && product?.id ? { id: product.id } : {}),
        name,
        price,
        description,
        image: imageUrl,
        category,
        type: productType
      };
      
      // API endpoint based on mode
      const endpoint = mode === 'add' 
        ? '/api/products' 
        : `/api/products/${product?.id}`;
      
      const method = mode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error(mode === 'add' 
          ? 'Failed to create product' 
          : 'Failed to update product');
      }
      
      setSuccess(true);
      
      // Auto close form after successful submission
      setTimeout(() => {
        onCancel();
      }, 1500);
      
    } catch (err: any) {
      console.error('Error submitting product:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#222222] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              {mode === 'add' ? `Add New ${productType === 'painting' ? 'Painting' : 'Artefact'}` : 'Edit Product'}
            </h2>
            <button 
              onClick={onCancel}
              className="text-white/70 hover:text-white"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 text-green-300 rounded">
              {mode === 'add' ? 'Product created successfully!' : 'Product updated successfully!'}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - Text fields */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-white font-medium mb-1">
                    Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white focus:border-[#A47E3B] focus:outline-none"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-white font-medium mb-1">
                    Price*
                  </label>
                  <input
                    type="text"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white focus:border-[#A47E3B] focus:outline-none"
                    placeholder="e.g. $1,250"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-white font-medium mb-1">
                    Category*
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white focus:border-[#A47E3B] focus:outline-none"
                    required
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-white font-medium mb-1">
                    Description*
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white focus:border-[#A47E3B] focus:outline-none h-32"
                    placeholder="Enter product description"
                    required
                  ></textarea>
                </div>
              </div>
              
              {/* Right column - Image upload */}
              <div>
                <label className="block text-white font-medium mb-1">
                  Product Image
                </label>
                
                {/* Image input type toggle */}
                <div className="flex mb-4 border border-[#444444] rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setImageInputType('file')}
                    className={`flex-1 py-2 text-sm ${
                      imageInputType === 'file'
                        ? 'bg-[#A47E3B] text-white'
                        : 'bg-[#333333] text-white/70 hover:bg-[#444444] hover:text-white'
                    } transition-colors`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputType('url')}
                    className={`flex-1 py-2 text-sm ${
                      imageInputType === 'url'
                        ? 'bg-[#A47E3B] text-white'
                        : 'bg-[#333333] text-white/70 hover:bg-[#444444] hover:text-white'
                    } transition-colors`}
                  >
                    Image URL
                  </button>
                </div>
                
                {/* Image URL input */}
                {imageInputType === 'url' && (
                  <div className="mb-4">
                    <input
                      type="url"
                      placeholder="Enter image URL"
                      value={imageUrl}
                      onChange={handleImageUrlChange}
                      className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white focus:border-[#A47E3B] focus:outline-none"
                    />
                  </div>
                )}
                
                {/* File upload area */}
                <div className="border border-dashed border-[#444444] rounded-lg p-4 text-center">
                  {previewImage ? (
                    <div className="relative mb-4">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="mx-auto max-h-48 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setImage("");
                          setImageUrl("");
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="absolute top-2 right-2 bg-[#333333] rounded-full p-1 text-white/70 hover:text-white"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-white/70 mb-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-[#333333] flex items-center justify-center mb-2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                      <p>{imageInputType === 'file' ? 'Drag and drop an image or click to browse' : 'Enter URL above to preview image'}</p>
                    </div>
                  )}
                  
                  {imageInputType === 'file' && (
                    <>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                        id="product-image"
                      />
                      <label 
                        htmlFor="product-image"
                        className="inline-block px-4 py-2 bg-[#333333] text-white/80 rounded cursor-pointer hover:bg-[#444444] hover:text-white transition-colors"
                      >
                        Select Image
                      </label>
                    </>
                  )}
                  
                  <p className="mt-2 text-xs text-white/50">
                    Recommended: 1200 x 1200px, max 5MB
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-[#333333] text-white/70 rounded hover:bg-[#444444] hover:text-white transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#A47E3B] text-white rounded hover:bg-[#8a6a31] transition-colors flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mode === 'add' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>{mode === 'add' ? 'Create Product' : 'Update Product'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 