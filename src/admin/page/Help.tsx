import { useState } from "react";
import { Menu, Bell, AlertCircle, ChevronDown } from "lucide-react";

const Help: React.FC = () => {
  const [email, setEmail] = useState("customersupport@loopay.com");
  const [countryCode, setCountryCode] = useState("+234");
  const [phoneNumber, setPhoneNumber] = useState("9012456789");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const countryCodes = [
    { code: "+234", country: "Nigeria", flag: "🇳🇬" },
    { code: "+1", country: "USA", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
  ];

  const handleSave = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1000);
  };

  const selectedCountry = countryCodes.find((c) => c.code === countryCode);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-transparent dark:border-gray-800">
        <div className="animate-fadeIn min-h-screen">
          {/* Header */}
          <div className="bg-green-600 dark:bg-green-700 text-white p-6 sticky top-0 z-40 shadow-lg">
            <div className="flex justify-between items-center">
              <button className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-95">
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold font-inter italic tracking-tighter uppercase">Help & Support</h1>
              <button className="hover:bg-white/20 p-2 rounded-xl transition-all relative active:scale-95">
                <Bell size={24} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 dark:border-green-700 animate-pulse"></span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info Banner */}
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 dark:border-green-500 p-5 rounded-3xl flex gap-4 items-center animate-slideDown shadow-inner border dark:border-green-800/30">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <AlertCircle
                  className="text-green-600 dark:text-green-400 flex-shrink-0"
                  size={24}
                />
              </div>
              <p className="text-green-800 dark:text-green-300 text-sm font-bold font-inter italic tracking-tight uppercase">
                update support mail address and whatsapp contact
              </p>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500 text-green-800 dark:text-green-300 px-6 py-4 rounded-[2rem] animate-slideDown shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">✓</div>
                <div>
                  <p className="font-black font-inter tracking-tighter uppercase italic">Successfully saved!</p>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">Contact information updated.</p>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div
              className="space-y-3 animate-slideUp"
              style={{ animationDelay: "100ms" }}
            >
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1 italic">
                Support Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-5 py-4.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-gray-800 dark:text-gray-100 font-bold font-inter italic shadow-inner"
              />
            </div>

            {/* Phone Number Input */}
            <div
              className="space-y-3 animate-slideUp"
              style={{ animationDelay: "200ms" }}
            >
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1 italic">
                WhatsApp Contact
              </label>
              <div className="flex gap-4">
                {/* Country Code Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between gap-3 px-5 py-4.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all text-gray-800 dark:text-gray-100 font-bold font-inter italic shadow-inner min-w-[120px]"
                  >
                    <span>
                      {selectedCountry?.flag} {countryCode}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-500 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] z-50 animate-slideDown overflow-hidden">
                      <div className="max-h-80 overflow-y-auto no-scrollbar p-2">
                        {countryCodes.map((item) => (
                          <button
                            key={item.code}
                            onClick={() => {
                              setCountryCode(item.code);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-5 py-4 text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-all rounded-2xl flex items-center gap-4 group ${
                              countryCode === item.code
                                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <span className="text-2xl group-hover:scale-125 transition-transform">{item.flag}</span>
                            <span className="flex-1 font-bold font-inter tracking-tight">{item.country}</span>
                            <span className="font-mono text-sm font-black text-green-600 dark:text-green-500">
                              {item.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Number Input */}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter phone number"
                  className="flex-1 px-5 py-4.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-gray-800 dark:text-gray-100 font-bold font-inter italic shadow-inner"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-5 rounded-2xl font-black text-xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] animate-slideUp shadow-green-500/20 font-inter italic tracking-tighter uppercase ${
                isSaving
                  ? "bg-green-400 dark:bg-green-800 cursor-not-allowed"
                  : "bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600"
              } text-white`}
              style={{ animationDelay: "300ms" }}
            >
              {isSaving ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </div>
              ) : (
                "Save Information"
              )}
            </button>

            {/* Info Text */}
            <p
              className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic animate-slideUp"
              style={{ animationDelay: "400ms" }}
            >
              Make sure your contact information is accurate to receive premium support updating
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }

        .animate-spin {
          animation: spin 0.8s linear infinite;
        }

        /* Custom scrollbar for dropdown */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 5px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #16a34a;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Help;
