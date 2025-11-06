"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronDown, ChevronUp, Check, X, Heart, MapPin, Calendar, AlertCircle } from "lucide-react";

interface SelectedItems {
  [key: string]: boolean;
}

interface PromoState {
  coupon: boolean;
  giftVoucher: boolean;
  giftWrap: boolean;
  membership: boolean;
  points: boolean;
}

interface SavedAddress {
  id: string;
  name: string;
  pincode: string;
  address: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  estimatedDelivery: string;
  isDefault?: boolean;
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, isLoading } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  
  // State for selected items
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({});
  const [selectAll, setSelectAll] = useState(true);
  
  // State for promotional sections
  const [promoState, setPromoState] = useState<PromoState>({
    coupon: false,
    giftVoucher: false,
    giftWrap: false,
    membership: false,
    points: false,
  });
  
  // State for delivery address
  const [deliveryAddress, setDeliveryAddress] = useState<SavedAddress | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    pincode: "",
    state: ""
  });
  
  // Load saved addresses and selected address on mount
  useEffect(() => {
    // Load all saved addresses
    const savedAddressesData = localStorage.getItem('savedAddresses');
    if (savedAddressesData) {
      try {
        const addresses = JSON.parse(savedAddressesData) as SavedAddress[];
        setSavedAddresses(addresses);
        
        // Find default address or first address
        const defaultAddress = addresses.find((addr: SavedAddress) => addr.isDefault) || addresses[0];
        if (defaultAddress) {
          setDeliveryAddress(defaultAddress);
        }
      } catch (error) {
        console.error('Error parsing saved addresses:', error);
      }
    }
    
    // Load selected address (for backward compatibility)
    const selectedAddress = localStorage.getItem('selectedAddress');
    if (selectedAddress) {
      try {
        const address = JSON.parse(selectedAddress) as SavedAddress;
        // Check if we already have addresses loaded
        const savedAddressesData = localStorage.getItem('savedAddresses');
        if (!savedAddressesData) {
          // If no saved addresses, use the selected address
          setDeliveryAddress(address);
        }
      } catch (error) {
        console.error('Error parsing selected address:', error);
      }
    }
  }, []);
  
  // Save addresses to localStorage whenever they change
  useEffect(() => {
    if (savedAddresses.length > 0) {
      localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
    }
  }, [savedAddresses]);
  
  // State for payment method
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  
  // Initialize all items as selected only when cart changes (new items added)
  useEffect(() => {
    if (cart.length > 0) {
      setSelectedItems((prev) => {
        const updated: SelectedItems = { ...prev };
        let hasChanges = false;
        // Only initialize new items, preserve existing selections
        cart.forEach((item) => {
          const key = `${String(item.id)}-${item.variant || 'basic'}`;
          // Only set to true if key doesn't exist (new item)
          if (!(key in updated)) {
            updated[key] = true;
            hasChanges = true;
          }
        });
        // Remove keys for items no longer in cart
        Object.keys(updated).forEach((key) => {
          const exists = cart.some((item) => {
            const itemKey = `${String(item.id)}-${item.variant || 'basic'}`;
            return itemKey === key;
          });
          if (!exists) {
            delete updated[key];
            hasChanges = true;
          }
        });
        // Only return updated object if there were actual changes
        return hasChanges ? updated : prev;
      });
    } else {
      setSelectedItems({});
    }
  }, [cart.length]); // Only depend on cart length, not full cart array
  
  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Parse price from string or number
  const parsePrice = (price: string | number): number => {
    if (typeof price === 'number') return price;
    const cleaned = price.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };
  
  // Get selected cart items
  const getSelectedItems = () => {
    return cart.filter((item) => {
      const key = `${String(item.id)}-${item.variant || 'basic'}`;
      return selectedItems[key] ?? true; // Default to true if not set
    });
  };
  
  // Calculate totals for selected items
  // Prices are already GST inclusive (as shown by "MRP incl. of all taxes")
  const calculateTotals = () => {
    const selected = getSelectedItems();
    
    // Calculate subtotal (GST inclusive prices)
    const subtotalInclusive = selected.reduce((total, item) => {
      const itemPrice = parsePrice(item.price);
      return total + (itemPrice * item.quantity);
    }, 0);
    
    // Add gift wrap if selected (₹25)
    const giftWrapAmount = promoState.giftWrap ? 25 : 0;
    const totalInclusive = subtotalInclusive + giftWrapAmount;
    
    // Extract base price (excluding GST) - GST is 18% in India
    // If price is GST inclusive: basePrice = totalInclusive / 1.18
    const cartTotal = totalInclusive / 1.18;
    
    // Calculate GST amount
    const gst = totalInclusive - cartTotal;
    
    // Total is the inclusive amount (since prices already include GST)
    const total = totalInclusive;
    
    return { 
      subtotal: subtotalInclusive, 
      gst, 
      cartTotal, 
      total,
      giftWrapAmount 
    };
  };
  
  const { subtotal, gst, cartTotal, total, giftWrapAmount } = calculateTotals();
  const selectedCount = getSelectedItems().length;
  const totalItems = cart.length;
  
  // Helper function to check if address is selected
  const isAddressSelected = (addressId: string): boolean => {
    return deliveryAddress !== null && deliveryAddress.id === addressId;
  };
  
  // Handle item selection - fixed to prevent simultaneous selection bug
  const handleItemSelect = (itemId: string | number, variant?: string) => {
    const key = `${String(itemId)}-${variant || 'basic'}`;
    
    setSelectedItems((prev) => {
      // Create a completely new object with all current values
      const updated: SelectedItems = { ...prev };
      
      // Get current state for this specific item - if undefined, default to true (items start selected)
      const currentState = updated[key] ?? true;
      
      // Toggle ONLY this specific item - this is the critical fix
      updated[key] = !currentState;
      
      // The useEffect will handle syncing selectAll state
      return updated;
    });
  };
  
  // Handle select all - fixed to properly sync
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedItems((prev) => {
      const updated: SelectedItems = { ...prev };
      cart.forEach((item) => {
        const key = `${String(item.id)}-${item.variant || 'basic'}`;
        updated[key] = newSelectAll;
      });
      return updated;
    });
  };
  
  // Sync selectAll state when selectedItems changes
  useEffect(() => {
    if (cart.length > 0) {
      const allSelected = cart.every((item) => {
        const key = `${String(item.id)}-${item.variant || 'basic'}`;
        return selectedItems[key] ?? true;
      });
      setSelectAll(allSelected);
    }
  }, [selectedItems, cart.length]);
  
  // Handle quantity change
  const handleIncreaseQuantity = (id: string | number, currentQuantity: number, variant?: string) => {
    updateQuantity(id, currentQuantity + 1, variant);
  };
  
  const handleDecreaseQuantity = (id: string | number, currentQuantity: number, variant?: string) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1, variant);
    }
  };
  
  // Handle move to wishlist
  const handleMoveToWishlist = (itemId: string | number, variant?: string) => {
    // TODO: Implement wishlist functionality
    console.log('Move to wishlist:', itemId, variant);
    // For now, just remove from cart
    removeFromCart(itemId, variant);
  };
  
  // Handle place order with address validation
  const handlePlaceOrder = () => {
    // Check if address is added
    if (!deliveryAddress) {
      toast({
        variant: "destructive",
        title: "Address Required",
        description: "Please add a delivery address first before placing order",
      });
      setShowAddressForm(true);
      // Scroll to address form
      setTimeout(() => {
        const addressSection = document.querySelector('[data-address-section]');
        if (addressSection) {
          addressSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }
    
    // Check if at least one item is selected
    if (selectedCount === 0) {
      toast({
        variant: "destructive",
        title: "No Items Selected",
        description: "Please select at least one item to place order",
      });
      return;
    }
    
    // Store selected items and extras in localStorage for checkout page
    const selectedItemsList = getSelectedItems();
    localStorage.setItem('selectedCartItems', JSON.stringify(selectedItemsList));
    localStorage.setItem('cartExtras', JSON.stringify({
      giftWrap: promoState.giftWrap,
      coupon: promoState.coupon,
      giftVoucher: promoState.giftVoucher
    }));
    
    // Navigate to checkout
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2D2D2D] flex flex-col items-center justify-center pt-24">
        <Loader2 className="h-12 w-12 text-[#AE876D] animate-spin mb-4" />
        <p className="text-white text-xl">Loading your cart...</p>
      </div>
    );
  }

  if (cart.length === 0) {
  return (
      <div className="min-h-screen bg-[#2D2D2D] pt-24 pb-12">
        <div className="container mx-auto px-4">
        <div className="text-center py-12">
            <p className="text-xl text-white mb-6">Your cart is empty</p>
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
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#AE876D] flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-[#AE876D]">MY BAG</span>
            </div>
            <div className="w-16 h-0.5 bg-[#444444]"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#444444] flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-white/60">ADDRESS</span>
            </div>
            <div className="w-16 h-0.5 bg-[#444444]"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#444444] flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-white/60">PAYMENT</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:w-2/3">
            {/* Delivery Information */}
            <div className="bg-[#333333] rounded-lg p-6 mb-6 relative" data-address-section style={{ zIndex: 1 }}>
              <div className="flex items-center mb-4">
                <MapPin className="w-4 h-4 mr-2 text-[#AE876D]" />
                <span className="text-sm font-medium">Deliver To:</span>
              </div>
              
              {showAddressList ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Select Address</h3>
                    <button
                      onClick={() => {
                        setShowAddressList(false);
                        setShowAddressForm(false);
                      }}
                      className="text-white/60 hover:text-white text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {savedAddresses.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {savedAddresses.map((address: SavedAddress) => {
                        const isSelected = isAddressSelected(address.id);
                        return (
                        <div
                          key={address.id}
                          className={`p-4 border rounded-md cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-[#AE876D] bg-[#AE876D]/10'
                              : 'border-[#444444] hover:border-[#555555]'
                          }`}
                          onClick={() => {
                            setDeliveryAddress(address);
                            localStorage.setItem('selectedAddress', JSON.stringify(address));
                            setShowAddressList(false);
                            toast({
                              title: "Address Selected",
                              description: "Delivery address has been updated",
                            });
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {address.isDefault && (
                                <span className="text-xs bg-[#AE876D] text-white px-2 py-0.5 rounded mb-2 inline-block">
                                  Default
                                </span>
                              )}
                              <p className="text-white font-semibold mb-1">
                                {address.name}, {address.pincode}
                              </p>
                              <p className="text-white/70 text-sm">{address.address}</p>
                            </div>
                            {isSelected && (
                              <div className="ml-2 text-[#AE876D]">
                                <Check className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAddressId(address.id);
                                setAddressForm({
                                  name: address.name,
                                  line1: address.line1,
                                  line2: address.line2,
                                  city: address.city,
                                  pincode: address.pincode,
                                  state: address.state
                                });
                                setShowAddressForm(true);
                                setShowAddressList(false);
                              }}
                              className="text-xs text-[#AE876D] hover:text-[#8d6c58] uppercase"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = savedAddresses.filter((addr: SavedAddress) => addr.id !== address.id);
                                setSavedAddresses(updated);
                                if (isAddressSelected(address.id)) {
                                  setDeliveryAddress(updated[0] || null);
                                }
                                toast({
                                  title: "Address Deleted",
                                  description: "Address has been removed",
                                });
                              }}
                              className="text-xs text-red-400 hover:text-red-300 uppercase"
                            >
                              Delete
                            </button>
                            {!address.isDefault && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = savedAddresses.map((addr: SavedAddress) => ({
                                    ...addr,
                                    isDefault: addr.id === address.id
                                  }));
                                  setSavedAddresses(updated);
                                  toast({
                                    title: "Default Address Set",
                                    description: "This address is now your default",
                                  });
                                }}
                                className="text-xs text-white/60 hover:text-white uppercase"
                              >
                                Set Default
                              </button>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm text-center py-4">No saved addresses</p>
                  )}
                  
                  <button
                    onClick={() => {
                      setShowAddressForm(true);
                      setShowAddressList(false);
                      setEditingAddressId(null);
                      setAddressForm({ name: "", line1: "", line2: "", city: "", pincode: "", state: "" });
                    }}
                    className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white py-2 rounded-md font-medium transition-colors mt-4"
                  >
                    + Add New Address
                  </button>
                </div>
              ) : showAddressForm ? (
                    <div className="space-y-4 relative z-10">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                          placeholder="Enter full name"
                          autoFocus
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          value={addressForm.line1}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, line1: e.target.value }))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                          placeholder="Street address"
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          value={addressForm.line2}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, line2: e.target.value }))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                          placeholder="Apartment, suite, etc."
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                            placeholder="City"
                            style={{ pointerEvents: 'auto', zIndex: 10 }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                            placeholder="Pincode"
                            style={{ pointerEvents: 'auto', zIndex: 10 }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                          placeholder="State"
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (addressForm.name && addressForm.line1 && addressForm.city && addressForm.pincode && addressForm.state) {
                              const addressData = {
                                name: addressForm.name,
                                pincode: addressForm.pincode,
                                address: `${addressForm.line1}${addressForm.line2 ? ', ' + addressForm.line2 : ''}, ${addressForm.city}, ${addressForm.state}`,
                                line1: addressForm.line1,
                                line2: addressForm.line2,
                                city: addressForm.city,
                                state: addressForm.state,
                                estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                              };
                              
                              if (editingAddressId) {
                                // Update existing address
                                const updated = savedAddresses.map(addr => 
                                  addr.id === editingAddressId 
                                    ? { ...addr, ...addressData }
                                    : addr
                                );
                                setSavedAddresses(updated);
                                const updatedAddress = updated.find(addr => addr.id === editingAddressId);
                                if (updatedAddress) {
                                  setDeliveryAddress(updatedAddress);
                                  localStorage.setItem('selectedAddress', JSON.stringify(updatedAddress));
                                }
                                toast({
                                  title: "Address Updated",
                                  description: "Address has been updated successfully",
                                });
                              } else {
                                // Add new address
                                const newAddress: SavedAddress = {
                                  ...addressData,
                                  id: Date.now().toString(),
                                  isDefault: savedAddresses.length === 0 // First address is default
                                };
                                
                                const updated = [...savedAddresses, newAddress];
                                setSavedAddresses(updated);
                                setDeliveryAddress(newAddress);
                                localStorage.setItem('selectedAddress', JSON.stringify(newAddress));
                                toast({
                                  title: "Address Added",
                                  description: "Delivery address has been saved successfully",
                                });
                              }
                              
                              setShowAddressForm(false);
                              setEditingAddressId(null);
                              setAddressForm({ name: "", line1: "", line2: "", city: "", pincode: "", state: "" });
                            } else {
                              toast({
                                variant: "destructive",
                                title: "Missing Information",
                                description: "Please fill all required fields",
                              });
                            }
                          }}
                          className="flex-1 bg-[#AE876D] hover:bg-[#8d6c58] text-white py-2 rounded-md font-medium transition-colors"
                        >
                          {editingAddressId ? 'Update Address' : 'Save Address'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddressId(null);
                            setAddressForm({ name: "", line1: "", line2: "", city: "", pincode: "", state: "" });
                            if (savedAddresses.length > 0) {
                              setShowAddressList(true);
                            }
                          }}
                          className="flex-1 bg-[#444444] hover:bg-[#555555] text-white py-2 rounded-md font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : deliveryAddress ? (
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold mb-1">
                          {deliveryAddress.name}, {deliveryAddress.pincode}
                        </p>
                        <p className="text-white/70 text-sm mb-2">{deliveryAddress.address}</p>
                        <div className="flex items-center text-sm text-white/60">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Estimated delivery by {deliveryAddress.estimatedDelivery}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setShowAddressList(true);
                          setShowAddressForm(false);
                        }}
                        className="text-[#AE876D] hover:text-[#8d6c58] text-sm font-medium uppercase"
                      >
                        CHANGE
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAddressForm(true);
                        setShowAddressList(false);
                        setEditingAddressId(null);
                        setAddressForm({ name: "", line1: "", line2: "", city: "", pincode: "", state: "" });
                      }}
                      className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white py-3 rounded-md font-medium transition-colors"
                    >
                      + Add Address
                    </button>
                  )}
            </div>
            
            {/* Select All Checkbox */}
            <div className="bg-[#333333] rounded-lg p-4 mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-[#444444] bg-[#222222] text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                />
                <span className="ml-3 text-sm font-medium">
                  {selectedCount}/{totalItems} ITEMS SELECTED ({formatCurrency(total)})
                </span>
              </label>
              </div>
              
              {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item, index) => {
                // Ensure consistent key generation - convert id to string
                const key = `${String(item.id)}-${item.variant || 'basic'}`;
                // Default to true if undefined (items start selected by default)
                // Use explicit check to ensure we're reading the correct state
                const isSelected = key in selectedItems ? selectedItems[key] : true;
                const itemPrice = parsePrice(item.price);
                const itemTotal = itemPrice * item.quantity;
                
                return (
                  <div key={`cart-item-${item.id}-${item.variant || 'basic'}-${index}`} className="bg-[#333333] rounded-lg p-6">
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="flex items-start pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Ensure we're passing the correct item ID and variant
                            const itemId = String(item.id);
                            const itemVariant = item.variant || undefined;
                            handleItemSelect(itemId, itemVariant);
                          }}
                          className="w-5 h-5 rounded border-[#444444] bg-[#222222] text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                          aria-label={`Select ${item.name}`}
                          data-item-id={String(item.id)}
                          data-item-variant={item.variant || 'basic'}
                        />
                      </div>
                      
                      {/* Product Image */}
                      <div className="w-32 h-32 md:w-40 md:h-40 relative bg-[#222222] rounded-md overflow-hidden flex-shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill
                        className="object-cover"
                      />
                    </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-1">{item.name}</h3>
                            {item.variant && (
                              <p className="text-white/60 text-sm mb-2">Variant: {item.variant}</p>
                            )}
                            <p className="text-white/50 text-xs mb-3">Category: {item.variant || 'General'}</p>
                  </div>
                    </div>
                        
                        {/* Quantity and Size Selectors */}
                        <div className="flex flex-wrap gap-4 mb-3">
                    {item.variant && (
                            <div className="flex items-center">
                              <span className="text-sm text-white/70 mr-2">Size:</span>
                              <select className="bg-[#222222] border border-[#444444] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#AE876D]">
                                <option>{item.variant}</option>
                              </select>
                            </div>
                          )}
                      <div className="flex items-center">
                            <span className="text-sm text-white/70 mr-2">Qty:</span>
                            <div className="flex items-center border border-[#444444] rounded">
                        <button 
                          onClick={() => handleDecreaseQuantity(item.id, item.quantity, item.variant)}
                          disabled={item.quantity <= 1}
                                className="px-3 py-1.5 text-white hover:bg-[#444444] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                                −
                        </button>
                              <span className="px-4 py-1.5 text-white border-x border-[#444444]">
                                {item.quantity}
                              </span>
                        <button 
                          onClick={() => handleIncreaseQuantity(item.id, item.quantity, item.variant)}
                                className="px-3 py-1.5 text-white hover:bg-[#444444]"
                        >
                          +
                        </button>
                      </div>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="mb-3">
                          <p className="text-white font-semibold text-lg">
                            {formatCurrency(itemTotal)}
                          </p>
                          <p className="text-white/50 text-xs">MRP incl. of all taxes</p>
                        </div>
                        
                        {/* Delivery Info */}
                        {deliveryAddress && (
                          <div className="flex items-center text-sm text-white/60 mb-3">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Estimated Delivery by {deliveryAddress.estimatedDelivery}</span>
                          </div>
                        )}
                        
                        {/* Special Notes */}
                        {item.variant && item.variant.includes('Collectible') && (
                          <p className="text-xs text-yellow-400 mb-3">
                            Cash on delivery not available on this product.
                          </p>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-4">
                          <button
                            onClick={() => removeFromCart(item.id, item.variant)}
                            className="text-sm text-white/70 hover:text-[#AE876D] uppercase font-medium"
                          >
                            REMOVE
                          </button>
                          <button
                            onClick={() => handleMoveToWishlist(item.id, item.variant)}
                            className="text-sm text-white/70 hover:text-[#AE876D] uppercase font-medium flex items-center"
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            MOVE TO WISHLIST
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-[#333333] rounded-lg p-6 sticky top-24">
              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={selectedCount === 0}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#444444] disabled:cursor-not-allowed text-white py-4 rounded-md font-semibold text-lg mb-6 transition-colors"
              >
                PLACE ORDER
              </button>
              
              {/* Free Shipping */}
              <div className="mb-6">
                <p className="text-white/90 text-sm mb-2">Free shipping on all orders</p>
                <button className="text-[#AE876D] hover:text-[#8d6c58] text-sm font-medium">
                  View all benefits
                  <ChevronDown className="w-4 h-4 inline ml-1" />
                </button>
              </div>
              
              {/* Collapsible Sections */}
              <div className="space-y-3 mb-6">
                {/* Apply Coupon */}
                <div className="border border-[#444444] rounded-md">
                  <button
                    onClick={() => setPromoState(prev => ({ ...prev, coupon: !prev.coupon }))}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-[#444444] transition-colors"
                  >
                    <span className="text-white text-sm font-medium">Apply Coupon</span>
                    {promoState.coupon ? (
                      <ChevronUp className="w-4 h-4 text-white/60" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                  {promoState.coupon && (
                    <div className="p-3 border-t border-[#444444]">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#AE876D]"
                      />
                      <button className="mt-2 w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white py-2 rounded text-sm font-medium">
                        Apply
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Gift Voucher */}
                <div className="border border-[#444444] rounded-md">
                  <button
                    onClick={() => setPromoState(prev => ({ ...prev, giftVoucher: !prev.giftVoucher }))}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-[#444444] transition-colors"
                  >
                    <span className="text-white text-sm font-medium">Gift Voucher</span>
                    {promoState.giftVoucher ? (
                      <ChevronUp className="w-4 h-4 text-white/60" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                  {promoState.giftVoucher && (
                    <div className="p-3 border-t border-[#444444]">
                      <input
                        type="text"
                        placeholder="Enter voucher code"
                        className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#AE876D]"
                      />
                      <button className="mt-2 w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white py-2 rounded text-sm font-medium">
                        Apply
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Gift Wrap */}
                <div className="border border-[#444444] rounded-md p-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promoState.giftWrap}
                      onChange={(e) => setPromoState(prev => ({ ...prev, giftWrap: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#444444] bg-[#222222] text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                    />
                    <span className="ml-3 text-white text-sm font-medium">Gift Wrap (₹ 25)</span>
                  </label>
                </div>
                
                {/* TSS Money / Points */}
                <div className="border border-[#444444] rounded-md">
                  <button
                    onClick={() => setPromoState(prev => ({ ...prev, points: !prev.points }))}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-[#444444] transition-colors"
                  >
                    <span className="text-white text-sm font-medium">TSS Money / TSS Points</span>
                    {promoState.points ? (
                      <ChevronUp className="w-4 h-4 text-white/60" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                  {promoState.points && (
                    <div className="p-3 border-t border-[#444444]">
                      <p className="text-white/70 text-sm mb-2">Available Points: 0</p>
                      <input
                        type="number"
                        placeholder="Enter points to redeem"
                        className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#AE876D]"
                      />
                      <button className="mt-2 w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white py-2 rounded text-sm font-medium">
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Billing Details */}
              <div className="border-t border-[#444444] pt-6">
                <h3 className="text-white font-semibold mb-4 uppercase text-sm">Billing Details</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Cart Total (Excl. of all taxes)</span>
                    <span className="text-white">{formatCurrency(cartTotal)}</span>
                  </div>
                  {giftWrapAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Gift Wrap</span>
                      <span className="text-white">{formatCurrency(giftWrapAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">GST</span>
                    <span className="text-white">{formatCurrency(gst)}</span>
                  </div>
                </div>
                
                <div className="border-t border-[#444444] pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-white">Total</span>
                    <span className="text-white">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment Methods */}
              <div className="mt-6 border-t border-[#444444] pt-6">
                <h3 className="text-white font-semibold mb-4 uppercase text-sm">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-[#444444] rounded-md cursor-pointer hover:bg-[#444444] transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                    />
                    <span className="ml-3 text-white text-sm">Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center p-3 border border-[#444444] rounded-md cursor-pointer hover:bg-[#444444] transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                    />
                    <span className="ml-3 text-white text-sm">UPI</span>
                  </label>
                  <label className="flex items-center p-3 border border-[#444444] rounded-md cursor-pointer hover:bg-[#444444] transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                    />
                    <span className="ml-3 text-white text-sm">Cash on Delivery</span>
                  </label>
                  <label className="flex items-center p-3 border border-[#444444] rounded-md cursor-pointer hover:bg-[#444444] transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="wallet"
                      checked={paymentMethod === "wallet"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                    />
                    <span className="ml-3 text-white text-sm">Wallet</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
