import React, { useState, useRef } from "react";
import { APIError, supabase } from "../../services/authService";
import { ArrowLeft } from "lucide-react";
import logo from "../../assets/Logo SVG 1.png";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../../component/Toast";

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
}

// Email Input Screen (Step 1)
const EmailInputScreen = ({
  onContinue,
  toast,
}: {
  onContinue: (email: string, password: string) => void;
  toast: ReturnType<typeof useToast>;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      // Alternative: Use signUp which respects Supabase email confirmation settings
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: undefined, // No redirect = OTP mode
        },
      });

      if (error) throw new APIError(error.message, 400);

      toast.success("Verification code sent to your email!");
      onContinue(email, password);
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send verification code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center px-6 pt-12">
        <img src={logo} alt="PickEAT PickIT Logo" />
        <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-20 md:mb-32">
          PickEAT PickIT
        </h1>

        <div className="w-full max-w-md space-y-4 mb-auto">
          <div>
            <label className="block text-xs text-gray-500 mb-2 px-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
              className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border text-[#000000] border-gray-200 text-sm placeholder-gray-400 outline-none focus:border-green-700"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2 px-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg border text-[#000000] border-gray-200 text-sm placeholder-gray-400 outline-none focus:border-green-700"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6 font-family-inter">
          Already have an account?{" "}
          <Link to="/login" className="text-black font-family-inter font-bold">
            Log in
          </Link>
        </p>

        <div className="w-full max-w-md pb-8">
          <p className="text-xs text-gray-500 text-center mb-4">
            By continuing you agree to our{" "}
            <span className="text-green-700">Terms and condition</span> and the{" "}
            <span className="text-green-700">privacy Policy</span>
          </p>
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full py-3 md:py-4 text-sm md:text-base bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Email OTP Verification Screen (Step 2) - FIXED: Added password prop
const EmailOTPScreen = ({
  email,
  password,
  onContinue,
  onBack,
  toast,
}: {
  email: string;
  password: string; // ADDED THIS
  onContinue: () => void;
  onBack: () => void;
  toast: ReturnType<typeof useToast>;
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

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

      // After OTP verification, set the password
      if (data.user) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          console.warn("Password update warning:", updateError.message);
        }
      }

      toast.success("Email verified successfully!");
      onContinue();
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
    <div className="flex-1 flex flex-col bg-white">
      <div className="px-6 py-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-8">
        <h2 className="text-xl font-semibold mb-8 text-[#1E1E1E] font-family-inter">
          Verify your email
        </h2>

        <div className="w-full max-w-md mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Check your email inbox</strong>
              <br />
              We've sent a 6-digit verification code to <strong>{email}</strong>
              <br />
              <br />
              <span className="text-xs">
                Can't find it? Check your spam folder or click "Resend Code"
                below.
              </span>
            </p>
          </div>

          <div className="flex gap-4 mb-8 justify-center">
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
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-green-700 focus:outline-none bg-[#FFFFFF]"
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
            className="w-full py-3 md:py-4 text-sm md:text-base bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Complete Profile Screen (Step 3)
const CompleteProfileScreen = ({
  email,
  password,
  onContinue,
  onBack,
  toast,
}: {
  email: string;
  password: string;
  onContinue: (data: UserData) => void;
  onBack: () => void;
  toast: ReturnType<typeof useToast>;
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const handleContinue = () => {
    if (!firstName || !lastName || !phone) {
      toast.error("Please fill in all fields");
      return;
    }

    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    onContinue({
      firstName,
      lastName,
      email,
      password,
      phone: `+234${phone}`,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="px-6 py-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6">
        <h2 className="text-xl font-semibold mb-2">Complete profile</h2>
        <p className="text-sm text-gray-500 mb-8">
          Let us know how to properly address you
        </p>

        <div className="space-y-4 mb-auto">
          <div>
            <label className="block text-xs text-gray-500 mb-2 px-1">
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-700"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2 px-1">
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-green-700"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2 px-1">
              Phone number
            </label>
            <div className="flex gap-2">
              <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm">
                +234
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="8012345678"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-green-700"
                maxLength={10}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2 px-1">
              Email (verified ✓)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600"
            />
          </div>
        </div>

        <div className="pb-8">
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Address Input Screen (Step 4)
const AddressInputScreen = ({
  onComplete,
  onBack,
  toast,
}: {
  onComplete: (address: string) => void;
  onBack: () => void;
  toast: ReturnType<typeof useToast>;
}) => {
  const [address, setAddress] = useState("");

  const handleContinue = () => {
    if (!address || address.length < 10) {
      toast.error("Please enter a valid address");
      return;
    }
    onComplete(address);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="px-6 py-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6">
        <h2 className="text-xl font-semibold mb-2">Delivery address</h2>
        <p className="text-sm text-gray-500 mb-8">
          Where should we deliver your orders?
        </p>

        <div className="mb-auto">
          <label className="block text-xs text-gray-500 mb-2 px-1">
            Full Address
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your full delivery address (e.g., 123 Main Street, Ikeja, Lagos)"
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 resize-none focus:outline-none focus:border-green-700"
          />
        </div>

        <div className="pb-8">
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors"
          >
            Complete Registration
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Signup Component
const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState<UserData>({});
  const toast = useToast();
  const navigate = useNavigate();

  const handleEmailContinue = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setStep(2);
  };

  const handleOTPVerified = () => {
    setStep(3);
  };

  const handleProfileContinue = (data: UserData) => {
    setUserData({ ...userData, ...data });
    setStep(4);
  };

  const handleComplete = async (deliveryAddress: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new APIError("User not found. Please try again.", 400);
      }

      const { error: profileError } = await supabase.from("users").insert([
        {
          user_id: user.id,
          email: userData.email!,
          firstname: userData.firstName!,
          lastname: userData.lastName!,
          phone: userData.phone!,
          address: deliveryAddress,
        },
      ]);

      if (profileError) {
        if (profileError.code === "23505") {
          throw new APIError(
            "Account already exists. Please log in instead.",
            409,
          );
        }
        throw new APIError("Failed to create user profile", 400);
      }

      toast.success("Registration successful! Welcome to PickEAT PickIT!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      <div className="w-full bg-white shadow-xl md:rounded-3xl overflow-hidden md:max-w-3xl lg:max-w-4xl min-h-screen md:h-screen max-h-screen flex flex-col">
        <div className="flex-1 overflow-auto">
          {step === 1 && (
            <EmailInputScreen onContinue={handleEmailContinue} toast={toast} />
          )}
          {step === 2 && (
            <EmailOTPScreen
              email={email}
              password={password}
              onContinue={handleOTPVerified}
              onBack={() => setStep(1)}
              toast={toast}
            />
          )}
          {step === 3 && (
            <CompleteProfileScreen
              email={email}
              password={password}
              onContinue={handleProfileContinue}
              onBack={() => setStep(2)}
              toast={toast}
            />
          )}
          {step === 4 && (
            <AddressInputScreen
              onComplete={handleComplete}
              onBack={() => setStep(3)}
              toast={toast}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
