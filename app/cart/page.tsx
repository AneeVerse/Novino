"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, MapPin, Calendar, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface SelectedItems {
  [key: string]: boolean;
}

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
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
  
  // State for delivery address
  const [deliveryAddress, setDeliveryAddress] = useState<SavedAddress | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    pincode: "",
    state: ""
  });
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pincodeMessage, setPincodeMessage] = useState("");
  
  const resetAddressForm = () => {
    setAddressForm({ name: "", phone: "", line1: "", line2: "", city: "", pincode: "", state: "" });
    setPincodeStatus('idle');
    setPincodeMessage('');
  };

  // Load saved addresses from API for authenticated user
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/addresses');
        if (response.ok) {
          const data = await response.json();
          const formattedAddresses = data.addresses.map((addr: any) => ({
            id: addr.id || addr._id, // Supabase uses 'id', MongoDB uses '_id'
            name: addr.name,
            phone: addr.phone,
            pincode: addr.pincode,
            address: `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}`,
            line1: addr.line1,
            line2: addr.line2,
            city: addr.city,
            state: addr.state,
            estimatedDelivery: "3-5 business days",
            isDefault: addr.is_default || addr.isDefault
          }));
          
          setSavedAddresses(formattedAddresses);
          
          // Set default or first address as delivery address
          const defaultAddress = formattedAddresses.find((addr: SavedAddress) => addr.isDefault) || formattedAddresses[0];
          if (defaultAddress) {
            setDeliveryAddress(defaultAddress);
            localStorage.setItem('selectedAddress', JSON.stringify(defaultAddress));
          }
        } else if (response.status === 401) {
          // Not authenticated - clear any local addresses
          setSavedAddresses([]);
          setDeliveryAddress(null);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    const pin = addressForm.pincode.trim();
    if (!pin) {
      setPincodeStatus('idle');
      setPincodeMessage('');
      return;
    }

    if (pin.length < 6) {
      setPincodeStatus('idle');
      setPincodeMessage('Enter 6-digit pincode to auto-fill city & state');
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setPincodeStatus('error');
      setPincodeMessage('Pincode must be 6 digits');
      return;
    }

    let cancelled = false;
    const fetchPincodeDetails = async () => {
      try {
        setPincodeStatus('loading');
        setPincodeMessage('Fetching city & state...');
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const result = await response.json();
        if (cancelled) return;

        if (Array.isArray(result) && result[0]?.Status === 'Success') {
          const office = result[0]?.PostOffice?.[0];
          setAddressForm(prev => ({
            ...prev,
            city: office?.District || prev.city,
            state: office?.State || prev.state,
          }));
          setPincodeStatus('success');
          setPincodeMessage(`${office?.District || ''}, ${office?.State || ''}`.trim());
        } else {
          setPincodeStatus('error');
          setPincodeMessage('Service unavailable for this pincode. Please verify.');
        }
      } catch (error) {
        if (cancelled) return;
        setPincodeStatus('error');
        setPincodeMessage('Could not fetch details. Please try again.');
      }
    };

    fetchPincodeDetails();

    return () => {
      cancelled = true;
    };
  }, [addressForm.pincode]);
  
  
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
    
    // Total is the subtotal (no gift wrap)
    const totalInclusive = subtotalInclusive;
    
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
      total
    };
  };
  
  const { subtotal, gst, cartTotal, total } = calculateTotals();
  // Count total quantity of selected items, not number of unique items
  const selectedCount = getSelectedItems().reduce((sum, item) => sum + item.quantity, 0);
  // Count total quantity of all items, not number of unique items
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
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
  
  
  // Handle place order with address validation
  const handlePlaceOrder = async () => {
    // Check if at least one item is selected first
    if (selectedCount === 0) {
      toast({
        variant: "destructive",
        title: "No Items Selected",
        description: "Please select at least one item to place order",
      });
      return;
    }
    
    // Store selected items in localStorage
    const selectedItemsList = getSelectedItems();
    localStorage.setItem('selectedCartItems', JSON.stringify(selectedItemsList));
    
    // Check if address is added
    if (!deliveryAddress) {
      toast({
        variant: "destructive",
        title: "Address Required",
        description: "Please add a delivery address first",
      });
      return;
    }
    
    // Ensure address is saved to database before proceeding
    // Check if address has an ID (already saved) or needs to be saved
    if (!deliveryAddress.id || !savedAddresses.find(addr => addr.id === deliveryAddress.id)) {
      // Address needs to be saved to database
      try {
        const addressPayload = {
          name: deliveryAddress.name,
          phone: deliveryAddress.phone || '',
          line1: deliveryAddress.line1 || deliveryAddress.address?.split(',')[0] || deliveryAddress.address || '',
          line2: deliveryAddress.line2 || '',
          city: deliveryAddress.city || '',
          state: deliveryAddress.state || '',
          pincode: deliveryAddress.pincode,
          isDefault: savedAddresses.length === 0 // First address is default
        };

        // Validate required fields
        if (!addressPayload.name || !addressPayload.line1 || !addressPayload.city || 
            !addressPayload.state || !addressPayload.pincode || !addressPayload.phone) {
          toast({
            variant: "destructive",
            title: "Invalid Address",
            description: "Please ensure all address fields are filled correctly",
          });
          return;
        }

        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressPayload)
        });
        
        if (response.ok) {
          const { address } = await response.json();
          const formattedAddress = {
            id: address.id || address._id,
            name: address.name,
            phone: address.phone,
            pincode: address.pincode,
            address: `${address.line1}${address.line2 ? ', ' + address.line2 : ''}`,
            line1: address.line1,
            line2: address.line2 || '',
            city: address.city,
            state: address.state,
            estimatedDelivery: "3-5 business days",
            isDefault: address.is_default || address.isDefault
          };
          
          // Update state and localStorage
          setDeliveryAddress(formattedAddress);
          localStorage.setItem('selectedAddress', JSON.stringify(formattedAddress));
          
          // Add to saved addresses if not already there
          if (!savedAddresses.find(addr => addr.id === formattedAddress.id)) {
            setSavedAddresses([...savedAddresses, formattedAddress]);
          }
          
          // Proceed to checkout
          router.push('/checkout');
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Failed to save address' }));
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
    } else {
      // Address already saved - proceed to checkout
    localStorage.setItem('selectedAddress', JSON.stringify(deliveryAddress));
    router.push('/checkout');
    }
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
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-1 sm:space-x-4 overflow-x-auto pb-2 px-2">
            <div className="flex items-center flex-shrink-0">
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#AE876D] flex items-center justify-center text-[10px] sm:text-sm font-semibold">
                1
              </div>
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-sm font-medium text-[#AE876D]">MY BAG</span>
            </div>
            <div className="w-5 sm:w-16 h-0.5 bg-[#444444] flex-shrink-0"></div>
            <button 
              onClick={() => {
                if (deliveryAddress) {
                  router.push('/cart/address');
                } else {
                  router.push('/cart/address');
                }
              }}
              className="flex items-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#444444] flex items-center justify-center text-[10px] sm:text-sm font-semibold">
                2
              </div>
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-sm font-medium text-white/60">ADDRESS</span>
            </button>
            <div className="w-5 sm:w-16 h-0.5 bg-[#444444] flex-shrink-0"></div>
            <button 
              onClick={() => {
                if (deliveryAddress && selectedCount > 0) {
                  router.push('/checkout');
                } else if (!deliveryAddress) {
                  toast({
                    variant: "destructive",
                    title: "Address Required",
                    description: "Please add a delivery address first",
                  });
                } else if (selectedCount === 0) {
                  toast({
                    variant: "destructive",
                    title: "No Items Selected",
                    description: "Please select at least one item",
                  });
                }
              }}
              className="flex items-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#444444] flex items-center justify-center text-[10px] sm:text-sm font-semibold">
                3
              </div>
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-sm font-medium text-white/60">PAYMENT</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:w-2/3">
            {/* Delivery Information */}
            <div className="bg-[#333333] rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 relative" data-address-section style={{ zIndex: 1 }}>
              <div className="flex items-center mb-3 sm:mb-4">
                <MapPin className="w-4 h-4 mr-2 text-[#AE876D] flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Deliver To:</span>
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
                                  phone: address.phone || '',
                                  line1: address.line1,
                                  line2: address.line2 || '',
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
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await fetch(`/api/addresses/${address.id}`, {
                                    method: 'DELETE'
                                  });
                                  
                                  if (response.ok) {
                                    const updated = savedAddresses.filter((addr: SavedAddress) => addr.id !== address.id);
                                    setSavedAddresses(updated);
                                    if (isAddressSelected(address.id)) {
                                      setDeliveryAddress(updated[0] || null);
                                    }
                                    toast({
                                      title: "Address Deleted",
                                      description: "Address has been removed",
                                    });
                                  } else {
                                    toast({
                                      variant: "destructive",
                                      title: "Delete Failed",
                                      description: "Failed to delete address. Please try again.",
                                    });
                                  }
                                } catch (error) {
                                  console.error('Error deleting address:', error);
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: "An error occurred while deleting the address",
                                  });
                                }
                              }}
                              className="text-xs text-red-400 hover:text-red-300 uppercase"
                            >
                              Delete
                            </button>
                            {!address.isDefault && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const response = await fetch(`/api/addresses/${address.id}`, {
                                      method: 'PATCH'
                                    });
                                    
                                    if (response.ok) {
                                      const updated = savedAddresses.map((addr: SavedAddress) => ({
                                        ...addr,
                                        isDefault: addr.id === address.id
                                      }));
                                      setSavedAddresses(updated);
                                      toast({
                                        title: "Default Address Set",
                                        description: "This address is now your default",
                                      });
                                    } else {
                                      toast({
                                        variant: "destructive",
                                        title: "Update Failed",
                                        description: "Failed to set default address. Please try again.",
                                      });
                                    }
                                  } catch (error) {
                                    console.error('Error setting default address:', error);
                                    toast({
                                      variant: "destructive",
                                      title: "Error",
                                      description: "An error occurred while setting default address",
                                    });
                                  }
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
                      setAddressForm({ name: "", phone: "", line1: "", line2: "", city: "", pincode: "", state: "" });
                    }}
                    className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white py-2 rounded-md font-medium transition-colors mt-4"
                  >
                    + Add New Address
                  </button>
                </div>
              ) : showAddressForm ? (
                    <div className="space-y-4 relative z-10">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                          placeholder="Enter full name"
                          autoFocus
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                            setAddressForm(prev => ({ ...prev, phone: value }));
                          }}
                          className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D]"
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          inputMode="numeric"
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          value={addressForm.line1}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, line1: e.target.value }))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                          placeholder="Street address"
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          value={addressForm.line2}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, line2: e.target.value }))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                          placeholder="Apartment, suite, etc."
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                            placeholder="City"
                            style={{ pointerEvents: 'auto', zIndex: 10 }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            value={addressForm.pincode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                              setAddressForm(prev => ({ ...prev, pincode: value }));
                            }}
                            onFocus={(e) => e.target.select()}
                            className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                            placeholder="Pincode"
                            style={{ pointerEvents: 'auto', zIndex: 10 }}
                          />
                          {pincodeMessage && (
                            <p
                              className={`text-xs mt-1 ${
                                pincodeStatus === 'success'
                                  ? 'text-[#22c55e]'
                                  : pincodeStatus === 'error'
                                  ? 'text-red-400'
                                  : 'text-white/60'
                              }`}
                            >
                              {pincodeStatus === 'loading' ? 'Checking...' : pincodeMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] cursor-text"
                          placeholder="State"
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            const trimmedName = addressForm.name.trim();
                            const trimmedLine1 = addressForm.line1.trim();
                            const isValidPhone = /^\d{10}$/.test(addressForm.phone);
                            const isValidPincode = /^\d{6}$/.test(addressForm.pincode);

                            if (trimmedName.length < 3) {
                              toast({
                                variant: "destructive",
                                title: "Name Required",
                                description: "Please enter the full name for this address.",
                              });
                              return;
                            }

                            if (!isValidPhone) {
                              toast({
                                variant: "destructive",
                                title: "Invalid Phone Number",
                                description: "Please enter a 10 digit mobile number.",
                              });
                              return;
                            }

                            if (!isValidPincode) {
                              toast({
                                variant: "destructive",
                                title: "Invalid Pincode",
                                description: "Please enter a valid 6 digit pincode.",
                              });
                              return;
                            }

                            if (trimmedLine1.length < 5 || !addressForm.city || !addressForm.state) {
                              toast({
                                variant: "destructive",
                                title: "Missing Information",
                                description: "Please fill all required address fields.",
                              });
                              return;
                            }

                            if (trimmedLine1 && addressForm.city && addressForm.state) {
                              const addressPayload = {
                                name: trimmedName,
                                phone: addressForm.phone,
                                line1: trimmedLine1,
                                line2: addressForm.line2,
                                city: addressForm.city,
                                state: addressForm.state,
                                pincode: addressForm.pincode,
                                isDefault: savedAddresses.length === 0 // First address is default
                              };
                              
                              try {
                                if (editingAddressId) {
                                  // Update existing address via API
                                  const response = await fetch(`/api/addresses/${editingAddressId}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(addressPayload)
                                  });
                                  
                                  if (response.ok) {
                                    const { address } = await response.json();
                                    const formattedAddress = {
                                      id: address._id,
                                      name: address.name,
                                      phone: address.phone,
                                      pincode: address.pincode,
                                      address: `${address.line1}${address.line2 ? ', ' + address.line2 : ''}`,
                                      line1: address.line1,
                                      line2: address.line2,
                                      city: address.city,
                                      state: address.state,
                                      estimatedDelivery: "3-5 business days",
                                      isDefault: address.isDefault
                                    };
                                    
                                    const updated = savedAddresses.map(addr => 
                                      addr.id === editingAddressId ? formattedAddress : addr
                                    );
                                    setSavedAddresses(updated);
                                    setDeliveryAddress(formattedAddress);
                                    localStorage.setItem('selectedAddress', JSON.stringify(formattedAddress));
                                    
                                    toast({
                                      title: "Address Updated",
                                      description: "Address has been updated successfully",
                                    });
                                  } else {
                                    toast({
                                      variant: "destructive",
                                      title: "Update Failed",
                                      description: "Failed to update address. Please try again.",
                                    });
                                  }
                                } else {
                                  // Add new address via API
                                  const response = await fetch('/api/addresses', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(addressPayload)
                                  });
                                  
                                  if (response.ok) {
                                    const { address } = await response.json();
                                    const formattedAddress = {
                                      id: address._id,
                                      name: address.name,
                                      phone: address.phone,
                                      pincode: address.pincode,
                                      address: `${address.line1}${address.line2 ? ', ' + address.line2 : ''}`,
                                      line1: address.line1,
                                      line2: address.line2,
                                      city: address.city,
                                      state: address.state,
                                      estimatedDelivery: "3-5 business days",
                                      isDefault: address.isDefault
                                    };
                                    
                                    const updated = [...savedAddresses, formattedAddress];
                                    setSavedAddresses(updated);
                                    setDeliveryAddress(formattedAddress);
                                    localStorage.setItem('selectedAddress', JSON.stringify(formattedAddress));
                                    
                                    toast({
                                      title: "Address Added",
                                      description: "Delivery address has been saved successfully",
                                    });
                                  } else {
                                    toast({
                                      variant: "destructive",
                                      title: "Save Failed",
                                      description: "Failed to save address. Please try again.",
                                    });
                                  }
                                }
                                
                                setShowAddressForm(false);
                                setEditingAddressId(null);
                                setAddressForm({ name: "", phone: "", line1: "", line2: "", city: "", pincode: "", state: "" });
                              } catch (error) {
                                console.error('Error saving address:', error);
                                toast({
                                  variant: "destructive",
                                  title: "Error",
                                  description: "An error occurred while saving the address",
                                });
                              }
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
                            setAddressForm({ name: "", phone: "", line1: "", line2: "", city: "", pincode: "", state: "" });
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
                        setAddressForm({ name: "", phone: "", line1: "", line2: "", city: "", pincode: "", state: "" });
                      }}
                      className="w-full bg-[#AE876D] hover:bg-[#8d6c58] text-white py-3 rounded-md font-medium transition-colors"
                    >
                      + Add Address
                    </button>
                  )}
            </div>
            
            {/* Select All Checkbox */}
            <div className="bg-[#333333] rounded-lg p-3 sm:p-4 mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-[#444444] bg-[#222222] text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0 flex-shrink-0"
                />
                <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium break-words">
                  {selectedCount}/{totalItems} ITEMS SELECTED ({formatPrice(total)})
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
                  <div key={`cart-item-${item.id}-${item.variant || 'basic'}-${index}`} className="bg-[#333333] rounded-lg p-3 sm:p-4 md:p-6">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Checkbox */}
                      <div className="flex items-start pt-1 flex-shrink-0">
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
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded border-[#444444] bg-[#222222] text-[#AE876D] focus:ring-[#AE876D] focus:ring-offset-0"
                          aria-label={`Select ${item.name}`}
                          data-item-id={String(item.id)}
                          data-item-variant={item.variant || 'basic'}
                        />
                      </div>
                      
                      {/* Product Image */}
                      <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 relative bg-[#222222] rounded-md overflow-hidden flex-shrink-0">
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
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-1 truncate">{item.name}</h3>
                            {item.variant && (
                              <p className="text-white/60 text-xs sm:text-sm mb-1 sm:mb-2">Variant: {item.variant}</p>
                            )}
                            <p className="text-white/50 text-xs mb-2 sm:mb-3">Category: {item.variant || 'General'}</p>
                  </div>
                    </div>
                        
                        {/* Quantity and Size Selectors */}
                        <div className="flex flex-wrap gap-2 sm:gap-4 mb-2 sm:mb-3">
                    {item.variant && (
                            <div className="flex items-center">
                              <span className="text-xs sm:text-sm text-white/70 mr-1 sm:mr-2">Size:</span>
                              <select className="bg-[#222222] border border-[#444444] rounded px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#AE876D]">
                                <option>{item.variant}</option>
                              </select>
                            </div>
                          )}
                      <div className="flex items-center">
                            <span className="text-xs sm:text-sm text-white/70 mr-1 sm:mr-2">Qty:</span>
                            <div className="flex items-center border border-[#444444] rounded">
                        <button 
                          onClick={() => handleDecreaseQuantity(item.id, item.quantity, item.variant)}
                          disabled={item.quantity <= 1}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-white hover:bg-[#444444] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                                −
                        </button>
                              <span className="px-2 sm:px-4 py-1 sm:py-1.5 text-white border-x border-[#444444] text-xs sm:text-sm">
                                {item.quantity}
                              </span>
                        <button 
                          onClick={() => handleIncreaseQuantity(item.id, item.quantity, item.variant)}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-white hover:bg-[#444444] text-sm"
                        >
                          +
                        </button>
                      </div>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="mb-2 sm:mb-3">
                          <p className="text-white font-semibold text-base sm:text-lg">
                            {formatPrice(itemTotal)}
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
                        <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4">
                          <button
                            onClick={() => removeFromCart(item.id, item.variant)}
                            className="text-xs sm:text-sm text-white/70 hover:text-[#AE876D] uppercase font-medium"
                          >
                            REMOVE
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
            <div className="bg-[#333333] rounded-lg p-4 sm:p-6 sticky top-24 sm:top-28 self-start">
              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={selectedCount === 0}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#444444] disabled:cursor-not-allowed text-white py-3 sm:py-4 rounded-md font-semibold text-base sm:text-lg mb-4 sm:mb-6 transition-colors"
              >
                PLACE ORDER
              </button>
              
              {/* Billing Details */}
              <div className="border-t border-[#444444] pt-4 sm:pt-6">
                <h3 className="text-white font-semibold mb-3 sm:mb-4 uppercase text-xs sm:text-sm">Billing Details</h3>
                <div className="space-y-2 mb-3 sm:mb-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-white/70 break-words pr-2">Cart Total (Excl. of all taxes)</span>
                    <span className="text-white flex-shrink-0">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-white/70">GST</span>
                    <span className="text-white">{formatPrice(gst)}</span>
                  </div>
                </div>
                
                <div className="border-t border-[#444444] pt-3 sm:pt-4">
                  <div className="flex justify-between font-semibold text-base sm:text-lg">
                    <span className="text-white">Total</span>
                    <span className="text-white">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
