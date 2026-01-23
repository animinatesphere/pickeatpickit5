import { useState } from "react";
import { Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/Logo SVG 1.png";
import { authService, APIError } from "../services/authService";
import { useToast, ToastContainer } from "../component/Toast";

type Step = "email" | "otp" | "password" | "success";

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

  const getLoginPath = () => {
    switch (userType) {
      case "rider":
        return "/rider-login";
      case "user":
        return "/login";
      default:
        return "/vendor-login";
    }
  };

  const getTitle = () => {
    switch (userType) {
      case "rider":
        return "Rider Password Reset";
      case "user":
        return "Customer Password Reset";
      default:
        return "Vendor Password Reset";
    }
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== handleSendOTP called ===");
    console.log("Email:", email);

    if (!email) {
      console.log("Validation failed: No email");
      toast.error("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      console.log("Validation failed: Invalid email format");
      toast.error("Please enter a valid email address");
      return;
    }

    console.log("Validation passed, calling authService.sendPasswordResetOTP");
    setIsLoading(true);

    try {
      console.log("About to call sendPasswordResetOTP with email:", email);
      const response = await authService.sendPasswordResetOTP(email);
      console.log("Response received:", response);
      toast.success(response.message);
      setStep("otp");
    } catch (error) {
      console.error("=== Error caught in handleSendOTP ===");
      console.error("Error type:", typeof error);
      console.error("Error:", error);
      console.error("Error instanceof APIError:", error instanceof APIError);
      
      if (error instanceof APIError) {
        console.error("APIError message:", error.message);
        toast.error(error.message);
      } else if (error instanceof Error) {
        console.error("Regular Error message:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unknown error type");
        toast.error("Failed to send OTP. Please try again.");
      }
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      await authService.verifyPasswordResetOTP(email, otp);
      toast.success("OTP verified! Please set your new password.");
      setStep("password");
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("OTP verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPasswordWithOTP(password);
      toast.success("Password reset successfully!");
      setStep("success");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate(getLoginPath());
      }, 2000);
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await authService.sendPasswordResetOTP(email);
      toast.success(response.message);
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      if (step === "email") handleSendOTP(e as any);
      else if (step === "otp") handleVerifyOTP(e as any);
      else if (step === "password") handleResetPassword(e as any);
    }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />

      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
            alt="Food background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-green-900/50 to-black/70"></div>
          <div className="absolute inset-0 backdrop-blur-[2px]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 md:p-12 border border-white/40">
              {/* Logo Section */}
              <div className="flex flex-col items-center mb-8">
                <img
                  src={logo}
                  alt="PickEAT PickIT Logo"
                  className="w-20 h-20 mb-3"
                />
                <h1 className="text-green-600 font-bold text-2xl sm:text-3xl">
                  PickEAT PickIT
                </h1>
              </div>

              {/* Step Indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === "email"
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    1
                  </div>
                  <div className="w-12 h-1 bg-gray-200">
                    <div
                      className={`h-full transition-all ${
                        step !== "email" ? "bg-green-600 w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === "otp"
                        ? "bg-green-600 text-white"
                        : step === "password" || step === "success"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    2
                  </div>
                  <div className="w-12 h-1 bg-gray-200">
                    <div
                      className={`h-full transition-all ${
                        step === "password" || step === "success"
                          ? "bg-green-600 w-full"
                          : "w-0"
                      }`}
                    ></div>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === "password" || step === "success"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    3
                  </div>
                </div>
              </div>

              {/* Step 1: Email */}
              {step === "email" && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
                      {getTitle()}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base text-center">
                      Enter your email to receive a verification code
                    </p>
                  </div>

                  <form onSubmit={handleSendOTP} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-md">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="your@email.com"
                          className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base hover:border-gray-300 bg-white"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? "Sending..." : "Send Verification Code"}
                    </button>
                  </form>

                  <div className="mt-6">
                    <Link
                      to={getLoginPath()}
                      className="flex items-center justify-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {step === "otp" && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
                      Enter Verification Code
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base text-center">
                      We sent a 6-digit code to{" "}
                      <span className="font-semibold text-gray-900">
                        {email}
                      </span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOTP} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        onKeyPress={handleKeyPress}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-semibold hover:border-gray-300 bg-white"
                        disabled={isLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Didn't receive the code?{" "}
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={isLoading}
                          className="text-green-600 font-semibold hover:underline disabled:opacity-50"
                        >
                          Resend
                        </button>
                      </p>
                    </div>
                  </form>

                  <div className="mt-6">
                    <button
                      onClick={() => setStep("email")}
                      className="flex items-center justify-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Change Email
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: New Password */}
              {step === "password" && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
                      Set New Password
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base text-center">
                      Create a strong password for your account
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter new password"
                          className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base hover:border-gray-300"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Confirm new password"
                          className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base hover:border-gray-300"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Password must contain:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <span
                            className={
                              password.length >= 8
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            ✓
                          </span>
                          At least 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <span
                            className={
                              /[A-Z]/.test(password)
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            ✓
                          </span>
                          One uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span
                            className={
                              /[a-z]/.test(password)
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            ✓
                          </span>
                          One lowercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span
                            className={
                              /[0-9]/.test(password)
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            ✓
                          </span>
                          One number
                        </li>
                      </ul>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                </>
              )}

              {/* Step 4: Success */}
              {step === "success" && (
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Password Reset Successful!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your password has been successfully reset. You can now log
                    in with your new password.
                  </p>
                  <p className="text-sm text-gray-500">
                    Redirecting to login page...
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-white/90 text-xs sm:text-sm flex items-center justify-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 mx-auto w-fit border border-white/20">
                <span>🔒</span>
                Secure password reset • SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
