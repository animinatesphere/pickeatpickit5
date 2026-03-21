import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bell,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  ChevronRight,
  X,
} from "lucide-react";
import api from "../../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Transaction {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  type: string;
  status: string;
  payment_method: string;
  created_at: string;
}

interface Payout {
  id: string;
  user_id: string;
  user_type: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

type TabType = "transactions" | "payouts";
type PayoutTab = "all" | "pending" | "approved" | "rejected";

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchTransactions = (limit = 50) =>
  api.get("/admin/transactions", { params: { limit } });

const fetchPayouts = (status?: string) =>
  api.get("/admin/payouts", {
    params: status && status !== "all" ? { status } : {},
  });

const updatePayoutStatus = (payoutId: string, status: string) =>
  api.patch(`/admin/payouts/${payoutId}/status`, null, { params: { status } });

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusColor = (s: string) => {
  switch (s?.toLowerCase()) {
    case "success":
    case "completed":
    case "approved":
      return "text-green-600 bg-green-50 border-green-200";
    case "pending":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "failed":
    case "rejected":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const fmt = (n: number) => `₦${Number(n || 0).toLocaleString()}`;

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ── Component ─────────────────────────────────────────────────────────────────
export default function Transaction() {
  const [activeTab, setActiveTab] = useState<TabType>("transactions");
  const [payoutTab, setPayoutTab] = useState<PayoutTab>("pending");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetchTransactions();
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Failed to load transactions:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadPayouts = async (status: PayoutTab = payoutTab) => {
    setLoading(true);
    try {
      const res = await fetchPayouts(status === "all" ? undefined : status);
      setPayouts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Failed to load payouts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "transactions") loadTransactions();
    else loadPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handlePayoutTabChange = (tab: PayoutTab) => {
    setPayoutTab(tab);
    loadPayouts(tab);
  };

  // ── Update payout status ────────────────────────────────────────────────────
  const handleUpdatePayout = async (
    payoutId: string,
    status: "approved" | "rejected",
  ) => {
    setActionLoading(payoutId);
    try {
      await updatePayoutStatus(payoutId, status);
      setSelectedPayout(null);
      loadPayouts(payoutTab);
    } catch (e) {
      console.error("Failed to update payout:", e);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filtered ────────────────────────────────────────────────────────────────
  const filteredTransactions = transactions.filter(
    (t) =>
      t.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.payment_method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id?.includes(searchQuery),
  );

  const filteredPayouts = payouts.filter(
    (p) =>
      p.account_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bank_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id?.includes(searchQuery),
  );

  // ── Summary stats ────────────────────────────────────────────────────────────
  const totalVolume = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const pendingPayouts = payouts.filter((p) => p.status === "pending").length;
  const totalPayouts = payouts.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-green-600 text-white px-6 py-4 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold tracking-tighter uppercase">
            Earnings & Transactions
          </h1>
          <button className="p-2 hover:bg-white/20 rounded-full transition-all relative">
            <Bell size={22} />
            {pendingPayouts > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-green-600 text-[9px] font-black flex items-center justify-center">
                {pendingPayouts}
              </span>
            )}
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === "transactions"
                ? "bg-white text-green-600 shadow-lg"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`flex-1 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === "payouts"
                ? "bg-white text-green-600 shadow-lg"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Payouts
            {pendingPayouts > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] rounded-full font-black">
                {pendingPayouts}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* ── Summary cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
            <DollarSign size={18} className="text-green-600 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Volume
            </p>
            <p className="text-lg font-black text-gray-800 tracking-tighter">
              {fmt(totalVolume)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
            <Clock size={18} className="text-orange-500 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Pending
            </p>
            <p className="text-lg font-black text-gray-800 tracking-tighter">
              {pendingPayouts}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
            <CreditCard size={18} className="text-blue-600 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Payouts
            </p>
            <p className="text-lg font-black text-gray-800 tracking-tighter">
              {fmt(totalPayouts)}
            </p>
          </div>
        </div>

        {/* ── Search ─────────────────────────────────────────────────────────── */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "transactions"
                ? "Search transactions..."
                : "Search payouts..."
            }
            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-gray-800 text-sm font-medium"
          />
        </div>

        {/* ── Payout sub-tabs ─────────────────────────────────────────────────── */}
        {activeTab === "payouts" && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(["all", "pending", "approved", "rejected"] as PayoutTab[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => handlePayoutTabChange(tab)}
                  className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                    payoutTab === tab
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
        )}

        {/* ── Content ────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          </div>
        ) : activeTab === "transactions" ? (
          /* ── TRANSACTIONS ────────────────────────────────────────────────── */
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-20 text-gray-300">
                <DollarSign size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold uppercase tracking-widest text-sm">
                  No transactions found
                </p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 flex items-center justify-between group hover:border-green-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                      <DollarSign className="text-green-600 w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-black text-gray-800 uppercase tracking-tighter">
                        {tx.type || "Payment"}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        {tx.payment_method || "—"} • {fmtDate(tx.created_at)}
                      </p>
                      <p className="text-[10px] font-bold text-gray-300 mt-0.5 truncate max-w-[180px]">
                        ID: {tx.id.slice(0, 12)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-black text-gray-800 tracking-tighter">
                      {fmt(tx.amount)}
                    </p>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mt-1 inline-block ${statusColor(tx.status)}`}
                    >
                      {tx.status || "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ── PAYOUTS ─────────────────────────────────────────────────────── */
          <div className="space-y-3">
            {filteredPayouts.length === 0 ? (
              <div className="text-center py-20 text-gray-300">
                <CreditCard size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold uppercase tracking-widest text-sm">
                  No payout requests
                </p>
              </div>
            ) : (
              filteredPayouts.map((payout) => (
                <div
                  key={payout.id}
                  onClick={() => setSelectedPayout(payout)}
                  className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 hover:border-green-200 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                        <CreditCard className="text-blue-600 w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-black text-gray-800 uppercase tracking-tighter">
                          {payout.account_name || "—"}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                          {payout.bank_name || "—"} •{" "}
                          {payout.account_number || "—"}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                          {payout.user_type || "user"} •{" "}
                          {fmtDate(payout.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <div>
                        <p className="text-xl font-black text-gray-800 tracking-tighter">
                          {fmt(payout.amount)}
                        </p>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mt-1 inline-block ${statusColor(payout.status)}`}
                        >
                          {payout.status}
                        </span>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-gray-300 group-hover:text-green-600 transition-colors ml-2"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Payout detail modal ─────────────────────────────────────────────── */}
      {selectedPayout && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSelectedPayout(null)}
        >
          <div
            className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-gray-800 tracking-tighter uppercase">
                Payout Request
              </h2>
              <button
                onClick={() => setSelectedPayout(null)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-4 mb-8">
              {[
                {
                  label: "Account Name",
                  value: selectedPayout.account_name || "—",
                },
                { label: "Bank", value: selectedPayout.bank_name || "—" },
                {
                  label: "Account Number",
                  value: selectedPayout.account_number || "—",
                },
                { label: "User Type", value: selectedPayout.user_type || "—" },
                {
                  label: "Requested",
                  value: fmtDate(selectedPayout.created_at),
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between items-center py-2 border-b border-gray-50"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {r.label}
                  </span>
                  <span className="font-bold text-gray-800 text-sm">
                    {r.value}
                  </span>
                </div>
              ))}

              {/* Amount */}
              <div className="bg-green-50 rounded-2xl p-5 flex justify-between items-center mt-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-green-700">
                  Amount
                </span>
                <span className="text-3xl font-black text-green-600 tracking-tighter">
                  {fmt(selectedPayout.amount)}
                </span>
              </div>

              {/* Current status */}
              <div className="flex justify-center">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${statusColor(selectedPayout.status)}`}
                >
                  Current: {selectedPayout.status}
                </span>
              </div>
            </div>

            {/* Action buttons — only show if pending */}
            {selectedPayout.status === "pending" ? (
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleUpdatePayout(selectedPayout.id, "rejected")
                  }
                  disabled={actionLoading === selectedPayout.id}
                  className="flex-1 py-4 border-2 border-red-200 text-red-500 font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 text-xs"
                >
                  {actionLoading === selectedPayout.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <XCircle size={16} />
                  )}
                  Reject
                </button>
                <button
                  onClick={() =>
                    handleUpdatePayout(selectedPayout.id, "approved")
                  }
                  disabled={actionLoading === selectedPayout.id}
                  className="flex-[2] py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-green-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 text-xs"
                >
                  {actionLoading === selectedPayout.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  Approve Payout
                </button>
              </div>
            ) : (
              <div className="text-center">
                <span
                  className={`text-sm font-black uppercase tracking-widest px-6 py-3 rounded-2xl border ${statusColor(selectedPayout.status)}`}
                >
                  {selectedPayout.status === "approved"
                    ? "✓ Payout Approved"
                    : "✗ Payout Rejected"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
