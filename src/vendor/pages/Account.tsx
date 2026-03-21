import { useEffect, useState } from "react";
import {
  User, FileText, History, Wallet, Smartphone, Star,
  Headphones, LogOut, ShoppingBag, ChevronRight, Award,
  TrendingUp, Crown, Bell,
} from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { Link } from "react-router-dom";
import { supabase } from "../../services/authService";
import { useToast } from "../../context/ToastContext";

const Account = () => {
  const toast = useToast();
  const [isHovering,   setIsHovering]   = useState<string | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [profileImage, setProfileImage] = useState<string>("");
  const [totalOrders,  setTotalOrders]  = useState(0);
  const [revenue,      setRevenue]      = useState(0);
  const [avgRating,    setAvgRating]    = useState(0);
  const [formData,     setFormData]     = useState({
    restaurantName: "",
    category: "Restaurant",
    email: "",
    phone: "",
    fullName: "",
    address: "",
    zip: "",
    city: "",
    state: "",
    deliveryRange: "",
  });

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setIsLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        console.log("1. session:", session);
        console.log("1. email_confirmed_at:", session?.user?.email_confirmed_at);

        if (!session) {
          console.log("REDIRECT: no session");
          window.location.href = "/vendor-login";
          return;
        }

        if (!session.user.email_confirmed_at) {
          console.log("REDIRECT: email not confirmed");
          toast.warning("Please verify your email.", "Email Verification Required");
          window.location.href = "/vendor-login";
          return;
        }

        // Use session.user directly — no extra network call
        const user = session.user;
        console.log("2. user id:", user.id);

        const { data: vendorData, error: vendorError } = await supabase
          .from("vendors")
          .select("id, email, firstname, lastname, phone, business_address, business_name, state, lga")
          .eq("user_id", user.id)
          .single();

        console.log("3. vendorData:", vendorData);
        console.log("3. vendorError:", vendorError);

        if (vendorError || !vendorData) {
          console.log("No vendor row — showing empty state");
          return;
        }

        // Profile photo
        const { data: photoData } = await supabase
          .from("vendor_photos")
          .select("photo_url")
          .eq("vendor_id", vendorData.id)
          .eq("photo_type", "store_logo")
          .order("uploaded_at", { ascending: false })
          .limit(1);

        if (photoData && photoData.length > 0) {
          setProfileImage(photoData[0].photo_url);
        } else {
          const { data: profileLogoData } = await supabase
            .from("vendor_profiles")
            .select("logo_url")
            .eq("vendor_id", vendorData.id)
            .single();
          if (profileLogoData?.logo_url) setProfileImage(profileLogoData.logo_url);
        }

        // Orders + revenue
        const { data: orders } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("vendor_id", vendorData.id);

        if (orders) {
          setTotalOrders(orders.length);
          setRevenue(orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0));
        }

        // Average rating
        const { data: ratingData } = await supabase
          .from("orders")
          .select("rating")
          .eq("vendor_id", vendorData.id)
          .not("rating", "is", null);

        if (ratingData && ratingData.length > 0) {
          const avg = ratingData.reduce((acc, o) => acc + Number(o.rating), 0) / ratingData.length;
          setAvgRating(Math.round(avg * 10) / 10);
        }

        // Profile + availability
        const { data: profileData } = await supabase
          .from("vendor_profiles")
          .select("*")
          .eq("vendor_id", vendorData.id)
          .single();

        const { data: availabilityData } = await supabase
          .from("vendor_availability")
          .select("*")
          .eq("vendor_id", vendorData.id)
          .single();

        setFormData({
          restaurantName: profileData?.business_name || vendorData.business_name || "",
          category: "Restaurant",
          email: profileData?.business_email || vendorData.email || "",
          phone: profileData?.business_phone || vendorData.phone || "",
          fullName: profileData?.full_name ||
            `${vendorData.firstname || ""} ${vendorData.lastname || ""}`.trim(),
          address: profileData?.business_address || vendorData.business_address || "",
          zip: "",
          city: profileData?.lga || vendorData.lga || "",
          state: profileData?.state || vendorData.state || "",
          deliveryRange: availabilityData?.day_from && availabilityData?.day_to
            ? `${availabilityData.day_from} - ${availabilityData.day_to}`
            : "Not Set",
        });

      } catch (error) {
        console.error("CAUGHT ERROR:", error);
        if (error instanceof Error &&
          (error.message.includes("Auth session missing") ||
           error.message.includes("JWT expired"))) {
          window.location.href = "/vendor-login";
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, []);

  const menuItems = [
    { icon: User,       label: "Profile",             description: "Manage your personal info",      color: "from-blue-500 to-blue-600",    bgColor: "bg-blue-50",    sec: "ProfileSetting" },
    { icon: FileText,   label: "Menu",                description: "View and manage menu items",     color: "from-green-500 to-green-600",  bgColor: "bg-green-50",   sec: "menu" },
    { icon: History,    label: "Order History",       description: "Track all your orders",          color: "from-purple-500 to-purple-600",bgColor: "bg-purple-50",  sec: "orderhistory" },
    { icon: Wallet,     label: "Earning and Payment", description: "Manage earnings & payments",     color: "from-yellow-500 to-yellow-600",bgColor: "bg-yellow-50",  sec: "earning" },
    { icon: Smartphone, label: "Devices and Session", description: "Manage connected devices",       color: "from-indigo-500 to-indigo-600",bgColor: "bg-indigo-50",  sec: "DevicesSession" },
    { icon: Star,       label: "Review and Ratings",  description: "View customer feedback",         color: "from-pink-500 to-pink-600",   bgColor: "bg-pink-50",    sec: "reviews" },
    { icon: Headphones, label: "Support",             description: "Get help from our team",         color: "from-red-500 to-red-600",     bgColor: "bg-red-50",     sec: "Support-vendor" },
  ];

  const formatRevenue = (amount: number) => {
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)     return `₦${(amount / 1_000).toFixed(1)}K`;
    return `₦${amount.toLocaleString()}`;
  };

  const stats = [
    { icon: ShoppingBag, label: "Total Orders", value: totalOrders.toLocaleString(),                          color: "text-blue-600"   },
    { icon: TrendingUp,  label: "Revenue",      value: formatRevenue(revenue),                                 color: "text-green-600"  },
    { icon: Award,       label: "Rating",       value: avgRating > 0 ? avgRating.toString() : "N/A",          color: "text-yellow-600" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 transition-colors duration-300">
      <VendorNav />

      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="w-10" />
          <h1 className="text-xl font-bold tracking-tighter uppercase">Profile</h1>
          <Link to="/vendor-dashboard/smsg">
            <button className="p-2 hover:bg-white/20 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-green-600" />
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100 to-transparent rounded-full -mr-32 -mt-32 opacity-50" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100 to-transparent rounded-full -ml-24 -mb-24 opacity-50" />

          <div className="relative z-10">
            <div className="flex justify-center mb-4 relative">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                    {profileImage
                      ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      : <span>{formData.restaurantName?.charAt(0)?.toUpperCase() || "V"}</span>}
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute right-8 top-0 bg-white rounded-full px-4 py-2 shadow-xl flex items-center gap-2 border-2 border-green-200">
                <span className="text-2xl font-bold text-gray-800">{avgRating > 0 ? avgRating : "N/A"}</span>
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 uppercase tracking-tighter">
                {formData.restaurantName || "Your Restaurant"}
              </h2>
              <p className="text-gray-500 mb-4 font-medium">
                {[formData.address, formData.city, formData.state].filter(Boolean).join(", ") || "Address not set"}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                      <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs text-gray-600 mt-1 font-bold uppercase tracking-widest">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index}
                onMouseEnter={() => setIsHovering(item.label)}
                onMouseLeave={() => setIsHovering(null)}
                className={`bg-white rounded-2xl shadow-md border border-transparent hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden ${isHovering === item.label ? "scale-[1.02]" : ""}`}>
                <Link to={`/${item.sec}`}>
                  <div className="flex items-center gap-4 p-5">
                    <div className={`w-14 h-14 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isHovering === item.label ? "scale-110" : ""}`}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-lg mb-0.5 uppercase tracking-tighter">{item.label}</h3>
                      <p className="text-sm text-gray-500 font-medium">{item.description}</p>
                    </div>
                    <ChevronRight className={`w-6 h-6 text-gray-400 transition-all duration-300 ${isHovering === item.label ? "text-green-600 translate-x-1" : ""}`} />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = "/vendor-login"; }}
          className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group transform hover:scale-[1.02]"
        >
          <span>Log out</span>
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-green-800 mb-1 uppercase tracking-tighter">Premium Member</h3>
              <p className="text-sm text-green-700 font-medium">You're enjoying all premium features. Keep up the great work!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;