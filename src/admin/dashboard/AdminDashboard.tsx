import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  DollarSign,
  BarChart3,
  FileText,
  Folder,
  HelpCircle,
  X,
  Menu,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Sun,
  Moon,
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
import { useTheme } from "../../context/ThemeContext";

// Types
type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

// type OrderStats = {
//   active: number;
//   completed: number;
//   canceled: number;
// };

// Mock data for the chart
const chartData = [
  { day: "02", value: 45000 },
  { day: "04", value: 78000 },
  { day: "06", value: 52000 },
  { day: "08", value: 95000 },
  { day: "10", value: 68000 },
  { day: "12", value: 125000 },
  { day: "14", value: 88000 },
  { day: "16", value: 145000 },
  { day: "18", value: 92000 },
  { day: "20", value: 168000 },
  { day: "22", value: 115000 },
  { day: "24", value: 78000 },
  { day: "26", value: 198000 },
  { day: "28", value: 145000 },
  { day: "30", value: 225000 },
];

const AdminDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const { theme, toggleTheme } = useTheme();

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
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: <BarChart3 size={20} />,
    },
    { id: "pages", label: "Pages & Restriction", icon: <FileText size={20} /> },
    { id: "content", label: "Content Management", icon: <Folder size={20} /> },
    { id: "help", label: "Help & Support", icon: <HelpCircle size={20} /> },
  ];

  const DashboardContent: React.FC = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">Dashboard</h1>
        <Bell
          className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          size={24}
        />
      </div>

      {/* Today's Orders Card */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl p-8 border border-transparent dark:border-gray-800 transition-all">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-green-600 dark:text-green-400 font-black font-inter italic tracking-tighter uppercase">Todays Orders</h2>
          <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest italic">02 Nov, 2023</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Circular Progress */}
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
                  className="text-gray-100 dark:text-gray-800"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray="502.4"
                  strokeDashoffset="125.6"
                  strokeLinecap="round"
                  className="text-blue-600 dark:text-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-blue-600 dark:text-blue-400 font-inter italic tracking-tighter">
                  5,824
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">1/3 Goal</span>
              </div>
            </div>
          </div>

          {/* Order Stats */}
          <div className="space-y-5">
            {[
              { label: "Active Orders", value: "5 Orders", color: "bg-blue-400" },
              { label: "Completed Orders", value: "45 Orders", color: "bg-blue-600" },
              { label: "Canceled Orders", value: "10 Orders", color: "bg-blue-200 dark:bg-blue-900" }
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${stat.color} rounded-full shadow-sm`}></div>
                  <span className="text-gray-600 dark:text-gray-400 font-bold text-xs uppercase italic tracking-widest">{stat.label}</span>
                </div>
                <span className="font-black text-gray-800 dark:text-gray-100 font-inter italic">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Earning */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl p-8 border border-transparent dark:border-gray-800 transition-all">
        <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest italic mb-2 block">Todays Earning</span>
        <div className="flex items-center justify-between">
          <h3 className="text-4xl font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter">₦ 3,027.87</h3>
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl">
             <span className="text-green-600 dark:text-green-400 text-lg font-black">↑</span>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl p-8 border border-transparent dark:border-gray-800 transition-all hover:border-green-500 dark:hover:border-green-500/50 group cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl shadow-inner group-hover:rotate-6 transition-transform">
              <Clock className="text-gray-600 dark:text-gray-400" size={24} />
            </div>
            <div>
              <h3 className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest italic mb-1">Pending approvals</h3>
              <span className="text-4xl font-black text-green-600 dark:text-green-400 font-inter italic tracking-tighter">5</span>
            </div>
          </div>
          <button className="text-green-600 dark:text-green-400 hover:translate-x-1 transition-transform">
             <CheckCircle size={24} />
          </button>
        </div>
      </div>

      {/* Order Stats Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 border border-transparent dark:border-gray-800 transition-all">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">Order Stat</h3>
          <div className="flex gap-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
            {["D", "W", "M", "Y"].map((t) => (
              <button key={t} className={`px-5 py-2 rounded-xl text-xs font-bold uppercase italic tracking-widest transition-all ${t === 'M' ? "bg-green-600 dark:bg-green-700 text-white shadow-lg shadow-green-500/20" : "text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] italic mb-6">August 2023</div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", fontSize: 10, fontWeight: 700 }}
              className="text-gray-400 dark:text-gray-600"
            />
            <YAxis 
               axisLine={false}
               tickLine={false}
               tick={{ fill: "currentColor", fontSize: 10, fontWeight: 700 }}
               className="text-gray-400 dark:text-gray-600"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                backdropFilter: 'blur(8px)',
                border: 'none', 
                borderRadius: '20px', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                fontWeight: 'bold'
              }} 
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#22C55E"
              strokeWidth={4}
              dot={{ fill: '#22C55E', strokeWidth: 2, r: 4, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Order Summary Cards */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-gray-700 font-medium">Active Orders</h4>
              <p className="text-2xl font-bold text-gray-800">750,456</p>
              <p className="text-green-600 text-sm">₦ 9,456,004.98</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-gray-700 font-medium">Completed Orders</h4>
              <p className="text-2xl font-bold text-gray-800">750,456</p>
              <p className="text-green-600 text-sm">₦ 9,456,004.98</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Clock className="text-gray-600" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-gray-700 font-medium">Pending Orders</h4>
              <p className="text-2xl font-bold text-gray-800">5</p>
              <p className="text-gray-600 text-sm">₦ 9,456,004.98</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-gray-700 font-medium">Canceled Orders</h4>
              <p className="text-2xl font-bold text-gray-800">110</p>
              <p className="text-red-600 text-sm">₦ 9,456,004.98</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 border border-transparent dark:border-gray-800 transition-all">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-xl font-black text-green-600 dark:text-green-400 font-inter italic tracking-tighter uppercase">Active Users</h3>
          <HelpCircle className="text-gray-300 dark:text-gray-700" size={16} />
        </div>
        <div className="text-5xl font-black text-gray-800 dark:text-gray-100 font-inter tracking-tighter mb-4 italic">
          594 <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2">Users</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden p-1 border border-gray-200 dark:border-gray-700 shadow-inner mb-8">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            style={{ width: "75%" }}
          ></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Clients", color: "bg-green-600" },
            { label: "Vendors", color: "bg-gray-300 dark:bg-gray-700" },
            { label: "Riders", color: "bg-gray-300 dark:bg-gray-700" }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className={`w-3 h-1 ${item.color} rounded-full`}></div>
              <span className="text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest italic">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "w-64" : "w-24"
        } bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-2xl transition-all duration-500 ease-in-out flex flex-col z-50`}
      >
        {/* Logo and Toggle */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50 dark:border-gray-800">
          {isOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 rotate-3 transition-transform hover:rotate-0">
                  <span className="text-white font-black text-xl italic tracking-tighter font-inter uppercase">M</span>
                </div>
                <span className="font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase whitespace-nowrap">Dashboard</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all mx-auto p-3 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl"
            >
              <Menu size={24} />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-8 px-3 space-y-2 no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                activeMenu === item.id
                  ? "bg-green-600 text-white shadow-xl shadow-green-500/30 active:scale-95"
                  : "text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-green-600 dark:hover:text-green-400"
              }`}
            >
              <span className={`flex-shrink-0 transition-transform group-hover:scale-110 ${activeMenu === item.id ? "rotate-3" : ""}`}>
                 {item.icon}
              </span>
              {isOpen && (
                <span className="text-xs font-black uppercase italic tracking-widest whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
              {!isOpen && activeMenu === item.id && (
                <div className="absolute left-0 w-1.5 h-8 bg-white rounded-r-full shadow-lg"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Theme Toggle & User Profile */}
        <div className="mt-auto px-3 py-6 border-t border-gray-50 dark:border-gray-800 space-y-4">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group hover:bg-gray-50 dark:hover:bg-gray-800 ${
              theme === "dark" ? "text-amber-400" : "text-indigo-600"
            }`}
          >
            <span className="flex-shrink-0 transition-transform group-hover:rotate-12">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </span>
            {isOpen && (
              <span className="text-xs font-black uppercase italic tracking-widest whitespace-nowrap overflow-hidden text-gray-500 dark:text-gray-400">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>
          
          <div className={`flex items-center gap-4 px-4 py-2 transition-all duration-300 ${!isOpen && "justify-center"}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-black italic shadow-lg">
              JS
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-800 dark:text-gray-100 uppercase italic tracking-tighter">John Simon</span>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic">Super Admin</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
