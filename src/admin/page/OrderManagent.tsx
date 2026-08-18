/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { ChevronRight, ArrowLeft, Loader2, X } from "lucide-react";
import AdminNotificationBell from "../components/AdminNotificationBell";
import api from "../../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderStatus =
  | "Completed"
  | "Pending"
  | "Cancelled"
  | "Preparing"
  | "Ready"
  | "Accepted"
  | "Picked_up";
type StatusTab = "All" | "Pending" | "Accepted" | "Preparing" | "Ready" | "Picked_up" | "Completed" | "Cancelled" | "Failed";
type Screen = "main" | "details" | "status-control";
type AdminAction = { kind: "assign" | "status" | "refund" | "compensation" | "note" | "dispute" | "resolve"; value?: string; amount?: string; reason?: string; ticketId?: string };

interface Order {
  id: string;
  restaurant_name: string;
  delivery_address: string;
  customer_phone: string;
  total_amount: number;
  delivery_fee: number;
  rider_commission: number;
  items_count: number;
  status: OrderStatus;
  created_at: string;
  order_items: any[];
  vendor: any;
  cancellation_reason?: string;
  failure_reason?: string;
}

interface OrderDetail {
  id: string;
  title: string;
  price: string;
  quantity: string;
  status: string;
  items: Array<{ quantity: number; name: string; price: string }>;
  serviceCharges: string;
  deliveryCharges: string;
  riderCommission: string;
  total: string;
  deliverTo: string;
  customerPhone: string;
  vendorName: string;
  vendorPhone: string;
  itemImage: string;
  reason: string;
  timeline: any[];
  payment: any;
  internalNotes: any[];
  customerEmail: string;
  riderName: string;
  riderPhone: string;
  supportTickets: any[];
}

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchAdminOrders = (params: { limit?: number; status?: string; period?: string; search?: string; payment_status?: string; date_from?: string; date_to?: string } = {}) =>
  api.get("/admin/orders", { params: { limit: 100, ...params } });

// ── Helpers ───────────────────────────────────────────────────────────────────
const capitalise = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "Unknown";

const statusColor = (s: string) => {
  switch (s.toLowerCase()) {
    case "completed":
      return "text-green-600";
    case "pending":
      return "text-yellow-600";
    case "cancelled":
    case "failed":
      return "text-red-600";
    case "preparing":
      return "text-blue-600";
    case "ready":
      return "text-cyan-600";
    case "accepted":
      return "text-indigo-600";
    case "picked_up":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

const statusBg = (s: string) => {
  switch (s.toLowerCase()) {
    case "completed":
      return "bg-green-600";
    case "pending":
      return "bg-yellow-500";
    case "cancelled":
    case "failed":
      return "bg-red-600";
    case "preparing":
      return "bg-blue-600";
    case "ready":
      return "bg-cyan-600";
    case "accepted":
      return "bg-indigo-600";
    case "picked_up":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

// ── Component ─────────────────────────────────────────────────────────────────
const OrderManagement: React.FC<{ initialStatus?: string; initialPeriod?: string; initialSearch?: string }> = ({ initialStatus, initialPeriod, initialSearch }) => {
  const [activeTab, setActiveTab] = useState<StatusTab>((initialStatus ? capitalise(initialStatus) : "All") as StatusTab);
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [riders, setRiders] = useState<any[]>([]);
  const [action, setAction] = useState<AdminAction | null>(null);
  const [actionError, setActionError] = useState("");

  // ── Fetch orders ────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminOrders({ status: initialStatus, period: initialPeriod, ...(searchQuery ? { search: searchQuery } : {}), ...(paymentStatus ? { payment_status: paymentStatus } : {}), ...(dateFrom ? { date_from: new Date(dateFrom).toISOString() } : {}), ...(dateTo ? { date_to: new Date(`${dateTo}T23:59:59`).toISOString() } : {}) });
      const raw: any[] = Array.isArray(res.data) ? res.data : [];
      const mapped: Order[] = raw.map((o) => ({
        id: o.id,
        restaurant_name:
          o.restaurant_name || o.vendor?.business_name || "Unknown",
        delivery_address: o.delivery_address || "—",
        customer_phone: o.customer_phone || "—",
        total_amount: Number(o.total_amount) || 0,
        delivery_fee: Number(o.delivery_fee) || 0,
        rider_commission: Number(o.rider_commission) || 0,
        items_count: Number(o.items_count) || o.order_items?.length || 0,
        status: capitalise(o.status) as OrderStatus,
        created_at: o.created_at,
        order_items: o.order_items || [],
        vendor: o.vendor || null,
        cancellation_reason: o.cancellation_reason,
        failure_reason: o.failure_reason,
      }));
      setOrders(mapped);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setLoading(false);
    }
  }, [initialStatus, initialPeriod, searchQuery, paymentStatus, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Open order detail ───────────────────────────────────────────────────────
  const handleCheckClick = async (orderId: string) => {
    setDetailLoading(true);
    try {
      const [res, riderResponse] = await Promise.all([api.get(`/admin/orders/${orderId}/command`), api.get("/admin/riders", { params: { status: "accepted", limit: 100 } })]);
      const command: any = res.data; const d = command.order; setRiders(riderResponse.data || []);

      const detail: OrderDetail = {
        id: d.id,
        title: d.order_items?.[0]?.menu_item?.name || "Multiple Items",
        price: `₦${(d.total_amount || 0).toLocaleString()}`,
        quantity: `×${d.items_count || d.order_items?.length || 1}`,
        status: capitalise(d.status),
        items: (d.order_items || []).map((item: any) => ({
          quantity: item.quantity,
          name: item.menu_item?.name || "Unknown Item",
          price: `₦${(item.price || 0).toLocaleString()}`,
        })),
        serviceCharges: "—",
        deliveryCharges: `₦${(d.delivery_fee || 0).toLocaleString()}`,
        riderCommission: `₦${(d.rider_commission || 0).toLocaleString()}`,
        total: `₦${(d.total_amount || 0).toLocaleString()}`,
        deliverTo: d.delivery_address || "—",
        customerPhone: d.customer_phone || "—",
        vendorName: d.vendor?.business_name || "—",
        vendorPhone: d.vendor?.business_phone || "—",
        itemImage: d.order_items?.[0]?.menu_item?.image_url || "",
        reason: d.cancellation_reason || d.failure_reason || "No reason recorded",
        timeline: [...(command.payment_events || []).map((event: any) => ({ status: `Payment ${event.new_status}`, timestamp: event.created_at, actor_type: event.changed_by, notes: event.change_reason })), ...(command.timeline || [])].sort((a: any, b: any) => new Date(a.timestamp || a.created_at).getTime() - new Date(b.timestamp || b.created_at).getTime()),
        payment: command.payment,
        internalNotes: command.internal_notes || [],
        customerEmail: d.user?.email || "",
        riderName: d.rider ? `${d.rider.firstname || ""} ${d.rider.lastname || ""}`.trim() : "Unassigned",
        riderPhone: d.rider?.phone || "",
        supportTickets: command.support_tickets || [],
      };

      setSelectedOrder(detail);
      setCurrentScreen("details");
    } catch (e) {
      console.error("Failed to fetch order detail:", e);
    } finally {
      setDetailLoading(false);
    }
  };

  const runAdminAction = async () => {
    if (!selectedOrder || !action) return;
    const reason = action.reason?.trim() || "";
    const amount = Number(action.amount);
    if (["status", "refund", "compensation", "note", "dispute", "resolve"].includes(action.kind) && reason.length < 5) {
      setActionError("Add a clear reason or note of at least 5 characters."); return;
    }
    if (["refund", "compensation"].includes(action.kind) && (!Number.isFinite(amount) || amount <= 0)) {
      setActionError("Enter a valid amount greater than zero."); return;
    }
    if (action.kind === "assign" && !action.value) { setActionError("Choose a rider."); return; }
    setActionError("");
    setUpdatingStatus(selectedOrder.id);
    try {
      if (action.kind === "assign") await api.post(`/admin/orders/${selectedOrder.id}/assign-rider`, { rider_id: action.value, note: reason || "Manual admin assignment" });
      if (action.kind === "status") await api.patch(`/orders/${selectedOrder.id}`, { status: action.value, ...(action.value === "cancelled" ? { cancellation_reason: reason } : {}), admin_override_reason: reason });
      if (action.kind === "refund" || action.kind === "compensation") await api.post(`/admin/orders/${selectedOrder.id}/${action.kind}`, { amount, reason, idempotency_key: `${action.kind}:${selectedOrder.id}:${amount.toFixed(2)}:${reason}` });
      if (action.kind === "note") await api.post(`/admin/orders/${selectedOrder.id}/notes`, { note: reason });
      if (action.kind === "dispute") await api.post("/admin/issues", { subject_type: "order", subject_id: selectedOrder.id, category: "dispute", summary: reason, severity: "high" });
      if (action.kind === "resolve") await api.patch(`/support/tickets/${action.ticketId}`, { status: "resolved", resolution: reason });
      setAction(null);
      await Promise.all([fetchOrders(), handleCheckClick(selectedOrder.id)]);
    } catch (e: any) {
      setActionError(e.response?.data?.detail || "Action failed. Nothing was changed.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openOrderStatusAction = async (order: Order, next: string) => {
    await handleCheckClick(order.id);
    setAction({ kind: "status", value: next, reason: "" });
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const filteredOrders =
    activeTab === "All"
      ? orders
      : orders.filter(
          (o) => o.status.toLowerCase() === activeTab.toLowerCase(),
        );

  const statusOrders = orders
    .filter((o) =>
      ["Pending", "Accepted", "Preparing", "Ready", "Picked_up"].includes(o.status),
    )
    .slice(0, 10);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      {/* ── MAIN LIST ─────────────────────────────────────────────────────── */}
      {currentScreen === "main" && (
        <div>
          {/* Header */}
          <div className="bg-green-600 text-white p-6 sticky top-0 z-40 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black">ALL ORDERS</span>
              <h1 className="text-xl font-bold tracking-tighter uppercase">
                Order Management
              </h1>
              <AdminNotificationBell />
            </div>
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(
                ["All", "Pending", "Accepted", "Preparing", "Ready", "Picked_up", "Completed", "Cancelled", "Failed"] as StatusTab[]
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-2xl whitespace-nowrap transition-all font-bold text-xs uppercase tracking-widest ${
                    activeTab === tab
                      ? "bg-white text-green-600 shadow-xl scale-105"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {tab}
                  <span className="ml-1.5 opacity-60">
                    (
                    {tab === "All"
                      ? orders.length
                      : orders.filter(
                          (o) => o.status.toLowerCase() === tab.toLowerCase(),
                        ).length}
                    )
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-5"><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchOrders()} placeholder="Order, customer, vendor, rider, phone" className="rounded-xl bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-green-500 sm:col-span-2"/><select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="rounded-xl bg-slate-50 p-3 text-sm"><option value="">Any payment</option>{["pending","success","failed","refunded"].map(value => <option key={value}>{value}</option>)}</select><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="rounded-xl bg-slate-50 p-3 text-sm"/><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="rounded-xl bg-slate-50 p-3 text-sm"/><button onClick={fetchOrders} className="rounded-xl bg-slate-950 p-3 text-xs font-black text-white sm:col-span-2 lg:col-span-5">Search orders</button></div>
            {/* Control buttons */}
            <button
              onClick={() => setCurrentScreen("status-control")}
              className="w-full flex justify-between items-center p-5 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all group"
            >
              <span className="font-bold text-gray-800 tracking-tighter uppercase">
                Order Status Control
              </span>
              <ChevronRight
                className="text-green-600 group-hover:translate-x-1 transition-transform"
                size={24}
              />
            </button>

            <button onClick={() => setActiveTab("Cancelled")} className="w-full flex justify-between items-center p-5 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all group">
              <div>
                <span className="font-bold text-gray-800 tracking-tighter uppercase">
                  Order Disputes{" "}
                </span>
                <span className="text-green-600 font-black animate-pulse">
                  ({orders.filter((o) => o.status === "Cancelled").length})
                </span>
              </div>
              <ChevronRight
                className="text-green-600 group-hover:translate-x-1 transition-transform"
                size={24}
              />
            </button>

            {/* Orders */}
            <div className="space-y-4 mt-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-20 text-gray-300">
                  <p className="font-bold uppercase tracking-widest">
                    No orders found
                  </p>
                </div>
              ) : (
                filteredOrders.map((order, i) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-[2.5rem] p-5 shadow-xl hover:shadow-2xl transition-all"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex gap-5">
                      {/* Image / placeholder */}
                      <div className="relative flex-shrink-0">
                        {order.order_items?.[0]?.menu_item?.image_url ? (
                          <img
                            src={order.order_items[0].menu_item.image_url}
                            alt="item"
                            className="w-24 h-24 rounded-3xl object-cover shadow-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-3xl bg-green-50 flex items-center justify-center shadow-lg">
                            <span className="text-3xl">🍽️</span>
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-2 -right-2 w-7 h-7 ${statusBg(order.status)} rounded-full border-4 border-white flex items-center justify-center`}
                        >
                          <span className="text-white text-[8px] font-black">
                            !
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <div className="min-w-0">
                            <h3 className="font-black text-gray-800 tracking-tighter uppercase truncate">
                              {order.restaurant_name}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                              {new Date(order.created_at).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate">
                              {order.delivery_address}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCheckClick(order.id)}
                            disabled={detailLoading}
                            className="px-4 py-1.5 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95 flex-shrink-0 disabled:opacity-60"
                          >
                            {detailLoading ? "..." : "Details"}
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Total:{" "}
                            <span className="font-black text-gray-800 text-sm">
                              ₦{order.total_amount.toLocaleString()}
                            </span>
                          </p>
                          <span
                            className={`font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg ${statusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ORDER DETAILS ─────────────────────────────────────────────────── */}
      {currentScreen === "details" && selectedOrder && (
        <div className="h-screen overflow-y-auto">
          <div className="bg-green-600 text-white p-6 sticky top-0 z-40 shadow-xl">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setCurrentScreen("main");
                  setSelectedOrder(null);
                }}
                className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-bold tracking-tighter uppercase">
                Order Details
              </h1>
              <AdminNotificationBell />
            </div>
          </div>

          <div className="p-6 space-y-6 max-w-2xl mx-auto">
            {/* Main item */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-6">
              <div className="flex gap-6 items-center">
                <div className="w-28 h-28 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-xl">
                  {selectedOrder.itemImage ? (
                    <img
                      src={selectedOrder.itemImage}
                      alt="item"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-green-50 flex items-center justify-center text-4xl">
                      🍽️
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">
                    {selectedOrder.title}
                  </h2>
                  <p className="text-3xl font-black text-green-600 mt-1 tracking-tighter">
                    {selectedOrder.price}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-lg font-black text-gray-500">
                      {selectedOrder.quantity}
                    </span>
                    <span
                      className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest text-white ${statusBg(selectedOrder.status)}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                    Receipt ID
                  </span>
                  <span className="font-black text-green-600 text-2xl tracking-tighter">
                    #{selectedOrder.id}
                  </span>
                </div>
                <span className="text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full border border-green-100">
                  {new Date().toLocaleDateString()}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {selectedOrder.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 hover:bg-gray-50 px-3 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 font-black text-lg">
                        ×{item.quantity}
                      </span>
                      <span className="text-gray-700 font-bold uppercase text-sm">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-black text-gray-800">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Charges */}
              <div className="space-y-3 pt-6 border-t border-gray-100">
                {[
                  {
                    label: "Delivery Fee",
                    value: selectedOrder.deliveryCharges,
                  },
                  {
                    label: "Rider Commission",
                    value: selectedOrder.riderCommission,
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex justify-between text-xs font-bold uppercase tracking-widest"
                  >
                    <span className="text-gray-400">{r.label}</span>
                    <span className="text-gray-800">{r.value}</span>
                  </div>
                ))}
              </div>

              {(["cancelled", "failed"].includes(selectedOrder.status.toLowerCase())) && (
                <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800"><span className="font-black">Reason: </span>{selectedOrder.reason}</div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-6 border-t-4 border-gray-100">
                <span className="text-xl font-black text-gray-800 tracking-tighter uppercase">
                  Grand Total
                </span>
                <span className="text-4xl font-black text-green-600 tracking-tighter">
                  {selectedOrder.total}
                </span>
              </div>
            </div>

            {/* Delivery info */}
            <div className="bg-green-50 rounded-[2.5rem] shadow-xl p-8 space-y-6 border border-green-100">
              <div>
                <h3 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-3">
                  Delivery Address
                </h3>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">📍</span>
                  <p className="text-gray-800 font-bold text-sm leading-relaxed">
                    {selectedOrder.deliverTo}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-green-200/50 space-y-3">
                <div>
                  <h3 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">
                    Customer Phone
                  </h3>
                  <p className="font-black text-gray-800">
                    {selectedOrder.customerPhone}
                  </p>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">
                    Vendor
                  </h3>
                  <p className="font-black text-gray-800">
                    {selectedOrder.vendorName}
                  </p>
                  <p className="text-sm text-gray-500 font-bold">
                    {selectedOrder.vendorPhone}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-5 shadow-xl"><h2 className="font-black">Order timeline</h2><div className="mt-4 space-y-3">{selectedOrder.timeline.length ? selectedOrder.timeline.map((event: any, index: number) => <div key={event.id || index} className="flex gap-3"><div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-green-500"/><div><p className="text-sm font-black capitalize">{String(event.status).replaceAll("_", " ")}</p><p className="text-xs text-slate-400">{new Date(event.timestamp || event.created_at).toLocaleString()} · {event.actor_type || "system"}</p>{(event.message || event.notes) && <p className="mt-1 text-xs text-slate-600">{event.message || event.notes}</p>}{event.latitude && <p className="text-[10px] text-slate-400">{event.latitude}, {event.longitude}</p>}</div></div>) : <p className="text-sm text-slate-400">No timeline events recorded</p>}</div></div>

            <div className="rounded-[2rem] bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><div><h2 className="font-black">Admin actions</h2><p className="text-xs text-slate-400">Every manual action records its reason.</p></div>{updatingStatus && <Loader2 className="animate-spin text-green-600" size={18}/>}</div><div className="mt-4 grid gap-2 sm:grid-cols-2">
              <select value={action?.kind === "assign" ? action.value || "" : ""} onChange={event => event.target.value && setAction({ kind: "assign", value: event.target.value, reason: "" })} className="rounded-xl bg-slate-50 p-3 text-sm font-black"><option value="">Assign / reassign rider</option>{riders.filter(rider => ["online", "available", "assigned"].includes(rider.operational_status)).map(rider => <option key={rider.id} value={rider.id}>{rider.firstname} {rider.lastname} · {rider.operational_status}</option>)}</select>
              <select value={action?.kind === "status" ? action.value : selectedOrder.status.toLowerCase()} onChange={event => setAction({ kind: "status", value: event.target.value, reason: "" })} className="rounded-xl bg-slate-50 p-3 text-sm font-black">{["pending","accepted","preparing","ready","picked_up","completed","cancelled","failed"].map(value => <option key={value}>{value}</option>)}</select>
              <a href={`tel:${selectedOrder.customerPhone}`} className="rounded-xl bg-blue-50 p-3 text-center text-xs font-black text-blue-800">Contact customer</a><a href={`tel:${selectedOrder.vendorPhone}`} className="rounded-xl bg-violet-50 p-3 text-center text-xs font-black text-violet-800">Contact vendor</a><a href={`tel:${selectedOrder.riderPhone}`} className="rounded-xl bg-orange-50 p-3 text-center text-xs font-black text-orange-800">Contact rider</a>
              <button onClick={() => setAction({ kind: "refund", amount: "", reason: "" })} className="rounded-xl bg-red-50 p-3 text-xs font-black text-red-800">Issue refund</button><button onClick={() => setAction({ kind: "compensation", amount: "", reason: "" })} className="rounded-xl bg-green-50 p-3 text-xs font-black text-green-800">Add compensation</button><button onClick={() => setAction({ kind: "note", reason: "" })} className="rounded-xl bg-slate-100 p-3 text-xs font-black">Add internal note</button><button onClick={() => setAction({ kind: "dispute", reason: "" })} className="rounded-xl bg-amber-50 p-3 text-xs font-black text-amber-800">Open dispute</button>
            </div>{action && <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4"><div className="flex items-center justify-between"><p className="text-xs font-black uppercase text-green-800">{action.kind.replaceAll("_", " ")}</p><button onClick={() => { setAction(null); setActionError(""); }}><X size={17}/></button></div>{["refund", "compensation"].includes(action.kind) && <input type="number" min="0.01" step="0.01" value={action.amount || ""} onChange={event => setAction(current => current ? { ...current, amount: event.target.value } : current)} placeholder="Amount" className="mt-3 w-full rounded-xl bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"/>}<textarea value={action.reason || ""} onChange={event => setAction(current => current ? { ...current, reason: event.target.value } : current)} placeholder={action.kind === "note" ? "Internal note" : action.kind === "assign" ? "Assignment reason" : "Required reason"} className="mt-2 min-h-20 w-full rounded-xl bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"/>{actionError && <p className="mt-2 text-xs font-bold text-red-600">{actionError}</p>}<button disabled={Boolean(updatingStatus)} onClick={runAdminAction} className="mt-3 w-full rounded-xl bg-green-700 py-3 text-xs font-black text-white disabled:opacity-50">Confirm action</button></div>}<div className="mt-4 space-y-2">{selectedOrder.internalNotes.map((note: any) => <p key={note.id} className="rounded-xl bg-slate-50 p-3 text-xs">{note.note} · {new Date(note.created_at).toLocaleString()}</p>)}</div></div>

            {selectedOrder.supportTickets.length > 0 && <div className="rounded-[2rem] bg-amber-50 p-5 shadow-xl"><h2 className="font-black">Related support tickets</h2><div className="mt-3 space-y-2">{selectedOrder.supportTickets.map((ticket: any) => <div key={ticket.id} className="rounded-xl bg-white p-3"><p className="text-xs font-black">{ticket.ticket_number} · {ticket.category} · {ticket.status}</p><p className="text-sm">{ticket.subject}</p>{ticket.status !== "resolved" && ticket.status !== "closed" && <button onClick={() => setAction({ kind: "resolve", ticketId: ticket.id, reason: "" })} className="mt-2 rounded-lg bg-green-600 px-3 py-2 text-[10px] font-black text-white">Resolve here</button>}</div>)}</div></div>}
          </div>
        </div>
      )}

      {/* ── STATUS CONTROL ────────────────────────────────────────────────── */}
      {currentScreen === "status-control" && (
        <div className="h-screen overflow-y-auto">
          <div className="bg-green-600 text-white p-6 sticky top-0 z-40 shadow-xl">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentScreen("main")}
                className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-bold tracking-tighter uppercase">
                Status Control
              </h1>
              <AdminNotificationBell />
            </div>
          </div>

          <div className="p-6 space-y-4 max-w-2xl mx-auto">
            {statusOrders.length === 0 ? (
              <div className="text-center py-20 text-gray-300">
                <p className="font-bold uppercase tracking-widest">
                  No active orders
                </p>
              </div>
            ) : (
              statusOrders.map((order, i) => (
                <div
                  key={order.id}
                  className="bg-white rounded-[2.5rem] shadow-2xl p-6 transition-all"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-green-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                      {order.order_items?.[0]?.menu_item?.image_url ? (
                        <img
                          src={order.order_items[0].menu_item.image_url}
                          alt="item"
                          className="w-full h-full object-cover rounded-[1.5rem]"
                        />
                      ) : (
                        <span className="text-2xl">🍽️</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="font-black text-gray-800 tracking-tighter uppercase truncate">
                            {order.restaurant_name}
                          </h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate">
                            📍 {order.delivery_address}
                          </p>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                            {new Date(order.created_at).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1.5 ${statusBg(order.status)} text-white text-[10px] rounded-xl font-black uppercase tracking-widest flex-shrink-0`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Status action buttons */}
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {order.status === "Pending" && (
                          <button
                            onClick={() =>
                              openOrderStatusAction(order, "accepted")
                            }
                            disabled={updatingStatus === order.id}
                            className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-60 flex items-center gap-1"
                          >
                            {updatingStatus === order.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : null}
                            Accept
                          </button>
                        )}
                        {order.status === "Accepted" && (
                          <button
                            onClick={() =>
                              openOrderStatusAction(order, "preparing")
                            }
                            disabled={updatingStatus === order.id}
                            className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-60"
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.status === "Preparing" && (
                          <button
                            onClick={() =>
                              openOrderStatusAction(order, "ready")
                            }
                            disabled={updatingStatus === order.id}
                            className="px-4 py-2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-lg active:scale-95 disabled:opacity-60"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === "Ready" && (
                          <button onClick={() => openOrderStatusAction(order, "picked_up")} disabled={updatingStatus === order.id} className="px-4 py-2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-lg active:scale-95 disabled:opacity-60">Mark Picked Up</button>
                        )}
                        {order.status === "Picked_up" && (
                          <button
                            onClick={() =>
                              openOrderStatusAction(order, "completed")
                            }
                            disabled={updatingStatus === order.id}
                            className="px-4 py-2 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95 disabled:opacity-60"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() =>
                            openOrderStatusAction(order, "cancelled")
                          }
                          disabled={updatingStatus === order.id}
                          className="px-4 py-2 border-2 border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all active:scale-95 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
