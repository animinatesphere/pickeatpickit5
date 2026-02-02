import { useState, useEffect } from "react";
import {
  User,
  Clock,
  Wallet,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Bell,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../component/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  secs: string;
  description: string;
}

interface UserProfile {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);

  const menuItems: MenuItem[] = [
    {
      icon: <User className="w-6 h-6" />,
      label: "Profile Settings",
      description: "Manage your personal information",
      secs: "/profile-edit",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: "Booking History",
      description: "View your past and active orders",
      secs: "/booking",
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      label: "Wallet & Payments",
      description: "Manage your funds and cards",
      secs: "/wallet",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      label: "Notifications",
      description: "Control your alerts and messages",
      secs: "/notification",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      label: "Security",
      description: "Passwords and two-factor auth",
      secs: "/device",
    },
    {
      icon: <HelpCircle className="w-6 h-6" />,
      label: "Help & Support",
      description: "Get assistance and read FAQs",
      secs: "/support",
    },
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await authService.getCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fullName = `${userProfile.firstname || ""} ${userProfile.lastname || ""}`.trim();
  const initials = (userProfile.firstname?.[0] || "U") + (userProfile.lastname?.[0] || "S");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 font-inter">
      <Navbar />
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto px-6 py-12 space-y-8"
          >
             <div className="h-64 w-full bg-gray-50 dark:bg-gray-900 rounded-[3rem] animate-pulse" />
             <div className="space-y-4">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="h-20 w-full bg-gray-50 dark:bg-gray-900 rounded-2xl animate-pulse" />
               ))}
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-6 py-12 pb-32"
          >
            {/* Cinematic Profile Header */}
            <div className="relative mb-16">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-3xl -z-10 rounded-full" />
              <div className="bg-white dark:bg-gray-900/50 backdrop-blur-2xl rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-3xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="w-24 h-24 text-green-500" />
                </div>
                
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative inline-block mb-8"
                >
                  <div className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <span className="text-5xl font-black text-white italic tracking-tighter uppercase">{initials}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-xl border-4 border-gray-50 dark:border-gray-800">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </div>
                </motion.div>

                <h1 className="text-4xl font-black italic tracking-tighter uppercase text-gray-800 dark:text-white mb-2">
                  {fullName || "Cinematic User"}
                </h1>
                <p className="text-gray-400 font-bold uppercase italic tracking-widest text-[10px] mb-6">
                  {userProfile.email || "premium@pickitpickeat.com"}
                </p>
                
                <div className="flex items-center justify-center gap-6">
                  <div className="px-6 py-2 bg-green-500/10 rounded-full border border-green-500/20 text-green-600 dark:text-green-400 font-black italic text-xs uppercase tracking-widest">
                    Verified Global Member
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
               {menuItems.map((item, index) => (
                 <motion.div
                   key={index}
                   initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.1 }}
                 >
                   <Link to={item.secs} className="block group">
                     <div className="bg-white dark:bg-gray-900/40 p-6 rounded-[2rem] border border-gray-50 dark:border-gray-800 hover:border-green-500/30 shadow-xl hover:shadow-2xl transition-all h-full flex items-center gap-6 relative overflow-hidden">
                       <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/80 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 shadow-inner group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                         {item.icon}
                       </div>
                       <div>
                         <h3 className="text-lg font-black italic tracking-tighter uppercase text-gray-800 dark:text-white leading-none mb-1">{item.label}</h3>
                         <p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-widest leading-tight">{item.description}</p>
                       </div>
                       <ChevronRight className="absolute right-6 w-5 h-5 text-gray-300 group-hover:text-green-500 group-hover:translate-x-2 transition-all" />
                     </div>
                   </Link>
                 </motion.div>
               ))}
            </div>

            {/* Logout Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center"
            >
              <button
                onClick={handleLogout}
                className="group relative px-12 py-5 bg-black dark:bg-white text-white dark:text-black rounded-3xl font-black italic uppercase tracking-tighter text-xl overflow-hidden active:scale-95 transition-all shadow-2xl"
              >
                <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-4">
                  Log Out Profile <LogOut className="w-6 h-6" />
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
