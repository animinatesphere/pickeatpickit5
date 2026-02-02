import React, { useState, useEffect } from "react";
import { Bell, ChevronLeft, CheckCircle, Clock, Package, Truck, MapPin, RefreshCw, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../component/Navbar";
import { authService } from "../services/authService";
import { supabase } from "../services/authService";
import { getOrderTracking } from "../services/api";

interface Order {
  id: string;
  restaurant_name: string;
  items_count: number;
  total_amount: number;
  scheduled_time: string;
  status: "pending" | "completed" | "canceled" | "accepted";
}

interface OrderProgress {
  time: string;
  message: string;
  completed: boolean;
}

interface TrackingUpdate {
  id: string;
  status: string;
  message: string;
  timestamp: string;
}

const Booking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"accepted" | "canceled" | "completed">("accepted");
  const [currentView, setCurrentView] = useState<"bookings" | "track">("bookings");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const authUser = await authService.getCurrentUser();
        if (!authUser) return;

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedOrders = (data || []).map((order: any) => ({
          id: order.id,
          restaurant_name: order.restaurant_name,
          items_count: order.items_count || 0,
          total_amount: order.total_amount || 0,
          scheduled_time: order.scheduled_time,
          status: (order.status || "pending") as "pending" | "completed" | "canceled" | "accepted",
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();

    const subscription = supabase
      .channel("user-orders-changes")
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${authService.getCurrentUser().then((u) => u?.id)}`,
        },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
             // Handle insert
          } else if (payload.eventType === "UPDATE") {
             // Handle update
          }
        }
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const orderProgress: OrderProgress[] = [
    { time: "09:45am", message: "Order confirmed", completed: true },
    { time: "09:47am", message: "Kitchen preparing", completed: true },
    { time: "09:50am", message: "Courier assigned", completed: true },
    { time: "09:55am", message: "Out for delivery", completed: false },
    { time: "10:03am", message: "Arriving soon", completed: false },
  ];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "accepted") return order.status === "pending" || order.status === "accepted";
    if (activeTab === "canceled") return order.status === "canceled";
    if (activeTab === "completed") return order.status === "completed";
    return true;
  });

  const handleTrackOrder = async (order: Order) => {
    setSelectedOrder(order);
    setCurrentView("track");
    const { data: updates } = await getOrderTracking(order.id);
    if (updates) setTrackingUpdates(updates);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": case "accepted": return "bg-orange-500 text-white";
      case "completed": return "bg-green-600 text-white";
      case "canceled": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 font-inter pb-20">
      <Navbar />

      <AnimatePresence mode="wait">
        {currentView === "bookings" ? (
          <motion.div 
            key="bookings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto px-6 py-6"
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase dark:text-white">Orders</h1>
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-950"></span>
              </div>
            </div>

            {/* Custom Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl mb-8 relative">
              {["accepted", "completed", "canceled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-3 text-sm font-black uppercase italic tracking-widest relative z-10 transition-colors ${
                    activeTab === tab ? "text-white" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-green-600 rounded-xl -z-10 shadow-lg"
                    />
                  )}
                </button>
              ))}
            </div>

            {loading ? (
               <div className="space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-50 dark:bg-gray-900 rounded-[2rem] animate-pulse" />)}
               </div>
            ) : filteredOrders.length > 0 ? (
              <motion.div 
                layout
                className="space-y-6"
              >
                <AnimatePresence>
                  {filteredOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-50 dark:border-gray-800 shadow-xl group hover:border-green-500/30 transition-all"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                            🍔
                          </div>
                          <div>
                            <h3 className="text-lg font-black italic tracking-tighter uppercase dark:text-white">{order.restaurant_name}</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{order.items_count} ITEMS • ₦{order.total_amount.toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-widest ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pl-20">
                         <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                           <Clock className="w-4 h-4" /> {new Date(order.scheduled_time).toLocaleDateString()}
                         </span>
                         
                         <button
                           onClick={() => order.status === "pending" || order.status === "accepted" ? handleTrackOrder(order) : null}
                           className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all active:scale-95"
                         >
                           {order.status === "pending" || order.status === "accepted" ? "Track Status" : "Re-Order"}
                           <ChevronRight className="w-4 h-4" />
                         </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-40 h-40 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
                  <Package className="w-16 h-16 text-gray-300 dark:text-gray-700" />
                </div>
                <h3 className="text-xl font-black italic tracking-tighter uppercase text-gray-400 dark:text-gray-500">No Orders Found</h3>
                <p className="text-gray-400 text-sm mt-2 max-w-xs">Looks like you haven't made any orders in this category yet.</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="track"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-3xl mx-auto px-6 py-6"
          >
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setCurrentView("bookings")} className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center hover:scale-105 transition-all">
                <ChevronLeft className="w-6 h-6 dark:text-white" />
              </button>
              <h1 className="text-2xl font-black italic tracking-tighter uppercase dark:text-white">Tracking</h1>
            </div>

            {selectedOrder && (
              <div className="space-y-8">
                {/* Code Check */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Truck className="w-32 h-32" />
                  </div>
                  <p className="text-xs font-black uppercase italic tracking-widest opacity-80 mb-2">Security Code</p>
                  <h2 className="text-5xl font-black font-mono tracking-widest mb-4">{selectedOrder.id.slice(0,4)} {selectedOrder.id.slice(4,8)}</h2>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/20 w-fit px-4 py-2 rounded-lg backdrop-blur-md">
                     <CheckCircle className="w-4 h-4" /> Show to courier
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-50 dark:border-gray-800 shadow-xl">
                  <h3 className="text-xl font-black italic tracking-tighter uppercase dark:text-white mb-8">Progress</h3>
                  <div className="space-y-8 pl-4 border-l-2 border-dashed border-gray-200 dark:border-gray-800 ml-4 relative">
                    {(trackingUpdates.length > 0 ? trackingUpdates : orderProgress).map((step: any, i) => (
                      <div key={i} className="relative pl-8">
                        <div className={`absolute -left-[37px] top-0 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 ${step.completed !== false ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-300 dark:bg-gray-700'}`} />
                        <div className="flex justify-between items-start">
                           <div>
                             <p className={`font-bold text-sm ${step.completed !== false ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>{step.message}</p>
                             <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-widest mt-1">Confirmed</p>
                           </div>
                           <span className="text-xs font-black text-gray-400 italic">{step.time || new Date(step.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Driver/ETA */}
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-[2rem] flex items-center justify-between border border-gray-100 dark:border-gray-800">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                       <MapPin className="w-6 h-6 text-green-500" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase italic tracking-widest text-gray-400">Estimated Arrival</p>
                       <p className="text-xl font-black italic text-gray-800 dark:text-white">10:45 AM</p>
                     </div>
                   </div>
                   <button className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                     <RefreshCw className="w-5 h-5" />
                   </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Booking;
