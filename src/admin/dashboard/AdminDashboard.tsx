import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckSquare,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Users,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../services/api";
import OrderManagement from "../page/OrderManagent";
import UserManagement from "../page/UserManagement";
import Transaction from "../page/Transaction";
import Analysis from "../page/Analysis";
import Approvals from "../page/Approvals";
import Partners from "../page/Partners";
import AdminAccounts from "../page/AdminAccounts";
import SystemManagement from "../page/SystemManagement";

type Section =
  | "overview"
  | "approvals"
  | "orders"
  | "customers"
  | "vendors"
  | "riders"
  | "finance"
  | "analytics"
  | "system"
  | "admins";

type NavItem = { id: Section; label: string; icon: React.ReactNode };
type RevenuePoint = { label: string; revenue: number };

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={19} /> },
  { id: "approvals", label: "Approvals", icon: <CheckSquare size={19} /> },
  { id: "orders", label: "Orders", icon: <ShoppingBag size={19} /> },
  { id: "customers", label: "Customers", icon: <Users size={19} /> },
  { id: "vendors", label: "Vendors", icon: <Store size={19} /> },
  { id: "riders", label: "Riders", icon: <Truck size={19} /> },
  { id: "finance", label: "Finance", icon: <CircleDollarSign size={19} /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 size={19} /> },
  { id: "system", label: "System", icon: <Settings2 size={19} /> },
  { id: "admins", label: "Admin accounts", icon: <ShieldCheck size={19} /> },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("userData") || "{}"); } catch { return {}; }
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
    navigate("/admin-login", { replace: true });
  };

  const select = (value: Section) => {
    setSection(value);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const content = {
    overview: <Overview onNavigate={select} />,
    approvals: <Approvals />,
    orders: <OrderManagement />,
    customers: <UserManagement />,
    vendors: <Partners kind="vendor" />,
    riders: <Partners kind="rider" />,
    finance: <Transaction />,
    analytics: <Analysis />,
    system: <SystemManagement />,
    admins: <AdminAccounts />,
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
          {navItems.map((item) => (
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3"><button onClick={() => setDrawerOpen(true)} className="rounded-xl bg-slate-100 p-2.5 text-slate-700 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-600">PEPI</p><h1 className="text-sm font-black capitalize text-slate-900 sm:text-base">{navItems.find((item) => item.id === section)?.label}</h1></div></div>
          <button onClick={logout} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"><LogOut size={15} /><span className="hidden sm:inline">Log out</span></button>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{content}</main>
      </div>
    </div>
  );
}

function Overview({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [balance, setBalance] = useState<Record<string, number>>({});
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [pending, setPending] = useState({ vendors: 0, riders: 0, payouts: 0 });

  useEffect(() => {
    const load = async () => {
      const [statsResult, balanceResult, revenueResult, vendorsResult, ridersResult, payoutsResult] = await Promise.allSettled([
        api.get("/admin/stats"), api.get("/admin/balance"), api.get("/admin/analytics/revenue", { params: { period: "M" } }), api.get("/admin/vendors/pending"), api.get("/admin/riders/pending"), api.get("/admin/payouts", { params: { status: "pending" } }),
      ]);
      if (statsResult.status === "fulfilled") setStats(statsResult.value.data);
      if (balanceResult.status === "fulfilled") setBalance(balanceResult.value.data);
      if (revenueResult.status === "fulfilled") setRevenue((revenueResult.value.data.data_points || []).map((point: { label: string; revenue: number | string }) => ({ label: point.label, revenue: Number(point.revenue) })));
      setPending({
        vendors: vendorsResult.status === "fulfilled" ? vendorsResult.value.data.length : 0,
        riders: ridersResult.status === "fulfilled" ? ridersResult.value.data.length : 0,
        payouts: payoutsResult.status === "fulfilled" ? payoutsResult.value.data.length : 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" /></div>;

  const cards = [
    ["Users", stats.users || 0, Users, "bg-blue-50 text-blue-700"],
    ["Vendors", stats.vendors || 0, Store, "bg-violet-50 text-violet-700"],
    ["Riders", stats.riders || 0, Truck, "bg-orange-50 text-orange-700"],
    ["Orders", stats.orders || 0, ReceiptText, "bg-green-50 text-green-700"],
  ] as const;

  return (
    <section className="space-y-6">
      <div><p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">Live platform data</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Operations overview</h1><p className="mt-1 text-sm text-slate-500">Accounts, orders, approvals, and platform finances.</p></div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{cards.map(([label, value, Icon, tone]) => <article key={label} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><div className={`mb-4 grid h-10 w-10 place-items-center rounded-2xl ${tone}`}><Icon size={20} /></div><p className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{Number(value).toLocaleString()}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p></article>)}</div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-3xl bg-slate-950 p-5 text-white lg:col-span-2 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-green-400">Platform revenue</p><p className="mt-2 text-3xl font-black">₦{Number(balance.platform_revenue || stats.total_revenue || 0).toLocaleString()}</p></div><CircleDollarSign className="text-green-400" size={28} /></div><div className="mt-6 h-52">{revenue.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={revenue}><CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" stroke="#94a3b8" fontSize={10} /><YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(value) => `${Number(value) / 1000}k`} /><Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, "Revenue"]} /><Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-slate-500">No completed-order revenue this month</div>}</div></article>

        <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-slate-400">System balance</p><div className="mt-5 space-y-4">{[["Customer wallets", balance.total_customer_balance], ["Vendor wallets", balance.total_vendor_balance], ["Rider wallets", balance.total_rider_balance], ["Total liabilities", balance.total_liabilities]].map(([label, value]) => <div key={String(label)} className="flex items-center justify-between gap-3"><span className="text-sm text-slate-500">{label}</span><span className="font-black text-slate-900">₦{Number(value || 0).toLocaleString()}</span></div>)}</div><button onClick={() => onNavigate("finance")} className="mt-6 w-full rounded-2xl bg-slate-100 py-3 text-xs font-black uppercase text-slate-700">Open finance</button></article>
      </div>

      <button onClick={() => onNavigate("approvals")} className="flex w-full items-center gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-left"><div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><CheckSquare size={22} /></div><div className="min-w-0 flex-1"><p className="font-black text-amber-950">Pending approvals</p><p className="text-sm text-amber-700">{pending.vendors} vendors · {pending.riders} riders · {pending.payouts} payouts</p></div><ChevronRight className="text-amber-700" /></button>
    </section>
  );
}
