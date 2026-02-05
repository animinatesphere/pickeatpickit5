import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ChefHat, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import logo from "../../assets/Logo SVG 1.png";
import { Link, useNavigate } from "react-router-dom";
import { useToast, ToastContainer } from "../../component/Toast";
import { authService, APIError } from "../../services/authService";
import { motion } from "framer-motion";

const VendorLogin = () => {
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
      const response = await authService.login(email, password);
      toast.success(response.message || "Login successful!");
      if (response.token) localStorage.setItem("authToken", response.token);
      if (response.user) localStorage.setItem("userData", JSON.stringify(response.user));
      setTimeout(() => navigate("/vendor-dashboard"), 1000);
    } catch (error) {
      if (error instanceof APIError) toast.error(error.message);
      else toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
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
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2000&auto=format&fit=crop"
            alt="Kitchen background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
        </div>

        {/* AMBIENT LIGHTS (BLUE FOR VENDORS) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-16 items-center">
            
            {/* LEFT SIDE: PHILOSOPHY */}
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="hidden lg:block lg:w-1/2"
            >
               <div className="inline-block px-4 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                  Enterprise Portal
               </div>
               <h2 className="text-6xl xl:text-8xl font-black uppercase italic leading-[0.9] text-white mb-8 tracking-tighter">
                  SCALE YOUR <br />
                  <span className="text-blue-500">KITCHEN</span>
               </h2>
               <p className="text-gray-400 text-lg font-medium max-w-md leading-relaxed mb-12">
                  Access the ultimate operations hub for modern culinary empires. Precision management for peak performance.
               </p>
               
               <div className="grid grid-cols-2 gap-8">
                  {[
                    { label: "Active Nodes", value: "5.2k" },
                    { label: "Uptime Rate", value: "99.9%" }
                  ].map((stat, i) => (
                    <div key={i}>
                       <div className="text-3xl font-black text-white italic">{stat.value}</div>
                       <div className="text-[10px] uppercase tracking-widest text-blue-500 font-bold">{stat.label}</div>
                    </div>
                  ))}
               </div>
            </motion.div>

            {/* RIGHT SIDE: AUTH CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full lg:w-1/2 max-w-lg"
            >
              <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                     <div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">
                           Vendor Login
                        </h2>
                        <p className="text-gray-400 text-sm font-medium">Enter your details to access your account</p>
                     </div>
                     <motion.div 
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30"
                     >
                        <ChefHat className="w-8 h-8 text-blue-400" />
                     </motion.div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Email Address</label>
                      <div className="relative group/input">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-blue-500 transition-colors" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="ops@restaurant.com"
                          className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between items-center px-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Password</label>
                          <Link to="/forgot-password?type=vendor" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-white transition-colors">Forgot?</Link>
                       </div>
                      <div className="relative group/input">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-blue-500 transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="••••••••"
                          className="w-full pl-14 pr-14 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="w-full bg-white text-black font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                         <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Login Now
                          <ShieldCheck className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>

                    <Link to="/" className="block">
                       <button className="w-full py-5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                          <ArrowLeft className="w-3 h-3" /> Back to Home
                       </button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center">
                 <p className="text-gray-500 font-bold uppercase italic tracking-tighter">
                    <Link to="/welcome1">
                      <span className="text-blue-500 hover:text-white transition-colors cursor-pointer border-b border-blue-500/30">Sign Up Now</span>
                    </Link>
                 </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* SCANNER GRID EFFECT */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      </div>
    </>
  );
};

export default VendorLogin;
