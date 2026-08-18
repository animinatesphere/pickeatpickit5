/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  ChevronRight,
  X,
  Search,
} from "lucide-react";
import AdminNotificationBell from "../components/AdminNotificationBell";

import api, {
  getAdminTransactionDetail,
  reverseTransaction,
  refundAdminPayment,
  adjustCustomerWallet,
} from "../../services/api";

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
  description?: string;
  payment_reference?: string;
  txn_metadata?: Record<string, any>;
}

interface Payment {
  id: string;
  user_id: string;
  vendor_id: string;
  order_id?: string;
  amount: number;
  amount_kobo?: number;
  currency?: string;
  payment_method?: string;
  payment_type?: string;
  paystack_reference?: string;
  paystack_access_code?: string;
  paystack_transaction_id?: string;
  status: string;
  promo_code_id?: string;
  discount_amount?: number;
  subtotal?: number;
  delivery_fee?: number;
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;
  delivery_address?: string;
  payment_metadata?: Record<string, any>;
  paystack_response?: Record<string, any>;
  initialized_at?: string;
  paid_at?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentDetail extends Payment {
  user?: { id: string; name: string; email: string; phone?: string };
  order?: Record<string, any>;
  vendor?: { id: string; business_name: string };
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
  bank_code?: string;
  transfer_reference?: string;
  transfer_code?: string;
  failure_reason?: string;
}

type TabType = "transactions" | "payouts" | "payments";
type PayoutTab = "all" | "pending" | "processing" | "rejected" | "failed" | "completed";

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchTransactions = (limit = 50) =>
  api.get("/admin/transactions", { params: { limit } });

const fetchPayments = (params = {}) =>
  api.get("/admin/payments", { params });

const fetchPaymentDetail = (paymentId: string | number) =>
  api.get(`/admin/payments/${paymentId}`);

const fetchPayouts = (status?: string) =>
  api.get("/admin/payouts", {
    params: status && status !== "all" ? { status } : {},
  });

const updatePayoutStatus = (payoutId: string, status: string, approval_pin?: string) =>
  api.patch(`/admin/payouts/${payoutId}`, { status, approval_pin });

const fetchPayoutConfig = () => api.get("/admin/payout-config");
const savePayoutConfig = (payload: { vendor_threshold: number; rider_threshold: number; vendor_auto_approve: boolean; rider_auto_approve: boolean }) =>
  api.patch("/admin/payout-config", payload);

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusColor = (s: string) => {
  switch (s?.toLowerCase()) {
    case "success":
    case "completed":
    case "approved":
    case "processing":
      return "text-green-600 bg-green-50 border-green-200";
    case "otp_required":
      return "text-orange-600 bg-orange-50 border-orange-200";
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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null);
  const [detailMode, setDetailMode] = useState<'payment' | 'transaction' | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditError, setCreditError] = useState('');
  const [pinSet, setPinSet] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [reversalReason, setReversalReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [config, setConfig] = useState({ vendor_threshold: "50000", rider_threshold: "10000", vendor_auto_approve: false, rider_auto_approve: false });
  const [savingConfig, setSavingConfig] = useState(false);
  const [actionError, setActionError] = useState("");
  const [finance, setFinance] = useState<any>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const [res, summary] = await Promise.all([fetchTransactions(), api.get("/admin/finance/summary")]);
      setTransactions(Array.isArray(res.data) ? res.data : []);
      setFinance(summary.data);
    } catch (e) {
      console.error("Failed to load transactions:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadPayouts = async (status: PayoutTab = payoutTab) => {
    setLoading(true);
    try {
      const [res, configRes] = await Promise.all([
        fetchPayouts(status === "all" ? undefined : status),
        fetchPayoutConfig(),
      ]);
      const pinRes = await api.get("/admin/payout-pin");
      setPinSet(Boolean(pinRes.data.is_set));
      if (!pinRes.data.is_set) setShowPinSetup(true);
      setPayouts(Array.isArray(res.data) ? res.data : []);
      setConfig({
        vendor_threshold: String(configRes.data.vendor_threshold),
        rider_threshold: String(configRes.data.rider_threshold),
        vendor_auto_approve: Boolean(configRes.data.vendor_auto_approve),
        rider_auto_approve: Boolean(configRes.data.rider_auto_approve),
      });
    } catch (e) {
      console.error("Failed to load payouts:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await fetchPayments({ limit: 100 });
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Failed to load payments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "transactions") loadTransactions();
    else if (activeTab === "payouts") loadPayouts();
    else if (activeTab === "payments") loadPayments();
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
    setActionError("");
    try {
      const approvalPin = status === "approved" ? window.prompt("Enter your 4-digit payout approval PIN") || "" : undefined;
      if (status === "approved" && !/^\d{4}$/.test(approvalPin || "")) throw new Error("Enter your 4-digit payout approval PIN");
      await updatePayoutStatus(payoutId, status, approvalPin);
      setSelectedPayout(null);
      loadPayouts(payoutTab);
    } catch (e: any) {
      console.error("Failed to update payout:", e);
      setActionError(e?.response?.data?.detail || e?.message || "Payout action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const savePin = async () => {
    if (!/^\d{4}$/.test(pin)) return setActionError("PIN must be exactly 4 digits");
    if (pin !== confirmPin) return setActionError("PINs do not match");
    setActionLoading("pin"); setActionError("");
    try { await api.post("/admin/payout-pin", { pin }); setPinSet(true); setShowPinSetup(false); setPin(""); setConfirmPin(""); }
    catch (e: any) { setActionError(e?.response?.data?.detail || e?.message || "Could not set PIN"); }
    finally { setActionLoading(null); }
  };

  const openTransaction = async (transactionId: string) => {
    try { const { data } = await api.get(`/admin/transactions/${transactionId}`); setSelectedTransaction(data); setReversalReason(""); }
    catch (e: any) { setActionError(e?.response?.data?.detail || "Could not load transaction"); }
  };

  const openPayment = async (paymentId: string | number) => {
    try {
      const { data } = await fetchPaymentDetail(paymentId);
      setSelectedPayment({
        ...data.payment,
        user: data.user,
        order: data.order,
        vendor: data.vendor,
      });
      setReversalReason("");
    } catch (e: any) {
      setActionError(e?.response?.data?.detail || "Could not load payment");
    }
  };

  const openPaymentDetails = async (paymentId: string | number) => {
    setDetailMode('payment');
    setDetailId(String(paymentId));
    setDetailLoading(true);
    setDetailError('');
    setCreditAmount('');
    setCreditReason('');
    setCreditError('');
    try {
      const { data } = await fetchPaymentDetail(paymentId);
      setDetailData(data);
    } catch (e: any) {
      setDetailError(e?.response?.data?.detail || "Could not load payment details");
    } finally {
      setDetailLoading(false);
    }
  };

  const openTransactionDetails = async (transactionId: string) => {
    setDetailMode('transaction');
    setDetailId(transactionId);
    setDetailLoading(true);
    setDetailError('');
    setCreditAmount('');
    setCreditReason('');
    setCreditError('');
    try {
      const { data } = await getAdminTransactionDetail(transactionId);
      setDetailData(data);
    } catch (e: any) {
      setDetailError(e?.response?.data?.detail || "Could not load transaction details");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailMode(null);
    setDetailId(null);
    setDetailData(null);
    setDetailError('');
    setCreditAmount('');
    setCreditReason('');
    setCreditError('');
  };

  const refundFromDetails = async () => {
    if (!detailData) return;
    const reason = detailMode === 'payment' ? reversalReason : detailData.transaction?.description || `Reverse ${detailMode}`;
    if (!reason || reason.trim().length < 3) {
      setDetailError('Please provide a reason (min 3 characters)');
      return;
    }
    setActionLoading(detailId || '');
    setDetailError('');
    try {
      if (detailMode === 'payment') {
        const payment = detailData.payment || detailData;
        await refundAdminPayment(payment.id, { amount: payment.amount, reason: reason.trim() });
      } else {
        await reverseTransaction(detailData.transaction.id, { reason: reason.trim() });
      }
      closeDetails();
      if (detailMode === 'payment') await loadPayments();
      else await loadTransactions();
    } catch (e: any) {
      setDetailError(e?.response?.data?.detail || e?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const creditCustomerBalance = async () => {
    if (!detailData || !creditAmount || Number(creditAmount) <= 0) {
      setCreditError('Enter a valid amount');
      return;
    }
    if (!creditReason.trim() || creditReason.trim().length < 3) {
      setCreditError('Reason must be at least 3 characters');
      return;
    }
    setCreditLoading(true);
    setCreditError('');
    try {
      const userId = detailMode === 'payment' ? detailData.payment.user_id : detailData.transaction.user_id;
      await adjustCustomerWallet(userId, {
        amount: Number(creditAmount),
        reason: creditReason.trim(),
      });
      setCreditAmount('');
      setCreditReason('');
      Alert.alert('Success', 'Customer balance credited successfully');
      if (detailMode === 'payment') await loadPayments();
      else await loadTransactions();
    } catch (e: any) {
      setCreditError(e?.response?.data?.detail || e?.message || "Could not credit balance");
    } finally {
      setCreditLoading(false);
    }
  };

  const handleSaveConfig = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingConfig(true);
    setActionError("");
    try {
      await savePayoutConfig({
        vendor_threshold: Number(config.vendor_threshold),
        rider_threshold: Number(config.rider_threshold),
        vendor_auto_approve: config.vendor_auto_approve,
        rider_auto_approve: config.rider_auto_approve,
      });
      await loadPayouts(payoutTab);
    } catch (e: any) {
      setActionError(e?.response?.data?.detail || e?.message || "Could not save payout thresholds");
    } finally {
      setSavingConfig(false);
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

  const filteredPayments = payments.filter(
    (p) =>
      (p.paystack_reference || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.customer_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.customer_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.status || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          <AdminNotificationBell />
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
            onClick={() => setActiveTab("payments")}
            className={`flex-1 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === "payments"
                ? "bg-white text-green-600 shadow-lg"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Payments
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
        {finance && <section className="rounded-3xl bg-slate-950 p-5 text-white"><p className="text-xs font-black uppercase text-green-400">Vendor finances</p><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Gross sales", finance.gross_sales], ["Commission", finance.platform_commission], ["Vendor net", finance.vendor_payouts], ["Refunds", finance.refunds]].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-white/10 p-3"><p className="text-lg font-black">{fmt(Number(value))}</p><p className="text-[9px] uppercase text-slate-400">{label}</p></div>)}</div><div className="mt-4 max-h-56 space-y-2 overflow-auto">{finance.vendor_finances.map((vendor: any) => <div key={vendor.vendor_id} className="grid grid-cols-4 gap-2 rounded-xl bg-white/5 p-3 text-xs"><span className="col-span-4 font-black sm:col-span-1">{vendor.business_name}</span><span>Gross {fmt(vendor.gross_sales)}</span><span>Fee {fmt(vendor.platform_commission)}</span><span>Net {fmt(vendor.net_sales)}</span></div>)}</div></section>}

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
          <>
          <form onSubmit={handleSaveConfig} className="rounded-3xl border border-green-100 bg-green-50 p-5">
            <div className="mb-4"><p className="text-xs font-black uppercase tracking-widest text-green-700">Minimum withdrawal thresholds</p><p className="mt-1 text-xs text-green-700/70">Vendors and riders can request withdrawal after meeting these minimums.</p></div>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <label className="text-xs font-bold text-gray-600">Vendor (₦)<input required min="1" type="number" value={config.vendor_threshold} onChange={(e) => setConfig({ ...config, vendor_threshold: e.target.value })} className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-green-500" /></label>
              <label className="text-xs font-bold text-gray-600">Rider (₦)<input required min="1" type="number" value={config.rider_threshold} onChange={(e) => setConfig({ ...config, rider_threshold: e.target.value })} className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-green-500" /></label>
              <button disabled={savingConfig} className="self-end rounded-xl bg-green-600 px-5 py-3 text-xs font-black uppercase text-white disabled:opacity-50">{savingConfig ? "Saving…" : "Save"}</button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">Automatic payout approval is disabled. Every transfer requires an authorized admin’s 4-digit payout PIN.</div>
            </div>
          </form>
          {actionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{actionError}</div>}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(["all", "pending", "processing", "completed", "failed", "rejected"] as PayoutTab[]).map(
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
          </>
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
                  onClick={() => openTransaction(tx.id)}
                  className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 flex items-center justify-between group hover:border-green-200 transition-all cursor-pointer"
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
        ) : activeTab === "payments" ? (
          /* ── PAYMENTS ───────────────────────────────────────────────────── */
          <div className="space-y-3">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-20 text-gray-300">
                <CreditCard size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold uppercase tracking-widest text-sm">
                  No payments found
                </p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => openPayment(payment.id)}
                  className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 flex items-center justify-between group hover:border-green-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                      <CreditCard className="text-blue-600 w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-black text-gray-800 uppercase tracking-tighter">
                        {payment.customer_name || payment.customer_email || "Payment"}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        {payment.payment_method || "—"} • {fmtDate(payment.created_at)}
                      </p>
                      <p className="text-[10px] font-bold text-gray-300 mt-0.5 truncate max-w-[180px]">
                        Ref: {payment.paystack_reference || payment.id.slice(0, 12)}
                      </p>
                      {payment.customer_email ? (
                        <p className="text-[10px] font-bold text-gray-300 mt-0.5 truncate max-w-[180px]">
                          {payment.customer_email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-black text-gray-800 tracking-tighter">
                      {fmt(payment.amount)}
                    </p>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mt-1 inline-block ${statusColor(payment.status)}`}
                    >
                      {payment.status || "—"}
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
                { label: "Transfer reference", value: selectedPayout.transfer_reference || "—" },
                { label: "Paystack code", value: selectedPayout.transfer_code || "—" },
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
              {selectedPayout.failure_reason && <div className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{selectedPayout.failure_reason}</div>}
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
                  {selectedPayout.status}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedPayment && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-8 pb-0">
              <div>
                <h2 className="text-xl font-black text-gray-800 tracking-tighter uppercase">
                  Payment Details
                </h2>
                <p className="text-xs text-slate-400">{selectedPayment.id}</p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 mb-8 overflow-y-auto flex-1 p-8 pt-4">
              {[
                { label: "Customer", value: selectedPayment.user?.name || "—" },
                { label: "Email", value: selectedPayment.user?.email || "—" },
                { label: "Phone", value: selectedPayment.customer_phone || selectedPayment.user?.phone || "—" },
                { label: "Reference", value: selectedPayment.paystack_reference || "—" },
                { label: "Method", value: selectedPayment.payment_method || "—" },
                { label: "Type", value: selectedPayment.payment_type || "—" },
                { label: "Status", value: selectedPayment.status || "—" },
                { label: "Created", value: fmtDate(selectedPayment.created_at) },
                { label: "Verified", value: selectedPayment.verified_at ? fmtDate(selectedPayment.verified_at) : "—" },
                { label: "Paid", value: selectedPayment.paid_at ? fmtDate(selectedPayment.paid_at) : "—" },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between items-center py-2 border-b border-gray-50"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {r.label}
                  </span>
                  <span className="font-bold text-gray-800 text-sm break-all text-right">
                    {r.value}
                  </span>
                </div>
              ))}

              {selectedPayment.vendor && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Vendor
                  </span>
                  <span className="font-bold text-gray-800 text-sm">
                    {selectedPayment.vendor.business_name}
                  </span>
                </div>
              )}

              {selectedPayment.delivery_address && (
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase text-slate-400">Delivery address</p>
                  <p className="mt-1 break-all font-bold text-sm">{selectedPayment.delivery_address}</p>
                </div>
              )}

              {selectedPayment.payment_metadata && Object.keys(selectedPayment.payment_metadata).length > 0 && (
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase text-slate-400">Metadata</p>
                  <pre className="mt-1 text-[10px] text-slate-600 whitespace-pre-wrap break-all">
                    {JSON.stringify(selectedPayment.payment_metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="bg-green-50 rounded-2xl p-5 flex justify-between items-center mt-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-green-700">
                  Amount
                </span>
                <span className="text-3xl font-black text-green-600 tracking-tighter">
                  {fmt(selectedPayment.amount)}
                </span>
              </div>

              <div className="flex justify-center">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${statusColor(selectedPayment.status)}`}
                >
                  Current: {selectedPayment.status}
                </span>
              </div>
            </div>

              {selectedPayment.status === "success" && (
                <div className="mt-5">
                  <button
                    onClick={() => openPaymentDetails(selectedPayment.id)}
                    className="w-full rounded-xl bg-slate-900 py-3 font-black text-white"
                  >
                    View Full Details
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
      {showPinSetup && pinSet === false && <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/70 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-6"><h2 className="text-xl font-black">Set payout approval PIN</h2><p className="mt-1 text-sm text-slate-500">Required before any payout transfer. Use exactly 4 digits and keep it private.</p>{actionError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{actionError}</p>}<div className="mt-5 grid grid-cols-2 gap-3"><input autoFocus inputMode="numeric" maxLength={4} type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="4-digit PIN" className="rounded-xl bg-slate-100 p-3 outline-none focus:ring-2 focus:ring-green-500"/><input inputMode="numeric" maxLength={4} type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} placeholder="Confirm PIN" className="rounded-xl bg-slate-100 p-3 outline-none focus:ring-2 focus:ring-green-500"/></div><button disabled={actionLoading === "pin"} onClick={savePin} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-black text-white disabled:opacity-50">{actionLoading === "pin" && <Loader2 size={16} className="animate-spin"/>} Save approval PIN</button></div></div>}
      {selectedTransaction && <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 p-4" onClick={() => setSelectedTransaction(null)}><div className="w-full max-w-lg rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between"><div><h2 className="text-xl font-black">Transaction details</h2><p className="text-xs text-slate-400">{selectedTransaction.transaction.id}</p></div><button onClick={() => setSelectedTransaction(null)} className="rounded-xl bg-slate-100 p-2"><X size={18}/></button></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm">{[["Customer", selectedTransaction.user?.name || "—"], ["Email", selectedTransaction.user?.email || "—"], ["Current balance", fmt(selectedTransaction.user?.balance)], ["Amount", fmt(selectedTransaction.transaction.amount)], ["Type", selectedTransaction.transaction.type], ["Status", selectedTransaction.transaction.status], ["Method", selectedTransaction.transaction.payment_method || "—"], ["Reference", selectedTransaction.transaction.payment_reference || "—"]].map(([label,value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase text-slate-400">{label}</p><p className="mt-1 break-all font-bold">{value}</p></div>)}</div>{selectedTransaction.transaction.description && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{selectedTransaction.transaction.description}</p>}{selectedTransaction.transaction.status === "completed" && <div className="mt-5"><label className="text-xs font-black uppercase text-slate-500">Reversal reason<textarea value={reversalReason} onChange={(e) => setReversalReason(e.target.value)} className="mt-1 min-h-24 w-full rounded-xl bg-slate-100 p-3 text-sm normal-case outline-none focus:ring-2 focus:ring-red-500" placeholder="Why should this transaction be reversed?"/></label><p className="mb-3 text-xs text-amber-700">Credit reversal can move wallet below zero. Future top-ups automatically repay negative balance first.</p><button disabled={actionLoading === selectedTransaction.transaction.id || reversalReason.trim().length < 3} onClick={() => openTransactionDetails(selectedTransaction.transaction.id)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-black text-white disabled:opacity-50">{actionLoading === selectedTransaction.transaction.id && <Loader2 size={16} className="animate-spin"/>} View Full Details</button></div>}</div></div>}
    {detailMode && (
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[55] overflow-auto">
        <div className="min-h-screen p-4 sm:p-8">
          <div className="mx-auto max-w-3xl rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">Detail view</p>
                <h2 className="text-xl font-black text-gray-800 tracking-tighter uppercase">
                  {detailMode === 'payment' ? 'Payment Details' : 'Transaction Details'}
                </h2>
                <p className="text-xs text-slate-400">{detailId}</p>
              </div>
              <button onClick={closeDetails} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {detailLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
              </div>
            )}

            {detailError && !detailLoading && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{detailError}</div>
            )}

            {!detailLoading && !detailError && detailData && (
              <div className="space-y-6">
                {detailMode === 'payment' ? (
                  <>
                    {(() => {
                      const payment = detailData.payment || detailData;
                      const user = detailData.user;
                      const vendor = detailData.vendor;
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {[
                              ["Customer", user?.name || payment.customer_name || "—"],
                              ["Email", user?.email || payment.customer_email || "—"],
                              ["Phone", user?.phone || payment.customer_phone || "—"],
                              ["Reference", payment.paystack_reference || "—"],
                              ["Method", payment.payment_method || "—"],
                              ["Type", payment.payment_type || "—"],
                              ["Status", payment.status || "—"],
                              ["Amount", fmt(payment.amount)],
                              ["Subtotal", fmt(payment.subtotal)],
                              ["Delivery fee", fmt(payment.delivery_fee)],
                              ["Discount", fmt(payment.discount_amount)],
                              ["Currency", payment.currency || "NGN"],
                              ["Created", fmtDate(payment.created_at)],
                              ["Initialized", payment.initialized_at ? fmtDate(payment.initialized_at) : "—"],
                              ["Verified", payment.verified_at ? fmtDate(payment.verified_at) : "—"],
                              ["Paid", payment.paid_at ? fmtDate(payment.paid_at) : "—"],
                            ].map(([label, value]) => (
                              <div key={String(label)} className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
                                <p className="mt-1 break-all font-bold">{value}</p>
                              </div>
                            ))}
                          </div>

                          {vendor && (
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[10px] font-black uppercase text-slate-400">Vendor</p>
                              <p className="mt-1 break-all font-bold">{vendor.business_name}</p>
                            </div>
                          )}

                          {payment.delivery_address && (
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[10px] font-black uppercase text-slate-400">Delivery address</p>
                              <p className="mt-1 break-all font-bold">{payment.delivery_address}</p>
                            </div>
                          )}

                          {payment.payment_metadata && Object.keys(payment.payment_metadata).length > 0 && (
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[10px] font-black uppercase text-slate-400">Payment metadata</p>
                              <pre className="mt-1 text-[10px] text-slate-600 whitespace-pre-wrap break-all">
                                {JSON.stringify(payment.payment_metadata, null, 2)}
                              </pre>
                            </div>
                          )}

                          {payment.paystack_response && (
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[10px] font-black uppercase text-slate-400">Paystack response</p>
                              <pre className="mt-1 text-[10px] text-slate-600 whitespace-pre-wrap break-all">
                                {JSON.stringify(payment.paystack_response, null, 2)}
                              </pre>
                            </div>
                          )}

                          <div className="flex justify-center">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${statusColor(payment.status)}`}>
                              Current: {payment.status}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    {(() => {
                      const txn = detailData.transaction || detailData;
                      const user = detailData.user;
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {[
                              ["Customer", user?.name || "—"],
                              ["Email", user?.email || "—"],
                              ["Current balance", fmt(user?.balance)],
                              ["Amount", fmt(txn.amount)],
                              ["Type", txn.type],
                              ["Status", txn.status],
                              ["Method", txn.payment_method || "—"],
                              ["Reference", txn.payment_reference || "—"],
                              ["Created", fmtDate(txn.created_at)],
                            ].map(([label, value]) => (
                              <div key={String(label)} className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
                                <p className="mt-1 break-all font-bold">{value}</p>
                              </div>
                            ))}
                          </div>

                          {txn.description && (
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[10px] font-black uppercase text-slate-400">Description</p>
                              <p className="mt-1 break-all font-bold">{txn.description}</p>
                            </div>
                          )}

                          {txn.txn_metadata && Object.keys(txn.txn_metadata).length > 0 && (
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[10px] font-black uppercase text-slate-400">Metadata</p>
                              <pre className="mt-1 text-[10px] text-slate-600 whitespace-pre-wrap break-all">
                                {JSON.stringify(txn.txn_metadata, null, 2)}
                              </pre>
                            </div>
                          )}

                          <div className="flex justify-center">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${statusColor(txn.status)}`}>
                              Current: {txn.status}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {!detailLoading && !detailError && detailData && (
              <div className="mt-8 space-y-4">
                {detailError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{detailError}</div>}
                {creditError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{creditError}</div>}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Credit customer balance</p>
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <label className="text-xs font-bold text-gray-600">
                      Amount (₦)
                      <input
                        required
                        min="1"
                        type="number"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        placeholder="0"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </label>
                    <label className="text-xs font-bold text-gray-600">
                      Reason
                      <input
                        required
                        minLength={3}
                        type="text"
                        value={creditReason}
                        onChange={(e) => setCreditReason(e.target.value)}
                        placeholder="Refund / compensation / reversal"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </label>
                    <button
                      disabled={creditLoading}
                      onClick={creditCustomerBalance}
                      className="self-end rounded-xl bg-green-600 px-5 py-3 text-xs font-black uppercase text-white disabled:opacity-50"
                    >
                      {creditLoading ? "Crediting..." : "Credit balance"}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">Positive amount credits the customer. Negative amount debits the customer.</p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-red-700 mb-3">
                    {detailMode === 'payment' ? 'Refund payment' : 'Reverse transaction'}
                  </p>
                  <label className="text-xs font-black uppercase text-slate-500">
                    Reason
                    <textarea
                      value={reversalReason}
                      onChange={(e) => setReversalReason(e.target.value)}
                      className="mt-1 min-h-24 w-full rounded-xl bg-white border border-red-200 p-3 text-sm normal-case outline-none focus:ring-2 focus:ring-red-500"
                      placeholder={detailMode === 'payment' ? "Why should this payment be refunded?" : "Why should this transaction be reversed?"}
                    />
                  </label>
                  <p className="mb-3 text-xs text-red-700">
                    {detailMode === 'payment'
                      ? 'Refunding will reverse the payment back to the customer via Paystack and update the order status.'
                      : 'Credit reversal can move wallet below zero. Future top-ups automatically repay negative balance first.'}
                  </p>
                  <button
                    disabled={actionLoading === detailId || !reversalReason.trim() || reversalReason.trim().length < 3}
                    onClick={refundFromDetails}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-black text-white disabled:opacity-50"
                  >
                    {actionLoading === detailId ? "Processing..." : (detailMode === 'payment' ? "Refund payment" : "Reverse transaction")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
