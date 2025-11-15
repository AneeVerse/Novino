"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, Check } from "lucide-react";

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

export default function AddressPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [isPincodeVerified, setIsPincodeVerified] = useState(false);

  // Load saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/addresses');
        if (response.ok) {
          const data = await response.json();
          const formattedAddresses = data.addresses.map((addr: any) => ({
            id: addr._id,
            name: addr.name,
            phone: addr.phone,
            pincode: addr.pincode,
            address: `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}`,
            line1: addr.line1,
            line2: addr.line2,
            city: addr.city,
            state: addr.state,
            estimatedDelivery: "3-5 business days",
            isDefault: addr.isDefault
          }));
          
          setSavedAddresses(formattedAddresses);
          
          // Set default or first address as selected
          const defaultAddress = formattedAddresses.find((addr: SavedAddress) => addr.isDefault) || formattedAddresses[0];
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const verifyPincode = async () => {
    const pin = addressForm.pincode.trim();
    if (!/^\d{6}$/.test(pin)) {
      setPincodeStatus('error');
      setPincodeMessage('Enter a valid 6-digit pincode');
      setIsPincodeVerified(false);
      return;
    }

    try {
      setPincodeStatus('loading');
      setPincodeMessage('Checking availability...');
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();

      if (Array.isArray(data) && data[0]?.Status === 'Success') {
        const office = data[0]?.PostOffice?.[0];
        const city = office?.District || '';
        const state = office?.State || '';

        setAddressForm(prev => ({
          ...prev,
          city,
          state,
        }));
        setPincodeStatus('success');
        setPincodeMessage(`${city}, ${state}`);
        setIsPincodeVerified(true);
      } else {
        setPincodeStatus('error');
        setPincodeMessage('Service unavailable for this pincode');
        setIsPincodeVerified(false);
      }
    } catch (error) {
      console.error('Pincode lookup failed', error);
      setPincodeStatus('error');
      setPincodeMessage('Unable to fetch pincode details. Try again.');
      setIsPincodeVerified(false);
    }
  };

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      toast({
        variant: "destructive",
        title: "Address Required",
        description: "Please select or add a delivery address",
      });
      return;
    }

    // Store selected address
    localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
    
    // Navigate to payment
    router.push('/checkout');
  };

  const resetForm = () => {
    setAddressForm({ name: "", phone: "", line1: "", line2: "", city: "", pincode: "", state: "" });
    setPincodeStatus('idle');
    setPincodeMessage('');
    setIsPincodeVerified(false);
  };

  const handleSaveAddress = async () => {
    const trimmedName = addressForm.name.trim();
    const trimmedLine1 = addressForm.line1.trim();
    const isValidPincode = isPincodeVerified && /^\d{6}$/.test(addressForm.pincode);
    const isValidPhone = /^\d{10}$/.test(addressForm.phone);

    if (trimmedName.length < 3) {
      toast({
        variant: "destructive",
        title: "Name Required",
        description: "Please enter the full name for this address.",
      });
      return;
    }

    if (!isValidPincode) {
      toast({
        variant: "destructive",
        title: "Invalid Pincode",
        description: "Please enter a valid 6 digit Indian pincode.",
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

    if (trimmedLine1.length < 5) {
      toast({
        variant: "destructive",
        title: "Address Too Short",
        description: "Address line 1 should be at least 5 characters long.",
      });
      return;
    }

    if (trimmedLine1 && addressForm.city && addressForm.state && isPincodeVerified) {
      const addressPayload = {
        name: trimmedName,
        phone: addressForm.phone,
        line1: trimmedLine1,
        line2: addressForm.line2,
        city: addressForm.city,
        state: addressForm.state,
        pincode: addressForm.pincode,
        isDefault: savedAddresses.length === 0
      };
      
      try {
        if (editingAddressId) {
          // Update existing address
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
            setSelectedAddress(formattedAddress);
            
            toast({
              title: "Address Updated",
              description: "Address has been updated successfully",
            });
          }
        } else {
          // Add new address
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
            setSelectedAddress(formattedAddress);
            
            toast({
              title: "Address Added",
              description: "Delivery address has been saved successfully",
            });
          }
        }
        
        setShowAddressForm(false);
        setEditingAddressId(null);
        resetForm();
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2D2D2D] flex flex-col items-center justify-center pt-24">
        <Loader2 className="h-12 w-12 text-[#AE876D] animate-spin mb-4" />
        <p className="text-white text-xl">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2D2D2D] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
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
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#AE876D] flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-[#AE876D]">ADDRESS</span>
            </div>
            <div className="w-16 h-0.5 bg-[#444444]"></div>
            <button 
              onClick={() => {
                if (selectedAddress) {
                  router.push('/checkout');
                } else {
                  toast({
                    variant: "destructive",
                    title: "Address Required",
                    description: "Please select or add an address first",
                  });
                }
              }}
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#444444] flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-white/60">PAYMENT</span>
            </button>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold mb-6 flex items-center">
          <MapPin className="w-6 h-6 mr-2 text-[#AE876D]" />
          Select Delivery Address
        </h1>

        <div className="bg-[#333333] rounded-lg p-6 mb-6">
          {showAddressForm ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D]"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setAddressForm(prev => ({ ...prev, phone: value }));
                  }}
                  className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D]"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Delivery Pincode *
                </label>
                <div className="flex gap-3">
                  <input
                    type="tel"
                    value={addressForm.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      setAddressForm(prev => ({
                        ...prev,
                        pincode: value,
                        city: "",
                        state: ""
                      }));
                      setIsPincodeVerified(false);
                      setPincodeStatus('idle');
                      setPincodeMessage('');
                    }}
                    className={`flex-1 bg-[#222222] border ${pincodeStatus === 'error' ? 'border-red-500' : 'border-[#444444]'} rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D] ${isPincodeVerified ? 'bg-[#1c1c1c]/80' : ''}`}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    inputMode="numeric"
                    disabled={pincodeStatus === 'loading'}
                  />
                  {isPincodeVerified ? (
                    <button
                      onClick={() => {
                        setIsPincodeVerified(false);
                        setPincodeStatus('idle');
                        setPincodeMessage('Enter a new pincode to change location');
                      }}
                      className="px-4 py-2 bg-[#444444] hover:bg-[#555555] rounded-md text-sm font-medium transition-colors"
                    >
                      Change
                    </button>
                  ) : (
                    <button
                      onClick={verifyPincode}
                      className="px-4 py-2 bg-[#AE876D] hover:bg-[#8d6c58] rounded-md text-sm font-medium transition-colors"
                    >
                      {pincodeStatus === 'loading' ? 'Checking...' : 'Check'}
                    </button>
                  )}
                </div>
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
                    {pincodeMessage}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isPincodeVerified}
                    className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D]"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                    disabled={!isPincodeVerified}
                    className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D]"
                    placeholder="State"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, line1: e.target.value }))}
                  disabled={!isPincodeVerified}
                  className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D]"
                  placeholder="Street address"
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
                  disabled={!isPincodeVerified}
                  className="w-full bg-[#222222] border border-[#444444] rounded px-3 py-2 text-white focus:outline-none focus:border-[#AE876D] focus:ring-1 focus:ring-[#AE876D]"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveAddress}
                  className="flex-1 bg-[#AE876D] hover:bg-[#8d6c58] text-white py-3 rounded-md font-medium transition-colors"
                >
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddressId(null);
                    resetForm();
                  }}
                  className="flex-1 bg-[#444444] hover:bg-[#555555] text-white py-3 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {savedAddresses.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 border rounded-md cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? 'border-[#AE876D] bg-[#AE876D]/10'
                          : 'border-[#444444] hover:border-[#555555]'
                      }`}
                      onClick={() => setSelectedAddress(address)}
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
                          <p className="text-white/60 text-sm mb-1">+91 {address.phone}</p>
                          <p className="text-white/70 text-sm">{address.address}</p>
                          <p className="text-white/60 text-sm mt-1">{address.city}, {address.state}</p>
                        </div>
                        {selectedAddress?.id === address.id && (
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
                              phone: address.phone,
                              line1: address.line1,
                              line2: address.line2,
                              city: address.city,
                              pincode: address.pincode,
                              state: address.state
                            });
                            setIsPincodeVerified(true);
                            setPincodeStatus('success');
                            setPincodeMessage(`${address.city}, ${address.state}`);
                            setShowAddressForm(true);
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
                                const updated = savedAddresses.filter(addr => addr.id !== address.id);
                                setSavedAddresses(updated);
                                if (selectedAddress?.id === address.id) {
                                  setSelectedAddress(updated[0] || null);
                                }
                                toast({
                                  title: "Address Deleted",
                                  description: "Address has been removed",
                                });
                              }
                            } catch (error) {
                              console.error('Error deleting address:', error);
                            }
                          }}
                          className="text-xs text-red-400 hover:text-red-300 uppercase"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-center py-8">No saved addresses</p>
              )}

              <button
                onClick={() => {
                  setShowAddressForm(true);
                  setEditingAddressId(null);
                  resetForm();
                }}
                className="w-full bg-[#444444] hover:bg-[#555555] text-white py-3 rounded-md font-medium transition-colors"
              >
                + Add New Address
              </button>
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/cart')}
            className="flex-1 bg-[#444444] hover:bg-[#555555] text-white py-3 rounded-md font-medium transition-colors"
          >
            Back to Cart
          </button>
          <button
            onClick={handleContinueToPayment}
            disabled={!selectedAddress}
            className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#444444] disabled:cursor-not-allowed text-white py-3 rounded-md font-semibold transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

