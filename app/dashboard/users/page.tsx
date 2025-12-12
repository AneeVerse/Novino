"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Users as UsersIcon, UserCheck, UserX, Mail, Calendar, Shield, ChevronLeft, ChevronRight, Eye, ShoppingCart, Package as PackageIcon, X } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

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
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  orderedAt: string;
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

interface UserDetails {
  orders: Order[];
  cart: {
    items: CartItem[];
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [chartData, setChartData] = useState([
    { name: 'Active', value: 0, fill: '#4CAF50' },
    { name: 'Blocked', value: 0, fill: '#F44336' }
  ]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const router = useRouter();
  const { getAuthToken } = useAuth();
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        const res = await fetch(`/api/users?page=${pagination.page}&limit=${pagination.limit}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
        
        // Update chart data
        const activeUsers = data.users.filter((user: User) => !user.isBlocked).length;
        const blockedUsers = data.users.filter((user: User) => user.isBlocked).length;
        
        setChartData([
          { name: 'Active', value: activeUsers, fill: '#4CAF50' },
          { name: 'Blocked', value: blockedUsers, fill: '#F44336' }
        ]);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [pagination.page, pagination.limit, getAuthToken]);
  
  // Toggle user status (block/unblock)
  const toggleUserStatus = async (userId: string) => {
    try {
      const token = getAuthToken();
      
      const res = await fetch(`/api/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to update user status');
      }
      
      // Update local user state
      setUsers(users.map(user => {
        if (user._id === userId) {
          return { ...user, isBlocked: !user.isBlocked };
        }
        return user;
      }));
      
      // Update chart data
      const activeUsers = users.filter(user => !user.isBlocked).length;
      const blockedUsers = users.filter(user => user.isBlocked).length;
      
      setChartData([
        { name: 'Active', value: activeUsers, fill: '#4CAF50' },
        { name: 'Blocked', value: blockedUsers, fill: '#F44336' }
      ]);
      
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Fetch user details (orders and cart)
  const fetchUserDetails = async (userId: string) => {
    try {
      setLoadingDetails(true);
      const token = getAuthToken();

      // Fetch orders
      const ordersRes = await fetch(`/api/admin/orders?userId=${userId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      // Fetch cart
      const cartRes = await fetch(`/api/admin/cart?userId=${userId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (ordersRes.ok && cartRes.ok) {
        const ordersData = await ordersRes.json();
        const cartData = await cartRes.json();

        setUserDetails({
          orders: ordersData.orders || [],
          cart: cartData.cart || { items: [] }
        });
      }
    } catch (err: any) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle view user details
  const handleViewDetails = async (user: User) => {
    setSelectedUser(user);
    await fetchUserDetails(user._id);
  };

  // Close details modal
  const closeDetails = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
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
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'processing':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'shipped':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'delivered':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const userStatCards = [
    {
      title: 'Active Users',
      value: chartData[0]?.value ?? 0,
      description: 'Currently active',
      icon: UserCheck,
      iconBg: 'bg-emerald-500/15 border border-emerald-500/30',
      iconColor: 'text-emerald-300',
      descriptionClass: 'text-emerald-300',
    },
    {
      title: 'Blocked Users',
      value: chartData[1]?.value ?? 0,
      description: 'Account suspended',
      icon: UserX,
      iconBg: 'bg-rose-500/15 border border-rose-500/30',
      iconColor: 'text-rose-300',
      descriptionClass: 'text-rose-300',
    },
    {
      title: 'Total Users',
      value: pagination.total,
      description: 'All registered',
      icon: UsersIcon,
      iconBg: 'bg-sky-500/15 border border-sky-500/30',
      iconColor: 'text-sky-300',
      descriptionClass: 'text-sky-300',
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-white/60">Manage and monitor user accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-white/10 text-white border-0 text-base px-4 py-2">
            <UsersIcon className="w-4 h-4 mr-2" />
            {pagination.total} Total Users
          </Badge>
        </div>
      </div>
      
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="py-4">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userStatCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40 hover:border-white/15 transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-semibold text-white tracking-tight">{stat.value}</div>
                <p className={`text-sm mt-2 ${stat.descriptionClass}`}>{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Statistics Chart */}
      <Card className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40">
        <CardHeader>
          <CardTitle className="text-white">User Statistics</CardTitle>
          <CardDescription className="text-white/60">Distribution of user statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="name" tick={{ fill: '#A0A0A0' }} axisLine={{ stroke: '#2a2a2a' }} tickLine={false} />
                <YAxis tick={{ fill: '#A0A0A0' }} axisLine={{ stroke: '#2a2a2a' }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C1C1C', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Users List */}
      <Card className="bg-[#111111] border border-white/5 rounded-2xl shadow-lg shadow-black/40">
        <CardHeader>
          <CardTitle className="text-white">All Users</CardTitle>
          <CardDescription className="text-white/60">
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/50">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user._id} className="bg-[#141414] border border-white/5 hover:border-white/20 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* User Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                            {user.name || 'Unknown User'}
                            {!user.isBlocked && (
                              <Shield className="w-4 h-4 text-emerald-400" />
                            )}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <div className="flex items-center text-sm text-white/60">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                            <div className="flex items-center text-sm text-white/60">
                              <Calendar className="w-3 h-3 mr-1" />
                              Joined {formatDate(user.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center gap-3">
                        <Badge className={`${
                          user.isBlocked 
                            ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        } border`}>
                          {user.isBlocked ? (
                            <><UserX className="w-3 h-3 mr-1" /> Blocked</>
                          ) : (
                            <><UserCheck className="w-3 h-3 mr-1" /> Active</>
                          )}
                        </Badge>
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-white/15 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/40 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user._id)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            user.isBlocked 
                              ? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 hover:text-white' 
                              : 'border-rose-500/40 text-rose-300 hover:bg-rose-500/20 hover:text-white'
                          }`}
                        >
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-white/60">
                Showing <span className="text-white font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>-
                <span className="text-white font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="text-white font-medium">{pagination.total}</span> users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
                    pagination.page === 1
                      ? 'bg-white/5 text-white/30 border-white/5 cursor-not-allowed'
                      : 'bg-white/5 text-white border-white/15 hover:bg-white/10 hover:border-white/40'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
                    pagination.page === pagination.pages
                      ? 'bg-white/5 text-white/30 border-white/5 cursor-not-allowed'
                      : 'bg-white/5 text-white border-white/15 hover:bg-white/10 hover:border-white/40'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0F0F0F] border-b border-white/5 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {selectedUser.name || 'Unknown User'}
                </h2>
                <p className="text-white/60 mt-1">{selectedUser.email}</p>
              </div>
              <button
                onClick={closeDetails}
                className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Orders Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <PackageIcon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">Orders ({userDetails?.orders.length || 0})</h3>
                  </div>
                  
                  {!userDetails?.orders || userDetails.orders.length === 0 ? (
                  <Card className="bg-[#141414] border border-white/5">
                      <CardContent className="py-12 text-center">
                        <PackageIcon className="w-16 h-16 mx-auto mb-4 text-white/20" />
                        <p className="text-white/50">No orders yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {userDetails.orders.map((order) => (
                        <Card key={order._id} className="bg-[#141414] border border-white/5 hover:border-white/15 transition-all">
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-white font-semibold">{order.orderNumber}</h4>
                                  <Badge className={`${getStatusColor(order.orderStatus)} border`}>
                                    {order.orderStatus}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-white/60">
                                    <span className="font-medium">Total:</span> {formatCurrency(order.total)}
                                  </div>
                                  <div className="text-white/60">
                                    <span className="font-medium">Payment:</span> {order.paymentMethod.toUpperCase()}
                                  </div>
                                  <div className="text-white/60">
                                    <span className="font-medium">Items:</span> {order.items.length}
                                  </div>
                                  <div className="text-white/60">
                                    <span className="font-medium">Date:</span> {formatDate(order.orderedAt)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {order.items.slice(0, 3).map((item, idx) => (
                                  <img
                                    key={idx}
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                ))}
                                {order.items.length > 3 && (
                                  <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center text-white/60 text-xs">
                                    +{order.items.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl font-bold text-white">Current Cart ({userDetails?.cart.items.length || 0} items)</h3>
                  </div>
                  
                  {!userDetails?.cart.items || userDetails.cart.items.length === 0 ? (
                    <Card className="bg-[#141414] border border-white/5">
                      <CardContent className="py-12 text-center">
                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-white/20" />
                        <p className="text-white/50">Cart is empty</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {userDetails.cart.items.map((item, index) => (
                        <Card key={index} className="bg-[#141414] border border-white/5 hover:border-white/15 transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="text-white font-medium">{item.name}</h4>
                                {item.variant && (
                                  <p className="text-white/60 text-sm mt-1">{item.variant}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="text-white/60">Qty: <span className="text-white font-medium">{item.quantity}</span></span>
                                  <span className="text-white/60">
                                    Added: <span className="text-white">{formatDate(item.addedAt)}</span>
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-semibold text-lg">
                                  {typeof item.price === 'number' 
                                    ? formatCurrency(item.price * item.quantity)
                                    : item.price}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 