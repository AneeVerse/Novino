"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Smartphone, Wallet, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: string | number;
  name: string;
  price: string | number;
  quantity: number;
  image: string;
  variant?: string;
}

interface Address {
  name: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null);

  // Parse price from string or number
  const parsePrice = (price: string | number): number => {
    if (typeof price === 'number') return price;
    const cleaned = price.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotalInclusive = selectedItems.reduce((total, item) => {
      const itemPrice = parsePrice(item.price);
      return total + (itemPrice * item.quantity);
    }, 0);
    
    const totalInclusive = subtotalInclusive;
    const cartTotal = totalInclusive / 1.18;
    const gst = totalInclusive - cartTotal;
    const total = totalInclusive;
    
    return { subtotal: subtotalInclusive, gst, cartTotal, total };
  };

  const { subtotal, gst, cartTotal, total } = calculateTotals();

  // Load cart items and address from localStorage
  useEffect(() => {
    const items = localStorage.getItem('selectedCartItems');
    const address = localStorage.getItem('selectedAddress');
    
    if (items) {
      setSelectedItems(JSON.parse(items));
    }
    
    if (address) {
      setDeliveryAddress(JSON.parse(address));
    } else {
      // No address, redirect back to address page
      toast({
        variant: "destructive",
        title: "No Address Found",
        description: "Please add a delivery address first",
      });
      router.push('/cart/address');
      return;
    }
    
    setLoading(false);
  }, [router, toast]);

  const handlePlaceOrder = async () => {
    if (!deliveryAddress) {
      toast({
        variant: "destructive",
        title: "Address Missing",
        description: "Please add a delivery address",
      });
      router.push('/cart/address');
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart Empty",
        description: "No items to order",
      });
      router.push('/cart');
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart after successful order
      clearCart();
      
      // Clear localStorage
      localStorage.removeItem('selectedCartItems');
      localStorage.removeItem('selectedAddress');

      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your purchase. You will receive a confirmation email shortly.",
      });

      // Redirect to order confirmation or home
      router.push('/');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2D2D2D] flex flex-col items-center justify-center pt-24">
        <Loader2 className="h-12 w-12 text-[#AE876D] animate-spin mb-4" />
        <p className="text-white text-xl">Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2D2D2D] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={() => router.push('/cart')}
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-white/60">MY BAG</span>
            </button>
            <div className="w-16 h-0.5 bg-[#444444]"></div>
            <button 
              onClick={() => router.push('/cart/address')}
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-white/60">ADDRESS</span>
            </button>
            <div className="w-16 h-0.5 bg-[#444444]"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#AE876D] flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-[#AE876D]">PAYMENT</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Payment Methods */}
          <div className="lg:w-2/3">
            <h1 className="text-2xl md:text-3xl font-semibold mb-6">Payment Method</h1>
            
            {/* Delivery Address Summary */}
            {deliveryAddress && (
              <div className="bg-[#333333] rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-white/70 mb-2">DELIVERING TO:</h3>
                <p className="text-white font-semibold">{deliveryAddress.name}, {deliveryAddress.pincode}</p>
                <p className="text-white/70 text-sm">{deliveryAddress.address}</p>
                <p className="text-white/70 text-sm">{deliveryAddress.city}, {deliveryAddress.state}</p>
                <button
                  onClick={() => router.push('/cart/address')}
                  className="mt-2 text-[#AE876D] hover:text-[#8d6c58] text-sm font-medium uppercase"
                >
                  Change Address
                </button>
              </div>
            )}

            {/* Payment Methods */}
            <div className="bg-[#333333] rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-[#444444] rounded-md cursor-pointer hover:bg-[#444444] transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                  />
                  <CreditCard className="w-5 h-5 ml-3 mr-2 text-white/70" />
                  <span className="text-white text-sm md:text-base">Credit/Debit Card</span>
                </label>

                <label className="flex items-center p-4 border border-[#444444] rounded-md cursor-pointer hover:bg-[#444444] transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                  />
                  <Smartphone className="w-5 h-5 ml-3 mr-2 text-white/70" />
                  <span className="text-white text-sm md:text-base">UPI</span>
                </label>

                <label className="flex items-center p-4 border border-[#444444] rounded-md cursor-pointer hover:bg-[#444444] transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                  />
                  <Wallet className="w-5 h-5 ml-3 mr-2 text-white/70" />
                  <span className="text-white text-sm md:text-base">Wallet</span>
                </label>

                <label className="flex items-center p-4 border border-[#444444] rounded-md cursor-pointer hover:bg-[#444444] transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                  />
                  <DollarSign className="w-5 h-5 ml-3 mr-2 text-white/70" />
                  <span className="text-white text-sm md:text-base">Cash on Delivery</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-[#333333] rounded-lg p-6 sticky top-24 self-start">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              {/* Order Items Count */}
              <div className="mb-4 pb-4 border-b border-[#444444]">
                <p className="text-white/70 text-sm">
                  {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'}
                </p>
              </div>

              {/* Billing Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Cart Total (Excl. of all taxes)</span>
                  <span className="text-white">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">GST</span>
                  <span className="text-white">{formatPrice(gst)}</span>
                </div>
              </div>
              
              <div className="border-t border-[#444444] pt-4 mb-6">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-white">Total</span>
                  <span className="text-white">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#444444] disabled:cursor-not-allowed text-white py-4 rounded-md font-semibold text-lg mb-4 transition-colors flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'PLACE ORDER'
                )}
              </button>

              <p className="text-xs text-white/50 text-center">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.push('/cart/address')}
            disabled={processing}
            className="text-[#AE876D] hover:text-[#8d6c58] font-medium disabled:opacity-50"
          >
            ← Back to Address
          </button>
        </div>
      </div>
    </div>
  );
}

