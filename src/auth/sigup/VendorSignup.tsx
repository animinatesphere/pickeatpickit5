import logo from "../../assets/Logo SVG 1.png";
import { useState, useRef } from "react";
import { Eye, EyeOff, ChevronDown, Camera, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../component/button";
import { useToast, ToastContainer } from "../../component/Toast";
import { authService, APIError, supabase } from "../../services/authService";

type NavigateFunction = (page: string) => void;

interface PageProps {
  onNavigate: NavigateFunction;
}

interface AvailabilityState extends Record<string, unknown> {
  dayFrom: string;
  dayTo: string;
  holidaysAvailable: string;
  timeStart: string;
  timeEnd: string;
  workers: string;
}

const SignUpPage = ({ onNavigate }: PageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (
      !formData.firstname ||
      !formData.lastname ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      // Use Supabase signUp which sends OTP
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            firstname: formData.firstname,
            lastname: formData.lastname,
            phone: formData.phone,
          },
          emailRedirectTo: undefined, // This ensures OTP mode
        },
      });

      if (error) {
        throw new APIError(error.message, 400);
      }

      // Store form data temporarily for after OTP verification
      localStorage.setItem("tempSignupData", JSON.stringify(formData));

      toast.success("Verification code sent to your email!");
      toast.info("Please check your email to verify your account.");

      // Navigate to OTP screen
      setTimeout(() => {
        onNavigate("confirm-otp");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof APIError) {
        toast.error(err.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo" className="h-12 mb-4" />
          <h1 className="text-green-600 font-bold text-xl">PickEAT PickIT</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Personal Info
          </h2>
          <p className="text-gray-600 text-sm">
            Complete the fields below to continue.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
          <input
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mb-6">
          Already have an account?{" "}
          <Link
            to="/vendor-login"
            className="text-green-600 font-semibold hover:text-green-700"
          >
            Sign in
          </Link>
        </p>

        <button
          onClick={handleSignUp}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? "Signing Up..." : "Sign Up"}
        </button>

        <Link to="/">
          <Button text="Select Role" />
        </Link>
      </div>
    </div>
  );
};

const EmailOTPScreen = ({ onNavigate }: PageProps) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const toast = useToast();

  const storedData = localStorage.getItem("tempSignupData");
  const signupData = storedData ? JSON.parse(storedData) : null;
  const email = signupData?.email || "";
  // Line 239 was here (const password = ...) - I have removed it.

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter the complete verification code");
      return;
    }

    setIsLoading(true);

    try {
      // Verify the OTP token
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otpCode,
        type: "email",
      });

      if (error) {
        throw new APIError(error.message, 400);
      }

      // After OTP verification, create vendor profile
      if (data.user && signupData) {
        // Insert vendor profile into vendors table
        const { data: vendorDataArray, error: profileError } = await supabase
          .from("vendors")
          .insert([
            {
              user_id: data.user.id,
              email: signupData.email,
              firstname: signupData.firstname,
              lastname: signupData.lastname,
              phone: signupData.phone,
            },
          ])
          .select();

        if (profileError) {
          if (profileError.code === "23505") {
            throw new APIError(
              "Account already exists. Please log in instead.",
              409,
            );
          }
          throw new APIError("Failed to create vendor profile", 400);
        }

        // Store vendor ID for profile completion
        if (vendorDataArray && vendorDataArray.length > 0) {
          localStorage.setItem("tempVendorId", vendorDataArray[0].id);
        }

        // Clear temporary signup data
        localStorage.removeItem("tempSignupData");

        toast.success("Email verified successfully!");

        setTimeout(() => {
          onNavigate("profile1");
        }, 1000);
      }
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to verify code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (error) throw new APIError(error.message, 400);

      toast.success("New verification code sent to your email!");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to resend code. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="mb-6">
          <button onClick={() => onNavigate("main")} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-8 text-gray-900">
            Verify your email
          </h2>

          <div className="w-full mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Check your email inbox</strong>
                <br />
                We've sent a 6-digit verification code to{" "}
                <strong>{email}</strong>
                <br />
                <br />
                <span className="text-xs">
                  Can't find it? Check your spam folder or click "Resend Code"
                  below.
                </span>
              </p>
            </div>

            <div className="flex gap-2 mb-8 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-green-700 focus:outline-none bg-white"
                />
              ))}
            </div>

            <button
              onClick={handleResendOTP}
              className="w-full text-sm text-green-700 font-semibold mb-6 py-2 hover:underline"
            >
              Resend Code
            </button>

            <button
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full py-4 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateProfile1 = ({ onNavigate }: PageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const toast = useToast();
  const [profileData, setProfileData] = useState({
    businessName: "",
    howToAddress: "",
    fullName: "",
    yearsOfExperience: "",
    businessEmail: "",
    country: "Nigeria",
    businessPhone: "",
    businessAddress: "",
    profession: "",
    vendorType: "",
    workAlone: "YES",
    membershipId: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (
      !profileData.businessName ||
      !profileData.fullName ||
      !profileData.businessEmail
    ) {
      toast.error("Please fill required fields");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const vendorId = localStorage.getItem("tempVendorId");
      if (!vendorId) {
        toast.error("Vendor ID not found");
        return;
      }

      await authService.saveProfileDetails(vendorId, profileData);
      toast.success("Profile details saved!");
      onNavigate("profile2");
    } catch (err) {
      console.error("Error saving profile:", err);
      if (err instanceof APIError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to save profile details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const professions = ["Chef", "Caterer", "Restaurant Owner", "Food Vendor"];
  const vendorTypes = ["Restaurant", "Delivery Only", "Both"];
  const experienceOptions = [
    "Less than 1 year",
    "1-3 years",
    "3-5 years",
    "5+ years",
  ];

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create Profile</h2>
          <button
            onClick={() => onNavigate("main")}
            className="text-green-600 font-semibold text-sm"
          >
            Skip
          </button>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-6">
          <p className="text-yellow-800 text-sm">
            Please provide accurate information below.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            name="businessName"
            value={profileData.businessName}
            onChange={handleInputChange}
            placeholder="Business Name*"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <input
            type="text"
            name="howToAddress"
            value={profileData.howToAddress}
            onChange={handleInputChange}
            placeholder="How to address?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <input
            type="text"
            name="fullName"
            value={profileData.fullName}
            onChange={handleInputChange}
            placeholder="Full Name*"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <div className="relative">
            <select
              name="yearsOfExperience"
              value={profileData.yearsOfExperience}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Years of Experience</option>
              {experienceOptions.map((opt) => (
                <option key={opt} value={opt.toLowerCase()}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
            />
          </div>

          <input
            type="email"
            name="businessEmail"
            value={profileData.businessEmail}
            onChange={handleInputChange}
            placeholder="Business Email*"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <div className="relative">
            <select
              name="country"
              value={profileData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
              <option value="Kenya">Kenya</option>
            </select>
            <ChevronDown
              size={20}
              className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
            />
          </div>

          <input
            type="tel"
            name="businessPhone"
            value={profileData.businessPhone}
            onChange={handleInputChange}
            placeholder="Business Phone*"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <input
            type="text"
            name="businessAddress"
            value={profileData.businessAddress}
            onChange={handleInputChange}
            placeholder="Business Address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <div className="relative">
            <select
              name="profession"
              value={profileData.profession}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Profession*</option>
              {professions.map((prof) => (
                <option key={prof} value={prof.toLowerCase()}>
                  {prof}
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              name="vendorType"
              value={profileData.vendorType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Vendor Type*</option>
              {vendorTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              name="workAlone"
              value={profileData.workAlone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="YES">Work Alone</option>
              <option value="NO">Work with Team</option>
            </select>
            <ChevronDown
              size={20}
              className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
            />
          </div>

          <input
            type="text"
            name="membershipId"
            value={profileData.membershipId}
            onChange={handleInputChange}
            placeholder="Membership ID (optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 accent-green-600"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to terms and conditions
          </label>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isLoading || !agreedToTerms}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg disabled:opacity-50 mb-4"
        >
          {isLoading ? "Saving..." : "Continue"}
        </button>

        <button
          onClick={() => onNavigate("main")}
          className="w-full border border-green-600 text-green-600 font-semibold py-4 rounded-lg hover:bg-green-50"
        >
          Back
        </button>
      </div>
    </div>
  );
};

const CreateProfile2 = ({ onNavigate }: PageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [businessDescription, setBusinessDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [coverUploaded, setCoverUploaded] = useState(false);
  const toast = useToast();

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    photoType: "store_logo" | "store_cover",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("File size must be less than 1MB");
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Only JPEG and PNG allowed");
      return;
    }

    setIsLoading(true);

    try {
      const vendorId = localStorage.getItem("tempVendorId");
      if (!vendorId) {
        toast.error("Vendor ID not found");
        return;
      }

      await authService.uploadVendorPhoto(vendorId, file, photoType);
      toast.success(
        `${photoType === "store_logo" ? "Logo" : "Cover photo"} uploaded!`,
      );
      if (photoType === "store_logo") {
        setLogoUploaded(true);
      } else {
        setCoverUploaded(true);
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (err instanceof APIError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to upload photo");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!businessDescription.trim()) {
      toast.error("Please add a business description");
      return;
    }

    setIsLoading(true);

    try {
      const vendorId = localStorage.getItem("tempVendorId");
      if (!vendorId) {
        toast.error("Vendor ID not found");
        return;
      }

      await authService.saveBusinessDetails(vendorId, {
        businessDescription,
        additionalInfo,
      });

      toast.success("Details saved!");
      onNavigate("availability");
    } catch (err) {
      console.error("Error:", err);
      if (err instanceof APIError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to save details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      <div className="max-w-md mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Business Details
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Add images and describe your business (images are optional)
        </p>

        <div className="space-y-6 mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition">
            <label className="cursor-pointer block">
              <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                Upload store logo
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {logoUploaded ? "✓ Uploaded" : "Optional"}
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => handleFileUpload(e, "store_logo")}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition">
            <label className="cursor-pointer block">
              <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                Upload cover photo
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {coverUploaded ? "✓ Uploaded" : "Optional"}
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => handleFileUpload(e, "store_cover")}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Business Description*
            </label>
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="Tell us about your business, specialties, and what makes you unique..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Additional Information
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any additional details customers should know..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              rows={3}
            />
          </div>
        </div>

        <button
          onClick={handleSaveDetails}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg disabled:opacity-50 mb-4"
        >
          {isLoading ? "Saving..." : "Continue"}
        </button>

        <button
          onClick={() => onNavigate("profile1")}
          className="w-full border border-green-600 text-green-600 font-semibold py-4 rounded-lg hover:bg-green-50"
        >
          Back
        </button>
      </div>
    </div>
  );
};

const SetAvailability = ({ onNavigate }: PageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const toast = useToast();
  const [availability, setAvailability] = useState<AvailabilityState>({
    dayFrom: "Monday",
    dayTo: "Sunday",
    holidaysAvailable: "yes",
    timeStart: "09:00",
    timeEnd: "21:00",
    workers: "1",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setAvailability((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAvailability = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const vendorId = localStorage.getItem("tempVendorId");
      if (!vendorId) {
        toast.error("Vendor ID not found");
        return;
      }

      await authService.saveAvailability(vendorId, availability);
      toast.success("Availability saved!");
      localStorage.removeItem("tempVendorId");
      onNavigate("success");
    } catch (err) {
      console.error("Error:", err);
      if (err instanceof APIError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to save availability");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      <div className="max-w-md mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Operating Hours
        </h2>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <label className="block text-sm font-semibold mb-2">
              Working From
            </label>
            <select
              name="dayFrom"
              value={availability.dayFrom}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              className="absolute right-3 top-11 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold mb-2">To</label>
            <select
              name="dayTo"
              value={availability.dayTo}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              className="absolute right-3 top-11 text-gray-400 pointer-events-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Opening Time
            </label>
            <input
              type="time"
              name="timeStart"
              value={availability.timeStart}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Closing Time
            </label>
            <input
              type="time"
              name="timeEnd"
              value={availability.timeEnd}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold mb-2">
              Available on Holidays?
            </label>
            <select
              name="holidaysAvailable"
              value={availability.holidaysAvailable}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <ChevronDown
              size={20}
              className="absolute right-3 top-11 text-gray-400 pointer-events-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Number of Workers
            </label>
            <input
              type="number"
              name="workers"
              min="1"
              value={availability.workers}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            id="terms2"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 accent-green-600"
          />
          <label htmlFor="terms2" className="text-sm text-gray-600">
            I agree to terms and conditions
          </label>
        </div>

        <button
          onClick={handleSaveAvailability}
          disabled={isLoading || !agreedToTerms}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg disabled:opacity-50 mb-4"
        >
          {isLoading ? "Saving..." : "Complete Setup"}
        </button>

        <button
          onClick={() => onNavigate("profile2")}
          className="w-full border border-green-600 text-green-600 font-semibold py-4 rounded-lg hover:bg-green-50"
        >
          Back
        </button>
      </div>
    </div>
  );
};

const SuccessPage = () => {
  const toast = useToast();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      <div className="text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Account Created!
        </h2>
        <p className="text-gray-600 mb-8">
          Your vendor account setup is complete. You can now log in.
        </p>
        <Link
          to="/vendor-login"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};

const VendorSignup = () => {
  const [currentPage, setCurrentPage] = useState("main");

  const renderPage = () => {
    switch (currentPage) {
      case "confirm-otp":
        return <EmailOTPScreen onNavigate={setCurrentPage} />;
      case "profile1":
        return <CreateProfile1 onNavigate={setCurrentPage} />;
      case "profile2":
        return <CreateProfile2 onNavigate={setCurrentPage} />;
      case "availability":
        return <SetAvailability onNavigate={setCurrentPage} />;
      case "success":
        return <SuccessPage />;
      default:
        return <SignUpPage onNavigate={setCurrentPage} />;
    }
  };

  return <div>{renderPage()}</div>;
};

export default VendorSignup;
