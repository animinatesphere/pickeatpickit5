import { useState, useEffect } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Search, 
  Minus, 
  Plus, 
  Clock, 
  ShoppingBag, 
  ArrowRight, 
  Star,
  Flame,
  UtensilsCrossed,
  Sparkles
} from "lucide-react";
import { Navbar } from "../../component/Navbar";
import { useNavigate } from "react-router-dom";
import { getMenuItems } from '../../services/api'
import { useToast } from "../../context/ToastContext";

type Screen = "kitchen" | "confirm";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  discount: number;
  image_url: string;
  description: string;
  quantity: number;
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export default function Market() {
  const [screen, setScreen] = useState<Screen>("kitchen");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [spiceLevel, setSpiceLevel] = useState(30);
  const [scheduleOrder, setScheduleOrder] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const loadMenu = async () => {
      const { data, error } = await getMenuItems();
      if (!error && data) {
        const formattedItems = data.map((item: any) => ({
          ...item,
          quantity: 0,
          image_url: item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
          discount: item.discount || 15
        }));
        setItems(formattedItems);
      }
    };
    loadMenu();
  }, []);

  const handleOrderNow = (item: MenuItem) => {
    if (item.quantity === 0) return;

    const checkoutItems = [{
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image_url: item.image_url
    }];

    sessionStorage.setItem("checkoutItems", JSON.stringify(checkoutItems));
    navigate("/payment");
  };

  const addToCart = (item: MenuItem) => {
    if (item.quantity === 0) {
      toast.warning('Please select quantity first', 'Quantity Required');
      return;
    }

    const existingCart = sessionStorage.getItem('cart');
    let cart = existingCart ? JSON.parse(existingCart) : [];

    const cartItem = {
      id: item.id,
      name: item.name,
      restaurant: "Mardiya Kitchen",
      items: item.description,
      date: new Date().toLocaleString(),
      price: item.price * (1 - item.discount / 100),
      quantity: item.quantity,
      selected: true,
      image_url: item.image_url
    };

    const existingItemIndex = cart.findIndex((i: any) => i.id === item.id);
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += item.quantity;
    } else {
      cart.push(cartItem);
    }

    sessionStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Item added to cart!', 'Cart Updated');
  };

  const handleConfirmOrder = async () => {
    const cart = getCart();
    if (cart.length === 0) {
      toast.warning('Please add items to cart first', 'Cart Empty');
      return;
    }

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
    const instructionsTextarea = document.querySelector('textarea') as HTMLTextAreaElement;

    sessionStorage.setItem('pendingOrder', JSON.stringify({
      items: cart,
      spiceLevel,
      scheduleOrder,
      scheduledDate: scheduleOrder ? dateInput?.value : null,
      scheduledTime: scheduleOrder ? timeInput?.value : null,
      specialInstructions: instructionsTextarea?.value || ''
    }));

    navigate('/payment');
  };

  const getCart = (): OrderItem[] =>
    items
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price * (1 - item.discount / 100) * item.quantity,
      }));

  const updateQuantity = (id: number, delta: number) => {
    setItems(prev =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const KitchenView = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const categories = ["All", "Rice", "Meat", "Drinks", "Snacks", "Vegan"];

    return (
      <div className="min-h-screen w-full bg-white dark:bg-gray-950 transition-colors duration-300 pb-20">
        <div className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl z-40 border-b border-gray-100 dark:border-gray-800">
          <Navbar />
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex-1 w-full relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search for available items..."
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl text-sm dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold"
                />
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase italic tracking-widest transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? "bg-green-600 text-white shadow-xl shadow-green-500/30"
                        : "bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:text-green-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[300px] rounded-[3rem] overflow-hidden mb-16 group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="Hero"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-12">
              <div className="flex items-center gap-3 text-green-400 font-bold uppercase italic tracking-widest text-xs mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Trending Now</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white font-inter italic tracking-tighter uppercase leading-none mb-6">
                Mardiya <span className="text-green-500">Kitchen</span>
              </h2>
              <p className="text-white/70 max-w-md font-medium text-lg italic mb-8">
                Experience the finest culinary treasures delivered with cinematic speed.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {items.map((item) => {
              const discountedPrice = (item.price * (1 - item.discount / 100)).toFixed(2);
              return (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -10 }}
                  className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-xl border border-transparent dark:border-gray-800 hover:border-green-500/30 transition-all group relative"
                >
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute top-4 left-4 z-20 bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-widest">
                      {item.discount}% OFF
                    </div>
                    <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md text-white p-2 rounded-xl border border-white/20">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  
                  <div className="p-8">
                    <h4 className="font-black text-xl text-gray-800 dark:text-gray-100 font-inter tracking-tight mb-2 italic uppercase">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-green-600 dark:text-green-400 font-black text-2xl italic tracking-tighter">₦{discountedPrice}</span>
                      <span className="text-gray-400 dark:text-gray-600 text-sm line-through font-bold">₦{item.price.toLocaleString()}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-2 border border-gray-100 dark:border-gray-800">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm active:scale-95 transition-all">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-black text-gray-800 dark:text-gray-100 font-inter italic">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm active:scale-95 transition-all">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => addToCart(item)} className="flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl font-black text-[10px] uppercase italic tracking-widest hover:bg-gray-100 transition-all border border-gray-100 dark:border-gray-800">
                          <ShoppingBag className="w-3.5 h-3.5" /> Cart
                        </button>
                        <button onClick={() => handleOrderNow(item)} className="flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase italic tracking-widest hover:bg-green-700 transition-all shadow-lg active:scale-95">
                          Order
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <AnimatePresence>
          {getCart().length > 0 && (
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl px-10 py-6 bg-black/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-3xl flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center"><ShoppingBag className="w-7 h-7 text-white" /></div>
                <div>
                  <p className="text-white text-lg font-black font-inter italic uppercase tracking-tighter">{getCart().reduce((sum, i) => sum + i.quantity, 0)} Items</p>
                  <p className="text-green-400 font-bold text-xs uppercase italic animate-pulse">Total: ₦{getCart().reduce((sum, i) => sum + i.price, 0).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setScreen("confirm")} className="px-10 py-4 bg-white text-black font-black italic uppercase tracking-tighter rounded-2xl flex items-center gap-3">Checkout <ArrowRight className="w-5 h-5" /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const ConfirmView = () => (
    <div className="min-h-screen w-full bg-white dark:bg-gray-950 transition-colors duration-300 pb-20 font-inter">
      <div className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl z-50 border-b border-gray-100 dark:border-gray-800 px-6 py-6 flex items-center justify-between">
        <button onClick={() => setScreen("kitchen")} className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl active:scale-95 transition-all"><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="text-xl font-black italic tracking-tighter uppercase">Confirm Order</h1>
        <div className="w-12" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-[2.5rem] shadow-2xl p-10 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex gap-10">
            <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden ring-4 ring-green-600/10 shadow-xl">
              <img src="https://images.unsplash.com/photo-1555939594-58d7cb561404?w=400" className="w-full h-full object-cover" alt="Kitchen" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <UtensilsCrossed className="w-4 h-4 text-green-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Premium Kitchen</span>
              </div>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4">Mardiya Kitchen</h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-green-600 font-black text-sm uppercase italic"><Clock className="w-4 h-4" /> 15 Mins</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-xl border border-transparent dark:border-gray-800">
            <div className="flex justify-between mb-8">
              <h3 className="font-black italic uppercase tracking-tighter">Spice Level</h3>
              <Flame className={spiceLevel > 66 ? 'text-red-500 animate-bounce' : 'text-amber-500'} />
            </div>
            <input type="range" min="0" max="100" value={spiceLevel} onChange={(e) => setSpiceLevel(Number(e.target.value))} className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full appearance-none accent-green-600" />
          </div>

          <div className="space-y-4">
            {getCart().map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 flex justify-between items-center shadow-lg border border-transparent dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center font-black text-green-600 italic">{item.quantity}x</span>
                  <span className="font-black italic uppercase tracking-tighter text-lg">{item.name}</span>
                </div>
                <span className="font-black text-green-600 italic text-xl">₦{item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl border border-transparent dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Scheduling</h3>
              <button onClick={() => setScheduleOrder(!scheduleOrder)} className={`w-16 h-8 rounded-full transition-all relative ${scheduleOrder ? 'bg-green-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all ${scheduleOrder ? 'translate-x-8' : ''}`} />
              </button>
            </div>
            
            {scheduleOrder && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Date</label>
                  <input type="date" className="w-full bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl outline-none font-bold italic border border-transparent focus:border-green-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">Time</label>
                  <input type="time" className="w-full bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl outline-none font-bold italic border border-transparent focus:border-green-500" />
                </div>
              </div>
            )}
          </div>

          <textarea placeholder="Special instructions (allergies, door codes...)" className="w-full bg-white dark:bg-gray-900 rounded-[2rem] p-8 text-sm h-40 resize-none outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 border border-transparent dark:border-gray-800 shadow-xl" />
        </div>

        <button onClick={handleConfirmOrder} className="w-full mt-10 bg-green-600 hover:bg-green-700 text-white font-black py-6 rounded-[2rem] shadow-3xl flex items-center justify-center gap-4 text-xl italic uppercase tracking-tighter active:scale-95 transition-all">
          Secure Checkout <ArrowRight className="w-6 h-6" />
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <AnimatePresence mode="wait">
        {screen === "kitchen" ? (
          <motion.div key="kitchen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <KitchenView />
          </motion.div>
        ) : (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <ConfirmView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
