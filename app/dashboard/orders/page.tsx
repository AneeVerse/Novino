"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RefreshCw, Search, Calendar, X, Truck, Clock, Star, MoreVertical, ExternalLink } from "lucide-react";
import { SkuBadge } from "@/components/sku-generator";

interface OrderItem {
  name?: string;
  sku?: string;
  units?: number;
  selling_price?: number;
  product_image?: string;
}

interface Order {
  id: number;
  order_id: string;
  channel_order_id?: string;
  order_date?: string;
  created_at?: string;
  billing_customer_name: string;
  billing_email: string;
  billing_phone: string;
  billing_city?: string;
  billing_state?: string;
  billing_pincode?: string;
  billing_address?: string;
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  total?: number;
  status: string;
  order_items: OrderItem[];
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
  pickup_location?: string;
  awb_code?: string;
  courier_name?: string;
  localOrderId?: string;
  shiprocketShipmentId?: number;
}

interface Courier {
  id: number;
  name: string;
  rate: number;
  total_rate?: number;
  estimated_delivery_days: number | string;
  freight_charge: number;
  cod_charges: number;
  rating: number;
  chargeable_weight?: number;
  fuel_surcharge?: number;
  rto_charges?: number;
  pickup_date?: string;
  delivery_type?: string;
}

const TABS = [
  { label: 'New', value: 'NEW' },
  { label: 'Ready To Ship', value: 'READY TO SHIP' },
  { label: 'Pickups & Manifests', value: 'PICKUP' },
  { label: 'In Transit', value: 'IN TRANSIT' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'RTO', value: 'RTO' },
  { label: 'All', value: 'ALL' },
];

// Helper function to safely format dates from Shiprocket API
const formatOrderDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'N/A';

  try {
    // Try parsing as ISO date first
    let date = new Date(dateStr);

    // If invalid, try parsing other common formats
    if (isNaN(date.getTime())) {
      // Shiprocket might return dates like "2025-11-25 14:30:00" or other formats
      // Try replacing spaces with T for ISO format
      const isoLike = dateStr.replace(' ', 'T');
      date = new Date(isoLike);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format from Shiprocket:', dateStr);
      return 'Invalid Date';
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', dateStr, error);
    return 'Invalid Date';
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('NEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [shippingOrder, setShippingOrder] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Courier selection modal state
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<Order | null>(null);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [assigningCourier, setAssigningCourier] = useState(false);

  // Dropdown menu state
  const [openMenuOrderId, setOpenMenuOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuOrderId !== null) {
        setOpenMenuOrderId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuOrderId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Calculate 30-day date range to match dashboard
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const toDate = today.toISOString().slice(0, 10);
      const fromDate = thirtyDaysAgo.toISOString().slice(0, 10);

      // Request up to 200 orders with 30-day date range
      const response = await fetch(`/api/shiprocket/orders?perPage=200&from=${fromDate}&to=${toDate}`);
      const data = await response.json();

      // Debug: Log the first order to see date format
      if (data.data && data.data.length > 0) {
        console.log('First order data:', {
          order_id: data.data[0].order_id,
          order_date: data.data[0].order_date,
          created_at: data.data[0].created_at,
        });
        console.log(`Fetched ${data.data.length} orders from ${fromDate} to ${toDate}`);
      }

      setOrders(data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipNow = async (order: Order) => {
    // For now, skip the courier selection flow and take the user directly
    // to the Shiprocket "Ship Now" experience (same as the three-dot menu).
    try {
      setShippingOrder(order.localOrderId ?? null);
      await handleOpenShiprocket();
    } catch (error) {
      console.error('Ship now redirect failed:', error);
      alert('Failed to open Shiprocket. Please try again.');
    } finally {
      setShippingOrder(null);
      setShowCourierModal(false);
      setLoadingCouriers(false);
    }
  };

  const handleAssignCourier = async (courier: Courier) => {
    if (!selectedOrderForCourier?.shiprocketShipmentId) return;

    setAssigningCourier(true);

    try {
      const response = await fetch('/api/shiprocket/assign-courier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipment_id: selectedOrderForCourier.shiprocketShipmentId,
          courier_id: courier.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Success!\n\nCourier: ${result.courier_name}\nAWB: ${result.awb_code}\n\nPickup will be scheduled automatically.`);
        setShowCourierModal(false);
        fetchOrders(); // Refresh orders
      } else {
        alert(result.error || 'Failed to assign courier');
      }
    } catch (error) {
      console.error('Assign courier failed:', error);
      alert('Failed to assign courier');
    } finally {
      setAssigningCourier(false);
    }
  };

  const handleOpenShiprocket = async () => {
    try {
      // Open Shiprocket login page with auto-login
      const response = await fetch('/api/shiprocket/get-login-url');
      const data = await response.json();

      if (data.success && data.loginUrl) {
        window.open(data.loginUrl, '_blank');
      } else {
        // Fallback: open Shiprocket directly
        window.open('https://app.shiprocket.in/seller/orders/new', '_blank');
      }
    } catch (error) {
      console.error('Failed to open Shiprocket:', error);
      // Fallback: open Shiprocket directly
      window.open('https://app.shiprocket.in/seller/orders/new', '_blank');
    } finally {
      setOpenMenuOrderId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab !== 'ALL' && !order.status.toUpperCase().includes(activeTab)) {
      return false;
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        order.order_id?.toLowerCase()?.includes(search) ||
        order.channel_order_id?.toLowerCase()?.includes(search) ||
        order.billing_customer_name?.toLowerCase()?.includes(search) ||
        order.billing_email?.toLowerCase()?.includes(search) ||
        order.billing_phone?.toLowerCase()?.includes(search) ||
        false
      );
    }
    return true;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Orders</h1>
            <p className="text-sm text-white/60">Showing {filteredOrders.length} orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-6 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.value
                ? 'bg-white text-black'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-[#222222] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search by Order ID, Name, Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#222222] rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white/50">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-white/50">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1A1A1A] border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Order Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Package</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Delivery</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Pickup</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium">{order.order_id}</div>
                        <div className="text-xs text-white/50">{formatOrderDate(order.order_date || order.created_at)}</div>
                        {order.channel_order_id && (
                          <div className="text-xs text-white/30">#{order.channel_order_id}</div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm">{order.billing_customer_name}</div>
                        <div className="text-xs text-white/50">{order.billing_email}</div>
                        <div className="text-xs text-white/40">{order.billing_phone}</div>
                      </td>

                      <td className="px-4 py-4">
                        {(order.order_items || []).slice(0, 1).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {item.product_image && (
                              <Image
                                src={item.product_image}
                                alt={item.name || 'Product'}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="text-sm">{item.name || 'N/A'}</div>
                              {item.sku && <SkuBadge sku={item.sku} className="mt-1" />}
                              <div className="text-xs text-white/40 mt-1">Qty: {item.units}</div>
                            </div>
                          </div>
                        ))}
                        {(order.order_items?.length || 0) > 1 && (
                          <div className="text-xs text-white/50 mt-1">+{(order.order_items?.length || 0) - 1} more</div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-xs text-white/70">
                          <div>Dead wt: {order.weight || 0.5} kg</div>
                          <div>Size: {order.length || 30} × {order.breadth || 26} × {order.height || 10} cm</div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm font-medium">₹{order.sub_total || order.total || 0}</div>
                        <div className={`text-xs px-2 py-1 rounded inline-block mt-1 ${order.payment_method === 'Prepaid'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                          {order.payment_method}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="relative group">
                          <div className="text-xs text-white/70">
                            {order.billing_city || '—'}, {order.billing_state || '—'}
                          </div>
                          <div className="text-xs text-white/50">
                            {order.billing_pincode || order.shipping_pincode || ''}
                          </div>

                          {/* Delivery Address Tooltip */}
                          <div className="absolute left-0 top-full mt-2 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <div className="bg-white text-black p-3 rounded-lg shadow-xl min-w-[260px] text-xs leading-relaxed border border-white/40">
                              <div className="font-semibold mb-1">{order.billing_customer_name || 'Customer'}</div>
                              <div className="text-black/80">
                                {(order.billing_address || order.customer?.address || '').trim() || 'Address not available'}
                              </div>
                              <div className="text-black/80">
                                {[order.billing_city, order.billing_state, order.billing_pincode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </div>
                              <div className="mt-1 font-medium">{order.billing_phone || order.customer?.phone || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="relative group">
                          <div className="text-xs text-white/60 cursor-pointer hover:text-white/80 transition-colors">
                            {order.pickup_location || 'N/A'}
                          </div>
                          {/* Pickup Address Tooltip */}
                          <div className="absolute left-0 top-full mt-2 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <div className="bg-[#FFFDE7] text-black p-3 rounded-lg shadow-xl min-w-[250px] text-xs leading-relaxed border border-yellow-200">
                              <div className="font-semibold mb-1">{order.pickup_location || 'work'}</div>
                              <div>NOVINO INK ARTS (OPC) Pvt Ltd,</div>
                              <div>Office No.807, Mayuresh Cosmos,</div>
                              <div>Sec - 11, Plot No. 37, CBD Belapur,</div>
                              <div>Navi Mumbai - 400 614</div>
                              <div>Maharashtra-400614</div>
                              <div className="mt-1 font-medium">8655844069</div>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className={`text-xs px-3 py-1 rounded-full inline-block font-medium ${order.status.includes('NEW') ? 'bg-blue-500/20 text-blue-300' :
                          order.status.includes('DELIVERED') ? 'bg-green-500/20 text-green-300' :
                            'bg-white/10 text-white/70'
                          }`}>
                          {order.status}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleShipNow(order)}
                            disabled={shippingOrder === order.localOrderId || !!order.awb_code || !order.localOrderId}
                            className="px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                          >
                            {shippingOrder === order.localOrderId ? 'Processing...' : order.awb_code ? 'Shipped' : !order.localOrderId ? 'N/A' : 'Ship Now'}
                          </button>

                          {/* Temporary: hiding three-dot menu per request. Leaving code commented for easy restore. */}
                          {/*
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuOrderId(openMenuOrderId === order.id ? null : order.id);
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenuOrderId === order.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-10">
                                <button
                                  onClick={handleOpenShiprocket}
                                  className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 flex items-center gap-2 rounded-lg transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Open Shiprocket
                                </button>
                              </div>
                            )}
                          </div>
                          */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="text-white/60">Page {currentPage} of {totalPages} ({filteredOrders.length} orders)</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Courier Selection Modal */}
      {showCourierModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-white/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-semibold">Select Courier</h2>
                <p className="text-sm text-white/60 mt-1">Choose the best courier for this shipment</p>
              </div>
              <button
                onClick={() => setShowCourierModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loadingCouriers ? (
                <div className="py-12 text-center text-white/50">Loading available couriers...</div>
              ) : couriers.length === 0 ? (
                <div className="py-12 text-center text-white/50">No couriers available</div>
              ) : (
                <div className="space-y-3">
                  {couriers.map((courier) => (
                    <div
                      key={courier.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Truck className="w-5 h-5 text-blue-400" />
                            <h3 className="font-semibold text-lg">{courier.name}</h3>
                            {courier.rating > 0 && (
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="w-4 h-4 fill-yellow-400" />
                                <span className="text-sm">{courier.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-white/60">
                              <Clock className="w-4 h-4" />
                              <span>
                                {(courier.delivery_type || '').toString() || 'Surface'} • {courier.estimated_delivery_days} days
                              </span>
                            </div>
                            <div className="text-white/60">
                              Freight: ₹{courier.freight_charge.toFixed(2)}
                            </div>
                            {courier.chargeable_weight && (
                              <div className="text-white/60">
                                Chargeable Weight: {courier.chargeable_weight} kg
                              </div>
                            )}
                            {courier.cod_charges > 0 && (
                              <div className="text-white/60">
                                COD Charges: ₹{courier.cod_charges.toFixed(2)}
                              </div>
                            )}
                            {courier.fuel_surcharge && courier.fuel_surcharge > 0 && (
                              <div className="text-white/60">
                                Fuel Surcharge: ₹{courier.fuel_surcharge.toFixed(2)}
                              </div>
                            )}
                            {courier.rto_charges && courier.rto_charges > 0 && (
                              <div className="text-white/60">
                                RTO Charges: ₹{courier.rto_charges.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-400">
                              ₹{(courier.total_rate ?? courier.rate).toFixed(2)}
                            </div>
                            <div className="text-xs text-white/40">Total Rate</div>
                          </div>
                          <button
                            onClick={() => handleAssignCourier(courier)}
                            disabled={assigningCourier}
                            className="px-6 py-3 bg-[#6366F1] hover:bg-[#5558E3] disabled:bg-white/10 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                          >
                            {assigningCourier ? 'Assigning...' : 'Select'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

