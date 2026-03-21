/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { backendAuthService } from "../../services/backendAuthService";
import api from "../../services/api";
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
  Bike,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// 0=email, 1=otp, 2=personal, 3=vehicle, 4=guarantors, 5=documents, 6=bank, 7=done
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
const TOTAL_STEPS = 8;

interface FormData {
  email: string;
  password: string;
  emailOTP: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  vehicleType: string;
  vehicleBrand: string;
  plateNumber: string;
  g1Name: string;
  g1Phone: string;
  g1Relationship: string;
  g2Name: string;
  g2Phone: string;
  g2Relationship: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const Shell = ({
  children,
  step,
}: {
  children: React.ReactNode;
  step: number;
}) => (
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
        animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
    <div className="relative z-10 min-h-screen flex items-center justify-center p-6 lg:p-12">
      {children}
    </div>
  </div>
);

const BackBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white mb-8 transition-colors"
  >
    <ArrowLeft size={12} /> Go Back
  </button>
);

const ErrBox = ({ msg, green }: { msg: string; green?: boolean }) => (
  <div
    className={`p-4 rounded-xl text-xs font-bold text-center border ${green ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-500"}`}
  >
    {msg}
  </div>
);

const Inp = ({
  label,
  ...p
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
        {label}
      </label>
    )}
    <input
      {...p}
      className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-orange-500/50 placeholder:text-gray-600"
    />
  </div>
);

const Sel = ({
  label,
  children,
  ...p
}: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: React.ReactNode;
  }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
      {label}
    </label>
    <select
      {...p}
      className="w-full px-6 py-5 bg-zinc-900 border border-white/10 rounded-2xl text-white font-bold appearance-none cursor-pointer focus:border-orange-500/50 outline-none"
    >
      {children}
    </select>
  </div>
);

export default function RiderRegistration() {
  const [step, setStep] = useState<Step>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [riderId, setRiderId] = useState("");
  const [licenseUrl, setLicenseUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
    emailOTP: "",
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    vehicleType: "",
    vehicleBrand: "",
    plateNumber: "",
    g1Name: "",
    g1Phone: "",
    g1Relationship: "",
    g2Name: "",
    g2Phone: "",
    g2Relationship: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const change = (f: string, v: string | boolean) => {
    setForm((p) => ({ ...p, [f]: v }));
    setError("");
  };
  const next = () => {
    setError("");
    setStep((p) => (p + 1) as Step);
  };
  const back = () => {
    setError("");
    setStep((p) => (p - 1) as Step);
  };
  const shared = {
    form,
    change,
    onNext: next,
    onBack: back,
    isLoading,
    setIsLoading,
    error,
    setError,
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepEmail {...shared} />;
      case 1:
        return <StepOTP {...shared} setRiderId={setRiderId} />;
      case 2:
        return <StepPersonal {...shared} />;
      case 3:
        return <StepVehicle {...shared} />;
      case 4:
        return <StepGuarantors {...shared} />;
      case 5:
        return (
          <StepDocuments
            onNext={next}
            onBack={back}
            riderId={riderId}
            setLicenseUrl={setLicenseUrl}
            setPhotoUrl={setPhotoUrl}
          />
        );
      case 6:
        return (
          <StepBank {...shared} licenseUrl={licenseUrl} photoUrl={photoUrl} />
        );
      case 7:
        return <StepDone />;
      default:
        return null;
    }
  };

  return (
    <Shell step={step + 1}>
      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
    </Shell>
  );
}

/* ── Step 0: Email + Password ─────────────────────────────────────────────── */
function StepEmail({
  form,
  change,
  onNext,
  isLoading,
  setIsLoading,
  error,
  setError,
}: any) {
  const [show, setShow] = useState(false);

  const handleNext = async () => {
    if (!form.email || !form.password)
      return setError("Email and password are required");
    if (form.password.length < 8)
      return setError("Password must be at least 8 characters");
    setIsLoading(true);
    try {
      await backendAuthService.customerRegister({
        email: form.email,
        password: form.password,
      });
      onNext();
    } catch (e: any) {
      setError(e.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-xl"
    >
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
          <Mail className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Rider <span className="text-orange-500">Sign Up</span>
        </h1>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">
          Step 1 of 7 — Account
        </p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-6">
        {error && <ErrBox msg={error} />}
        <Inp
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(e) => change("email", e.target.value)}
          placeholder="rider@example.com"
        />
        <div className="relative">
          <Inp
            label="Password"
            type={show ? "text" : "password"}
            value={form.password}
            onChange={(e) => change("password", e.target.value)}
            placeholder="Min. 8 characters"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-5 bottom-[1.35rem] text-gray-500"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleNext}
          disabled={isLoading}
          className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl disabled:opacity-60"
        >
          {isLoading ? "Creating account..." : "Create Account & Get OTP"}
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Step 1: OTP ──────────────────────────────────────────────────────────── */
function StepOTP({
  form,
  change,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  error,
  setError,
  setRiderId,
}: any) {
  const handleVerify = async () => {
    if (!form.emailOTP) return setError("Please enter the 6-digit code");
    setIsLoading(true);
    try {
      const res = await backendAuthService.verifyOTP(form.email, form.emailOTP);
      if (res.user?.rider_id) setRiderId(res.user.rider_id);
      onNext();
    } catch (e: any) {
      setError(e.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await backendAuthService.sendOTP(form.email);
      setError("✓ New code sent to your email");
    } catch (e: any) {
      setError(e.message || "Failed to resend");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-lg"
    >
      <BackBtn onClick={onBack} />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Verify <span className="text-orange-500">Email</span>
        </h1>
        <p className="text-xs text-gray-500">
          6-digit code sent to <span className="text-white">{form.email}</span>
        </p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-8">
        {error && <ErrBox msg={error} green={error.startsWith("✓")} />}
        <input
          maxLength={6}
          type="text"
          value={form.emailOTP}
          onChange={(e) => change("emailOTP", e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-4xl font-black text-center text-orange-500 tracking-[0.5em] focus:border-orange-500/50 outline-none"
          placeholder="······"
        />
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-2xl disabled:opacity-60"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>
        <button
          onClick={handleResend}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-orange-500 transition-colors w-full"
        >
          Didn't receive code? <span className="underline">Resend</span>
        </button>
      </div>
    </motion.div>
  );
}

/* ── Step 2: Personal ─────────────────────────────────────────────────────── */
function StepPersonal({ form, change, onNext, onBack }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-3xl"
    >
      <BackBtn onClick={onBack} />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Personal <span className="text-orange-500">Info</span>
        </h1>
        <p className="text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase">
          Step 3 of 7
        </p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl grid grid-cols-2 gap-6">
        <Inp
          label="First Name *"
          value={form.firstName}
          onChange={(e) => change("firstName", e.target.value)}
          placeholder="John"
        />
        <Inp
          label="Last Name *"
          value={form.lastName}
          onChange={(e) => change("lastName", e.target.value)}
          placeholder="Doe"
        />
        <Inp
          label="Phone *"
          value={form.phone}
          onChange={(e) => change("phone", e.target.value)}
          placeholder="+234 800 000 0000"
        />
        <Sel
          label="Gender"
          value={form.gender}
          onChange={(e) => change("gender", e.target.value)}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Sel>
        <div className="col-span-2 pt-2">
          <button
            onClick={() => {
              if (!form.firstName || !form.lastName || !form.phone)
                return alert("Please fill all required fields");
              onNext();
            }}
            className="w-full bg-orange-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2"
          >
            Save and Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Step 3: Vehicle ──────────────────────────────────────────────────────── */
function StepVehicle({ form, change, onNext, onBack }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-xl"
    >
      <BackBtn onClick={onBack} />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Vehicle <span className="text-orange-500">Details</span>
        </h1>
        <p className="text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase">
          Step 4 of 7
        </p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest flex items-center gap-2">
            <Bike size={12} className="text-orange-500" /> Vehicle Type *
          </label>
          <Sel
            label=""
            value={form.vehicleType}
            onChange={(e) => change("vehicleType", e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="bike">Motorcycle</option>
            <option value="bicycle">Bicycle</option>
            <option value="car">Car</option>
          </Sel>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest flex items-center gap-2">
            <Zap size={12} className="text-orange-500" /> Manufacturer
          </label>
          <Inp
            value={form.vehicleBrand}
            onChange={(e) => change("vehicleBrand", e.target.value)}
            placeholder="e.g. Honda"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-4 tracking-widest flex items-center gap-2">
            <ShieldCheck size={12} className="text-orange-500" /> Plate Number
          </label>
          <Inp
            value={form.plateNumber}
            onChange={(e) => change("plateNumber", e.target.value)}
            placeholder="e.g. LAG-123-XY"
          />
        </div>
        <button
          onClick={onNext}
          className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2"
        >
          Save and Continue <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Step 4: Guarantors  →  POST /api/riders/guarantors ─────────────────── */
function StepGuarantors({
  form,
  change,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  error,
  setError,
}: any) {
  const RELS = ["Parent", "Sibling", "Spouse", "Friend", "Colleague", "Other"];

  const handleNext = async () => {
    if (!form.g1Name || !form.g1Phone || !form.g1Relationship)
      return setError("Guarantor 1 is required — please fill all three fields");

    setIsLoading(true);
    try {
      // Guarantor 1 — required
      await api.post("/riders/guarantors", {
        name: form.g1Name,
        phone: form.g1Phone,
        relationship: form.g1Relationship,
      });

      // Guarantor 2 — optional, only post if all fields filled
      if (form.g2Name && form.g2Phone && form.g2Relationship) {
        await api.post("/riders/guarantors", {
          name: form.g2Name,
          phone: form.g2Phone,
          relationship: form.g2Relationship,
        });
      }

      onNext();
    } catch (e: any) {
      setError(
        e.response?.data?.detail || e.message || "Failed to save guarantors",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-3xl"
    >
      <BackBtn onClick={onBack} />
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Users className="w-7 h-7 text-orange-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Guarantors <span className="text-orange-500">Info</span>
        </h1>
        <p className="text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase">
          Step 5 of 7 — Two references
        </p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-8">
        {error && <ErrBox msg={error} />}

        {/* Guarantor 1 */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-orange-500 text-black rounded-full flex items-center justify-center text-[9px] font-black">
              1
            </span>
            Guarantor 1 <span className="text-red-400 ml-1">(Required)</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Inp
              label="Full Name *"
              value={form.g1Name}
              onChange={(e) => change("g1Name", e.target.value)}
              placeholder="Full name"
            />
            <Inp
              label="Phone *"
              value={form.g1Phone}
              onChange={(e) => change("g1Phone", e.target.value)}
              placeholder="+234..."
            />
            <Sel
              label="Relationship *"
              value={form.g1Relationship}
              onChange={(e) => change("g1Relationship", e.target.value)}
            >
              <option value="">Select...</option>
              {RELS.map((r) => (
                <option key={r} value={r.toLowerCase()}>
                  {r}
                </option>
              ))}
            </Sel>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
            Guarantor 2 — Optional
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Guarantor 2 */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-white/10 text-gray-400 rounded-full flex items-center justify-center text-[9px] font-black">
              2
            </span>
            Guarantor 2
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Inp
              label="Full Name"
              value={form.g2Name}
              onChange={(e) => change("g2Name", e.target.value)}
              placeholder="Full name"
            />
            <Inp
              label="Phone"
              value={form.g2Phone}
              onChange={(e) => change("g2Phone", e.target.value)}
              placeholder="+234..."
            />
            <Sel
              label="Relationship"
              value={form.g2Relationship}
              onChange={(e) => change("g2Relationship", e.target.value)}
            >
              <option value="">Select...</option>
              {RELS.map((r) => (
                <option key={r} value={r.toLowerCase()}>
                  {r}
                </option>
              ))}
            </Sel>
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full bg-orange-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              {" "}
              Save and Continue <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Step 5: Documents  →  POST /api/riders/upload-document?document_type=X ─ */
function StepDocuments({
  onNext,
  onBack,
  riderId,
  setLicenseUrl,
  setPhotoUrl,
}: any) {
  const [up, setUp] = useState({ license: false, photo: false });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (
    file: File,
    type: "drivers_license" | "selfie",
  ) => {
    setIsUploading(true);
    setUploadError("");
    try {
      // backendAuthService maps:
      //   "drivers_license"  →  document_type=license_photo
      //   "selfie"           →  document_type=profile_photo
      const result = await backendAuthService.uploadRiderDocument(
        riderId,
        file,
        type,
      );
      if (type === "drivers_license") {
        setLicenseUrl(result.url);
        setUp((p) => ({ ...p, license: true }));
      } else {
        setPhotoUrl(result.url);
        setUp((p) => ({ ...p, photo: true }));
      }
    } catch (e: any) {
      setUploadError(e.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full max-w-2xl"
    >
      <BackBtn onClick={onBack} />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Verify <span className="text-orange-500">Identity</span>
        </h1>
        <p className="text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase">
          Step 6 of 7 — Upload Documents
        </p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl">
        {uploadError && (
          <div className="mb-6">
            <ErrBox msg={uploadError} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-8">
          <label className="relative aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors overflow-hidden">
            <Upload
              className={`w-10 h-10 mb-3 ${up.license ? "text-orange-500" : "text-gray-500"}`}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center px-4 leading-relaxed">
              {up.license ? "License Uploaded ✓" : "Driver's License"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => {
                if (e.target.files?.[0])
                  handleUpload(e.target.files[0], "drivers_license");
              }}
            />
            {up.license && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-orange-500/10 flex items-center justify-center"
              >
                <CheckCircle className="text-orange-500 w-12 h-12" />
              </motion.div>
            )}
          </label>

          <label className="relative aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 transition-colors overflow-hidden">
            <Upload
              className={`w-10 h-10 mb-3 ${up.photo ? "text-orange-500" : "text-gray-500"}`}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center px-4 leading-relaxed">
              {up.photo ? "Photo Uploaded ✓" : "Your Photo / Selfie"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => {
                if (e.target.files?.[0])
                  handleUpload(e.target.files[0], "selfie");
              }}
            />
            {up.photo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-orange-500/10 flex items-center justify-center"
              >
                <CheckCircle className="text-orange-500 w-12 h-12" />
              </motion.div>
            )}
          </label>
        </div>
        <div className="mt-8">
          {isUploading && (
            <p className="text-center text-xs text-orange-400 font-bold uppercase tracking-widest mb-4 animate-pulse">
              Uploading...
            </p>
          )}
          <button
            onClick={onNext}
            disabled={!up.license || !up.photo || isUploading}
            className="w-full bg-orange-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
          >
            Save and Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Step 6: Bank  →  POST /api/riders/ + POST /api/riders/bank-info ──────── */
function StepBank({
  form,
  change,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  licenseUrl,
  photoUrl,
  error,
  setError,
}: any) {
  const handleSave = async () => {
    if (!form.bankName || !form.accountNumber || !form.accountName)
      return setError("Please fill in all bank details");

    setIsLoading(true);
    try {
      // 1. Create rider profile — POST /api/riders/
      await api.post("/riders/", {
        firstname: form.firstName,
        lastname: form.lastName,
        phone: form.phone,
        gender: form.gender,
        vehicle_type: form.vehicleType,
        vehicle_brand: form.vehicleBrand,
        plate_number: form.plateNumber,
        profile_image: photoUrl || "",
        license_image: licenseUrl || "",
        is_active: false,
        status: "pending",
      });

      // 2. Save bank info — POST /api/riders/bank-info
      await api.post("/riders/bank-info", {
        bank_name: form.bankName,
        account_number: form.accountNumber,
        account_name: form.accountName,
      });

      onNext();
    } catch (e: any) {
      setError(
        e.response?.data?.detail ||
          e.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-xl"
    >
      <BackBtn onClick={onBack} />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Bank <span className="text-orange-500">Details</span>
        </h1>
        <p className="text-[10px] tracking-[0.3em] text-gray-500 font-bold uppercase">
          Step 7 of 7 — Final Step
        </p>
      </div>
      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-5">
        {error && <ErrBox msg={error} />}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-4 flex items-center gap-2">
            <DollarSign size={12} className="text-orange-500" /> Bank Name *
          </label>
          <Inp
            value={form.bankName}
            onChange={(e) => change("bankName", e.target.value)}
            placeholder="e.g. GTBank"
          />
        </div>
        <Inp
          label="Account Number *"
          value={form.accountNumber}
          onChange={(e) => change("accountNumber", e.target.value)}
          placeholder="10-digit number"
        />
        <Inp
          label="Account Name *"
          value={form.accountName}
          onChange={(e) => change("accountName", e.target.value)}
          placeholder="Account holder name"
        />

        {/* Quick summary */}
        <div className="bg-white/3 border border-white/5 rounded-2xl p-5 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
            Summary
          </p>
          {[
            {
              k: "Name",
              v: `${form.firstName} ${form.lastName}`.trim() || "—",
            },
            { k: "Vehicle", v: form.vehicleType || "—" },
            { k: "Plate", v: form.plateNumber || "—" },
          ].map((r) => (
            <div key={r.k} className="flex justify-between text-xs">
              <span className="text-gray-500 font-bold uppercase tracking-wider">
                {r.k}
              </span>
              <span className="text-white font-bold">{r.v}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-orange-500 text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? "Completing Registration..." : "Complete Registration"}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Step 7: Done ─────────────────────────────────────────────────────────── */
function StepDone() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center w-full max-w-lg"
    >
      <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(249,115,22,0.4)]">
        <CheckCircle className="w-12 h-12 text-black" />
      </div>
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">
        Registration <span className="text-orange-500">Complete</span>
      </h1>
      <p className="text-gray-400 font-medium mb-3">
        Your application has been submitted successfully.
      </p>
      <p className="text-gray-600 text-sm mb-12">
        Status:{" "}
        <span className="text-orange-400 font-bold uppercase tracking-wider">
          Pending Approval
        </span>
      </p>
      <button
        onClick={() => navigate("/rider-login")}
        className="bg-white text-black font-black uppercase tracking-widest py-6 px-12 rounded-2xl shadow-2xl flex items-center justify-center gap-2 mx-auto"
      >
        Go to Login <ChevronRight size={20} />
      </button>
    </motion.div>
  );
}
