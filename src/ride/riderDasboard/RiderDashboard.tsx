import { useState, useEffect } from "react";
import {
  Bell,
  ChevronRight,
  Calendar,
  Package,
  TrendingUp,
  Eye,
  Bike,
  Clock,
  Star,
  Loader2,
} from "lucide-react";
import { RiderNav } from "../component/RiderNav";
import { Link } from "react-router-dom";
import { supabase } from "../../services/authService";
import { getRiderStats } from "../../services/api";

export default function RiderDashboard() {
  const [activeStatus, setActiveStatus] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [riderId, setRiderId] = useState<string | null>(null);

  useEffect(() => {
    async function initDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: rider } = await supabase
          .from('riders')
          .select('id, is_active')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (rider) {
          setRiderId(rider.id);
          setActiveStatus(rider.is_active ?? true);
          try {
            const riderStats = await getRiderStats(rider.id);
            setStats(riderStats);
          } catch (err) {
            console.error("Error fetching rider stats", err);
          }
        }
      }
      setLoading(false);
    }
    initDashboard();
  }, []);

  const toggleStatus = async () => {
    if (!riderId) return;
    const newStatus = !activeStatus;
    setActiveStatus(newStatus);
    // Optional: update DB if column exists
    await supabase.from('riders').update({ is_active: newStatus }).eq('id', riderId);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-inter">
      <RiderNav />
      <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 transition-all">
        <h1 className="text-xl font-bold text-gray-800 italic uppercase tracking-tighter">My Dashboard</h1>
        <Link to="/rider-notifications">
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </Link>
      </div>

      <div className="px-6 py-6 space-y-4 max-w-5xl mx-auto animate-fadeIn">
        {/* Active Status Toggle */}
        <div className={`rounded-2xl p-5 shadow-xl border transition-all duration-500 ${activeStatus ? "bg-white border-green-100" : "bg-gray-100 border-gray-200"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl shadow-inner transition-colors duration-500 ${activeStatus ? "bg-green-100" : "bg-gray-200"}`}>
                <Bike className={`w-6 h-6 ${activeStatus ? "text-green-600" : "text-gray-400"}`} />
              </div>
              <div>
                <span className={`font-black text-lg block italic uppercase tracking-tighter ${activeStatus ? "text-green-600" : "text-gray-500"}`}>
                  {activeStatus ? "RECRUIT ACTIVE" : "SIGNAL OFFLINE"}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                  {activeStatus ? "Available for deployment" : "Disconnected from network"}
                </span>
              </div>
            </div>
            <button onClick={toggleStatus} className={`relative w-16 h-8 rounded-full transition-all duration-500 shadow-inner ${activeStatus ? "bg-green-500" : "bg-gray-400"}`}>
              <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500 flex items-center justify-center ${activeStatus ? "translate-x-8" : "translate-x-0"}`}>
                <div className={`w-2 h-2 rounded-full ${activeStatus ? "bg-green-500" : "bg-gray-300"}`}></div>
              </span>
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 w-fit shadow-md border border-gray-100 hover:scale-105 transition-transform cursor-pointer">
          <Calendar className="w-5 h-5 text-green-600" />
          <span className="font-black text-gray-800 text-xs italic uppercase tracking-widest">Today</span>
          <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
        </div>

        {/* Today's Earnings Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-2xl border border-green-100/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] italic mb-3">Operational Earnings</p>
              <div className="flex items-baseline gap-2">
                <span className="text-green-600 text-2xl font-black italic">₦</span>
                <span className="text-5xl font-black text-gray-800 dark:text-gray-100 italic tracking-tighter">
                  {(stats?.todayEarnings || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-inner hover:scale-110 transition-transform text-gray-600">
                <Eye size={20} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-8 text-green-600 bg-green-50 w-fit px-4 py-1.5 rounded-full border border-green-100">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Signal performance: Optimal</span>
          </div>
        </div>

        {/* Today's Orders Card */}
        <Link to="/rider-orders" className="block">
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 hover:border-green-300 hover:shadow-2xl transition-all group active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gray-50 rounded-xl group-hover:rotate-12 transition-transform">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest italic">Daily Task Count</p>
                </div>
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-6xl font-black text-green-600 italic tracking-tighter">{stats?.todayOrdersCount || 0}</span>
                  <span className="text-gray-300 text-xl font-black italic uppercase tracking-tighter">Units</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/20"></div>
                    <span className="text-[10px] font-black uppercase text-gray-500 italic">{stats?.completedToday || 0} SECURED</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full shadow-lg shadow-amber-500/20"></div>
                    <span className="text-[10px] font-black uppercase text-gray-500 italic">{stats?.inProgressToday || 0} IN TRANSIT</span>
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center group-hover:translate-x-2 transition-transform">
                <ChevronRight className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </Link>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[1.5rem] p-6 shadow-lg border border-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-[10px] font-black uppercase text-gray-400 italic">Avg. Pulse</span>
            </div>
            <p className="text-3xl font-black text-gray-800 italic tracking-tighter">24 <span className="text-sm">MIN</span></p>
            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase italic">Operational speed</p>
          </div>
          <div className="bg-white rounded-[1.5rem] p-6 shadow-lg border border-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
              <span className="text-[10px] font-black uppercase text-gray-400 italic">Reputation</span>
            </div>
            <p className="text-3xl font-black text-gray-800 italic tracking-tighter">4.8</p>
            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase italic">From 156 nodes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
