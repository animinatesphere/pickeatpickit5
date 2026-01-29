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
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    revenue: 0,
    customers: 0,
    avgRating: 4.5,
  });
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Get current vendor
        const { data: { session } } = await supabase.auth.getSession();
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
          const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
          const uniqueCustomers = new Set(orders.map((o) => o.customer_id)).size;

          setStats({
            totalOrders: orders.length,
            revenue: totalRevenue,
            customers: uniqueCustomers,
            avgRating: 4.8, // Fallback until review table is ready
          });

          // Format recent orders for UI
          setRecentOrders(orders.slice(0, 5).map(o => ({
            id: `#${o.id.slice(0, 5).toUpperCase()}`,
            customer: o.customer_name || "Guest",
            item: "View Details", // You can join order_items for more detail
            time: formatTime(o.created_at),
            status: o.status || "pending"
          })));
        }

        // 3. Fetch Popular Menu Items (Top 4)
        const { data: items } = await supabase
          .from("menu_items")
          .select("*")
          .eq("vendor_id", vendor.id)
          .limit(4);
        
        if (items) setPopularItems(items);

      } catch (error) {
        console.error("Error fetching dashboard:", error);
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
      change: "+5%",
      icon: ShoppingBag,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Revenue",
      value: `₦${stats.revenue.toLocaleString()}`,
      change: "+12%",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Customers",
      value: stats.customers.toLocaleString(),
      change: "+8%",
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Avg Rating",
      value: stats.avgRating,
      change: "+0.1",
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen font-bold text-green-600">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <VendorNav />
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">{vendorInfo?.business_name || "My Dashboard"}</h1>
            <p className="text-green-100 text-sm mt-1">Welcome back, Chef!</p>
          </div>
          <Link to="/notifications">
            <div className="relative">
              <Bell className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
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
                className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-500 transform ${
                  animateStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Most Popular Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Menu Overview
                </h2>
                <Link to="/menu" className="text-green-600 font-semibold text-sm flex items-center gap-1">
                  Manage Menu <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {popularItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
                      {item.image_url?.startsWith("http") ? (
                        <img src={item.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">🍲</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-sm font-semibold text-green-600 mt-1">₦{item.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                         {item.discount}% OFF
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-green-600" />
                Recent Activity
              </h2>
              <div className="space-y-3">
                {recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{order.id}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-700 font-medium">{order.customer}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{order.time}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Rating Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg p-6 text-white text-center">
              <h2 className="text-lg font-bold mb-4">Store Rating</h2>
              <div className="text-5xl font-bold mb-2">4.8</div>
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-green-100 text-xs">Based on current performance</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button onClick={() => window.location.href='/orders'} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all">
                  Active Orders
                </button>
                <button onClick={() => window.location.href='/menu'} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
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