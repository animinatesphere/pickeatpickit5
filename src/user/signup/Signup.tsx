import React, { useState, useRef } from "react";
import { APIError, supabase } from "../../services/authService";
import { ArrowLeft, Mail, Lock, User, Phone, MapPin, CheckCircle2, ShieldCheck, ChevronRight } from "lucide-react";
import logo from "../../assets/Logo SVG 1.png";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../../component/Toast";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
}

const SignupShell = ({ children, step, totalSteps }: { children: React.ReactNode, step: number, totalSteps: number }) => (
  <div className="min-h-screen relative bg-black text-white font-inter overflow-hidden">
    {/* Cinematic Background */}
    <div className="absolute inset-0 z-0">
      <motion.img
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5 }}
        src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2000&auto=format&fit=crop"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
    </div>

    {/* Ambient Lights */}
    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-500/10 blur-[150px] rounded-full" />
    <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full" />

    {/* Progress Bar */}
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[100]">
      <motion.div 
        className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
        initial={{ width: "0%" }}
        animate={{ width: `${(step / totalSteps) * 100}%` }}
        transition={{ duration: 0.5, ease: "circOut" }}
      />
    </div>

    <div className="relative z-10 min-h-screen flex items-center justify-center p-6 lg:p-12">
      {children}
    </div>
  </div>
);

// Step 1: Credentials
const EmailInputScreen = ({ onContinue, toast }: { onContinue: (email: string, password: string) => void, toast: any }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-lg">
      <div className="text-center mb-10">
        <motion.img src={logo} alt="Logo" className="w-20 h-20 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.2)]" />
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Initialize <span className="text-green-500">Identity</span></h1>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">Step 01: Credentials</p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Identifier</label>
          <div className="relative group/input">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-green-500 transition-colors" />
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
              className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-bold text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Access Key</label>
          <div className="relative group/input">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-green-500 transition-colors" />
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-bold text-sm"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (!email || !/\S+@\S+\.\S+/.test(email)) return toast.error("Enter a valid email");
            if (password.length < 8) return toast.error("Password too short");
            onContinue(email, password);
          }}
          className="w-full bg-white text-black font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:shadow-green-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          Verify Identity <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
        
        <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Existing Identity? <Link to="/login" className="text-green-500 hover:text-white transition-colors">Authorize Login</Link>
        </p>
      </div>
    </motion.div>
  );
};

// Step 2: Verification
const EmailOTPScreen = ({ email, password, onContinue, onBack, toast }: { email: string, password: string, onContinue: () => void, onBack: () => void, toast: any }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return toast.error("Incomplete code");
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: "email" });
      if (error) throw error;
      await supabase.auth.updateUser({ password });
      toast.success("Identity Verified");
      onContinue();
    } catch (e: any) { toast.error(e.message || "Verification failed"); }
    finally { setIsLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors mb-10">
        <ArrowLeft className="w-3 h-3" /> Correction Mode
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Verify <span className="text-green-500">Node</span></h1>
        <p className="text-xs text-gray-500 font-medium">Authentication code sent to <span className="text-white">{email}</span></p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl space-y-8 text-center">
        <div className="flex gap-3 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { if (el) inputRefs.current[i] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val) {
                  const newOtp = [...otp]; newOtp[i] = val; setOtp(newOtp);
                  if (i < 5) inputRefs.current[i+1]?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i-1]?.focus();
              }}
              className="w-12 h-16 bg-white/5 border border-white/10 rounded-xl text-2xl font-black text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full bg-white text-black font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:shadow-green-500/20 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? "Validating..." : "Confirm Identity"}
        </motion.button>
        
        <button onClick={() => toast.info("Check spam folder or resend")} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-green-500 transition-colors">
          Resend Verification Signal
        </button>
      </div>
    </motion.div>
  );
};

// Step 3: Profile
const CompleteProfileScreen = ({ onContinue, onBack, toast }: { onContinue: (data: UserData) => void, onBack: () => void, toast: any }) => {
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [ph, setPh] = useState("");

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Subject <span className="text-green-500">Parameters</span></h1>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">Step 03: Profile Configuration</p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-4">Primary Name</label>
          <div className="relative group/input">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-green-500" />
            <input 
               placeholder="First Name" 
               value={fName} onChange={e => setFName(e.target.value)}
               className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-4">Secondary Name</label>
          <div className="relative group/input">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-green-500" />
            <input 
               placeholder="Last Name" 
               value={lName} onChange={e => setLName(e.target.value)}
               className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-sm"
            />
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-4">Communication Line</label>
          <div className="relative group/input">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-green-500" />
            <span className="absolute left-11 top-1/2 -translate-y-1/2 text-sm font-black text-green-500/50">+234</span>
            <input 
               placeholder="80XXXXXXXX" 
               value={ph} onChange={e => setPh(e.target.value.replace(/\D/g, "").slice(0, 10))}
               className="w-full pl-24 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-sm tracking-widest"
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!fName || !lName || ph.length < 10) return toast.error("Incomplete parameters");
              onContinue({ firstName: fName, lastName: lName, phone: `+234${ph}` });
            }}
            className="w-full bg-green-500 text-white font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-[0_10px_30px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-2"
          >
            Configure Profile <ShieldCheck className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Step 4: Address
const AddressInputScreen = ({ onComplete, toast }: { onComplete: (addr: string) => void, toast: any }) => {
  const [addr, setAddr] = useState("");
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Operational <span className="text-green-500">Base</span></h1>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">Step 04: Final Integration</p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-4">Target Destination</label>
          <div className="relative group/input">
            <MapPin className="absolute left-5 top-6 w-5 h-5 text-gray-500 group-focus-within/input:text-green-500" />
            <textarea
              placeholder="Full physical address..."
              value={addr} onChange={e => setAddr(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-3xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-green-500/10 min-h-[150px] resize-none font-bold text-sm leading-relaxed"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (addr.length < 10) return toast.error("Address signal too weak (min 10 chars)");
            onComplete(addr);
          }}
          className="w-full bg-white text-black font-black italic uppercase tracking-widest py-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group"
        >
          Initialize Account <CheckCircle2 className="w-6 h-6 text-green-500 group-hover:scale-125 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState<UserData>({});
  const [isFinalizing, setIsFinalizing] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleFinalComplete = async (addr: string) => {
    setIsFinalizing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Auth system error");
      const { error } = await supabase.from("users").insert([{
        user_id: user.id, email: userData.email || email, 
        firstname: userData.firstName, lastname: userData.lastName, 
        phone: userData.phone, address: addr
      }]);
      if (error) throw error;
      toast.success("System Integration Complete!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (e: any) { 
      toast.error(e.message || "Integration error"); 
      setIsFinalizing(false);
    }
  };

  return (
    <SignupShell step={step} totalSteps={4}>
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      <AnimatePresence mode="wait">
        {step === 1 && <EmailInputScreen key="s1" toast={toast} onContinue={(e, p) => { setEmail(e); setPassword(p); setStep(2); }} />}
        {step === 2 && <EmailOTPScreen key="s2" email={email} password={password} onContinue={() => setStep(3)} onBack={() => setStep(1)} toast={toast} />}
        {step === 3 && <CompleteProfileScreen key="s3" onContinue={(d) => { setUserData(d); setStep(4); }} onBack={() => setStep(2)} toast={toast} />}
        {step === 4 && !isFinalizing && <AddressInputScreen key="s4" onComplete={handleFinalComplete} toast={toast} />}
        {isFinalizing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-black uppercase italic tracking-widest animate-pulse">Synchronizing Core...</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </SignupShell>
  );
};

export default Signup;
