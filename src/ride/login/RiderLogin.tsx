import { useState } from "react";
import {
  Bike,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function RiderLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    // Clear previous errors
    setError("");

    // Validation
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Call the loginRider API
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
              content: `Simulate rider login for email: ${email}. Return only valid JSON:
              If approved rider: {"success": true, "message": "Login successful!", "user": {"id": "123", "email": "${email}", "status": "approved"}, "token": "mock_token_abc123"}
              If pending rider: {"success": false, "message": "Your application is still under review. Please wait for approval.", "status": 403}
              If not found: {"success": false, "message": "Rider account not found. Please register first.", "status": 404}
              If wrong password: {"success": false, "message": "Invalid email or password", "status": 401}`,
            },
          ],
        }),
      });

      const data = await response.json();

      // Parse the response
      let result;
      try {
        const content = data.content[0]?.text || "{}";
        result = JSON.parse(content);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        throw new Error("Failed to parse response");
      }

      if (result.success) {
        // Store token if remember me is checked
        if (rememberMe && result.token) {
          // In real implementation, store in secure storage
          console.log("Storing token:", result.token);
        }

        // Show success message
        alert(
          "Login successful! Welcome back, " + (result.user?.email || "Rider"),
        );

        // Redirect to rider dashboard
        window.location.href = "/rider-dashboard";
      } else {
        // Show error message
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=2071)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-900/70 to-black/80" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "700ms" }}
        />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md transform transition-all duration-500 hover:scale-105">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo/Icon Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl">
                <Bike className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Rider Login
            </h1>
            <p className="text-gray-600">
              Sign in to start your delivery shift
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-5">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors duration-300" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors duration-300" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors duration-300"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                  disabled={isLoading}
                />
                <span className="ml-2 text-gray-600 group-hover:text-gray-800 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                onClick={() => alert("Password reset feature coming soon!")}
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Support Contact */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact{" "}
              <button
                onClick={() => alert("Support: support@delivery.com")}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Rider Support
              </button>
            </p>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center">
          <p className="text-white text-sm drop-shadow-lg">
            Don't have an account?{" "}
            <button
              onClick={() => (window.location.href = "/rider-registration")}
              className="font-semibold hover:underline"
            >
              Apply to become a rider
            </button>
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
