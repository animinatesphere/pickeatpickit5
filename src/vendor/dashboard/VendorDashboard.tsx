/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Loader2,
} from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { Link } from "react-router-dom";
import { backendAuthService } from "../../services/backendAuthService";
import api from "../../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalOrders: number;
  revenue: number;
  customers: number;
  avgRating: number;
  pendingOrders: number;
}

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchDashboardStats = () => api.get("/vendors/dashboard-stats");
const fetchMenuItems = (vendorId: string) =>
  api.get("/menu/", { params: { vendor_id: vendorId } });
const fetchRecentOrders = (vendorId: string) =>
  api.get("/orders/", { params: { vendor_id: vendorId } });

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff} min ago`;
  return new Date(dateStr).toLocaleDateString();
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-indigo-100 text-indigo-700",
  preparing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  canceled: "bg-red-100 text-red-700",
};

// ── Component ─────────────────────────────────────────────────────────────────
const VendorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [animateStats, setAnimateStats] = useState(false);
  const [vendorName, setVendorName] = useState("My Dashboard");
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    revenue: 0,
    customers: 0,
    avgRating: 0,
    pendingOrders: 0,
  });
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1. Get current user
        const user = await backendAuthService.getCurrentUser();
        if (!user) return;
        const vendorId = user.vendor_id || user.id;

        // 2. Fetch all in parallel
        const [statsRes, menuRes, ordersRes] = await Promise.allSettled([
          fetchDashboardStats(),
          fetchMenuItems(vendorId),
          fetchRecentOrders(vendorId),
        ]);

        // 3. Stats from backend
        if (statsRes.status === "fulfilled") {
          const d = statsRes.value.data;
          setVendorName(d.business_name || d.vendor_name || "My Dashboard");
          setStats({
            totalOrders: Number(d.total_orders || d.totalOrders || 0),
            revenue: Number(d.total_revenue || d.revenue || 0),
            customers: Number(d.total_customers || d.customers || 0),
            avgRating: Number(d.average_rating || d.avgRating || 0),
            pendingOrders: Number(d.pending_orders || d.pendingOrders || 0),
          });
        }

        // 4. Menu items → popular items section
        if (menuRes.status === "fulfilled") {
          const items: any[] = Array.isArray(menuRes.value.data)
            ? menuRes.value.data
            : [];
          setPopularItems(items.slice(0, 4));
        }

        // 5. Recent orders
        if (ordersRes.status === "fulfilled") {
          const orders: any[] = Array.isArray(ordersRes.value.data)
            ? ordersRes.value.data
            : [];
          setRecentOrders(
            orders.slice(0, 5).map((o) => ({
              id: `#${o.id.slice(0, 6).toUpperCase()}`,
              customer: o.customer_name || o.restaurant_name || "Guest",
              amount: Number(o.total_amount) || 0,
              time: formatTime(o.created_at),
              status: o.status || "pending",
            })),
          );

          // Derive stats from orders if backend didn't return them
          setStats((prev) => {
            if (prev.totalOrders > 0) return prev; // backend already gave us stats
            const revenue = orders.reduce(
              (s, o) => s + (Number(o.total_amount) || 0),
              0,
            );
            const customers = new Set(orders.map((o) => o.user_id)).size;
            const ratedOrders = orders.filter((o) => o.rating);
            const avgRating = ratedOrders.length
              ? Math.round(
                  (ratedOrders.reduce((s, o) => s + Number(o.rating), 0) /
                    ratedOrders.length) *
                    10,
                ) / 10
              : 0;
            return {
              totalOrders: orders.length,
              revenue,
              customers,
              avgRating,
              pendingOrders: orders.filter((o) => o.status === "pending")
                .length,
            };
          });
        }
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
        setAnimateStats(true);
      }
    })();
  }, []);

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
      value: stats.avgRating || "—",
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-20">
      <VendorNav />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase">
              {vendorName}
            </h1>
            <p className="text-green-100 text-sm mt-1 font-medium">
              Welcome back, Chef!
            </p>
          </div>
          <Link to="/orderhistory" className="relative group">
            <Bell className="w-6 h-6 cursor-pointer group-hover:scale-110 transition-transform" />
            {stats.pendingOrders > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-green-600 rounded-full text-[10px] flex items-center justify-center font-black">
                {stats.pendingOrders}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`bg-white rounded-2xl p-5 shadow-lg border border-gray-50 transition-all duration-500 ${
                  animateStats
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg mb-4`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-gray-800 tracking-tighter">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Menu overview */}
            <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
                  <TrendingUp className="w-5 h-5 text-green-600" /> Menu
                  Overview
                </h2>
                <Link
                  to="/menu"
                  className="text-green-600 font-bold text-xs flex items-center gap-1 uppercase tracking-widest hover:text-green-700"
                >
                  Manage <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {popularItems.length === 0 ? (
                <div className="text-center py-10 text-gray-300">
                  <p className="font-bold uppercase tracking-widest text-sm">
                    No menu items yet
                  </p>
                  <Link
                    to="/menu"
                    className="text-green-600 text-xs font-bold mt-2 block hover:underline"
                  >
                    Add your first meal →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {popularItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-green-200 transition-all"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                        {item.image_url?.startsWith("http") ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🍲
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-800 uppercase tracking-tighter truncate">
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {item.category}
                        </p>
                        <p className="text-sm font-black text-green-600 mt-0.5">
                          ₦{Number(item.price).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {item.discount > 0 && (
                          <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                            {item.discount}% OFF
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.in_stock ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
                        >
                          {item.in_stock ? "In Stock" : "Out"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-50">
              <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                <Clock className="w-5 h-5 text-green-600" /> Recent Activity
              </h2>

              {recentOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-300">
                  <p className="font-bold uppercase tracking-widest text-sm">
                    No orders yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-green-200 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-800 tracking-tighter">
                            {order.id}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-600 font-medium text-sm">
                            {order.customer}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {order.time}
                          </p>
                          <p className="text-sm font-black text-green-600">
                            ₦{order.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLOR[order.status] || "bg-gray-100 text-gray-500"}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Rating card */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl shadow-xl p-8 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <h2 className="text-sm font-black uppercase tracking-widest mb-4 relative z-10">
                Store Rating
              </h2>
              <div className="text-6xl font-black mb-3 relative z-10">
                {stats.avgRating > 0 ? stats.avgRating : "—"}
              </div>
              <div className="flex justify-center gap-1 mb-3 relative z-10">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    className={
                      s <= Math.round(stats.avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-white/20 text-white/30"
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

            {/* Quick actions */}
            <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-50">
              <h2 className="text-sm font-black text-gray-800 mb-4 uppercase tracking-widest">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="block w-full py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all active:scale-95 uppercase tracking-widest text-xs text-center shadow-lg shadow-green-600/20"
                >
                  View Active Orders
                  {stats.pendingOrders > 0 && (
                    <span className="ml-2 bg-white text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {stats.pendingOrders} pending
                    </span>
                  )}
                </Link>
                <Link
                  to="/menu"
                  className="block w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95 uppercase tracking-widest text-xs text-center"
                >
                  Manage Menu
                </Link>
                <Link
                  to="/vendor-profile"
                  className="block w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-black hover:bg-gray-100 transition-all active:scale-95 uppercase tracking-widest text-xs text-center border border-gray-100"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
