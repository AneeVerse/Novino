"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TestimonialFormProps {
  mode: 'add' | 'edit';
  testimonial?: {
    id: string;
    name: string;
    location: string;
    avatar: string;
    rating: number;
    comment: string;
    socialIcon?: string;
  };
  onCancel: () => void;
}

export default function TestimonialForm({ mode, testimonial, onCancel }: TestimonialFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: testimonial?.name || '',
    location: testimonial?.location || '',
    avatar: testimonial?.avatar || '/images/testimonals/default-avatar.png',
    rating: testimonial?.rating || 5,
    comment: testimonial?.comment || '',
    socialIcon: testimonial?.socialIcon || '/images/Capa 2.png'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const endpoint = mode === 'add' 
        ? '/api/testimonials' 
        : `/api/testimonials/${testimonial?.id}`;
      
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
      setError(err.message || 'Failed to save testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A2A] rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl text-white font-bold mb-4">
          {mode === 'add' ? 'Add New Testimonial' : 'Edit Testimonial'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 mb-6">
            <div>
              <label htmlFor="name" className="block text-white text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                placeholder="Enter customer name"
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-white text-sm font-medium mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                placeholder="City, Country"
              />
            </div>
            
            <div>
              <label htmlFor="avatar" className="block text-white text-sm font-medium mb-1">
                Avatar URL
              </label>
              <input
                type="text"
                id="avatar"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                placeholder="Enter avatar image URL"
              />
            </div>
            
            <div>
              <label htmlFor="rating" className="block text-white text-sm font-medium mb-1">
                Rating
              </label>
              <select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
              >
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="comment" className="block text-white text-sm font-medium mb-1">
                Comment
              </label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white resize-y"
                placeholder="Enter customer testimonial"
              />
            </div>
            
            <div>
              <label htmlFor="socialIcon" className="block text-white text-sm font-medium mb-1">
                Social Icon URL (Optional)
              </label>
              <input
                type="text"
                id="socialIcon"
                name="socialIcon"
                value={formData.socialIcon}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-md text-white"
                placeholder="Enter social icon URL"
              />
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
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Testimonial' : 'Update Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 