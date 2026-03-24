import logo from "../../assets/Logo SVG 1.png";
import { useState, useRef } from "react";
import {
  Eye,
  EyeOff,
  Camera,
  Mail,
  Lock,
  Phone,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast, ToastContainer } from "../../component/Toast";
import {
  backendAuthService,
  type VendorRegistrationPayload,
} from "../../services/backendAuthService";
import { motion, AnimatePresence } from "framer-motion";

type NavigateFunction = (page: string) => void;

interface RegistrationData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  user_id?: string;
  logoFile?: File | null;
  coverFile?: File | null;
  profile: Record<string, unknown>;
  availability: Record<string, unknown>;
  bank_info: Record<string, unknown>;
}

interface RegistrationUpdate {
  [key: string]:
    | string
    | number
    | boolean
    | File
    | null
    | undefined
    | Record<string, unknown>;
}

interface PageProps {
  onNavigate: NavigateFunction;
  onUpdate?: (data: RegistrationUpdate) => void;
  registrationData?: RegistrationData;
}

// ─── Shell ────────────────────────────────────────────────────────────────────

const VendorSignupShell = ({
  children,
  step,
  totalSteps,
}: {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
}) => (
  <div className="min-h-screen relative bg-black text-white font-inter overflow-hidden">
    <div className="absolute inset-0 z-0">
      <motion.img
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5 }}
        src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2000&auto=format&fit=crop"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
    </div>

    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full" />
    <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full" />

    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[100]">
      <motion.div
        className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
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

// ─── Step 1: Personal Info ────────────────────────────────────────────────────

const SignUpPage = ({ onNavigate, onUpdate }: PageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const toast = useToast();

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords don't match!");
    if (
      !formData.firstname ||
      !formData.lastname ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    )
      return toast.error("Missing required fields");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email");

    setIsLoading(true);
    try {
      const response = await backendAuthService.register({
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
        user_type: "vendor",
      });

      const responseData = response.data as { user_id?: string; id?: string };
      const userId = responseData?.user_id || responseData?.id;

      localStorage.setItem(
        "tempSignupData",
        JSON.stringify({ ...formData, user_id: userId }),
      );

      if (onUpdate) {
        onUpdate({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone: formData.phone,
          user_id: userId,
        });
      }
      toast.success("Verification Signal Sent");
      onNavigate("confirm-otp");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-xl"
    >
      <div className="text-center mb-10">
        <motion.img
          src={logo}
          alt="Logo"
          className="w-20 h-20 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        />
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Vendor <span className="text-blue-500">Sign Up</span>
        </h1>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">
          Step 01: Personal Information
        </p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
              First Name
            </label>
            <input
              value={formData.firstname}
              onChange={(e) =>
                setFormData({ ...formData, firstname: e.target.value })
              }
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
              Last Name
            </label>
            <input
              value={formData.lastname}
              onChange={(e) =>
                setFormData({ ...formData, lastname: e.target.value })
              }
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              placeholder="email@enterprise.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-xs"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-xs"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignUp}
          disabled={isLoading}
          className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            "Creating Account..."
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Create Vendor Account
            </>
          )}
        </motion.button>

        <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Already a partner?{" "}
          <Link
            to="/vendor-login"
            className="text-blue-500 hover:text-white transition-colors"
          >
            Login Here
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

// ─── Step 2: OTP ──────────────────────────────────────────────────────────────

const EmailOTPScreen = ({ onNavigate, onUpdate }: PageProps) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const toast = useToast();
  const storedData = localStorage.getItem("tempSignupData");
  const signupData = storedData ? JSON.parse(storedData) : null;
  const email = signupData?.email || "";

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return toast.error("Incomplete signal");
    setIsLoading(true);
    try {
      await backendAuthService.verifyOTP(email, otpCode);
      if (signupData) {
        if (onUpdate) onUpdate({ user_id: signupData.user_id });
        localStorage.removeItem("tempSignupData");
        toast.success("OTP Verified");
        onNavigate("profile1");
      }
    } catch (e) {
      toast.error((e as Error).message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Verify <span className="text-blue-500">Email</span>
        </h1>
        <p className="text-xs text-gray-500 font-medium">
          Verification signal sent to{" "}
          <span className="text-white">{email}</span>
        </p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-8 text-center">
        <div className="flex gap-2 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                if (el) inputRefs.current[i] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(-1);
                const newOtp = [...otp];
                newOtp[i] = val;
                setOtp(newOtp);
                if (val && i < 5) inputRefs.current[i + 1]?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otp[i] && i > 0) {
                  inputRefs.current[i - 1]?.focus();
                }
              }}
              className="w-12 h-16 bg-white/5 border border-white/10 rounded-xl text-2xl font-black text-blue-500 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </motion.button>

        <button
          onClick={async () => {
            try {
              await backendAuthService.sendOTP(email);
              toast.success("New code sent to your email");
            } catch (e: unknown) {
              const err = e as { message?: string };
              toast.error(err.message || "Failed to resend");
            }
          }}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-blue-500 transition-colors w-full mt-4"
        >
          Didn't receive code? <span className="underline">Resend Signal</span>
        </button>
      </div>
    </motion.div>
  );
};

// ─── Step 3: Business Basics ──────────────────────────────────────────────────

const CreateProfile1 = ({ onNavigate, onUpdate }: PageProps) => {
  const [profileData, setProfileData] = useState({
    business_name: "",
    how_to_address: "",
    full_name: "",
    years_of_experience: "",
    business_email: "",
    country_name: "Nigeria",
    business_phone: "",
    business_address: "",
    profession: "",
    vendor_type: "",
    work_alone: "YES",
    membership_id: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    if (
      !profileData.business_name ||
      !profileData.full_name ||
      !profileData.business_email ||
      !agreed
    )
      return toast.error("Missing requirements");
    setIsLoading(true);
    try {
      if (onUpdate) onUpdate(profileData);
      onNavigate("profile2");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Business <span className="text-blue-500">Information</span>
        </h1>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">
          Step 03: Business Details
        </p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 lg:p-12 border border-white/5 shadow-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
              Establishment Name
            </label>
            <input
              placeholder="Business Name"
              value={profileData.business_name}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  business_name: e.target.value,
                })
              }
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
              Legal Representative
            </label>
            <input
              placeholder="Full Name"
              value={profileData.full_name}
              onChange={(e) =>
                setProfileData({ ...profileData, full_name: e.target.value })
              }
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
              Operational Email
            </label>
            <input
              placeholder="biz@email.com"
              value={profileData.business_email}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  business_email: e.target.value,
                })
              }
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
              Profession
            </label>
            <select
              value={profileData.profession}
              onChange={(e) =>
                setProfileData({ ...profileData, profession: e.target.value })
              }
              className="w-full px-6 py-4 bg-zinc-800 border-white/10 rounded-2xl text-white font-bold text-sm appearance-none cursor-pointer"
            >
              <option value="">Select Profession</option>
              <option value="chef">Chef</option>
              <option value="caterer">Caterer</option>
              <option value="restaurant">Restaurant Owner</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
              Vendor Type
            </label>
            <select
              value={profileData.vendor_type}
              onChange={(e) =>
                setProfileData({ ...profileData, vendor_type: e.target.value })
              }
              className="w-full px-6 py-4 bg-zinc-800 border-white/10 rounded-2xl text-white font-bold text-sm appearance-none cursor-pointer"
            >
              <option value="">Select Category</option>
              <option value="restaurant">Restaurant</option>
              <option value="delivery">Cloud Kitchen</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
              Years of Experience
            </label>
            <select
              value={profileData.years_of_experience}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  years_of_experience: e.target.value,
                })
              }
              className="w-full px-6 py-4 bg-zinc-800 border-white/10 rounded-2xl text-white font-bold text-sm appearance-none cursor-pointer"
            >
              <option value="">Select Years</option>
              <option value="1">1-3 Years</option>
              <option value="3">3-5 Years</option>
              <option value="5">5+ Years</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
              Business Phone
            </label>
            <input
              placeholder="Phone"
              value={profileData.business_phone}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  business_phone: e.target.value,
                })
              }
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
              Business Address
            </label>
            <input
              placeholder="Full Address"
              value={profileData.business_address}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  business_address: e.target.value,
                })
              }
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm"
            />
          </div>
          <div className="flex items-center gap-4 h-[60px] pt-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 accent-blue-500"
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              I accept corporate terms
            </span>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-3 pt-8 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleSave}
            disabled={isLoading || !agreed}
            className="flex-1 bg-white text-black font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl transition-all"
          >
            {isLoading ? "Saving Details..." : "Save and Continue"}
          </motion.button>
          <button
            onClick={() => onNavigate("main")}
            className="px-8 font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            Abort
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Step 4: Visuals & Description ───────────────────────────────────────────

const CreateProfile2 = ({ onNavigate, onUpdate }: PageProps) => {
  const [desc, setDesc] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (type === "logo") {
      setLogoFile(file);
      setLogoPreview(previewUrl);
    } else {
      setCoverFile(file);
      setCoverPreview(previewUrl);
    }
    toast.success("Asset ready for upload");
  };

  const handleSave = async () => {
    if (!desc.trim()) return toast.error("Description required");
    setIsLoading(true);
    try {
      if (onUpdate) {
        onUpdate({ business_description: desc, logoFile, coverFile });
      }
      onNavigate("availability");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Business <span className="text-blue-500">Photos</span>
        </h1>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">
          Step 04: Upload Photos
        </p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <label className="relative aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group overflow-hidden">
            {logoPreview ? (
              <img
                src={logoPreview}
                className="w-full h-full object-cover"
                alt="Logo preview"
              />
            ) : (
              <>
                <Camera className="w-8 h-8 text-gray-500 group-hover:text-blue-500 transition-colors mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Profile Logo
                </span>
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleUpload(e, "logo")}
            />
          </label>
          <label className="relative aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group overflow-hidden">
            {coverPreview ? (
              <img
                src={coverPreview}
                className="w-full h-full object-cover"
                alt="Cover preview"
              />
            ) : (
              <>
                <Camera className="w-8 h-8 text-gray-500 group-hover:text-blue-500 transition-colors mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Cover Display
                </span>
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleUpload(e, "cover")}
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
            Business Description
          </label>
          <textarea
            placeholder="Describe your culinary vision..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-white font-bold text-sm min-h-[150px] resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? "Saving Photos..." : "Save and Continue"}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Step 5: Availability ─────────────────────────────────────────────────────

const AvailabilityScreen = ({ onNavigate, onUpdate }: PageProps) => {
  const [availData, setAvailData] = useState({
    day_from: "MONDAY",
    day_to: "SUNDAY",
    holidays_available: true,
    opening_time: "08:00",
    closing_time: "22:00",
    total_workers: 5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (onUpdate) onUpdate(availData);
      onNavigate("payment");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Opening <span className="text-blue-500">Hours</span>
        </h1>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">
          Step 05: Set Availability
        </p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-10">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                Active Days
              </span>
            </div>
            <div className="flex gap-2">
              <select
                value={availData.day_from}
                onChange={(e) =>
                  setAvailData({ ...availData, day_from: e.target.value })
                }
                className="flex-1 bg-white/5 border-white/10 rounded-xl p-3 text-xs font-bold text-white uppercase appearance-none"
              >
                <option value="MONDAY">Mon</option>
                <option value="FRIDAY">Fri</option>
              </select>
              <span className="pt-3">→</span>
              <select
                value={availData.day_to}
                onChange={(e) =>
                  setAvailData({ ...availData, day_to: e.target.value })
                }
                className="flex-1 bg-white/5 border-white/10 rounded-xl p-3 text-xs font-bold text-white uppercase appearance-none"
              >
                <option value="SUNDAY">Sun</option>
                <option value="SATURDAY">Sat</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                Shift Hours
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="time"
                value={availData.opening_time}
                onChange={(e) =>
                  setAvailData({ ...availData, opening_time: e.target.value })
                }
                className="flex-1 bg-white/5 border-white/10 rounded-xl p-3 text-xs font-bold text-white"
              />
              <span className="pt-3">→</span>
              <input
                type="time"
                value={availData.closing_time}
                onChange={(e) =>
                  setAvailData({ ...availData, closing_time: e.target.value })
                }
                className="flex-1 bg-white/5 border-white/10 rounded-xl p-3 text-xs font-bold text-white"
              />
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-white text-black font-black uppercase tracking-widest py-6 rounded-2xl shadow-xl transition-all"
        >
          {isLoading ? "Saving Hours..." : "Save Availability"}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Step 6: Bank Info ────────────────────────────────────────────────────────

const PaymentOption = ({ onNavigate, registrationData }: PageProps) => {
  const [bankData, setBankData] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    accept_cod: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    if (!bankData.account_number || !bankData.bank_name)
      return toast.error("Bank details required");

    if (!registrationData?.user_id) {
      toast.error("User authentication missing. Please restart registration.");
      return;
    }

    setIsLoading(true);
    try {
      const reg = registrationData as RegistrationData;

      const finalData: Record<string, unknown> = {
        ...reg,
        ...(reg.profile as Record<string, unknown>),
        ...(reg.availability as Record<string, unknown>),
        ...bankData,
        user_id: reg.user_id,
      };

      // Strip nested / non-serialisable keys before sending to API
      delete finalData.profile;
      delete finalData.availability;
      delete finalData.bank_info;
      delete finalData.logoFile;
      delete finalData.coverFile;

      const result = await backendAuthService.registerVendor(
        finalData as unknown as VendorRegistrationPayload,
      );
      const resultData = result.data as Record<string, string> | undefined;
      const vendorId = resultData?.id || resultData?.vendor_id;

      if (vendorId) {
        if (reg.logoFile instanceof File) {
          try {
            await backendAuthService.uploadVendorAsset(
              vendorId,
              reg.logoFile,
              "store_logo",
            );
          } catch (e) {
            console.warn("Logo upload failed (non-critical):", e);
          }
        }
        if (reg.coverFile instanceof File) {
          try {
            await backendAuthService.uploadVendorAsset(
              vendorId,
              reg.coverFile,
              "store_cover",
            );
          } catch (e) {
            console.warn("Cover upload failed (non-critical):", e);
          }
        }
      }

      toast.success("Vendor Registration Complete!");
      onNavigate("confirm");
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Bank <span className="text-blue-500">Details</span>
        </h1>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-black">
          Step 06: Payment Information
        </p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
              Bank Name
            </label>
            <input
              placeholder="Bank Name"
              value={bankData.bank_name}
              onChange={(e) =>
                setBankData({ ...bankData, bank_name: e.target.value })
              }
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
              Account Number
            </label>
            <input
              placeholder="000XXX0000"
              value={bankData.account_number}
              onChange={(e) =>
                setBankData({ ...bankData, account_number: e.target.value })
              }
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm tracking-[0.2em]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
              Account Name
            </label>
            <input
              placeholder="Beneficiary Name"
              value={bankData.account_name}
              onChange={(e) =>
                setBankData({ ...bankData, account_name: e.target.value })
              }
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm"
            />
          </div>

          <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
            <input
              type="checkbox"
              id="accept_cod"
              checked={bankData.accept_cod}
              onChange={(e) =>
                setBankData({ ...bankData, accept_cod: e.target.checked })
              }
              className="w-5 h-5 accent-blue-500 cursor-pointer"
            />
            <div className="flex flex-col">
              <label
                htmlFor="accept_cod"
                className="text-xs font-black uppercase tracking-widest text-white cursor-pointer"
              >
                Accept Cash on Delivery
              </label>
              <span className="text-[10px] text-gray-500 font-bold">
                Allow customers to pay with cash upon delivery
              </span>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? "Saving Bank Details..." : "Save Bank Details"}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Step 7: Done ─────────────────────────────────────────────────────────────

const ConfirmationScreen = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center w-full max-w-lg"
    >
      <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(59,130,246,0.4)]">
        <CheckCircle2 className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">
        VENDOR SIGN UP <span className="text-blue-500">COMPLETE</span>
      </h1>
      <p className="text-gray-400 font-medium mb-12">
        Your account has been created successfully. Welcome to PickEAT PickIT.
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/vendor-login")}
        className="bg-white text-black font-black uppercase tracking-widest py-6 px-12 rounded-2xl shadow-2xl"
      >
        Go to Dashboard
      </motion.button>
    </motion.div>
  );
};

// ─── Root Orchestrator ────────────────────────────────────────────────────────

const VendorSignup = () => {
  const [page, setPage] = useState("main");
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    profile: {},
    availability: {},
    bank_info: {},
  });

  const steps: Record<string, number> = {
    main: 1,
    "confirm-otp": 2,
    profile1: 3,
    profile2: 4,
    availability: 5,
    payment: 6,
    confirm: 7,
  };

  const updateData = (section: string, data: RegistrationUpdate) => {
    if (section === "root") {
      setRegistrationData((prev: RegistrationData) => ({ ...prev, ...data }));
    } else {
      setRegistrationData((prev: RegistrationData) => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof RegistrationData] as Record<
            string,
            unknown
          >),
          ...data,
        },
      }));
    }
  };

  return (
    <VendorSignupShell step={steps[page]} totalSteps={7}>
      <ToastContainer
        toasts={useToast().toasts}
        onClose={useToast().closeToast}
      />
      <AnimatePresence mode="wait">
        {page === "main" && (
          <SignUpPage
            key="p1"
            onNavigate={setPage}
            onUpdate={(data) => updateData("root", data)}
          />
        )}
        {page === "confirm-otp" && (
          <EmailOTPScreen
            key="p2"
            onNavigate={setPage}
            registrationData={registrationData}
            onUpdate={(data) => updateData("root", data)}
          />
        )}
        {page === "profile1" && (
          <CreateProfile1
            key="p3"
            onNavigate={setPage}
            onUpdate={(data) => updateData("profile", data)}
          />
        )}
        {page === "profile2" && (
          <CreateProfile2
            key="p4"
            onNavigate={setPage}
            onUpdate={(data) => updateData("profile", data)}
          />
        )}
        {page === "availability" && (
          <AvailabilityScreen
            key="p5"
            onNavigate={setPage}
            onUpdate={(data) => updateData("availability", data)}
          />
        )}
        {page === "payment" && (
          <PaymentOption
            key="p6"
            onNavigate={setPage}
            registrationData={registrationData}
            onUpdate={(data) => updateData("bank_info", data)}
          />
        )}
        {page === "confirm" && <ConfirmationScreen key="p7" />}
      </AnimatePresence>
    </VendorSignupShell>
  );
};

export default VendorSignup;
