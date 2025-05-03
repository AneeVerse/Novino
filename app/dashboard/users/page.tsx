"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
    <div className="bg-[#1A1A1A] min-h-screen text-white p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>
        
        {error && (
          <div className="bg-red-900/50 text-white p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* User Statistics Chart */}
        <div className="bg-[#222222] rounded-lg p-6 mb-8 shadow-md">
          <h2 className="text-xl font-bold mb-4">User Statistics</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" tick={{ fill: '#fff' }} />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#333', 
                    border: 'none', 
                    borderRadius: '4px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-4 space-x-8">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#4CAF50] rounded-full mr-2"></div>
              <span>Active Users: {chartData[0].value}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#F44336] rounded-full mr-2"></div>
              <span>Blocked Users: {chartData[1].value}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#AE876D] rounded-full mr-2"></div>
              <span>Total Users: {pagination.total}</span>
            </div>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-[#222222] rounded-lg overflow-hidden shadow-md">
          <div className="p-6 border-b border-[#333333]">
            <h2 className="text-xl font-bold">All Users</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#333333]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-[#2A2A2A]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isBlocked ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'
                        }`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => toggleUserStatus(user._id)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            user.isBlocked 
                              ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' 
                              : 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                          }`}
                        >
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-[#333333] flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 rounded text-sm ${
                    pagination.page === 1
                      ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                      : 'bg-[#333333] text-white hover:bg-[#444444]'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`px-3 py-1 rounded text-sm ${
                    pagination.page === pagination.pages
                      ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                      : 'bg-[#333333] text-white hover:bg-[#444444]'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 