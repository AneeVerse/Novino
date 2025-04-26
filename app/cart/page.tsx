import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold">Items (2)</h2>
              <button className="text-sm text-gray-500 hover:text-gray-700">Remove All</button>
            </div>
            
            {/* Cart Item 1 */}
            <div className="flex flex-col sm:flex-row gap-4 border-b pb-6 mb-6">
              <div className="sm:w-1/4">
                <div className="aspect-square relative bg-gray-100 rounded-md overflow-hidden">
                  <Image 
                    src="/images/paintings/painting1.jpg" 
                    alt="Product Image" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Abstract Landscape Painting</h3>
                  <button className="text-sm text-gray-500 hover:text-gray-700">Remove</button>
                </div>
                <p className="text-sm text-gray-500 mb-4">By Jane Doe</p>
                <div className="flex justify-between items-end">
                  <div className="flex items-center">
                    <button className="w-8 h-8 flex items-center justify-center border rounded-l">-</button>
                    <span className="w-12 h-8 flex items-center justify-center border-t border-b">1</span>
                    <button className="w-8 h-8 flex items-center justify-center border rounded-r">+</button>
                  </div>
                  <p className="font-semibold">$249.99</p>
                </div>
              </div>
            </div>
            
            {/* Cart Item 2 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-1/4">
                <div className="aspect-square relative bg-gray-100 rounded-md overflow-hidden">
                  <Image 
                    src="/images/artefacts/artefact1.jpg" 
                    alt="Product Image" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Ceramic Vase</h3>
                  <button className="text-sm text-gray-500 hover:text-gray-700">Remove</button>
                </div>
                <p className="text-sm text-gray-500 mb-4">By John Smith</p>
                <div className="flex justify-between items-end">
                  <div className="flex items-center">
                    <button className="w-8 h-8 flex items-center justify-center border rounded-l">-</button>
                    <span className="w-12 h-8 flex items-center justify-center border-t border-b">1</span>
                    <button className="w-8 h-8 flex items-center justify-center border rounded-r">+</button>
                  </div>
                  <p className="font-semibold">$129.99</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Link 
              href="/shop" 
              className="inline-flex items-center text-[#AE876D] hover:text-[#8d6c58]"
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
                className="mr-2"
              >
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal (2 items)</span>
                <span>$379.98</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>$15.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>$38.00</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>$432.98</span>
              </div>
            </div>
            
            <button className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white py-3 rounded-md font-medium">
              Proceed to Checkout
            </button>
            
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span>We accept:</span>
                <div className="flex space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12a2.5 2.5 0 0 0 2.5 2.5c2.5 0 2.5-5 5-5a2.5 2.5 0 0 1 2.5 2.5c0 2.5-5 2.5-5 5a2.5 2.5 0 0 0 2.5 2.5"/><path d="M14 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0Z"/><path d="M19 9v6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 