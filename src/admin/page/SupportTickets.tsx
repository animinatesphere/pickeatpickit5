/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ExternalLink, Image, Loader2, MessageSquare, Search, Send, UserRound, X } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

type Row = Record<string, any>;
const categories = ["missing_item", "wrong_item", "late_delivery", "rider_issue", "vendor_issue", "payment_issue", "refund", "account_issue", "promo_issue", "food_quality", "safety_complaint"];
const statuses = ["open", "in_progress", "waiting", "resolved", "closed"];
const priorities = ["low", "normal", "high", "urgent"];
const input = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";
const money = (value: unknown) => `₦${Number(value || 0).toLocaleString()}`;

export default function SupportTickets() {
  const toast = useToast();
  const [tickets, setTickets] = useState<Row[]>([]);
  const [agents, setAgents] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [filters, setFilters] = useState({ search: "", status: "", category: "", priority: "", assigned_admin_id: "" });
  const [draftSearch, setDraftSearch] = useState("");
  const [reply, setReply] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [refund, setRefund] = useState("");
  const [compensation, setCompensation] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async (keepId?: string) => {
    setBusy("load");
    try {
      const { data } = await api.get("/support/tickets", { params: Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) });
      const rows = Array.isArray(data) ? data : [];
      setTickets(rows);
      if (keepId) setSelected(rows.find((row: Row) => row.id === keepId) || null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Could not load tickets");
    } finally {
      setBusy("");
    }
  }, [filters, toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get("/support/agents").then(({ data }) => setAgents(data || [])).catch(() => setAgents([]));
  }, []);
  useEffect(() => {
    setInternalNotes(selected?.internal_notes || "");
    setResolution(selected?.resolution || "");
    setRefund(selected?.refund_amount ? String(selected.refund_amount) : "");
    setCompensation(selected?.compensation_amount ? String(selected.compensation_amount) : "");
  }, [selected]);

  const update = async (payload: Row, label = "Ticket updated") => {
    if (!selected) return;
    setBusy("update");
    try {
      const { data } = await api.patch(`/support/tickets/${selected.id}`, payload);
      setSelected(data);
      toast.success(label);
      await load(selected.id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Update failed");
    } finally {
      setBusy("");
    }
  };

  const send = async () => {
    if (!selected || !reply.trim()) return;
    setBusy("reply");
    try {
      await api.post(`/support/tickets/${selected.id}/messages`, { message: reply.trim(), attachments: [] });
      setReply("");
      toast.success("Reply sent");
      await load(selected.id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Reply failed");
    } finally {
      setBusy("");
    }
  };

  const applyMoney = (kind: "refund_amount" | "compensation_amount", raw: string) => {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return toast.error("Enter a valid non-negative amount");
    update({ [kind]: value }, kind === "refund_amount" ? "Refund submitted" : "Compensation applied");
  };

  const search = (event: FormEvent) => { event.preventDefault(); setFilters(current => ({ ...current, search: draftSearch.trim() })); };

  return <section className="space-y-5">
    <div><p className="text-xs font-black uppercase tracking-widest text-green-600">Operations support</p><h1 className="text-2xl font-black">Support tickets</h1><p className="text-sm text-slate-500">Resolve customer, vendor, rider, payment, refund, and safety issues in one place.</p></div>
    <form onSubmit={search} className="grid gap-2 rounded-2xl bg-white p-3 shadow-sm sm:grid-cols-2 xl:grid-cols-6">
      <div className="relative sm:col-span-2"><Search className="absolute left-3 top-3.5 text-slate-400" size={17}/><input value={draftSearch} onChange={event => setDraftSearch(event.target.value)} placeholder="Ticket number, subject, details" className={`${input} pl-10`}/></div>
      <select value={filters.status} onChange={event => setFilters(current => ({ ...current, status: event.target.value }))} className={input}><option value="">All statuses</option>{statuses.map(value => <option key={value}>{value}</option>)}</select>
      <select value={filters.category} onChange={event => setFilters(current => ({ ...current, category: event.target.value }))} className={input}><option value="">All categories</option>{categories.map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
      <select value={filters.priority} onChange={event => setFilters(current => ({ ...current, priority: event.target.value }))} className={input}><option value="">All priorities</option>{priorities.map(value => <option key={value}>{value}</option>)}</select>
      <button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white">Search</button>
    </form>
    {busy === "load" && !tickets.length ? <Loader2 className="animate-spin text-green-600"/> : tickets.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{tickets.map(ticket => <button key={ticket.id} onClick={() => setSelected(ticket)} className="rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-200">
      <div className="flex justify-between gap-2"><p className="font-black text-green-700">{ticket.ticket_number}</p><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${ticket.priority === "urgent" ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-700"}`}>{ticket.priority}</span></div>
      <p className="mt-2 font-bold">{ticket.subject}</p><p className="mt-1 line-clamp-2 text-sm text-slate-500">{ticket.description}</p>
      <div className="mt-3 flex items-center justify-between text-[11px] font-bold"><span className="uppercase text-green-700">{ticket.category.replaceAll("_", " ")} · {ticket.status}</span><span className="text-slate-400">{ticket.requester?.name || ticket.requester_role}</span></div>
    </button>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No tickets match these filters.</div>}

    {selected && <div className="fixed inset-0 z-[90] flex items-end bg-slate-950/60 sm:items-center sm:justify-center sm:p-6" onClick={() => setSelected(null)}><div className="max-h-[96vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-4xl sm:rounded-3xl" onClick={event => event.stopPropagation()}>
      <div className="flex justify-between gap-4"><div><p className="text-xs font-black text-green-600">{selected.ticket_number}</p><h2 className="text-xl font-black">{selected.subject}</h2><p className="mt-1 text-xs text-slate-400">Opened {new Date(selected.created_at).toLocaleString()}</p></div><button onClick={() => setSelected(null)} className="h-fit rounded-xl bg-slate-100 p-2"><X/></button></div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_280px]"><div className="space-y-4">
        <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6">{selected.description}</p>
        {selected.attachments?.length > 0 && <div><p className="mb-2 text-xs font-black uppercase text-slate-400">Evidence</p><div className="flex flex-wrap gap-2">{selected.attachments.map((url: string) => <a key={url} href={url} target="_blank" rel="noreferrer" className="group relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100"><img src={url} alt="Ticket attachment" className="h-full w-full object-cover"/><ExternalLink className="absolute right-1 top-1 rounded bg-white/80 p-1 opacity-0 group-hover:opacity-100" size={20}/></a>)}</div></div>}
        <div className="space-y-2">{selected.messages?.map((message: Row) => <div key={message.id} className={`rounded-2xl p-3 text-sm ${message.sender_role === "admin" ? "ml-8 bg-green-50" : "mr-8 bg-slate-100"}`}><p>{message.message}</p>{message.attachments?.length > 0 && <p className="mt-2 flex items-center gap-1 text-xs text-green-700"><Image size={13}/>{message.attachments.length} attachment(s)</p>}<p className="mt-1 text-[10px] font-bold uppercase text-slate-400">{message.sender_role} · {new Date(message.created_at).toLocaleString()}</p></div>)}</div>
        <div className="flex gap-2"><textarea value={reply} onChange={event => setReply(event.target.value)} placeholder="Reply to requester" className={input}/><button disabled={busy === "reply" || !reply.trim()} onClick={send} className="rounded-xl bg-green-600 px-4 text-white disabled:opacity-50">{busy === "reply" ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}</button></div>
      </div><aside className="space-y-3 rounded-2xl border border-slate-100 p-3">
        <div className="rounded-xl bg-slate-50 p-3 text-xs"><p className="flex items-center gap-2 font-black"><UserRound size={15}/>{selected.requester?.name || "Requester"}</p><p className="mt-1 text-slate-500">{selected.requester?.email}</p><p className="text-slate-500">{selected.requester?.phone}</p>{selected.order_id && <p className="mt-2 break-all font-bold text-green-700">Order {selected.order_id}</p>}{selected.vendor_name && <p className="mt-1">Vendor: {selected.vendor_name}</p>}{selected.rider_name && <p>Rider: {selected.rider_name}</p>}</div>
        <label className="block text-[10px] font-black uppercase text-slate-400">Assigned agent<select value={selected.assigned_admin_id || ""} disabled={Boolean(busy)} onChange={event => update({ assigned_admin_id: event.target.value || null }, "Agent assigned")} className={`${input} mt-1 normal-case`}><option value="">Unassigned</option>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-2"><select value={selected.priority} disabled={Boolean(busy)} onChange={event => update({ priority: event.target.value })} className={input}>{priorities.map(value => <option key={value}>{value}</option>)}</select><select value={selected.status} disabled={Boolean(busy)} onChange={event => update({ status: event.target.value })} className={input}>{statuses.map(value => <option key={value}>{value}</option>)}</select></div>
        <label className="block text-[10px] font-black uppercase text-slate-400">Compensation total<div className="mt-1 flex gap-1"><input type="number" min="0" step="0.01" value={compensation} onChange={event => setCompensation(event.target.value)} className={input}/><button disabled={Boolean(busy)} onClick={() => applyMoney("compensation_amount", compensation)} className="rounded-xl bg-green-100 px-3 text-xs font-black text-green-800">Apply</button></div><span className="mt-1 block normal-case text-slate-400">Current: {money(selected.compensation_amount)}</span></label>
        <label className="block text-[10px] font-black uppercase text-slate-400">Refund total<div className="mt-1 flex gap-1"><input type="number" min="0" step="0.01" value={refund} onChange={event => setRefund(event.target.value)} className={input}/><button disabled={Boolean(busy)} onClick={() => applyMoney("refund_amount", refund)} className="rounded-xl bg-red-100 px-3 text-xs font-black text-red-800">Refund</button></div><span className="mt-1 block normal-case text-slate-400">Current: {money(selected.refund_amount)}</span></label>
        <label className="block text-[10px] font-black uppercase text-slate-400">Internal notes<textarea value={internalNotes} onChange={event => setInternalNotes(event.target.value)} className={`${input} mt-1 min-h-20 normal-case`}/><button disabled={Boolean(busy)} onClick={() => update({ internal_notes: internalNotes }, "Internal notes saved")} className="mt-1 w-full rounded-xl bg-slate-100 py-2 text-xs font-black normal-case">Save private note</button></label>
        <label className="block text-[10px] font-black uppercase text-slate-400">Resolution<textarea value={resolution} onChange={event => setResolution(event.target.value)} className={`${input} mt-1 min-h-20 normal-case`}/><button disabled={Boolean(busy) || !resolution.trim()} onClick={() => update({ resolution: resolution.trim(), status: "resolved" }, "Ticket resolved")} className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-black normal-case text-white disabled:opacity-50"><MessageSquare size={15}/>Resolve ticket</button></label>
      </aside></div>
    </div></div>}
  </section>;
}
