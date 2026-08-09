import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, Mail, Phone, Save, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  changeMyAdminPassword,
  getMyAdminAccount,
  updateMyAdminAccount,
  getMyAdminTwoFactor,
  setupMyAdminTwoFactor,
  confirmMyAdminTwoFactor,
  disableMyAdminTwoFactor,
} from "../../services/api";
import { useToast } from "../../context/ToastContext";

export type AdminProfile = {
  id: string;
  email: string;
  firstname?: string | null;
  lastname?: string | null;
  phone?: string | null;
  role?: string | null;
  admin_role?: "admin" | "super_admin" | null;
  admin_permissions?: string[];
  permissions?: string[];
  admin_2fa_enabled?: boolean;
  admin_2fa_method?: string | null;
  is_verified?: boolean;
  created_at?: string;
};

type Props = { onUserUpdated: (user: AdminProfile) => void };
type ApiError = { response?: { data?: { detail?: string } }; message?: string };

const errorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  return apiError.response?.data?.detail || apiError.message || "Action failed";
};

const emptyProfile = { firstname: "", lastname: "", email: "", phone: "" };
const emptyPasswords = { old_password: "", new_password: "", confirm_password: "" };

export default function AccountSettings({ onUserUpdated }: Props) {
  const { success, error: showError } = useToast();
  const [account, setAccount] = useState<AdminProfile | null>(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactor, setTwoFactor] = useState<{ enabled: boolean; method: string | null }>({ enabled: false, method: null });
  const [setup, setSetup] = useState<{ method: "totp" | "email"; secret?: string; otpauth_uri?: string; challenge_id?: string } | null>(null);
  const [factorCode, setFactorCode] = useState("");
  const [factorPassword, setFactorPassword] = useState("");
  const [factorBusy, setFactorBusy] = useState(false);
  const [factorAction, setFactorAction] = useState<"totp" | "email" | "confirm" | "disable" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [response, factorResponse] = await Promise.all([getMyAdminAccount(), getMyAdminTwoFactor()]);
      const data = response.data as AdminProfile;
      setAccount(data);
      setTwoFactor(factorResponse.data);
      setProfile({
        firstname: data.firstname || "",
        lastname: data.lastname || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const response = await updateMyAdminAccount({
        firstname: profile.firstname.trim(),
        lastname: profile.lastname.trim(),
        email: profile.email.trim().toLowerCase(),
        phone: profile.phone.trim() || null,
      });
      const data = response.data as AdminProfile;
      const stored = JSON.parse(localStorage.getItem("userData") || "{}");
      localStorage.setItem("userData", JSON.stringify({ ...stored, ...data }));
      setAccount(data);
      onUserUpdated(data);
      success("Account information updated");
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const beginTwoFactor = async (method: "totp" | "email") => {
    setFactorBusy(true);
    setFactorAction(method);
    try { const response = await setupMyAdminTwoFactor(method); setSetup(response.data); setFactorCode(""); success(method === "email" ? "Confirmation code sent" : "Authenticator setup created"); }
    catch (error) { showError(errorMessage(error)); } finally { setFactorBusy(false); setFactorAction(null); }
  };

  const confirmTwoFactor = async () => {
    if (!setup) return;
    setFactorBusy(true);
    setFactorAction("confirm");
    try { const response = await confirmMyAdminTwoFactor({ method: setup.method, code: factorCode, challenge_id: setup.challenge_id }); setTwoFactor(response.data); setSetup(null); setFactorCode(""); success("Two-factor authentication enabled"); }
    catch (error) { showError(errorMessage(error)); } finally { setFactorBusy(false); setFactorAction(null); }
  };

  const disableTwoFactor = async () => {
    setFactorBusy(true);
    setFactorAction("disable");
    try { const response = await disableMyAdminTwoFactor(factorPassword); setTwoFactor(response.data); setFactorPassword(""); success("Two-factor authentication disabled"); }
    catch (error) { showError(errorMessage(error)); } finally { setFactorBusy(false); setFactorAction(null); }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      showError("New passwords do not match");
      return;
    }
    if (passwords.new_password.length < 8) {
      showError("New password must contain at least 8 characters");
      return;
    }

    setSavingPassword(true);
    try {
      const response = await changeMyAdminPassword({
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      });
      setPasswords(emptyPasswords);
      success(response.data?.message || "Password changed successfully");
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-[55vh] place-items-center"><Loader2 className="animate-spin text-green-600" size={36} /></div>;
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">Your account</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Review your admin identity, update contact details, and secure your password.</p>
      </div>

      <article className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl sm:p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-green-500 text-lg font-black text-slate-950">
            {`${account?.firstname?.[0] || "A"}${account?.lastname?.[0] || "D"}`}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-black">{`${account?.firstname || ""} ${account?.lastname || ""}`.trim() || "Administrator"}</h2>
              <span className="rounded-full bg-green-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-green-300"><ShieldCheck className="mr-1 inline" size={12} /> Admin</span>
            </div>
            <p className="mt-1 truncate text-sm text-slate-400">{account?.email}</p>
            <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
              <p>Account ID: <span className="font-bold text-slate-200">{account?.id}</span></p>
              <p>Created: <span className="font-bold text-slate-200">{account?.created_at ? new Date(account.created_at).toLocaleDateString() : "Unavailable"}</span></p>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-5 xl:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3"><div className="rounded-2xl bg-green-50 p-3 text-green-700"><UserRound size={20} /></div><div><h2 className="font-black text-slate-900">Personal information</h2><p className="text-xs text-slate-500">Shown across admin dashboard.</p></div></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">First name<input required value={profile.firstname} onChange={(event) => setProfile({ ...profile, firstname: event.target.value })} className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:ring-2 focus:ring-green-500" /></label>
            <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Last name<input required value={profile.lastname} onChange={(event) => setProfile({ ...profile, lastname: event.target.value })} className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:ring-2 focus:ring-green-500" /></label>
            <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500 sm:col-span-2"><span className="flex items-center gap-1"><Mail size={13} /> Email</span><input required type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:ring-2 focus:ring-green-500" /></label>
            <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500 sm:col-span-2"><span className="flex items-center gap-1"><Phone size={13} /> Phone</span><input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="Optional" className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:ring-2 focus:ring-green-500" /></label>
          </div>
          <button disabled={savingProfile} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-xs font-black uppercase tracking-wide text-white disabled:opacity-50">{savingProfile ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Save information</button>
        </form>

        <form onSubmit={savePassword} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-2xl bg-amber-50 p-3 text-amber-700"><KeyRound size={20} /></div><div><h2 className="font-black text-slate-900">Change password</h2><p className="text-xs text-slate-500">Current password must be verified.</p></div></div><button type="button" onClick={() => setShowPasswords(!showPasswords)} className="rounded-xl bg-slate-100 p-2 text-slate-500" aria-label={showPasswords ? "Hide passwords" : "Show passwords"}>{showPasswords ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          <div className="mt-6 space-y-4">
            <label className="block space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Current password<input required type={showPasswords ? "text" : "password"} autoComplete="current-password" value={passwords.old_password} onChange={(event) => setPasswords({ ...passwords, old_password: event.target.value })} className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:ring-2 focus:ring-green-500" /></label>
            <label className="block space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">New password<input required minLength={8} type={showPasswords ? "text" : "password"} autoComplete="new-password" value={passwords.new_password} onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })} className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:ring-2 focus:ring-green-500" /></label>
            <label className="block space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Confirm new password<input required minLength={8} type={showPasswords ? "text" : "password"} autoComplete="new-password" value={passwords.confirm_password} onChange={(event) => setPasswords({ ...passwords, confirm_password: event.target.value })} className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:ring-2 focus:ring-green-500" /></label>
          </div>
          <button disabled={savingPassword} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-xs font-black uppercase tracking-wide text-white disabled:opacity-50">{savingPassword ? <Loader2 className="animate-spin" size={17} /> : <KeyRound size={17} />} Update password</button>
        </form>
      </div>
      <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-50 p-3 text-blue-700"><Smartphone size={20} /></div><div><h2 className="font-black text-slate-900">Two-factor authentication</h2><p className="text-xs text-slate-500">Status: <span className="font-black">{twoFactor.enabled ? `Enabled via ${twoFactor.method === "totp" ? "authenticator app" : "email OTP"}` : "Disabled"}</span></p></div></div>{!twoFactor.enabled && !setup && <div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" disabled={factorBusy} onClick={() => beginTwoFactor("totp")} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-xs font-black uppercase text-white disabled:cursor-wait disabled:opacity-60">{factorAction === "totp" && <Loader2 className="animate-spin" size={16} />} Use authenticator app</button><button type="button" disabled={factorBusy} onClick={() => beginTwoFactor("email")} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-black uppercase text-white disabled:cursor-wait disabled:opacity-60">{factorAction === "email" && <Loader2 className="animate-spin" size={16} />} Use email OTP</button></div>}{setup && <div className="mt-5 rounded-2xl bg-slate-50 p-4">{setup.method === "totp" && <><p className="text-sm font-bold text-slate-700">Scan QR code with Google Authenticator, Microsoft Authenticator, Authy, or compatible app.</p>{setup.otpauth_uri && <div className="mt-4 flex justify-center"><div className="rounded-2xl bg-white p-4 shadow-sm"><QRCodeSVG value={setup.otpauth_uri} size={200} level="M" marginSize={1} title="Scan to set up two-factor authentication" /></div></div>}<p className="mt-4 text-xs font-bold text-slate-500">Cannot scan? Enter setup key manually:</p><p className="mt-2 break-all rounded-xl bg-white p-3 font-mono text-sm font-black text-slate-900">{setup.secret}</p><details className="mt-2 text-xs text-slate-500"><summary className="cursor-pointer font-bold">Show setup URI</summary><p className="mt-2 break-all">{setup.otpauth_uri}</p></details></>}{setup.method === "email" && <p className="text-sm font-bold text-slate-700">Enter code sent to your admin email.</p>}<div className="mt-4 flex gap-2"><input inputMode="numeric" maxLength={6} value={factorCode} onChange={(e) => setFactorCode(e.target.value.replace(/\D/g, ""))} placeholder="6-digit code" className="min-w-0 flex-1 rounded-xl bg-white px-4 py-3 text-center font-black tracking-widest outline-none focus:ring-2 focus:ring-blue-500" /><button type="button" disabled={factorBusy || factorCode.length !== 6} onClick={confirmTwoFactor} className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 text-xs font-black text-white disabled:cursor-wait disabled:opacity-50">{factorAction === "confirm" && <Loader2 className="animate-spin" size={16} />} Confirm</button></div></div>}{twoFactor.enabled && <div className="mt-5 flex gap-2"><input type="password" value={factorPassword} onChange={(e) => setFactorPassword(e.target.value)} placeholder="Current password" className="min-w-0 flex-1 rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" /><button type="button" disabled={factorBusy || !factorPassword} onClick={disableTwoFactor} className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 text-xs font-black text-red-600 disabled:cursor-wait disabled:opacity-50">{factorAction === "disable" && <Loader2 className="animate-spin" size={16} />} Disable 2FA</button></div>}</article>
    </section>
  );
}
