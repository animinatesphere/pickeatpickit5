/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldBan,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import api, {
  deleteVendorLogo,
  deleteMenuItemImage,
  updateAdminRiderStatus,
  updateMenuItemImage,
  updateVendorLogo,
  updateVendorCommission,
  updateVendorStatus,
} from "../../services/api";
import { useToast } from "../../context/ToastContext";
import ApprovalDetail from "./ApprovalDetail";

type Partner = Record<string, any>;

const message = (error: any) =>
  error?.response?.data?.detail || error?.message || "Action failed";

function Status({ value }: { value?: string }) {
  const status = value || "unknown";
  const tone = ["approved", "accepted", "active"].includes(status)
    ? "bg-green-50 text-green-700"
    : status === "pending"
      ? "bg-amber-50 text-amber-700"
      : "bg-red-50 text-red-700";
  return <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${tone}`}>{status}</span>;
}

export default function Partners({ kind }: { kind: "vendor" | "rider" }) {
  const { success, error: showError } = useToast();
  const plural = kind === "vendor" ? "vendors" : "riders";
  const [rows, setRows] = useState<Partner[]>([]);
  const [selected, setSelected] = useState<Partner | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [menuItems, setMenuItems] = useState<Partner[]>([]);
  const [commission, setCommission] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/${plural}`, {
        params: status === "all" ? { limit: 100 } : { status, limit: 100 },
      });
      setRows(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showError(message(error));
    } finally {
      setLoading(false);
    }
  }, [plural, status, showError]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return rows.filter((row) =>
      [row.business_name, row.firstname, row.lastname, row.email, row.phone, row.plate_number]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [query, rows]);

  const openDetails = async (row: Partner) => {
    setSelected(row);
    setLogoUrl(row.logo_url || "");
    setCommission(row.commission_percentage == null ? "" : String(row.commission_percentage));
    try {
      const [response, menuResponse] = await Promise.all([
        api.get(`/admin/${plural}/${row.id}`),
        kind === "vendor"
          ? api.get("/menu/", { params: { vendor_id: row.id } })
          : Promise.resolve({ data: [] }),
      ]);
      setSelected(response.data);
      setLogoUrl(response.data.logo_url || "");
      setCommission(response.data.commission_percentage == null ? "" : String(response.data.commission_percentage));
      setMenuItems(Array.isArray(menuResponse.data) ? menuResponse.data : []);
    } catch (error) {
      showError(message(error));
    }
  };

  const saveCommission = async () => {
    if (!selected || kind !== "vendor") return;
    const value = commission.trim() === "" ? null : Number(commission);
    if (value !== null && (Number.isNaN(value) || value < 0 || value > 100)) return showError("Commission must be between 0 and 100");
    setBusy(true);
    try {
      const response = await updateVendorCommission(selected.id, value);
      setSelected(response.data);
      setCommission(response.data.commission_percentage == null ? "" : String(response.data.commission_percentage));
      success(value === null ? "Vendor restored to global commission" : `Vendor commission set to ${value}%`);
      await load();
    } catch (error) { showError(message(error)); } finally { setBusy(false); }
  };

  const updateStatus = async (value: string) => {
    if (!selected) return;
    setBusy(true);
    try {
      if (kind === "vendor") await updateVendorStatus(selected.id, value);
      else await updateAdminRiderStatus(selected.id, value);
      success(`${kind === "vendor" ? "Vendor" : "Rider"} status updated`);
      setSelected(null);
      await load();
    } catch (error) {
      showError(message(error));
    } finally {
      setBusy(false);
    }
  };

  const saveLogo = async () => {
    if (!selected || kind !== "vendor") return;
    setBusy(true);
    try {
      if (logoUrl.trim()) await updateVendorLogo(selected.id, logoUrl.trim());
      else await deleteVendorLogo(selected.id);
      success("Vendor logo updated");
      setSelected({ ...selected, logo_url: logoUrl.trim() || null });
      await load();
    } catch (error) {
      showError(message(error));
    } finally {
      setBusy(false);
    }
  };

  const changeMealImage = async (item: Partner, remove = false) => {
    const url = remove ? "" : window.prompt("New meal image URL", item.image_url || "");
    if (url === null) return;
    setBusy(true);
    try {
      if (remove || !url.trim()) await deleteMenuItemImage(item.id);
      else await updateMenuItemImage(item.id, url.trim());
      setMenuItems((current) => current.map((row) => row.id === item.id ? { ...row, image_url: remove ? null : url.trim() } : row));
      success("Meal image updated");
    } catch (error) {
      showError(message(error));
    } finally {
      setBusy(false);
    }
  };

  const statuses = kind === "vendor"
    ? ["all", "pending", "approved", "suspended"]
    : ["all", "pending", "accepted", "rejected"];

  if (detailId) {
    return (
      <ApprovalDetail
        kind={kind}
        id={detailId}
        onBack={() => setDetailId(null)}
        onChanged={load}
        backLabel={`Back to ${plural}`}
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">Partner directory</p>
          <h1 className="mt-1 text-2xl font-black capitalize tracking-tight text-slate-900">{plural}</h1>
          <p className="mt-1 text-sm text-slate-500">Inspect profiles and control account status.</p>
        </div>
        <button onClick={load} className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm" aria-label={`Refresh ${plural}`}>
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:flex sm:items-center sm:gap-3 sm:space-y-0">
        <label className="relative block flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${plural}`} className="w-full rounded-xl bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none ring-green-500 focus:ring-2" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl bg-slate-50 px-3 py-3 text-sm font-bold capitalize outline-none sm:w-44">
          {statuses.map((value) => <option key={value}>{value}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-green-600" size={34} /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">No {plural} found.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => {
            const title = kind === "vendor" ? row.business_name : `${row.firstname || ""} ${row.lastname || ""}`.trim();
            return (
              <button key={row.id} onClick={() => openDetails(row)} className="rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md">
                <div className="flex items-start gap-3">
                  {kind === "vendor" && row.logo_url ? (
                    <img src={row.logo_url} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                  ) : (
                    <div className="rounded-2xl bg-green-50 p-3 text-green-700">{kind === "vendor" ? <Building2 size={22} /> : <Truck size={22} />}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2"><h2 className="truncate font-black text-slate-900">{title || `Unnamed ${kind}`}</h2><Status value={row.status} /></div>
                    <p className="mt-1 truncate text-sm text-slate-500">{row.email}</p>
                    <p className="mt-3 flex items-center gap-1 truncate text-xs text-slate-400"><MapPin size={12} /> {row.business_address || row.address || row.city || "No address"}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/55 sm:items-center sm:justify-center sm:p-6" onClick={() => setSelected(null)}>
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-[2rem] sm:p-7" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div><Status value={selected.status} /><h2 className="mt-2 text-2xl font-black text-slate-900">{kind === "vendor" ? selected.business_name : `${selected.firstname || ""} ${selected.lastname || ""}`}</h2><p className="text-sm text-slate-500">{selected.email}</p></div>
              <button onClick={() => setSelected(null)} className="rounded-xl bg-slate-100 p-2 text-slate-600"><X size={20} /></button>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Phone", selected.business_phone || selected.phone],
                ["Location", selected.business_address || selected.address || selected.city],
                [kind === "vendor" ? "Category" : "Vehicle", kind === "vendor" ? selected.business_category : `${selected.vehicle_type || "—"} ${selected.vehicle_brand || ""}`],
                [kind === "vendor" ? "Workers" : "Plate", kind === "vendor" ? selected.total_workers : selected.plate_number],
                [kind === "vendor" ? "Balance" : "Deliveries", kind === "vendor" ? `₦${Number(selected.balance || 0).toLocaleString()}` : selected.total_deliveries],
                [kind === "vendor" ? "COD" : "Rating", kind === "vendor" ? (selected.accept_cod ? "Enabled" : "Disabled") : selected.average_rating],
              ].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-slate-50 p-3"><dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words font-bold text-slate-700">{value || "—"}</dd></div>)}
            </dl>

            {kind === "rider" && selected.license_image && <a href={selected.license_image} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700">View driver licence <ExternalLink size={15} /></a>}

            <button
              type="button"
              onClick={() => { setDetailId(selected.id); setSelected(null); }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white"
            >
              View details <ExternalLink size={15} />
            </button>

            {kind === "vendor" && (
              <>
                <div className="mt-5 rounded-2xl border border-slate-200 p-4"><label className="text-xs font-black uppercase tracking-wide text-slate-500">Individual commission %</label><p className="mt-1 text-xs text-slate-400">Leave blank to use global commission.</p><div className="mt-2 flex gap-2"><input type="number" min="0" max="100" step="0.01" value={commission} onChange={(event) => setCommission(event.target.value)} placeholder="Global" className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" /><button onClick={saveCommission} disabled={busy} className="rounded-xl bg-green-600 px-4 text-xs font-black text-white disabled:opacity-50">Save</button></div></div>
                <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                  <label className="text-xs font-black uppercase tracking-wide text-slate-500">Logo URL</label>
                  <div className="mt-2 flex gap-2"><input value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} placeholder="https://..." className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500" /><button onClick={saveLogo} disabled={busy} className="rounded-xl bg-slate-900 px-4 text-xs font-black text-white disabled:opacity-50">Save</button></div>
                </div>
                <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-slate-500">Meal images</p><p className="text-xs text-slate-400">{menuItems.length} menu items</p></div></div>
                  <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                    {menuItems.length === 0 ? <p className="py-5 text-center text-sm text-slate-400">No menu items found.</p> : menuItems.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2">{item.image_url ? <img src={item.image_url} alt="" className="h-11 w-11 rounded-lg object-cover" /> : <div className="h-11 w-11 rounded-lg bg-slate-200" />}<span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{item.name}</span><button disabled={busy} onClick={() => changeMealImage(item)} className="rounded-lg bg-white px-2 py-1.5 text-[10px] font-black text-slate-700">Change</button>{item.image_url && <button disabled={busy} onClick={() => changeMealImage(item, true)} className="rounded-lg bg-red-50 px-2 py-1.5 text-[10px] font-black text-red-600">Remove</button>}</div>)}
                  </div>
                </div>
              </>
            )}

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {kind === "vendor" ? (
                <>
                  <button onClick={() => updateStatus("suspended")} disabled={busy} className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 py-3 text-xs font-black uppercase text-red-600 disabled:opacity-50"><ShieldBan size={16} /> Suspend</button>
                  <button onClick={() => updateStatus("pending")} disabled={busy} className="rounded-2xl border border-amber-200 py-3 text-xs font-black uppercase text-amber-700 disabled:opacity-50">Set pending</button>
                  <button onClick={() => updateStatus("approved")} disabled={busy} className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 text-xs font-black uppercase text-white disabled:opacity-50"><CheckCircle2 size={16} /> Approve</button>
                </>
              ) : (
                <>
                  <button onClick={() => updateStatus("rejected")} disabled={busy} className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 py-3 text-xs font-black uppercase text-red-600 disabled:opacity-50"><XCircle size={16} /> Reject</button>
                  <button onClick={() => updateStatus("pending")} disabled={busy} className="rounded-2xl border border-amber-200 py-3 text-xs font-black uppercase text-amber-700 disabled:opacity-50">Set pending</button>
                  <button onClick={() => updateStatus("accepted")} disabled={busy} className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 text-xs font-black uppercase text-white disabled:opacity-50"><CheckCircle2 size={16} /> Accept</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
