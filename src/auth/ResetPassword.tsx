import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService, APIError } from "../services/authService";
import { useToast, ToastContainer } from "../component/Toast";
import { motion, AnimatePresence } from "framer-motion";

const THEMES: Record<string, { color: string; hex: string; gradient: string }> = {
  user: { color: "green", hex: "#22c55e", gradient: "from-green-500/20" },
  rider: { color: "orange", hex: "#f97316", gradient: "from-orange-500/20" },
  vendor: { color: "blue", hex: "#3b82f6", gradient: "from-blue-500/20" },
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Get the user type from URL params (for redirect after success)
  const userType = searchParams.get("type") || "vendor";
  const theme = THEMES[userType] || THEMES.vendor;

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const accessToken = searchParams.get("access_token");
    if (!accessToken) {
      toast.error("Invalid or expired reset link");
      setTimeout(() => navigate(getLoginPath()), 2000);
    }
  }, [searchParams, navigate, toast]);

  const getLoginPath = () => {
    switch (userType) {
      case "rider": return "/rider-login";
      case "user": return "/login";
      default: return "/vendor-login";
    }
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Min 8 characters required";
    if (!/[A-Z]/.test(pwd)) return "Uppercase letter required";
    if (!/[a-z]/.test(pwd)) return "Lowercase letter required";
    if (!/[0-9]/.test(pwd)) return "Number required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return toast.error("Fill all fields");
    
    const passwordError = validatePassword(password);
    if (passwordError) return toast.error(passwordError);

    if (password !== confirmPassword) return toast.error("Passwords mismatch");

    setIsLoading(true);
    try {
      await authService.resetPassword("", "", password);
      toast.success("Security updated successfully!");
      setResetSuccess(true);
      setTimeout(() => navigate(getLoginPath()), 3000);
    } catch (error) {
      if (error instanceof APIError) toast.error(error.message);
      else toast.error("Reset failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />

      <div className="min-h-screen relative overflow-hidden bg-black font-inter text-white">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0 opacity-40">
           <div 
             className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-transparent" 
             style={{ 
               backgroundImage: `linear-gradient(to bottom right, black, transparent, ${theme.hex}33)` 
             }}
           />
        </div>
        
        {/* Ambient Lights */}
        <div 
          className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] blur-[150px] rounded-full" 
          style={{ backgroundColor: `${theme.hex}1a` }}
        />

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-10 md:p-14 border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: resetSuccess ? "100%" : "50%" }}
                    className="h-full transition-all duration-700"
                    style={{ 
                      backgroundColor: theme.hex,
                      boxShadow: `0 0 15px ${theme.hex}80`
                    }} 
                  />
               </div>

               <div className="text-center mb-12">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border"
                    style={{ 
                      backgroundColor: `${theme.hex}1a`,
                      borderColor: `${theme.hex}33`
                    }}
                  >
                     {resetSuccess ? (
                       <CheckCircle className="w-10 h-10" style={{ color: theme.hex }} />
                     ) : (
                       <Lock className="w-10 h-10" style={{ color: theme.hex }} />
                     )}
                  </motion.div>
                  <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
                    {resetSuccess ? "Security Restored" : "Re-Authorization"}
                  </h1>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">
                    {resetSuccess ? "Final: System Synchronization complete" : "Step 03: Finalize Credentials"}
                  </p>
               </div>

               <AnimatePresence mode="wait">
                  {!resetSuccess ? (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 10 }}
                      onSubmit={handleSubmit} 
                      className="space-y-6"
                    >
                       <div className="space-y-4">
                          <div className="relative">
                             <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                             <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-16 pr-14 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none transition-all"
                                style={{ outline: 'none' }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = theme.hex;
                                  e.currentTarget.style.boxShadow = `0 0 0 4px ${theme.hex}1a`;
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '';
                                  e.currentTarget.style.boxShadow = '';
                                }}
                                placeholder="New Access Key"
                             />
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500">
                               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                             </button>
                          </div>
                          <div className="relative">
                             <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none transition-all"
                                style={{ outline: 'none' }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = theme.hex;
                                  e.currentTarget.style.boxShadow = `0 0 0 4px ${theme.hex}1a`;
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '';
                                  e.currentTarget.style.boxShadow = '';
                                }}
                                placeholder="Confirm New Key"
                             />
                             <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500">
                               {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                             </button>
                          </div>
                       </div>

                       <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-2">
                          <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Requirements</p>
                          <div className="grid grid-cols-2 gap-2 text-[9px] uppercase font-bold tracking-wider">
                             <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-white' : 'text-gray-600'}`}>
                                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: password.length >= 8 ? theme.hex : '#374151' }} /> 8+ Characters
                             </div>
                             <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-white' : 'text-gray-600'}`}>
                                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: /[A-Z]/.test(password) ? theme.hex : '#374151' }} /> Uppercase
                             </div>
                             <div className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-white' : 'text-gray-600'}`}>
                                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: /[a-z]/.test(password) ? theme.hex : '#374151' }} /> Lowercase
                             </div>
                             <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-white' : 'text-gray-600'}`}>
                                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: /[0-9]/.test(password) ? theme.hex : '#374151' }} /> Number
                             </div>
                          </div>
                       </div>

                       <motion.button 
                          whileHover={{ scale: 1.02 }} 
                          className="w-full text-white font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl transition-all"
                          style={{ 
                            backgroundColor: theme.hex,
                            boxShadow: `0 20px 25px -5px ${theme.hex}33`
                          }}
                          disabled={isLoading}
                       >
                          {isLoading ? "Synchronizing..." : "Update Credentials"}
                       </motion.button>
                       <Link to={getLoginPath()} className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                          <ArrowLeft className="w-3 h-3" /> Abort mission
                       </Link>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="text-center space-y-8"
                    >
                       <p className="text-gray-400 font-medium italic">Terminal access restored. Security layers updated. Redirecting to main node...</p>
                       <div className="flex justify-center gap-2">
                          {[0, 1, 2].map(i => (
                            <motion.div 
                              key={i} 
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: theme.hex }}
                            />
                          ))}
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
            
            <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
              PickEAT Network • Secure Protocol • v4.0.2
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
