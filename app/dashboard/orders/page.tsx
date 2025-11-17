"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Search, Filter, X, MapPin, CreditCard, Truck, User, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shippingCost?: number;
  deliveryAddress: {
    name: string;
    line1?: string;
    line2?: string;
    email?: string;
    phone?: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderedAt: string;
  shipment?: {
    shiprocketOrderId: number;
    shiprocketShipmentId: number;
    courierName?: string;
    awbCode?: string;
    status: string;
    trackingUrl?: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return 'N/A';
    return phone.replace(/(\d{5})(\d{5})/, 'xxxxx $2');
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'new' || statusLower === 'processing' || statusLower === 'confirmed') {
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
    if (statusLower === 'shipped') {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
    if (statusLower === 'delivered') {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
    if (statusLower === 'cancelled') {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.phone?.includes(searchTerm) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || order.orderStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-white/60 text-sm">
            {filteredOrders.length} Order{filteredOrders.length !== 1 ? 's' : ''} 
            {statusFilter !== 'All' && ` (${statusFilter})`}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[#222222] rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Email, Phone, Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-md text-white placeholder-white/40 focus:outline-none focus:border-[#A47E3B]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-white/40 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-md text-white focus:outline-none focus:border-[#A47E3B]"
            >
              <option value="All">All</option>
              <option value="New">New</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#222222] rounded-lg overflow-hidden border border-[#333333]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1A1A1A] border-b border-[#333333]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Order Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Package</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Pickup Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-white/60">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-[#1A1A1A] transition-colors">
                      {/* Order Details */}
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-white">{order.orderNumber}</div>
                          <div className="text-white/60 text-xs mt-1">
                            {formatDate(order.orderedAt)}
                          </div>
                          {order.shipment?.shiprocketOrderId && (
                            <div className="text-white/40 text-xs mt-1">
                              SR: {order.shipment.shiprocketOrderId}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-white">{order.deliveryAddress.name}</div>
                          <div className="text-white/60 text-xs mt-1">
                            {order.deliveryAddress.email || 'N/A'}
                          </div>
                          <div className="text-white/60 text-xs mt-1">
                            {formatPhone(order.deliveryAddress.phone)}
                          </div>
                        </div>
                      </td>

                      {/* Product Details */}
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          {order.items.map((item, idx) => (
                            <div key={idx} className={idx > 0 ? 'mt-2' : ''}>
                              <div className="font-medium text-white">{item.name}</div>
                              <div className="text-white/60 text-xs mt-1">
                                SKU: {item.productId.slice(-10)}
                              </div>
                              <div className="text-white/60 text-xs">
                                Qty: {item.quantity}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Package Details */}
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="text-white/60">Weight: 0.5 Kg</div>
                          <div className="text-white/60 text-xs mt-1">10 x 10 x 5 (cm)</div>
                          <div className="text-white/60 text-xs mt-1">Vol: 0.100 Kg</div>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-white">₹{order.total.toFixed(2)}</div>
                          <div className={`text-xs mt-1 capitalize ${
                            order.paymentStatus === 'paid' ? 'text-green-400' : 
                            order.paymentStatus === 'pending' ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {order.paymentMethod === 'razorpay' ? 'Prepaid' : order.paymentMethod.toUpperCase()}
                          </div>
                          <div className="text-white/60 text-xs mt-1 capitalize">
                            {order.paymentStatus}
                          </div>
                        </div>
                      </td>

                      {/* Pickup Address */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-white/60">
                          work
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus.toUpperCase()}
                        </span>
                        {order.shipment?.awbCode && (
                          <div className="text-white/60 text-xs mt-1">
                            AWB: {order.shipment.awbCode}
                          </div>
                        )}
                        {order.shipment?.courierName && (
                          <div className="text-white/60 text-xs mt-1">
                            {order.shipment.courierName}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          {order.shipment?.trackingUrl && (
                            <a
                              href={order.shipment.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-3 py-1.5 bg-[#A47E3B] hover:bg-[#8d6c58] text-white rounded-md transition-colors text-center"
                            >
                              Track
                            </a>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsModalOpen(true);
                            }}
                            className="text-xs px-3 py-1.5 border border-[#333333] hover:bg-[#1A1A1A] text-white rounded-md transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-white/60 text-sm">
            <div>Items per page: 15 Orders</div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-[#333333] rounded hover:bg-[#222222]">
                ← PREV
              </button>
              <span className="px-3 py-1 bg-[#A47E3B] text-white rounded">1</span>
              <button className="px-3 py-1 border border-[#333333] rounded hover:bg-[#222222]">
                NEXT →
              </button>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#222222] border-[#333333] text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Order Details - {selectedOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6 mt-4">
                {/* Order Status & Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/60">Order Date</span>
                    </div>
                    <p className="text-white font-medium">{formatDate(selectedOrder.orderedAt)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/60">Order Status</span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.orderStatus)}`}>
                      {selectedOrder.orderStatus.toUpperCase()}
                    </span>
                  </div>
                  {selectedOrder.shipment?.shiprocketOrderId && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/60">Shiprocket Order ID</span>
                      </div>
                      <p className="text-white font-medium">{selectedOrder.shipment.shiprocketOrderId}</p>
                    </div>
                  )}
                  {selectedOrder.shipment?.awbCode && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/60">AWB Code</span>
                      </div>
                      <p className="text-white font-medium">{selectedOrder.shipment.awbCode}</p>
                    </div>
                  )}
                </div>

                {/* Products */}
                <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                  <h3 className="text-lg font-semibold mb-4 text-white">Products</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-[#222222] rounded-lg border border-[#333333]">
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-[#333333]">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.png';
                            }}
                          />
                        </div>
                        <div className="flex-1">
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer & Delivery Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-[#A47E3B]" />
                      <h3 className="text-lg font-semibold text-white">Customer Details</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-white/60">Name:</span>
                        <p className="text-white font-medium mt-1">{selectedOrder.deliveryAddress.name}</p>
                      </div>
                      <div>
                        <span className="text-white/60">Email:</span>
                        <p className="text-white font-medium mt-1">{selectedOrder.deliveryAddress.email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-white/60">Phone:</span>
                        <p className="text-white font-medium mt-1">{selectedOrder.deliveryAddress.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-[#A47E3B]" />
                      <h3 className="text-lg font-semibold text-white">Delivery Address</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-white/60">Name:</span>
                        <p className="text-white font-medium mt-1">{selectedOrder.deliveryAddress.name}</p>
                      </div>
                      <div>
                        <span className="text-white/60">Address:</span>
                        <p className="text-white font-medium mt-1">
                          {selectedOrder.deliveryAddress.line1 || 'N/A'}
                          {selectedOrder.deliveryAddress.line2 && (
                            <>, {selectedOrder.deliveryAddress.line2}</>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-white/60">City, State, Pincode:</span>
                        <p className="text-white font-medium mt-1">
                          {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & Shipping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-[#A47E3B]" />
                      <h3 className="text-lg font-semibold text-white">Payment Information</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Subtotal:</span>
                        <span className="text-white font-medium">₹{selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">GST:</span>
                        <span className="text-white font-medium">₹{((selectedOrder.total - selectedOrder.subtotal) || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Shipping:</span>
                        <span className="text-white font-medium">₹{(selectedOrder.shippingCost || 0).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-[#333333] pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="text-white font-semibold">Total:</span>
                          <span className="text-white font-bold text-lg">₹{selectedOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#333333]">
                        <div>
                          <span className="text-white/60">Payment Method:</span>
                          <p className={`text-sm font-medium mt-1 capitalize ${
                            selectedOrder.paymentStatus === 'paid' ? 'text-green-400' : 
                            selectedOrder.paymentStatus === 'pending' ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {selectedOrder.paymentMethod === 'razorpay' ? 'Prepaid (Razorpay)' : selectedOrder.paymentMethod.toUpperCase()}
                          </p>
                        </div>
                        <div className="mt-2">
                          <span className="text-white/60">Payment Status:</span>
                          <p className={`text-sm font-medium mt-1 capitalize ${
                            selectedOrder.paymentStatus === 'paid' ? 'text-green-400' : 
                            selectedOrder.paymentStatus === 'pending' ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {selectedOrder.paymentStatus}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                    <div className="flex items-center gap-2 mb-4">
                      <Truck className="w-5 h-5 text-[#A47E3B]" />
                      <h3 className="text-lg font-semibold text-white">Shipping Information</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-white/60">Pickup Address:</span>
                        <p className="text-white font-medium mt-1">work</p>
                      </div>
                      {selectedOrder.shipment ? (
                        <>
                          <div>
                            <span className="text-white/60">Shiprocket Order ID:</span>
                            <p className="text-white font-medium mt-1">{selectedOrder.shipment.shiprocketOrderId}</p>
                          </div>
                          <div>
                            <span className="text-white/60">Shipment ID:</span>
                            <p className="text-white font-medium mt-1">{selectedOrder.shipment.shiprocketShipmentId}</p>
                          </div>
                          {selectedOrder.shipment.courierName && (
                            <div>
                              <span className="text-white/60">Courier:</span>
                              <p className="text-white font-medium mt-1">{selectedOrder.shipment.courierName}</p>
                            </div>
                          )}
                          {selectedOrder.shipment.awbCode && (
                            <div>
                              <span className="text-white/60">AWB Code:</span>
                              <p className="text-white font-medium mt-1">{selectedOrder.shipment.awbCode}</p>
                            </div>
                          )}
                          {selectedOrder.shipment.trackingUrl && (
                            <div className="mt-4">
                              <a
                                href={selectedOrder.shipment.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-4 py-2 bg-[#A47E3B] hover:bg-[#8d6c58] text-white rounded-md transition-colors text-sm font-medium"
                              >
                                Track Shipment
                              </a>
                            </div>
                          )}
                          <div>
                            <span className="text-white/60">Shipment Status:</span>
                            <p className="text-white font-medium mt-1 capitalize">{selectedOrder.shipment.status}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-white/60">No shipment information available yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
