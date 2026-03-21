/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Menu, Bell, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import api from "../../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderStatus =
  | "Completed"
  | "Pending"
  | "Cancelled"
  | "Preparing"
  | "Accepted"
  | "Picked_up";
type StatusTab = "All" | "Pending" | "Completed" | "Cancelled";
type Screen = "main" | "details" | "status-control";

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
}

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchAdminOrders = (limit = 50) =>
  api.get("/admin/orders", { params: { limit } });

const fetchOrderDetail = (orderId: string) =>
  api.get(`/admin/orders/${orderId}`);

const updateOrderStatus = (orderId: string, status: string) =>
  api.patch(`/admin/orders/${orderId}/status`, null, { params: { status } });

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
      return "text-red-600";
    case "preparing":
      return "text-blue-600";
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
      return "bg-red-600";
    case "preparing":
      return "bg-blue-600";
    case "accepted":
      return "bg-indigo-600";
    case "picked_up":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

// ── Component ─────────────────────────────────────────────────────────────────
const OrderManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StatusTab>("All");
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // ── Fetch orders ────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminOrders();
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
      }));
      setOrders(mapped);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ── Open order detail ───────────────────────────────────────────────────────
  const handleCheckClick = async (orderId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetchOrderDetail(orderId);
      const d: any = res.data;

      const detail: OrderDetail = {
        id: d.id?.slice(0, 8).toUpperCase() || "—",
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
      };

      setSelectedOrder(detail);
      setCurrentScreen("details");
    } catch (e) {
      console.error("Failed to fetch order detail:", e);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Update order status ─────────────────────────────────────────────────────
  const handleUpdateStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(orderId);
    try {
      await updateOrderStatus(orderId, status);
      fetchOrders(); // Refresh
    } catch (e) {
      console.error("Failed to update order status:", e);
    } finally {
      setUpdatingStatus(null);
    }
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
      ["Pending", "Accepted", "Preparing", "Picked_up"].includes(o.status),
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
              <button className="hover:bg-white/20 p-2 rounded-xl transition-all">
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold tracking-tighter uppercase">
                Order Management
              </h1>
              <button className="hover:bg-white/20 p-2 rounded-xl transition-all relative">
                <Bell size={24} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 animate-pulse" />
              </button>
            </div>
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(
                ["All", "Pending", "Completed", "Cancelled"] as StatusTab[]
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

            <button className="w-full flex justify-between items-center p-5 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all group">
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
              <button className="hover:bg-white/20 p-2 rounded-xl transition-all relative">
                <Bell size={24} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600" />
              </button>
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
              <Bell size={24} />
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
                              handleUpdateStatus(order.id, "accepted")
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
                              handleUpdateStatus(order.id, "preparing")
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
                              handleUpdateStatus(order.id, "picked_up")
                            }
                            disabled={updatingStatus === order.id}
                            className="px-4 py-2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-lg active:scale-95 disabled:opacity-60"
                          >
                            Mark Picked Up
                          </button>
                        )}
                        {order.status === "Picked_up" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id, "completed")
                            }
                            disabled={updatingStatus === order.id}
                            className="px-4 py-2 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95 disabled:opacity-60"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleUpdateStatus(order.id, "cancelled")
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
