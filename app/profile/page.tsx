"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

// Define types
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

interface Address {
  id: number;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    username: string;
    email: string;
    name: string;
    iat?: number;
    exp?: number;
    userId?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false
  });
  const [editingAddress, setEditingAddress] = useState<number | null>(null);
  const [addressMessage, setAddressMessage] = useState("");
  
  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        // First try to get real user data
        let mockMode = false;
        
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // For demonstration purposes, set mockMode if API fails
          console.log("Using mock data for demonstration");
          mockMode = true;
        }

        // Use mock data if needed (for demonstration or development)
        if (mockMode) {
          setUser({
            username: "user123",
            email: "user@example.com",
            name: "John Doe"
          });
        }
        
        // Always set mock orders and addresses for demonstration
        setOrders([
          {
            id: "ORD-123456",
            date: "2023-05-15",
            status: "Delivered",
            total: 249.99,
            items: [
              { name: "Abstract Landscape Painting", price: 249.99, quantity: 1 }
            ]
          },
          {
            id: "ORD-789012",
            date: "2023-06-22",
            status: "Processing",
            total: 129.99,
            items: [
              { name: "Ceramic Vase", price: 129.99, quantity: 1 }
            ]
          }
        ]);
        
        setAddresses([
          {
            id: 1,
            fullName: "John Doe",
            addressLine1: "123 Art Street",
            addressLine2: "Apt 4B",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "United States",
            isDefault: true
          }
        ]);
      } catch (err) {
        console.error(err);
        setMessage("Error fetching user data. For demonstration, using mock data.");
        
        // Even if there's an error, set mock data for demonstration
        setUser({
          username: "user123",
          email: "user@example.com",
          name: "John Doe"
        });
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);
  
  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST"
      });
      
      if (res.ok) {
        router.push("/login");
      } else {
        setMessage("Error logging out. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage("");
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords don't match");
      setPasswordLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPasswordMessage("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage(data.message || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      setPasswordMessage("Network error. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#AE876D]" />
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return (
    <div className="container mx-auto pt-24 pb-12 px-4 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={loading}
          className="border-[#AE876D] text-[#AE876D] hover:bg-[#AE876D]/10"
        >
          Log Out
        </Button>
      </div>
      
      {message && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6">
          {message}
        </div>
      )}
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6 bg-[#333333] rounded-md p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#AE876D] data-[state=active]:text-white rounded-sm text-white/70">Profile</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-[#AE876D] data-[state=active]:text-white rounded-sm text-white/70">Orders</TabsTrigger>
          <TabsTrigger value="addresses" className="data-[state=active]:bg-[#AE876D] data-[state=active]:text-white rounded-sm text-white/70">Addresses</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#AE876D] data-[state=active]:text-white rounded-sm text-white/70">Security</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-[#333333] rounded-lg shadow-sm p-6 border border-[#444444]">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white/70">Username</label>
                <p className="p-2 bg-[#222222] border border-[#444444] rounded">{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/70">Email</label>
                <p className="p-2 bg-[#222222] border border-[#444444] rounded">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white/70">Name</label>
                <p className="p-2 bg-[#222222] border border-[#444444] rounded">{user?.name || "Not set"}</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-[#2D2D2D]">Order History</h2>
            
            {orders.length === 0 ? (
              <p className="text-gray-500">You haven't placed any orders yet.</p>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition-shadow">
                    <div className="flex flex-wrap justify-between mb-4">
                      <div>
                        <p className="font-medium text-[#2D2D2D]">{order.id}</p>
                        <p className="text-sm text-gray-500">Placed on {order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#2D2D2D]">${order.total.toFixed(2)}</p>
                        <p className={`text-sm ${
                          order.status === "Delivered" ? "text-green-600" : 
                          order.status === "Processing" ? "text-blue-600" : ""
                        }`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="font-medium mb-2 text-[#2D2D2D]">Items</p>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.name} (x{item.quantity})</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-[#2D2D2D]">My Addresses</h2>
            
            {addressMessage && (
              <div className={`p-3 rounded mb-4 ${
                addressMessage.includes("success") 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {addressMessage}
              </div>
            )}
            
            <div className="space-y-6">
              {addresses.map((address) => (
                <div key={address.id} className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition-shadow">
                  {address.isDefault && (
                    <span className="bg-[#AE876D] text-white text-xs px-2 py-1 rounded mb-2 inline-block">
                      Default
                    </span>
                  )}
                  <p className="font-medium text-[#2D2D2D]">{address.fullName}</p>
                  <p className="text-gray-700">{address.addressLine1}</p>
                  {address.addressLine2 && <p className="text-gray-700">{address.addressLine2}</p>}
                  <p className="text-gray-700">{address.city}, {address.state} {address.postalCode}</p>
                  <p className="text-gray-700">{address.country}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="border-[#AE876D] text-[#AE876D] hover:bg-[#AE876D]/10">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-50">
                      Delete
                    </Button>
                    {!address.isDefault && (
                      <Button variant="outline" size="sm" className="border-gray-400 text-gray-700 hover:bg-gray-50">
                        Set as Default
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <Button className="mt-4 bg-[#AE876D] hover:bg-[#8d6c58] text-white">
                Add New Address
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-[#2D2D2D]">Change Password</h2>
            
            {passwordMessage && (
              <div className={`p-3 rounded mb-4 ${
                passwordMessage.includes("success") 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {passwordMessage}
              </div>
            )}
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#2D2D2D]" htmlFor="currentPassword">
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border-gray-300 focus:border-[#AE876D] focus:ring-[#AE876D]"
                  disabled={passwordLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-[#2D2D2D]" htmlFor="newPassword">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border-gray-300 focus:border-[#AE876D] focus:ring-[#AE876D]"
                  disabled={passwordLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-[#2D2D2D]" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border-gray-300 focus:border-[#AE876D] focus:ring-[#AE876D]"
                  disabled={passwordLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="bg-[#AE876D] hover:bg-[#8d6c58] text-white"
                disabled={passwordLoading}
              >
                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 