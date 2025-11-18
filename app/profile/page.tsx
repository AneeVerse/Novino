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
  _id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const TRACKING_PREVIEW_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_TRACKING_PREVIEW !== "false";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [user, setUser] = useState<{
    username: string;
    email: string;
    name?: string;
    userId?: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shipments, setShipments] = useState<Record<string, Shipment>>({});
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [shipmentError, setShipmentError] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState(searchParams?.get('tab') || 'profile');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: ""
  });
  
  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          
          // Fetch orders and addresses
          fetchOrders();
          fetchAddresses();
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);
  
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
  
  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
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
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      }
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
    if (!addressForm.name || !addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all required fields" });
      return;
    }
    
    try {
      const url = editingAddressId ? `/api/addresses/${editingAddressId}` : '/api/addresses';
      const method = editingAddressId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm)
      });
      
      if (res.ok) {
        toast({ title: "Success", description: editingAddressId ? "Address updated" : "Address added" });
        fetchAddresses();
        setShowAddressForm(false);
        setEditingAddressId(null);
        setAddressForm({ name: "", line1: "", line2: "", city: "", state: "", pincode: "" });
      } else {
        toast({ variant: "destructive", title: "Failed", description: "Could not save address" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Network error" });
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
  const getOrderStatusBadge = (status: string) => {
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
  
  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      refunded: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.pending}`}>
        {status === 'pending' && 'COD - Pending'}
        {status === 'paid' && 'Paid'}
        {status === 'failed' && 'Failed'}
        {status === 'refunded' && 'Refunded'}
      </span>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2D2D2D] to-[#1a1a1a] pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#AE876D]/10 to-transparent rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-r from-[#333333] to-[#2a2a2a] rounded-2xl p-6 md:p-8 border border-[#AE876D]/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#AE876D] to-[#8d6c58] flex items-center justify-center text-white font-bold text-xl">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  My Account
                </h1>
                <p className="text-white/60">Welcome back, {user.username}!</p>
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
          <TabsList className="bg-[#333333] border border-[#444444] p-1.5 rounded-xl flex-wrap h-auto gap-2">
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


          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-gradient-to-br from-[#333333] to-[#2a2a2a] rounded-xl p-6 md:p-8 border border-[#444444] shadow-xl">
              <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
                <User className="w-6 h-6 text-[#AE876D]" />
                Profile Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Username</label>
                  <Input
                    type="text"
                    value={user?.username || ""}
                    disabled
                    className="bg-[#222222] border-[#444444] text-white cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Email</label>
                  <Input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-[#222222] border-[#444444] text-white cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Name</label>
                  <Input
                    type="text"
                    value={user?.name || "Not set"}
                    disabled
                    className="bg-[#222222] border-[#444444] text-white/60 cursor-not-allowed"
                  />
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
                            {getOrderStatusBadge(order.orderStatus)}
                            {getPaymentStatusBadge(order.paymentStatus)}
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
                          {order.deliveryAddress.name}<br />
                          {order.deliveryAddress.line1}
                          {order.deliveryAddress.line2 && `, ${order.deliveryAddress.line2}`}<br />
                          {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
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
                        {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Order
                          </Button>
                        )}
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
                            {new Date(selectedOrder.orderedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-white/60" />
                            <span className="text-sm text-white/60">Order Status</span>
                          </div>
                          {getOrderStatusBadge(selectedOrder.orderStatus)}
                        </div>
                      </div>

                      {shipmentError && <p className="text-sm text-red-400">{shipmentError}</p>}

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
                                {selectedOrder.paymentStatus}
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
                          <p className="text-white font-medium">{selectedOrder.deliveryAddress.name}</p>
                          <p className="text-white/70">
                            {selectedOrder.deliveryAddress.line1}
                            {selectedOrder.deliveryAddress.line2 && (
                              <>
                                <br />
                                {selectedOrder.deliveryAddress.line2}
                              </>
                            )}
                            <br />
                            {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} -{' '}
                            {selectedOrder.deliveryAddress.pincode}
                          </p>
                          {selectedOrder.deliveryAddress.phone && (
                            <p className="text-white/60">Phone: {selectedOrder.deliveryAddress.phone}</p>
                          )}
                          {selectedOrder.deliveryAddress.email && (
                            <p className="text-white/60">Email: {selectedOrder.deliveryAddress.email}</p>
                          )}
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
                              {new Date(selectedOrder.orderedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
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
                              statusText={selectedShipment.status || selectedOrder.orderStatus}
                              summaryLabel={selectedShipment.status || 'Your parcel is on the way'}
                              meta={{
                                deliveryType:
                                  selectedOrder.orderStatus === 'shipped' || selectedOrder.orderStatus === 'delivered'
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
                                  label: selectedOrder.deliveryAddress.city,
                                  detail: `${selectedOrder.deliveryAddress.state} · ${selectedOrder.deliveryAddress.pincode}`,
                                },
                              ]}
                              shipper={{
                                name: selectedShipment.courierName || 'Courier partner',
                                role: selectedShipment.status || 'Logistics partner',
                                rating: 4.8,
                                phone: selectedOrder.deliveryAddress.phone,
                                whatsappUrl: selectedOrder.deliveryAddress.phone
                                  ? `https://wa.me/91${selectedOrder.deliveryAddress.phone.replace(/\D/g, '')}`
                                  : undefined,
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
                                courierName: selectedOrder.orderStatus === 'shipped' ? 'Express Partner' : 'Nimbus Express',
                                statusText: selectedOrder.orderStatus || 'Processing',
                                summaryLabel: 'Preview · shipment card',
                                meta: {
                                  deliveryType:
                                    selectedOrder.orderStatus === 'shipped' || selectedOrder.orderStatus === 'delivered'
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
                                    label: selectedOrder.deliveryAddress.line1,
                                    detail: selectedOrder.deliveryAddress.city,
                                  },
                                  {
                                    label: `${selectedOrder.deliveryAddress.city}, ${selectedOrder.deliveryAddress.state}`,
                                    detail: selectedOrder.deliveryAddress.pincode,
                                  },
                                ],
                                shipper: {
                                  name: selectedOrder.deliveryAddress.name,
                                  role: 'Preview courier',
                                  rating: 4.9,
                                  phone: selectedOrder.deliveryAddress.phone,
                                  whatsappUrl: selectedOrder.deliveryAddress.phone
                                    ? `https://wa.me/91${selectedOrder.deliveryAddress.phone.replace(/\D/g, '')}`
                                    : undefined,
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
                    setAddressForm({ name: "", line1: "", line2: "", city: "", state: "", pincode: "" });
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
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/70">Pincode *</label>
                      <Input
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                        className="bg-[#222222] border-[#444444] text-white focus:border-[#AE876D]"
                        placeholder="000000"
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
                        setAddressForm({ name: "", line1: "", line2: "", city: "", state: "", pincode: "" });
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
                    key={address._id}
                    className="bg-gradient-to-br from-[#333333] to-[#2a2a2a] rounded-xl p-6 border border-[#444444] hover:border-[#AE876D]/50 transition-all"
                  >
                    {address.isDefault && (
                      <span className="inline-block bg-[#AE876D] text-white text-xs px-3 py-1 rounded-full mb-3">
                        Default
                      </span>
                    )}
                    <div className="text-white mb-4">
                      <p className="font-semibold text-lg mb-1">{address.name}</p>
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
                          setEditingAddressId(address._id);
                          setAddressForm({
                            name: address.name,
                            line1: address.line1,
                            line2: address.line2 || "",
                            city: address.city,
                            state: address.state,
                            pincode: address.pincode
                          });
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
                        onClick={() => handleDeleteAddress(address._id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#444444] text-white/70 hover:bg-[#444444]"
                          onClick={() => handleSetDefaultAddress(address._id)}
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
