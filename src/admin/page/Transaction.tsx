import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { 
  getAllTransactions, 
  getPayoutRequests, 
  updatePayoutStatus, 
  getPlatformTotals 
} from "../../services/api";

const Transaction = () => {
  const [currentView, setCurrentView] = useState("main");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [totals, setTotals] = useState({ totalEarnings: 0, totalPendingPayouts: 0 });

  const filters = ["All", "Clients", "Vendors", "Riders"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, payoutRes, totalsRes] = await Promise.all([
        getAllTransactions(),
        getPayoutRequests(),
        getPlatformTotals()
      ]);

      if (!txRes.error) setTransactions(txRes.data || []);
      if (!payoutRes.error) setPayoutRequests(payoutRes.data || []);
      setTotals(totalsRes);
    } catch (err) {
      // Failed to fetch transaction data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckPayout = (payout: any) => {
    setSelectedPayout(payout);
    setShowModal(true);
  };

  const handlePayoutAction = async (status: 'approved' | 'rejected') => {
    if (!selectedPayout) return;
    
    try {
      const { error } = await updatePayoutStatus(selectedPayout.id, status);
      if (!error) {
        // Refresh data
        fetchData();
        setShowModal(false);
      }
    } catch (err) {
      // Failed to update payout status
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 pb-20">
      {/* Main View */}
      {currentView === "main" && (
        <div className="animate-fade-in">
          {/* Header */}
          <div className="bg-green-600 text-white px-4 py-6 shadow-xl sticky top-0 z-40">
            <div className="w-full flex items-center justify-between">
              <button className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold font-inter  tracking-tighter uppercase whitespace-nowrap">
                Earning & Transactions
              </h1>
              <button className="p-2 hover:bg-white/10 rounded-xl transition-all relative active:scale-95">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 animate-pulse"></span>
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="px-4 py-6">
            <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-transparent transition-all">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-2xl px-5 py-3.5 border border-gray-100 focus-within:border-green-500 transition-all">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for transactions..."
                    className="flex-1 bg-transparent outline-none text-sm font-inter font-bold placeholder:text-gray-400"
                  />
                </div>
                <button className="px-8 py-3.5 bg-green-50 text-green-600 rounded-2xl font-black text-xs uppercase  tracking-widest hover:bg-green-100 transition-all border border-green-100">
                  Filter
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-8 py-2.5 rounded-full font-bold text-[10px] uppercase  tracking-widest whitespace-nowrap transition-all ${
                      selectedFilter === filter
                        ? "bg-green-600 text-white shadow-lg shadow-green-500/20 active:scale-95"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
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
            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-transparent transition-all animate-fadeIn overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full pointer-events-none -mr-10 -mt-10" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-green-600 font-black font-inter  tracking-tighter uppercase text-sm">
                  <span>Total earnings</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-400 font-inter ">₦</span>
                  <span className="text-5xl font-black text-gray-800 font-inter  tracking-tighter">
                    {totals.totalEarnings.toLocaleString()}
                  </span>
                </div>
                <div className="bg-green-50 p-4 rounded-3xl border border-green-100">
                  <ArrowDownRight className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="mt-8 flex justify-between items-center border-t border-gray-50 pt-6">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ">Pending Payout</span>
                <span className="text-green-600 font-black font-inter ">₦ {totals.totalPendingPayouts.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payout Management */}
          <div className="px-4 mb-6">
            <button
              onClick={() => setCurrentView("payout")}
              className="w-full bg-white rounded-[2rem] shadow-xl p-6 flex items-center justify-between hover:shadow-2xl transition-all border border-transparent animate-fadeIn group"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="font-black text-gray-800 font-inter  tracking-tighter uppercase">
                Payout Management
              </span>
              <div className="flex items-center gap-4">
                <span className="bg-green-50 text-green-600 px-5 py-1.5 rounded-full text-xs font-black  tracking-widest border border-green-100">
                  {payoutRequests.filter(p => p.status === 'pending').length}
                </span>
                <ChevronRight className="w-6 h-6 text-green-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Transactions */}
          <div className="px-4">
            <div
              className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-transparent animate-fadeIn transition-all"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-gray-800 font-inter  tracking-tighter uppercase whitespace-nowrap">
                  Transactions
                </h2>
                <div className="flex items-center gap-3 text-gray-400 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest ">21st May - 25th Aug</span>
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-6">
                {transactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-6 p-5 rounded-3xl hover:bg-gray-50 transition-all cursor-pointer group border border-transparent hover:border-gray-100 shadow-sm"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 transform group-hover:rotate-6 ${
                        transaction.type === "payout"
                          ? "bg-blue-50"
                          : "bg-green-50"
                      }`}
                    >
                      {transaction.type === "payout" ? (
                        <ArrowUpRight className="w-7 h-7 text-blue-600" />
                      ) : (
                        <ArrowDownRight className="w-7 h-7 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-800 font-inter tracking-tight mb-1 text-lg  uppercase">
                        {transaction.type}
                      </p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest  mb-2 line-clamp-1">
                        {transaction.title}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] ">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                        <span className={`px-3 py-1 bg-opacity-10 text-[10px] font-black uppercase  tracking-widest rounded-lg border ${transaction.status === 'successful' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-800 text-xl font-inter  tracking-tighter mb-1">
                        ₦{transaction.amount.toLocaleString()}
                      </p>
                      {transaction.commission > 0 && (
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ">
                          Comm. -{" "}
                          <span className="text-green-600">
                            ₦{transaction.commission.toLocaleString()}
                          </span>
                        </p>
                      )}
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
          <div className="bg-green-600 text-white px-4 py-6 shadow-xl sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <button
                onClick={() => setCurrentView("main")}
                className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold font-inter  tracking-tighter uppercase whitespace-nowrap">
                Payout Management
              </h1>
              <button className="p-2 hover:bg-white/10 rounded-xl transition-all relative active:scale-95">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 animate-pulse"></span>
              </button>
            </div>
          </div>

          {/* Total Earnings Card */}
          <div className="px-4 py-8 w-full mx-auto">
            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-transparent transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full pointer-events-none -mr-10 -mt-10" />
              <div className="flex items-center gap-2 text-green-600 font-black font-inter  tracking-tighter uppercase text-sm mb-4">
                <span>Total earnings</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-400 font-inter ">₦</span>
                  <span className="text-5xl font-black text-gray-800 font-inter  tracking-tighter">
                    {totals.totalEarnings.toLocaleString()}
                  </span>
                </div>
                <div className="bg-green-50 p-4 rounded-3xl border border-green-100">
                   <ArrowUpRight className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="mt-8 flex justify-between items-center border-t border-gray-50 pt-6">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ">Pending payouts</span>
                <span className="text-green-600 font-black font-inter ">₦ {totals.totalPendingPayouts.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payout Requests List */}
          <div className="px-4 space-y-4 w-full mx-auto">
            {payoutRequests.filter(p => p.status === 'pending').map((payout, index) => (
              <div
                key={payout.id}
                className="bg-white rounded-[2rem] shadow-lg p-6 flex items-center justify-between border border-transparent hover:shadow-2xl hover:border-green-500/20 transition-all group lg:p-8"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div>
                  <p className="font-black text-gray-800 mb-1 font-inter  tracking-tighter uppercase text-lg">
                    {payout.account_name}{" "}
                    <span className="text-green-600 text-xs  tracking-widest lowercase ml-2">
                      ({payout.user_type})
                    </span>
                  </p>
                  <p className="text-2xl font-black text-gray-800 font-inter  tracking-tighter">
                    ₦{payout.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest  mt-2">
                    {payout.bank_name} - {payout.account_number}
                  </p>
                </div>
                <button
                  onClick={() => handleCheckPayout(payout)}
                  className="px-8 py-3.5 bg-green-600 text-white font-black text-xs uppercase  tracking-widest rounded-2xl hover:bg-green-700 active:scale-95 transition-all shadow-xl shadow-green-500/20"
                >
                  Check
                </button>
              </div>
            ))}
            {payoutRequests.filter(p => p.status === 'pending').length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 font-bold  uppercase tracking-widest">No pending payouts</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders View */}
      {currentView === "orders" && (
        <div className="animate-fadeIn">
          <div className="bg-green-600 text-white px-4 py-6 shadow-xl sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <button
                onClick={() => setCurrentView("main")}
                className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold font-inter  tracking-tighter uppercase whitespace-nowrap">
                Payout Management
              </h1>
              <button className="p-2 hover:bg-white/10 rounded-xl transition-all relative active:scale-95">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 animate-pulse"></span>
              </button>
            </div>
          </div>

          {/* Total Earnings Card */}
          <div className="px-4 py-8 w-full mx-auto">
            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-transparent transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full pointer-events-none -mr-10 -mt-10" />
              <div className="flex items-center gap-2 text-green-600 font-black font-inter  tracking-tighter uppercase text-sm mb-4">
                <span>Total platform earnings</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-400 font-inter ">₦</span>
                  <span className="text-5xl font-black text-gray-800 font-inter  tracking-tighter">
                    {totals.totalEarnings.toLocaleString()}
                  </span>
                </div>
                <div className="bg-green-50 p-4 rounded-3xl border border-green-100">
                  <ArrowUpRight className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="mt-8 flex justify-between items-center border-t border-gray-50 pt-6">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ">Pending payouts pool</span>
                <span className="text-green-600 font-black font-inter ">₦ {totals.totalPendingPayouts.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payout Requests List */}
          <div className="px-4 space-y-4 w-full mx-auto pb-20">
            <h2 className="text-sm font-black text-gray-400 font-inter  tracking-tighter uppercase px-4">
              Pending Requests
            </h2>
            {payoutRequests.filter(p => p.status === 'pending').map((payout, index) => (
              <div
                key={payout.id}
                className="bg-white rounded-[2rem] shadow-lg p-6 flex items-center justify-between border border-transparent hover:shadow-2xl hover:border-green-500/20 transition-all group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div>
                  <p className="font-black text-gray-800 mb-1 font-inter  tracking-tighter uppercase text-lg">
                    {payout.account_name}
                  </p>
                  <p className="text-2xl font-black text-gray-800 font-inter  tracking-tighter">
                    ₦{payout.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest  mt-2">
                     {payout.user_type.toUpperCase()} • {payout.bank_name}
                  </p>
                </div>
                <button
                  onClick={() => handleCheckPayout(payout)}
                  className="px-8 py-3.5 bg-green-600 text-white font-black text-xs uppercase  tracking-widest rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-500/20"
                >
                  Action
                </button>
              </div>
            ))}
            {payoutRequests.filter(p => p.status === 'pending').length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-bold  uppercase tracking-widest text-xs">No pending payout requests</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn px-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-scaleUp border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full pointer-events-none -mr-16 -mt-16" />
            <div className="flex justify-end mb-4 relative z-10">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-all p-2 hover:bg-gray-50 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center relative z-10">
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <Bell className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-3xl font-black text-gray-800 mb-2 font-inter  tracking-tighter uppercase">
                Confirm Payout
              </h3>
              <p className="text-green-600 font-bold uppercase  tracking-widest text-[10px] mb-8">Payout Request Action</p>
              <p className="text-gray-600 mb-10 font-medium font-inter">
                Payout request of <span className="text-gray-800 font-black">₦{selectedPayout?.amount?.toLocaleString()}</span> for <span className="text-gray-800 font-black">{selectedPayout?.account_name}</span>.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handlePayoutAction('rejected')}
                  className="flex-1 py-4 bg-red-50 text-red-600 font-black text-xs uppercase  tracking-widest rounded-2xl transition-all active:scale-95 border border-red-100"
                >
                  Reject
                </button>
                <button
                  onClick={() => handlePayoutAction('approved')}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase  tracking-widest rounded-2xl transition-all shadow-xl active:scale-95"
                >
                  Approve
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
