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
import { Users as UsersIcon, UserCheck, UserX, Mail, Calendar, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  _id: string;
  username: string;
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
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/70">Active Users</CardTitle>
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{chartData[0].value}</div>
            <p className="text-sm text-emerald-400 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/70">Blocked Users</CardTitle>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <UserX className="w-4 h-4 text-red-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{chartData[1].value}</div>
            <p className="text-sm text-red-400 mt-1">Account suspended</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/70">Total Users</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <UsersIcon className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{pagination.total}</div>
            <p className="text-sm text-blue-400 mt-1">All registered</p>
          </CardContent>
        </Card>
      </div>

      {/* User Statistics Chart */}
      <Card className="bg-[#1A1A1A] border-[#333333]">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" tick={{ fill: '#888' }} />
                <YAxis tick={{ fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#222', 
                    border: '1px solid #333', 
                    borderRadius: '8px',
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
      <Card className="bg-[#1A1A1A] border-[#333333]">
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
                <Card key={user._id} className="bg-[#222222] border-[#333333] hover:border-white/10 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* User Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                            {user.username}
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
                          onClick={() => toggleUserStatus(user._id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            user.isBlocked 
                              ? 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white' 
                              : 'bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white'
                          }`}
                        >
                          {user.isBlocked ? 'Unblock User' : 'Block User'}
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
            <div className="mt-6 pt-6 border-t border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-white/60">
                Showing <span className="text-white font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>-
                <span className="text-white font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="text-white font-medium">{pagination.total}</span> users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    pagination.page === 1
                      ? 'bg-[#222222] text-white/30 cursor-not-allowed'
                      : 'bg-[#222222] text-white hover:bg-[#2A2A2A]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    pagination.page === pagination.pages
                      ? 'bg-[#222222] text-white/30 cursor-not-allowed'
                      : 'bg-[#222222] text-white hover:bg-[#2A2A2A]'
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
    </div>
  );
} 