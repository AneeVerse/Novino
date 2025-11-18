"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data - will be replaced with real API calls
const stats = [
  {
    title: "Customers",
    value: "685",
    change: "+1%",
    icon: Users,
    color: "text-white",
    bgColor: "bg-[#222222]",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    title: "Conversions",
    value: "1,040",
    change: "+2%",
    icon: TrendingUp,
    color: "text-white",
    bgColor: "bg-[#222222]",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
  },
  {
    title: "Revenue",
    value: "$430,180",
    change: "+9%",
    icon: DollarSign,
    color: "text-white",
    bgColor: "bg-[#222222]",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-400",
  },
  {
    title: "Orders",
    value: "289",
    change: "+9%",
    icon: ShoppingCart,
    color: "text-white",
    bgColor: "bg-[#222222]",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-400",
  },
];

const chartData = [
  { name: "Nov 4", value: 400 },
  { name: "Nov 5", value: 300 },
  { name: "Nov 6", value: 500 },
  { name: "Nov 7", value: 450 },
  { name: "Nov 8", value: 600 },
  { name: "Nov 9", value: 550 },
  { name: "Nov 10", value: 700 },
  { name: "Nov 11", value: 650 },
  { name: "Nov 12", value: 800 },
  { name: "Nov 13", value: 750 },
  { name: "Nov 14", value: 900 },
  { name: "Nov 15", value: 850 },
  { name: "Nov 16", value: 950 },
  { name: "Nov 17", value: 1000 },
  { name: "Nov 18", value: 1050 },
];

const recentSales = [
  {
    id: "#4596",
    date: "Nov 18, 04:06",
    status: "paid",
    email: "ethan.harris@example.com",
    amount: "€758.00",
  },
  {
    id: "#4598",
    date: "Nov 17, 22:06",
    status: "refunded",
    email: "emma.davis@example.com",
    amount: "€735.00",
  },
  {
    id: "#4600",
    date: "Nov 17, 21:06",
    status: "refunded",
    email: "mia.white@example.com",
    amount: "€826.00",
  },
  {
    id: "#4599",
    date: "Nov 17, 16:06",
    status: "refunded",
    email: "mia.white@example.com",
    amount: "€241.00",
  },
  {
    id: "#4597",
    date: "Nov 17, 00:06",
    status: "failed",
    email: "mia.white@example.com",
    amount: "€269.00",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-500/20 text-green-400";
    case "refunded":
      return "bg-gray-500/20 text-gray-400";
    case "failed":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

export default function DashboardV2Home() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Home</h1>
        <p className="text-white/60 mt-1">Nov 4, 2025 - Nov 18, 2025 (daily)</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border border-[#333333] bg-[#1A1A1A]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-white/60 uppercase">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2.5 ${stat.iconBg} rounded-lg ring ring-inset ring-primary/25`}>
                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0">
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card className="border border-[#333333] bg-[#1A1A1A]">
        <CardHeader>
          <CardTitle className="text-white">Revenue</CardTitle>
          <CardDescription className="text-white/60">---</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A47E3B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A47E3B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis dataKey="name" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#222222",
                  border: "1px solid #333333",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#A47E3B"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Sales Table */}
      <Card className="border border-[#333333] bg-[#1A1A1A]">
        <CardHeader>
          <CardTitle className="text-white">Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#333333] hover:bg-[#222222]">
                <TableHead className="text-white/70">ID</TableHead>
                <TableHead className="text-white/70">Date</TableHead>
                <TableHead className="text-white/70">Status</TableHead>
                <TableHead className="text-white/70">Email</TableHead>
                <TableHead className="text-right text-white/70">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales.map((sale) => (
                <TableRow key={sale.id} className="border-[#333333] hover:bg-[#222222]">
                  <TableCell className="font-medium text-white">{sale.id}</TableCell>
                  <TableCell className="text-white/70">{sale.date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                  </TableCell>
                  <TableCell className="text-white/70">{sale.email}</TableCell>
                  <TableCell className="text-right font-medium text-white">{sale.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

