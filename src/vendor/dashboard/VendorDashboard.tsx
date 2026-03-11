/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import {
  Bell,
  TrendingUp,
  Star,
  Clock,
  ShoppingBag,
  DollarSign,
  Users,
  ChevronRight,
} from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { Link } from "react-router-dom";
import { supabase } from "../../services/authService";

interface DashboardStats {
  totalOrders: number;
  revenue: number;
  customers: number;
  avgRating: number;
}

const VendorDashboard = () => {
  const [animateStats, setAnimateStats] = useState(false);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    revenue: 0,
    customers: 0,
    avgRating: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [popularItems, setPopularItems] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Get current vendor
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data: vendor } = await supabase
          .from("vendors")
          .select("id, business_name")
          .eq("user_id", session.user.id)
          .single();

        if (!vendor) return;
        setVendorInfo(vendor);

        // 2. Fetch Orders for Stats and Recent List
        const { data: orders } = await supabase
          .from("orders")
          .select("*")
          .eq("vendor_id", vendor.id)
          .order("created_at", { ascending: false });

        if (orders) {
          const totalRevenue = orders.reduce(
            (acc, o) => acc + (Number(o.total_amount) || 0),
            0,
          );
          const uniqueCustomers = new Set(orders.map((o) => o.customer_id))
            .size;

          // Calculate average rating from orders with ratings
          const ratedOrders = orders.filter((o) => o.rating != null);
          const avgRating =
            ratedOrders.length > 0
              ? Math.round(
                  (ratedOrders.reduce((acc, o) => acc + Number(o.rating), 0) /
                    ratedOrders.length) *
                    10,
                ) / 10
              : 0;

          setStats({
            totalOrders: orders.length,
            revenue: totalRevenue,
            customers: uniqueCustomers,
            avgRating,
          });

          // Format recent orders for UI
          setRecentOrders(
            orders.slice(0, 5).map((o) => ({
              id: `#${o.id.slice(0, 5).toUpperCase()}`,
              customer: o.customer_name || "Guest",
              item: "View Details", // You can join order_items for more detail
              time: formatTime(o.created_at),
              status: o.status || "pending",
            })),
          );
        }

        // 3. Fetch Popular Menu Items (Top 4)
        const { data: items } = await supabase
          .from("menu_items")
          .select("*")
          .eq("vendor_id", vendor.id)
          .limit(4);

        if (items) setPopularItems(items);
      } catch (error) {
        // Error fetching dashboard data
      } finally {
        setLoading(false);
        setAnimateStats(true);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper to format time strings
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    return date.toLocaleDateString();
  };

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Revenue",
      value: `₦${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Customers",
      value: stats.customers.toLocaleString(),
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Avg Rating",
      value: stats.avgRating,
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold font-inter  uppercase tracking-widest ">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-20 transition-colors duration-300">
      <VendorNav />
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="transition-all">
            <h1 className="text-2xl font-bold font-inter  tracking-tighter uppercase">
              {vendorInfo?.business_name || "My Dashboard"}
            </h1>
            <p className="text-green-100 text-sm mt-1 font-medium">
              Welcome back, Chef!
            </p>
          </div>
          <Link to="/orderhistory">
            <div className="relative group">
              <Bell className="w-6 h-6 cursor-pointer group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-green-600 rounded-full text-[10px] flex items-center justify-center font-bold">
                {recentOrders.length}
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 shadow-lg border border-transparent transition-all duration-500 transform ${
                  animateStats
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-800 font-inter">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Most Popular Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-transparent transition-all">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 font-inter  uppercase tracking-tighter">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Menu Overview
                </h2>
                <Link
                  to="/menu"
                  className="text-green-600 font-bold text-sm flex items-center gap-1 uppercase  tracking-widest"
                >
                  Manage Menu <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {popularItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-all"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
                      {item.image_url?.startsWith("http") ? (
                        <img
                          src={item.image_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">🍲</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 font-inter tracking-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {item.category}
                      </p>
                      <p className="text-sm font-bold text-green-600 mt-1 font-inter">
                        ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full uppercase  tracking-widest">
                        {item.discount}% OFF
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-transparent transition-all">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 font-inter  uppercase tracking-tighter">
                <Clock className="w-6 h-6 text-green-600" />
                Recent Activity
              </h2>
              <div className="space-y-3">
                {recentOrders.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 font-inter">
                          {order.id}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-700 font-medium font-inter">
                          {order.customer}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-widest">
                        {order.time}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase  tracking-widest ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Rating Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl shadow-lg p-8 text-white text-center border-4 border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
              <h2 className="text-lg font-bold mb-4 font-inter  uppercase tracking-tighter relative z-10">
                Store Rating
              </h2>
              <div className="text-6xl font-bold mb-2 font-inter  relative z-10">
                {stats.avgRating > 0 ? stats.avgRating : "N/A"}
              </div>
              <div className="flex justify-center gap-1 mb-4 relative z-10">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={20}
                    className={
                      s <= Math.round(stats.avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-white/20 text-white/40"
                    }
                  />
                ))}
              </div>
              <p className="text-green-100 text-xs font-medium relative z-10">
                {stats.avgRating > 0
                  ? "Based on customer reviews"
                  : "No ratings yet"}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-transparent transition-all">
              <h2 className="text-lg font-bold text-gray-800 mb-4 font-inter  uppercase tracking-tighter">
                Quick Actions
              </h2>
              <div className="space-y-3 font-inter">
                <button
                  onClick={() => (window.location.href = "/orders")}
                  className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg active:scale-95 uppercase  tracking-widest text-xs"
                >
                  Active Orders
                </button>
                <button
                  onClick={() => (window.location.href = "/menu")}
                  className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 uppercase  tracking-widest text-xs"
                >
                  Edit Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
