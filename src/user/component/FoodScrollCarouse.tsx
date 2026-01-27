import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/authService"; // Ensure this path is correct

export default function FoodScrollCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Real Data States
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Chef's Specials from Supabase
  useEffect(() => {
    const fetchChefSpecials = async () => {
      try {
        setLoading(true);
       const { data, error } = await supabase
  .from("menu_items")
  .select(`
    *,
    vendor_profiles (
      business_name,
      full_name,
      business_address,
      logo_url
    )
  `)
  .eq("is_chef_special", true)
          .limit(10);

        if (!error && data) {
          setFoods(data);
        }
      } catch (err) {
        console.error("Error fetching specials:", err);
      } finally {
        setLoading(false);
        // Trigger arrow check after data loads
        setTimeout(handleScroll, 100);
      }
    };

    fetchChefSpecials();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getDiscountedPrice = (price: number, discount: number) => {
    return (price * (1 - (discount || 0) / 100)).toFixed(2);
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Loading Chef's Specials...</div>;
  if (foods.length === 0) return null; // Don't show the section if no specials exist

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 md:px-8">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Chef's Specials
          </h2>
          <p className="text-gray-600 text-lg">
            Curated dishes from top-rated kitchens
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Arrows */}
          {showLeftArrow && (
            <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-xl hover:shadow-2xl transition-all hidden md:flex items-center justify-center"><ChevronLeft className="w-6 h-6 text-gray-800" /></button>
          )}
          {showRightArrow && (
            <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-xl hover:shadow-2xl transition-all hidden md:flex items-center justify-center"><ChevronRight className="w-6 h-6 text-gray-800" /></button>
          )}

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 md:px-12 px-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {foods.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-80 group cursor-pointer">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative overflow-hidden h-48 bg-gray-200 flex items-center justify-center">
                    {item.image_url?.startsWith('http') ? (
                       <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                       <span className="text-6xl">{item.image_url || '🥘'}</span>
                    )}

                    {item.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                        {item.discount}% OFF
                      </div>
                    )}

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-sm text-gray-900">4.9</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">₦{getDiscountedPrice(item.price, item.discount)}</span>
                        {item.discount > 0 && (
                          <span className="text-lg text-gray-400 line-through">₦{item.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                    {/* Vendor Info (Joined Data) */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden border-2 border-white shadow-sm">
                          {item.vendor_profiles?.logo_url ? (
                             <img src={item.vendor_profiles.logo_url} className="w-full h-full object-cover" />
                          ) : (
                             item.vendor_profiles?.full_name?.charAt(0) || 'V'
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm">{item.vendor_profiles?.full_name || "Professional Chef"}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="w-3 h-3" />
                            {item.vendor_profiles?.business_address || "Nearby"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span>25-30 min</span>
                      </div>
                    </div>

                    <Link to="/market" className="w-full">
                      <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-lg transition-all hover:shadow-lg active:scale-95">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Link to="/market">
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold px-8 py-4 rounded-lg transition-all hover:scale-105 shadow-xl text-lg">
              View All Dishes
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}