import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  AlertTriangle,
  X,
} from "lucide-react";
import { RiderNav } from "../component/RiderNav";
import { supabase } from "../../services/authService";
import { riderAcceptOrder, getAvailableDeliveries, riderRejectOrder } from "../../services/api";

const RiderOrder = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "ongoing">("pending");
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [ongoingOrders, setOngoingOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [view, setView] = useState<"list" | "details">("list");
  const [riderId, setRiderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRider, setIsRider] = useState(true);
  const [notification, setNotification] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [modal, setModal] = useState<{ show: boolean, type: 'accept' | 'reject' | null }>({ show: false, type: null });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: rider } = await supabase
          .from('riders')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (rider) {
          setRiderId(rider.id);
          setIsRider(true);
        } else {
          setIsRider(false);
          setLoading(false);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (riderId) {
      fetchOrders();
    }
  }, [riderId, activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (activeTab === "pending") {
        const { data: available } = await getAvailableDeliveries();
        setPendingOrders(available || []);
      } else {
        const { data: ongoing } = await supabase
          .from('orders')
          .select(`
            *,
            vendor_profiles(business_name, business_address, business_phone),
            order_items(
              quantity, 
              price_at_order, 
              menu_items(name, image_url)
            )
          `)
          .eq('rider_id', riderId)
          .in('status', ['accepted', 'picked_up']);
        setOngoingOrders(ongoing || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAcceptOrder = async () => {
    if (selectedOrder && riderId) {
      setLoading(true);
      const { error } = await riderAcceptOrder(selectedOrder.id, riderId);
      if (!error) {
        showToast("Order accepted! Proceed to pickup.");
        setActiveTab("ongoing");
        setView("list");
        fetchOrders();
      } else {
        showToast("Failed to accept order", "error");
      }
      setLoading(false);
      setModal({ show: false, type: null });
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    const { error } = await riderRejectOrder(selectedOrder.id);
    if (!error) {
      showToast("Order rejected successfully", "error");
      fetchOrders();
      setView("list");
    } else {
      showToast("Failed to reject order", "error");
    }
    setLoading(false);
    setModal({ show: false, type: null });
  };

  const updateStatus = async (status: string) => {
    if (!selectedOrder) return;
    const { error } = await supabase.from('orders').update({ status }).eq('id', selectedOrder.id);
    if (!error) {
      showToast(status === 'picked_up' ? "Order Picked Up!" : "Order Delivered!");
      fetchOrders();
      setView("list");
    }
  };

  if (!isRider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">This account is not registered as a Rider.</p>
        <button onClick={() => window.location.href = '/rider-registration'} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold">
          Register as Rider
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <RiderNav />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-4 right-4 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500"
            } text-white`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            <span className="font-bold">{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="ml-auto">
              <X className="w-5 h-5 opacity-70" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setModal({ show: false, type: null })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl overflow-hidden"
            >
              <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center ${
                modal.type === 'accept' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}>
                {modal.type === 'accept' ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-gray-800">
                {modal.type === 'accept' ? "Accept Mission?" : "Reject Order?"}
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                {modal.type === 'accept' 
                  ? "Are you sure you want to take this delivery? Once accepted, you're responsible for the shipment."
                  : "Are you sure you want to decline this order? This action cannot be undone."}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setModal({ show: false, type: null })}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button 
                  onClick={modal.type === 'accept' ? handleAcceptOrder : handleRejectOrder}
                  className={`flex-1 py-4 text-white font-bold rounded-2xl active:scale-95 transition-transform shadow-lg ${
                    modal.type === 'accept' ? "bg-green-600 shadow-green-500/20" : "bg-red-600 shadow-red-500/20"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {view === "list" ? (
        <>
          <div className="bg-white shadow-sm sticky top-0 z-10 transition-all">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800 italic uppercase tracking-tighter">My Orders</h1>
              <Bell className="w-6 h-6 text-gray-700 hover:text-green-600 cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 py-4 rounded-2xl font-black italic uppercase tracking-widest transition-all ${
                  activeTab === "pending" 
                  ? "bg-green-600 text-white shadow-xl shadow-green-600/20 scale-105" 
                  : "bg-white text-gray-400 border border-gray-100 shadow-sm"
                }`}
              >
                Available <span className="ml-1 opacity-70">({pendingOrders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("ongoing")}
                className={`flex-1 py-4 rounded-2xl font-black italic uppercase tracking-widest transition-all ${
                  activeTab === "ongoing" 
                  ? "bg-green-600 text-white shadow-xl shadow-green-600/20 scale-105" 
                  : "bg-white text-gray-400 border border-gray-100 shadow-sm"
                }`}
              >
                Ongoing <span className="ml-1 opacity-70">({ongoingOrders.length})</span>
              </button>
            </div>

            {loading && (pendingOrders.length === 0 && ongoingOrders.length === 0) ? (
              <div className="flex flex-col items-center py-32 text-gray-300">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-bold italic uppercase tracking-widest">Scanning network...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(activeTab === "pending" ? pendingOrders : ongoingOrders).map((order) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={order.id} 
                    onClick={() => { setSelectedOrder(order); setView("details"); }} 
                    className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 hover:border-green-300 hover:shadow-2xl cursor-pointer transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-green-50 rounded-[1.5rem] flex items-center justify-center overflow-hidden shadow-inner group-hover:rotate-6 transition-transform">
                          {order.order_items?.[0]?.menu_items?.image_url ? (
                            <img 
                              src={order.order_items[0].menu_items.image_url} 
                              className="w-full h-full object-cover" 
                              alt="Food" 
                            />
                          ) : (
                            <span className="text-4xl">🥘</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-black italic text-gray-800 uppercase tracking-tighter">
                            {order.vendor_profiles?.business_name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1 font-bold italic uppercase">
                            <MapPin size={12} className="text-green-500" />
                            <span className="truncate max-w-[150px]">{order.delivery_address}</span>
                          </div>
                          <p className="text-xl font-black text-green-600 italic mt-2 tracking-tighter">
                            ₦{(order.total_amount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:translate-x-2 transition-transform">
                        <ChevronRight className="text-gray-300 w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>
                ))}
                {(activeTab === "pending" ? pendingOrders : ongoingOrders).length === 0 && (
                  <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <Package size={64} className="mx-auto text-gray-100 mb-4" />
                    <p className="text-gray-300 font-bold italic uppercase tracking-widest">No active deployments</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="min-h-screen bg-gray-50 animate-fadeIn h-full flex flex-col">
          <div className="bg-white shadow-sm sticky top-0 z-10 transition-all">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <button 
                onClick={() => setView("list")}
                className="p-3 bg-gray-50 rounded-2xl text-gray-700 active:scale-90 transition-transform"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-black italic uppercase tracking-tighter text-gray-800">Deployment Intel</h1>
              <div className="w-12"></div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto p-6 pb-40 space-y-6 w-full">
            {/* Intel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-[2rem] p-6 shadow-xl border-l-[6px] border-green-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-50 rounded-2xl"><MapPin className="w-5 h-5 text-green-600" /></div>
                  <h3 className="font-black italic uppercase tracking-widest text-green-600 text-xs">Origin Node</h3>
                </div>
                <p className="font-black text-gray-800 italic uppercase tracking-tighter">{selectedOrder.vendor_profiles?.business_name}</p>
                <p className="text-xs text-gray-400 font-bold mt-1 uppercase leading-relaxed">{selectedOrder.vendor_profiles?.business_address}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Phone size={14} className="text-green-600" />
                  <a href={`tel:${selectedOrder.vendor_profiles?.business_phone}`} className="text-xs text-green-600 font-black italic tracking-widest hover:underline">
                    {selectedOrder.vendor_profiles?.business_phone || "UNREACHABLE"}
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow-xl border-l-[6px] border-blue-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-50 rounded-2xl"><MapPin className="w-5 h-5 text-blue-600" /></div>
                  <h3 className="font-black italic uppercase tracking-widest text-blue-600 text-xs">Target Destination</h3>
                </div>
                <p className="text-sm text-gray-700 font-bold uppercase leading-relaxed">{selectedOrder.delivery_address}</p>
              </div>
            </div>

            {/* Target Contact */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl font-black text-gray-300 italic shadow-inner">
                {selectedOrder.customer_name?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 italic">Target Contact</p>
                <h3 className="font-black text-gray-800 text-2xl italic tracking-tighter uppercase">{selectedOrder.customer_name || "Unknown User"}</h3>
                <div className="mt-2 text-green-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${selectedOrder.customer_phone}`} className="text-sm font-black italic tracking-widest hover:underline">{selectedOrder.customer_phone || "NO SIGNAL"}</a>
                </div>
              </div>
            </div>

            {/* Manifest */}
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Package size={120} className="text-gray-900" />
              </div>
              
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase text-gray-800">Deployment Manifest</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">REF ID: {selectedOrder.id.slice(0, 12)}</p>
                </div>
                <span className="text-[10px] font-black bg-gray-100 px-4 py-2 rounded-full uppercase tracking-widest italic text-gray-500">Verified Protocol</span>
              </div>

              <div className="space-y-6 mb-10 border-b border-dashed border-gray-100 pb-10">
                {selectedOrder.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black italic text-green-600 border border-gray-100">x{item.quantity}</span>
                      <span className="text-gray-800 font-bold italic uppercase tracking-tight">{item.menu_items?.name}</span>
                    </div>
                    <span className="font-black text-gray-800 italic tracking-tighter">₦{(item.price_at_order || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs text-gray-400 font-black uppercase tracking-widest italic">
                  <span>Subtotal</span>
                  <span>₦{(selectedOrder.total_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline pt-4 border-t-2 border-gray-50">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 italic">Total Value</span>
                  <span className="text-5xl font-black italic tracking-tighter text-green-600">₦{(selectedOrder.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Operations Log */}
            {selectedOrder.special_instructions && (
              <div className="bg-amber-50/50 rounded-[2rem] p-8 border border-amber-100 flex gap-4">
                <div className="p-3 bg-amber-100 rounded-2xl h-fit"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
                <div>
                  <h4 className="font-black italic uppercase tracking-widest text-amber-700 text-xs mb-2">Operation Briefing</h4>
                  <p className="text-sm text-amber-800 italic font-medium leading-relaxed">"{selectedOrder.special_instructions}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Tactical Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-6 z-40">
            <div className="max-w-md mx-auto flex gap-4">
              {activeTab === "pending" ? (
                <>
                  <button 
                    onClick={() => setModal({ show: true, type: 'reject' })} 
                    className="flex-1 py-5 border-2 border-red-500 text-red-500 font-black italic uppercase tracking-widest rounded-2xl active:scale-95 transition-all hover:bg-red-50"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => setModal({ show: true, type: 'accept' })} 
                    className="flex-[2] py-5 bg-green-600 text-white font-black italic uppercase tracking-widest rounded-2xl shadow-2xl shadow-green-600/30 active:scale-95 transition-all hover:bg-green-700"
                  >
                    Accept Mission
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setModal({ show: true, type: 'reject' })} 
                    className="flex-1 py-5 border-2 border-red-500 text-red-500 font-black italic uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
                  >
                    Reject
                  </button>
                  {selectedOrder.status === 'accepted' ? (
                    <button 
                      onClick={() => updateStatus('picked_up')} 
                      className="flex-[2] py-5 bg-orange-500 text-white font-black italic uppercase tracking-widest rounded-2xl shadow-2xl shadow-orange-500/30 active:scale-95 transition-all"
                    >
                      Secure Package
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateStatus('completed')} 
                      className="flex-[2] py-5 bg-blue-600 text-white font-black italic uppercase tracking-widest rounded-2xl shadow-2xl shadow-blue-600/30 active:scale-95 transition-all"
                    >
                      Complete Deployment
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderOrder;
