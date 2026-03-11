import { useState } from "react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import logo from "../../assets/Logo SVG 1.png";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password", "Login Failed");
      return;
    }
    setIsLoading(true);

    if (email === "ogbonnajohn111@gmail.com" && password === "Happyhome2022") {
      setTimeout(() => {
        setIsLoading(false);
        navigate("/admin-dashboard");
      }, 1500);
    } else {
      setIsLoading(false);
      toast.error("Invalid Admin Credentials", "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden transition-colors duration-300">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Image */}
        <div className="hidden lg:block relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-2xl"></div>
          <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500 border border-white/20">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
              alt="Food delivery"
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <img
                    src={logo}
                    alt="PickEAT PickIT Logo"
                    className="w-16 h-16"
                  />
                </div>
                <h2 className="text-4xl font-black font-inter tracking-tighter uppercase">
                  PickEATPickIT
                </h2>
              </div>
              <p className="text-xl text-white/80 font-inter font-medium">
                Manage your food delivery empire with ease
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="relative">
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-6 sm:p-8 md:p-12 border border-white/20 transform hover:scale-[1.02] transition-all duration-500">
            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center justify-center gap-4 mb-8 sm:mb-10">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <img
                  src={logo}
                  alt="PickEAT PickIT Logo"
                  className="w-14 h-14 sm:w-16 sm:h-16"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-inter tracking-tighter uppercase bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                PickEATPickIT
              </h2>
            </div>
            <div className="mb-8 sm:mb-10">
              <h1 className="text-2xl sm:text-4xl font-black text-gray-800 mb-2 sm:mb-3 animate-fade-in font-inter tracking-tighter uppercase">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-base sm:text-lg font-medium font-inter">
                Login as Admin
              </p>
            </div>

            <div className="space-y-6">
              {/* Email Input */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-4 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all duration-300 text-gray-800 font-inter"
                    placeholder="admin@fooddash.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all duration-300 text-gray-800 font-inter"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center hover:text-orange-500 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between font-inter">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-600 font-bold uppercase tracking-widest group-hover:text-gray-800 transition-colors">
                    Remember me
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black py-5 px-6 rounded-2xl hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Login Now"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
