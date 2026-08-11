/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import { CircleDollarSign, Filter, Gamepad2, Loader2, Plus, Send, Settings2, Tags, Trash2, Trophy, Wallet } from "lucide-react";
import {
  createDiscoveryFilter,
  createPromoCode,
  createRiderGame,
  createSystemSetting,
  deleteDiscoveryFilter,
  deletePromoCode,
  deleteRiderGame,
  deleteSystemSetting,
  getDiscoveryFilters,
  getAdminRiderGames,
  getAdminGameLeaderboard,
  getAdminGameParticipant,
  rewardAdminGameParticipant,
  getPromoCodes,
  getSystemSettings,
  updateDiscoveryFilter,
  updatePromoCode,
  updateRiderGame,
  updateSystemSetting,
  getFeeConfigurations, createFeeConfiguration, updateFeeConfiguration, deleteFeeConfiguration,
} from "../../services/api";
import { useToast } from "../../context/ToastContext";

type Row = Record<string, any>;
type Tab = "fees" | "settings" | "promos" | "filters" | "games" | "broadcasts";
const errorMessage = (error: any) => error?.response?.data?.detail || error?.message || "Action failed";

const fieldClass = "w-full rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none ring-green-500 focus:ring-2";

export default function SystemManagement() {
  const { success: showSuccess, error: showError } = useToast();
  const [tab, setTab] = useState<Tab>("settings");
  const [settings, setSettings] = useState<Row[]>([]);
  const [promos, setPromos] = useState<Row[]>([]);
  const [filters, setFilters] = useState<Row[]>([]);
  const [games, setGames] = useState<Row[]>([]);
  const [fees, setFees] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [settingForm, setSettingForm] = useState({ key: "", value: "", description: "", is_active: true });
  const [promoForm, setPromoForm] = useState<Row>({ id: "", code: "", discount_type: "percentage", discount_value: "", expiry_date: "", usage_limit: "", free_delivery: false, minimum_order_value: "0", is_active: true });
  const emptyFee = { id: "", code: "", name: "", audience: "customer", calculation_type: "fixed", amount: "0", minimum_order_value: "", is_active: true, is_custom: true, description: "" };
  const [feeForm, setFeeForm] = useState<Row>(emptyFee);
  const [filterForm, setFilterForm] = useState({ id: "", name: "", type: "cuisine", values: "", display_order: "0", icon: "", is_active: true });
  const [gameForm, setGameForm] = useState({ id: "", title: "", description: "", target_km: "", prize_amount: "", game_date: "", is_active: true });

  const load = useCallback(async () => {
    setLoading(true);
    const [settingsResult, promoResult, filterResult, gamesResult, feesResult] = await Promise.allSettled([
      getSystemSettings(), getPromoCodes(), getDiscoveryFilters(), getAdminRiderGames(), getFeeConfigurations(),
    ]);
    if (settingsResult.status === "fulfilled") setSettings(settingsResult.value.data);
    if (promoResult.status === "fulfilled") setPromos(promoResult.value.data);
    if (filterResult.status === "fulfilled") setFilters(filterResult.value.data);
    if (gamesResult.status === "fulfilled") setGames(Array.isArray(gamesResult.value.data) ? gamesResult.value.data : []);
    if (feesResult.status === "fulfilled") setFees(feesResult.value.data);
    if ([settingsResult, promoResult, filterResult, gamesResult, feesResult].some((r) => r.status === "rejected")) showError("Some system data could not be loaded");
    setLoading(false);
  }, [showError]);

  useEffect(() => { load(); }, [load]);
  const run = async (action: () => Promise<unknown>, success: string, after?: () => void) => {
    setBusy(true);
    try {
      await action();
      showSuccess(success);
      after?.();
      await load();
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const saveSetting = (event: React.FormEvent) => {
    event.preventDefault();
    const existing = settings.some((item) => item.key === settingForm.key);
    const payload = { value: Number(settingForm.value), description: settingForm.description || null, is_active: settingForm.is_active };
    run(
      () => existing ? updateSystemSetting(settingForm.key, payload) : createSystemSetting({ key: settingForm.key, ...payload }),
      existing ? "Setting updated" : "Setting created",
      () => setSettingForm({ key: "", value: "", description: "", is_active: true }),
    );
  };

  const savePromo = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { code: promoForm.code.toUpperCase(), discount_type: promoForm.discount_type, discount_value: Number(promoForm.discount_value), expiry_date: new Date(promoForm.expiry_date).toISOString(), usage_limit: promoForm.usage_limit ? Number(promoForm.usage_limit) : null, free_delivery: promoForm.free_delivery, minimum_order_value: Number(promoForm.minimum_order_value || 0), is_active: promoForm.is_active };
    run(
      () => promoForm.id ? updatePromoCode(promoForm.id, payload) : createPromoCode(payload),
      promoForm.id ? "Promo updated" : "Promo created",
      () => setPromoForm({ id: "", code: "", discount_type: "percentage", discount_value: "", expiry_date: "", usage_limit: "", free_delivery: false, minimum_order_value: "0", is_active: true }),
    );
  };

  const saveFee = (event: React.FormEvent) => { event.preventDefault(); const { id, ...values } = feeForm; const payload = { ...values, amount: Number(values.amount), minimum_order_value: values.minimum_order_value ? Number(values.minimum_order_value) : null }; run(() => id ? updateFeeConfiguration(id, payload) : createFeeConfiguration(payload), id ? "Fee updated" : "Custom fee created", () => setFeeForm(emptyFee)); };

  const saveFilter = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { name: filterForm.name, type: filterForm.type, values: filterForm.values.split(",").map((value) => value.trim()).filter(Boolean), display_order: Number(filterForm.display_order), icon: filterForm.icon || null, is_active: filterForm.is_active };
    run(
      () => filterForm.id ? updateDiscoveryFilter(filterForm.id, payload) : createDiscoveryFilter(payload),
      filterForm.id ? "Filter updated" : "Filter created",
      () => setFilterForm({ id: "", name: "", type: "cuisine", values: "", display_order: "0", icon: "", is_active: true }),
    );
  };

  const saveGame = (event: React.FormEvent) => {
    event.preventDefault();
    const { id, ...values } = gameForm;
    const payload = { ...values, target_km: Number(values.target_km), prize_amount: Number(values.prize_amount) };
    run(
      () => id ? updateRiderGame(id, payload) : createRiderGame(payload),
      id ? "Rider game updated" : "Rider game created",
      () => setGameForm({ id: "", title: "", description: "", target_km: "", prize_amount: "", game_date: "", is_active: true }),
    );
  };

  const tabs: [Tab, string, React.ReactNode][] = [
    ["fees", "Fees", <CircleDollarSign size={16} />],
    ["settings", "Settings", <Settings2 size={16} />],
    ["promos", "Promos", <Tags size={16} />],
    ["filters", "Filters", <Filter size={16} />],
    ["games", "Games", <Gamepad2 size={16} />],
    ["broadcasts", "Banners", <Send size={16} />],
  ];

  return (
    <section className="space-y-5">
      <div><p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">Platform controls</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">System configuration</h1><p className="mt-1 text-sm text-slate-500">Manage fees, promotions, discovery filters, and rider games.</p></div>
      <div className="grid grid-cols-6 gap-1 rounded-2xl bg-slate-100 p-1.5">
        {tabs.map(([value, label, icon]) => <button key={value} onClick={() => setTab(value)} className={`flex items-center justify-center gap-1 rounded-xl px-1 py-3 text-[10px] font-black uppercase sm:text-xs ${tab === value ? "bg-white text-green-700 shadow-sm" : "text-slate-500"}`}>{icon}<span className="hidden min-[390px]:inline">{label}</span></button>)}
      </div>

      {loading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-green-600" size={34} /></div> : (
        <>
          {tab === "fees" && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]"><div className="grid gap-3 sm:grid-cols-2">{fees.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-4 shadow-sm"><div className="flex justify-between gap-3"><div><p className="text-[10px] font-black uppercase text-green-600">{item.audience}</p><h2 className="font-black">{item.name}</h2><p className="text-xs text-slate-400">{item.code}{item.is_custom ? " · custom" : ""}</p></div><button onClick={() => setFeeForm({ ...item, amount: String(item.amount), minimum_order_value: item.minimum_order_value == null ? "" : String(item.minimum_order_value), description: item.description || "" })} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold">Edit</button></div><p className="mt-3 text-lg font-black">{item.calculation_type === "percentage" ? `${item.amount}%` : `₦${Number(item.amount).toLocaleString()}${item.code === "rider_waiting" ? "/min" : item.calculation_type === "per_km" ? "/km" : item.code === "vendor_subscription" ? "/month" : ""}`}</p><p className="text-xs text-slate-500">{item.is_active ? "Active" : "Disabled"}{item.code === "rider_waiting" && item.minimum_order_value ? ` · after ${item.minimum_order_value} free min` : ""}</p>{item.description && <p className="mt-1 text-xs text-slate-400">{item.description}</p>}{item.is_custom && <button onClick={() => window.confirm(`Delete ${item.name}?`) && run(() => deleteFeeConfiguration(item.id), "Fee deleted")} className="mt-3 text-xs font-bold text-red-600">Delete custom fee</button>}</article>)}</div><form onSubmit={saveFee} className="h-fit rounded-3xl border bg-white p-5 shadow-sm"><h2 className="font-black">{feeForm.id ? "Edit fee" : "New custom fee"}</h2><div className="mt-4 space-y-3"><input required disabled={Boolean(feeForm.id)} value={feeForm.code} onChange={e => setFeeForm({...feeForm, code:e.target.value.toLowerCase().replace(/\W+/g,"_")})} placeholder="fee_code" className={fieldClass}/><input required value={feeForm.name} onChange={e => setFeeForm({...feeForm,name:e.target.value})} placeholder="Fee name" className={fieldClass}/><div className="grid grid-cols-2 gap-3"><select disabled={Boolean(feeForm.id && !feeForm.is_custom)} value={feeForm.audience} onChange={e=>setFeeForm({...feeForm,audience:e.target.value})} className={fieldClass}><option>customer</option><option>vendor</option><option>rider</option></select><select value={feeForm.calculation_type} onChange={e=>setFeeForm({...feeForm,calculation_type:e.target.value})} className={fieldClass}><option value="fixed">Fixed</option><option value="percentage">Percentage</option><option value="per_km">Per km</option></select></div><input required type="number" min="0" step="0.01" value={feeForm.amount} onChange={e=>setFeeForm({...feeForm,amount:e.target.value})} placeholder="Amount/rate" className={fieldClass}/><input type="number" min="0" value={feeForm.minimum_order_value} onChange={e=>setFeeForm({...feeForm,minimum_order_value:e.target.value})} placeholder={feeForm.code === "rider_waiting" ? "Free waiting minutes" : "Minimum order value"} className={fieldClass}/><input value={feeForm.description} onChange={e=>setFeeForm({...feeForm,description:e.target.value})} placeholder="Description" className={fieldClass}/><Toggle checked={feeForm.is_active} onChange={value=>setFeeForm({...feeForm,is_active:value})}/></div><SaveButton busy={busy}/></form></div>}
          {tab === "settings" && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3">{settings.map((item) => <article key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-black text-slate-800">{item.key}</h2><span className={`h-2 w-2 rounded-full ${item.is_active ? "bg-green-500" : "bg-slate-300"}`} /></div><p className="text-sm text-slate-500">{item.description || "No description"}</p></div><span className="font-black text-slate-900">{Number(item.value).toLocaleString()}</span><button onClick={() => setSettingForm({ key: item.key, value: String(item.value), description: item.description || "", is_active: item.is_active })} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold">Edit</button><button onClick={() => window.confirm(`Delete ${item.key}?`) && run(() => deleteSystemSetting(item.key), "Setting deleted")} className="rounded-xl bg-red-50 p-2 text-red-600"><Trash2 size={15} /></button></article>)}</div>
            <form onSubmit={saveSetting} className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">{settings.some((item) => item.key === settingForm.key) ? "Edit" : "New"} setting</h2><div className="mt-4 space-y-3"><input required value={settingForm.key} onChange={(e) => setSettingForm({ ...settingForm, key: e.target.value })} placeholder="Key, e.g. price_per_km" className={fieldClass} /><input required type="number" step="0.01" value={settingForm.value} onChange={(e) => setSettingForm({ ...settingForm, value: e.target.value })} placeholder="Numeric value" className={fieldClass} /><input value={settingForm.description} onChange={(e) => setSettingForm({ ...settingForm, description: e.target.value })} placeholder="Description" className={fieldClass} /><Toggle checked={settingForm.is_active} onChange={(value) => setSettingForm({ ...settingForm, is_active: value })} /></div><SaveButton busy={busy} /></form>
          </div>}

          {tab === "promos" && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="grid gap-3 sm:grid-cols-2">{promos.map((item) => <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="flex justify-between gap-3"><div><h2 className="font-black text-slate-900">{item.code}</h2><p className="text-sm text-slate-500">{item.discount_value}{item.discount_type === "percentage" ? "%" : " NGN"} off</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${item.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{item.is_active ? "active" : "off"}</span></div><div className="mt-3 flex flex-wrap gap-2">{item.free_delivery && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase text-blue-700">Free delivery</span>}{Number(item.minimum_order_value || 0) > 0 && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">Min. ₦{Number(item.minimum_order_value).toLocaleString()}</span>}</div><p className="mt-3 text-xs text-slate-400">Used {item.usage_count || 0}/{item.usage_limit || "∞"} · expires {new Date(item.expiry_date).toLocaleDateString()}</p><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => setPromoForm({ id: item.id, code: item.code, discount_type: item.discount_type, discount_value: String(item.discount_value), expiry_date: String(item.expiry_date).slice(0, 16), usage_limit: item.usage_limit ? String(item.usage_limit) : "", free_delivery: Boolean(item.free_delivery), minimum_order_value: String(item.minimum_order_value ?? 0), is_active: item.is_active })} className="rounded-xl bg-slate-100 py-2 text-xs font-bold">Edit</button><button onClick={() => window.confirm(`Delete ${item.code}?`) && run(() => deletePromoCode(item.id), "Promo deleted")} className="rounded-xl bg-red-50 py-2 text-xs font-bold text-red-600">Delete</button></div></article>)}</div>
            <form onSubmit={savePromo} className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">{promoForm.id ? "Edit" : "New"} promo</h2><div className="mt-4 grid grid-cols-2 gap-3"><input required value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })} placeholder="Code" className={`${fieldClass} col-span-2 uppercase`} /><select value={promoForm.discount_type} onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value })} className={fieldClass}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select><input required type="number" step="0.01" value={promoForm.discount_value} onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })} placeholder="Value" className={fieldClass} /><input required type="datetime-local" value={promoForm.expiry_date} onChange={(e) => setPromoForm({ ...promoForm, expiry_date: e.target.value })} className={`${fieldClass} col-span-2`} /><input type="number" value={promoForm.usage_limit} onChange={(e) => setPromoForm({ ...promoForm, usage_limit: e.target.value })} placeholder="Usage limit" className={`${fieldClass} col-span-2`} /><div className="col-span-2"><Toggle checked={promoForm.is_active} onChange={(value) => setPromoForm({ ...promoForm, is_active: value })} /></div></div><SaveButton busy={busy} /></form>
          </div>}

          {tab === "promos" && <div className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2"><label className="flex items-center justify-between rounded-xl bg-green-50 p-3 text-sm font-bold text-green-800">Free delivery<input type="checkbox" checked={Boolean(promoForm.free_delivery)} onChange={e=>setPromoForm({...promoForm,free_delivery:e.target.checked})} className="h-5 w-5 accent-green-600"/></label><label className="text-xs font-black uppercase text-slate-500">Minimum order value<input type="number" min="0" value={promoForm.minimum_order_value} onChange={e=>setPromoForm({...promoForm,minimum_order_value:e.target.value})} className={`${fieldClass} mt-1`} /></label><p className="text-xs text-slate-500 sm:col-span-2">These values apply when you save the promo form above. Free delivery behaves like a delivery-fee credit and still pays the rider from platform funds.</p></div>}
          {tab === "filters" && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-3">{filters.map((item) => <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><div><h2 className="font-black text-slate-900">{item.name}</h2><p className="text-xs font-bold uppercase text-green-600">{item.type} · order {item.display_order}</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${item.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{item.is_active ? "active" : "off"}</span></div><div className="mt-3 flex flex-wrap gap-1">{item.values?.map((value: string) => <span key={value} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{value}</span>)}</div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => setFilterForm({ id: item.id, name: item.name, type: item.type, values: item.values.join(", "), display_order: String(item.display_order), icon: item.icon || "", is_active: item.is_active })} className="rounded-xl bg-slate-100 py-2 text-xs font-bold">Edit</button><button onClick={() => window.confirm(`Delete ${item.name}?`) && run(() => deleteDiscoveryFilter(item.id), "Filter deleted")} className="rounded-xl bg-red-50 py-2 text-xs font-bold text-red-600">Delete</button></div></article>)}</div>
            <form onSubmit={saveFilter} className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">{filterForm.id ? "Edit" : "New"} filter</h2><div className="mt-4 space-y-3"><input required value={filterForm.name} onChange={(e) => setFilterForm({ ...filterForm, name: e.target.value })} placeholder="Display name" className={fieldClass} /><select value={filterForm.type} onChange={(e) => setFilterForm({ ...filterForm, type: e.target.value })} className={fieldClass}>{["cuisine", "price_range", "rating", "delivery_time", "dietary"].map((value) => <option key={value}>{value}</option>)}</select><input required value={filterForm.values} onChange={(e) => setFilterForm({ ...filterForm, values: e.target.value })} placeholder="Values, comma separated" className={fieldClass} /><div className="grid grid-cols-2 gap-3"><input type="number" value={filterForm.display_order} onChange={(e) => setFilterForm({ ...filterForm, display_order: e.target.value })} placeholder="Order" className={fieldClass} /><input value={filterForm.icon} onChange={(e) => setFilterForm({ ...filterForm, icon: e.target.value })} placeholder="Icon" className={fieldClass} /></div><Toggle checked={filterForm.is_active} onChange={(value) => setFilterForm({ ...filterForm, is_active: value })} /></div><SaveButton busy={busy} /></form>
          </div>}

          {tab === "games" && <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-3">{games.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">No rider games created.</div> : games.map((game) => <article key={game.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black text-slate-900">{game.title}</h2><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${game.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{game.is_active ? "active" : "paused"}</span></div><p className="mt-1 text-sm text-slate-500">{game.description || "No description"}</p></div><Gamepad2 className="shrink-0 text-green-600" size={22} /></div><div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center"><div><p className="text-[10px] font-black uppercase text-slate-400">Date</p><p className="mt-1 text-xs font-bold text-slate-700">{new Date(`${game.game_date}T00:00:00`).toLocaleDateString()}</p></div><div><p className="text-[10px] font-black uppercase text-slate-400">Target</p><p className="mt-1 text-xs font-bold text-slate-700">{Number(game.target_km)} km</p></div><div><p className="text-[10px] font-black uppercase text-slate-400">Prize</p><p className="mt-1 text-xs font-bold text-slate-700">₦{Number(game.prize_amount).toLocaleString()}</p></div></div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => setGameForm({ id: game.id, title: game.title, description: game.description || "", target_km: String(game.target_km), prize_amount: String(game.prize_amount), game_date: game.game_date, is_active: game.is_active })} className="rounded-xl bg-slate-100 py-2.5 text-xs font-black">Edit</button><button onClick={() => window.confirm(`Delete ${game.title}?`) && run(() => deleteRiderGame(game.id), "Game deleted", () => gameForm.id === game.id && setGameForm({ id: "", title: "", description: "", target_km: "", prize_amount: "", game_date: "", is_active: true }))} className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-xs font-black text-red-600"><Trash2 size={14} /> Delete</button></div></article>)}</div>
            <form onSubmit={saveGame} className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h2 className="font-black text-slate-900">{gameForm.id ? "Edit" : "Create"} daily rider game</h2><p className="mt-1 text-xs text-slate-500">Only one game can use each date.</p></div>{gameForm.id && <button type="button" onClick={() => setGameForm({ id: "", title: "", description: "", target_km: "", prize_amount: "", game_date: "", is_active: true })} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold">Cancel</button>}</div><div className="mt-4 space-y-3"><input required value={gameForm.title} onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })} placeholder="Title" className={fieldClass} /><textarea value={gameForm.description} onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })} placeholder="Description" className={fieldClass} /><div className="grid grid-cols-2 gap-3"><input required type="number" min="0" step="0.01" value={gameForm.target_km} onChange={(e) => setGameForm({ ...gameForm, target_km: e.target.value })} placeholder="Target km" className={fieldClass} /><input required type="number" min="0" step="0.01" value={gameForm.prize_amount} onChange={(e) => setGameForm({ ...gameForm, prize_amount: e.target.value })} placeholder="Prize amount" className={fieldClass} /></div><input required type="date" value={gameForm.game_date} onChange={(e) => setGameForm({ ...gameForm, game_date: e.target.value })} className={fieldClass} /><Toggle checked={gameForm.is_active} onChange={(value) => setGameForm({ ...gameForm, is_active: value })} /></div><SaveButton busy={busy} label={gameForm.id ? "Update game" : "Create game"} /></form>
          </div><GameLeaderboard games={games} /></div>}
          {tab === "broadcasts" && <BroadcastBanners />}
        </>
      )}
    </section>
  );
}

function BroadcastBanners() {
  const { success, error: showError } = useToast();
  const empty = { title: "", message: "", target_apps: ["customer", "vendor", "rider"], background_color: "#16A34A", text_color: "#FFFFFF", is_active: true };
  const [rows, setRows] = useState<Row[]>([]); const [form, setForm] = useState<Row>(empty); const [busy, setBusy] = useState(false);
  const load = async () => { try { const { data } = await (await import("../../services/api")).default.get("/admin/broadcast-banners"); setRows(data || []); } catch (error) { showError(errorMessage(error)); } };
  useEffect(() => { load(); }, []);
  const save = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); try { const api = (await import("../../services/api")).default; if (form.id) await api.patch(`/admin/broadcast-banners/${form.id}`, form); else await api.post("/admin/broadcast-banners", form); success("Broadcast banner saved"); setForm(empty); await load(); } catch (error) { showError(errorMessage(error)); } finally { setBusy(false); } };
  const toggle = async (id: string) => { try { const api = (await import("../../services/api")).default; await api.patch(`/admin/broadcast-banners/${id}/toggle`); await load(); } catch (error) { showError(errorMessage(error)); } };
  const setTarget = (target: string, checked: boolean) => setForm({ ...form, target_apps: checked ? [...new Set([...form.target_apps, target])] : form.target_apps.filter((item: string) => item !== target) });
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]"><div className="space-y-3">{rows.map((row) => <article key={row.id} className="rounded-3xl border bg-white p-5 shadow-sm"><div className="h-3 rounded-full" style={{ backgroundColor: row.background_color }}/><div className="mt-4 flex justify-between gap-3"><div><h2 className="font-black">{row.title}</h2><p className="mt-1 text-sm text-slate-500">{row.message}</p><p className="mt-2 text-xs font-bold uppercase text-green-700">{row.target_apps.join(" · ")}</p></div><button onClick={() => toggle(row.id)} className={`h-fit rounded-full px-3 py-1 text-xs font-black ${row.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{row.is_active ? "Active" : "Off"}</button></div><button onClick={() => setForm({...row})} className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-black">Edit</button></article>)}</div><form onSubmit={save} className="h-fit rounded-3xl border bg-white p-5 shadow-sm"><h2 className="font-black">{form.id ? "Edit" : "New"} app banner</h2><div className="mt-4 space-y-3"><input required value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="Banner title" className={fieldClass}/><textarea required value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})} placeholder="Broadcast message" className={`${fieldClass} min-h-24`}/><div className="grid grid-cols-3 gap-2">{["customer","vendor","rider"].map(target => <label key={target} className="rounded-xl bg-slate-50 p-3 text-xs font-bold capitalize"><input type="checkbox" checked={form.target_apps.includes(target)} onChange={(e)=>setTarget(target,e.target.checked)} className="mr-2 accent-green-600"/>{target}</label>)}</div><div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Banner color<input type="color" value={form.background_color} onChange={(e)=>setForm({...form,background_color:e.target.value})} className="mt-1 h-12 w-full rounded-xl"/></label><label className="text-xs font-bold">Text color<input type="color" value={form.text_color} onChange={(e)=>setForm({...form,text_color:e.target.value})} className="mt-1 h-12 w-full rounded-xl"/></label></div><Toggle checked={form.is_active} onChange={(value)=>setForm({...form,is_active:value})}/></div><SaveButton busy={busy} label="Save banner"/></form></div>;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-600"><span>Active</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-green-600" /></label>;
}

function SaveButton({ busy, label = "Save" }: { busy: boolean; label?: string }) {
  return <button disabled={busy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-xs font-black uppercase tracking-wide text-white disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}{label}</button>;
}

function LegacyGameLeaderboard({ games }: { games: Row[] }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [filters, setFilters] = useState({ game_id: "", date_from: "", date_to: "", search: "", status: "" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try { const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value)); const { data } = await getAdminGameLeaderboard({ ...activeFilters, page, per_page: 10 }); setRows(data.items || []); setMeta(data); }
    finally { setLoading(false); }
  }, [filters, page]);
  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);

  const openParticipant = async (riderId: string, nextPage = 1) => {
    const { data } = await getAdminGameParticipant(riderId, { page: nextPage, per_page: 10, date_from: filters.date_from || undefined, date_to: filters.date_to || undefined });
    setSelected(data); setHistoryPage(nextPage);
  };

  return <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><div><h2 className="font-black text-slate-900">Rider game leaderboard</h2><p className="text-xs text-slate-500">Filter participants, inspect rank data, and view rider history.</p></div><div className="mt-4 grid gap-2 md:grid-cols-5"><select value={filters.game_id} onChange={(e) => { setFilters({ ...filters, game_id: e.target.value }); setPage(1); }} className={fieldClass}><option value="">All games</option>{games.map((game) => <option key={game.id} value={game.id}>{game.title} · {game.game_date}</option>)}</select><input type="date" value={filters.date_from} onChange={(e) => { setFilters({ ...filters, date_from: e.target.value }); setPage(1); }} className={fieldClass} /><input type="date" value={filters.date_to} onChange={(e) => { setFilters({ ...filters, date_to: e.target.value }); setPage(1); }} className={fieldClass} /><input value={filters.search} onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }} placeholder="Search rider" className={fieldClass} /><select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }} className={fieldClass}><option value="">All statuses</option><option value="active">Active</option><option value="completed">Completed</option><option value="failed">Failed</option></select></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b text-[10px] font-black uppercase text-slate-400"><th className="p-3">Participant</th><th className="p-3">Game/date</th><th className="p-3">Distance</th><th className="p-3">Orders</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="mx-auto animate-spin text-green-600" /></td></tr> : rows.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-400">No participants found.</td></tr> : rows.map((row) => <tr key={row.participation_id} className="border-b border-slate-50"><td className="p-3"><p className="font-black">{row.rider_name}</p><p className="text-xs text-slate-400">{row.rider_email}</p></td><td className="p-3"><p className="font-bold">{row.game_title}</p><p className="text-xs text-slate-400">{row.game_date}</p></td><td className="p-3 font-black">{row.current_km} km</td><td className="p-3">{row.total_orders}</td><td className="p-3 capitalize">{row.status}</td><td className="p-3"><button onClick={() => openParticipant(row.rider_id)} className="rounded-lg bg-green-50 px-3 py-2 text-xs font-black text-green-700">View details</button></td></tr>)}</tbody></table></div><div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{meta.total} participants</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg bg-slate-100 px-3 py-2 font-bold disabled:opacity-40">Previous</button><span className="px-2 py-2">{page}/{Math.max(meta.pages, 1)}</span><button disabled={page >= meta.pages} onClick={() => setPage(page + 1)} className="rounded-lg bg-slate-100 px-3 py-2 font-bold disabled:opacity-40">Next</button></div></div>{selected && <div className="fixed inset-0 z-[80] flex items-end bg-slate-950/60 sm:items-center sm:justify-center sm:p-6" onClick={() => setSelected(null)}><div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 sm:max-w-3xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}><div className="flex justify-between gap-3"><div><h3 className="text-xl font-black">{selected.participant.firstname} {selected.participant.lastname}</h3><p className="text-sm text-slate-500">{selected.participant.email} · {selected.participant.phone || "No phone"}</p></div><button onClick={() => setSelected(null)} className="rounded-xl bg-slate-100 p-2"><Trash2 className="rotate-45" size={18} /></button></div><div className="mt-5 space-y-2">{selected.history.map((item: Row) => <div key={item.id} className="grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 p-3 text-sm"><div className="col-span-2"><p className="font-black">{item.game_title}</p><p className="text-xs text-slate-400">{item.game_date}</p></div><p className="font-bold">{item.current_km} km</p><p className="capitalize">{item.status}</p></div>)}</div><div className="mt-4 flex justify-end gap-2"><button disabled={historyPage <= 1} onClick={() => openParticipant(selected.participant.id, historyPage - 1)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold disabled:opacity-40">Previous</button><button disabled={historyPage >= selected.pages} onClick={() => openParticipant(selected.participant.id, historyPage + 1)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold disabled:opacity-40">Next</button></div></div></div>}</article>;
}

function GameLeaderboard({ games }: { games: Row[] }) {
  const { success, error: showError } = useToast();
  const [leaders, setLeaders] = useState<Row[]>([]);
  const [rewardTarget, setRewardTarget] = useState<Row | null>(null);
  const [rewardForm, setRewardForm] = useState({ amount: "", message: "", mark_winner: true });
  const [rewardBusy, setRewardBusy] = useState(false);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentGame = games.find((game) => String(game.game_date).slice(0, 10) === today);

  const loadCurrentLeaders = useCallback(async () => {
    if (!currentGame) {
      setLeaders([]);
      return;
    }
    try {
      const { data } = await getAdminGameLeaderboard({ game_id: currentGame.id, page: 1, per_page: 3 });
      setLeaders(data.items || []);
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [currentGame?.id, showError]);

  useEffect(() => {
    loadCurrentLeaders();
    const timer = window.setInterval(loadCurrentLeaders, 30000);
    return () => window.clearInterval(timer);
  }, [loadCurrentLeaders]);

  const openReward = (leader: Row) => {
    setRewardTarget(leader);
    setRewardForm({
      amount: leader.is_won ? "0" : String(currentGame?.prize_amount || ""),
      message: leader.is_won ? "" : `Congratulations! You won ${currentGame?.title || "today's rider game"}.`,
      mark_winner: !leader.is_won,
    });
  };

  const sendReward = async () => {
    if (!rewardTarget || !rewardForm.message.trim()) return;
    setRewardBusy(true);
    try {
      await rewardAdminGameParticipant(rewardTarget.participation_id, {
        amount: Number(rewardForm.amount || 0),
        message: rewardForm.message.trim(),
        mark_winner: rewardForm.mark_winner,
      });
      success(Number(rewardForm.amount || 0) > 0 ? "Reward credited and notification sent" : "Message sent");
      setRewardTarget(null);
      await loadCurrentLeaders();
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setRewardBusy(false);
    }
  };

  return <div className="space-y-5">
    <article className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="flex items-center gap-2"><Trophy className="text-amber-600" size={21}/><h2 className="font-black text-slate-900">Today’s winner shortlist</h2></div><p className="mt-1 text-xs text-slate-500">Live top three refresh every 30 seconds. Reward credit can only be issued once per participation.</p></div>
        {currentGame && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">{currentGame.title} · ₦{Number(currentGame.prize_amount).toLocaleString()}</span>}
      </div>
      {!currentGame ? <p className="mt-4 rounded-2xl bg-white p-5 text-center text-sm text-slate-500">No rider game scheduled for today.</p> : leaders.length === 0 ? <p className="mt-4 rounded-2xl bg-white p-5 text-center text-sm text-slate-500">No riders have joined today’s game.</p> : <div className="mt-4 grid gap-3 lg:grid-cols-3">{leaders.map((leader, index) => <div key={leader.participation_id} className="rounded-2xl border border-amber-100 bg-white p-4">
        <div className="flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-sm font-black text-amber-800">#{index + 1}</span>{leader.is_won && <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-black uppercase text-green-700">Rewarded ₦{Number(leader.won_amount || 0).toLocaleString()}</span>}</div>
        <p className="mt-3 font-black text-slate-900">{leader.rider_name}</p><p className="text-xs text-slate-400">{leader.rider_email}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center"><div className="rounded-xl bg-slate-50 p-2"><p className="font-black">{leader.current_km} km</p><p className="text-[9px] uppercase text-slate-400">Distance</p></div><div className="rounded-xl bg-slate-50 p-2"><p className="font-black">{leader.total_orders}</p><p className="text-[9px] uppercase text-slate-400">Orders</p></div></div>
        <button onClick={() => openReward(leader)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-black text-white">{leader.is_won ? <Send size={14}/> : <Wallet size={14}/>} {leader.is_won ? "Send message" : "Reward or message"}</button>
      </div>)}</div>}
    </article>
    <LegacyGameLeaderboard games={games}/>
    {rewardTarget && <div className="fixed inset-0 z-[90] flex items-end bg-slate-950/60 sm:items-center sm:justify-center sm:p-6" onClick={() => !rewardBusy && setRewardTarget(null)}><div className="w-full rounded-t-3xl bg-white p-6 sm:max-w-lg sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
      <h3 className="text-xl font-black text-slate-900">Reward or message {rewardTarget.rider_name}</h3><p className="mt-1 text-xs text-slate-500">Use amount 0 to send only a custom notification.</p>
      <label className="mt-5 block text-[10px] font-black uppercase text-slate-500">Balance credit<input type="number" min="0" step="0.01" value={rewardForm.amount} onChange={(event) => setRewardForm({...rewardForm, amount:event.target.value})} className={`${fieldClass} mt-1 normal-case`}/></label>
      <label className="mt-3 block text-[10px] font-black uppercase text-slate-500">Reward or custom message<textarea required maxLength={500} value={rewardForm.message} onChange={(event) => setRewardForm({...rewardForm, message:event.target.value})} className={`${fieldClass} mt-1 min-h-28 normal-case`}/></label>
      <label className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">Mark as winner<input type="checkbox" checked={rewardForm.mark_winner} onChange={(event) => setRewardForm({...rewardForm, mark_winner:event.target.checked})} className="h-5 w-5 accent-amber-600"/></label>
      <div className="mt-5 grid grid-cols-2 gap-2"><button disabled={rewardBusy} onClick={() => setRewardTarget(null)} className="rounded-xl bg-slate-100 py-3 text-xs font-black">Cancel</button><button disabled={rewardBusy || !rewardForm.message.trim()} onClick={sendReward} className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-xs font-black text-white disabled:opacity-50">{rewardBusy ? <Loader2 className="animate-spin" size={15}/> : <Send size={15}/>} Send</button></div>
    </div></div>}
  </div>;
}
