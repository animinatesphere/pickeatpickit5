import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Star,
  Clock,
  Truck,
} from "lucide-react";
import { supabase } from "../services/authService";
import { Link } from "react-router-dom";

interface FoodItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  discount: number;
  description: string;
  rating?: number; // Fallback if not in DB
}

export default function HeroFoodCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroItems = async () => {
      try {
        setLoading(true);
        // Fetching 4 items that have a discount or are specials
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .order('discount', { ascending: false }) // Show highest discounts first
          .limit(4);

        if (error) throw error;
        if (data) setFoodItems(data);
      } catch (err) {
        console.error("Error fetching hero items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroItems();
  }, []);

  // Auto-slide logic
  useEffect(() => {
    if (foodItems.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % foodItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [foodItems.length]);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + foodItems.length) % foodItems.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % foodItems.length);
  };

  // Loading State
  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Fallback if no items in DB
  if (foodItems.length === 0) return null;

  const currentItem = foodItems[currentSlide];
  
  // Calculate formatted prices
  const formattedPrice = `₦${currentItem.price.toLocaleString()}`;
  const originalPriceNum = currentItem.price / (1 - (currentItem.discount || 0) / 100);
  const formattedOriginalPrice = `₦${Math.round(originalPriceNum).toLocaleString()}`;

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Content Section */}
          <div className="space-y-8 order-2 lg:order-1 animate-fade-in">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {currentItem.discount}% OFF
              </span>
              <div className="flex items-center gap-2 text-green-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Ready in 25 mins</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <Truck className="w-4 h-4" />
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                {currentItem.name}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                {currentItem.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-green-100 px-4 py-2 rounded-lg border border-green-200">
                <Star className="w-5 h-5 fill-green-600 text-green-600 mr-2" />
                <span className="text-green-900 font-bold text-lg">
                  {currentItem.rating || "4.8"}
                </span>
              </div>
              <span className="text-gray-600 font-medium">Best Seller</span>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 inline-block">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl sm:text-6xl font-bold text-green-600">
                  {formattedPrice}
                </span>
                {currentItem.discount > 0 && (
                  <span className="text-2xl text-gray-400 line-through font-medium">
                    {formattedOriginalPrice}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/market" className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl">
                <ShoppingCart className="w-6 h-6" />
                Order Now
              </Link>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="relative order-1 lg:order-2">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-200 aspect-square lg:aspect-auto lg:h-[600px]">
              {currentItem.image_url?.startsWith('http') ? (
                <img
                  src={currentItem.image_url}
                  alt={currentItem.name}
                  className="w-full h-full object-cover transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">🥘</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent"></div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border-2 border-green-100">
              <p className="text-sm text-gray-600 mb-1">Limited Offer</p>
              <p className="text-2xl font-bold text-green-600">
                {currentItem.discount}% OFF
              </p>
            </div>

            <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-green-600 p-3 rounded-full shadow-lg">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-green-600 p-3 rounded-full shadow-lg">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bottom Thumbnail Navigation */}
        <div className="mt-12 flex justify-center gap-4 flex-wrap">
          {foodItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentSlide(index)}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 w-20 h-20 sm:w-24 sm:h-24 ${
                index === currentSlide ? "ring-4 ring-green-600 scale-105 shadow-xl" : "opacity-60 hover:opacity-100"
              }`}
            >
              {item.image_url?.startsWith('http') ? (
                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-2xl">🥘</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}