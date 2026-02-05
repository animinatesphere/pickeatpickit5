import { useState } from "react";
import {
  Bike,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { authService, APIError } from "../../services/authService";
import { motion } from "framer-motion";

export default function RiderLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setIsLoading(true);
    try {
      const result = await authService.loginRider(email, password);
      if (result.success) {
        localStorage.setItem("auth_token", result.token || "");
        localStorage.setItem("user", JSON.stringify(result.user));
        setTimeout(() => {
          window.location.href = "/rider-dashboard";
        }, 1000);
      }
    } catch (err: any) {
      if (err instanceof APIError) setError(err.message);
      else setError("System authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) handleLogin();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black font-inter">
      {/* CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=2000&auto=format&fit=crop"
          alt="Delivery background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
      </div>

      {/* AMBIENT LIGHTS (ORANGE/AMBER FOR RIDERS) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-16 items-center">
          
          {/* LEFT SIDE: PHILOSOPHY */}
          <motion.div 
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 1, ease: "easeOut" }}
             className="hidden lg:block lg:w-1/2"
          >
             <div className="inline-block px-4 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                Logistics Terminal
             </div>
             <h2 className="text-6xl xl:text-8xl font-black uppercase italic leading-[0.9] text-white mb-8 tracking-tighter">
                OWN THE <br />
                <span className="text-orange-500">STREETS</span>
             </h2>
             <p className="text-gray-400 text-lg font-medium max-w-md leading-relaxed mb-12">
                Join the elite fleet of independent logistics operators. Real-time routing, instant payouts, total autonomy.
             </p>
             
             <div className="flex gap-12">
                <div>
                   <div className="text-3xl font-black text-white italic">24/7</div>
                   <div className="text-[10px] uppercase tracking-widest text-orange-500 font-bold">Operational Window</div>
                </div>
                <div>
                   <div className="text-3xl font-black text-white italic">FAST</div>
                   <div className="text-[10px] uppercase tracking-widest text-orange-500 font-bold">Payout Cycles</div>
                </div>
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
                         Rider Login
                      </h2>
                      <p className="text-gray-400 text-sm font-medium">Enter your details to start your shift</p>
                   </div>
                   <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30"
                   >
                      <Bike className="w-8 h-8 text-orange-400" />
                   </motion.div>
                </div>

                {error && (
                  <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: "auto" }}
                     className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center"
                  >
                     {error}
                  </motion.div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Email Address</label>
                    <div className="relative group/input">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-orange-500 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="rider@fleet.com"
                        className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex justify-between items-center px-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Password</label>
                        <Link to="/forgot-password?type=rider" className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 hover:text-white transition-colors">Recover?</Link>
                     </div>
                    <div className="relative group/input">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-orange-500 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="••••••••"
                        className="w-full pl-14 pr-14 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all font-bold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors"
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
                    className="w-full bg-white text-black font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                       <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Login Now
                        <ArrowRight className="w-5 h-5" />
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
                 Request Fleet Access?{" "}
                 <Link to="/rider-registration">
                   <span className="text-orange-500 hover:text-white transition-colors cursor-pointer border-b border-orange-500/30">Submit Application</span>
                 </Link>
               </p>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* SCANNER LINE EFFECT */}
      <motion.div 
         animate={{ left: ["0%", "100%", "0%"] }}
         transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
         className="absolute top-0 bottom-0 w-[1px] bg-orange-500/20 z-0 pointer-events-none"
      />
    </div>
  );
}
