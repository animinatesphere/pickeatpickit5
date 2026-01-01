// import React from 'react'
import logo from "../../assets/Logo SVG 1.png";
import { useState } from "react";
import { Eye, EyeOff, ChevronDown, Camera, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../component/button";
import { useToast, ToastContainer } from "../../component/Toast";
// import { apiService } from "../../services/api.service";
import { useApi } from "../../hooks/useApi";
import { apiService } from "../../services/authService";
import type { RegisterResponse } from "../../types/api.types";
// Add this type definition at the top of your file
type NavigateFunction = (page: string) => void;

interface PageProps {
  onNavigate: NavigateFunction;
}
const SignUpPage = ({ onNavigate }: PageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Add toast hook
  const toast = useToast();
  const { loading, error, execute } = useApi<RegisterResponse>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async () => {
    // Validation with toast notifications
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (
      !formData.fullname ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation
    if (formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      const response = await execute(() =>
        apiService.register({
          fullname: formData.fullname,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        })
      );

      if (response.success) {
        toast.success("Registration successful! 🎉");

        // Wait a bit for user to see the success message
        setTimeout(() => {
          onNavigate("profile1");
        }, 1500);
      }
    } catch (err) {
      console.error("Registration error:", err);
      // The error is already handled by useApi hook
      // But you can add additional toast notification
      toast.error(error || "Registration failed. Please try again.");
    }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-6 py-8">
          {/* {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )} */}
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="" />
            <h1 className="text-green-600 font-bold text-xl">PickEAT PickIT</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Personal Info
            </h2>
            <p className="text-[#494949] font-normal text-sm">
              To continue, kindly complete the following fields.
            </p>
          </div>

          <div className="space-y-4 mb-6">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                placeholder="Full name"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E-mail address"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone number"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

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
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

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
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Retype Password"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-[#494949] font-semibold text-sm">
              Already have an account?{" "}
              <Link to="/vendor-login">
                <button className=" cursor-pointer text-[#494949] font-extrabold hover:text-green-600">
                  Sign in
                </button>
              </Link>
            </p>
          </div>

          <div className="flex justify-end mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#000000]"
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

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors cursor-pointer "
            onClick={handleSignUp}
            disabled={loading}
            // onClick={() => onNavigate("profile1")}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <Link to="/">
            <div className="flex items-center justify-center mt-2 cursor-pointer">
              <Button text="Select Role" />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

const ForgotPasswordPage = ({ onNavigate }: PageProps) => {
  const [email, setEmail] = useState("");
  const { loading, error, execute } = useApi();

  const handleSendOTP = async () => {
    // Validation
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      await execute(() => apiService.forgotPassword(email));
      alert("OTP sent to your email!");
      onNavigate("pin");
    } catch (err) {
      console.error("Error:", err);
      // Error is already displayed via the error state
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="flex flex-col items-center mb-16">
          <img src={logo} alt="" />
          <h1 className="text-green-600 font-bold text-xl">PickEAT PickIT</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-600 text-sm">
            To continue, kindly enter your email address
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="relative mb-8">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
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
            placeholder="E-mail address"
            className="w-full pl-16 pr-4 py-3.5 border border-gray-300 rounded-lg text-green-600 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors mb-32 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSendOTP}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send One Time Pass"}
        </button>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-gray-900 font-semibold hover:text-green-600"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const ConfirmPinPage = ({ onNavigate }: PageProps) => {
  const [pin, setPin] = useState(["", "", "", ""]);

  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      if (value && index < 3) {
        document.getElementById(`pin-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  };
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="flex flex-col items-center mb-16">
          <img src={logo} alt="" />
          <h1 className="text-green-600 font-bold text-xl">PickEAT PickIT</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Pin</h2>
          <p className="text-gray-600 text-sm">
            To continue, kindly enter your emmail address
          </p>
        </div>

        <div className="relative mb-12">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
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
          <div className="pl-16 pr-4 py-3.5 border border-gray-300 rounded-lg">
            <span className="text-green-600 font-medium">E-mail address</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-center gap-4 mb-4">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="text"
                maxLength={1}
                value={pin[index]}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-semibold border-b-2 border-gray-300 focus:border-green-600 focus:outline-none transition-colors"
              />
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm">
            Enter the Four Digit code sent
            <br />
            to your email
          </p>
        </div>

        <button
          onClick={() => onNavigate("profile1")}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors mt-12"
        >
          Done
        </button>
      </div>
    </div>
  );
};

const CreateProfile1 = ({ onNavigate }: PageProps) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className=" px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create Profile</h2>
          <button className="text-green-600 font-semibold text-sm">Skip</button>
        </div>

        <div className="bg-blue-50 border-l-4 border-yellow-500 p-3 mb-6 flex items-start gap-2">
          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="text-green-600 text-sm">
            Please Kindly provide the correct info below
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Business Name*"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="How do you want to address?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Full Name*"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
          <div className="relative">
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
              <option>Years of Experience</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-yellow-500 p-3 mb-6 flex items-start gap-2">
          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="text-green-600 text-sm">
            All necessary info will be sent to business contact provided below
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <input
            type="email"
            placeholder="Business mail*"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
          <div className="relative">
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
              <option>Select country region(Nigeria)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="+234"
              className="w-20 px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
            <div className="relative flex-1">
              <input
                type="tel"
                placeholder="Business Phone number*"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <input
            type="text"
            placeholder="Business address*"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        <div className="bg-blue-50 border-l-4 border-yellow-500 p-3 mb-6 flex items-start gap-2">
          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="text-green-600 text-sm">
            All details you provided must be true, accurate and non-misleading.
            In the event you provided wrong information, you shall be held
            liable for such misconduct
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
              <option>Profession*</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
              <option>Vendor type*</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
              <option>You work alone? - YES</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-yellow-500 p-3 mb-6 flex items-start gap-2">
          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="text-green-600 text-sm">
            In order to make points and benefits from PickEat Pickit please
            enter your membership ID
          </p>
        </div>

        <input
          type="text"
          placeholder="Membership ID/Promo Code"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent mb-4"
        />

        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-600"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I understand and agree with the{" "}
            <span className="font-semibold">Terms</span> and{" "}
            <span className="font-semibold">Conditions</span>
          </label>
        </div>

        <button
          onClick={() => onNavigate("profile2")}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const CreateProfile2 = ({ onNavigate }: PageProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => onNavigate("profile1")}>
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Create Profile</h2>
          <button className="text-green-600 font-semibold text-sm">Skip</button>
        </div>

        <div className="bg-white rounded-lg p-6 mb-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex flex-col items-center justify-center flex-shrink-0">
              <Camera className="w-8 h-8 text-green-600 mb-1" />
              <span className="text-xs text-gray-600">Upload</span>
              <span className="text-xs text-gray-600">Store Image</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Mr. Moe's Kitchen</h3>
              <p className="text-green-600 text-sm">Restaurant</p>
              <p className="text-gray-600 text-sm mt-2">
                Creativeomotayo@gmail.com
              </p>
              <p className="text-gray-600 text-sm">+234 906 3287 855</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-4">
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex flex-col items-center justify-center mb-2">
              <Camera className="w-8 h-8 text-green-600 mb-1" />
              <span className="text-xs text-gray-600">Upload</span>
              <span className="text-xs text-gray-600">Cover Photo</span>
            </div>
            <h3 className="text-green-600 font-semibold mb-1">
              Upload store cover photo
            </h3>
            <p className="text-xs text-gray-500 text-center">Allowed formats</p>
            <p className="text-xs text-gray-500">• Jpeg</p>
            <p className="text-xs text-gray-500">• Png</p>
            <p className="text-xs text-gray-500 mt-1">Less than 1mb</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-4">
          <div className="border-b-2 border-green-600 pb-2 mb-4">
            <h3 className="text-green-600 font-semibold">
              Business Description
            </h3>
          </div>
          <p className="text-gray-500 text-sm">Kindly Provide details below</p>
        </div>

        <div className="bg-white rounded-lg p-6 mb-4">
          <div className="border-b-2 border-green-600 pb-2 mb-4">
            <h3 className="text-green-600 font-semibold">Additional Info</h3>
          </div>
          <p className="text-gray-500 text-sm">
            Please provide additional details if need be
          </p>
        </div>

        <button
          onClick={() => onNavigate("availability")}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const SetAvailability = ({ onNavigate }: PageProps) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className=" px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => onNavigate("profile2")}>
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Set Availability</h2>
          <button className="text-green-600 font-semibold text-sm">Skip</button>
        </div>

        <div className="bg-green-600 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-1 block">From</label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-white border border-white rounded-lg text-green-600 font-semibold appearance-none focus:outline-none">
                  <option>Monday</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-1 block">To</label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-white border border-white rounded-lg text-green-600 font-semibold appearance-none focus:outline-none">
                  <option>Friday</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-1 block">
                Available during Holidays
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-white border border-white rounded-lg text-green-600 font-semibold appearance-none focus:outline-none">
                  <option>Yes, I'm available</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-white text-sm mb-1 block">
                  Time Start
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white border border-white rounded-lg text-green-600 font-semibold appearance-none focus:outline-none">
                    <option>10:00 am</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1">
                <label className="text-white text-sm mb-1 block">
                  Time End
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white border border-white rounded-lg text-green-600 font-semibold appearance-none focus:outline-none">
                    <option>6:00 pm</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-1 block">
                Total Number of Workers
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-white border border-white rounded-lg text-green-600 font-semibold appearance-none focus:outline-none">
                  <option>5 People</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            id="terms2"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-600"
          />
          <label htmlFor="terms2" className="text-sm text-gray-700">
            I understand and agree with the{" "}
            <span className="font-semibold">Terms</span> and{" "}
            <span className="font-semibold">Conditions</span>
          </label>
        </div>

        <button
          onClick={() => onNavigate("success")}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-between px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mt-8">
          You're all set up
        </h1>

        <div className="relative w-full max-w-sm">
          <svg className="w-full" viewBox="0 0 300 300" fill="none">
            <ellipse cx="80" cy="260" rx="40" ry="8" fill="#E5E7EB" />

            <rect x="60" y="220" width="40" height="40" fill="#22C55E" rx="4" />

            <circle cx="75" cy="200" r="15" fill="#1F2937" />

            <path
              d="M75 180 Q70 190 75 200"
              stroke="#1F2937"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M75 200 L70 220"
              stroke="#1F2937"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M75 200 L80 220"
              stroke="#1F2937"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M70 220 L65 240"
              stroke="#1F2937"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M80 220 L85 240"
              stroke="#1F2937"
              strokeWidth="8"
              strokeLinecap="round"
            />

            <rect
              x="180"
              y="100"
              width="80"
              height="100"
              fill="white"
              stroke="#D1D5DB"
              strokeWidth="2"
              rx="4"
            />
            <rect x="190" y="110" width="60" height="8" fill="#22C55E" rx="2" />
            <rect x="190" y="125" width="60" height="4" fill="#E5E7EB" rx="2" />
            <rect x="190" y="132" width="60" height="4" fill="#E5E7EB" rx="2" />
            <rect x="190" y="139" width="60" height="4" fill="#E5E7EB" rx="2" />
            <circle cx="270" cy="90" r="12" fill="#22C55E" />
            <path
              d="M265 90 L268 93 L275 86"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            <rect
              x="150"
              y="190"
              width="80"
              height="100"
              fill="white"
              stroke="#D1D5DB"
              strokeWidth="2"
              rx="4"
            />
            <rect x="160" y="200" width="60" height="8" fill="#E5E7EB" rx="2" />
            <rect x="160" y="215" width="60" height="4" fill="#E5E7EB" rx="2" />
            <rect x="160" y="222" width="60" height="4" fill="#E5E7EB" rx="2" />
            <rect x="160" y="229" width="60" height="4" fill="#E5E7EB" rx="2" />
            <circle cx="240" cy="180" r="12" fill="#1F2937" />
            <path
              d="M235 180 L238 183 L245 176"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            <rect
              x="230"
              y="230"
              width="80"
              height="100"
              fill="white"
              stroke="#D1D5DB"
              strokeWidth="2"
              rx="4"
            />
            <rect x="240" y="240" width="60" height="8" fill="#E5E7EB" rx="2" />
            <rect x="240" y="255" width="60" height="4" fill="#E5E7EB" rx="2" />
            <rect x="240" y="262" width="60" height="4" fill="#E5E7EB" rx="2" />
            <rect x="240" y="269" width="60" height="4" fill="#E5E7EB" rx="2" />
            <circle cx="320" cy="220" r="12" fill="#1F2937" />
            <path
              d="M315 220 L318 223 L325 216"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        <div className="w-full max-w-sm">
          <p className="text-center text-gray-600 mb-8">
            We'll notify you via mail or text message when your application has
            been approved.
          </p>
          <Link to="/vendor-login">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors">
              Done
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const VendorSignup = () => {
  const [currentPage, setCurrentPage] = useState("signup");

  const renderPage = () => {
    switch (currentPage) {
      case "signup":
        return <SignUpPage onNavigate={setCurrentPage} />;

      case "forgot":
        return <ForgotPasswordPage onNavigate={setCurrentPage} />;
      case "pin":
        return <ConfirmPinPage onNavigate={setCurrentPage} />;
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

  return <div className="font-sans">{renderPage()}</div>;
};

export default VendorSignup;
