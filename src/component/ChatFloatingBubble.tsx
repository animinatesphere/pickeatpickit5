import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../services/authService";
import { getConversations } from "../services/api";

export const ChatFloatingBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();

  // Don't show on login/signup pages or the main inbox pages to avoid clutter
  const hideOnPaths = ["/login", "/signup", "/vendor-login", "/vendor-signup", "/rider-login", "/inbox", "/vendor-chat", "/admin-login", "/forgot-password"];
  const shouldHide = hideOnPaths.includes(location.pathname) || location.pathname.startsWith("/admin");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          fetchUnreadCount(session.user.id);
        } else {
          setUserId(null);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    checkUser();
  }, [location.pathname]);

  const fetchUnreadCount = async (id: string) => {
    try {
      const { data } = await getConversations(id);
      if (data) {
        // Simplified: in a real app, query unread count from participation table
        setUnreadCount(0); 
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  if (shouldHide || !userId) return null;

  const getInboxPath = () => {
    if (location.pathname.startsWith("/vendor")) return "/vendor-chat";
    if (location.pathname.startsWith("/rider")) return "/inbox"; // We'll map /inbox to ChatApp
    return "/inbox";
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-24 right-0 w-80 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <MessageCircle size={100} />
                </div>
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <h3 className="font-black italic uppercase tracking-tighter text-2xl">Operational Intel</h3>
                  <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest mt-1">Real-time Comms Active</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 bg-gray-50/50">
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300 border border-gray-50">
                  <MessageCircle className="text-green-600 w-12 h-12" />
                </div>
                <h4 className="font-black italic uppercase text-gray-800 text-lg tracking-tight">Need Support?</h4>
                <p className="text-xs text-gray-400 mt-3 font-bold leading-relaxed">Connect with vendors, riders, and support staff over a secure channel.</p>
                
                <Link 
                  to={getInboxPath()}
                  onClick={() => setIsOpen(false)}
                  className="mt-8 w-full py-5 bg-green-600 text-white rounded-2xl font-black italic uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 active:scale-95"
                >
                  <Send size={16} /> Open Secure Channel
                </Link>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-100">
              <div className="flex items-center justify-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">System Online: Encrypted Connection</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 bg-green-700 text-white rounded-[2rem] shadow-2xl flex items-center justify-center relative hover:bg-green-800 transition-all group border-4 border-white"
      >
        {isOpen ? (
            <X size={32} />
        ) : (
            <div className="relative">
                <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute -top-4 -right-4 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white shadow-lg">
                        {unreadCount}
                    </span>
                )}
            </div>
        )}
      </motion.button>
    </div>
  );
};
