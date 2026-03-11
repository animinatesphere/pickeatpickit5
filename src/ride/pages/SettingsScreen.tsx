import { useState } from "react";
import { ChevronRight, LogOut, Trash2, Book, Lock } from "lucide-react";
import { RiderNav } from "../component/RiderNav";
import { supabase } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function SettingsScreen() {
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/rider-login");
  };

  const menuItems = [
    {
      id: 1,
      title: "Riders Handbook",
      icon: <Book className="w-5 h-5" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      action: <ChevronRight className="w-5 h-5 text-gray-400" />,
    },
    {
      id: 2,
      title: "Reset PIN",
      icon: <Lock className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      action: <ChevronRight className="w-5 h-5 text-gray-400" />,
    },
    {
      id: 3,
      title: "Log Out",
      icon: <LogOut className="w-5 h-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      action: <LogOut className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 4,
      title: "Delete Account",
      icon: <Trash2 className="w-5 h-5" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
      action: <Trash2 className="w-5 h-5 text-red-600" />,
      danger: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <RiderNav />
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center">
          <button className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
              className={`
                group relative bg-white rounded-2xl shadow-sm border border-gray-200
                hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
                transition-all duration-300 ease-out cursor-pointer overflow-hidden
                ${activeItem === item.id ? "ring-2 ring-offset-2" : ""}
                ${item.danger ? "hover:ring-red-300" : "hover:ring-emerald-300"}
              `}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "slideIn 0.5s ease-out forwards",
                opacity: 0,
              }}
            >
              {/* Gradient overlay on hover */}
              <div
                className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${
                  item.danger
                    ? "bg-gradient-to-r from-red-50 to-pink-50"
                    : "bg-gradient-to-r from-emerald-50 to-teal-50"
                }
              `}
              />

              <div
                className="relative flex items-center justify-between p-5"
                onClick={() => {
                  if (item.title === "Log Out") handleLogout();
                }}
              >
                <div className="flex items-center space-x-4">
                  {/* Icon container */}
                  <div
                    className={`
                    ${item.bgColor} ${item.color} p-3 rounded-xl
                    group-hover:scale-110 group-hover:rotate-6
                    transition-all duration-300
                  `}
                  >
                    {item.icon}
                  </div>

                  {/* Title */}
                  <span
                    className={`
                    text-lg font-semibold
                    ${item.danger ? "text-red-700" : "text-gray-800"}
                    group-hover:translate-x-2 transition-transform duration-300
                  `}
                  >
                    {item.title}
                  </span>
                </div>

                {/* Action icon */}
                <div className="group-hover:translate-x-1 transition-transform duration-300">
                  {item.action}
                </div>
              </div>

              {/* Bottom border accent */}
              <div
                className={`
                h-1 w-0 group-hover:w-full transition-all duration-500
                ${
                  item.danger
                    ? "bg-gradient-to-r from-red-400 to-pink-400"
                    : "bg-gradient-to-r from-emerald-400 to-teal-400"
                }
              `}
              />
            </div>
          ))}
        </div>

        {/* Info card */}
        <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-sm">
          <p className="text-sm text-gray-600 text-center">
            Need help? Contact our support team anytime
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
