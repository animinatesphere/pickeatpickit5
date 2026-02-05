import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import logo from "../../assets/Logo SVG 1.png";
import { Link, useNavigate } from "react-router-dom";
import { authService, APIError } from "../../services/authService";
import { useToast, ToastContainer } from "../../component/Toast";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.loginUser(email, password);
      toast.success(response.message || "Login successful!");

      if (response.token) {
        localStorage.setItem("authToken", response.token);
      }

      if (response.user) {
        localStorage.setItem("userData", JSON.stringify(response.user));
      }

      setTimeout(() => {
        navigate("/user-dashboard");
      }, 1000);
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />

      <div className="min-h-screen relative overflow-hidden bg-black font-inter">
        {/* CINEMATIC BACKGROUND */}
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.5 }}
            src="https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2000&auto=format&fit=crop"
            alt="Food background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black"></div>
        </div>

        {/* FLOATING AMBIENT LIGHTS */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            {/* LOGO & BRAND */}
            <div className="flex flex-col items-center mb-10 text-center">
              <motion.img
                whileHover={{ rotate: 5, scale: 1.05 }}
                src={logo}
                alt="Logo"
                className="w-24 h-24 mb-6 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              />
              <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
                PickEAT <span className="text-green-500">PickIT</span>
              </h1>
              <p className="text-xs tracking-[0.3em] uppercase text-gray-500 font-bold">
                Identity Authentication
              </p>
            </div>

            {/* LOGIN CARD */}
            <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden group">
              {/* Subtle glass highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="mb-10">
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-400 text-sm font-medium">Enter your credentials to continue your journey</p>
                </div>

                <div className="space-y-6">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">
                      Account Email
                    </label>
                    <div className="relative group/input">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-green-500 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="identity@pickeat.com"
                        className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-bold text-sm"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                     <div className="flex justify-between items-center px-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                           Password
                        </label>
                        <Link to="/forgot-password?type=user" className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 hover:text-white transition-colors">
                           Forgot?
                        </Link>
                     </div>
                    <div className="relative group/input">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-green-500 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="••••••••"
                        className="w-full pl-14 pr-14 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-bold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-white text-black font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-green-500/20 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                       <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Authorize Access
                        <ShieldCheck className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>

                  <Link to="/" className="block">
                     <button className="w-full py-5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                        <ArrowLeft className="w-3 h-3" /> Change Identity
                     </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* REGISTER LINK */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="text-center mt-10"
            >
              <p className="text-gray-500 font-bold uppercase italic tracking-tighter">
                New to the platform?{" "}
                <Link to="/signup">
                  <span className="text-green-500 hover:text-white transition-colors cursor-pointer border-b border-green-500/30">
                    Register Identity
                  </span>
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* SCANNER LINE EFFECT */}
        <motion.div 
           animate={{ top: ["0%", "100%", "0%"] }}
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           className="absolute left-0 right-0 h-[1px] bg-green-500/20 z-0 pointer-events-none"
        />
      </div>
    </>
  );
};

export default Login;
