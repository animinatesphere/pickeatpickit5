import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import logo from "../../assets/Logo SVG 1.png";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { decodeJwtToken } from "../../services/backendAuthService";

export default function AdminLogin() {
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [twoFactorMethod, setTwoFactorMethod] = useState<"totp" | "email">("email");
  const [code, setCode] = useState("");

  const finishLogin = (data: { access_token: string; refresh_token?: string; user?: Record<string, unknown> }) => {
    const token = data.access_token;
    const payload = decodeJwtToken(token);
    if (!payload || (payload.role !== "admin" && !payload.admin_role)) throw new Error("This account does not have admin access.");
    localStorage.setItem("authToken", token);
    if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
    localStorage.setItem("userData", JSON.stringify({ ...data.user, permissions: payload.permissions || [], admin_role: payload.admin_role }));
    toast.success("Welcome back, Admin!", "Login Successful");
    navigate("/admin-dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId && (!email || !password)) {
      toast.error("Please enter email and password", "Login Failed");
      return;
    }

    setIsLoading(true);
    try {
      const response = challengeId
        ? await api.post("/auth/admin-2fa/verify", { challenge_id: challengeId, code })
        : await api.post("/auth/admin/login", { email, password });

      if (response.data?.requires_2fa) {
        setChallengeId(response.data.challenge_id);
        setTwoFactorMethod(response.data.method);
        toast.success(response.data.method === "email" ? `Code sent to ${response.data.masked_email}` : "Enter code from your authenticator app");
        return;
      }

      if (response.data?.access_token) {
        finishLogin(response.data);
      } else {
        toast.error("Invalid response from server", "Login Failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Invalid credentials";
      toast.error(msg, "Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left — hero image */}
        <div className="hidden lg:block relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-2xl" />
          <div className="relative overflow-hidden rounded-3xl shadow-2xl group-hover:scale-[1.02] transition-transform duration-500 border border-white/20">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
              alt="Food delivery"
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <img src={logo} alt="Logo" className="w-16 h-16" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase">
                  PickEATPickIT
                </h2>
              </div>
              <p className="text-xl text-white/80 font-medium">
                Manage your food delivery empire with ease
              </p>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="relative">
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-6 sm:p-8 md:p-12 border border-white/20 hover:scale-[1.01] transition-all duration-500">
            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <img src={logo} alt="Logo" className="w-14 h-14" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                PickEATPickIT
              </h2>
            </div>

            <div className="mb-10">
              <h1 className="text-4xl font-black text-gray-800 mb-2 tracking-tighter uppercase">
                Welcome Back
              </h1>
              <p className="text-gray-500 font-medium">
                Sign in to your admin account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {challengeId && <div className="rounded-2xl bg-orange-50 p-4 text-sm text-orange-800"><ShieldCheck className="mr-2 inline" size={18} />{twoFactorMethod === "totp" ? "Enter 6-digit code from your authenticator app." : "Enter 6-digit code sent to your email."}</div>}
              {/* Email */}
              {!challengeId && <div className="group">
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-4 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-800"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>}

              {/* Password */}
              {!challengeId && <div className="group">
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-800"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-orange-500 transition-colors" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-orange-500 transition-colors" />
                    )}
                  </button>
                </div>
              </div>}
              {challengeId && <div className="group"><label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-widest ml-1">Verification code</label><input autoFocus inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 py-5 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-orange-500" required /><button type="button" onClick={() => { setChallengeId(""); setCode(""); }} className="mt-3 text-xs font-bold text-orange-600">Use another account</button></div>}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black py-5 px-6 rounded-2xl hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{challengeId ? "Verifying..." : "Signing in..."}</span>
                  </div>
                ) : (
                  challengeId ? "Verify and login" : "Login Now"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
