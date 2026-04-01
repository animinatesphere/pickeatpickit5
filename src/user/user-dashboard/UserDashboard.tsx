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
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../../component/Navbar";
import HeroFoodCarousel from "../../component/HeroFoodCarousel";
import { Link, useNavigate } from "react-router-dom";
import FoodScrollCarousel from "../component/FoodScrollCarouse";
import { useToast } from "../../context/ToastContext";
import { backendAuthService } from "../../services/backendAuthService";
import type { MenuItem, Vendor } from "../../services/backendAuthService";

interface LikedState {
  [key: string]: boolean;
}

interface UserProfile {
  firstname?: string | null;
  lastname?: string | null;
  email?: string | null;
  phone?: string | null;
}

const FOOD_FALLBACKS = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop",
];

const BACKEND_BASE_URL = "https://pickeatpickitbe.onrender.com";

const isValidUrl = (url: string) => {
  if (!url) return false;
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  );
};

const constructImageUrl = (url: string): string => {
  if (!url) return FOOD_FALLBACKS[0];
  if (isValidUrl(url)) return url;
  // If it's a relative path, construct the full URL
  if (url.startsWith("/")) {
    return `${BACKEND_BASE_URL}${url}`;
  }
  // Otherwise, assume it's missing the leading slash
  return `${BACKEND_BASE_URL}/${url}`;
};

const getFoodImage = (url: string, index: number) => {
  const imageUrl = constructImageUrl(url);
  return imageUrl || FOOD_FALLBACKS[index % FOOD_FALLBACKS.length];
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const [liked, setLiked] = useState<LikedState>({});
  const [foods, setFoods] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<MenuItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const toggleLike = async (vendorId: string) => {
    if (!backendAuthService.isAuthenticated()) {
      toast.warning("Please log in to save favorites!", "Login Required");
      return;
    }
    const isCurrentlyLiked = liked[vendorId];
    setLiked((prev) => ({ ...prev, [vendorId]: !isCurrentlyLiked }));
    try {
      if (isCurrentlyLiked) await backendAuthService.removeFavorite(vendorId);
      else await backendAuthService.addFavorite(vendorId);
    } catch {
      setLiked((prev) => ({ ...prev, [vendorId]: isCurrentlyLiked }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (backendAuthService.isAuthenticated()) {
          try {
            const profile = await backendAuthService.getProfile();
            setUserProfile(profile);
          } catch {
            /* silent */
          }
          try {
            const favs = await backendAuthService.getFavorites();
            const likedMap: LikedState = {};
            favs.forEach((f) => {
              likedMap[f.vendor_id] = true;
            });
            setLiked(likedMap);
          } catch {
            /* silent */
          }
        }
        try {
          const foodsData = await backendAuthService.getMenuItems(10);
          console.log("Featured Foods API Response:", foodsData);
          console.log(
            "First food image_url:",
            foodsData[0]?.image_url,
            "Name:",
            foodsData[0]?.name,
          );
          setFoods(foodsData);
        } catch {
          /* silent */
        }
        try {
          setVendors(await backendAuthService.getVendors(8));
        } catch {
          /* silent */
        }
        try {
          const offersData = await backendAuthService.getOffers(4);
          console.log("Special Offers API Response:", offersData);
          console.log(
            "First offer image_url:",
            offersData[0]?.image_url,
            "Name:",
            offersData[0]?.name,
          );
          setOffers(offersData);
        } catch {
          /* silent */
        }
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchData();
  }, []);

  const fullName =
    `${userProfile.firstname || ""} ${userProfile.lastname || ""}`.trim() ||
    "Guest";
  const initials =
    (userProfile.firstname?.[0] || "G").toUpperCase() +
    (userProfile.lastname?.[0] || "").toUpperCase();

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  };

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const categories = ["All", "Rice", "Protein", "Soup", "Snacks", "Drinks"];

  const filteredFoods =
    activeCategory === "All"
      ? foods
      : foods.filter(
          (f) =>
            f.category?.toLowerCase().includes(activeCategory.toLowerCase()) ||
            f.name?.toLowerCase().includes(activeCategory.toLowerCase()),
        );

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 pb-24 overflow-x-hidden font-inter">
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
            className="min-h-screen flex flex-col bg-gray-50"
          >
            <div className="px-4 sm:px-6 py-5 border-b border-gray-100 bg-white">
              <div className="max-w-7xl mx-auto flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-2.5 w-16 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-4 w-36 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full space-y-5">
              <div className="w-full h-72 sm:h-96 md:h-[60vh] lg:h-[90vh] rounded-3xl bg-gray-100 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
              <Navbar />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-green-500/20 flex-shrink-0"
                    >
                      {initials || "G"}
                    </motion.div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none mb-0.5">
                        Welcome back
                      </p>
                      <h1 className="text-sm font-black tracking-tight text-gray-900">
                        {fullName}
                      </h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search food, restaurants..."
                        onClick={() => navigate("/search")}
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-pointer focus:outline-none hover:bg-gray-100 transition-colors"
                      />
                    </div>
                    <Link
                      to="/notification"
                      className="w-10 h-10 bg-gray-50 border border-gray-200 flex items-center justify-center rounded-xl text-gray-600 relative hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Promo Banner ── */}
            {offers.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-white tracking-tight">
                        {offers[0]?.discount || 15}% OFF Today!
                      </p>
                      <p className="text-white/75 text-xs">{offers[0]?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/market")}
                    className="bg-white text-green-600 font-black text-xs px-3.5 py-2 rounded-xl hover:bg-green-50 transition-colors flex-shrink-0 whitespace-nowrap"
                  >
                    Order Now
                  </button>
                </motion.div>
              </div>
            )}

            {/* ── Hero ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 h-72 sm:h-96 md:h-[60vh] lg:h-[90vh] xl:h-[120vh] 2xl:h-[140vh]"
              >
                <HeroFoodCarousel />
              </motion.div>
            </div>

            {/* ── Quick Categories ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {[
                  {
                    label: "Trending",
                    icon: TrendingUp,
                    color: "text-green-600",
                    bg: "bg-green-50",
                    border: "border-green-100",
                  },
                  {
                    label: "Featured",
                    icon: Award,
                    color: "text-orange-500",
                    bg: "bg-orange-50",
                    border: "border-orange-100",
                  },
                  {
                    label: "Fast Order",
                    icon: Clock,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                    border: "border-blue-100",
                  },
                  {
                    label: "New",
                    icon: Sparkles,
                    color: "text-purple-600",
                    bg: "bg-purple-50",
                    border: "border-purple-100",
                  },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    variants={fadeUp}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/market")}
                    className={`${item.bg} border ${item.border} rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all`}
                  >
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span
                      className={`font-black text-[11px] uppercase tracking-wider ${item.color}`}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
              {/* ── Featured Foods ── */}
              {foods.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2.5">
                      <span className="w-1 h-5 bg-green-500 rounded-full" />
                      Featured Foods
                    </h2>
                    <Link
                      to="/market"
                      className="text-green-600 font-bold text-xs uppercase tracking-widest hover:text-green-700 flex items-center gap-1"
                    >
                      See All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Category pills */}
                  <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                          activeCategory === cat
                            ? "bg-green-600 text-white shadow-md shadow-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
                  >
                    {(filteredFoods.length > 0 ? filteredFoods : foods).map(
                      (food, index) => (
                        <motion.div
                          key={food.id}
                          variants={fadeUp}
                          className="group"
                        >
                          <Link to={`/market?item=${food.id}`}>
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 mb-2.5 shadow-sm">
                              <img
                                src={getFoodImage(food.image_url, index)}
                                alt={food.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  console.error(
                                    "Failed to load food image:",
                                    food.image_url,
                                  );
                                  (e.target as HTMLImageElement).src =
                                    FOOD_FALLBACKS[
                                      index % FOOD_FALLBACKS.length
                                    ];
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-2.5">
                                <p className="text-white font-black text-sm">
                                  ₦{food.price.toLocaleString()}
                                </p>
                              </div>
                              {food.discount && food.discount > 0 && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
                                  -{food.discount}%
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/market?item=${food.id}`);
                                }}
                                className="absolute bottom-2 left-2 bg-white text-green-600 w-7 h-7 rounded-lg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all font-black text-lg leading-none"
                              >
                                +
                              </button>
                            </div>
                            <h3 className="font-bold text-gray-800 text-xs truncate">
                              {food.name}
                            </h3>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-green-600 font-black text-sm">
                                ₦
                                {food.discount > 0
                                  ? Math.round(
                                      food.price * (1 - food.discount / 100),
                                    ).toLocaleString()
                                  : food.price.toLocaleString()}
                              </p>
                              {food.vendor_name && (
                                <p className="text-gray-400 text-[10px] truncate max-w-[55%]">
                                  {food.vendor_name}
                                </p>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      ),
                    )}
                  </motion.div>
                </section>
              )}

              {/* ── Special Offers ── */}
              {offers.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2.5">
                      <span className="w-1 h-5 bg-orange-500 rounded-full" />
                      Special Offers
                    </h2>
                    <Link
                      to="/market"
                      className="text-orange-500 font-bold text-xs uppercase tracking-widest hover:text-orange-600 flex items-center gap-1"
                    >
                      See All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {offers.map((offer, index) => (
                      <motion.div
                        key={offer.id}
                        whileHover={{ scale: 1.015 }}
                        transition={{ duration: 0.2 }}
                        className="relative h-48 rounded-2xl overflow-hidden cursor-pointer border border-gray-100 group shadow-md"
                        onClick={() => navigate(`/market?item=${offer.id}`)}
                      >
                        <img
                          src={getFoodImage(offer.image_url, index)}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt={offer.name}
                          onError={(e) => {
                            console.error(
                              "Failed to load offer image:",
                              offer.image_url,
                            );
                            (e.target as HTMLImageElement).src =
                              FOOD_FALLBACKS[index % FOOD_FALLBACKS.length];
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                        <div className="absolute inset-0 p-5 flex flex-col justify-end">
                          <span className="inline-flex w-fit items-center bg-orange-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                            {offer.discount}% Off
                          </span>
                          <h3 className="text-base font-black text-white tracking-tight leading-snug">
                            {offer.name}
                          </h3>
                          {offer.vendor_name && (
                            <p className="text-white/55 text-xs mt-0.5">
                              by {offer.vendor_name}
                            </p>
                          )}
                        </div>
                        <div className="absolute top-3 right-3 bg-white text-green-700 font-black text-xs px-2.5 py-1 rounded-xl shadow-md">
                          ₦
                          {Math.round(
                            offer.price * (1 - offer.discount / 100),
                          ).toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Kitchens Near You ── */}
              {vendors.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2.5">
                      <span className="w-1 h-5 bg-red-500 rounded-full" />
                      Kitchens Near You
                    </h2>
                    <Link
                      to="/market"
                      className="text-red-500 font-bold text-xs uppercase tracking-widest hover:text-red-600 flex items-center gap-1"
                    >
                      See All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    {vendors.map((vendor) => (
                      <motion.div
                        key={vendor.id}
                        variants={fadeUp}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        onClick={() =>
                          navigate(`/market?vendor=${vendor.vendor_id}`)
                        }
                        className="bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all group shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {vendor.logo_url && isValidUrl(vendor.logo_url) ? (
                              <img
                                src={constructImageUrl(vendor.logo_url)}
                                className="w-full h-full object-cover"
                                alt="logo"
                                onError={(e) => {
                                  console.error(
                                    "Failed to load vendor logo:",
                                    vendor.logo_url,
                                  );
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            ) : vendor.logo_url ? (
                              <img
                                src={constructImageUrl(vendor.logo_url)}
                                className="w-full h-full object-cover"
                                alt="logo"
                                onError={(e) => {
                                  console.error(
                                    "Failed to load vendor logo:",
                                    vendor.logo_url,
                                  );
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <span className="text-xl">🏪</span>
                            )}
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(vendor.id);
                            }}
                            className={`p-2 rounded-xl transition-all border ${
                              liked[vendor.id]
                                ? "bg-pink-50 text-pink-500 border-pink-100"
                                : "bg-gray-50 text-gray-300 border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <Heart
                              size={15}
                              fill={liked[vendor.id] ? "currentColor" : "none"}
                            />
                          </motion.button>
                        </div>

                        <h3 className="text-sm font-black tracking-tight text-gray-900 mb-1.5 truncate group-hover:text-green-600 transition-colors">
                          {vendor.business_name ?? "Unnamed Kitchen"}
                        </h3>

                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={11} fill="currentColor" />
                            <span className="text-[11px] font-bold">4.5</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <MapPin size={10} />
                            <span className="text-[10px] font-medium">
                              2.4km
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              vendor.is_open
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-500"
                            }`}
                          >
                            {vendor.is_open ? "Open" : "Closed"}
                          </span>
                          {vendor.accept_cod && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                              COD
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
                          {vendor.business_description ||
                            "Premium kitchen with fresh ingredients."}
                        </p>

                        <button className="w-full py-2 bg-green-50 text-green-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5">
                          <ShoppingBag size={12} />
                          Order Now
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                </section>
              )}

              <FoodScrollCarousel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
