import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/Logo SVG 1.png";
import { Link, useNavigate } from "react-router-dom";
import { authService, APIError } from "../../services/authService";
import { useToast, ToastContainer } from "../../component/Toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("=== Login Started ===");
    console.log("Email:", email);

    // Validate inputs
    if (!email || !password) {
      console.log("Validation failed: Empty fields");
      toast.error("Please enter both email and password");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      console.log("Validation failed: Invalid email");
      toast.error("Please enter a valid email address");
      return;
    }

    console.log("Validation passed, starting API call");
    setIsLoading(true);

    try {
      console.log("Calling authService.login...");
      const response = await authService.loginUser(email, password);

      console.log("Login response received:", response);
      toast.success(response.message || "Login successful!");

      // Save token
      if (response.token) {
        console.log("Saving token to localStorage");
        localStorage.setItem("authToken", response.token);
      }

      // Save user data
      if (response.user) {
        console.log("Saving user data to localStorage");
        localStorage.setItem("userData", JSON.stringify(response.user));
      }

      // Redirect to dashboard
      console.log("Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/user-dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login failed:", error);

      if (error instanceof APIError) {
        console.log("Showing API error:", error.message);
        toast.error(error.message);
      } else if (error instanceof Error) {
        console.log("Showing generic error:", error.message);
        toast.error(error.message);
      } else {
        console.log("Showing fallback error");
        toast.error("Login failed. Please try again.");
      }
    } finally {
      console.log("Setting loading to false");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
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
          {/* Gradient overlays for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-green-900/50 to-black/70"></div>
          <div className="absolute inset-0 backdrop-blur-[2px]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl  items-center">
            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 max-w-lg mx-auto">
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

                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-2xl text-center sm:text-3xl font-bold text-gray-900 mb-2">
                    Welcome Back! 👋
                  </h2>
                  <p className="text-gray-600 text-sm text-center sm:text-base">
                    Sign in to manage your delicious offerings
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-md">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="customername.com"
                        className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base hover:border-gray-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base hover:border-gray-300"
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

                  {/* Forgot Password */}
                  <div className="text-right">
                    <Link to="/forgot-password?type=user">
                      <button className="text-green-600 text-sm font-semibold hover:text-green-700 transition-colors hover:underline">
                        Forgot Password?
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition-all mt-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? "Logging in..." : "Sign In to Dashboard"}
                </button>
                
                {/* Sign Up Link */}
                <div className="text-center mt-6">
                  <p className="text-gray-600 text-sm sm:text-base">
                    New user?{" "}
                    <Link to="/signup">
                      <button className="text-green-600 font-bold hover:text-green-700 transition-colors hover:underline">
                        Create an account
                      </button>
                    </Link>
                  </p>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <Link to="/">
                  {/* Select Role Button */}
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-all text-sm sm:text-base border-2 border-gray-200 hover:border-gray-300">
                    ← Change Role
                  </button>
                </Link>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-white/90 text-xs sm:text-sm flex items-center justify-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 mx-auto w-fit border border-white/20">
                  <span>🔒</span>
                  Secure vendor access • SSL encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
