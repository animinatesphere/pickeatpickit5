import { useState } from "react";
import { Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Key } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import { useToast, ToastContainer } from "../component/Toast";
import { motion, AnimatePresence } from "framer-motion";

type Step = "email" | "otp" | "password" | "success";

const THEMES: Record<string, { color: string; hex: string; gradient: string }> = {
  user: { color: "green", hex: "#22c55e", gradient: "from-green-500/20" },
  rider: { color: "orange", hex: "#f97316", gradient: "from-orange-500/20" },
  vendor: { color: "blue", hex: "#3b82f6", gradient: "from-blue-500/20" },
};

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "vendor";
  const navigate = useNavigate();
  const toast = useToast();

  const theme = THEMES[userType] || THEMES.vendor;

  const getLoginPath = () => {
    switch (userType) {
      case "rider": return "/rider-login";
      case "user": return "/login";
      default: return "/vendor-login";
    }
  };

  const getTitle = () => {
    switch (userType) {
      case "rider": return "Rider Recovery";
      case "user": return "Account Recovery";
      default: return "Partner Recovery";
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return toast.error("Enter a valid email");
    setIsLoading(true);
    try {
      const response = await authService.sendPasswordResetOTP(email);
      toast.success(response.message);
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send code");
    } finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error("Enter 6-digit code");
    setIsLoading(true);
    try {
      await authService.verifyPasswordResetOTP(email, otp);
      setStep("password");
    } catch (error: any) { toast.error(error.message || "Verification failed"); }
    finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error("Passwords mismatch");
    setIsLoading(true);
    try {
      await authService.resetPasswordWithOTP(password);
      setStep("success");
      setTimeout(() => navigate(getLoginPath()), 3000);
    } catch (error: any) { toast.error(error.message || "Reset failed"); }
    finally { setIsLoading(false); }
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
                    initial={{ width: "33%" }}
                    animate={{ width: step === "email" ? "33%" : step === "otp" ? "66%" : "100%" }}
                    className="h-full transition-all duration-500"
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
                     {step === "email" && <Mail className="w-10 h-10" style={{ color: theme.hex }} />}
                     {step === "otp" && <Key className="w-10 h-10" style={{ color: theme.hex }} />}
                     {step === "password" && <Lock className="w-10 h-10" style={{ color: theme.hex }} />}
                     {step === "success" && <CheckCircle className="w-10 h-10" style={{ color: theme.hex }} />}
                  </motion.div>
                  <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
                    {step === "success" ? "System Restored" : getTitle()}
                  </h1>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">
                    {step === "email" && "Step 01: Identification"}
                    {step === "otp" && "Step 02: Verification"}
                    {step === "password" && "Step 03: Re-authentication"}
                    {step === "success" && "Final: Synchronization Complete"}
                  </p>
               </div>

               <AnimatePresence mode="wait">
                  {step === "email" && (
                    <motion.form key="e" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleSendOTP} className="space-y-6">
                       <div className="space-y-2">
                          <label className={`text-[10px] font-black uppercase text-gray-500 ml-4`}>Account Email</label>
                           <div className="relative">
                              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                              <input 
                                 value={email} onChange={e => setEmail(e.target.value)}
                                 className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-4 transition-all"
                                 style={{ 
                                   outline: 'none',
                                   borderColor: isLoading ? undefined : undefined // base color
                                 }}
                                 onFocus={(e) => {
                                   e.currentTarget.style.borderColor = theme.hex;
                                   e.currentTarget.style.boxShadow = `0 0 0 4px ${theme.hex}1a`;
                                 }}
                                 onBlur={(e) => {
                                   e.currentTarget.style.borderColor = '';
                                   e.currentTarget.style.boxShadow = '';
                                 }}
                                 placeholder="name@domain.com"
                              />
                           </div>
                       </div>
                        <motion.button 
                          whileHover={{ scale: 1.02 }} 
                          className="w-full text-white font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl transition-all"
                          style={{ 
                            backgroundColor: theme.hex,
                            boxShadow: `0 20px 25px -5px ${theme.hex}33`
                          }}
                        >
                           {isLoading ? "Broadcasting..." : "Request Signal"}
                        </motion.button>
                       <Link to={getLoginPath()} className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                          <ArrowLeft className="w-3 h-3" /> Abort mission
                       </Link>
                    </motion.form>
                  )}

                  {step === "otp" && (
                    <motion.form key="o" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleVerifyOTP} className="space-y-8">
                       <div className="text-center">
                          <p className="text-sm text-gray-400 font-medium mb-8">Verification signal sent to <span className="text-white">{email}</span></p>
                           <input 
                             value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-4xl font-black text-center tracking-[0.4em] focus:outline-none transition-all"
                             style={{ color: theme.hex }}
                             onFocus={(e) => e.currentTarget.style.borderColor = theme.hex}
                             onBlur={(e) => e.currentTarget.style.borderColor = ''}
                             placeholder="000000" maxLength={6}
                           />
                       </div>
                       <div className="flex flex-col gap-4">
                           <motion.button 
                             whileHover={{ scale: 1.02 }} 
                             className="w-full text-white font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl transition-all"
                             style={{ 
                               backgroundColor: theme.hex,
                               boxShadow: `0 20px 25px -5px ${theme.hex}33`
                             }}
                           >
                              {isLoading ? "Authenticating..." : "Unlock Terminal"}
                           </motion.button>
                          <button type="button" onClick={() => setStep("email")} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Wrong address?</button>
                       </div>
                    </motion.form>
                  )}

                  {step === "password" && (
                    <motion.form key="p" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleResetPassword} className="space-y-6">
                       <div className="space-y-4">
                          <div className="relative">
                             <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                              <input 
                                 type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                                 className="w-full pl-16 pr-14 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none transition-all"
                                 onFocus={(e) => e.currentTarget.style.borderColor = `${theme.hex}80`}
                                 onBlur={(e) => e.currentTarget.style.borderColor = ''}
                                 placeholder="New Access Key"
                              />
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                          </div>
                          <div className="relative">
                              <input 
                                 type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                 className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none transition-all"
                                 onFocus={(e) => e.currentTarget.style.borderColor = `${theme.hex}80`}
                                 onBlur={(e) => e.currentTarget.style.borderColor = ''}
                                 placeholder="Confirm New Key"
                              />
                             <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                          </div>
                       </div>
                        <motion.button 
                          whileHover={{ scale: 1.02 }} 
                          className="w-full text-white font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl transition-all"
                          style={{ 
                            backgroundColor: theme.hex,
                            boxShadow: `0 20px 25px -5px ${theme.hex}33`
                          }}
                        >
                           {isLoading ? "Syncing..." : "Finalize Reset"}
                        </motion.button>
                    </motion.form>
                  )}

                  {step === "success" && (
                    <motion.div key="s" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
                       <p className="text-gray-400 font-medium">Your credentials have been updated across the network. Redirecting to terminal...</p>
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
              System Secure • SSL Encrypted • PickEAT Network
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
