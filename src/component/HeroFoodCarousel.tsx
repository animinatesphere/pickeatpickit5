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

const isValidUrl = (url: string) =>
  url?.startsWith("http://") || url?.startsWith("https://");

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
  const imageUrl = isValidUrl(currentItem.image_url)
    ? currentItem.image_url
    : FOOD_FALLBACKS[currentSlide % FOOD_FALLBACKS.length];
  const discountedPrice =
    currentItem.price * (1 - (currentItem.discount || 0) / 100);
  const originalPrice = currentItem.price;

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-950"
      style={{ minHeight: "80vh" }}
    >
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[65vh]">
          {/* ── Left content ── */}
          <div
            className="space-y-7 order-2 lg:order-1"
            style={{
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating ? "translateY(10px)" : "translateY(0)",
              transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {currentItem.discount > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest shadow-lg shadow-green-500/30">
                  <Flame className="w-3.5 h-3.5" />
                  {currentItem.discount}% OFF
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur text-white/80 border border-white/10 px-4 py-2 rounded-full text-sm font-medium">
                <Clock className="w-3.5 h-3.5 text-green-400" />
                25 mins
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur text-white/80 border border-white/10 px-4 py-2 rounded-full text-sm font-medium">
                <Truck className="w-3.5 h-3.5 text-green-400" />
                Fast delivery
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[0.95] tracking-tighter uppercase">
                {currentItem.name}
              </h1>
              <p className="mt-4 text-gray-400 text-base sm:text-lg leading-relaxed max-w-md font-light">
                {currentItem.description ||
                  "A delicious dish crafted with the freshest ingredients."}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-yellow-400 font-black text-sm ml-1">
                  {currentItem.rating || "4.8"}
                </span>
              </div>
              <span className="text-gray-500 text-sm">Best Seller</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">
                  Price
                </p>
                <p className="text-5xl sm:text-6xl font-black text-green-400 leading-none">
                  ₦{Math.round(discountedPrice).toLocaleString()}
                </p>
              </div>
              {currentItem.discount > 0 && (
                <p className="text-2xl text-gray-600 line-through font-medium mb-1">
                  ₦{originalPrice.toLocaleString()}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/market"
                className="group inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-white font-black py-4 px-8 rounded-2xl text-base uppercase tracking-widest shadow-2xl shadow-green-500/30 transition-all duration-300 hover:scale-105 hover:shadow-green-400/40"
              >
                <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Order Now
              </Link>
              <Link
                to="/market"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-2xl text-base border border-white/10 backdrop-blur transition-all duration-300"
              >
                View Menu
              </Link>
            </div>
          </div>

          {/* ── Right image ── */}
          <div className="relative order-1 lg:order-2 flex items-center justify-center">
            {/* Glow */}
            <div className="absolute inset-0 bg-green-500/10 rounded-full blur-3xl scale-75" />

            {/* Main image */}
            <div
              className="relative w-full max-w-lg aspect-square rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
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
                <div className="absolute top-6 right-6 w-20 h-20 bg-green-500 rounded-full flex flex-col items-center justify-center shadow-xl shadow-green-500/40">
                  <span className="text-white font-black text-xl leading-none">
                    {currentItem.discount}%
                  </span>
                  <span className="text-white/80 font-bold text-[10px] uppercase tracking-widest">
                    OFF
                  </span>
                </div>
              )}
            </div>

            {/* Nav arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 lg:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="mt-10 flex justify-center gap-3 flex-wrap">
          {foodItems.map((item, index) => {
            const thumbUrl = isValidUrl(item.image_url)
              ? item.image_url
              : FOOD_FALLBACKS[index % FOOD_FALLBACKS.length];
            return (
              <button
                key={item.id}
                onClick={() => changeSlide(index)}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 w-16 h-16 sm:w-20 sm:h-20 border-2 ${
                  index === currentSlide
                    ? "border-green-500 scale-110 shadow-xl shadow-green-500/30"
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

        {/* Slide counter */}
        <div className="mt-6 flex justify-center items-center gap-2">
          {foodItems.map((_, index) => (
            <button
              key={index}
              onClick={() => changeSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? "w-8 h-2 bg-green-500"
                  : "w-2 h-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
