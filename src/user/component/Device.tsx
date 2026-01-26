import React, { useState, useEffect } from "react";
import { ArrowLeft, Smartphone, Monitor, Clock } from "lucide-react";
import { Navbar } from "../../component/Navbar";

interface Device {
  id: number;
  name: string;
  lastSeen: string;
  isActive: boolean;
  icon: "smartphone" | "tablet";
}

const Device: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredDevice, setHoveredDevice] = useState<number | null>(null);

  const devices: Device[] = [
    {
      id: 1,
      name: "iPhone XS Max",
      lastSeen: "NOW",
      isActive: true,
      icon: "smartphone",
    },
    {
      id: 2,
      name: "Samsung S20",
      lastSeen: "Yesterday, 5:20pm",
      isActive: false,
      icon: "smartphone",
    },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <Navbar />
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 sm:h-20">
            <button className="text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title Section */}
        <div
          className={`mb-8 sm:mb-10 transform transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-3">
            Devices and Sessions
          </h1>
          <p className="text-gray-600 text-sm sm:text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-600" />
            Manage your active sessions and devices
          </p>
        </div>

        {/* Devices List */}
        <div className="space-y-4 sm:space-y-5">
          {devices.map((device, index) => (
            <div
              key={device.id}
              className={`transform transition-all duration-700 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
              onMouseEnter={() => setHoveredDevice(device.id)}
              onMouseLeave={() => setHoveredDevice(null)}
            >
              <div
                className={`bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 ${
                  device.isActive
                    ? "border-green-200 hover:border-green-300"
                    : "border-gray-100 hover:border-gray-200"
                } ${
                  hoveredDevice === device.id
                    ? "transform -translate-y-1 scale-[1.02]"
                    : ""
                }`}
              >
                <div className="p-5 sm:p-6 lg:p-8 flex items-center gap-4 sm:gap-6 relative overflow-hidden">
                  {/* Animated Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${
                      device.isActive
                        ? "from-green-50/50 to-emerald-50/50"
                        : "from-gray-50/30 to-slate-50/30"
                    } transition-opacity duration-500 ${
                      hoveredDevice === device.id ? "opacity-100" : "opacity-0"
                    }`}
                  ></div>

                  {/* Device Icon */}
                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                        device.isActive
                          ? "bg-gradient-to-br from-green-500 to-emerald-600"
                          : "bg-gradient-to-br from-gray-400 to-slate-500"
                      } ${
                        hoveredDevice === device.id ? "scale-110 rotate-3" : ""
                      }`}
                    >
                      <Smartphone
                        className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                        strokeWidth={2}
                      />
                    </div>

                    {/* Status Indicator */}
                    {device.isActive && (
                      <div className="absolute -top-1 -right-1 flex items-center justify-center">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                        <div className="absolute w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full animate-ping"></div>
                      </div>
                    )}
                  </div>

                  {/* Device Info */}
                  <div className="flex-1 relative z-10 min-w-0">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2 truncate">
                      {device.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500">
                        Last seen -
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          device.isActive ? "text-green-600" : "text-gray-700"
                        }`}
                      >
                        {device.lastSeen}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="relative z-10">
                    <button
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        device.isActive
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } hover:scale-110 active:scale-95 shadow-md hover:shadow-lg`}
                    >
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Bottom Border Accent */}
                {device.isActive && (
                  <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 animate-gradient"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div
          className={`mt-8 sm:mt-12 transform transition-all duration-700 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border-2 border-blue-100">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                  Security Tip
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  If you see a device you don't recognize, secure your account
                  immediately by changing your password and logging out of all
                  sessions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div
          className={`mt-8 sm:mt-12 grid grid-cols-2 gap-4 sm:gap-6 transform transition-all duration-700 delay-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {devices.filter((d) => d.isActive).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Active Session
              {devices.filter((d) => d.isActive).length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent mb-2">
              {devices.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Total Device{devices.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Device;
