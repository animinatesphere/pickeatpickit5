import { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ArrowLeft,
  X,
  Calendar,
} from "lucide-react";

const Transaction = () => {
  const [currentView, setCurrentView] = useState("main");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");

  const filters = ["All", "Clients", "Vendors", "Riders"];

  const transactions = [
    {
      id: 1,
      type: "payout",
      title: "Transfer to LACE RESTAURANT LIMITED",
      date: "Oct 21st, 11:05:33",
      amount: "₦15,350",
      commission: "₦1,250",
      status: "successful",
    },
    {
      id: 2,
      type: "transfer",
      title: "Transfer from Jamie Micheal",
      date: "Oct 21st, 11:05:33",
      amount: "₦15,350",
      commission: "₦1,250",
      status: "successful",
    },
  ];

  const vendors = [
    { name: "Mardiya Kitchen", type: "vendor", amount: "₦125,500.65" },
    { name: "Mardiya Kitchen", type: "vendor", amount: "₦125,500.65" },
    { name: "Mardiya Kitchen", type: "vendor", amount: "₦125,500.65" },
    { name: "Mardiya Kitchen", type: "vendor", amount: "₦125,500.65" },
  ];

  const orders = [
    {
      id: "#2356",
      date: "Oct 21st, 11:05:33",
      amount: "₦15,350",
      commission: "₦1,250",
    },
    {
      id: "#2356",
      date: "Oct 21st, 11:05:33",
      amount: "₦15,350",
      commission: "₦1,250",
    },
    {
      id: "#2356",
      date: "Oct 21st, 11:05:33",
      amount: "₦15,350",
      commission: "₦1,250",
    },
    {
      id: "#2356",
      date: "Oct 21st, 11:05:33",
      amount: "₦15,350",
      commission: "₦1,250",
    },
  ];

  const handleCheckVendor = (vendorName: string) => {
    setSelectedVendor(vendorName);
    setCurrentView("orders");
  };

  const handleApprove = () => {
    setModalType("approve");
    setShowModal(true);
    setTimeout(() => setShowModal(false), 2000);
  };

  const handleDeny = () => {
    setModalType("deny");
    setShowModal(true);
    setTimeout(() => setShowModal(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 pb-20">
      {/* Main View */}
      {currentView === "main" && (
        <div className="animate-fade-in">
          {/* Header */}
          <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-6 shadow-xl sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <button className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold font-inter italic tracking-tighter uppercase whitespace-nowrap">
                Earning & Transactions
              </h1>
              <button className="p-2 hover:bg-white/10 rounded-xl transition-all relative active:scale-95">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 dark:border-green-700 animate-pulse"></span>
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="px-4 py-6">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl p-6 border border-transparent dark:border-gray-800 transition-all">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-5 py-3.5 border border-gray-100 dark:border-gray-800 focus-within:border-green-500 transition-all">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for transactions..."
                    className="flex-1 bg-transparent outline-none text-sm font-inter font-bold dark:text-gray-100 placeholder:text-gray-400"
                  />
                </div>
                <button className="px-8 py-3.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl font-black text-xs uppercase italic tracking-widest hover:bg-green-100 dark:hover:bg-green-900/30 transition-all border border-green-100 dark:border-green-800/50">
                  Filter
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-8 py-2.5 rounded-full font-bold text-[10px] uppercase italic tracking-widest whitespace-nowrap transition-all ${
                      selectedFilter === filter
                        ? "bg-green-600 dark:bg-green-700 text-white shadow-lg shadow-green-500/20 active:scale-95"
                        : "bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Total Earnings Card */}
          <div className="px-4 mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 border border-transparent dark:border-gray-800 transition-all animate-fadeIn overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-green-400/5 rounded-bl-full pointer-events-none -mr-10 -mt-10" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-black font-inter italic tracking-tighter uppercase text-sm">
                  <span>Total earnings</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-400 dark:text-gray-600 font-inter italic">₦</span>
                  <span className="text-5xl font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter">
                    2,300,027.87
                  </span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-3xl border border-green-100 dark:border-green-800/50">
                  <ArrowDownRight className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-8 flex justify-between items-center border-t border-gray-50 dark:border-gray-800 pt-6">
                <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">Pending Payout</span>
                <span className="text-green-600 dark:text-green-400 font-black font-inter italic">₦ 2,859.87</span>
              </div>
            </div>
          </div>

          {/* Payout Management */}
          <div className="px-4 mb-6">
            <button
              onClick={() => setCurrentView("payout")}
              className="w-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl p-6 flex items-center justify-between hover:shadow-2xl transition-all border border-transparent dark:border-gray-800 animate-fadeIn group"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">
                Payout Management
              </span>
              <div className="flex items-center gap-4">
                <span className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-5 py-1.5 rounded-full text-xs font-black italic tracking-widest border border-green-100 dark:border-green-800/50">
                  5
                </span>
                <ChevronRight className="w-6 h-6 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Transactions */}
          <div className="px-4">
            <div
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 border border-transparent dark:border-gray-800 animate-fadeIn transition-all"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase whitespace-nowrap">
                  Transactions
                </h2>
                <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-bold uppercase tracking-widest italic">21st May - 25th Aug</span>
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-6">
                {transactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-6 p-5 rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-800 shadow-sm"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 transform group-hover:rotate-6 ${
                        transaction.type === "payout"
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "bg-green-50 dark:bg-green-900/20"
                      }`}
                    >
                      {transaction.type === "payout" ? (
                        <ArrowUpRight className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <ArrowDownRight className="w-7 h-7 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-800 dark:text-gray-100 font-inter tracking-tight mb-1 text-lg italic">
                        {transaction.type === "payout"
                          ? "Payout"
                          : "Transfer Received"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest italic mb-2 line-clamp-1">
                        {transaction.title}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.2em] italic">
                          {transaction.date}
                        </span>
                        <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase italic tracking-widest rounded-lg border border-green-100 dark:border-green-800/50">
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-800 dark:text-gray-100 text-xl font-inter italic tracking-tighter mb-1">
                        {transaction.amount}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest italic">
                        Comm. -{" "}
                        <span className="text-green-600 dark:text-green-400">
                          {transaction.commission}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Management View */}
      {currentView === "payout" && (
        <div className="animate-fadeIn">
          <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-6 shadow-xl sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <button
                onClick={() => setCurrentView("main")}
                className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold font-inter italic tracking-tighter uppercase whitespace-nowrap">
                Payout Management{selectedVendor ? ` — ${selectedVendor}` : ""}
              </h1>
              <button className="p-2 hover:bg-white/10 rounded-xl transition-all relative active:scale-95">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 dark:border-green-700 animate-pulse"></span>
              </button>
            </div>
          </div>

          {/* Total Earnings Card */}
          <div className="px-4 py-8 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 border border-transparent dark:border-gray-800 transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-green-400/5 rounded-bl-full pointer-events-none -mr-10 -mt-10" />
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-black font-inter italic tracking-tighter uppercase text-sm mb-4">
                <span>Total earnings</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-400 dark:text-gray-600 font-inter italic">₦</span>
                  <span className="text-5xl font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter">
                    2,300,027.87
                  </span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-3xl border border-green-100 dark:border-green-800/50">
                   <ArrowUpRight className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-8 flex justify-between items-center border-t border-gray-50 dark:border-gray-800 pt-6">
                <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">Pending payouts</span>
                <span className="text-green-600 dark:text-green-400 font-black font-inter italic">₦ 2,859.87</span>
              </div>
            </div>
          </div>

          {/* Vendors List */}
          <div className="px-4 space-y-4 max-w-2xl mx-auto">
            {vendors.map((vendor, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-lg p-6 flex items-center justify-between border border-transparent dark:border-gray-800 hover:shadow-2xl hover:border-green-500/20 transition-all group lg:p-8"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div>
                  <p className="font-black text-gray-800 dark:text-gray-100 mb-1 font-inter italic tracking-tighter uppercase text-lg">
                    {vendor.name}{" "}
                    <span className="text-green-600 dark:text-green-400 text-xs italic tracking-widest lowercase ml-2">
                      ({vendor.type})
                    </span>
                  </p>
                  <p className="text-2xl font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter">
                    {vendor.amount}
                  </p>
                </div>
                <button
                  onClick={() => handleCheckVendor(vendor.name)}
                  className="px-8 py-3.5 bg-green-600 dark:bg-green-700 text-white font-black text-xs uppercase italic tracking-widest rounded-2xl hover:bg-green-700 dark:hover:bg-green-800 active:scale-95 transition-all shadow-xl shadow-green-500/20"
                >
                  Check
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders View */}
      {currentView === "orders" && (
        <div className="animate-fadeIn">
          <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-6 shadow-xl sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <button
                onClick={() => setCurrentView("payout")}
                className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold font-inter italic tracking-tighter uppercase whitespace-nowrap">
                Payout Management
              </h1>
              <button className="p-2 hover:bg-white/10 rounded-xl transition-all relative active:scale-95">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 dark:border-green-700 animate-pulse"></span>
              </button>
            </div>
          </div>

          {/* Total Earnings Card */}
          <div className="px-4 py-8 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 border border-transparent dark:border-gray-800 transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-green-400/5 rounded-bl-full pointer-events-none -mr-10 -mt-10" />
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-black font-inter italic tracking-tighter uppercase text-sm mb-4">
                <span>Total earnings</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-400 dark:text-gray-600 font-inter italic">₦</span>
                  <span className="text-5xl font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter">
                    2,300,027.87
                  </span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-3xl border border-green-100 dark:border-green-800/50">
                  <ArrowUpRight className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-8 flex justify-between items-center border-t border-gray-50 dark:border-gray-800 pt-6">
                <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">Pending payouts</span>
                <span className="text-green-600 dark:text-green-400 font-black font-inter italic">₦ 2,859.87</span>
              </div>
            </div>
          </div>

          {/* Orders Completed */}
          <div className="px-4 mb-8 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 border border-transparent dark:border-gray-800 animate-fadeIn">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-green-600 dark:text-green-400 font-inter italic tracking-tighter uppercase whitespace-nowrap">
                   Orders completed
                </h2>
                <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-bold uppercase tracking-widest italic">21st May - 25th Aug</span>
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-6">
                {orders.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-6 p-5 rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group border border-transparent hover:border-gray-100 dark:hover:border-gray-700 shadow-sm"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center shadow-xl transition-all group-hover:rotate-6">
                      <ArrowUpRight className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-800 dark:text-gray-100 mb-1 font-inter italic tracking-tighter uppercase text-lg">
                        ORDER - {order.id}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.2em] italic">
                          {order.date}
                        </span>
                        <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase italic tracking-widest rounded-lg border border-green-100 dark:border-green-800/50">
                          Completed
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-800 dark:text-gray-100 text-xl font-inter italic tracking-tighter mb-1">
                        {order.amount}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest italic">
                        Comm. -{" "}
                        <span className="text-green-600 dark:text-green-400">
                          {order.commission}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 space-y-4 max-w-2xl mx-auto">
            <button
              onClick={handleApprove}
              className="w-full py-5 bg-green-600 dark:bg-green-700 text-white font-black text-lg rounded-[2rem] hover:bg-green-700 dark:hover:bg-green-800 active:scale-95 transition-all shadow-2xl shadow-green-500/30 uppercase italic tracking-tighter"
            >
              Approve Payout
            </button>
            <button
              onClick={handleDeny}
              className="w-full py-5 bg-transparent text-red-500 font-black text-lg rounded-[2rem] hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-95 transition-all border-2 border-red-100 dark:border-red-900/20 uppercase italic tracking-tighter"
            >
              Deny Payout
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn px-4">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-scaleUp border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-green-400/5 rounded-bl-full pointer-events-none -mr-16 -mt-16" />
            <div className="flex justify-end mb-4 relative z-10">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-all p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center relative z-10">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <Bell className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-3xl font-black text-gray-800 dark:text-gray-100 mb-2 font-inter italic tracking-tighter uppercase">
                Confirm Payout
              </h3>
              <p className="text-green-600 dark:text-green-400 font-bold uppercase italic tracking-widest text-[10px] mb-8">Payout Request Action</p>
              <p className="text-gray-600 dark:text-gray-400 mb-10 font-medium font-inter">
                Are you sure you want to <span className={`font-black uppercase italic ${modalType === 'approve' ? 'text-green-600' : 'text-red-500'}`}>{modalType === "approve" ? "approve" : "deny"}</span> the payout request for <span className="text-gray-800 dark:text-gray-100 font-black">Mr. Bright (Rider)</span>?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black text-xs uppercase italic tracking-widest rounded-2xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className={`flex-1 py-4 ${
                    modalType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white font-black text-xs uppercase italic tracking-widest rounded-2xl transition-all shadow-xl active:scale-95`}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-scaleUp {
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Transaction;
