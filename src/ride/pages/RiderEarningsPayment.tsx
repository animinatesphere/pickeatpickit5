import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowUpCircle,
  Eye,
  ChevronDown,
  Loader2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import { RiderNav } from "../component/RiderNav";
import { supabase } from "../../services/authService";
import { 
  getRiderTransactions, 
  getRiderBankInfo, 
  saveRiderBankInfo, 
  getRiderEarningsHistory,
  getRiderStats 
} from "../../services/api";

const RiderEarningsPayment = () => {
  const [activeTab, setActiveTab] = useState<"transactions" | "orders">(
    "transactions"
  );
  const [showEarnings, setShowEarnings] = useState(true);
  const [currentPage, setCurrentPage] = useState<"main" | "payment">("main");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Rider specific state
  const [riderId, setRiderId] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    account_number: "",
    account_name: ""
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    pendingPayout: 0
  });

  const banks = [
    "Guaranty Trust Bank",
    "Access Bank",
    "First Bank of Nigeria",
    "Zenith Bank",
    "United Bank for Africa",
    "Fidelity Bank",
  ];

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: rider } = await supabase
          .from('riders')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (rider) {
          setRiderId(rider.id);
          await loadRiderData(rider.id);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadRiderData = async (id: string) => {
    const [txData, bankData, orderData, statsData] = await Promise.all([
      getRiderTransactions(id),
      getRiderBankInfo(id),
      getRiderEarningsHistory(id),
      getRiderStats(id)
    ]);

    if (txData.data) setTransactions(txData.data);
    if (bankData.data) {
      setBankDetails({
        bank_name: bankData.data.bank_name || "",
        account_number: bankData.data.account_number || "",
        account_name: bankData.data.account_name || ""
      });
    }
    if (orderData.data) setOrders(orderData.data);
    if (statsData) {
      setStats({
        todayEarnings: statsData.todayEarnings || 0,
        pendingPayout: statsData.todayEarnings // Simplified for now
      });
    }
  };

  const handleSaveBankInfo = async () => {
    if (!riderId) return;
    setSaving(true);
    setError(null);
    try {
      const { error: saveError } = await saveRiderBankInfo(riderId, bankDetails);
      if (saveError) throw saveError;
      setCurrentPage("main");
    } catch (err: any) {
      setError(err.message || "Failed to save bank information");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold italic uppercase tracking-widest">Scanning network...</p>
      </div>
    );
  }

  if (currentPage === "payment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <RiderNav />
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage("main")}
                className="hover:bg-white/10 p-2 rounded-full transition-all duration-300 transform hover:scale-110"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-semibold">Earnings and Payment</h1>
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-800">Update Intel</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Payment Routing Protocol</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest flex items-center gap-2">Unit Identifier</label>
              <select
                value={bankDetails.bank_name}
                onChange={(e) => setBankDetails({...bankDetails, bank_name: e.target.value})}
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-gray-800 font-bold shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none appearance-none"
              >
                <option value="">Select Target Bank</option>
                {banks.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest">Target Account Number</label>
              <input
                type="text"
                value={bankDetails.account_number}
                onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value})}
                placeholder="10 Digits Only"
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-gray-800 font-bold shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest">Payee Alias</label>
              <input
                type="text"
                value={bankDetails.account_name}
                onChange={(e) => setBankDetails({...bankDetails, account_name: e.target.value})}
                placeholder="Full Name as per records"
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-gray-800 font-bold shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSaveBankInfo}
            disabled={saving}
            className="w-full bg-green-600 text-white py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-xl shadow-green-600/20 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : "Verify and Save Intel"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <RiderNav />
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-3 bg-gray-50 rounded-2xl text-gray-700 active:scale-90 transition-transform"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black italic text-gray-800 uppercase tracking-tighter">Earnings Intel</h1>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><TrendingUp size={20} /></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Earnings Dashboard */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500 italic">Total Operational Revenue</span>
              <ChevronDown size={14} className="text-green-500 animate-bounce" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h2 className="text-6xl font-black italic tracking-tighter mb-2">
                  {showEarnings ? `₦${stats.todayEarnings.toLocaleString()}` : "₦ ••••••"}
                </h2>
                <div className="flex items-center gap-2 text-gray-400 font-bold italic uppercase text-[10px] tracking-widest">
                  <span>Authorized Pending:</span>
                  <span className="text-green-500 font-black">₦{stats.pendingPayout.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEarnings(!showEarnings)}
                  className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all active:scale-90"
                >
                  <Eye size={24} className={showEarnings ? "text-green-500" : "text-gray-500"} />
                </button>
                <div 
                  onClick={() => setCurrentPage("payment")}
                  className="px-6 h-14 bg-green-600 hover:bg-green-700 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-90 shadow-xl shadow-green-600/20 cursor-pointer"
                >
                  <span className="font-black italic uppercase text-xs tracking-widest">Setup Wallet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-white rounded-3xl p-2 shadow-xl shadow-gray-200/50 border border-gray-50">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 py-4 rounded-2xl font-black italic uppercase tracking-widest transition-all ${
              activeTab === "transactions" 
                ? "bg-green-600 text-white shadow-xl shadow-green-600/20 scale-105" 
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            Payloads
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-4 rounded-2xl font-black italic uppercase tracking-widest transition-all ${
              activeTab === "orders" 
                ? "bg-green-600 text-white shadow-xl shadow-green-600/20 scale-105" 
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            History
          </button>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-4">
          {activeTab === "transactions" ? (
            transactions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <p className="text-gray-300 font-bold italic uppercase tracking-widest">No transactions logged</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <ArrowUpCircle className="text-green-600 w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black italic uppercase tracking-tighter text-gray-800">{tx.title || "Withdrawal"}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {new Date(tx.created_at).toLocaleString()} | <span className="text-green-600 uppercase italic">SUCCESS</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black italic text-gray-800 tracking-tighter">-₦{tx.amount.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Service Charge: ₦{tx.commission || 0}</p>
                  </div>
                </div>
              ))
            )
          ) : (
            orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <p className="text-gray-300 font-bold italic uppercase tracking-widest">No completed missions</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 flex items-center justify-between group">
                   <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="text-blue-600 w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black italic uppercase tracking-tighter text-gray-800">Deployment ID: #{order.id.slice(0, 8)}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        Completed {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black italic text-green-600 tracking-tighter">₦{order.total_amount.toLocaleString()}</p>
                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase italic tracking-widest">Verified</span>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Action Footbar */}
        <div className="flex flex-col gap-4">
          <button 
            disabled={stats.todayEarnings === 0}
            className="w-full py-6 bg-green-600 text-white rounded-3xl font-black italic uppercase tracking-widest shadow-xl shadow-green-600/20 active:scale-95 transition-all text-sm disabled:opacity-50"
          >
            Authorize Withdrawal
          </button>
          <button 
            className="w-full py-6 bg-white border border-gray-100 text-gray-500 rounded-3xl font-black italic uppercase tracking-widest shadow-lg active:scale-95 transition-all text-sm"
          >
            Generate Intel Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderEarningsPayment;
