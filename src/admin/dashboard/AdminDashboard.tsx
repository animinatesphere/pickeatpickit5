/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  DollarSign,
  // BarChart3,
  FileText,
  Folder,
  HelpCircle,
  X,
  Menu,
  Bell,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import UserManagement from "../page/UserManagement";
import Analysis from "../page/Analysis";
import Transaction from "../page/Transaction";
import Content from "../page/Content";
import OrderManagement from "../page/OrderManagent";
import Restrict from "../page/Restrict";
import Help from "../page/Help";
import api from "../../services/api";

type MenuItem = { id: string; label: string; icon: React.ReactNode };

// ── API calls using backend endpoints ────────────────────────────────────────
const fetchAdminStats = () => api.get("/admin/stats");
const fetchRevenue = (period: string) =>
  api.get("/admin/analytics/revenue", { params: { period } });

// ── Dashboard ─────────────────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("M");

  const loadStats = async (p = period) => {
    setLoading(true);
    try {
      const [statsRes, revRes] = await Promise.allSettled([
        fetchAdminStats(),
        fetchRevenue(p),
      ]);

      // ── Stats ──────────────────────────────────────────────────────────────
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      }

      // ── Revenue chart ──────────────────────────────────────────────────────
      if (revRes.status === "fulfilled" && revRes.value.data) {
        const raw: any[] = Array.isArray(revRes.value.data)
          ? revRes.value.data
          : revRes.value.data.data || [];

        const grouped: Record<string, number> = {};
        raw.forEach((o: any) => {
          const key =
            p === "D"
              ? new Date(o.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                })
              : p === "Y"
                ? new Date(o.created_at).toLocaleString("default", {
                    month: "short",
                  })
                : new Date(o.created_at).getDate().toString().padStart(2, "0");
          grouped[key] =
            (grouped[key] || 0) +
            (Number(o.amount) || Number(o.total_amount) || 0);
        });

        const formatted = Object.entries(grouped)
          .map(([day, value]) => ({ day, value }))
          .sort((a, b) => parseInt(a.day) - parseInt(b.day));
        setChartData(formatted);
      }
    } catch (e) {
      console.error("Failed to load admin stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    loadStats(p);
  };

  // ── Menu items ───────────────────────────────────────────────────────────────
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "orders",
      label: "Order management",
      icon: <ShoppingCart size={20} />,
    },
    { id: "users", label: "Users management", icon: <Users size={20} /> },
    {
      id: "earnings",
      label: "Earnings & Transaction",
      icon: <DollarSign size={20} />,
    },
    // {
    //   id: "reports",
    //   label: "Reports & Analytics",
    //   icon: <BarChart3 size={20} />,
    // },
    { id: "pages", label: "Pages & Restriction", icon: <FileText size={20} /> },
    { id: "content", label: "Content Management", icon: <Folder size={20} /> },
    { id: "help", label: "Help & Support", icon: <HelpCircle size={20} /> },
  ];

  // ── Dashboard content ────────────────────────────────────────────────────────
  const DashboardContent: React.FC = () => {
    if (loading)
      return (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
        </div>
      );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tighter uppercase">
            Dashboard
          </h1>
          <Bell
            className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
            size={24}
          />
        </div>

        {/* Orders progress ring */}
        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-transparent">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-green-600 font-black tracking-tighter uppercase">
              Today's Progress
            </h2>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Ring */}
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    className="text-gray-100"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray="502.4"
                    strokeDashoffset={
                      502.4 -
                      502.4 *
                        (Math.min(
                          stats?.completed_orders ||
                            stats?.completedOrders ||
                            0,
                          100,
                        ) /
                          100)
                    }
                    strokeLinecap="round"
                    className="text-blue-600"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">
                    {stats?.completed_orders || stats?.completedOrders || 0}
                  </span>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    Completed
                  </span>
                </div>
              </div>
            </div>
            {/* Stats list */}
            <div className="space-y-5">
              {[
                {
                  label: "Active Orders",
                  value: stats?.active_orders || stats?.activeOrders || 0,
                  color: "bg-blue-400",
                },
                {
                  label: "Completed Orders",
                  value: stats?.completed_orders || stats?.completedOrders || 0,
                  color: "bg-blue-600",
                },
                {
                  label: "Canceled Orders",
                  value: stats?.canceled_orders || stats?.canceledOrders || 0,
                  color: "bg-blue-200",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 ${s.color} rounded-full`} />
                    <span className="text-gray-600 font-bold text-xs uppercase tracking-widest">
                      {s.label}
                    </span>
                  </div>
                  <span className="font-black text-gray-800">
                    {s.value} Orders
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's earnings */}
        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-transparent">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 block">
            Today's Earnings
          </span>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black text-gray-800 tracking-tighter">
              ₦{" "}
              {(
                stats?.today_earnings ||
                stats?.todayEarnings ||
                0
              ).toLocaleString()}
            </h3>
            <div className="bg-green-100 p-2 rounded-xl">
              <span className="text-green-600 text-lg font-black">↑</span>
            </div>
          </div>
        </div>

        {/* Pending approvals */}
        <div
          onClick={() => setActiveMenu("users")}
          className="bg-white rounded-[2rem] shadow-xl p-8 border border-transparent hover:border-green-500 group cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-gray-50 p-4 rounded-2xl shadow-inner group-hover:rotate-6 transition-transform">
                <Clock className="text-gray-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Pending Approvals
                </h3>
                <span className="text-4xl font-black text-green-600 tracking-tighter">
                  {stats?.pending_approvals || stats?.pendingApprovals || 0}
                </span>
              </div>
            </div>
            <CheckCircle
              size={24}
              className="text-green-600 group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-transparent">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase">
              Revenue
            </h3>
            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              {(["D", "W", "M", "Y"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handlePeriodChange(t)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    period === t
                      ? "bg-green-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-gray-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
            {new Date().toLocaleString("default", { month: "long" })}{" "}
            {new Date().getFullYear()}
          </div>
          {chartData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm font-bold uppercase tracking-widest">
              No revenue data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(v) =>
                    `₦${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "none",
                    borderRadius: "20px",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
                    fontWeight: "bold",
                  }}
                  formatter={(v: any) => [
                    `₦${Number(v).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22C55E"
                  strokeWidth={4}
                  dot={{
                    fill: "#22C55E",
                    strokeWidth: 2,
                    r: 4,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* System users */}
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-transparent">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-xl font-black text-green-600 tracking-tighter uppercase">
              System Users
            </h3>
            <HelpCircle className="text-gray-300" size={16} />
          </div>
          <div className="text-5xl font-black text-gray-800 tracking-tighter mb-4">
            {stats?.user_counts?.total || stats?.userCounts?.total || 0}
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-2">
              Total
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden p-1 border border-gray-200 shadow-inner mb-8">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              style={{ width: "100%" }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Clients",
                value:
                  stats?.user_counts?.customers ||
                  stats?.userCounts?.clients ||
                  0,
                color: "bg-green-600",
              },
              {
                label: "Vendors",
                value:
                  stats?.user_counts?.vendors ||
                  stats?.userCounts?.vendors ||
                  0,
                color: "bg-blue-600",
              },
              {
                label: "Riders",
                value:
                  stats?.user_counts?.riders || stats?.userCounts?.riders || 0,
                color: "bg-orange-600",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 bg-gray-50 p-4 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-1 ${item.color} rounded-full`} />
                  <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                    {item.label}
                  </span>
                </div>
                <span className="text-xl font-black text-gray-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Routing ──────────────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardContent />;
      case "orders":
        return <OrderManagement />;
      case "users":
        return <UserManagement />;
      case "earnings":
        return <Transaction />;
      case "reports":
        return <Analysis />;
      case "pages":
        return <Restrict />;
      case "content":
        return <Content />;
      case "help":
        return <Help />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div
        className={`${isOpen ? "w-64" : "w-24"} bg-white border-r border-gray-100 shadow-2xl transition-all duration-500 flex flex-col z-50`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50">
          {isOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <span className="text-white font-black text-xl tracking-tighter">
                    M
                  </span>
                </div>
                <span className="font-black text-gray-800 tracking-tighter uppercase whitespace-nowrap">
                  Dashboard
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-green-600 transition-all p-2 hover:bg-green-50 rounded-xl"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="text-gray-400 hover:text-green-600 transition-all mx-auto p-3 hover:bg-green-50 rounded-xl"
            >
              <Menu size={24} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-8 px-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                activeMenu === item.id
                  ? "bg-green-600 text-white shadow-xl shadow-green-500/30"
                  : "text-gray-500 hover:bg-gray-50 hover:text-green-600"
              }`}
            >
              <span
                className={`flex-shrink-0 group-hover:scale-110 transition-transform ${activeMenu === item.id ? "rotate-3" : ""}`}
              >
                {item.icon}
              </span>
              {isOpen && (
                <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-3 py-6 border-t border-gray-50">
          <div
            className={`flex items-center gap-4 px-4 py-2 transition-all duration-300 ${!isOpen && "justify-center"}`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-black shadow-lg flex-shrink-0">
              AD
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-800 uppercase tracking-tighter">
                  PickEatPickit
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Super Admin
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
