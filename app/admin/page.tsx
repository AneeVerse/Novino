"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  ShoppingCart
} from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

interface DeliveryAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  shippingCost: number;
  total: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'cod' | 'card' | 'upi' | 'wallet' | 'netbanking';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  giftWrap: boolean;
  orderedAt: string;
  user?: User;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  codOrders: number;
  onlineOrders: number;
}

interface CartItem {
  id: string | number;
  name: string;
  price: string | number;
  image: string;
  quantity: number;
  variant?: string;
  addedAt: string;
}

interface UserCart {
  userId: string;
  items: CartItem[];
  itemCount: number;
  totalItems: number;
  user: User | null;
  updatedAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'carts'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [carts, setCarts] = useState<UserCart[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedCart, setExpandedCart] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch data on mount and tab change
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else {
      fetchCarts();
    }
  }, [activeTab]);

  const fetchOrders = async (userId?: string) => {
    try {
      setLoading(true);
      const url = userId ? `/api/admin/orders?userId=${userId}` : '/api/admin/orders';
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        if (data.stats) {
          setStats(data.stats);
        }
      } else if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to access the admin panel",
        });
        router.push('/login');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch orders",
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching orders",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserOrders = (userId: string) => {
    setSelectedUserId(userId);
    fetchOrders(userId);
  };

  const handleBackToAllOrders = () => {
    setSelectedUserId(null);
    fetchOrders();
  };

  const fetchCarts = async (userId?: string) => {
    try {
      setLoading(true);
      const url = userId ? `/api/admin/cart?userId=${userId}` : '/api/admin/cart';
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (userId && data.cart) {
          // Single user cart
          setCarts([{
            userId: data.cart.userId || userId,
            items: data.cart.items || [],
            itemCount: data.cart.items?.length || 0,
            totalItems: data.cart.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0,
            user: data.user,
            updatedAt: data.cart.updatedAt || new Date().toISOString()
          }]);
        } else {
          setCarts(data.carts || []);
        }
      } else if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to access the admin panel",
        });
        router.push('/login');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch carts",
        });
      }
    } catch (error) {
      console.error('Error fetching carts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching carts",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserCart = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('carts');
    fetchCarts(userId);
  };

  const handleBackToAllCarts = () => {
    setSelectedUserId(null);
    fetchCarts();
  };

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format date helper
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400';
      case 'processing':
        return 'bg-purple-500/20 text-purple-400';
      case 'shipped':
        return 'bg-indigo-500/20 text-indigo-400';
      case 'delivered':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'refunded':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentMethod === filterPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-12 flex items-center justify-center">
        <div className="text-white text-xl">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">Manage orders and customers</p>
            </div>
            {selectedUserId && (
              <button
                onClick={activeTab === 'orders' ? handleBackToAllOrders : handleBackToAllCarts}
                className="bg-[#AE876D] hover:bg-[#8d6c58] text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Back to All {activeTab === 'orders' ? 'Orders' : 'Carts'}
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#AE876D] text-white'
                  : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333333]'
              }`}
            >
              <Package className="w-5 h-5" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('carts')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'carts'
                  ? 'bg-[#AE876D] text-white'
                  : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333333]'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              User Carts
            </button>
          </div>

          {/* Stats Cards */}
          {stats && !selectedUserId && activeTab === 'orders' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Orders</p>
                    <p className="text-white text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <Package className="w-10 h-10 text-[#AE876D]" />
                </div>
              </div>

              <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                    <p className="text-white text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-400" />
                </div>
              </div>

              <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">COD Orders</p>
                    <p className="text-white text-2xl font-bold">{stats.codOrders}</p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-400" />
                </div>
              </div>

              <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Delivered</p>
                    <p className="text-white text-2xl font-bold">{stats.deliveredOrders}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {/* Filters */}
            <div className="bg-[#2a2a2a] rounded-lg p-6 mb-6 border border-[#3a3a3a]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#AE876D]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#AE876D]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#AE876D]"
            >
              <option value="all">All Payment Methods</option>
              <option value="cod">Cash on Delivery</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="wallet">Wallet</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] overflow-hidden">
          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No orders found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#1a1a1a] border-b border-[#3a3a3a]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3a3a3a]">
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-[#222222] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{order.orderNumber}</div>
                          <div className="text-sm text-gray-400">{order.items.length} item(s)</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{order.user?.name || order.deliveryAddress.name}</div>
                          <div className="text-sm text-gray-400">{order.user?.email || ''}</div>
                          {order.user && (
                            <button
                              onClick={() => handleViewUserOrders(order.userId)}
                              className="text-xs text-[#AE876D] hover:text-[#8d6c58] mt-1 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View all orders
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{formatDate(order.orderedAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{formatCurrency(order.total)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-white capitalize">{order.paymentMethod}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                            className="text-[#AE876D] hover:text-[#8d6c58] transition-colors"
                          >
                            {expandedOrder === order._id ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Order Details */}
                      {expandedOrder === order._id && (
                        <tr>
                          <td colSpan={7} className="px-6 py-6 bg-[#1a1a1a]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Order Items */}
                              <div>
                                <h4 className="text-white font-semibold mb-3">Order Items</h4>
                                <div className="space-y-3">
                                  {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 bg-[#2a2a2a] rounded-lg p-3">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                      <div className="flex-1">
                                        <p className="text-white text-sm font-medium">{item.name}</p>
                                        {item.variant && (
                                          <p className="text-gray-400 text-xs">{item.variant}</p>
                                        )}
                                        <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                                      </div>
                                      <div className="text-white font-medium">
                                        {formatCurrency(item.price * item.quantity)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Order Summary */}
                                <div className="mt-4 bg-[#2a2a2a] rounded-lg p-4 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">{formatCurrency(order.subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">GST</span>
                                    <span className="text-white">{formatCurrency(order.gst)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Shipping</span>
                                    <span className="text-white">
                                      {order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}
                                    </span>
                                  </div>
                                  {order.giftWrap && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-400">Gift Wrap</span>
                                      <span className="text-white">Included</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-[#3a3a3a]">
                                    <span className="text-white">Total</span>
                                    <span className="text-white">{formatCurrency(order.total)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Delivery Address */}
                              <div>
                                <h4 className="text-white font-semibold mb-3">Delivery Address</h4>
                                <div className="bg-[#2a2a2a] rounded-lg p-4">
                                  <p className="text-white font-medium mb-1">{order.deliveryAddress.name}</p>
                                  <p className="text-gray-400 text-sm">{order.deliveryAddress.line1}</p>
                                  {order.deliveryAddress.line2 && (
                                    <p className="text-gray-400 text-sm">{order.deliveryAddress.line2}</p>
                                  )}
                                  <p className="text-gray-400 text-sm">
                                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                                  </p>
                                </div>

                                {/* Payment & Status Info */}
                                <div className="mt-4 space-y-3">
                                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                                    <h4 className="text-white font-semibold mb-2">Payment Information</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Method</span>
                                        <span className="text-white capitalize">{order.paymentMethod}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Payment Status</span>
                                        <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                                          {order.paymentStatus}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                                    <h4 className="text-white font-semibold mb-2">Order Status</h4>
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-400 text-sm">Current Status</span>
                                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                        {order.orderStatus}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
          </>
        )}

        {/* Carts Tab */}
        {activeTab === 'carts' && (
          <>
            {/* Carts Table */}
            <div className="bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] overflow-hidden">
              <div className="overflow-x-auto">
                {carts.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No active carts found</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-[#1a1a1a] border-b border-[#3a3a3a]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Total Quantity
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3a3a3a]">
                      {carts.map((cart) => (
                        <React.Fragment key={cart.userId}>
                          <tr className="hover:bg-[#222222] transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm text-white">{cart.user?.name || cart.user?.username || 'Unknown User'}</div>
                              <div className="text-sm text-gray-400">{cart.user?.email || ''}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{cart.itemCount} item(s)</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white">{cart.totalItems} unit(s)</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white">{formatDate(cart.updatedAt)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setExpandedCart(expandedCart === cart.userId ? null : cart.userId)}
                                className="text-[#AE876D] hover:text-[#8d6c58] transition-colors"
                              >
                                {expandedCart === cart.userId ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                          </tr>
                          
                          {/* Expanded Cart Details */}
                          {expandedCart === cart.userId && (
                            <tr>
                              <td colSpan={5} className="px-6 py-6 bg-[#1a1a1a]">
                                <h4 className="text-white font-semibold mb-3">Cart Items</h4>
                                <div className="space-y-3">
                                  {cart.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 bg-[#2a2a2a] rounded-lg p-3">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                      <div className="flex-1">
                                        <p className="text-white text-sm font-medium">{item.name}</p>
                                        {item.variant && (
                                          <p className="text-gray-400 text-xs">{item.variant}</p>
                                        )}
                                        <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                                        <p className="text-gray-400 text-xs">
                                          Added: {formatDate(item.addedAt)}
                                        </p>
                                      </div>
                                      <div className="text-white font-medium">
                                        {typeof item.price === 'number' 
                                          ? formatCurrency(item.price * item.quantity)
                                          : item.price}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
