import { useState, useEffect } from "react";
import {
  Bell,
  Heart,
  Star,
  Search,
  MapPin,
  TrendingUp,
  Award,
  Clock,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../../component/Navbar";
import HeroFoodCarousel from "../../component/HeroFoodCarousel";
import { Link, useNavigate } from "react-router-dom";
import FoodScrollCarousel from "../component/FoodScrollCarouse";
import { supabase } from "../../services/authService";
import { useToast } from "../../context/ToastContext";

interface LikedState {
  [key: string]: boolean;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [liked, setLiked] = useState<LikedState>({});
  const [foods, setFoods] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState({ name: "Guest", initial: "G" });
  const [loading, setLoading] = useState(true);

  const toggleLike = async (vendorId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.warning("Please log in to save favorites!", "Login Required");
      return;
    }

    const isCurrentlyLiked = liked[vendorId];
    setLiked(prev => ({ ...prev, [vendorId]: !isCurrentlyLiked }));

    try {
      if (isCurrentlyLiked) {
        await supabase.from("user_favorites").delete().eq("user_id", session.user.id).eq("vendor_id", vendorId);
      } else {
        await supabase.from("user_favorites").insert([{ user_id: session.user.id, vendor_id: vendorId }]);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      setLiked(prev => ({ ...prev, [vendorId]: isCurrentlyLiked }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const firstName = session.user.user_metadata?.firstname || "User";
          setUserProfile({
            name: firstName,
            initial: firstName.charAt(0).toUpperCase()
          });

          const { data: favs } = await supabase
            .from("user_favorites")
            .select("vendor_id")
            .eq("user_id", session.user.id);

          if (favs) {
            const likedMap: LikedState = {};
            favs.forEach(f => { likedMap[f.vendor_id] = true; });
            setLiked(likedMap);
          }
        }

        const { data: menuData } = await supabase.from("menu_items").select("*").limit(10);
        if (menuData) setFoods(menuData);

        const { data: profileData } = await supabase.from("vendor_profiles").select("*").limit(8);
        if (profileData) setVendors(profileData);

        const { data: offerData } = await supabase
          .from("menu_items")
          .select("*, vendor_profiles(business_name)")
          .gt("discount", 0)
          .limit(5);
        if (offerData) setOffers(offerData);

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-inter pb-20 overflow-x-hidden">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            <div className="px-6 py-6 border-b dark:border-gray-800">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                   <div className="space-y-2">
                     <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                     <div className="h-5 w-40 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                   </div>
                 </div>
               </div>
               <div className="w-full h-14 bg-gray-50 dark:bg-gray-900 rounded-[2rem] animate-pulse" />
            </div>
            <div className="px-6 py-10">
               <div className="w-full h-[400px] rounded-[3rem] bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800">
              <Navbar />
              <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <motion.div whileHover={{ scale: 1.05 }} className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-green-500/20">
                      {userProfile.initial}
                    </motion.div>
                    <div>
                      <p className="text-[10px] font-black uppercase italic tracking-widest text-gray-400 leading-none mb-1">Welcome Back</p>
                      <h1 className="text-xl font-black italic tracking-tighter uppercase">{userProfile.name}</h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 group md:min-w-[400px]">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500" />
                      <input
                        type="text"
                        placeholder="Search for available items..."
                        onClick={() => navigate("/search")}
                        readOnly
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl text-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 cursor-pointer font-bold"
                      />
                    </div>
                    <div className="flex gap-2">
                       <Link to="/notification" className="w-14 h-14 bg-gray-50 dark:bg-gray-900 flex items-center justify-center rounded-2xl text-green-600 border border-gray-100 dark:border-gray-800 relative">
                         <Bell className="w-6 h-6" />
                         <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-950"></span>
                       </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[3rem] overflow-hidden shadow-3xl mb-16">
                <HeroFoodCarousel />
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                {[
                  { label: 'Popular', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
                  { label: 'Featured', icon: Award, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                  { label: 'Recent', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Favorite', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                ].map((item, i) => (
                  <motion.div key={i} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-50 dark:border-gray-800 shadow-xl flex flex-col items-center justify-center gap-4 cursor-pointer group">
                    <div className={`${item.bg} p-4 rounded-2xl group-hover:scale-110 transition-all`}>
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                    </div>
                    <span className="font-black italic uppercase tracking-widest text-[10px] text-gray-500">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mb-20">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                    <span className="w-3 h-8 bg-green-500 rounded-full" /> Featured Foods
                  </h2>
                  <Link to="/market" className="text-green-600 font-black text-xs uppercase italic tracking-widest hover:underline flex items-center gap-2">View All <ChevronRight className="w-4 h-4" /></Link>
                </div>

                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                  {foods.map((food) => (
                    <motion.div key={food.id} variants={itemVariants} whileHover={{ y: -10 }} className="group">
                      <Link to={`/market?item=${food.id}`}>
                        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl mb-4">
                          <img src={food.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"} alt={food.name} className="w-full h-full object-cover transition-all group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex items-end">
                             <p className="text-white font-black italic text-xl tracking-tighter uppercase">₦{food.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <h3 className="font-black italic uppercase tracking-tighter text-gray-700 dark:text-gray-300 text-sm truncate">{food.name}</h3>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div className="mb-20">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-4 mb-10">
                  <span className="w-3 h-8 bg-orange-500 rounded-full" /> Special Offers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {offers.map((offer) => (
                    <motion.div key={offer.id} whileHover={{ scale: 1.02 }} className="relative h-64 rounded-[2.5rem] overflow-hidden shadow-3xl group cursor-pointer" onClick={() => navigate("/market")}>
                      <img src={offer.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"} className="absolute inset-0 w-full h-full object-cover transition-all group-hover:scale-110" alt={offer.name} />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent p-10 flex flex-col justify-center">
                        <div className="bg-orange-500 text-white w-fit px-4 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest mb-4">{offer.discount}% DISCOUNT</div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">{offer.name}</h3>
                        <p className="text-white/60 font-bold uppercase italic text-xs tracking-widest">{offer.vendor_profiles?.business_name}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mb-20">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-4 mb-10">
                  <span className="w-3 h-8 bg-red-500 rounded-full" /> Kitchens Near You
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {vendors.map((vendor) => (
                    <motion.div key={vendor.id} whileHover={{ y: -10 }} onClick={() => navigate(`/market?vendor=${vendor.vendor_id}`)} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-50 dark:border-gray-800 shadow-2xl cursor-pointer group hover:border-green-500/30 transition-all">
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <div className="w-20 h-20 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-4xl shadow-inner border border-gray-100 dark:border-gray-700">
                            {vendor.logo_url ? <img src={vendor.logo_url} className="w-full h-full object-cover" alt="logo" /> : <div className="font-black italic text-green-600">🏪</div>}
                          </div>
                          <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); toggleLike(vendor.id); }} className={`p-3 rounded-2xl ${liked[vendor.id] ? 'bg-pink-500/10 text-pink-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-300'}`}>
                            <Heart size={24} fill={liked[vendor.id] ? "currentColor" : "none"} />
                          </motion.button>
                        </div>
                        <div>
                          <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2 truncate">{vendor.business_name}</h3>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-yellow-500"><Star size={16} fill="currentColor" /><span className="text-sm font-black italic">4.5</span></div>
                            <div className="flex items-center gap-1.5 text-gray-400"><MapPin size={16} /><span className="text-[10px] font-black uppercase italic tracking-widest">2.4km</span></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 italic">{vendor.business_description || "Premium kitchen with fresh ingredients."}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <FoodScrollCarousel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}