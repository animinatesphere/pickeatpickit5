/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  CheckSquare,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  HeartPulse,
  Headphones,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";
import api from "../../services/api";
import OrderManagement from "../page/OrderManagent";
import UserManagement from "../page/UserManagement";
import Transaction from "../page/Transaction";
import Analysis from "../page/Analysis";
import Approvals from "../page/Approvals";
import Partners from "../page/Partners";
import AdminAccounts from "../page/AdminAccounts";
import SystemManagement from "../page/SystemManagement";
import SystemHealth from "../page/SystemHealth";
import AccountSettings, { type AdminProfile } from "../page/AccountSettings";
import OperationsAttention from "../page/OperationsAttention";
import SupportTickets from "../page/SupportTickets";
import AdminNotificationBell from "../components/AdminNotificationBell";

type Section =
  | "overview"
  | "approvals"
  | "orders"
  | "customers"
  | "vendors"
  | "riders"
  | "finance"
  | "analytics"
  | "attention"
  | "support"
  | "system"
  | "system-health"
  | "admins"
  | "account";

type NavItem = { id: Section; label: string; icon: React.ReactNode; permission?: string };
type OrderDrill = { status?: string; period?: string; search?: string };

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={19} />, permission: "overview.view" },
  { id: "approvals", label: "Approvals", icon: <CheckSquare size={19} />, permission: "approvals.manage" },
  { id: "orders", label: "Orders", icon: <ShoppingBag size={19} />, permission: "orders.manage" },
  { id: "customers", label: "Customers", icon: <Users size={19} />, permission: "customers.manage" },
  { id: "vendors", label: "Vendors", icon: <Store size={19} />, permission: "vendors.manage" },
  { id: "riders", label: "Riders", icon: <Truck size={19} />, permission: "riders.manage" },
  { id: "finance", label: "Finance", icon: <CircleDollarSign size={19} />, permission: "finance.manage" },
  { id: "attention", label: "Issues & refunds", icon: <AlertTriangle size={19} />, permission: "system.manage" },
  { id: "support", label: "Support", icon: <Headphones size={19} />, permission: "system.manage" },
  { id: "system", label: "System", icon: <Settings2 size={19} />, permission: "system.manage" },
  { id: "system-health", label: "System health", icon: <HeartPulse size={19} />, permission: "system.manage" },
  { id: "admins", label: "Admin accounts", icon: <ShieldCheck size={19} />, permission: "admins.manage" },
  { id: "account", label: "Account Settings", icon: <UserRoundCog size={19} /> },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderDrill, setOrderDrill] = useState<OrderDrill>({});
  const [user, setUser] = useState<AdminProfile>(() => {
    try { return JSON.parse(localStorage.getItem("userData") || "{}"); } catch { return {} as AdminProfile; }
  });
  const granted = useMemo(() => user.permissions || user.admin_permissions || [], [user.permissions, user.admin_permissions]);
  const visibleNav = useMemo(() => navItems.filter((item) => !item.permission || user.admin_role === "super_admin" || (item.id !== "admins" && granted.includes(item.permission))), [granted, user.admin_role]);

  useEffect(() => {
    if (!visibleNav.some((item) => item.id === section)) setSection(visibleNav[0]?.id || "account");
  }, [section, visibleNav]);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
    navigate("/admin-login", { replace: true });
  };

  const select = (value: Section) => {
    if (value !== "orders") setOrderDrill({});
    setSection(value);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const content = {
    overview: <Overview onNavigate={select} onOrderDrill={(filter) => { setOrderDrill(filter); setSection("orders"); }} />,
    approvals: <Approvals />,
    orders: <OrderManagement key={`${orderDrill.status || "all"}-${orderDrill.period || "all"}-${orderDrill.search || "all"}`} initialStatus={orderDrill.status} initialPeriod={orderDrill.period} initialSearch={orderDrill.search} />,
    customers: <UserManagement />,
    vendors: <Partners kind="vendor" />,
    riders: <Partners kind="rider" />,
    finance: <Transaction />,
    analytics: <Analysis />,
    attention: <OperationsAttention />,
    support: <SupportTickets />,
    system: <SystemManagement />,
    "system-health": <SystemHealth />,
    admins: <AdminAccounts />,
    account: <AccountSettings onUserUpdated={setUser} />,
  }[section];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {drawerOpen && <button className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setDrawerOpen(false)} aria-label="Close navigation overlay" />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-green-500 font-black text-slate-950">PE</div><div><p className="font-black tracking-tight">PEPI Admin</p><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Control centre</p></div></div>
          <button onClick={() => setDrawerOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 lg:hidden"><X size={20} /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNav.map((item) => (
            <button key={item.id} onClick={() => select(item.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition ${section === item.id ? "bg-green-500 text-slate-950 shadow-lg shadow-green-500/20" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              {item.icon}<span className="flex-1">{item.label}</span>{section === item.id && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 px-2"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xs font-black">{`${user.firstname?.[0] || "A"}${user.lastname?.[0] || "D"}`}</div><div className="min-w-0"><p className="truncate text-sm font-bold">{`${user.firstname || ""} ${user.lastname || ""}`.trim() || "Administrator"}</p><p className="truncate text-xs text-slate-400">{user.email}</p></div></div>
          <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-wide text-red-300 hover:bg-red-500 hover:text-white"><LogOut size={16} /> Log out</button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-[70] flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3"><button onClick={() => setDrawerOpen(true)} className="rounded-xl bg-slate-100 p-2.5 text-slate-700 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-600">PEPI</p><h1 className="text-sm font-black capitalize text-slate-900 sm:text-base">{visibleNav.find((item) => item.id === section)?.label}</h1></div></div>
          <div className="relative flex items-center gap-2"><AdminNotificationBell onNavigate={select} sections={{ finance: "finance", orders: "orders", vendors: "vendors", riders: "riders", support: "support", attention: "attention" }} /><button onClick={logout} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"><LogOut size={15} /><span className="hidden sm:inline">Log out</span></button></div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{content}</main>
      </div>
    </div>
  );
}

function Overview({ onNavigate, onOrderDrill }: { onNavigate: (section: Section) => void; onOrderDrill: (filter: OrderDrill) => void }) {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);
  const [pending, setPending] = useState({ vendors: 0, riders: 0, payouts: 0 });
  const [orderPeriod, setOrderPeriod] = useState<"today" | "week" | "month">("today");

  useEffect(() => {
    const load = async () => {
      const [healthResult, vendorsResult, ridersResult, payoutsResult] = await Promise.allSettled([
        api.get("/admin/health"), api.get("/admin/vendors/pending"), api.get("/admin/riders/pending"), api.get("/admin/payouts", { params: { status: "pending" } }),
      ]);
      if (healthResult.status === "fulfilled") setHealth(healthResult.value.data);
      setPending({
        vendors: vendorsResult.status === "fulfilled" ? vendorsResult.value.data.length : 0,
        riders: ridersResult.status === "fulfilled" ? ridersResult.value.data.length : 0,
        payouts: payoutsResult.status === "fulfilled" ? payoutsResult.value.data.length : 0,
      });
      setLoading(false);
    };
    load(); const timer = window.setInterval(load, 30000); return () => window.clearInterval(timer);
  }, []);

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" /></div>;

  if (!health) return <div className="rounded-3xl bg-red-50 p-6 text-sm font-bold text-red-700">Platform health unavailable. Check API and migration status.</div>;
  const money = (value: number) => `₦${Number(value || 0).toLocaleString()}`;
  const periods = {
    today: { label: "Today", value: health.orders.today },
    week: { label: "This week", value: health.orders.week },
    month: { label: "This month", value: health.orders.month },
  };
  const selectedPeriod = periods[orderPeriod];
  const statusCards = [["Pending", "pending"], ["Accepted", "accepted"], ["Preparing", "preparing"], ["Picked up", "picked_up"], ["Delivered", "completed"], ["Cancelled", "cancelled"], ["Failed", "failed"]];
  const activity = [["Active customers", health.activity.customers, "customers"], ["Active vendors", health.activity.vendors, "vendors"], ["Active riders", health.activity.riders, "riders"], ["Riders online", health.activity.riders_online, "riders"], ["Riders available", health.activity.riders_available, "riders"], ["On delivery", health.activity.riders_on_delivery, "riders"]] as const;
  const performance = [["Avg delivery", `${health.performance.average_delivery_minutes} min`, "analytics", null], ["Avg preparation", `${health.performance.average_preparation_minutes} min`, "analytics", null], ["Cancellation rate", `${health.performance.cancellation_rate}%`, null, "cancelled"], ["Failed payments", health.performance.failed_payments, "attention", null], ["Refunds", health.finance.refunds, "attention", null], ["Disputes", health.finance.disputes, "attention", null]] as const;
  const orderStatusData = statusCards.map(([name, key]) => ({ name, value: Number(health.orders.by_status[key] || 0) }));
  const workforceData = activity.map(([name, value]) => ({ name, value: Number(value || 0) }));
  const chartColors = ["#f59e0b", "#3b82f6", "#8b5cf6", "#06b6d4", "#22c55e", "#ef4444", "#64748b"];

  return (
    <section className="space-y-6">
      <div><p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">Live platform data</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Operations overview</h1><p className="mt-1 text-sm text-slate-500">Accounts, orders, approvals, and platform finances.</p></div>

      <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-black text-slate-900">Orders over time</h2><p className="text-xs text-slate-500">Choose period to update order count.</p></div>
          <label className="text-xs font-black uppercase text-slate-500">Period
            <select value={orderPeriod} onChange={(event) => setOrderPeriod(event.target.value as typeof orderPeriod)} className="ml-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold normal-case text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100">
              <option value="today">Today</option><option value="week">This week</option><option value="month">This month</option>
            </select>
          </label>
        </div>
        <button onClick={() => onOrderDrill({ period: orderPeriod })} className="block w-full p-5 text-left transition hover:bg-green-50">
          <p className="text-4xl font-black text-slate-900">{Number(selectedPeriod.value).toLocaleString()}</p><p className="mt-1 text-xs font-black uppercase text-slate-400">{selectedPeriod.label}</p><p className="mt-3 text-xs font-bold text-green-700">View orders →</p>
        </button>
      </article>

      <div><h2 className="mb-3 text-lg font-black">Orders by status</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">{statusCards.map(([label, key]) => <button key={key} onClick={() => onOrderDrill({ status: key })} className="rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100"><p className="text-2xl font-black">{Number(health.orders.by_status[key]).toLocaleString()}</p><p className="mt-1 text-[10px] font-black uppercase text-slate-500">{label}</p><p className="mt-2 text-[10px] font-bold text-green-700">Drill down →</p></button>)}</div></div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-3xl bg-white p-5 shadow-sm">
          <div><h2 className="font-black text-slate-900">Order distribution</h2><p className="text-xs text-slate-500">Current order lifecycle totals</p></div>
          <div className="mt-4 h-72" aria-label="Order status distribution chart">
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={orderStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>{orderStatusData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip formatter={(value) => [Number(value).toLocaleString(), "Orders"]} /></PieChart></ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2">{orderStatusData.map((item, index) => <span key={item.name} className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />{item.name}</span>)}</div>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm">
          <div><h2 className="font-black text-slate-900">Platform activity</h2><p className="text-xs text-slate-500">Active users and delivery workforce</p></div>
          <div className="mt-4 h-72" aria-label="Platform activity chart">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={workforceData} margin={{ top: 10, right: 8, left: -20, bottom: 45 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" interval={0} angle={-28} textAnchor="end" tick={{ fontSize: 9, fill: "#64748b" }} /><YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} /><Tooltip formatter={(value) => [Number(value).toLocaleString(), "Active"]} /><Bar dataKey="value" fill="#16a34a" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-3"><button onClick={() => onNavigate("finance")} className="rounded-3xl bg-slate-950 p-5 text-left text-white"><p className="text-xs font-black uppercase text-green-400">Gross order value</p><p className="mt-2 text-3xl font-black">{money(health.finance.gmv)}</p><p className="mt-5 text-xs font-black uppercase text-slate-400">Revenue / commissions</p><p className="mt-1 text-2xl font-black">{money(health.finance.commission)}</p><span className="mt-5 inline-block rounded-xl bg-white/10 px-4 py-3 text-xs font-black">Open finance →</span></button><article className="rounded-3xl bg-white p-5 shadow-sm lg:col-span-2"><h2 className="font-black">Performance</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{performance.map(([label, value, target, status]) => <button key={label} onClick={() => status ? onOrderDrill({ status }) : onNavigate(target as Section)} className="rounded-2xl bg-slate-50 p-3 text-left transition hover:bg-green-50"><p className="text-lg font-black">{value}</p><p className="text-[10px] font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-[10px] font-bold text-green-700">Open →</p></button>)}</div></article></div>

      <button onClick={() => onNavigate("attention")} className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm font-black text-amber-900">Open issue, refund and dispute queues →</button>

      <div><h2 className="mb-3 text-lg font-black">Live workforce</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{activity.map(([label, value, target]) => <button key={label} onClick={() => onNavigate(target)} className="rounded-2xl bg-white p-4 text-left shadow-sm transition hover:bg-green-50"><p className="text-2xl font-black">{Number(value).toLocaleString()}</p><p className="text-[10px] font-black uppercase text-slate-400">{label}</p><p className="mt-1 text-[10px] font-bold text-green-700">View →</p></button>)}</div></div>

      <div className="grid gap-4 lg:grid-cols-2"><article className="rounded-3xl bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-black">Near-real-time alerts</h2><span className="text-xs text-slate-400">Refreshes every 30s</span></div><div className="mt-4 space-y-2">{health.alerts.length ? health.alerts.map((alert: any) => <button key={alert.type} onClick={() => onNavigate("attention")} className="block w-full rounded-2xl bg-red-50 p-3 text-left text-sm font-bold text-red-800">{alert.message} →</button>) : <p className="rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-800">No active alerts</p>}</div><h3 className="mt-5 text-xs font-black uppercase text-slate-400">Issues requiring attention</h3><div className="mt-2 space-y-2">{health.issues.slice(0, 5).map((issue: any) => <button key={issue.id} onClick={() => onNavigate("attention")} className="block w-full rounded-xl border border-slate-100 p-3 text-left"><p className="text-xs font-black uppercase text-amber-700">{issue.subject_type} · {issue.severity}</p><p className="mt-1 text-sm text-slate-700">{issue.summary}</p></button>)}</div></article><article className="overflow-hidden rounded-3xl bg-slate-900 p-5 text-white"><h2 className="font-black">Live order map</h2><p className="mt-1 text-xs text-slate-400">Active delivery destinations</p><AdminOrderMap orders={health.map_orders} onDrill={onOrderDrill}/><p className="mt-3 text-xs text-slate-400">{health.map_orders.length} geocoded active orders. Tap marker to open exact order.</p></article></div>

      <button onClick={() => onNavigate("approvals")} className="flex w-full items-center gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-left"><div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><CheckSquare size={22} /></div><div className="min-w-0 flex-1"><p className="font-black text-amber-950">Pending approvals</p><p className="text-sm text-amber-700">{pending.vendors} vendors · {pending.riders} riders · {pending.payouts} payouts</p></div><ChevronRight className="text-amber-700" /></button>
    </section>
  );
}

function AdminOrderMap({ orders, onDrill }: { orders: any[]; onDrill: (filter: OrderDrill) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    if (!mapRef.current || !orders.length) return;
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) { setUnavailable(true); return; }
    let cancelled = false;
    const draw = () => {
      if (cancelled || !mapRef.current || !window.google?.maps) return;
      const bounds = new window.google.maps.LatLngBounds();
      const map = new window.google.maps.Map(mapRef.current, { zoom: 11, center: { lat: Number(orders[0].latitude), lng: Number(orders[0].longitude) }, mapTypeControl: false, streetViewControl: false });
      orders.forEach(order => { const point = { lat: Number(order.latitude), lng: Number(order.longitude) }; bounds.extend(point); const marker = new window.google.maps.Marker({ map, position: point, title: `${order.restaurant_name} · ${order.status}` }); marker.addListener("click", () => onDrill({ search: order.id })); });
      if (orders.length > 1) map.fitBounds(bounds); else map.setCenter(bounds.getCenter());
    };
    if (window.google?.maps) draw(); else {
      const existing = document.querySelector<HTMLScriptElement>('script[data-admin-google-map]');
      if (existing) existing.addEventListener("load", draw, { once: true });
      else { const script = document.createElement("script"); script.dataset.adminGoogleMap = "true"; script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`; script.async = true; script.onload = draw; script.onerror = () => setUnavailable(true); document.head.appendChild(script); }
    }
    return () => { cancelled = true; };
  }, [orders, onDrill]);
  if (!orders.length) return <div className="mt-4 grid min-h-72 place-items-center rounded-2xl bg-slate-800 text-sm text-slate-400">No geocoded active orders</div>;
  if (unavailable) return <div className="mt-4 max-h-72 space-y-2 overflow-auto rounded-2xl bg-slate-800 p-3">{orders.map(order => <button key={order.id} onClick={() => onDrill({ search: order.id })} className="block w-full rounded-xl bg-white/10 p-3 text-left text-xs"><span className="font-black">{order.restaurant_name}</span><br/>{order.latitude}, {order.longitude} · {order.status}</button>)}</div>;
  return <div ref={mapRef} className="mt-4 min-h-72 overflow-hidden rounded-2xl bg-slate-800"/>;
}
