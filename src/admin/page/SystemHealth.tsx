import { useCallback, useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";
import api from "../../services/api";

type CheckStatus = "healthy" | "unhealthy" | "not_configured";
type HealthCheck = { name: string; label: string; status: CheckStatus; message: string; latency_ms: number | null };
type HealthPayload = {
  status: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheck[];
  summary: { healthy: number; unhealthy: number; not_configured: number; total: number };
  checked_at: string;
};

const statusStyle = {
  healthy: { icon: CheckCircle2, label: "Operational", card: "border-green-200 bg-green-50", iconClass: "text-green-600", badge: "bg-green-100 text-green-800" },
  unhealthy: { icon: XCircle, label: "Down", card: "border-red-200 bg-red-50", iconClass: "text-red-600", badge: "bg-red-100 text-red-800" },
  not_configured: { icon: AlertTriangle, label: "Needs setup", card: "border-amber-200 bg-amber-50", iconClass: "text-amber-600", badge: "bg-amber-100 text-amber-800" },
};

export default function SystemHealth() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<HealthPayload>("/admin/system-health");
      setHealth(response.data);
    } catch {
      setError("System health checks could not be loaded. Verify API availability and your admin permission.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60000);
    return () => window.clearInterval(timer);
  }, [load]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">Infrastructure monitoring</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">System health</h1><p className="mt-1 text-sm text-slate-500">Core API, database, email, payment, storage, maps, and realtime readiness.</p></div>
        <button onClick={() => void load()} disabled={loading} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-wide text-white disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Run checks</button>
      </div>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">{error}<button onClick={() => void load()} className="ml-2 underline">Retry</button></div>}
      {!health && loading && <div className="grid min-h-64 place-items-center rounded-3xl bg-white"><RefreshCw className="animate-spin text-green-600" size={32} /></div>}

      {health && <>
        <article className={`rounded-3xl p-5 text-white ${health.status === "healthy" ? "bg-green-700" : health.status === "degraded" ? "bg-amber-600" : "bg-red-700"}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Activity size={30} /><div><p className="text-xs font-black uppercase tracking-wider opacity-80">Overall status</p><p className="text-2xl font-black capitalize">{health.status}</p></div></div><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-xl bg-white/15 px-3 py-2">{health.summary.healthy} operational</span><span className="rounded-xl bg-white/15 px-3 py-2">{health.summary.unhealthy} down</span><span className="rounded-xl bg-white/15 px-3 py-2">{health.summary.not_configured} need setup</span></div></div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {health.checks.map((check) => { const style = statusStyle[check.status]; const Icon = style.icon; return <article key={check.name} className={`rounded-3xl border p-5 ${style.card}`}><div className="flex items-start justify-between gap-3"><Icon className={style.iconClass} size={24} /><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${style.badge}`}>{style.label}</span></div><h2 className="mt-5 font-black text-slate-900">{check.label}</h2><p className="mt-1 min-h-10 text-sm text-slate-600">{check.message}</p>{check.latency_ms != null && <p className="mt-3 flex items-center gap-1 text-xs font-bold text-slate-500"><Clock3 size={13} />{check.latency_ms} ms</p>}</article>; })}
        </div>

        <p className="text-xs text-slate-500">Last checked {new Date(health.checked_at).toLocaleString()} · Auto-refreshes every 60 seconds. </p>
      </>}
    </section>
  );
}
