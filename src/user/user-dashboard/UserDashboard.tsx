import { useState, useRef, useEffect } from "react";
import {
  // ChevronLeft,
  // ChevronRight,
  Bell,
  Heart, // Added back
  Star,
  Mail,
} from "lucide-react";
import { Navbar } from "../../component/Navbar";
import HeroFoodCarousel from "../../component/HeroFoodCarousel";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import FoodScrollCarousel from "../component/FoodScrollCarouse";
import { supabase } from "../../services/authService";
import { useToast } from "../../context/ToastContext";

// Define the interface for the liked state
interface LikedState {
  [key: string]: boolean;
}

// type ScrollDirection = "left" | "right";

export default function UserDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  
  // States
  const [liked, setLiked] = useState<LikedState>({}); // Added back
  const [foods, setFoods] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState({ name: "Guest", initial: "G" });
  const [loading, setLoading] = useState(true);

  const scrollRefs = {
    foods: useRef<HTMLDivElement>(null),
    offers: useRef<HTMLDivElement>(null),
    sellers: useRef<HTMLDivElement>(null),
  };

  // const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: ScrollDirection) => {
  //   if (ref.current) {
  //     const scrollAmount = 300;
  //     ref.current.scrollBy({
  //       left: direction === "left" ? -scrollAmount : scrollAmount,
  //       behavior: "smooth",
  //     });
  //   }
  // };

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

  // Main Data Fetcher
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        // 1. Handle User Profile
        if (session?.user) {
          const firstName = session.user.user_metadata?.firstname || "User";
          setUserProfile({
            name: firstName,
            initial: firstName.charAt(0).toUpperCase()
          });

          // 2. Fetch User Favorites
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

        // 3. Fetch Featured Foods
        const { data: menuData } = await supabase.from("menu_items").select("*").limit(10);
        if (menuData) setFoods(menuData);

        // 4. Fetch Vendors
        const { data: profileData } = await supabase.from("vendor_profiles").select("*").limit(8);
        if (profileData) setVendors(profileData);

        // 5. Fetch Offers
        const { data: offerData } = await supabase
          .from("menu_items")
          .select("*, vendor_profiles(business_name)")
          .gt("discount", 0)
          .limit(5);
        if (offerData) setOffers(offerData);

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* 1. Header Skeleton */}
      <div className="px-4 sm:px-6 py-6 border-b dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
        <div className="w-full h-12 bg-gray-100 dark:bg-gray-900 rounded-full animate-pulse" />
      </div>

      {/* 2. Hero Carousel Skeleton */}
      <div className="px-4 sm:px-6 py-8">
        <div className="w-full h-[400px] rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse relative overflow-hidden">
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-400/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      {/* 3. Horizontal Scroll Skeleton */}
      <div className="px-4 sm:px-6 py-6">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-6 animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-40 space-y-3">
              <div className="w-40 h-40 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <style>{`
        .hide-scrollbar { scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in-up { animation: slideInUp 0.6s ease-out backwards; }
      `}</style>

      <div className="w-full pb-24">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-950/80 backdrop-blur-xl shadow-lg border-b dark:border-gray-800 transition-colors duration-300">
          <Navbar />
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                     {userProfile.initial}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back,</p>
                  <p className="text-sm sm:text-base font-bold text-green-600 dark:text-green-400">
                     {userProfile.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/notification" className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full relative">
                    <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>
                <Link to="/inbox" className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full">
                    <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Link to="/search">
                <input
                  readOnly
                  placeholder="Search for foods, restaurants..."
                  className="w-full pl-12 pr-5 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-full text-sm dark:text-gray-200 outline-none cursor-pointer focus:border-green-500 dark:focus:border-green-400"
                />
              </Link>
            </div>
          </div>
        </div>

        <HeroFoodCarousel />

        {/* Featured Foods */}
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-500 rounded-full"></span> Featured Foods
          </h2>
          <div className="relative group">
            <div ref={scrollRefs.foods} className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar scroll-smooth">
              {foods.map((food, _idx) => (
                <div key={food.id} className="flex-shrink-0 animate-slide-in-up">
                  <Link to={`/market?item=${food.id}`} className="block">
                    <div className="relative rounded-2xl w-40 h-40 shadow-lg overflow-hidden">
                      <img src={food.image_url || "https://via.placeholder.com/300"} alt={food.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-2">
                        <p className="text-white text-xs font-bold">₦{food.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-2">{food.name}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Special Offers */}
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 rounded-full"></span> Special Offers
          </h2>
          <div ref={scrollRefs.offers} className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar scroll-smooth">
            {offers.map((offer) => (
              <div key={offer.id} className="flex-shrink-0 w-80">
                <Link to="/market" className="block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
                  <div className="relative h-40">
                    <img src={offer.image_url} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-bold text-red-500 shadow">{offer.discount}% OFF</div>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{offer.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{offer.vendor_profiles?.business_name}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Sellers */}
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span> Featured Sellers
          </h2>
          <div ref={scrollRefs.sellers} className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar scroll-smooth">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="flex-shrink-0 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-xl border-4 border-white dark:border-gray-800 shadow-md overflow-hidden">
                  {vendor.logo_url ? <img src={vendor.logo_url} className="w-full h-full object-cover" /> : vendor.full_name?.charAt(0)}
                </div>
                <p className="text-xs font-semibold mt-2 text-gray-800 dark:text-gray-200">{vendor.full_name}</p>
              </div>
            ))}
          </div>
        </div>

        <FoodScrollCarousel />

        {/* Kitchens Near You */}
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-red-500 rounded-full"></span> Kitchens Near You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendors.map((vendor) => (
              <div 
                key={vendor.id} 
                onClick={() => navigate(`/market?vendor=${vendor.vendor_id}`)}
                className="bg-white dark:bg-gray-900 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 shadow-sm cursor-pointer transition-all duration-300"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-2xl overflow-hidden shadow-inner">
                    {vendor.logo_url ? <img src={vendor.logo_url} className="w-full h-full object-cover" /> : "🏪"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{vendor.business_name}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleLike(vendor.id); }}
                        className="p-1 hover:bg-pink-50 rounded-full"
                      >
                        <Heart size={18} className={liked[vendor.id] ? "text-red-500 fill-red-500" : "text-gray-300"} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-bold">4.5</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{vendor.business_description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}