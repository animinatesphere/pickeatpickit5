import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Trophy,
  DollarSign,
  Bell,
  Monitor,
  HelpCircle,
  LogOut,
  Loader2,
} from "lucide-react";
import { RiderNav } from "../component/RiderNav";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/authService";

const ProfileScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [riderData, setRiderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRiderProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/rider-login");
          return;
        }

        const { data: rider, error } = await supabase
          .from("riders")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) throw error;
        setRiderData(rider);
      } catch (err) {
        console.error("Error fetching rider profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRiderProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/rider-login");
  };

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      color: "text-green-600",
      bgColor: "bg-green-50",
      sec: "/rider-profilesetting",
    },
    {
      icon: Trophy,
      label: "Daily rider Game",
      color: "text-green-600",
      bgColor: "bg-green-50",
      sec: "/daily-rider",
    },
    {
      icon: DollarSign,
      label: "Earning and Payment",
      color: "text-green-600",
      bgColor: "bg-green-50",
      sec: "/rider-earning",
    },
  ];

  const settingsItems = [
    { icon: Monitor, label: "Devices and Session", sec2: "/rider-device" },
    { icon: HelpCircle, label: "Support", sec2: "/rider-support" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        <RiderNav />
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-transparent to-green-600/10 animate-pulse pointer-events-none" />

        {/* Header */}
        <div className="relative bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="w-8" />
          <h1 className="text-xl font-bold text-gray-800 animate-fade-in">
            Profile
          </h1>
          <Link to="/rider-settings">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:rotate-90 transform">
              <Settings className="w-6 h-6 text-gray-700" />
            </button>
          </Link>
        </div>

        {/* Profile Section */}
        <div className="relative px-6 pt-8 pb-6 text-center">
          <div className="relative inline-block animate-float">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse" />
            <img
              src={riderData?.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl relative z-10 hover:scale-110 transition-transform duration-300"
            />
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 ${riderData?.is_active ? "bg-green-500" : "bg-gray-400"} rounded-full border-4 border-white z-20 animate-bounce`} />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-4 animate-slide-up uppercase italic tracking-tighter">
            {riderData ? `${riderData.firstname} ${riderData.lastname}` : "Unidentified Operative"}
          </h2>
          <p
            className="text-gray-500 text-sm mt-1 animate-slide-up font-medium"
            style={{ animationDelay: "0.1s" }}
          >
            {riderData?.email || "No email signal"}
          </p>
          <p
            className="text-green-600 font-black text-sm mt-1 animate-slide-up italic tracking-widest"
            style={{ animationDelay: "0.2s" }}
          >
            {riderData?.phone || "NO SOS CONTACT"}
          </p>
        </div>

        {/* Menu Items */}
        <div className="px-6 space-y-3">
          {menuItems.map((item, index) => (
            <Link key={item.label} to={item.sec} className="block w-full">
              <button
                className="w-full flex items-center gap-4 p-4 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-white rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md border border-gray-100 animate-slide-up"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div
                  className={`${item.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-gray-800 font-bold italic uppercase tracking-widest text-xs flex-1 text-left">
                  {item.label}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </Link>
          ))}
        </div>

        {/* Notifications Toggle */}
        <div
          className="px-6 mt-6 animate-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-50 p-3 rounded-xl">
                  <Bell className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-gray-800 font-bold italic uppercase tracking-widest text-xs">
                  Network Alerts
                </span>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                  notificationsEnabled ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    notificationsEnabled ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Items */}
        <div className="px-6 mt-3 space-y-3">
          {settingsItems.map((item, index) => (
            <Link key={item.label} to={item.sec2} className="block w-full">
              <button
                className="w-full flex items-center gap-4 p-4 bg-white hover:bg-gray-50 rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md border border-gray-100 animate-slide-up"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                <div className="bg-gray-50 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-gray-800 font-bold italic uppercase tracking-widest text-xs flex-1 text-left">
                  {item.label}
                </span>
              </button>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div
          className="px-6 mt-6 pb-24 animate-slide-up"
          style={{ animationDelay: "0.9s" }}
        >
          <button 
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black italic uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
          >
            <span>Disconnect</span>
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-slide-up { animation: slide-up 0.6s ease-out forwards; opacity: 0; }
          .animate-fade-in { animation: fade-in 0.6s ease-out; }
        `}</style>
      </div>
    </div>
  );
};

export default ProfileScreen;
