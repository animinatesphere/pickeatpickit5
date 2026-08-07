import { useCallback, useEffect, useState } from "react";
import { KeyRound, Loader2, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import {
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  resetAdminAccountPassword,
  updateAdminAccount,
} from "../../services/api";
import { useToast } from "../../context/ToastContext";

type Admin = {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  created_at: string;
};

const empty = { email: "", password: "", firstname: "", lastname: "", phone: "" };
type ApiError = { response?: { data?: { detail?: string } }; message?: string };
const errorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  return apiError.response?.data?.detail || apiError.message || "Action failed";
};

export default function AdminAccounts() {
  const { success, error: showError } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [editing, setEditing] = useState<Admin | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const currentId = JSON.parse(localStorage.getItem("userData") || "{}").id;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminAccounts();
      setAdmins(response.data);
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  const open = (admin?: Admin) => {
    setEditing(admin || "new");
    setForm(admin ? { email: admin.email, password: "", firstname: admin.firstname || "", lastname: admin.lastname || "", phone: admin.phone || "" } : empty);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (editing === "new") {
        await createAdminAccount(form);
        success("Admin account created");
      } else if (editing) {
        const payload = { email: form.email, firstname: form.firstname, lastname: form.lastname, phone: form.phone || null };
        await updateAdminAccount(editing.id, payload);
        success("Admin account updated");
      }
      setEditing(null);
      await load();
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (admin: Admin) => {
    if (!window.confirm(`Delete admin ${admin.email}?`)) return;
    setBusy(true);
    try {
      await deleteAdminAccount(admin.id);
      success("Admin account deleted");
      await load();
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (admin: Admin) => {
    if (!window.confirm(`Reset ${admin.email}'s password and email them a temporary password?`)) return;
    setBusy(true);
    try {
      const response = await resetAdminAccountPassword(admin.id);
      success(response.data?.message || "Temporary password sent to admin email");
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">Access control</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Admin accounts</h1><p className="mt-1 text-sm text-slate-500">Manage people allowed into this dashboard.</p></div>
        <button onClick={() => open()} className="flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-lg shadow-green-600/20"><Plus size={17} /> <span className="hidden sm:inline">New admin</span></button>
      </div>

      {loading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-green-600" size={34} /></div> : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {admins.map((admin) => (
            <article key={admin.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex gap-3"><div className="rounded-2xl bg-green-50 p-3 text-green-700"><ShieldCheck size={22} /></div><div className="min-w-0 flex-1"><h2 className="truncate font-black text-slate-900">{`${admin.firstname || ""} ${admin.lastname || ""}`.trim() || "Administrator"}</h2><p className="truncate text-sm text-slate-500">{admin.email}</p><p className="mt-2 text-xs text-slate-400">Added {new Date(admin.created_at).toLocaleDateString()}</p></div></div>
              <div className="mt-5 grid grid-cols-2 gap-2"><button disabled={busy} onClick={() => open(admin)} className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-black text-slate-700 disabled:opacity-40"><Pencil size={14} /> Edit</button><button disabled={admin.id === currentId || busy} onClick={() => remove(admin)} className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-xs font-black text-red-600 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={14} /> Delete</button><button disabled={admin.id === currentId || busy} onClick={() => resetPassword(admin)} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-amber-50 py-2.5 text-xs font-black text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"><KeyRound size={14} /> Email temporary password</button></div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/55 sm:items-center sm:justify-center sm:p-6" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(event) => event.stopPropagation()} className="w-full rounded-t-[2rem] bg-white p-6 sm:max-w-lg sm:rounded-[2rem]">
            <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-green-600">{editing === "new" ? "Create" : "Update"}</p><h2 className="text-xl font-black text-slate-900">Admin account</h2></div><button type="button" onClick={() => setEditing(null)} className="rounded-xl bg-slate-100 p-2"><X size={19} /></button></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <input required value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} placeholder="First name" className="rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
              <input required value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} placeholder="Last name" className="rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 sm:col-span-2" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className="rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 sm:col-span-2" />
              {editing === "new" && <input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (8+ characters)" className="rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 sm:col-span-2" />}
            </div>
            <button disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-sm font-black uppercase tracking-wide text-white disabled:opacity-50">{busy && <Loader2 className="animate-spin" size={17} />} Save admin</button>
          </form>
        </div>
      )}
    </section>
  );
}
