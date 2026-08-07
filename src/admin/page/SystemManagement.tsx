/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import { Filter, Gamepad2, Loader2, Plus, Settings2, Tags, Trash2 } from "lucide-react";
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
  getPromoCodes,
  getSystemSettings,
  updateDiscoveryFilter,
  updatePromoCode,
  updateRiderGame,
  updateSystemSetting,
} from "../../services/api";
import { useToast } from "../../context/ToastContext";

type Row = Record<string, any>;
type Tab = "settings" | "promos" | "filters" | "games";
const errorMessage = (error: any) => error?.response?.data?.detail || error?.message || "Action failed";

const fieldClass = "w-full rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none ring-green-500 focus:ring-2";

export default function SystemManagement() {
  const { success: showSuccess, error: showError } = useToast();
  const [tab, setTab] = useState<Tab>("settings");
  const [settings, setSettings] = useState<Row[]>([]);
  const [promos, setPromos] = useState<Row[]>([]);
  const [filters, setFilters] = useState<Row[]>([]);
  const [games, setGames] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [settingForm, setSettingForm] = useState({ key: "", value: "", description: "", is_active: true });
  const [promoForm, setPromoForm] = useState({ id: "", code: "", discount_type: "percentage", discount_value: "", expiry_date: "", usage_limit: "", is_active: true });
  const [filterForm, setFilterForm] = useState({ id: "", name: "", type: "cuisine", values: "", display_order: "0", icon: "", is_active: true });
  const [gameForm, setGameForm] = useState({ id: "", title: "", description: "", target_km: "", prize_amount: "", game_date: "", is_active: true });

  const load = useCallback(async () => {
    setLoading(true);
    const [settingsResult, promoResult, filterResult, gamesResult] = await Promise.allSettled([
      getSystemSettings(), getPromoCodes(), getDiscoveryFilters(), getAdminRiderGames(),
    ]);
    if (settingsResult.status === "fulfilled") setSettings(settingsResult.value.data);
    if (promoResult.status === "fulfilled") setPromos(promoResult.value.data);
    if (filterResult.status === "fulfilled") setFilters(filterResult.value.data);
    if (gamesResult.status === "fulfilled") setGames(Array.isArray(gamesResult.value.data) ? gamesResult.value.data : []);
    if ([settingsResult, promoResult, filterResult, gamesResult].some((r) => r.status === "rejected")) showError("Some system data could not be loaded");
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
    const payload = { code: promoForm.code.toUpperCase(), discount_type: promoForm.discount_type, discount_value: Number(promoForm.discount_value), expiry_date: new Date(promoForm.expiry_date).toISOString(), usage_limit: promoForm.usage_limit ? Number(promoForm.usage_limit) : null, is_active: promoForm.is_active };
    run(
      () => promoForm.id ? updatePromoCode(promoForm.id, payload) : createPromoCode(payload),
      promoForm.id ? "Promo updated" : "Promo created",
      () => setPromoForm({ id: "", code: "", discount_type: "percentage", discount_value: "", expiry_date: "", usage_limit: "", is_active: true }),
    );
  };

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
    ["settings", "Settings", <Settings2 size={16} />],
    ["promos", "Promos", <Tags size={16} />],
    ["filters", "Filters", <Filter size={16} />],
    ["games", "Games", <Gamepad2 size={16} />],
  ];

  return (
    <section className="space-y-5">
      <div><p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">Platform controls</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">System configuration</h1><p className="mt-1 text-sm text-slate-500">Manage fees, promotions, discovery filters, and rider games.</p></div>
      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-1.5">
        {tabs.map(([value, label, icon]) => <button key={value} onClick={() => setTab(value)} className={`flex items-center justify-center gap-1 rounded-xl px-1 py-3 text-[10px] font-black uppercase sm:text-xs ${tab === value ? "bg-white text-green-700 shadow-sm" : "text-slate-500"}`}>{icon}<span className="hidden min-[390px]:inline">{label}</span></button>)}
      </div>

      {loading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-green-600" size={34} /></div> : (
        <>
          {tab === "settings" && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3">{settings.map((item) => <article key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-black text-slate-800">{item.key}</h2><span className={`h-2 w-2 rounded-full ${item.is_active ? "bg-green-500" : "bg-slate-300"}`} /></div><p className="text-sm text-slate-500">{item.description || "No description"}</p></div><span className="font-black text-slate-900">{Number(item.value).toLocaleString()}</span><button onClick={() => setSettingForm({ key: item.key, value: String(item.value), description: item.description || "", is_active: item.is_active })} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold">Edit</button><button onClick={() => window.confirm(`Delete ${item.key}?`) && run(() => deleteSystemSetting(item.key), "Setting deleted")} className="rounded-xl bg-red-50 p-2 text-red-600"><Trash2 size={15} /></button></article>)}</div>
            <form onSubmit={saveSetting} className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">{settings.some((item) => item.key === settingForm.key) ? "Edit" : "New"} setting</h2><div className="mt-4 space-y-3"><input required value={settingForm.key} onChange={(e) => setSettingForm({ ...settingForm, key: e.target.value })} placeholder="Key, e.g. price_per_km" className={fieldClass} /><input required type="number" step="0.01" value={settingForm.value} onChange={(e) => setSettingForm({ ...settingForm, value: e.target.value })} placeholder="Numeric value" className={fieldClass} /><input value={settingForm.description} onChange={(e) => setSettingForm({ ...settingForm, description: e.target.value })} placeholder="Description" className={fieldClass} /><Toggle checked={settingForm.is_active} onChange={(value) => setSettingForm({ ...settingForm, is_active: value })} /></div><SaveButton busy={busy} /></form>
          </div>}

          {tab === "promos" && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="grid gap-3 sm:grid-cols-2">{promos.map((item) => <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="flex justify-between gap-3"><div><h2 className="font-black text-slate-900">{item.code}</h2><p className="text-sm text-slate-500">{item.discount_value}{item.discount_type === "percentage" ? "%" : " NGN"} off</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${item.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{item.is_active ? "active" : "off"}</span></div><p className="mt-3 text-xs text-slate-400">Used {item.usage_count || 0}/{item.usage_limit || "∞"} · expires {new Date(item.expiry_date).toLocaleDateString()}</p><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => setPromoForm({ id: item.id, code: item.code, discount_type: item.discount_type, discount_value: String(item.discount_value), expiry_date: String(item.expiry_date).slice(0, 16), usage_limit: item.usage_limit ? String(item.usage_limit) : "", is_active: item.is_active })} className="rounded-xl bg-slate-100 py-2 text-xs font-bold">Edit</button><button onClick={() => window.confirm(`Delete ${item.code}?`) && run(() => deletePromoCode(item.id), "Promo deleted")} className="rounded-xl bg-red-50 py-2 text-xs font-bold text-red-600">Delete</button></div></article>)}</div>
            <form onSubmit={savePromo} className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">{promoForm.id ? "Edit" : "New"} promo</h2><div className="mt-4 grid grid-cols-2 gap-3"><input required value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })} placeholder="Code" className={`${fieldClass} col-span-2 uppercase`} /><select value={promoForm.discount_type} onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value })} className={fieldClass}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select><input required type="number" step="0.01" value={promoForm.discount_value} onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })} placeholder="Value" className={fieldClass} /><input required type="datetime-local" value={promoForm.expiry_date} onChange={(e) => setPromoForm({ ...promoForm, expiry_date: e.target.value })} className={`${fieldClass} col-span-2`} /><input type="number" value={promoForm.usage_limit} onChange={(e) => setPromoForm({ ...promoForm, usage_limit: e.target.value })} placeholder="Usage limit" className={`${fieldClass} col-span-2`} /><div className="col-span-2"><Toggle checked={promoForm.is_active} onChange={(value) => setPromoForm({ ...promoForm, is_active: value })} /></div></div><SaveButton busy={busy} /></form>
          </div>}

          {tab === "filters" && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-3">{filters.map((item) => <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><div><h2 className="font-black text-slate-900">{item.name}</h2><p className="text-xs font-bold uppercase text-green-600">{item.type} · order {item.display_order}</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${item.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{item.is_active ? "active" : "off"}</span></div><div className="mt-3 flex flex-wrap gap-1">{item.values?.map((value: string) => <span key={value} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{value}</span>)}</div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => setFilterForm({ id: item.id, name: item.name, type: item.type, values: item.values.join(", "), display_order: String(item.display_order), icon: item.icon || "", is_active: item.is_active })} className="rounded-xl bg-slate-100 py-2 text-xs font-bold">Edit</button><button onClick={() => window.confirm(`Delete ${item.name}?`) && run(() => deleteDiscoveryFilter(item.id), "Filter deleted")} className="rounded-xl bg-red-50 py-2 text-xs font-bold text-red-600">Delete</button></div></article>)}</div>
            <form onSubmit={saveFilter} className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">{filterForm.id ? "Edit" : "New"} filter</h2><div className="mt-4 space-y-3"><input required value={filterForm.name} onChange={(e) => setFilterForm({ ...filterForm, name: e.target.value })} placeholder="Display name" className={fieldClass} /><select value={filterForm.type} onChange={(e) => setFilterForm({ ...filterForm, type: e.target.value })} className={fieldClass}>{["cuisine", "price_range", "rating", "delivery_time", "dietary"].map((value) => <option key={value}>{value}</option>)}</select><input required value={filterForm.values} onChange={(e) => setFilterForm({ ...filterForm, values: e.target.value })} placeholder="Values, comma separated" className={fieldClass} /><div className="grid grid-cols-2 gap-3"><input type="number" value={filterForm.display_order} onChange={(e) => setFilterForm({ ...filterForm, display_order: e.target.value })} placeholder="Order" className={fieldClass} /><input value={filterForm.icon} onChange={(e) => setFilterForm({ ...filterForm, icon: e.target.value })} placeholder="Icon" className={fieldClass} /></div><Toggle checked={filterForm.is_active} onChange={(value) => setFilterForm({ ...filterForm, is_active: value })} /></div><SaveButton busy={busy} /></form>
          </div>}

          {tab === "games" && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-3">{games.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">No rider games created.</div> : games.map((game) => <article key={game.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black text-slate-900">{game.title}</h2><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${game.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{game.is_active ? "active" : "paused"}</span></div><p className="mt-1 text-sm text-slate-500">{game.description || "No description"}</p></div><Gamepad2 className="shrink-0 text-green-600" size={22} /></div><div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center"><div><p className="text-[10px] font-black uppercase text-slate-400">Date</p><p className="mt-1 text-xs font-bold text-slate-700">{new Date(`${game.game_date}T00:00:00`).toLocaleDateString()}</p></div><div><p className="text-[10px] font-black uppercase text-slate-400">Target</p><p className="mt-1 text-xs font-bold text-slate-700">{Number(game.target_km)} km</p></div><div><p className="text-[10px] font-black uppercase text-slate-400">Prize</p><p className="mt-1 text-xs font-bold text-slate-700">₦{Number(game.prize_amount).toLocaleString()}</p></div></div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => setGameForm({ id: game.id, title: game.title, description: game.description || "", target_km: String(game.target_km), prize_amount: String(game.prize_amount), game_date: game.game_date, is_active: game.is_active })} className="rounded-xl bg-slate-100 py-2.5 text-xs font-black">Edit</button><button onClick={() => window.confirm(`Delete ${game.title}?`) && run(() => deleteRiderGame(game.id), "Game deleted", () => gameForm.id === game.id && setGameForm({ id: "", title: "", description: "", target_km: "", prize_amount: "", game_date: "", is_active: true }))} className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-xs font-black text-red-600"><Trash2 size={14} /> Delete</button></div></article>)}</div>
            <form onSubmit={saveGame} className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h2 className="font-black text-slate-900">{gameForm.id ? "Edit" : "Create"} daily rider game</h2><p className="mt-1 text-xs text-slate-500">Only one game can use each date.</p></div>{gameForm.id && <button type="button" onClick={() => setGameForm({ id: "", title: "", description: "", target_km: "", prize_amount: "", game_date: "", is_active: true })} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold">Cancel</button>}</div><div className="mt-4 space-y-3"><input required value={gameForm.title} onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })} placeholder="Title" className={fieldClass} /><textarea value={gameForm.description} onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })} placeholder="Description" className={fieldClass} /><div className="grid grid-cols-2 gap-3"><input required type="number" min="0" step="0.01" value={gameForm.target_km} onChange={(e) => setGameForm({ ...gameForm, target_km: e.target.value })} placeholder="Target km" className={fieldClass} /><input required type="number" min="0" step="0.01" value={gameForm.prize_amount} onChange={(e) => setGameForm({ ...gameForm, prize_amount: e.target.value })} placeholder="Prize amount" className={fieldClass} /></div><input required type="date" value={gameForm.game_date} onChange={(e) => setGameForm({ ...gameForm, game_date: e.target.value })} className={fieldClass} /><Toggle checked={gameForm.is_active} onChange={(value) => setGameForm({ ...gameForm, is_active: value })} /></div><SaveButton busy={busy} label={gameForm.id ? "Update game" : "Create game"} /></form>
          </div>}
        </>
      )}
    </section>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-600"><span>Active</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-green-600" /></label>;
}

function SaveButton({ busy, label = "Save" }: { busy: boolean; label?: string }) {
  return <button disabled={busy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-xs font-black uppercase tracking-wide text-white disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}{label}</button>;
}
