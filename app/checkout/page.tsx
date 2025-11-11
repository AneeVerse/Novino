"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, ChevronDown, ChevronUp, Wallet, CreditCard, Building2, AlertCircle } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  icon?: React.ReactNode;
  balance?: string;
  disabled?: boolean;
  message?: string;
  collapsible?: boolean;
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  
  // State for selected items from cart (only items user selected)
  const [selectedCartItems, setSelectedCartItems] = useState<any[]>([]);
  
  // State for cart extras (gift wrap, etc.)
  const [cartExtras, setCartExtras] = useState({
    giftWrap: false,
    coupon: false,
    giftVoucher: false
  });
  
  // State for delivery address
  const [deliveryAddress, setDeliveryAddress] = useState<{
    name: string;
    pincode: string;
    address: string;
    estimatedDelivery: string;
  } | null>(null);
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // State for payment methods
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [expandedPayments, setExpandedPayments] = useState<{ [key: string]: boolean }>({});
  
  // State for card details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: ""
  });
  
  // State for UPI
  const [upiId, setUpiId] = useState("");
  
  // State for selected wallet
  const [selectedWallet, setSelectedWallet] = useState("");
  
  // State for selected bank
  const [selectedBank, setSelectedBank] = useState("");
  
  // Fetch selected items, extras, and address on mount
  useEffect(() => {
    // Get selected items from localStorage (set by cart page)
    const savedSelectedItems = localStorage.getItem('selectedCartItems');
    if (savedSelectedItems) {
      try {
        const items = JSON.parse(savedSelectedItems);
        setSelectedCartItems(items);
      } catch (error) {
        console.error('Error parsing selected items:', error);
        // Fallback to all cart items if parsing fails
        setSelectedCartItems(cart);
      }
    } else {
      // If no selected items, use all cart items (fallback)
      setSelectedCartItems(cart);
    }
    
    // Get cart extras (gift wrap, etc.)
    const savedExtras = localStorage.getItem('cartExtras');
    if (savedExtras) {
      try {
        const extras = JSON.parse(savedExtras);
        setCartExtras(extras);
      } catch (error) {
        console.error('Error parsing cart extras:', error);
      }
    }
    
    // Get address
    const savedAddress = localStorage.getItem('selectedAddress');
    if (savedAddress) {
      setDeliveryAddress(JSON.parse(savedAddress));
    }
  }, [cart]);
  
  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  // Parse price from string or number
  const parsePrice = (price: string | number): number => {
    if (typeof price === 'number') return price;
    const cleaned = price.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };
  
  // Calculate totals based on selected items only
  // Prices are already GST inclusive (as shown by "MRP incl. of all taxes")
  const calculateTotals = () => {
    // Calculate subtotal (GST inclusive prices)
    const subtotalInclusive = selectedCartItems.reduce((total, item) => {
      const itemPrice = parsePrice(item.price);
      return total + (itemPrice * item.quantity);
    }, 0);
    
    // Add gift wrap if selected (₹25)
    const giftWrapAmount = cartExtras.giftWrap ? 25 : 0;
    const totalInclusive = subtotalInclusive + giftWrapAmount;
    
    // Extract base price (excluding GST) - GST is 18% in India
    // If price is GST inclusive: basePrice = totalInclusive / 1.18
    const cartTotal = totalInclusive / 1.18;
    
    // Calculate GST amount
    const gst = totalInclusive - cartTotal;
    
    // Shipping is free
    const shipping = 0;
    
    // Total is the inclusive amount (since prices already include GST)
    const total = totalInclusive;
    
    return { 
      subtotal: subtotalInclusive, 
      cartTotal, 
      gst, 
      shipping, 
      total,
      giftWrapAmount 
    };
  };
  
  const { subtotal, cartTotal, gst, shipping, total, giftWrapAmount } = calculateTotals();
  
  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "tss-money",
      name: "TSS Money",
      icon: <Wallet className="w-5 h-5" />,
      balance: "₹0.00"
    },
    {
      id: "upi",
      name: "Pay with any UPI App"
    },
    {
      id: "wallets",
      name: "Wallets",
      collapsible: true
    },
    {
      id: "cards",
      name: "Credit & Debit Cards",
      collapsible: true
    },
    {
      id: "netbanking",
      name: "Netbanking",
      collapsible: true
    },
    {
      id: "cred",
      name: "CRED pay",
      disabled: true,
      message: "You're not eligible for this payment option."
    },
    {
      id: "cod",
      name: "COD",
      message: "We recommend making prepaid payments to ensure your deliveries are contactless."
    }
  ];
  
  // Wallet options
  const walletOptions = [
    { id: "paytm", name: "Paytm" },
    { id: "phonepe", name: "PhonePe" },
    { id: "amazonpay", name: "Amazon Pay" },
    { id: "freecharge", name: "Freecharge" }
  ];
  
  // Bank options
  const bankOptions = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank"
  ];
  
  // Check if COD is available (some products may not support COD)
  const isCodAvailable = selectedCartItems.every(item => {
    // Check if item variant indicates COD is not available
    return !item.variant?.includes('Collectible');
  });
  
  // Handle payment method selection
  const handlePaymentSelect = (methodId: string) => {
    if (methodId === "cred") return; // Disabled
    setSelectedPayment(methodId);
    
    // Auto-expand collapsible sections when selected
    if (methodId === "wallets" || methodId === "cards" || methodId === "netbanking") {
      setExpandedPayments(prev => ({ ...prev, [methodId]: true }));
    }
  };
  
  // Toggle payment method expansion
  const togglePaymentExpansion = (methodId: string) => {
    setExpandedPayments(prev => ({ ...prev, [methodId]: !prev[methodId] }));
  };
  
  // Handle confirm order
  const handleConfirmOrder = () => {
    if (!deliveryAddress) {
      toast({
        variant: "destructive",
        title: "Address Required",
        description: "Please add a delivery address first",
      });
      router.push('/cart');
      return;
    }
    
    if (!selectedPayment) {
      toast({
        variant: "destructive",
        title: "Payment Method Required",
        description: "Please select a payment method",
      });
      return;
    }
    
    if (selectedPayment === "cod" && !isCodAvailable) {
      toast({
        variant: "destructive",
        title: "COD Not Available",
        description: "Cash on delivery is not available for some items in your cart",
      });
      return;
    }
    
    // Validate payment method specific fields
    if (selectedPayment === "cards") {
      if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
        toast({
          variant: "destructive",
          title: "Card Details Required",
          description: "Please fill in all card details",
        });
        return;
      }
    }
    
    if (selectedPayment === "upi") {
      if (!upiId) {
        toast({
          variant: "destructive",
          title: "UPI ID Required",
          description: "Please enter your UPI ID",
        });
        return;
      }
    }
    
    if (selectedPayment === "wallets") {
      if (!selectedWallet) {
        toast({
          variant: "destructive",
          title: "Wallet Selection Required",
          description: "Please select a wallet",
        });
        return;
      }
    }
    
    if (selectedPayment === "netbanking") {
      if (!selectedBank) {
        toast({
          variant: "destructive",
          title: "Bank Selection Required",
          description: "Please select a bank",
        });
        return;
      }
    }
    
    // Place order via API
    const placeOrder = async () => {
      try {
        const orderData = {
          items: selectedCartItems.map((item: any) => ({
            productId: String(item.id),
            name: item.name,
            price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : item.price,
            quantity: item.quantity,
            image: item.image,
            variant: item.variant
          })),
          subtotal: cartTotal,
          gst,
          shippingCost: 0, // Free shipping
          total,
          deliveryAddress: {
            name: deliveryAddress.name,
            line1: deliveryAddress.line1 || deliveryAddress.address?.split(',')[0] || deliveryAddress.address,
            line2: deliveryAddress.line2 || '',
            city: deliveryAddress.city || '',
            state: deliveryAddress.state || '',
            pincode: deliveryAddress.pincode
          },
          paymentMethod: selectedPayment,
          giftWrap: cartExtras.giftWrap
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (response.ok) {
          const { order } = await response.json();
          
          toast({
            title: "Order Placed Successfully!",
            description: `Order #${order.orderNumber} has been confirmed. ${selectedPayment === 'cod' ? 'Payment will be collected on delivery.' : ''}`,
          });
          
          // Clear selected items from localStorage
          localStorage.removeItem('selectedCartItems');
          localStorage.removeItem('cartExtras');
          localStorage.removeItem('selectedAddress');
          
          // Navigate to profile orders page
          setTimeout(() => {
            router.push('/profile?tab=orders');
          }, 2000);
        } else {
          const error = await response.json();
          toast({
            variant: "destructive",
            title: "Order Failed",
            description: error.message || "Failed to place order. Please try again.",
          });
        }
      } catch (error) {
        console.error('Order placement error:', error);
        toast({
          variant: "destructive",
          title: "Order Failed",
          description: "An error occurred while placing your order. Please try again.",
        });
      }
    };

    placeOrder();
  };
  
  if (selectedCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#2D2D2D] pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-xl text-white mb-6">No items selected for checkout</p>
            <Link 
              href="/cart" 
              className="inline-block bg-[#AE876D] hover:bg-[#8d6c58] text-white py-3 px-6 rounded-md font-medium transition-colors mr-4"
            >
              Back to Cart
            </Link>
            <Link 
              href="/paintings" 
              className="inline-block bg-[#AE876D] hover:bg-[#8d6c58] text-white py-3 px-6 rounded-md font-medium transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#2D2D2D] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Progress Indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-1 sm:space-x-4 overflow-x-auto pb-2 px-2">
            <div className="flex items-center flex-shrink-0">
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#444444] flex items-center justify-center text-[10px] sm:text-sm font-semibold">
                1
              </div>
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-sm font-medium text-white/60">MY BAG</span>
            </div>
            <div className="w-5 sm:w-16 h-0.5 bg-[#444444] flex-shrink-0"></div>
            <div className="flex items-center flex-shrink-0">
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#AE876D] flex items-center justify-center text-[10px] sm:text-sm font-semibold">
                2
              </div>
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-sm font-medium text-[#AE876D]">ADDRESS</span>
            </div>
            <div className="w-5 sm:w-16 h-0.5 bg-[#444444] flex-shrink-0"></div>
            <div className="flex items-center flex-shrink-0">
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#444444] flex items-center justify-center text-[10px] sm:text-sm font-semibold">
                3
              </div>
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-sm font-medium text-white/60">PAYMENT</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Left Column - Address and Payment */}
          <div className="lg:w-2/3">
            {/* Delivery Address Section */}
            <div className="bg-[#333333] rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              {deliveryAddress ? (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-4 h-4 mr-2 text-[#AE876D] flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">Deliver To:</span>
                    </div>
                    <p className="text-white font-semibold mb-1 text-sm sm:text-base">
                      {deliveryAddress.name}, {deliveryAddress.pincode}
                    </p>
                    <p className="text-white/70 text-xs sm:text-sm break-words">{deliveryAddress.address}</p>
                  </div>
                  <button 
                    onClick={() => router.push('/cart')}
                    className="text-[#AE876D] hover:text-[#8d6c58] text-xs sm:text-sm font-medium uppercase flex-shrink-0"
                  >
                    CHANGE
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-3 sm:mb-4">
                    <MapPin className="w-4 h-4 mr-2 text-[#AE876D] flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Deliver To:</span>
                  </div>
                  <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4">No address added yet</p>
                  <button
                    onClick={() => router.push('/cart')}
                    className="bg-[#AE876D] hover:bg-[#8d6c58] text-white py-2 px-4 rounded-md text-xs sm:text-sm font-medium transition-colors"
                  >
                    Add Address
                  </button>
                </div>
              )}
            </div>
            
            {/* Payment Options Section */}
            <div className="bg-[#333333] rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Payment Options</h2>
              
              <div className="space-y-3 sm:space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border border-[#444444] rounded-md overflow-hidden">
                    <label
                      className={`flex items-center p-3 sm:p-4 cursor-pointer transition-colors ${
                        method.disabled
                          ? 'bg-[#222222] opacity-50 cursor-not-allowed'
                          : selectedPayment === method.id
                          ? 'bg-[#444444]'
                          : 'hover:bg-[#444444]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() => handlePaymentSelect(method.id)}
                        disabled={method.disabled}
                        className="w-4 h-4 text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0 mr-2 sm:mr-3 flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            {method.icon && <span className="text-white/70 flex-shrink-0">{method.icon}</span>}
                            <span className="text-white font-medium text-xs sm:text-sm break-words">{method.name}</span>
                            {method.balance && (
                              <span className="text-white/60 text-xs sm:text-sm flex-shrink-0">(Balance: {method.balance})</span>
                            )}
                          </div>
                          
                          {method.collapsible && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                togglePaymentExpansion(method.id);
                              }}
                              className="text-white/60 hover:text-white flex-shrink-0"
                            >
                              {expandedPayments[method.id] ? (
                                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                              ) : (
                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {method.message && (
                          <p className={`text-xs sm:text-sm mt-2 ${
                            method.id === "cod" ? "text-yellow-400" : "text-white/60"
                          }`}>
                            {method.message}
                          </p>
                        )}
                        
                        {method.id === "cod" && !isCodAvailable && (
                          <p className="text-xs sm:text-sm mt-2 text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            Some products are not applicable for COD.
                          </p>
                        )}
                      </div>
                    </label>
                    
                    {/* Expanded Content */}
                    {expandedPayments[method.id] && (
                      <div className="border-t border-[#444444] p-3 sm:p-4 bg-[#222222]">
                        {method.id === "cards" && (
                          <div className="space-y-3 sm:space-y-4">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
                                Card Number
                              </label>
                              <input
                                type="text"
                                value={cardDetails.cardNumber}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                                placeholder="1234 5678 9012 3456"
                                className="w-full bg-[#333333] border border-[#444444] rounded px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#AE876D]"
                                maxLength={19}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
                                  Expiry (MM/YY)
                                </label>
                                <input
                                  type="text"
                                  value={cardDetails.expiry}
                                  onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                                  placeholder="MM/YY"
                                  className="w-full bg-[#333333] border border-[#444444] rounded px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#AE876D]"
                                  maxLength={5}
                                />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
                                  CVV
                                </label>
                                <input
                                  type="text"
                                  value={cardDetails.cvv}
                                  onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                  placeholder="CVV"
                                  className="w-full bg-[#333333] border border-[#444444] rounded px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#AE876D]"
                                  maxLength={4}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
                                Cardholder Name
                              </label>
                              <input
                                type="text"
                                value={cardDetails.name}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Name on card"
                                className="w-full bg-[#333333] border border-[#444444] rounded px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#AE876D]"
                              />
                            </div>
                          </div>
                        )}
                        
                        {method.id === "upi" && (
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
                              UPI ID
                            </label>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="yourname@upi"
                              className="w-full bg-[#333333] border border-[#444444] rounded px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#AE876D]"
                            />
                          </div>
                        )}
                        
                        {method.id === "wallets" && (
                          <div className="space-y-2 sm:space-y-3">
                            {walletOptions.map((wallet) => (
                              <label
                                key={wallet.id}
                                className="flex items-center p-2 sm:p-3 border border-[#444444] rounded-md cursor-pointer hover:bg-[#333333] transition-colors"
                              >
                                <input
                                  type="radio"
                                  name="wallet"
                                  value={wallet.id}
                                  checked={selectedWallet === wallet.id}
                                  onChange={(e) => setSelectedWallet(e.target.value)}
                                  className="w-4 h-4 text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0 mr-2 sm:mr-3 flex-shrink-0"
                                />
                                <span className="text-white text-xs sm:text-sm">{wallet.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {method.id === "netbanking" && (
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
                              Select Bank
                            </label>
                            <select
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="w-full bg-[#333333] border border-[#444444] rounded px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#AE876D]"
                            >
                              <option value="">Select a bank</option>
                              {bankOptions.map((bank) => (
                                <option key={bank} value={bank}>
                                  {bank}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Billing Details */}
          <div className="lg:w-1/3">
            <div className="bg-[#333333] rounded-lg p-4 sm:p-6 sticky top-20 sm:top-24">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 uppercase text-xs sm:text-base">Billing Details</h2>
              
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-white/70 break-words pr-2">Cart Total (Excl. of all taxes)</span>
                  <span className="text-white flex-shrink-0">{formatCurrency(cartTotal)}</span>
                </div>
                {giftWrapAmount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-white/70">Gift Wrap</span>
                    <span className="text-white">{formatCurrency(giftWrapAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-white/70">GST</span>
                  <span className="text-white">{formatCurrency(gst)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-white/70">Shipping Charges</span>
                  <div className="text-right flex-shrink-0">
                    <span className="text-white line-through text-white/50 mr-1 sm:mr-2 text-xs">₹50.00</span>
                    <span className="text-[#22c55e] font-semibold text-xs sm:text-sm">Free</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-[#444444] pt-3 sm:pt-4 mb-4 sm:mb-6">
                <div className="flex justify-between font-semibold text-base sm:text-lg">
                  <span className="text-white">Total Amount</span>
                  <span className="text-white">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <button
                onClick={handleConfirmOrder}
                disabled={!deliveryAddress || !selectedPayment}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#444444] disabled:cursor-not-allowed text-white py-3 sm:py-4 rounded-md font-semibold text-base sm:text-lg mb-3 sm:mb-4 transition-colors"
              >
                CONFIRM ORDER
              </button>
              
              <div className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs text-white/60">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
