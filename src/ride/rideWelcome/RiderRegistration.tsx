import { useState } from "react";
import { authService, supabase } from "../../services/authService";
import {
  Upload,
  CheckCircle,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  DollarSign,
  Bike
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface FormData {
  email: string; password: string; confirmPassword: string; emailOTP: string;
  firstName: string; lastName: string; phone: string; gender: string;
  nextOfKinName: string; nextOfKinPhone: string;
  vehicleType: string; vehicleBrand: string; plateNumber: string;
  guarantor1Name: string; guarantor1Phone: string; guarantor1Relationship: string;
  guarantor2Name: string; guarantor2Phone: string; guarantor2Relationship: string;
  previousWork: string; workDuration: string; referralCode: string;
  termsAccepted: boolean; bankName: string; accountNumber: string; accountName: string;
  availabilityTerms: boolean; fromDay: string; toDay: string; holidayAvailable: string;
  timeStart: string; timeEnd: string;
}

const RiderSignupShell = ({ children, step, totalSteps }: { children: React.ReactNode, step: number, totalSteps: number }) => (
  <div className="min-h-screen relative bg-black text-white font-inter overflow-hidden">
    <div className="absolute inset-0 z-0">
      <motion.img
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5 }}
        src="https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=2000&auto=format&fit=crop"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
    </div>

    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[150px] rounded-full" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[150px] rounded-full" />

    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[100]">
      <motion.div 
        className="h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
        initial={{ width: "0%" }}
        animate={{ width: `${(step / totalSteps) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>

    <div className="relative z-10 min-h-screen flex items-center justify-center p-6 lg:p-12">
      {children}
    </div>
  </div>
);

export default function RiderRegistration() {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [riderId, setRiderId] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    email: "", password: "", confirmPassword: "", emailOTP: "",
    firstName: "", lastName: "", phone: "", gender: "",
    nextOfKinName: "", nextOfKinPhone: "",
    vehicleType: "", vehicleBrand: "", plateNumber: "",
    guarantor1Name: "", guarantor1Phone: "", guarantor1Relationship: "",
    guarantor2Name: "", guarantor2Phone: "", guarantor2Relationship: "",
    previousWork: "", workDuration: "", referralCode: "",
    termsAccepted: false, bankName: "", accountNumber: "", accountName: "",
    availabilityTerms: false, fromDay: "Monday", toDay: "Friday",
    holidayAvailable: "Yes, I'm available", timeStart: "10:00 am", timeEnd: "06:00 pm",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const nextStep = () => setCurrentStep(prev => (prev + 1) as Step);
  const prevStep = () => setCurrentStep(prev => (prev - 1) as Step);

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Step0 formData={formData} onChange={handleInputChange} onNext={nextStep} isLoading={isLoading} setIsLoading={setIsLoading} error={error} setError={setError} />;
      case 1: return <StepOTP formData={formData} onChange={handleInputChange} onNext={nextStep} onBack={prevStep} isLoading={isLoading} setIsLoading={setIsLoading} error={error} setError={setError} setRiderId={setRiderId} />;
      case 2: return <StepPersonal formData={formData} onChange={handleInputChange} onNext={nextStep} onBack={prevStep} />;
      case 3: return <StepVehicle formData={formData} onChange={handleInputChange} onNext={nextStep} onBack={prevStep} />;
      case 4: return <StepDocuments onNext={nextStep} onBack={prevStep} riderId={riderId} />;
      case 5: return <StepBank formData={formData} onChange={handleInputChange} onNext={nextStep} onBack={prevStep} isLoading={isLoading} setIsLoading={setIsLoading} riderId={riderId} error={error} setError={setError} />;
      case 6: return <StepDone />;
      default: return null;
    }
  };

  return (
    <RiderSignupShell step={currentStep + 1} totalSteps={7}>
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </RiderSignupShell>
  );
}

interface StepProps {
  formData: FormData;
  onChange: (field: string, value: string | boolean) => void;
  onNext: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
  error?: string;
  setError: (err: string) => void;
}

function Step0({ formData, onChange, onNext, isLoading, setIsLoading, error, setError }: StepProps) {
  const [show, setShow] = useState(false);
  const handleNext = async () => {
    if (!formData.email || !formData.password) return setError("Missing fields");
    if (setIsLoading) setIsLoading(true);
    try {
      await authService.sendEmailOTP(formData.email, formData.password);
      onNext();
    } catch (e: any) { setError(e.message || "Failed to initiate signal"); }
    finally { if (setIsLoading) setIsLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-xl">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20"><Mail className="w-8 h-8 text-black" /></div>
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Rider <span className="text-orange-500">Sign Up</span></h1>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">Step 01: Your Details</p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-6">
        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">{error}</div>}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Email Address</label>
          <input type="email" value={formData.email} onChange={e => onChange("email", e.target.value)} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold" placeholder="fleet@dispatch.com" />
        </div>
        <div className="space-y-2 relative">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Password</label>
          <input type={show ? "text" : "password"} value={formData.password} onChange={e => onChange("password", e.target.value)} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold" />
          <button onClick={() => setShow(!show)} className="absolute right-5 top-[3.25rem] text-gray-500">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} onClick={handleNext} disabled={isLoading} className="w-full bg-white text-black font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl">
          {isLoading ? "Starting..." : "Start Verification"}
        </motion.button>
      </div>
    </motion.div>
  );
}

function StepOTP({ formData, onChange, onNext, onBack, isLoading, setIsLoading, error, setError, setRiderId }: any) {
  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const { data, error: e } = await supabase.auth.verifyOtp({ email: formData.email, token: formData.emailOTP, type: "email" });
      if (e) throw e;
      if (data.user) {
        const id = await authService.createInitialRiderProfile(data.user.id, formData.email);
        setRiderId(id);
        onNext();
      }
    } catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={12} /> Go Back
      </button>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Verify <span className="text-orange-500">Email</span></h1>
        <p className="text-xs text-gray-500">Enter code sent to <span className="text-white">{formData.email}</span></p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-8">
        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">{error}</div>}
        <input maxLength={6} type="text" value={formData.emailOTP} onChange={e => onChange("emailOTP", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-4xl font-black text-center text-orange-500 tracking-[0.5em] focus:border-orange-500/50 outline-none" />
        <button onClick={handleVerify} disabled={isLoading} className="w-full bg-white text-black font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl">
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>
      </div>
    </motion.div>
  );
}

function StepPersonal({ formData, onChange, onNext, onBack }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-3xl">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={12} /> Edit Information
      </button>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Personal <span className="text-orange-500">Information</span></h1>
        <p className="text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase">Step 03: About You</p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl grid grid-cols-2 gap-6">
        <div className="space-y-2"><input placeholder="First Name" value={formData.firstName} onChange={e => onChange("firstName", e.target.value)} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-orange-500/50 outline-none" /></div>
        <div className="space-y-2"><input placeholder="Last Name" value={formData.lastName} onChange={e => onChange("lastName", e.target.value)} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-orange-500/50 outline-none" /></div>
        <div className="space-y-2"><input placeholder="Phone" value={formData.phone} onChange={e => onChange("phone", e.target.value)} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-orange-500/50 outline-none" /></div>
        <div className="space-y-2">
          <select value={formData.gender} onChange={e => onChange("gender", e.target.value)} className="w-full px-6 py-5 bg-zinc-900 border border-white/10 rounded-2xl text-white font-bold appearance-none cursor-pointer focus:border-orange-500/50 outline-none">
            <option value="">Gender</option><option value="male">Male</option><option value="female">Female</option>
          </select>
        </div>
        <div className="col-span-2 pt-6">
           <button onClick={onNext} className="w-full bg-orange-500 text-white font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2">
             Save and Continue <ChevronRight size={18} />
           </button>
        </div>
      </div>
    </motion.div>
  );
}

function StepVehicle({ formData, onChange, onNext, onBack }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-xl">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={12} /> Back to Profile
      </button>
       <div className="text-center mb-10">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Vehicle <span className="text-orange-500">Details</span></h1>
        <p className="text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase">Step 04: Your Bike/Car</p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-6">
         <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest flex items-center gap-2"><Bike size={12} className="text-orange-500" /> Unit Type</label>
            <select value={formData.vehicleType} onChange={e => onChange("vehicleType", e.target.value)} className="w-full px-6 py-5 bg-zinc-900 border border-white/10 rounded-2xl text-white font-bold appearance-none cursor-pointer focus:border-orange-500/50 outline-none">
               <option value="">Select Vehicle Type</option><option value="bike">Motorcycle</option><option value="bicycle">Bicycle</option><option value="car">Vehicle</option>
            </select>
         </div>
         <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest flex items-center gap-2"><Zap size={12} className="text-orange-500" /> Manufacturer</label><input placeholder="e.g. Honda" value={formData.vehicleBrand} onChange={e => onChange("vehicleBrand", e.target.value)} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-orange-500/50 outline-none" /></div>
         <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest flex items-center gap-2"><ShieldCheck size={12} className="text-orange-500" /> ID Number</label><input placeholder="Plate Number" value={formData.plateNumber} onChange={e => onChange("plateNumber", e.target.value)} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-orange-500/50 outline-none" /></div>
         <button onClick={onNext} className="w-full bg-white text-black font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2">
            Save and Continue <ChevronRight size={18} />
         </button>
      </div>
    </motion.div>
  );
}

function StepDocuments({ onNext, onBack, riderId }: any) {
  const [up, setUp] = useState({ license: false, id: false });
  const [isUploading, setIsUploading] = useState(false);
  
  const handleU = async (file: any, type: any) => {
    if (!file) return;
    setIsUploading(true);
    try { 
      await authService.uploadRiderPhoto(riderId, file, type); 
      setUp({...up, [type === 'license_photo' ? 'license' : 'id']: true}); 
    } catch (e) {}
    finally { setIsUploading(false); }
  };
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={12} /> Back to Vehicle
      </button>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Verify <span className="text-orange-500">Identity</span></h1>
        <p className="text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase">Step 05: Upload Documents</p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl grid grid-cols-2 gap-8">
         <label className="relative aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer group hover:border-orange-500/50 transition-colors overflow-hidden">
            <Upload className={`w-10 h-10 mb-3 ${up.license ? 'text-orange-500 shrink-0' : 'text-gray-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center px-4 leading-relaxed">{up.license ? "License Uploaded" : "Driver's License"}</span>
            <input type="file" className="hidden" onChange={e => handleU(e.target.files?.[0], 'license_photo')} disabled={isUploading} />
            {up.license && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-orange-500/10 flex items-center justify-center"><CheckCircle className="text-orange-500 w-12 h-12" /></motion.div>}
         </label>
         <label className="relative aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer group hover:border-amber-500/50 transition-colors overflow-hidden">
            <Upload className={`w-10 h-10 mb-3 ${up.id ? 'text-orange-500' : 'text-gray-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center px-4 leading-relaxed">{up.id ? "Photo Uploaded" : "Your Photo"}</span>
            <input type="file" className="hidden" onChange={e => handleU(e.target.files?.[0], 'profile_photo')} disabled={isUploading} />
            {up.id && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-orange-500/10 flex items-center justify-center"><CheckCircle className="text-orange-500 w-12 h-12" /></motion.div>}
         </label>
         <div className="col-span-2 pt-6"><button onClick={onNext} disabled={!up.license || !up.id || isUploading} className="w-full bg-orange-500 text-white font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-orange-500/10 flex items-center justify-center gap-2 disabled:opacity-50">Save and Continue <ChevronRight size={18} /></button></div>
      </div>
    </motion.div>
  );
}

function StepBank({ formData, onChange, onNext, onBack, isLoading, setIsLoading, riderId, error, setError }: any) {
  const handleSave = async () => {
    if (setIsLoading) setIsLoading(true);
    try {
      await authService.saveRiderRegistration({
        riderId, ...formData, termsAccepted: true
      });
      onNext();
    } catch (e: any) { setError(e.message || "Failed to finalize routing"); }
    finally { if (setIsLoading) setIsLoading(false); }
  };
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-xl">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={12} /> Back to Documents
      </button>
       <div className="text-center mb-10">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Bank <span className="text-orange-500">Details</span></h1>
        <p className="text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase">Step 06: Payment Information</p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-5">
         {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">{error}</div>}
         <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-500 ml-4 flex items-center gap-2"><DollarSign size={12} className="text-orange-500" /> Bank Name</label><input placeholder="Bank Name" value={formData.bankName} onChange={e => onChange("bankName", e.target.value)} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-orange-500/50" /></div>
         <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-500 ml-4 flex items-center gap-2">Account Number</label><input placeholder="Account Number" value={formData.accountNumber} onChange={e => onChange("accountNumber", e.target.value)} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold tracking-widest outline-none focus:border-orange-500/50" /></div>
         <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-500 ml-4 flex items-center gap-2">Beneficiary Name</label><input placeholder="Account Name" value={formData.accountName} onChange={e => onChange("accountName", e.target.value)} className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-orange-500/50" /></div>
         <button onClick={handleSave} disabled={isLoading} className="w-full bg-orange-500 text-white font-black italic uppercase tracking-widest py-6 rounded-2xl shadow-xl mt-6 flex items-center justify-center gap-2">{isLoading ? "Completing..." : "Complete Registration"}</button>
      </div>
    </motion.div>
  );
}

function StepDone() {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full max-w-lg">
       <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(249,115,22,0.4)]">
          <CheckCircle className="w-12 h-12 text-black" />
       </div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">REGISTRATION <span className="text-orange-500">COMPLETE</span></h1>
        <p className="text-gray-400 font-medium mb-12">Your registration is successful. Please wait for approval from our team.</p>
        <button onClick={() => navigate("/rider-login")} className="bg-white text-black font-black uppercase italic tracking-widest py-6 px-12 rounded-2xl shadow-2xl flex items-center justify-center gap-2 mx-auto">Go to Login <ChevronRight size={20} /></button>
    </motion.div>
  );
}
