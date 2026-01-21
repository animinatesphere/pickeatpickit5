import { useState } from "react";
// import { authService } from "../../services/authService";
import {
  ChevronDown,
  Camera,
  User,
  ArrowLeft,
  MessageCircle,
  CheckCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  emailOTP: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  vehicleType: string;
  vehicleBrand: string;
  plateNumber: string;
  guarantor1Name: string;
  guarantor1Phone: string;
  guarantor1Relationship: string;
  guarantor2Name: string;
  guarantor2Phone: string;
  guarantor2Relationship: string;
  previousWork: string;
  workDuration: string;
  referralCode: string;
  termsAccepted: boolean;
  bankName: string;
  accountNumber: string;
  accountName: string;
  availabilityTerms: boolean;
  fromDay: string;
  toDay: string;
  holidayAvailable: string;
  timeStart: string;
  timeEnd: string;
}

interface StepProps {
  formData: FormData;
  onChange: (field: string, value: string | boolean) => void;
  onNext: () => void;
  onBack?: () => void;
}

export default function RiderRegistration() {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    emailOTP: "",
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    vehicleType: "",
    vehicleBrand: "",
    plateNumber: "",
    guarantor1Name: "",
    guarantor1Phone: "",
    guarantor1Relationship: "",
    guarantor2Name: "",
    guarantor2Phone: "",
    guarantor2Relationship: "",
    previousWork: "",
    workDuration: "",
    referralCode: "",
    termsAccepted: false,
    bankName: "",
    accountNumber: "",
    accountName: "",
    availabilityTerms: false,
    fromDay: "Monday",
    toDay: "Friday",
    holidayAvailable: "Yes, I'm available",
    timeStart: "10:00 am",
    timeEnd: "6:00 pm",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step0
            formData={formData}
            onChange={handleInputChange}
            onNext={nextStep}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
          />
        );
      case 1:
        return (
          <StepOTP
            formData={formData}
            onChange={handleInputChange}
            onNext={nextStep}
            onBack={prevStep}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
          />
        );
      case 2:
        return (
          <Step1
            formData={formData}
            onChange={handleInputChange}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <Step2
            formData={formData}
            onChange={handleInputChange}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <Step3
            formData={formData}
            onChange={handleInputChange}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return <Step4 onNext={nextStep} onBack={prevStep} />;
      case 6:
        return (
          <Step5
            formData={formData}
            onChange={handleInputChange}
            onNext={nextStep}
            onBack={prevStep}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
          />
        );
      case 7:
        return <Step6 />;
      default:
        return null;
    }
  };

  return <div className="min-h-screen bg-gray-50">{renderStep()}</div>;
}

// Step 0: Email & Password Registration
function Step0({
  formData,
  onChange,
  onNext,
  isLoading,
  setIsLoading,
  error,
  setError,
}: StepProps & {
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  error: string;
  setError: (val: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOTP = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call your authService to send OTP
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Simulate sending OTP to email: ${formData.email}. Return only: {"success": true, "message": "OTP sent to your email!"}`,
            },
          ],
        }),
      });

      const data = await response.json();
      console.log("OTP sent:", data);

      // Move to OTP verification step
      onNext();
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Rider Account
          </h1>
          <p className="text-gray-600">
            Enter your email and password to get started
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          {/* Email Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
            </div>
            <input
              type="email"
              placeholder="Email address*"
              value={formData.email}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min. 8 characters)*"
              value={formData.password}
              onChange={(e) => onChange("password", e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password*"
              value={formData.confirmPassword}
              onChange={(e) => onChange("confirmPassword", e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white font-bold text-sm">i</span>
          </div>
          <p className="text-gray-700 text-sm">
            We'll send a verification code to your email to confirm your
            account.
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleSendOTP}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Send Verification Code"
          )}
        </button>
      </div>
    </div>
  );
}

// Step OTP: Verify Email OTP
function StepOTP({
  formData,
  onChange,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  error,
  setError,
}: StepProps & {
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  error: string;
  setError: (val: string) => void;
}) {
  const handleVerifyOTP = async () => {
    if (!formData.emailOTP || formData.emailOTP.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call your authService to verify OTP
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Simulate OTP verification for email: ${formData.email}, OTP: ${formData.emailOTP}. Return only: {"success": true, "message": "Email verified!"}`,
            },
          ],
        }),
      });

      const data = await response.json();
      console.log("OTP verified:", data);

      // Move to personal information step
      onNext();
    } catch (err) {
      setError("Invalid verification code. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("New verification code sent to " + formData.email);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button onClick={onBack} className="text-gray-600 mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              Enter the 6-digit code sent to
              <br />
              <span className="font-semibold text-green-600">
                {formData.email}
              </span>
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* OTP Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={formData.emailOTP}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              onChange("emailOTP", value);
            }}
            maxLength={6}
            className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all text-center text-2xl font-semibold tracking-widest"
          />
        </div>

        {/* Resend Code */}
        <div className="text-center mb-6">
          <button
            onClick={handleResendOTP}
            disabled={isLoading}
            className="text-green-600 hover:text-green-700 font-medium transition-colors disabled:opacity-50"
          >
            Didn't receive code? Resend
          </button>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyOTP}
          disabled={isLoading || formData.emailOTP.length !== 6}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Verify & Continue"
          )}
        </button>
      </div>
    </div>
  );
}

// Step 1: Personal Information (same as before but updated step number)
function Step1({ formData, onChange, onNext, onBack }: StepProps) {
  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Personal Information
            </h1>
          </div>
          <button className="text-green-600 font-medium">Skip</button>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white font-bold text-sm">!</span>
          </div>
          <p className="text-green-700 text-sm">
            Please Kindly provide the correct info below
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="First Name*"
            value={formData.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all"
          />

          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all"
          />

          <div className="flex gap-2">
            <div className="w-20 px-4 py-4 bg-white border border-gray-300 rounded-xl flex items-center justify-center text-gray-700">
              +234
            </div>
            <input
              type="tel"
              placeholder="Contact Phone number*"
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className="flex-1 px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={formData.gender}
              onChange={(e) => onChange("gender", e.target.value)}
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all appearance-none text-gray-700"
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 my-6 flex items-start gap-3">
          <div className="bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white font-bold text-sm">!</span>
          </div>
          <p className="text-green-700 text-sm">
            All details you provided must be true, accurate and non-misleading.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Previous Place of Work"
            value={formData.previousWork}
            onChange={(e) => onChange("previousWork", e.target.value)}
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all"
          />

          <div className="relative">
            <select
              value={formData.workDuration}
              onChange={(e) => onChange("workDuration", e.target.value)}
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all appearance-none text-gray-700"
            >
              <option value="">How long did you work there for?</option>
              <option value="less-than-6">Less than 6 months</option>
              <option value="6-12">6 months - 1 year</option>
              <option value="1-2">1 - 2 years</option>
              <option value="more-than-2">More than 2 years</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white font-bold text-sm">!</span>
          </div>
          <p className="text-green-700 text-sm">
            In order to earn registration points and benefits, please enter your
            Referral code
          </p>
        </div>

        <input
          type="text"
          placeholder="Referral code (optional)"
          value={formData.referralCode}
          onChange={(e) => onChange("referralCode", e.target.value)}
          className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all mb-6"
        />

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => onChange("termsAccepted", e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 mt-0.5"
          />
          <span className="text-gray-700 text-sm">
            I understand and agree with the{" "}
            <span className="text-green-600 font-medium">Terms</span> and{" "}
            <span className="text-green-600 font-medium">Conditions</span>
          </span>
        </label>

        <button
          onClick={onNext}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Step2({ formData, onChange, onNext, onBack }: StepProps) {
  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Guarantor Information
            </h1>
          </div>
          <button className="text-green-600 font-medium">Skip</button>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white font-bold text-sm">!</span>
          </div>
          <p className="text-green-700 text-sm">
            Please Kindly provide the correct info below
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Guarantor 1 Name"
            value={formData.guarantor1Name}
            onChange={(e) => onChange("guarantor1Name", e.target.value)}
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all"
          />

          <div className="flex gap-2">
            <div className="w-20 px-4 py-4 bg-white border border-gray-300 rounded-xl flex items-center justify-center text-gray-700">
              +234
            </div>
            <input
              type="tel"
              placeholder="Guarantor Phone number*"
              value={formData.guarantor1Phone}
              onChange={(e) => onChange("guarantor1Phone", e.target.value)}
              className="flex-1 px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={formData.guarantor1Relationship}
              onChange={(e) =>
                onChange("guarantor1Relationship", e.target.value)
              }
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all appearance-none text-gray-700"
            >
              <option value="">Relationship</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="relative">Relative</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          <input
            type="text"
            placeholder="Guarantor 2 Name"
            value={formData.guarantor2Name}
            onChange={(e) => onChange("guarantor2Name", e.target.value)}
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all"
          />

          <div className="flex gap-2">
            <div className="w-20 px-4 py-4 bg-white border border-gray-300 rounded-xl flex items-center justify-center text-gray-700">
              +234
            </div>
            <input
              type="tel"
              placeholder="Guarantor Phone number*"
              value={formData.guarantor2Phone}
              onChange={(e) => onChange("guarantor2Phone", e.target.value)}
              className="flex-1 px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={formData.guarantor2Relationship}
              onChange={(e) =>
                onChange("guarantor2Relationship", e.target.value)
              }
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all appearance-none text-gray-700"
            >
              <option value="">Relationship</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="relative">Relative</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 my-6 flex items-start gap-3">
          <div className="bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white font-bold text-sm">!</span>
          </div>
          <p className="text-green-700 text-sm">
            All details you provided must be true, accurate and non-misleading.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Previous Place of Work"
            value={formData.previousWork}
            onChange={(e) => onChange("previousWork", e.target.value)}
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all"
          />

          <div className="relative">
            <select
              value={formData.workDuration}
              onChange={(e) => onChange("workDuration", e.target.value)}
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all appearance-none text-gray-700"
            >
              <option value="">How long did you work there for?</option>
              <option value="less-than-6">Less than 6 months</option>
              <option value="6-12">6 months - 1 year</option>
              <option value="1-2">1 - 2 years</option>
              <option value="more-than-2">More than 2 years</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white font-bold text-sm">!</span>
          </div>
          <p className="text-green-700 text-sm">
            In order to earn registration points and benefits, please enter your
            Referral code
          </p>
        </div>

        <input
          type="text"
          placeholder="Referral code (optional)"
          value={formData.referralCode}
          onChange={(e) => onChange("referralCode", e.target.value)}
          className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all mb-6"
        />

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => onChange("termsAccepted", e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 mt-0.5"
          />
          <span className="text-gray-700 text-sm">
            I understand and agree with the{" "}
            <span className="text-green-600 font-medium">Terms</span> and{" "}
            <span className="text-green-600 font-medium">Conditions</span>
          </span>
        </label>

        <button
          onClick={onNext}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Step3({ formData, onChange, onNext, onBack }: StepProps) {
  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Bank Information
            </h1>
          </div>
          <button className="text-green-600 font-medium">Skip</button>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white font-bold text-sm">!</span>
          </div>
          <p className="text-green-700 text-sm">
            Please Kindly provide the correct info below
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <select
              value={formData.bankName}
              onChange={(e) => onChange("bankName", e.target.value)}
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all appearance-none text-gray-700"
            >
              <option value="">Bank Name</option>
              <option value="access">Access Bank</option>
              <option value="gtb">GTBank</option>
              <option value="first">First Bank</option>
              <option value="uba">UBA</option>
              <option value="zenith">Zenith Bank</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          <input
            type="text"
            placeholder="Account Number"
            value={formData.accountNumber}
            onChange={(e) => onChange("accountNumber", e.target.value)}
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all"
          />

          <input
            type="text"
            placeholder="Name on Account"
            value={formData.accountName}
            onChange={(e) => onChange("accountName", e.target.value)}
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-all"
          />
        </div>

        <button
          onClick={onNext}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Step4({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Verify Identity
            </h1>
          </div>
          <button className="text-green-600 font-medium">Skip</button>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-500 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-full p-4">
                <Camera className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">
                  Upload a picture of your
                </p>
                <p className="font-semibold text-gray-800">Driver's License</p>
                <p className="text-xs text-gray-500 mt-1">Choose Photo</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-500 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-full p-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-green-600 font-semibold mb-1">
                  Position your bare face
                </p>
                <p className="text-green-600 font-semibold">
                  clearly in the camera.
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  No face mask or glasses
                </p>
                <p className="text-xs text-gray-500 mt-1">Take photo</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Step5({
  formData,
  onChange,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  error,
  setError,
}: StepProps & {
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  error: string;
  setError: (val: string) => void;
}) {
  const handleComplete = async () => {
    if (!formData.availabilityTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Here you would call your authService to save all rider data
      const riderData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender,
        nextOfKinName: formData.nextOfKinName,
        nextOfKinPhone: formData.nextOfKinPhone,
        vehicleType: formData.vehicleType,
        vehicleBrand: formData.vehicleBrand,
        plateNumber: formData.plateNumber,
        guarantor1: {
          name: formData.guarantor1Name,
          phone: formData.guarantor1Phone,
          relationship: formData.guarantor1Relationship,
        },
        guarantor2: {
          name: formData.guarantor2Name,
          phone: formData.guarantor2Phone,
          relationship: formData.guarantor2Relationship,
        },
        previousWork: formData.previousWork,
        workDuration: formData.workDuration,
        referralCode: formData.referralCode,
        bankInfo: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
        },
        availability: {
          fromDay: formData.fromDay,
          toDay: formData.toDay,
          holidayAvailable: formData.holidayAvailable,
          timeStart: formData.timeStart,
          timeEnd: formData.timeEnd,
        },
      };

      console.log("Saving rider data:", riderData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onNext();
    } catch (err) {
      setError("Failed to complete registration. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Set Availability
            </h1>
          </div>
          <button className="text-green-600 font-medium">Skip</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-green-600 rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">From</label>
              <div className="relative">
                <select
                  value={formData.fromDay}
                  onChange={(e) => onChange("fromDay", e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none text-gray-800"
                >
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">To</label>
              <div className="relative">
                <select
                  value={formData.toDay}
                  onChange={(e) => onChange("toDay", e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none text-gray-800"
                >
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">
                Available during Holidays
              </label>
              <div className="relative">
                <select
                  value={formData.holidayAvailable}
                  onChange={(e) => onChange("holidayAvailable", e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none text-gray-800"
                >
                  <option>Yes, I'm available</option>
                  <option>No, I'm not available</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm mb-2 block">
                  Time Start
                </label>
                <div className="relative">
                  <select
                    value={formData.timeStart}
                    onChange={(e) => onChange("timeStart", e.target.value)}
                    className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none text-gray-800"
                  >
                    <option>8:00 am</option>
                    <option>9:00 am</option>
                    <option>10:00 am</option>
                    <option>11:00 am</option>
                    <option>12:00 pm</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">
                  Time End
                </label>
                <div className="relative">
                  <select
                    value={formData.timeEnd}
                    onChange={(e) => onChange("timeEnd", e.target.value)}
                    className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none text-gray-800"
                  >
                    <option>4:00 pm</option>
                    <option>5:00 pm</option>
                    <option>6:00 pm</option>
                    <option>7:00 pm</option>
                    <option>8:00 pm</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.availabilityTerms}
            onChange={(e) => onChange("availabilityTerms", e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 mt-0.5"
          />
          <span className="text-gray-700 text-sm">
            I understand and agree with the{" "}
            <span className="text-green-600 font-medium">Terms</span> and{" "}
            <span className="text-green-600 font-medium">Conditions</span>
          </span>
        </label>

        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Complete Registration"
          )}
        </button>
      </div>
    </div>
  );
}

function Step6() {
  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-6 w-full">
        <div className="flex justify-end mb-8">
          <div className="bg-white rounded-full p-3 shadow-lg border-2 border-green-500">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">
          You're all set up!
        </h1>

        <div className="flex justify-center items-center mb-12 relative">
          <div className="relative">
            <svg
              width="120"
              height="200"
              viewBox="0 0 120 200"
              className="animate-float"
            >
              <ellipse
                cx="60"
                cy="180"
                rx="30"
                ry="8"
                fill="#e5e7eb"
                opacity="0.5"
              />
              <rect
                x="45"
                y="120"
                width="30"
                height="60"
                fill="#1f2937"
                rx="15"
              />
              <rect
                x="35"
                y="80"
                width="50"
                height="50"
                fill="#10b981"
                rx="10"
              />
              <circle cx="60" cy="40" r="25" fill="#fbbf24" />
              <path
                d="M 50 35 Q 60 30 70 35"
                stroke="#1f2937"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="53" cy="38" r="2" fill="#1f2937" />
              <circle cx="67" cy="38" r="2" fill="#1f2937" />
            </svg>

            <div className="absolute -right-24 top-8 bg-white rounded-lg shadow-lg p-3 border-2 border-gray-200 w-20 animate-slideInRight">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-1 bg-green-500 rounded"></div>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="space-y-1">
                <div className="w-12 h-1 bg-gray-200 rounded"></div>
                <div className="w-10 h-1 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div
              className="absolute -right-16 top-28 bg-white rounded-lg shadow-lg p-3 border-2 border-gray-200 w-20 animate-slideInRight"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-1 bg-gray-300 rounded"></div>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="space-y-1">
                <div className="w-12 h-1 bg-gray-200 rounded"></div>
                <div className="w-10 h-1 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div
              className="absolute -right-8 top-48 bg-white rounded-lg shadow-lg p-3 border-2 border-gray-200 w-20 animate-slideInRight"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-1 bg-gray-300 rounded"></div>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="space-y-1">
                <div className="w-12 h-1 bg-gray-200 rounded"></div>
                <div className="w-10 h-1 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-gray-700 text-base leading-relaxed">
            We'll notify you via mail or text message when
            <br />
            your application has been approved.
          </p>
        </div>

        <div className="bg-gray-100 rounded-2xl p-6 mb-8">
          <p className="text-gray-600 text-sm font-medium mb-4">
            Only reach out to our support team if:
          </p>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>You don't get a mail from us after 7 days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>You need to change any details you provided</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => (window.location.href = "/rider-login")}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          Go to Login
        </button>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-slideInRight { animation: slideInRight 0.6s ease-out forwards; opacity: 0; }
        `}</style>
      </div>
    </div>
  );
}
