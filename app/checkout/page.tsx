"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CheckoutPage() {
  const { cart, getCartTotal } = useCart();
  
  // Calculate shipping and tax
  const shipping = cart.length > 0 ? 15 : 0;
  const subtotal = getCartTotal();
  const tax = subtotal * 0.1; // 10% tax rate
  const total = subtotal + shipping + tax;
  
  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto pt-24 pb-12 px-4 min-h-screen bg-[#2D2D2D] text-white">
        <div className="text-center py-12">
          <p className="text-xl mb-6">Your cart is empty</p>
          <Link 
            href="/shop" 
            className="inline-block bg-[#AE876D] hover:bg-[#8d6c58] text-white py-3 px-6 font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#2D2D2D] text-white">
      <div className="container mx-auto pt-24 pb-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout form */}
          <div className="lg:col-span-2">
            <div className="bg-[#333333] p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            
            <div className="bg-[#333333] p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-white/70 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-white/70 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-white/70 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white mb-2"
                  placeholder="Street address"
                />
                <input
                  type="text"
                  id="addressLine2"
                  className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-white/70 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-white/70 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-white/70 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="zip"
                    className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="country" className="block text-sm font-medium text-white/70 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="NZ">New Zealand</option>
                </select>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white/70 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                />
              </div>
            </div>
            
            <div className="bg-[#333333] p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-4">
                <div className="flex items-center mb-2">
                  <input 
                    type="radio" 
                    id="credit-card" 
                    name="payment-method" 
                    className="mr-2" 
                    defaultChecked
                  />
                  <label htmlFor="credit-card">Credit Card</label>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-white/70 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiration" className="block text-sm font-medium text-white/70 mb-1">
                        Expiration (MM/YY)
                      </label>
                      <input
                        type="text"
                        id="expiration"
                        className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-white/70 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        className="w-full bg-[#222222] border border-[#444444] rounded p-2 text-white"
                        placeholder="CVC"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#333333] p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="max-h-60 overflow-y-auto mb-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.variant || 'basic'}`} className="flex items-center mb-4 pb-4 border-b border-[#444444]">
                    <div className="w-16 h-16 relative mr-4 bg-[#222222]">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-2 -right-2 bg-[#AE876D] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.name}</h4>
                      {item.variant && (
                        <p className="text-xs text-white/60 mb-1">{item.variant}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {typeof item.price === 'string' ? item.price : formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Shipping</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              </div>
              
              <div className="border-t border-[#444444] pt-4 mb-6">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              
              <button className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white py-3 font-medium">
                Complete Order
              </button>
              
              <div className="mt-4 text-center text-xs text-white/60">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 