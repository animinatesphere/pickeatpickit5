import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/Logo SVG 1.png";
import { authService, APIError } from "../services/authService";
import { useToast, ToastContainer } from "../component/Toast";

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

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    // Supabase will redirect here with access_token and refresh_token
    const accessToken = searchParams.get("access_token");
    if (!accessToken) {
      toast.error("Invalid or expired reset link");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [searchParams, navigate, toast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
      // The resetPassword method uses the current session from Supabase
      // which was set when the user clicked the reset link
      await authService.resetPassword("", "", password);
      toast.success("Password reset successfully!");
      setResetSuccess(true);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit(e as any);
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

              {!resetSuccess ? (
                <>
                  {/* Header */}
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
                      Reset Your Password
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base text-center">
                      Enter your new password below
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password Input */}
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

                    {/* Confirm Password Input */}
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

                    {/* Password Requirements */}
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

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* Success State */}
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
                </>
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

export default ResetPassword;
