"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2, User, ShoppingBag, MapPin, Shield, LogOut,
  Package, Truck, CheckCircle2, Clock, XCircle, AlertCircle,
  Edit, Trash2, Plus, Eye, RefreshCw, X, CreditCard, Calendar,
  Navigation
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import TrackingJourneyCard from "@/components/orders/tracking-journey-card";
import { getTrackingPreviewData } from "@/components/orders/mock-tracking-data";

// Define types
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  gst: number;
  shippingCost?: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderedAt: string;
  estimatedDelivery?: string;
  deliveryAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
    email?: string;
  };
  giftWrap: boolean;
}

interface ShipmentEvent {
  status: string;
  location?: string;
  remarks?: string;
  recordedAt: string;
}

interface Shipment {
  _id: string;
  status: string;
  courierName?: string;
  awbCode?: string;
  trackingUrl?: string;
  pickupScheduledFor?: string;
  trackingEvents: ShipmentEvent[];
}

interface Address {
  _id?: string; // For backward compatibility
  id?: string; // Supabase uses 'id'
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  isDefault?: boolean;
  is_default?: boolean; // Supabase uses snake_case
}

const TRACKING_PREVIEW_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_TRACKING_PREVIEW !== "false";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user: supabaseUser, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [profileData, setProfileData] = useState<{name?: string, email?: string, phone?: string} | null>(null);

  const user = supabaseUser ? {
    name: profileData?.name || supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
    email: profileData?.email || supabaseUser.email || '',
    phone: profileData?.phone || supabaseUser.user_metadata?.phone || '',
    userId: supabaseUser.id
  } : null;

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shipments, setShipments] = useState<Record<string, Shipment>>({});
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [shipmentError, setShipmentError] = useState<string | null>(null);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState(searchParams?.get('tab') || 'profile');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Phone number edit state
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pincodeMessage, setPincodeMessage] = useState("");

  // Fetch profile data from database
  const fetchProfile = async () => {
    if (!supabaseUser?.id) return;
    
    try {
      const res = await fetch(`/api/profile/${supabaseUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfileData(data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  // Check if user is logged in
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        setLoading(false);
        // Fetch profile, orders and addresses
        fetchProfile();
        fetchOrders();
        fetchAddresses();
      } else {
        setLoading(false);
        router.push('/login');
      }
    }
  }, [isAuthenticated, authLoading, router]);

  // Auto-fetch city and state from pincode
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

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch addresses - always fetch fresh from API
  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses', {
        cache: 'no-store', // Always fetch fresh data
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Normalize addresses to have both id and _id for compatibility
        const normalizedAddresses = data.addresses.map((addr: any) => ({
          ...addr,
          _id: addr.id || addr._id, // Use id as primary, fallback to _id
          id: addr.id || addr._id, // Ensure id exists
          isDefault: addr.is_default || addr.isDefault || false
        }));
        setAddresses(normalizedAddresses);
      } else {
        console.error('Failed to fetch addresses:', res.status);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const hydrateShipment = async (orderId: string, refresh = false) => {
    if (shipments[orderId] && !refresh) {
      setShipmentError(null);
      return;
    }

    setShipmentLoading(true);
    setShipmentError(null);
    try {
      const res = await fetch(`/api/shipments/${orderId}${refresh ? '?refresh=true' : ''}`);
      if (!res.ok) {
        throw new Error('Shipment details are not ready yet.');
      }
      const data = await res.json();
      setShipments((prev) => ({ ...prev, [orderId]: data.shipment }));
    } catch (error: any) {
      setShipmentError(error.message || 'Unable to load shipment details right now.');
    } finally {
      setShipmentLoading(false);
    }
  };
  const selectedShipment = selectedOrder ? shipments[selectedOrder._id] : null;


  const handleLogout = async () => {
    try {
      await logout();

      // Show success message
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Please try again"
      });
    }
  };

  // Password validation
  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-z]/.test(password)) return 'Must contain lowercase letter';
    if (!/[A-Z]/.test(password)) return 'Must contain uppercase letter';
    if (!/[0-9]/.test(password)) return 'Must contain number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Must contain special character';
    return null;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast({ variant: "destructive", title: "Invalid Password", description: passwordError });
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Password Mismatch", description: "Passwords don't match" });
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res.ok) {
        toast({ title: "Success", description: "Password updated successfully" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        toast({ variant: "destructive", title: "Update Failed", description: data.message });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Network error" });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Address handlers
  const handleSaveAddress = async () => {
    if (!addressForm.name || !addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode || !addressForm.phone) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all required fields including phone number" });
      return;
    }

    try {
      // Check if we're editing or creating
      if (editingAddressId) {
        // Update existing address
        const res = await fetch(`/api/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: addressForm.name,
            phone: addressForm.phone,
            line1: addressForm.line1,
            line2: addressForm.line2 || '',
            city: addressForm.city,
            state: addressForm.state,
            pincode: addressForm.pincode,
            isDefault: false // Don't change default status on edit unless explicitly set
          })
        });

        if (res.ok) {
          toast({ title: "Success", description: "Address updated successfully" });
          fetchAddresses();
          setShowAddressForm(false);
          setEditingAddressId(null);
          setAddressForm({ name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
          setPincodeStatus('idle');
          setPincodeMessage('');
        } else {
          const errorData = await res.json().catch(() => ({ message: 'Failed to update address' }));
          toast({ variant: "destructive", title: "Update Failed", description: errorData.message || "Could not update address" });
        }
      } else {
        // Create new address
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: addressForm.name,
            phone: addressForm.phone,
            line1: addressForm.line1,
            line2: addressForm.line2 || '',
            city: addressForm.city,
            state: addressForm.state,
            pincode: addressForm.pincode,
            isDefault: addresses.length === 0 // First address is default
          })
        });

        if (res.ok) {
          toast({ title: "Success", description: "Address added successfully" });
          fetchAddresses();
          setShowAddressForm(false);
          setEditingAddressId(null);
          setAddressForm({ name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
          setPincodeStatus('idle');
          setPincodeMessage('');
        } else {
          const errorData = await res.json().catch(() => ({ message: 'Failed to add address' }));
          toast({ variant: "destructive", title: "Add Failed", description: errorData.message || "Could not add address" });
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast({ variant: "destructive", title: "Error", description: "Network error occurred" });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: "Success", description: "Address deleted" });
        fetchAddresses();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete address" });
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'PATCH' });
      if (res.ok) {
        toast({ title: "Success", description: "Default address updated" });
        fetchAddresses();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not update address" });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'PATCH' });
      if (res.ok) {
        toast({ title: "Success", description: "Order cancelled" });
        fetchOrders();
      } else {
        const data = await res.json();
        toast({ variant: "destructive", title: "Cannot Cancel", description: data.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not cancel order" });
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Status badge component
  const getOrderStatusBadge = (status: string | undefined | null) => {
    // Handle undefined/null status with default
    if (!status || typeof status !== 'string') {
      status = 'pending';
    }

    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
      confirmed: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle2 },
      processing: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Package },
      shipped: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: Truck },
      delivered: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle2 },
      cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string | undefined | null) => {
    // Handle undefined/null status with default
    if (!status || typeof status !== 'string') {
      status = 'pending';
    }

    const colors = {
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      refunded: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      requires_payment: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };

    const statusText = {
      pending: 'COD - Pending',
      requires_payment: 'Payment Required',
      paid: 'Paid',
      failed: 'Failed',
      refunded: 'Refunded'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.pending}`}>
        {statusText[status as keyof typeof statusText] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Helper function to safely get order status (handles both camelCase and snake_case)
  const getOrderStatus = (order: Order | any): string => {
    return order?.orderStatus || order?.order_status || 'pending';
  };

  // Helper function to safely get payment status (handles both camelCase and snake_case)
  const getPaymentStatus = (order: Order | any): string => {
    return order?.paymentStatus || order?.payment_status || 'pending';
  };

  // Load Razorpay script dynamically
  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  };

  // Handle retry payment
  const handleRetryPayment = async (order: Order | null) => {
    if (!order) return;

    setIsRetryingPayment(true);
    try {
      // Create new Razorpay order for this existing order
      // Use the order ID (could be _id or id depending on database)
      const orderId = (order as any).id || order._id;
      const response = await fetch('/api/payments/retry-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initiate payment');
      }

      const gateway = await response.json();

      // Load Razorpay script
      await loadRazorpayScript();

      // Get customer details from order
      const deliveryAddress = order.deliveryAddress || (order as any).delivery_address;
      const sanitizedContact = (deliveryAddress?.phone || '')
        .toString()
        .replace(/[^0-9]/g, '')
        .slice(-10);

      // Open Razorpay payment gateway
      const rzp = new (window as any).Razorpay({
        key: gateway.key,
        amount: gateway.amount,
        currency: gateway.currency,
        order_id: gateway.razorpayOrderId,
        name: 'Novino',
        description: `Payment for Order #${order.orderNumber}`,
        prefill: {
          name: gateway.customer?.name || deliveryAddress?.name || user?.name || '',
          email: gateway.customer?.email || user?.email || '',
          contact: sanitizedContact,
        },
        remember_user: false,
        theme: { color: '#AE876D' },
        handler: async (paymentResponse: any) => {
          try {
            // Verify payment
            const verifyRes = await fetch('/api/payments/razorpay-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: gateway.orderId,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
                paymentMethod: 'razorpay',
              }),
            });

            if (verifyRes.ok) {
              setIsRetryingPayment(false);
              toast({
                title: 'Payment Successful',
                description: 'Your payment has been processed successfully. Order will be confirmed shortly.',
              });
              
              // Refresh orders to show updated status
              fetchOrders();
              
              // Close modal and refresh
              setSelectedOrder(null);
            } else {
              const error = await verifyRes.json();
              throw new Error(error.message || 'Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            setIsRetryingPayment(false);
            toast({
              variant: 'destructive',
              title: 'Payment Verification Failed',
              description: error.message || 'Please contact support if payment was deducted.',
            });
          }
        },
        modal: {
          ondismiss: () => {
            setIsRetryingPayment(false);
          },
        },
      });

      rzp.on('payment.failed', () => {
        setIsRetryingPayment(false);
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: 'Payment could not be processed. Please try again or contact support.',
        });
      });

      rzp.open();
    } catch (error: any) {
      console.error('Retry payment error:', error);
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.message || 'Failed to initiate payment. Please try again.',
      });
      setIsRetryingPayment(false);
    }
  };

  // Helper function to safely get delivery address (handles both camelCase and snake_case, and missing values)
  const getDeliveryAddress = (order: Order | any): Order['deliveryAddress'] | null => {
    const addr = order?.deliveryAddress || order?.delivery_address;
    if (!addr || typeof addr !== 'object') {
      return null;
    }
    // Ensure all required fields have defaults
    return {
      name: addr.name || 'N/A',
      line1: addr.line1 || '',
      line2: addr.line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      phone: addr.phone || '',
      email: addr.email || ''
    };
  };

  const selectedOrderTotals = selectedOrder
    ? (() => {
      const subtotal =
        typeof selectedOrder.subtotal === 'number'
          ? selectedOrder.subtotal
          : selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping =
        typeof selectedOrder.shippingCost === 'number' ? selectedOrder.shippingCost : 0;
      const gstAmount =
        typeof selectedOrder.gst === 'number'
          ? selectedOrder.gst
          : Math.max(selectedOrder.total - subtotal - shipping, 0);
      return { subtotal, shipping, gstAmount };
    })()
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2D2D2D] to-[#1a1a1a] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#AE876D]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2D2D2D] to-[#1a1a1a] pt-24 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#AE876D]/10 to-transparent rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-r from-[#333333] to-[#2a2a2a] rounded-2xl p-6 md:p-8 border border-[#AE876D]/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#AE876D] to-[#8d6c58] flex items-center justify-center text-white font-bold text-xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  My Account
                </h1>
                <p className="text-white/60">Welcome back, {user.name}!</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center w-full">
            <TabsList className="bg-[#333333] border border-[#444444] p-1.5 rounded-xl flex-wrap h-auto gap-2 justify-center">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#AE876D] data-[state=active]:to-[#8d6c58] data-[state=active]:text-white rounded-lg text-white/70 hover:text-white transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#AE876D] data-[state=active]:to-[#8d6c58] data-[state=active]:text-white rounded-lg text-white/70 hover:text-white transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
              {orders.length > 0 && (
                <span className="bg-[#AE876D] text-white text-xs px-2 py-0.5 rounded-full">{orders.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#AE876D] data-[state=active]:to-[#8d6c58] data-[state=active]:text-white rounded-lg text-white/70 hover:text-white transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#AE876D] data-[state=active]:to-[#8d6c58] data-[state=active]:text-white rounded-lg text-white/70 hover:text-white transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>
          </div>


          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-gradient-to-br from-[#333333] to-[#2a2a2a] rounded-xl p-6 md:p-8 border border-[#444444] shadow-xl">
              <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
                <User className="w-6 h-6 text-[#AE876D]" />
                Profile Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Name</label>
                  <Input
                    type="text"
                    value={user?.name || ""}
                    disabled
                    className="bg-[#222222] border-[#444444] text-white cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Email</label>
                  <Input
                    type="email"
                    value={user?.email || "Not set"}
                    disabled
                    className="bg-[#222222] border-[#444444] text-white cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Phone Number</label>
                  {!user?.phone || isEditingPhone ? (
                    <div className="space-y-2">
                      <Input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Enter your phone number"
                        className="bg-[#222222] border-[#444444] text-white"
                        disabled={phoneLoading}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            setPhoneLoading(true);
                            try {
                              // Validate phone number
                              const cleaned = phoneInput.replace(/\D/g, '');
                              if (cleaned.length !== 10) {
                                toast({
                                  title: "Invalid Phone Number",
                                  description: "Please enter a valid 10-digit phone number.",
                                  variant: "destructive"
                                });
                                setPhoneLoading(false);
                                return;
                              }

                              // Update phone number via API
                              const response = await fetch(`/api/profile/${user?.userId}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phone: cleaned })
                              });

                              if (response.ok) {
                                toast({
                                  title: "Phone Number Updated",
                                  description: "Your phone number has been saved successfully."
                                });
                                setIsEditingPhone(false);
                                // Refresh profile data
                                fetchProfile();
                              } else {
                                const data = await response.json();
                                toast({
                                  title: "Update Failed",
                                  description: data.error || "Failed to update phone number.",
                                  variant: "destructive"
                                });
                              }
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "An error occurred while updating phone number.",
                                variant: "destructive"
                              });
                            } finally {
                              setPhoneLoading(false);
                            }
                          }}
                          disabled={phoneLoading || !phoneInput}
                          className="bg-[#AE876D] hover:bg-[#8d6c58] text-white"
                        >
                          {phoneLoading ? "Saving..." : "Save"}
                        </Button>
                        {isEditingPhone && (
                          <Button
                            onClick={() => {
                              setIsEditingPhone(false);
                              setPhoneInput("");
                            }}
                            variant="outline"
                            className="border-[#444444] text-white hover:bg-[#333333]"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        type="tel"
                        value={user?.phone}
                        disabled
                        className="bg-[#222222] border-[#444444] text-white cursor-not-allowed"
                      />
                      <Button
                        onClick={() => {
                          setIsEditingPhone(true);
                          setPhoneInput(user?.phone || "");
                        }}
                        variant="outline"
                        size="sm"
                        className="border-[#444444] text-white hover:bg-[#333333]"
                      >
                        Change Phone Number
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-gradient-to-br from-[#333333] to-[#2a2a2a] rounded-xl p-12 border border-[#444444] text-center">
                <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg mb-4">No orders yet</p>
                <Link href="/paintings">
                  <Button className="bg-gradient-to-r from-[#AE876D] to-[#8d6c58] hover:from-[#8d6c58] hover:to-[#AE876D] text-white">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-gradient-to-br from-[#333333] to-[#2a2a2a] rounded-xl border border-[#444444] overflow-hidden hover:border-[#AE876D]/50 transition-all shadow-lg"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold text-white">
                              Order #{order.orderNumber}
                            </h3>
                            {getOrderStatusBadge(getOrderStatus(order))}
                            {getPaymentStatusBadge(getPaymentStatus(order))}
                          </div>
                          <p className="text-white/50 text-sm mt-1">
                            Placed on {new Date(order.orderedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#AE876D]">
                            ₹{order.total.toLocaleString('en-IN')}
                          </p>
                          <p className="text-white/50 text-sm">{order.items.length} item(s)</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3 mb-4">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-[#222222] rounded-lg">
                            <div className="w-16 h-16 relative rounded-md overflow-hidden flex-shrink-0 bg-[#333333]">
                              {item.image && (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{item.name}</h4>
                              <p className="text-white/50 text-sm">
                                Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                              </p>
                              {item.variant && (
                                <p className="text-white/40 text-xs">Variant: {item.variant}</p>
                              )}
                            </div>
                            <p className="text-[#AE876D] font-medium">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </p>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-white/50 text-sm text-center">
                            +{order.items.length - 2} more item(s)
                          </p>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-[#222222] rounded-lg p-4 mb-4">
                        <p className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#AE876D]" />
                          Delivery Address
                        </p>
                        <p className="text-white text-sm">
                          {(() => {
                            const addr = getDeliveryAddress(order);
                            if (!addr) return 'Address not available';
                            return (
                              <>
                                {addr.name}<br />
                                {addr.line1}
                                {addr.line2 && `, ${addr.line2}`}<br />
                                {addr.city}, {addr.state} - {addr.pincode}
                              </>
                            );
                          })()}
                        </p>
                      </div>

                      {/* Payment Method */}
                      <div className="flex items-center gap-2 mb-4 text-sm">
                        <span className="text-white/70">Payment Method:</span>
                        <span className="text-white font-medium capitalize">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-[#444444]">
                        {(getPaymentStatus(order) === 'requires_payment' || getPaymentStatus(order) === 'failed') && (
                          <Button
                            size="sm"
                            className="bg-[#AE876D] hover:bg-[#8d6c58] text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetryPayment(order);
                            }}
                            disabled={isRetryingPayment}
                          >
                            {isRetryingPayment ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Again
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#AE876D] text-[#AE876D] hover:bg-[#AE876D]/10"
                          onClick={() => {
                            setSelectedOrder(order);
                            hydrateShipment(order._id);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order Details Modal */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => {
              if (!open) {
                setSelectedOrder(null);
                setShipmentError(null);
              }
            }}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#222222] border-[#333333] text-white z-[9999]">
                {selectedOrder && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-white flex items-center justify-between">
                        <span>Order Details - {selectedOrder.orderNumber}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/70 hover:text-white hover:bg-[#333333]"
                          onClick={() => hydrateShipment(selectedOrder._id, true)}
                          disabled={shipmentLoading}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${shipmentLoading ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                      {/* Order Status & Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-white/60" />
                            <span className="text-sm text-white/60">Order Date</span>
                          </div>
                          <p className="text-white font-medium">
                            {(() => {
                              try {
                                const date = new Date(selectedOrder.orderedAt);
                                if (isNaN(date.getTime())) return 'To be updated';
                                return date.toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });
                              } catch (e) {
                                return 'To be updated';
                              }
                            })()}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-white/60" />
                            <span className="text-sm text-white/60">Order Status</span>
                          </div>
                          {getOrderStatusBadge(getOrderStatus(selectedOrder))}
                        </div>
                      </div>

                      {shipmentError && getPaymentStatus(selectedOrder) === 'paid' && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <p className="text-sm text-green-400">Order confirmed! We'll update shipping details soon.</p>
                        </div>
                      )}

                      {(getPaymentStatus(selectedOrder) === 'requires_payment' || getPaymentStatus(selectedOrder) === 'failed') && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            <p className="text-sm text-yellow-400">
                              {getPaymentStatus(selectedOrder) === 'requires_payment' 
                                ? 'Payment is pending. Please complete payment to process your order.'
                                : 'Payment failed. You can retry payment for this order.'}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleRetryPayment(selectedOrder)}
                            disabled={isRetryingPayment}
                            className="bg-[#AE876D] hover:bg-[#8d6c58] text-white whitespace-nowrap"
                          >
                            {isRetryingPayment ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Again
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Products & Payment Summary Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Products - Left Side */}
                        <div className="lg:col-span-2 p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                          <h3 className="text-lg font-semibold mb-4 text-white">Products</h3>
                          <div className="space-y-3">
                            {selectedOrder.items.map((item, idx) => (
                              <div
                                key={`${item.productId}-${idx}`}
                                className="flex gap-4 p-4 rounded-lg border border-[#444444] bg-[#2a2a2a]"
                              >
                                <div className="relative w-24 h-24 rounded-md overflow-hidden bg-[#333333] flex-shrink-0 border border-[#333333]">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                      sizes="96px"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
                                      No Image
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-semibold text-lg mb-2">{item.name}</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-white/60">SKU:</span>
                                      <span className="text-white ml-2">{item.productId}</span>
                                    </div>
                                    <div>
                                      <span className="text-white/60">Quantity:</span>
                                      <span className="text-white ml-2">{item.quantity}</span>
                                    </div>
                                    <div>
                                      <span className="text-white/60">Price:</span>
                                      <span className="text-white ml-2">₹{item.price.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-white/60">Subtotal:</span>
                                      <span className="text-white ml-2 font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  </div>
                                  {item.variant && (
                                    <p className="text-white/50 text-xs mt-2">Variant: {item.variant}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Summary - Right Side */}
                        <div className="p-4 rounded-lg border border-[#444444] bg-[#2a2a2a] space-y-3 h-fit">
                          <p className="text-white font-semibold text-base">Payment Summary</p>
                          <div className="space-y-2 text-sm text-white">
                            <div className="flex justify-between">
                              <span className="text-white/60">Items Total</span>
                              <span className="font-medium">
                                {formatCurrency(selectedOrderTotals?.subtotal || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">GST</span>
                              <span className="font-medium">
                                {formatCurrency(selectedOrderTotals?.gstAmount || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Shipping</span>
                              <span className="font-medium">
                                {formatCurrency(selectedOrderTotals?.shipping || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between text-base font-semibold border-t border-[#444444] pt-3">
                              <span className="text-white">Grand Total</span>
                              <span className="text-[#AE876D]">{formatCurrency(selectedOrder.total)}</span>
                            </div>
                          </div>
                          <div className="text-sm text-white/70 space-y-1 pt-2 border-t border-[#444444]">
                            <div className="flex justify-between">
                              <span>Payment Method</span>
                              <span className="font-medium text-white capitalize">
                                {selectedOrder.paymentMethod === 'cod'
                                  ? 'Cash on Delivery'
                                  : selectedOrder.paymentMethod}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Payment Status</span>
                              <span className="font-medium text-white capitalize">
                                {getPaymentStatus(selectedOrder)}
                              </span>
                            </div>
                            {selectedOrder.giftWrap && (
                              <div className="flex justify-between">
                                <span>Gift Wrap</span>
                                <span className="font-medium text-white">Included</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delivery Information & Order Insights - Side by Side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border border-[#444444] bg-[#2a2a2a] space-y-2 text-sm">
                          <p className="text-white font-semibold text-base flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#AE876D]" />
                            Delivery Information
                          </p>
                          {(() => {
                            const addr = getDeliveryAddress(selectedOrder);
                            if (!addr) return <p className="text-white/60">Address not available</p>;
                            return (
                              <>
                                <p className="text-white font-medium">{addr.name}</p>
                                <p className="text-white/70">
                                  {addr.line1}
                                  {addr.line2 && (
                                    <>
                                      <br />
                                      {addr.line2}
                                    </>
                                  )}
                                  <br />
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                {addr.phone && (
                                  <p className="text-white/60">Phone: {addr.phone}</p>
                                )}
                                {addr.email && (
                                  <p className="text-white/60">Email: {addr.email}</p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <div className="p-4 rounded-lg border border-[#444444] bg-[#2a2a2a] text-sm space-y-2">
                          <p className="text-white font-semibold text-base">Order Insights</p>
                          <div className="flex justify-between text-white/70">
                            <span>Order ID</span>
                            <span className="text-white font-medium">{selectedOrder.orderNumber}</span>
                          </div>
                          <div className="flex justify-between text-white/70">
                            <span>Placed On</span>
                            <span className="text-white font-medium">
                              {(() => {
                                try {
                                  const date = new Date(selectedOrder.orderedAt);
                                  if (isNaN(date.getTime())) return 'To be updated';
                                  return date.toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  });
                                } catch (e) {
                                  return 'To be updated';
                                }
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between text-white/70">
                            <span>Estimated Delivery</span>
                            <span className="text-white font-medium">
                              {selectedOrder.estimatedDelivery
                                ? new Date(selectedOrder.estimatedDelivery).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })
                                : 'To be updated'}
                            </span>
                          </div>
                          <div className="flex justify-between text-white/70">
                            <span>Gift Wrap</span>
                            <span className="text-white font-medium">
                              {selectedOrder.giftWrap ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Information - Full Width Section */}
                      <div className="p-6 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                        <div className="flex items-center gap-2 mb-6">
                          <Truck className="w-5 h-5 text-[#A47E3B]" />
                          <h3 className="text-lg font-semibold text-white">Shipping Information</h3>
                        </div>
                        {shipmentLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center space-y-3">
                              <Loader2 className="h-8 w-8 animate-spin text-[#AE876D] mx-auto" />
                              <p className="text-white/70 text-sm">Loading shipment details...</p>
                            </div>
                          </div>
                        ) : selectedShipment ? (
                          <div className="w-full">
                            <TrackingJourneyCard
                              accentColor="#AE876D"
                              trackingNumber={selectedShipment.awbCode || selectedOrder.orderNumber}
                              courierName={selectedShipment.courierName || 'Courier partner'}
                              statusText={selectedShipment.status || getOrderStatus(selectedOrder)}
                              summaryLabel={selectedShipment.status || 'Your parcel is on the way'}
                              meta={{
                                deliveryType:
                                  getOrderStatus(selectedOrder) === 'shipped' || getOrderStatus(selectedOrder) === 'delivered'
                                    ? 'Express'
                                    : 'Standard',
                                estimate: selectedOrder.estimatedDelivery
                                  ? new Date(selectedOrder.estimatedDelivery).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                  })
                                  : selectedShipment.trackingEvents?.length
                                    ? 'Live updates'
                                    : 'Updating soon',
                                weight: 'Pending',
                              }}
                              stops={[
                                {
                                  label: selectedShipment.courierName || 'Pickup scheduled',
                                  detail: selectedShipment.pickupScheduledFor
                                    ? new Date(selectedShipment.pickupScheduledFor).toLocaleString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                    : 'Awaiting pickup confirmation',
                                },
                                {
                                  label: getDeliveryAddress(selectedOrder)?.city || 'City',
                                  detail: `${getDeliveryAddress(selectedOrder)?.state || 'State'} · ${getDeliveryAddress(selectedOrder)?.pincode || 'Pincode'}`,
                                },
                              ]}
                              shipper={{
                                name: selectedShipment.courierName || 'Courier partner',
                                role: selectedShipment.status || 'Logistics partner',
                                rating: 4.8,
                                phone: getDeliveryAddress(selectedOrder)?.phone,
                                whatsappUrl: (() => {
                                  const addr = getDeliveryAddress(selectedOrder);
                                  return addr?.phone ? `https://wa.me/91${addr.phone.replace(/\D/g, '')}` : undefined;
                                })(),
                                supportUrl: selectedShipment.trackingUrl,
                              }}
                              events={selectedShipment.trackingEvents || []}
                              actionSlot={
                                selectedShipment.trackingUrl ? (
                                  <a
                                    href={selectedShipment.trackingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="h-10 w-10 rounded-2xl border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:border-white/30 transition"
                                    aria-label="Open tracking portal"
                                  >
                                    <Navigation className="h-4 w-4" />
                                  </a>
                                ) : undefined
                              }
                            />
                          </div>
                        ) : TRACKING_PREVIEW_ENABLED && selectedOrder ? (
                          <div className="w-full space-y-3">
                            <TrackingJourneyCard
                              {...getTrackingPreviewData({
                                trackingNumber: selectedOrder.orderNumber,
                                courierName: getOrderStatus(selectedOrder) === 'shipped' ? 'Express Partner' : 'Nimbus Express',
                                statusText: getOrderStatus(selectedOrder) || 'Processing',
                                summaryLabel: 'Preview · shipment card',
                                meta: {
                                  deliveryType:
                                    getOrderStatus(selectedOrder) === 'shipped' || getOrderStatus(selectedOrder) === 'delivered'
                                      ? 'Express'
                                      : 'Standard',
                                  estimate: selectedOrder.estimatedDelivery
                                    ? new Date(selectedOrder.estimatedDelivery).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                    })
                                    : 'ETA coming soon',
                                  weight: '—',
                                },
                                stops: [
                                  {
                                    label: getDeliveryAddress(selectedOrder)?.line1 || 'Address Line 1',
                                    detail: getDeliveryAddress(selectedOrder)?.city || 'City',
                                  },
                                  {
                                    label: `${getDeliveryAddress(selectedOrder)?.city || 'City'}, ${getDeliveryAddress(selectedOrder)?.state || 'State'}`,
                                    detail: getDeliveryAddress(selectedOrder)?.pincode || 'Pincode',
                                  },
                                ],
                                shipper: {
                                  name: getDeliveryAddress(selectedOrder)?.name || 'Recipient',
                                  role: 'Preview courier',
                                  rating: 4.9,
                                  phone: getDeliveryAddress(selectedOrder)?.phone,
                                  whatsappUrl: (() => {
                                    const addr = getDeliveryAddress(selectedOrder);
                                    return addr?.phone ? `https://wa.me/91${addr.phone.replace(/\D/g, '')}` : undefined;
                                  })(),
                                },
                              })}
                            />
                            <p className="text-xs text-white/60 text-center">
                              Preview only: set <span className="font-semibold">NEXT_PUBLIC_ENABLE_TRACKING_PREVIEW</span> to{' '}
                              <span className="font-semibold">false</span> to hide this card.
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4">
                            <div className="w-20 h-20 rounded-full bg-[#AE876D]/10 flex items-center justify-center">
                              <Truck className="w-10 h-10 text-[#AE876D]" />
                            </div>
                            <div className="text-center space-y-2">
                              <h4 className="text-lg font-semibold text-white">Tracking information coming soon</h4>
                              <p className="text-white/60 text-sm max-w-md">
                                Shipment details will appear here once your order is processed and handed over to our logistics partner.
                              </p>
                            </div>
                            <div className="mt-4 p-4 rounded-lg bg-[#2a2a2a] border border-[#444444] text-sm text-white/70 space-y-2 max-w-md w-full">
                              <p className="font-medium text-white">What happens next?</p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Your order is being prepared for shipment</li>
                                <li>You'll receive tracking details once it's dispatched</li>
                                <li>Real-time updates will appear here automatically</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            {!showAddressForm && (
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setShowAddressForm(true);
                    setEditingAddressId(null);
                    setAddressForm({ name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
                    setPincodeStatus('idle');
                    setPincodeMessage('');
                  }}
                  className="bg-gradient-to-r from-[#AE876D] to-[#8d6c58] hover:from-[#8d6c58] hover:to-[#AE876D] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Address
                </Button>
              </div>
            )}

            {showAddressForm ? (
              <div className="bg-gradient-to-br from-[#333333] to-[#2a2a2a] rounded-xl p-6 md:p-8 border border-[#444444]">
                <h3 className="text-xl font-semibold text-white mb-6">
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/70">Full Name *</label>
                    <Input
                      value={addressForm.name}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-[#222222] border-[#444444] text-white focus:border-[#AE876D]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/70">Phone Number *</label>
                    <Input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-[#222222] border-[#444444] text-white focus:border-[#AE876D]"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/70">Address Line 1 *</label>
                    <Input
                      value={addressForm.line1}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, line1: e.target.value }))}
                      className="bg-[#222222] border-[#444444] text-white focus:border-[#AE876D]"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/70">Address Line 2</label>
                    <Input
                      value={addressForm.line2}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, line2: e.target.value }))}
                      className="bg-[#222222] border-[#444444] text-white focus:border-[#AE876D]"
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/70">Pincode *</label>
                      <Input
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        className="bg-[#222222] border-[#444444] text-white focus:border-[#AE876D]"
                        placeholder="000000"
                        maxLength={6}
                      />
                      {pincodeMessage && (
                        <p className={`text-xs mt-1 ${pincodeStatus === 'success' ? 'text-green-400' :
                            pincodeStatus === 'error' ? 'text-red-400' :
                              pincodeStatus === 'loading' ? 'text-yellow-400' :
                                'text-white/60'
                          }`}>
                          {pincodeStatus === 'loading' && <Loader2 className="w-3 h-3 inline-block animate-spin mr-1" />}
                          {pincodeMessage}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/70">City *</label>
                      <Input
                        value={addressForm.city}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                        className="bg-[#222222] border-[#444444] text-white focus:border-[#AE876D]"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/70">State *</label>
                      <Input
                        value={addressForm.state}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                        className="bg-[#222222] border-[#444444] text-white focus:border-[#AE876D]"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveAddress}
                      className="flex-1 bg-gradient-to-r from-[#AE876D] to-[#8d6c58] hover:from-[#8d6c58] hover:to-[#AE876D] text-white"
                    >
                      Save Address
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddressId(null);
                        setAddressForm({ name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
                        setPincodeStatus('idle');
                        setPincodeMessage('');
                      }}
                      variant="outline"
                      className="flex-1 border-[#444444] text-white/70 hover:bg-[#444444]"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : addresses.length === 0 ? (
              <div className="bg-gradient-to-br from-[#333333] to-[#2a2a2a] rounded-xl p-12 border border-[#444444] text-center">
                <MapPin className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">No addresses saved</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div
                    key={address.id || address._id}
                    className="bg-gradient-to-br from-[#333333] to-[#2a2a2a] rounded-xl p-6 border border-[#444444] hover:border-[#AE876D]/50 transition-all"
                  >
                    {(address.isDefault || address.is_default) && (
                      <span className="inline-block bg-[#AE876D] text-white text-xs px-3 py-1 rounded-full mb-3">
                        Default
                      </span>
                    )}
                    <div className="text-white mb-4">
                      <p className="font-semibold text-lg mb-1">{address.name}</p>
                      {address.phone && (
                        <p className="text-white/60 text-sm mb-1">Phone: {address.phone}</p>
                      )}
                      <p className="text-white/70 text-sm">
                        {address.line1}
                        {address.line2 && `, ${address.line2}`}
                      </p>
                      <p className="text-white/70 text-sm">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#AE876D] text-[#AE876D] hover:bg-[#AE876D]/10"
                        onClick={() => {
                          const addressId = address.id || address._id;
                          if (!addressId) {
                            toast({ variant: "destructive", title: "Error", description: "Address ID not found" });
                            return;
                          }
                          setEditingAddressId(addressId);
                          setAddressForm({
                            name: address.name,
                            phone: address.phone || "",
                            line1: address.line1,
                            line2: address.line2 || "",
                            city: address.city,
                            state: address.state,
                            pincode: address.pincode
                          });
                          setPincodeStatus('idle');
                          setPincodeMessage('');
                          setShowAddressForm(true);
                        }}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => {
                          const addressId = address.id || address._id;
                          if (addressId) {
                            handleDeleteAddress(addressId);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#444444] text-white/70 hover:bg-[#444444]"
                          onClick={() => {
                            const addressId = address.id || address._id;
                            if (addressId) {
                              handleSetDefaultAddress(addressId);
                            }
                          }}
                        >
                          Set Default
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="bg-gradient-to-br from-[#333333] to-[#2a2a2a] rounded-xl p-6 md:p-8 border border-[#444444]">
              <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#AE876D]" />
                Change Password
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-[#222222] border-[#444444] text-white focus:border-[#AE876D]"
                    disabled={passwordLoading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-[#222222] border-[#444444] text-white focus:border-[#AE876D]"
                    disabled={passwordLoading}
                    required
                    minLength={8}
                  />
                  {newPassword && validatePassword(newPassword) && (
                    <p className="text-xs text-red-400 mt-1">{validatePassword(newPassword)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#222222] border-[#444444] text-white focus:border-[#AE876D]"
                    disabled={passwordLoading}
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#AE876D] to-[#8d6c58] hover:from-[#8d6c58] hover:to-[#AE876D] text-white w-full md:w-auto"
                  disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                >
                  {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
