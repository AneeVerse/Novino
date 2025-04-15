"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css';

// Dynamically import SunEditor to avoid SSR issues
const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false,
});

interface BlogFormProps {
  mode: 'add' | 'edit';
  blog?: {
    id: string;
    title: string;
    slug?: string;
    description: string;
    content: string;
    image: string;
    author?: {
      name: string;
      role?: string;
      image?: string;
    };
    readTime?: number;
    publishedAt?: string;
  };
  onCancel: () => void;
}

export default function BlogForm({ mode, blog, onCancel }: BlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    slug: blog?.slug || '',
    description: blog?.description || '',
    content: blog?.content || '',
    image: blog?.image || '/images/blog/Rectangle 13.png', // Default image
    author: blog?.author || {
      name: '',
      role: 'Writer',
      image: '/images/default-author.png'
    },
    readTime: blog?.readTime || 5,
    publishedAt: blog?.publishedAt || new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested author fields
    if (name.startsWith('author.')) {
      const authorField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        author: {
          ...prev.author,
          [authorField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Generate slug from title
  const generateSlug = () => {
    if (!formData.title) return;
    
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({
      ...prev,
      slug
    }));
  };

  // Handle content change from SunEditor
  const handleEditorChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const endpoint = mode === 'add' 
        ? '/api/blogs' 
        : `/api/blogs/${blog?.id}`;
      
      const method = mode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      // Refresh the page data
      router.refresh();
      
      // Close the form
      onCancel();
    } catch (err: any) {
      setError(err.message || 'Failed to save blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SunEditor options
  const editorOptions = {
    buttonList: [
      ['undo', 'redo'],
      ['font', 'fontSize', 'formatBlock'],
      ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
      ['removeFormat'],
      ['fontColor', 'hiliteColor'],
      ['outdent', 'indent'],
      ['align', 'horizontalRule', 'list', 'table'],
      ['link', 'image', 'video'],
      ['fullScreen', 'showBlocks', 'codeView'],
    ],
    defaultTag: 'div',
    minHeight: '300px',
    height: 'auto',
    width: 'auto'
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A2A] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl text-white font-bold mb-4">
          {mode === 'add' ? 'Add New Blog' : 'Edit Blog'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-white text-sm font-medium mb-1">
                  Blog Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={formData.slug ? undefined : generateSlug}
                  required
                  className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                  placeholder="Enter blog title"
                />
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-white text-sm font-medium mb-1">
                  URL Slug*
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-l-md text-white"
                    placeholder="url-friendly-title"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-3 py-2 bg-[#444444] text-white rounded-r-md hover:bg-[#555555] transition"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-white/50 text-xs mt-1">This will be used in the blog URL. Auto-generated from title but can be customized.</p>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-white text-sm font-medium mb-1">
                Description*
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                placeholder="Enter blog description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="image" className="block text-white text-sm font-medium mb-1">
                  Thumbnail URL*
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                  placeholder="Enter image URL"
                />
              </div>
              
              <div>
                <label htmlFor="readTime" className="block text-white text-sm font-medium mb-1">
                  Time to Read (minutes)*
                </label>
                <input
                  type="number"
                  id="readTime"
                  name="readTime"
                  min="1"
                  max="60"
                  value={formData.readTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                  placeholder="5"
                />
              </div>
              
              <div>
                <label htmlFor="publishedAt" className="block text-white text-sm font-medium mb-1">
                  Publication Date*
                </label>
                <input
                  type="date"
                  id="publishedAt"
                  name="publishedAt"
                  value={formData.publishedAt}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                />
              </div>
            </div>
            
            <fieldset className="border border-[#444444] rounded-md p-4">
              <legend className="text-white text-sm font-medium px-2">Author Information</legend>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="author.name" className="block text-white text-sm font-medium mb-1">
                    Author Name*
                  </label>
                  <input
                    type="text"
                    id="author.name"
                    name="author.name"
                    value={formData.author.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                    placeholder="Author name"
                  />
                </div>
                
                <div>
                  <label htmlFor="author.role" className="block text-white text-sm font-medium mb-1">
                    Author Role
                  </label>
                  <input
                    type="text"
                    id="author.role"
                    name="author.role"
                    value={formData.author.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                    placeholder="Writer, Editor, etc."
                  />
                </div>
                
                <div>
                  <label htmlFor="author.image" className="block text-white text-sm font-medium mb-1">
                    Author Image URL
                  </label>
                  <input
                    type="text"
                    id="author.image"
                    name="author.image"
                    value={formData.author.image}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                    placeholder="Author image URL"
                  />
                </div>
              </div>
            </fieldset>
            
            <div>
              <label htmlFor="content" className="block text-white text-sm font-medium mb-1">
                Content*
              </label>
              <div className="suneditor-container" style={{ background: '#333333', border: '1px solid #444444', borderRadius: '0.375rem' }}>
                <SunEditor
                  setContents={formData.content}
                  onChange={handleEditorChange}
                  setOptions={editorOptions}
                  placeholder="Enter blog content"
                  setDefaultStyle="font-family: sans-serif; color: #fff; background: #333333;"
                />
              </div>
              <input type="hidden" name="content" value={formData.content} />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-[#444444] text-white rounded-md hover:bg-[#555555] transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#A47E3B] text-white rounded-md hover:bg-[#8a6a31] transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Blog' : 'Update Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 