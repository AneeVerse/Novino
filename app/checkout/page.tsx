"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { MapPin, ChevronDown, ChevronUp, CreditCard, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PaymentMethod {
  id: string;
  name: string;
  icon?: React.ReactNode;
  balance?: string;
  disabled?: boolean;
  message?: string;
  collapsible?: boolean;
}

const loadExternalScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { cart, isLoggedIn, isAuthReady } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirectingToLogin, setIsRedirectingToLogin] = useState(false);
  const loginPromptShown = useRef(false);
  useEffect(() => {
    if (!isAuthReady) return;
    if (isLoggedIn) {
      setIsRedirectingToLogin(false);
      loginPromptShown.current = false;
      return;
    }
    
    setIsRedirectingToLogin(true);
    if (!loginPromptShown.current) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in before placing an order.",
      });
      loginPromptShown.current = true;
    }
    
    const redirectUrl = `/login?redirect=${encodeURIComponent('/checkout')}`;
    router.replace(redirectUrl);
  }, [isAuthReady, isLoggedIn, router, toast]);
  
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
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    phone?: string;
  } | null>(null);
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // State for payment methods
  const [selectedPayment, setSelectedPayment] = useState<string>("razorpay");
  const [expandedPayments, setExpandedPayments] = useState<{ [key: string]: boolean }>({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
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
    
    // Fetch addresses from API
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/addresses');
        if (response.ok) {
          const data = await response.json();
          if (data.addresses && data.addresses.length > 0) {
            // Find default or first address
            const defaultAddress = data.addresses.find((addr: any) => addr.isDefault || addr.is_default) || data.addresses[0];
            const formattedAddress = {
              id: defaultAddress._id || defaultAddress.id,
              name: defaultAddress.name,
              phone: defaultAddress.phone,
              pincode: defaultAddress.pincode,
              address: `${defaultAddress.line1}${defaultAddress.line2 ? ', ' + defaultAddress.line2 : ''}`,
              line1: defaultAddress.line1,
              line2: defaultAddress.line2 || '',
              city: defaultAddress.city,
              state: defaultAddress.state,
              estimatedDelivery: "3-5 business days"
            };
            setDeliveryAddress(formattedAddress);
            localStorage.setItem('selectedAddress', JSON.stringify(formattedAddress));
          } else {
            // Check localStorage as fallback
            const savedAddress = localStorage.getItem('selectedAddress');
            if (savedAddress) {
              setDeliveryAddress(JSON.parse(savedAddress));
            }
          }
        } else {
          // If API fails, check localStorage as fallback
          const savedAddress = localStorage.getItem('selectedAddress');
          if (savedAddress) {
            setDeliveryAddress(JSON.parse(savedAddress));
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        // Fallback to localStorage
        const savedAddress = localStorage.getItem('selectedAddress');
        if (savedAddress) {
          setDeliveryAddress(JSON.parse(savedAddress));
        }
      }
    };

    if (isLoggedIn) {
      fetchAddresses();
    } else {
      // If not logged in, check localStorage
      const savedAddress = localStorage.getItem('selectedAddress');
      if (savedAddress) {
        setDeliveryAddress(JSON.parse(savedAddress));
      }
    }
  }, [cart, isLoggedIn]);

  if (!isAuthReady || isRedirectingToLogin) {
    return (
      <div className="min-h-screen bg-[#2D2D2D] text-white flex flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-light mb-4">Please log in to continue to checkout.</p>
        <button
          onClick={() => router.replace(`/login?redirect=${encodeURIComponent('/checkout')}`)}
          className="px-6 py-3 bg-white text-black rounded-full uppercase tracking-[0.3em] text-xs hover:bg-white/90 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  
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
      id: "razorpay",
      name: "Pay securely via Razorpay",
      icon: <CreditCard className="w-5 h-5" />,
      message: "Supports UPI, cards, wallets & netbanking",
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      disabled: true,
      message: "Coming soon. Please use Razorpay for prepaid orders.",
    },
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
  const handleConfirmOrder = async () => {
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
    if (selectedPayment !== "razorpay") {
      toast({
        variant: "destructive",
        title: "Only Razorpay available",
        description: "Please choose Razorpay to complete your payment.",
      });
      return;
    }

    // Ensure address is saved to database before placing order
    // If address doesn't have an ID or required fields, save it first
    let finalAddress = deliveryAddress;
    
    // Check if address needs to be saved (no ID or missing required fields)
    if (!deliveryAddress.id || !deliveryAddress.phone || !deliveryAddress.line1 || !deliveryAddress.city || !deliveryAddress.state) {
      try {
        // Build address payload
        const addressPayload = {
          name: deliveryAddress.name,
          phone: deliveryAddress.phone || '',
          line1: deliveryAddress.line1 || deliveryAddress.address?.split(',')[0] || deliveryAddress.address || '',
          line2: deliveryAddress.line2 || '',
          city: deliveryAddress.city || '',
          state: deliveryAddress.state || '',
          pincode: deliveryAddress.pincode,
          isDefault: false
        };

        // Validate required fields
        if (!addressPayload.name || !addressPayload.line1 || !addressPayload.city || 
            !addressPayload.state || !addressPayload.pincode || !addressPayload.phone) {
          toast({
            variant: "destructive",
            title: "Invalid Address",
            description: "Please ensure all address fields are filled correctly. Redirecting to cart.",
          });
          router.push('/cart');
          return;
        }

        // Save address to database
        const addressResponse = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressPayload)
        });
        
        if (addressResponse.ok) {
          const { address } = await addressResponse.json();
          finalAddress = {
            ...deliveryAddress,
            id: address.id || address._id,
            name: address.name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode
          };
          // Update localStorage with saved address
          localStorage.setItem('selectedAddress', JSON.stringify(finalAddress));
        } else {
          const errorData = await addressResponse.json().catch(() => ({ message: 'Failed to save address' }));
          toast({
            variant: "destructive",
            title: "Save Failed",
            description: errorData.message || "Failed to save address. Please try again.",
          });
          return;
        }
      } catch (error) {
        console.error('Error saving address:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while saving the address. Please try again.",
        });
        return;
      }
    }
    
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
      shippingCost: 0,
      total,
      deliveryAddress: {
        name: finalAddress.name,
        line1: finalAddress.line1 || finalAddress.address?.split(',')[0] || finalAddress.address,
        line2: finalAddress.line2 || '',
        city: finalAddress.city || '',
        state: finalAddress.state || '',
        pincode: finalAddress.pincode,
        phone: finalAddress.phone || ''
      },
      paymentMethod: 'razorpay',
      giftWrap: cartExtras.giftWrap
    };

    try {
      setIsPlacingOrder(true);

      const orderResponse = await fetch('/api/payments/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.message || 'Failed to initiate Razorpay order');
      }

      const gateway = await orderResponse.json();

      if (!(window as any).Razorpay) {
        await loadExternalScript('https://checkout.razorpay.com/v1/checkout.js');
      }

      const sanitizedContact = (gateway.customer?.contact || deliveryAddress.phone || "")
        .toString()
        .replace(/[^0-9]/g, "")
        .slice(-10);

      const rzp = new (window as any).Razorpay({
        key: gateway.key,
        amount: gateway.amount,
        currency: gateway.currency,
        order_id: gateway.razorpayOrderId,
        name: 'Novino',
        description: `Order #${gateway.orderId}`,
        prefill: {
          name: gateway.customer?.name,
          email: gateway.customer?.email,
          contact: sanitizedContact,
        },
        remember_user: false,
        theme: { color: '#AE876D' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/razorpay-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: gateway.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod: selectedPayment,
              }),
            });

            if (!verifyRes.ok) {
              const verifyError = await verifyRes.json();
              throw new Error(verifyError.message || 'Payment verification failed');
            }

            toast({
              title: "Payment Successful!",
              description: `Order confirmed. We'll keep you posted on the status.`,
            });

            localStorage.removeItem('selectedCartItems');
            localStorage.removeItem('cartExtras');
            localStorage.removeItem('selectedAddress');

            router.push('/profile?tab=orders');
          } catch (error: any) {
            toast({
              variant: "destructive",
              title: "Verification Failed",
              description: error.message || "We couldn't confirm your payment. Please contact support.",
            });
          } finally {
            setIsPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
            toast({
              variant: "destructive",
              title: "Payment Cancelled",
              description: "You closed the Razorpay checkout before completing payment.",
            });
          },
        },
      });

      rzp.on('payment.failed', (response: any) => {
        setIsPlacingOrder(false);
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: response.error?.description || "Payment could not be completed. Please try again.",
        });
      });

      rzp.open();
    } catch (error: any) {
      console.error('Razorpay order error:', error);
      setIsPlacingOrder(false);
      toast({
        variant: "destructive",
        title: "Unable to start payment",
        description: error.message || "Something went wrong while connecting to Razorpay.",
      });
    }
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
            <button
              onClick={() => router.push('/cart')}
              className="flex items-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-[10px] sm:text-sm font-semibold text-black">
                ✓
              </div>
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-sm font-medium text-white/80">MY BAG</span>
            </button>
            <div className="w-5 sm:w-16 h-0.5 bg-[#444444] flex-shrink-0"></div>
            <button
              onClick={() => router.push('/cart/address')}
              className="flex items-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-[10px] sm:text-sm font-semibold text-black">
                ✓
              </div>
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-sm font-medium text-white/80">ADDRESS</span>
            </button>
            <div className="w-5 sm:w-16 h-0.5 bg-[#444444] flex-shrink-0"></div>
            <div className="flex items-center flex-shrink-0">
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#AE876D] flex items-center justify-center text-[10px] sm:text-sm font-semibold">
                3
              </div>
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-sm font-medium text-[#AE876D]">PAYMENT</span>
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
                    onClick={() => router.push('/cart/address')}
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
                    onClick={() => router.push('/cart/address')}
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
                  <span className="text-white flex-shrink-0">{formatPrice(cartTotal)}</span>
                </div>
                {giftWrapAmount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-white/70">Gift Wrap</span>
                    <span className="text-white">{formatPrice(giftWrapAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-white/70">GST</span>
                  <span className="text-white">{formatPrice(gst)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-white/70">Shipping Charges</span>
                  <div className="text-right flex-shrink-0">
                    <span className="text-white line-through text-white/50 mr-1 sm:mr-2 text-xs">{formatPrice(50)}</span>
                    <span className="text-[#22c55e] font-semibold text-xs sm:text-sm">Free</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-[#444444] pt-3 sm:pt-4 mb-4 sm:mb-6">
                <div className="flex justify-between font-semibold text-base sm:text-lg">
                  <span className="text-white">Total Amount</span>
                  <span className="text-white">{formatPrice(total)}</span>
                </div>
              </div>
              
              <button
                onClick={handleConfirmOrder}
                disabled={!deliveryAddress || !selectedPayment || isPlacingOrder}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#444444] disabled:cursor-not-allowed text-white py-3 sm:py-4 rounded-md font-semibold text-base sm:text-lg mb-3 sm:mb-4 transition-colors"
              >
                {isPlacingOrder ? "Processing..." : "CONFIRM ORDER"}
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
