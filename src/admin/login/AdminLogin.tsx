import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo SVG 1.png";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";

export default function AdminLogin() {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    setIsLoading(true);

    // Check against hardcoded credentials
    if (email === "ogbonnajohn111@gmail.com" && password === "Happyhome2022") {
      setTimeout(() => {
        setIsLoading(false);
        window.location.href = "/admin-dashboard";
      }, 1500);
    } else {
      setIsLoading(false);
      toast.error("Invalid Admin Credentials", "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-4 relative overflow-hidden transition-colors duration-300">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-8 right-8 z-50 p-4 bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl text-gray-800 dark:text-gray-100 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
      >
        {theme === "dark" ? (
          <Sun className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform" />
        ) : (
          <Moon className="w-6 h-6 text-indigo-600 group-hover:-rotate-12 transition-transform" />
        )}
      </button>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 dark:bg-orange-900/20 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 dark:bg-amber-900/20 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-200 dark:bg-red-900/20 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-70 animate-pulse delay-500"></div>
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
                <h2 className="text-4xl font-black font-inter italic tracking-tighter uppercase">PickEATPickIT</h2>
              </div>
              <p className="text-xl text-white/80 font-inter italic font-medium">
                Manage your food delivery empire with ease
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="relative">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-white/20 dark:border-white/5 transform hover:scale-[1.02] transition-all duration-500">
            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center justify-center gap-4 mb-10">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <img
                  src={logo}
                  alt="PickEAT PickIT Logo"
                  className="w-16 h-16"
                />
              </div>

              <h2 className="text-3xl font-black font-inter italic tracking-tighter uppercase bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                PickEATPickIT
              </h2>
            </div>

            <div className="mb-10">
              <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100 mb-3 animate-fade-in font-inter italic tracking-tighter uppercase">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium font-inter italic">
                Login as Admin
              </p>
            </div>

            <div className="space-y-6">
              {/* Email Input */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 mb-3 uppercase tracking-widest italic ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 dark:text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-4 py-5 bg-gray-50/50 dark:bg-black/20 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-black transition-all duration-300 text-gray-800 dark:text-white font-inter"
                    placeholder="admin@fooddash.com"
                    required
                  />
                </div>
              </div>
 
              {/* Password Input */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 mb-3 uppercase tracking-widest italic ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 dark:text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 bg-gray-50/50 dark:bg-black/20 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-black transition-all duration-300 text-gray-800 dark:text-white font-inter"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between font-inter">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-orange-500 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-bold uppercase italic tracking-widest group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm font-bold text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-all uppercase italic tracking-widest"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <Link to="/admin-dashboard">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black py-5 px-6 rounded-2xl hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase italic tracking-tighter text-lg"
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
              </Link>
            </div>

            {/* Divider */}
            <div className="mt-10 flex items-center">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-800"></div>
              <span className="px-5 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] italic">
                Or continue with
              </span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-800"></div>
            </div>

            {/* Social Login */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-4 px-4 bg-white dark:bg-gray-800/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 active:scale-95 group">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase italic tracking-widest transition-colors">
                  Google
                </span>
              </button>
              <button className="flex items-center justify-center gap-2 py-4 px-4 bg-white dark:bg-gray-800/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 active:scale-95 group">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase italic tracking-widest transition-colors">
                  Facebook
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
