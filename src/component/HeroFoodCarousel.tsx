import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Star,
  Clock,
  Truck,
  Flame,
} from "lucide-react";
import { Link } from "react-router-dom";
import { backendAuthService } from "../services/backendAuthService";

interface FoodItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  discount: number;
  description: string;
  rating?: number;
}

const FOOD_FALLBACKS = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop",
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

export default function HeroFoodCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchHeroItems = async () => {
      try {
        setLoading(true);
        const data = await backendAuthService.getMenuItems(6);
        const sorted = [...data].sort(
          (a, b) => (b.discount ?? 0) - (a.discount ?? 0),
        );
        setFoodItems(sorted);
      } catch (err) {
        console.error("Error fetching hero items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroItems();
  }, []);

  useEffect(() => {
    if (foodItems.length === 0) return;
    const timer = setInterval(
      () => changeSlide((currentSlide + 1) % foodItems.length),
      6000,
    );
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodItems.length, currentSlide]);

  const changeSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToPrevious = () =>
    changeSlide((currentSlide - 1 + foodItems.length) % foodItems.length);
  const goToNext = () => changeSlide((currentSlide + 1) % foodItems.length);

  if (loading) {
    return (
      <div className="w-full h-[70vh] bg-gray-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/40 via-gray-900 to-gray-900" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          <p className="text-green-400 font-mono text-sm tracking-widest uppercase animate-pulse">
            Loading specials...
          </p>
        </div>
      </div>
    );
  }

  if (foodItems.length === 0) return null;

  const currentItem = foodItems[currentSlide];
  const imageUrl = constructImageUrl(currentItem.image_url);
  const discountedPrice =
    currentItem.price * (1 - (currentItem.discount || 0) / 100);
  const originalPrice = currentItem.price;

  return (
    <div className="relative w-full overflow-hidden bg-gray-950 min-h-64 sm:min-h-80 md:min-h-96 lg:min-h-[70vh] xl:min-h-[85vh] 2xl:min-h-screen">
      {/* Background image blur layer */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(40px) brightness(0.25) saturate(1.5)",
          transform: "scale(1.1)",
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 h-full flex flex-col justify-center">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 items-start lg:items-center">
          {/* ── Left content ── */}
          <div
            className="flex-1 space-y-3 sm:space-y-5 w-full lg:w-auto"
            style={{
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating ? "translateY(10px)" : "translateY(0)",
              transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {currentItem.discount > 0 && (
                <span className="inline-flex items-center gap-1 bg-green-500 text-white px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/30 rounded-full">
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {currentItem.discount}% OFF
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur text-white/80 border border-white/10 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-full">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400" />
                <span className="hidden sm:inline">25 mins</span>
                <span className="sm:hidden">25m</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur text-white/80 border border-white/10 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-full">
                <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400" />
                <span className="hidden sm:inline">Fast delivery</span>
                <span className="sm:hidden">Fast</span>
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight sm:leading-snug lg:leading-snug tracking-tighter uppercase line-clamp-2">
                {currentItem.name}
              </h1>
              <p className="mt-1.5 sm:mt-2 text-gray-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xs line-clamp-2">
                {currentItem.description ||
                  "A delicious dish crafted with the freshest ingredients."}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-0.5 sm:gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 sm:px-3 py-1 rounded-lg">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-yellow-400 font-black text-[10px] sm:text-xs ml-1">
                  {currentItem.rating || "4.8"}
                </span>
              </div>
              <span className="text-gray-400 text-[10px] sm:text-xs">
                Best Seller
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-2 sm:gap-3">
              <div>
                <p className="text-gray-400 text-[9px] sm:text-xs uppercase tracking-widest font-bold mb-0.5">
                  Price
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-green-400 leading-none">
                  ₦{Math.round(discountedPrice).toLocaleString()}
                </p>
              </div>
              {currentItem.discount > 0 && (
                <p className="text-sm sm:text-lg text-gray-600 line-through font-medium mb-0.5">
                  ₦{originalPrice.toLocaleString()}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-2 sm:gap-3 pt-1">
              <Link
                to={`/market?item=${currentItem.id}`}
                className="group inline-flex items-center gap-1.5 sm:gap-2 bg-green-500 hover:bg-green-400 text-white font-black py-2 sm:py-3 px-4 sm:px-6 rounded-xl text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-green-500/30 transition-all duration-300 hover:scale-105"
              >
                <ShoppingCart className="w-3.5 sm:w-4 h-3.5 sm:h-4 group-hover:rotate-12 transition-transform" />
                Order
              </Link>
              <Link
                to={`/market?item=${currentItem.id}`}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl text-xs sm:text-sm border border-white/10 backdrop-blur transition-all duration-300"
              >
                Details
              </Link>
            </div>
          </div>

          {/* ── Right image ── */}
          <div className="relative w-full lg:w-1/2 flex items-center justify-center lg:justify-end">
            {/* Glow */}
            <div className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl scale-50 sm:scale-60 lg:scale-75" />

            {/* Main image */}
            <div
              className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 xl:w-80 xl:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              style={{
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? "scale(0.96)" : "scale(1)",
                transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <img
                src={imageUrl}
                alt={currentItem.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    FOOD_FALLBACKS[currentSlide % FOOD_FALLBACKS.length];
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />

              {/* Discount badge on image */}
              {currentItem.discount > 0 && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-14 h-14 sm:w-16 sm:h-16 bg-green-500 rounded-full flex flex-col items-center justify-center shadow-xl shadow-green-500/40">
                  <span className="text-white font-black text-sm sm:text-lg leading-none">
                    {currentItem.discount}%
                  </span>
                  <span className="text-white/80 font-bold text-[8px] sm:text-[9px] uppercase tracking-widest">
                    OFF
                  </span>
                </div>
              )}
            </div>

            {/* Nav arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-1 sm:left-2 lg:left-0 top-1/2 -translate-y-1/2 w-7 sm:w-9 h-7 sm:h-9 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
            >
              <ChevronLeft className="w-3.5 sm:w-4" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-1 sm:right-2 lg:right-0 top-1/2 -translate-y-1/2 w-7 sm:w-9 h-7 sm:h-9 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
            >
              <ChevronRight className="w-3.5 sm:w-4" />
            </button>
          </div>
        </div>

        {/* Thumbnail strip & Slide counter */}
        <div className="mt-4 sm:mt-6 flex flex-col items-center gap-3 sm:gap-4">
          {/* Thumbnails - only show on larger screens */}
          <div className="hidden sm:flex justify-center gap-2 sm:gap-3 flex-wrap">
            {foodItems.map((item, index) => {
              const thumbUrl = isValidUrl(item.image_url)
                ? item.image_url
                : FOOD_FALLBACKS[index % FOOD_FALLBACKS.length];
              return (
                <button
                  key={item.id}
                  onClick={() => changeSlide(index)}
                  className={`relative rounded-lg overflow-hidden transition-all duration-300 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 ${
                    index === currentSlide
                      ? "border-green-500 scale-105 shadow-lg shadow-green-500/30"
                      : "border-white/10 opacity-40 hover:opacity-70 hover:border-white/30"
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        FOOD_FALLBACKS[index % FOOD_FALLBACKS.length];
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Slide counter dots */}
          <div className="flex justify-center items-center gap-1.5 sm:gap-2">
            {foodItems.map((_, index) => (
              <button
                key={index}
                onClick={() => changeSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? "w-6 sm:w-8 h-2 bg-green-500"
                    : "w-2 h-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
