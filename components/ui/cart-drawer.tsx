"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { X, Loader2 } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, getCartTotal, isLoading } = useCart();
  
  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Close drawer when pressing escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle quantity change
  const handleIncreaseQuantity = (id: string | number, currentQuantity: number, variant?: string) => {
    updateQuantity(id, currentQuantity + 1, variant);
  };
  
  const handleDecreaseQuantity = (id: string | number, currentQuantity: number, variant?: string) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1, variant);
    }
  };
  
  const total = getCartTotal();
  
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#222222] z-[9999] transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#333333]">
          <div className="text-2xl font-medium text-white">CART</div>
          <button onClick={onClose} className="text-white hover:text-[#AE876D]">
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="h-[calc(100%-200px)] overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 text-[#AE876D] animate-spin mb-4" />
              <p className="text-white/70">Loading your cart...</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-lg text-white/70 mb-4">Your cart is empty</p>
              <Link
                href="/shop"
                className="inline-block bg-[#AE876D] hover:bg-[#8d6c58] text-white py-2 px-4"
                onClick={onClose}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={`${item.id}-${item.variant || 'basic'}`} className="flex gap-4 pb-6 border-b border-[#333333]">
                  <div className="w-24 h-24 relative bg-[#333333] overflow-hidden">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id, item.variant)}
                        className="text-sm text-white/70 hover:text-[#AE876D] uppercase"
                      >
                        Remove
                      </button>
                    </div>
                    {item.variant && (
                      <p className="text-sm text-white/60 mb-1">{item.variant}</p>
                    )}
                    <p className="font-semibold mb-2 text-white">
                      {typeof item.price === 'string' ? item.price : formatCurrency(item.price)}
                    </p>
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleDecreaseQuantity(item.id, item.quantity, item.variant)}
                        className="w-6 h-6 flex items-center justify-center border border-[#444444] text-white hover:bg-[#333333]"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-white">{item.quantity}</span>
                      <button 
                        onClick={() => handleIncreaseQuantity(item.id, item.quantity, item.variant)}
                        className="w-6 h-6 flex items-center justify-center border border-[#444444] text-white hover:bg-[#333333]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {!isLoading && cart.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full bg-[#222222] border-t border-[#333333] p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white">TOTAL</span>
              <span className="text-xl font-bold text-white">{formatCurrency(total)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <Link 
                href="/checkout"
                className="w-full py-3 bg-[#AE876D] hover:bg-[#8d6c58] text-white text-center uppercase font-medium"
                onClick={onClose}
              >
                Checkout
              </Link>
              <button 
                onClick={onClose}
                className="w-full py-3 border border-[#444444] hover:bg-[#333333] text-white text-center uppercase font-medium"
              >
                Continue Shopping
              </button>
            </div>
            <div className="mt-4 text-center text-sm text-white/60">
              Shipping and taxes calculated at checkout
            </div>
          </div>
        )}
      </div>
    </>
  );
} 