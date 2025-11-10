import { useState, useEffect, useRef } from "react";
import { getValidImageUrl } from "@/lib/imageUtils";
import dynamic from "next/dynamic";
import { Plus, X, Upload, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Create a placeholder for RichTextEditor
const RichTextEditor = ({ value, onChange, placeholder }: { 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white focus:border-[#A47E3B] focus:outline-none h-32"
    />
  );
};

// Types
interface ProductVariant {
  id: string;
  name: string;
  type: string; // Changed to string to allow any type
  price?: string;
  quantity: number;
  imageUrl?: string;
}

interface ProductSpecification {
  title: string;
  content: string; // Rich text HTML content
  imageUrl?: string;
}

interface ProductFaq {
  id: string;
  question: string;
  answer: string;
}

interface FaqSection {
  faqs: ProductFaq[];
  imageUrl?: string;
}

interface Product {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  basePrice: string;
  quantity: number;
  images: string[]; // Array of image URLs
  category: string;
  type: 'painting' | 'artefact';
  variants: ProductVariant[];
  specifications: ProductSpecification;
  faqSection: FaqSection;
  additionalImageUrl?: string;
  featured?: boolean;
  featuredImageUrl?: string;
  metaDescription?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EnhancedProductFormProps {
  mode: 'add' | 'edit';
  product?: Product;
  productType: 'painting' | 'artefact';
  categories: {id: string; name: string; type: 'painting' | 'artefact'}[];
  onCancel: () => void;
}

export default function EnhancedProductForm({ 
  mode, 
  product, 
  productType, 
  categories, 
  onCancel 
}: EnhancedProductFormProps) {
  // Main form tabs
  const tabs = ["Basic Info", "Variants", "Specifications", "FAQs", "Additional", "Meta"];
  const [activeTab, setActiveTab] = useState(0);
  
  // Log categories for debugging
  console.log("Product Type:", productType);
  console.log("Categories received:", categories);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [isAddingImage, setIsAddingImage] = useState(false);

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
    name: "",
    type: "", // Changed to empty string, user can type anything
    price: "",
    quantity: 1
  });

  // Specifications state
  const [specificationTitle, setSpecificationTitle] = useState("");
  const [specificationContent, setSpecificationContent] = useState("");
  const [specificationImage, setSpecificationImage] = useState("");

  // FAQ state
  const [faqs, setFaqs] = useState<ProductFaq[]>([]);
  const [faqImageUrl, setFaqImageUrl] = useState("");
  const [currentFaq, setCurrentFaq] = useState<Partial<ProductFaq>>({
    question: "",
    answer: ""
  });
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);

  // Additional state
  const [additionalImageUrl, setAdditionalImageUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");

  // Meta state
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // File input references
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const specImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImageInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with existing product data if editing
  useEffect(() => {
    if (mode === 'edit' && product) {
      console.log("Initializing form with product:", product);
      setName(product.name || "");
      setDescription(product.description || "");
      setBasePrice(product.basePrice || "");
      setQuantity(product.quantity || 1);
      
      // Set category (make sure it's among the available categories)
      if (product.category) {
        const foundCategory = categories.find(cat => cat.id === product.category);
        if (foundCategory) {
          setSelectedCategory(product.category);
          console.log("Found matching category:", foundCategory.name);
        } else {
          // If the category isn't found, choose the first category of the right type
          const typeCategory = categories.find(cat => cat.type === productType);
          if (typeCategory) {
            setSelectedCategory(typeCategory.id);
            console.log("Using alternative category:", typeCategory.name);
          } else if (categories.length > 0) {
            setSelectedCategory(categories[0].id);
            console.log("Using first available category:", categories[0].name);
          }
        }
      } else if (categories.length > 0) {
        // Set default category if none is specified
        const typeCategory = categories.find(cat => cat.type === productType);
        if (typeCategory) {
          setSelectedCategory(typeCategory.id);
        } else {
          setSelectedCategory(categories[0].id);
        }
      }
      
      setImages(product.images || []);
      
      // Set variants
      setVariants(product.variants || []);
      
      // Set specifications
      if (product.specifications) {
        setSpecificationTitle(product.specifications.title || "");
        setSpecificationContent(product.specifications.content || "");
        setSpecificationImage(product.specifications.imageUrl || "");
      }
      
      // Set FAQs
      if (product.faqSection) {
        setFaqs(product.faqSection.faqs || []);
        setFaqImageUrl(product.faqSection.imageUrl || "");
      }
      
      // Set additional image
      setAdditionalImageUrl(product.additionalImageUrl || "");
      
      // Set featured fields
      setFeatured(product.featured || false);
      setFeaturedImageUrl(product.featuredImageUrl || "");

      // Set meta fields
      setMetaDescription((product as any).metaDescription || "");
      setSlug((product as any).slug || "");
    } else {
      // Initialize with defaults for new product
      if (categories.length > 0) {
        const typeCategory = categories.find(cat => cat.type === productType);
        if (typeCategory) {
          setSelectedCategory(typeCategory.id);
          console.log("New product - using category of type", productType, ":", typeCategory.name);
        } else {
          setSelectedCategory(categories[0].id);
          console.log("New product - using first category:", categories[0].name);
        }
      }
    }
  }, [mode, product, categories, productType]);

  // Fetch full product details when editing to populate all sections
  useEffect(() => {
    if (mode === 'edit' && product?.id) {
      (async () => {
        try {
          const res = await fetch(`/api/products/${product.id}`);
          if (!res.ok) throw new Error('Failed to fetch product details');
          const full = await res.json();
          // Populate all form fields
          setName(full.name || '');
          setDescription(full.description || '');
          setBasePrice(full.basePrice || full.price || '');
          setQuantity(full.quantity || 1);
          setSelectedCategory(full.category || '');
          setImages(full.images || (full.image ? [full.image] : []));
          setVariants(full.variants || []);
          setSpecificationTitle(full.specifications?.title || '');
          setSpecificationContent(full.specifications?.content || '');
          setSpecificationImage(full.specifications?.imageUrl || '');
          setFaqs(full.faqSection?.faqs || []);
          setFaqImageUrl(full.faqSection?.imageUrl || '');
          setAdditionalImageUrl(full.additionalImageUrl || '');
          setFeatured(full.featured || false);
          setFeaturedImageUrl(full.featuredImageUrl || '');
          setMetaDescription(full.metaDescription || '');
          setSlug(full.slug || '');
        } catch (err) {
          console.error('Error loading full product data for edit:', err);
        }
      })();
    }
  }, [mode, product?.id]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Validate basic required fields
      if (!name || !basePrice || !selectedCategory) {
        throw new Error("Please fill in all required fields in Basic Info");
      }
      
      // Create product data
      const productData: Partial<Product> = {
        ...(mode === 'edit' && product?.id ? { id: product.id } : {}),
        name,
        description,
        basePrice,
        quantity,
        images,
        category: selectedCategory,
        type: productType,
        variants,
        specifications: {
          title: specificationTitle,
          content: specificationContent,
          imageUrl: specificationImage
        },
        faqSection: {
          faqs,
          imageUrl: faqImageUrl
        },
        additionalImageUrl,
        featured,
        featuredImageUrl: featured ? featuredImageUrl : undefined,
        ...(metaDescription && { metaDescription }),
        ...(slug && { slug: slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })
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

  // Add image to the images array
  const addImage = () => {
    if (currentImageUrl && !images.includes(currentImageUrl)) {
      setImages(prev => [...prev, currentImageUrl]);
      setCurrentImageUrl("");
      setIsAddingImage(false);
    }
  };

  // Remove image from the images array
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Add or update variant
  const handleVariant = () => {
    if (!newVariant.name) return;
    
    if (typeof newVariant.id === 'string') {
      // Update existing variant
      setVariants(prev => 
        prev.map(v => v.id === newVariant.id ? { ...newVariant, id: v.id } as ProductVariant : v)
      );
    } else {
      // Add new variant
      const id = Date.now().toString();
      setVariants(prev => [...prev, { ...newVariant, id } as ProductVariant]);
    }
    
    // Reset new variant form
    setNewVariant({
      name: "",
      type: "",
      price: "",
      quantity: 1
    });
  };

  // Remove variant
  const removeVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  // Add FAQ
  const handleFaq = () => {
    if (!currentFaq.question || !currentFaq.answer) return;
    
    if (editingFaqIndex !== null && editingFaqIndex >= 0) {
      // Update existing FAQ
      setFaqs(prev => 
        prev.map((faq, index) => 
          index === editingFaqIndex 
            ? { ...currentFaq, id: faq.id } as ProductFaq 
            : faq
        )
      );
    } else {
      // Add new FAQ (limit to 5)
      if (faqs.length >= 5) {
        setError("Maximum of 5 FAQs allowed");
        return;
      }
      
      const id = Date.now().toString();
      setFaqs(prev => [...prev, { ...currentFaq, id } as ProductFaq]);
    }
    
    // Reset current FAQ
    setCurrentFaq({
      question: "",
      answer: ""
    });
    setEditingFaqIndex(null);
  };

  // Remove FAQ
  const removeFaq = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
  };

  // Edit FAQ
  const editFaq = (index: number) => {
    const faq = faqs[index];
    setCurrentFaq({
      id: faq.id,
      question: faq.question,
      answer: faq.answer
    });
    setEditingFaqIndex(index);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col border border-[#333333]">
        {/* Modern Header - Fixed */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#1A1A1A] to-[#222222] border-b border-[#333333] px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-0.5">
                {mode === 'add' ? `Add New ${productType === 'painting' ? 'Painting' : 'Artefact'}` : 'Edit Product'}
              </h2>
              <p className="text-white/60 text-xs">
                {mode === 'add' ? 'Fill in the details to create a new product' : 'Update product information'}
              </p>
            </div>
            <button 
              onClick={onCancel}
              className="w-9 h-9 rounded-full bg-[#333333] hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg flex items-start gap-2 text-sm">
              <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs">!</span>
              </div>
              <p className="flex-1">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg flex items-start gap-2 text-sm">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-xs">✓</span>
              </div>
              <p className="flex-1">{mode === 'add' ? 'Product created successfully!' : 'Product updated successfully!'}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="mb-6 flex-shrink-0">
              <Tabs 
                defaultValue="tab-0" 
                value={`tab-${activeTab}`} 
                onValueChange={(value) => setActiveTab(Number(value.split('-')[1]))}
              >
                <TabsList className="flex gap-1.5 bg-[#222222] p-1 rounded-lg border border-[#333333] overflow-x-auto">
                  {tabs.map((tab, index) => (
                    <TabsTrigger
                      key={tab}
                      value={`tab-${index}`}
                      className="px-3 py-2 font-medium text-xs rounded-md transition-all duration-200 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A47E3B] data-[state=active]:to-[#C4A962] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-white/60 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-[#2A2A2A]"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Tab Panels */}
                <TabsContent value="tab-0" className="mt-4 flex-1">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left column - Text fields */}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-white font-medium mb-1.5 text-sm">
                          Product Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#222222] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#A47E3B] focus:ring-1 focus:ring-[#A47E3B]/20 focus:outline-none transition-all"
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="price" className="block text-white font-medium mb-1.5 text-sm">
                          Base Price <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          id="price"
                          value={basePrice}
                          onChange={(e) => setBasePrice(e.target.value)}
                          className="w-full bg-[#222222] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#A47E3B] focus:ring-1 focus:ring-[#A47E3B]/20 focus:outline-none transition-all"
                          placeholder="e.g., $1,250"
                          required
                        />
                        <p className="mt-1 text-xs text-white/50">Include currency symbol and formatting</p>
                      </div>
                      
                      <div>
                        <label htmlFor="quantity" className="block text-white font-medium mb-1.5 text-sm">
                          Quantity
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full bg-[#222222] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#A47E3B] focus:ring-1 focus:ring-[#A47E3B]/20 focus:outline-none transition-all"
                          placeholder="1"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-white font-medium mb-1.5 text-sm">
                          Category <span className="text-red-400">*</span>
                        </label>
                        <select
                          id="category"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full bg-[#222222] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#A47E3B] focus:ring-1 focus:ring-[#A47E3B]/20 focus:outline-none transition-all"
                          required
                        >
                          {categories.length > 0 ? (
                            categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name} ({category.type})
                              </option>
                            ))
                          ) : (
                            <option value="">No categories available</option>
                          )}
                        </select>
                        <div className="text-xs text-white/50 mt-1">
                          Selected category ID: {selectedCategory}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-white font-medium mb-1.5 text-sm">
                          Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-[#222222] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#A47E3B] focus:ring-1 focus:ring-[#A47E3B]/20 focus:outline-none transition-all h-28 resize-none"
                          placeholder="Enter product description"
                          required
                        ></textarea>
                      </div>
                    </div>
                    
                    {/* Right column - Images */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-white font-medium text-sm">
                          Product Images <span className="text-white/60 text-xs">(max 10)</span>
                        </label>
                        {images.length < 10 && (
                          <button
                            type="button"
                            onClick={() => setIsAddingImage(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#A47E3B] text-white text-xs rounded-lg hover:bg-[#8a6a31] transition-all"
                          >
                            <Plus size={14} />
                            Add Image
                          </button>
                        )}
                      </div>
                      
                      {/* Image grid */}
                      {images.length > 0 ? (
                        <>
                          <div className="text-xs text-white/50 mb-3 bg-[#1A1A1A] p-2 rounded">
                            💡 <strong>First image</strong> will be the main product image (shown large with cover fit). Additional images appear in pagination.
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {images.map((image, index) => (
                              <div key={index} className="relative group">
                                <div className={`aspect-square bg-[#333333] rounded-lg overflow-hidden ${index === 0 ? 'ring-2 ring-[#A47E3B]' : ''}`}>
                                  <img 
                                    src={getValidImageUrl(image)} 
                                    alt={`Product image ${index + 1}`}
                                    className="w-full h-full object-cover" 
                                  />
                                  {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-[#A47E3B] text-white text-xs px-2 py-1 rounded">
                                      Main
                                    </div>
                                  )}
                                </div>
                                <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newImages = [...images];
                                        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
                                        setImages(newImages);
                                      }}
                                      className="flex-1 bg-[#333333] hover:bg-[#444444] text-white text-xs py-1 rounded"
                                      title="Move left"
                                    >
                                      ←
                                    </button>
                                  )}
                                  {index < images.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newImages = [...images];
                                        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
                                        setImages(newImages);
                                      }}
                                      className="flex-1 bg-[#333333] hover:bg-[#444444] text-white text-xs py-1 rounded"
                                      title="Move right"
                                    >
                                      →
                                    </button>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="border border-dashed border-[#444444] rounded-lg p-8 text-center mb-4">
                          <div className="text-white/70">
                            <div className="mx-auto w-12 h-12 rounded-full bg-[#333333] flex items-center justify-center mb-2">
                              <ImageIcon size={24} />
                            </div>
                            <p>No product images added yet</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Add image UI */}
                      {isAddingImage && (
                        <div className="bg-[#1A1A1A] p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-white text-sm font-medium">Add Image</h3>
                            <button
                              type="button"
                              onClick={() => setIsAddingImage(false)}
                              className="text-white/70 hover:text-white"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          
                          <div className="mb-4">
                            <input
                              type="url"
                              placeholder="Enter image URL"
                              value={currentImageUrl}
                              onChange={(e) => setCurrentImageUrl(e.target.value)}
                              className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none"
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={addImage}
                              disabled={!currentImageUrl}
                              className="px-3 py-1 bg-[#A47E3B] text-white text-sm rounded hover:bg-[#8a6a31] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Featured Product Toggle */}
                      <div className="mt-6 pt-6 border-t border-[#333333]">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <label htmlFor="featured" className="block text-white font-medium text-sm mb-1">
                              Featured Product
                            </label>
                            <p className="text-white/60 text-xs">
                              Featured products will appear in the Featured Products section
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              id="featured"
                              checked={featured}
                              onChange={(e) => setFeatured(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#A47E3B]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#A47E3B] peer-checked:to-[#C4A962]"></div>
                          </label>
                        </div>
                        
                        {featured && (
                          <div className="mt-4">
                            <label htmlFor="featured-image" className="block text-white font-medium text-sm mb-2">
                              Featured Image URL <span className="text-white/60 text-xs">(optional)</span>
                            </label>
                            <p className="text-white/60 text-xs mb-2">
                              Use a different image for the featured section. If not provided, the main product image will be used.
                            </p>
                            <input
                              type="url"
                              id="featured-image"
                              value={featuredImageUrl}
                              onChange={(e) => setFeaturedImageUrl(e.target.value)}
                              className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none"
                              placeholder="Enter featured image URL"
                            />
                            {featuredImageUrl && (
                              <div className="mt-3 relative group">
                                <div className="aspect-video bg-[#333333] rounded-lg overflow-hidden">
                                  <img 
                                    src={getValidImageUrl(featuredImageUrl)} 
                                    alt="Featured image preview"
                                    className="w-full h-full object-contain" 
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setFeaturedImageUrl("")}
                                  className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tab-1">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-white text-lg font-medium mb-4">Product Variants</h3>
                      <p className="text-white/70 text-sm mb-6">
                        Add variants such as different frames or colors. Each variant can have its own price and quantity.
                      </p>
                      
                      {/* New variant form */}
                      <div className="bg-[#1A1A1A] p-4 rounded-lg mb-6">
                        <h4 className="text-white text-sm font-medium mb-4">
                          {newVariant.id ? 'Edit Variant' : 'Add New Variant'}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label htmlFor="variant-name" className="block text-white/70 text-sm mb-1">
                              Name*
                            </label>
                            <input
                              type="text"
                              id="variant-name"
                              value={newVariant.name || ""}
                              onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                              className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none"
                              placeholder="e.g. Black Frame, Gold Color"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="variant-type" className="block text-white/70 text-sm mb-1">
                              Type
                            </label>
                            <input
                              type="text"
                              id="variant-type"
                              value={newVariant.type || ""}
                              onChange={(e) => setNewVariant({...newVariant, type: e.target.value})}
                              className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none"
                              placeholder="e.g. Frame, Color, Size, Material, etc."
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="variant-price" className="block text-white/70 text-sm mb-1">
                              Price (optional)
                            </label>
                            <input
                              type="text"
                              id="variant-price"
                              value={newVariant.price || ""}
                              onChange={(e) => setNewVariant({...newVariant, price: e.target.value})}
                              className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none"
                              placeholder="e.g. $1,350 (leave empty to use base price)"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="variant-quantity" className="block text-white/70 text-sm mb-1">
                              Quantity*
                            </label>
                            <input
                              type="number"
                              id="variant-quantity"
                              value={newVariant.quantity || 1}
                              onChange={(e) => setNewVariant({...newVariant, quantity: parseInt(e.target.value) || 0})}
                              min="0"
                              className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="variant-image" className="block text-white/70 text-sm mb-1">
                            Image URL (optional)
                          </label>
                          <input
                            type="url"
                            id="variant-image"
                            value={newVariant.imageUrl || ""}
                            onChange={(e) => setNewVariant({...newVariant, imageUrl: e.target.value})}
                            className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none"
                            placeholder="Enter image URL for this variant"
                          />
                        </div>
                        
                        <div className="mt-4 flex justify-end gap-3">
                          {newVariant.id && (
                            <button
                              type="button"
                              onClick={() => setNewVariant({
                                name: "",
                                type: "",
                                price: "",
                                quantity: 1
                              })}
                              className="px-3 py-1 bg-transparent text-white/70 text-sm rounded hover:text-white"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleVariant}
                            disabled={!newVariant.name}
                            className="px-3 py-1 bg-[#A47E3B] text-white text-sm rounded hover:bg-[#8a6a31] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {newVariant.id ? 'Update Variant' : 'Add Variant'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Variants list */}
                      {variants.length > 0 ? (
                        <div className="bg-[#222222] rounded-lg border border-[#333333]">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#333333]">
                                <th className="text-left p-3 text-white/70 text-sm font-medium">Name</th>
                                <th className="text-left p-3 text-white/70 text-sm font-medium">Type</th>
                                <th className="text-left p-3 text-white/70 text-sm font-medium">Price</th>
                                <th className="text-left p-3 text-white/70 text-sm font-medium">Quantity</th>
                                <th className="text-right p-3 text-white/70 text-sm font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {variants.map((variant) => (
                                <tr key={variant.id} className="border-b border-[#333333] last:border-0">
                                  <td className="p-3 text-white">{variant.name}</td>
                                  <td className="p-3 text-white capitalize">{variant.type}</td>
                                  <td className="p-3 text-white">
                                    {variant.price || 'Base price'}
                                  </td>
                                  <td className="p-3 text-white">{variant.quantity}</td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setNewVariant(variant)}
                                        className="text-[#A47E3B] hover:text-[#8a6a31] text-sm"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeVariant(variant.id)}
                                        className="text-red-400 hover:text-red-300 text-sm"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="border border-dashed border-[#444444] rounded-lg p-8 text-center">
                          <div className="text-white/70">
                            <p>No variants added yet</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tab-2">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-white text-lg font-medium mb-4">Product Specifications</h3>
                      <p className="text-white/70 text-sm mb-6">
                        Add technical specifications with rich text formatting and an optional image.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left column - Title and Content */}
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="spec-title" className="block text-white font-medium mb-1">
                              Specifications Title
                            </label>
                            <input
                              type="text"
                              id="spec-title"
                              value={specificationTitle}
                              onChange={(e) => setSpecificationTitle(e.target.value)}
                              className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white focus:border-[#A47E3B] focus:outline-none"
                              placeholder="e.g. Technical Details, Materials, Dimensions"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="spec-content" className="block text-white font-medium mb-1">
                              Content
                            </label>
                            <div className="prose-invert max-w-none">
                              <RichTextEditor
                                value={specificationContent}
                                onChange={setSpecificationContent}
                                placeholder="Enter rich text specifications here..."
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Right column - Image */}
                        <div>
                          <label className="block text-white font-medium mb-4">
                            Specification Image (Optional)
                          </label>
                          
                          {/* Existing image preview */}
                          {specificationImage ? (
                            <div className="relative group mb-4">
                              <div className="aspect-video bg-[#333333] rounded-lg overflow-hidden">
                                <img 
                                  src={getValidImageUrl(specificationImage)} 
                                  alt="Specification image"
                                  className="w-full h-full object-contain" 
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setSpecificationImage("")}
                                className="absolute top-2 right-2 bg-[#333333] rounded-full p-1 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="border border-dashed border-[#444444] rounded-lg p-8 text-center mb-4">
                              <div className="text-white/70">
                                <div className="mx-auto w-12 h-12 rounded-full bg-[#333333] flex items-center justify-center mb-2">
                                  <ImageIcon size={24} />
                                </div>
                                <p>No specification image added</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Add image input */}
                          <div className="bg-[#1A1A1A] p-4 rounded-lg">
                            <input
                              type="url"
                              placeholder="Enter specification image URL"
                              value={specificationImage}
                              onChange={(e) => setSpecificationImage(e.target.value)}
                              className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tab-3">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-white text-lg font-medium mb-4">Product FAQs</h3>
                      <p className="text-white/70 text-sm mb-6">
                        Add frequently asked questions and answers.
                      </p>
                      
                      {/* Added section-level FAQ image input and preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                          <label className="block text-white font-medium mb-2">
                            FAQ Section Image (Optional)
                          </label>
                          {faqImageUrl ? (
                            <div className="relative group mb-2">
                              <div className="aspect-video bg-[#333333] rounded-lg overflow-hidden">
                                <img
                                  src={getValidImageUrl(faqImageUrl)}
                                  alt="FAQ section image"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setFaqImageUrl("")}
                                className="absolute top-2 right-2 bg-[#333333] rounded-full p-1 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="border border-dashed border-[#444444] rounded-lg p-8 text-center mb-2">
                              <div className="mx-auto w-12 h-12 rounded-full bg-[#333333] flex items-center justify-center mb-2">
                                <ImageIcon size={24} />
                              </div>
                              <p className="text-white/70">No FAQ image added</p>
                            </div>
                          )}
                          <input
                            type="url"
                            placeholder="Enter FAQ section image URL"
                            value={faqImageUrl}
                            onChange={(e) => setFaqImageUrl(e.target.value)}
                            className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      {/* New FAQ form */}
                      <div className="bg-[#1A1A1A] p-4 rounded-lg mb-6">
                        <h4 className="text-white text-sm font-medium mb-4">
                          {currentFaq.id ? 'Edit FAQ' : 'Add New FAQ'}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label htmlFor="faq-question" className="block text-white/70 text-sm mb-1">
                              Question*
                            </label>
                            <input
                              type="text"
                              id="faq-question"
                              value={currentFaq.question || ""}
                              onChange={(e) => setCurrentFaq({...currentFaq, question: e.target.value})}
                              className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none"
                              placeholder="Enter FAQ question"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="faq-answer" className="block text-white/70 text-sm mb-1">
                              Answer*
                            </label>
                            <textarea
                              id="faq-answer"
                              value={currentFaq.answer || ""}
                              onChange={(e) => setCurrentFaq({...currentFaq, answer: e.target.value})}
                              className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none h-32"
                              placeholder="Enter FAQ answer"
                            ></textarea>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end gap-3">
                          {currentFaq.id && (
                            <button
                              type="button"
                              onClick={() => setCurrentFaq({
                                question: "",
                                answer: ""
                              })}
                              className="px-3 py-1 bg-transparent text-white/70 text-sm rounded hover:text-white"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleFaq}
                            disabled={!currentFaq.question || !currentFaq.answer}
                            className="px-3 py-1 bg-[#A47E3B] text-white text-sm rounded hover:bg-[#8a6a31] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {currentFaq.id ? 'Update FAQ' : 'Add FAQ'}
                          </button>
                        </div>
                      </div>
                      
                      {/* FAQs list */}
                      {faqs.length > 0 ? (
                        <div className="bg-[#222222] rounded-lg border border-[#333333]">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#333333]">
                                <th className="text-left p-3 text-white/70 text-sm font-medium">Question</th>
                                <th className="text-left p-3 text-white/70 text-sm font-medium">Answer</th>
                                <th className="text-right p-3 text-white/70 text-sm font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {faqs.map((faq, index) => (
                                <tr key={faq.id} className="border-b border-[#333333] last:border-0">
                                  <td className="p-3 text-white">{faq.question}</td>
                                  <td className="p-3 text-white">{faq.answer}</td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => editFaq(index)}
                                        className="text-[#A47E3B] hover:text-[#8a6a31] text-sm"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeFaq(index)}
                                        className="text-red-400 hover:text-red-300 text-sm"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="border border-dashed border-[#444444] rounded-lg p-8 text-center">
                          <div className="text-white/70">
                            <p>No FAQs added yet</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tab-4">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-white text-lg font-medium mb-4">Additional Product Information</h3>
                      <p className="text-white/70 text-sm mb-6">
                        Add any additional information about the product.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label htmlFor="additional-image" className="block text-white font-medium mb-1">
                            Additional Image URL (optional)
                          </label>
                          <input
                            type="url"
                            id="additional-image"
                            value={additionalImageUrl}
                            onChange={(e) => setAdditionalImageUrl(e.target.value)}
                            className="w-full bg-[#333333] border border-[#444444] rounded p-2 text-white text-sm focus:border-[#A47E3B] focus:outline-none"
                            placeholder="Enter additional image URL"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tab-5">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-white text-lg font-medium mb-4">SEO & Meta Information</h3>
                      <p className="text-white/70 text-sm mb-6">
                        Add meta description and custom slug for better SEO. These fields are optional but recommended.
                      </p>
                      
                      <div className="space-y-6">
                        {/* Meta Description */}
                        <div>
                          <label htmlFor="meta-description" className="block text-white font-medium mb-2 text-sm">
                            Meta Description
                          </label>
                          <p className="text-white/60 text-xs mb-2">
                            A brief description for search engines (recommended: 150-160 characters). This appears in search results.
                          </p>
                          <textarea
                            id="meta-description"
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            maxLength={160}
                            className="w-full bg-[#222222] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#A47E3B] focus:ring-1 focus:ring-[#A47E3B]/20 focus:outline-none transition-all h-24 resize-none"
                            placeholder="Enter meta description for SEO (e.g., Discover this beautiful artwork featuring...)"
                          />
                          <div className="mt-1 flex justify-between items-center">
                            <p className="text-white/50 text-xs">
                              Used for search engine results and social media previews
                            </p>
                            <span className={`text-xs ${metaDescription.length > 160 ? 'text-red-400' : metaDescription.length > 150 ? 'text-yellow-400' : 'text-white/50'}`}>
                              {metaDescription.length}/160
                            </span>
                          </div>
                        </div>

                        {/* Slug */}
                        <div>
                          <label htmlFor="slug" className="block text-white font-medium mb-2 text-sm">
                            Custom Slug (URL-friendly identifier)
                          </label>
                          <p className="text-white/60 text-xs mb-2">
                            Optional: Create a custom URL-friendly identifier. If left empty, one will be auto-generated from the product name.
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              id="slug"
                              value={slug}
                              onChange={(e) => {
                                // Auto-format slug as user types
                                const formatted = e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, '-')
                                  .replace(/[^a-z0-9-]/g, '');
                                setSlug(formatted);
                              }}
                              className="flex-1 bg-[#222222] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#A47E3B] focus:ring-1 focus:ring-[#A47E3B]/20 focus:outline-none transition-all"
                              placeholder="e.g., beautiful-artwork-2024"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                // Auto-generate slug from product name
                                if (name) {
                                  const generated = name
                                    .toLowerCase()
                                    .replace(/\s+/g, '-')
                                    .replace(/[^a-z0-9-]/g, '');
                                  setSlug(generated);
                                }
                              }}
                              disabled={!name}
                              className="px-3 py-2.5 bg-[#333333] hover:bg-[#444444] text-white text-xs rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#444444]"
                              title="Generate slug from product name"
                            >
                              Auto
                            </button>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-white/50 text-xs">
                              Preview URL: <span className="text-white/70">/product/{slug || '[auto-generated]'}</span>
                            </p>
                            <p className="text-white/50 text-xs">
                              💡 Best practices: Use lowercase, hyphens instead of spaces, no special characters
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Submission buttons - Fixed at bottom */}
            <div className="mt-6 pt-4 border-t border-[#333333] flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 bg-[#222222] text-white/80 rounded-lg hover:bg-[#2A2A2A] hover:text-white transition-all border border-[#333333] font-medium text-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-[#A47E3B] to-[#C4A962] text-white rounded-lg hover:from-[#8a6a31] hover:to-[#A47E3B] transition-all shadow-lg shadow-[#A47E3B]/20 flex items-center gap-2 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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