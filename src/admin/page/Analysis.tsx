import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Bell,
  Menu,
  TrendingUp,
  Users,
  ShoppingBag,
  Clock,
} from "lucide-react";

const Analysis = () => {
  const [activeTab, setActiveTab] = useState("M");

  const chartData = [
    { day: "1", value: 60000 },
    { day: "3", value: 85000 },
    { day: "5", value: 95000 },
    { day: "7", value: 78000 },
    { day: "9", value: 65000 },
    { day: "11", value: 92000 },
    { day: "13", value: 72000 },
    { day: "15", value: 88000 },
    { day: "17", value: 95000 },
    { day: "19", value: 68000 },
    { day: "21", value: 82000 },
    { day: "23", value: 98000 },
    { day: "25", value: 90000 },
    { day: "27", value: 85000 },
    { day: "29", value: 95000 },
    { day: "31", value: 88000 },
  ];

  const users = [
    { name: "Esther Howard", orders: 33, avatar: "👩🏻", color: "bg-orange-400" },
    { name: "Jacob Jones", orders: 29, avatar: "👨🏻", color: "bg-green-400" },
    { name: "Bessie Cooper", orders: 24, avatar: "👩🏻‍🦰", color: "bg-blue-400" },
  ];

  const insights = [
    {
      icon: ShoppingBag,
      label: "Most sells",
      value: "Mardiya kitchen",
      color: "bg-orange-400",
    },
    {
      icon: TrendingUp,
      label: "Popular orders",
      value: "Fried rice",
      color: "bg-green-400",
    },
    {
      icon: Clock,
      label: "Peak order hours",
      value: "5PM - 9PM",
      color: "bg-blue-400",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-6 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95 shadow-lg">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold font-inter italic tracking-tighter uppercase whitespace-nowrap">
              Reports & Analytics
            </h1>
            <button className="p-2 hover:bg-white/20 rounded-xl transition-all relative active:scale-95 shadow-lg">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 dark:border-green-700 animate-pulse"></span>
            </button>
          </div>

          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 dark:text-green-300 text-xs font-bold uppercase tracking-[0.2em] mb-2 font-inter italic">
                  Total Revenue
                </p>
                <p className="text-4xl font-black font-inter tracking-tighter">$1,200.87</p>
              </div>
              <div className="bg-white/20 p-4 rounded-3xl border border-white/20 shadow-inner">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 border border-transparent dark:border-gray-800 animate-fade-in transition-all">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase underline decoration-green-500 decoration-4 underline-offset-8">August 2021</h2>
            <div className="flex gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-1.5 border border-gray-100 dark:border-gray-800">
              {["D", "W", "M", "Y"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase italic tracking-widest transition-all ${
                    activeTab === tab
                      ? "bg-green-600 dark:bg-green-700 text-white shadow-lg shadow-green-500/20 active:scale-95"
                      : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-100 dark:text-gray-800"
                vertical={false}
              />
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
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: "rgba(34, 197, 94, 0.05)" }}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(8px)",
                  border: "none",
                  borderRadius: "20px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
                  fontWeight: 'bold',
                }}
                itemStyle={{ color: '#059669' }}
                formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Bar
                dataKey="value"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Engagement */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 border border-transparent dark:border-gray-800 animate-fade-in-delay-1 transition-all">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl shadow-inner transform -rotate-6">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">
              User engagement
            </h2>
          </div>

          <div className="space-y-4">
            {users.map((user, index) => (
              <div
                key={user.name}
                className="flex items-center gap-5 p-4 rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700 shadow-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-14 h-14 ${user.color} rounded-[1.25rem] flex items-center justify-center text-3xl shadow-2xl group-hover:rotate-6 transition-all duration-300 transform`}
                >
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 dark:text-gray-100 font-inter tracking-tight text-lg">{user.name}</p>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest italic">{user.orders} orders</p>
                </div>
                <div className="w-20 h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full ${user.color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.3)]`}
                    style={{ width: `${(user.orders / 33) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-4 text-green-600 dark:text-green-400 font-bold uppercase italic tracking-widest text-xs hover:bg-green-50 dark:hover:bg-green-900/10 rounded-2xl transition-all border border-green-100 dark:border-green-900/30">
            See all details →
          </button>
        </div>

        {/* Order Insights */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 border border-transparent dark:border-gray-800 animate-fade-in-delay-2 transition-all">
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-8 font-inter italic tracking-tighter uppercase">
            Order insights
          </h2>

          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={insight.label}
                  className="flex items-center gap-5 p-4 rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700 shadow-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`w-14 h-14 ${insight.color} rounded-[1.25rem] flex items-center justify-center shadow-2xl group-hover:-rotate-6 transition-all duration-300 transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic mb-1">{insight.label}</p>
                    <p className="font-black text-gray-800 dark:text-gray-100 font-inter tracking-tight text-xl">
                      {insight.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay-1 {
          animation: fade-in 0.6s ease-out 0.2s backwards;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.6s ease-out 0.4s backwards;
        }
      `}</style>
    </div>
  );
};

export default Analysis;
