/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  RefreshCw,
  Store,
  Truck,
  XCircle,
} from "lucide-react";
import {
  approveVendorName,
  getPendingNameChanges,
  getPendingRiders,
  getPendingVendors,
  rejectVendorName,
  updateAdminRiderStatus,
  updateVendorStatus,
} from "../../services/api";
import { useToast } from "../../context/ToastContext";
import ApprovalDetail from "./ApprovalDetail";

type RecordRow = Record<string, any>;
type ApprovalTab = "vendors" | "riders" | "names";

const errorMessage = (error: any) =>
  error?.response?.data?.detail || error?.message || "Action failed";

const responseRows = (value: unknown): RecordRow[] => {
  const payload = (value as { data?: unknown })?.data ?? value;
  return Array.isArray(payload) ? payload : [];
};

export default function Approvals() {
  const { success, error: showError } = useToast();
  const [tab, setTab] = useState<ApprovalTab>("vendors");
  const [vendors, setVendors] = useState<RecordRow[]>([]);
  const [riders, setRiders] = useState<RecordRow[]>([]);
  const [names, setNames] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ kind: "vendor" | "rider"; id: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [vendorResult, riderResult, nameResult] = await Promise.allSettled([
      getPendingVendors(),
      getPendingRiders(),
      getPendingNameChanges(),
    ]);
    setVendors(vendorResult.status === "fulfilled" ? responseRows(vendorResult.value) : []);
    setRiders(riderResult.status === "fulfilled" ? responseRows(riderResult.value) : []);
    setNames(nameResult.status === "fulfilled" ? responseRows(nameResult.value) : []);
    if ([vendorResult, riderResult, nameResult].some((r) => r.status === "rejected")) {
      showError("Some approval queues could not be loaded");
    }
    setLoading(false);
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: () => Promise<unknown>, message: string) => {
    setBusy(id);
    try {
      await action();
      success(message);
      await load();
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const rows = tab === "vendors" ? vendors : tab === "riders" ? riders : names;

  if (selected) return <ApprovalDetail kind={selected.kind} id={selected.id} onBack={() => setSelected(null)} onChanged={load} />;

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">Review queue</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Approvals</h1>
          <p className="mt-1 text-sm text-slate-500">Review partner applications and store-name changes.</p>
        </div>
        <button onClick={load} className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm" aria-label="Refresh approvals">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
        {([
          ["vendors", `Vendors ${vendors.length}`],
          ["riders", `Riders ${riders.length}`],
          ["names", `Names ${names.length}`],
        ] as [ApprovalTab, string][]).map(([value, label]) => (
          <button key={value} onClick={() => setTab(value)} className={`rounded-xl px-2 py-3 text-[11px] font-black uppercase tracking-wide transition ${tab === value ? "bg-white text-green-700 shadow-sm" : "text-slate-500"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-green-600" size={34} /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <CheckCircle2 className="mx-auto text-green-500" size={38} />
          <p className="mt-3 font-bold text-slate-700">Queue clear</p>
          <p className="mt-1 text-sm text-slate-400">No pending {tab}.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => {
            const isVendor = tab === "vendors";
            const isRider = tab === "riders";
            const title = isVendor
              ? row.business_name || row.full_name
              : isRider
                ? `${row.firstname || ""} ${row.lastname || ""}`.trim()
                : row.business_name;
            return (
              <article key={row.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-green-50 p-3 text-green-700">
                    {isRider ? <Truck size={22} /> : <Store size={22} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-black text-slate-900">{title || "Unnamed application"}</h2>
                    <p className="truncate text-sm text-slate-500">{row.email || row.business_email || "No email"}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <span>{row.phone || row.business_phone || "No phone"}</span>
                      <span className="text-right">{row.state || row.city || "Location missing"}</span>
                    </div>
                    {tab === "names" && (
                      <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm">
                        <span className="text-amber-700">Requested name</span>
                        <p className="font-black text-amber-900">{row.pending_business_name}</p>
                      </div>
                    )}
                    {isRider && (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-3 py-1">{row.vehicle_type || "Vehicle missing"}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">{row.plate_number || "Plate missing"}</span>
                        {row.license_image && <a className="rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-700" href={row.license_image} target="_blank" rel="noreferrer">View licence</a>}
                      </div>
                    )}
                  </div>
                </div>
                {tab !== "names" && <button onClick={() => setSelected({ kind: isRider ? "rider" : "vendor", id: row.id })} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700"><Eye size={16} /> View details</button>}
                <div className={`${tab === "names" ? "mt-5" : "mt-3"} grid grid-cols-2 gap-3`}>
                  <button
                    disabled={busy === row.id}
                    onClick={() => act(row.id, () => tab === "names" ? rejectVendorName(row.id) : isRider ? updateAdminRiderStatus(row.id, "rejected") : updateVendorStatus(row.id, "suspended"), `${title || "Application"} rejected`)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-xs font-black uppercase tracking-wide text-red-600 disabled:opacity-50"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                  <button
                    disabled={busy === row.id}
                    onClick={() => act(row.id, () => tab === "names" ? approveVendorName(row.id) : isRider ? updateAdminRiderStatus(row.id, "accepted") : updateVendorStatus(row.id, "approved"), `${title || "Application"} approved`)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-lg shadow-green-600/20 disabled:opacity-50"
                  >
                    {busy === row.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Approve
                  </button>
                </div>
                <p className="mt-3 flex items-center gap-1 text-[11px] text-slate-400"><Clock3 size={12} /> Submitted {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
