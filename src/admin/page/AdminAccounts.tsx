import { useCallback, useEffect, useState } from "react";
import { KeyRound, Loader2, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import {
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  getAdminCandidates,
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
  admin_role?: "admin" | "super_admin";
  admin_permissions?: string[];
};

type Candidate = Admin & { role?: string };
const permissions = [
  ["overview.view", "Overview"], ["approvals.manage", "Approvals"], ["orders.manage", "Orders"],
  ["customers.manage", "Customers"], ["vendors.manage", "Vendors"], ["riders.manage", "Riders"],
  ["finance.manage", "Finance"], ["analytics.view", "Analytics"], ["system.manage", "System & games"],
  ["admins.manage", "Admin accounts"],
] as const;
const empty = { user_id: "", email: "", password: "", firstname: "", lastname: "", phone: "", admin_role: "admin", permissions: [] as string[] };
type ApiError = { response?: { data?: { detail?: string } }; message?: string };
const errorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  return apiError.response?.data?.detail || apiError.message || "Action failed";
};

export default function AdminAccounts() {
  const { success, error: showError } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [editing, setEditing] = useState<Admin | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const currentId = JSON.parse(localStorage.getItem("userData") || "{}").id;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [response, candidateResponse] = await Promise.all([getAdminAccounts(), getAdminCandidates()]);
      setAdmins(response.data);
      setCandidates(candidateResponse.data);
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  const open = (admin?: Admin) => {
    setEditing(admin || "new");
    setForm(admin ? { user_id: "", email: admin.email, password: "", firstname: admin.firstname || "", lastname: admin.lastname || "", phone: admin.phone || "", admin_role: admin.admin_role || "admin", permissions: admin.admin_permissions || [] } : empty);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (editing === "new") {
        const payload = {
          ...(form.user_id ? { user_id: form.user_id } : {}),
          email: form.email.trim(),
          ...(!form.user_id ? { password: form.password } : {}),
          firstname: form.firstname.trim(),
          lastname: form.lastname.trim(),
          phone: form.phone.trim() || null,
          admin_role: form.admin_role,
          permissions: form.permissions,
        };
        await createAdminAccount(payload);
        success("Admin account created");
      } else if (editing) {
        const payload = { email: form.email, firstname: form.firstname, lastname: form.lastname, phone: form.phone || null, admin_role: form.admin_role, permissions: form.permissions };
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
      success("Admin access removed");
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
              <div className="flex gap-3"><div className="rounded-2xl bg-green-50 p-3 text-green-700"><ShieldCheck size={22} /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-black text-slate-900">{`${admin.firstname || ""} ${admin.lastname || ""}`.trim() || "Administrator"}</h2><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase">{admin.admin_role || "admin"}</span></div><p className="truncate text-sm text-slate-500">{admin.email}</p><p className="mt-2 text-xs text-slate-400">{admin.admin_role === "super_admin" ? "All permissions" : `${admin.admin_permissions?.length || 0} permissions`} · Added {new Date(admin.created_at).toLocaleDateString()}</p></div></div>
              <div className="mt-5 grid grid-cols-2 gap-2"><button disabled={busy} onClick={() => open(admin)} className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-black text-slate-700 disabled:opacity-40"><Pencil size={14} /> Edit</button><button disabled={admin.id === currentId || admin.admin_role === "super_admin" || busy} onClick={() => remove(admin)} className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-xs font-black text-red-600 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={14} /> Remove</button><button disabled={admin.id === currentId || busy} onClick={() => resetPassword(admin)} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-amber-50 py-2.5 text-xs font-black text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"><KeyRound size={14} /> Email temporary password</button></div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/55 sm:items-center sm:justify-center sm:p-6" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(event) => event.stopPropagation()} className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-6 sm:max-w-lg sm:rounded-[2rem]">
            <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-green-600">{editing === "new" ? "Create" : "Update"}</p><h2 className="text-xl font-black text-slate-900">Admin account</h2></div><button type="button" onClick={() => setEditing(null)} className="rounded-xl bg-slate-100 p-2"><X size={19} /></button></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {editing === "new" && <><select value={form.user_id} onChange={(e) => { const found = candidates.find((item) => item.id === e.target.value); setForm(found ? { ...form, user_id: found.id, email: found.email, firstname: found.firstname || "", lastname: found.lastname || "", phone: found.phone || "", password: "" } : { ...empty }); }} className="rounded-xl bg-green-50 px-4 py-3 font-bold outline-none sm:col-span-2"><option value="">Create new user or select existing user</option>{candidates.map((item) => <option key={item.id} value={item.id}>{`${item.firstname || ""} ${item.lastname || ""}`.trim()} — {item.email} ({item.role || "customer"})</option>)}</select><p className="text-xs text-slate-500 sm:col-span-2">Select an existing vendor to add admin access without removing vendor login.</p></>}
              <input required value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} placeholder="First name" className="rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
              <input required value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} placeholder="Last name" className="rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 sm:col-span-2" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className="rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 sm:col-span-2" />
              {editing === "new" && !form.user_id && <input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (8+ characters)" className="rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 sm:col-span-2" />}
              <select value={form.admin_role} onChange={(e) => setForm({ ...form, admin_role: e.target.value, permissions: e.target.value === "super_admin" ? permissions.map(([key]) => key) : form.permissions })} className="rounded-xl bg-slate-50 px-4 py-3 font-bold outline-none sm:col-span-2"><option value="admin">Admin</option><option value="super_admin">Super admin</option></select>
            </div>
            <div className="mt-4"><p className="text-xs font-black uppercase tracking-wide text-slate-500">Granular permissions</p><div className="mt-2 grid grid-cols-2 gap-2">{permissions.map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-bold"><input type="checkbox" checked={form.admin_role === "super_admin" || form.permissions.includes(key)} disabled={form.admin_role === "super_admin"} onChange={(e) => setForm({ ...form, permissions: e.target.checked ? [...form.permissions, key] : form.permissions.filter((item) => item !== key) })} className="accent-green-600" />{label}</label>)}</div></div>
            <button disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-sm font-black uppercase tracking-wide text-white disabled:opacity-50">{busy && <Loader2 className="animate-spin" size={17} />} Save admin</button>
          </form>
        </div>
      )}
    </section>
  );
}
