import { useState, useEffect } from "react";
import {
  Bell,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Phone,
  
  CheckCircle,
  Loader2,
  Package,
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
  const [showNotification, setShowNotification] = useState(false);

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
  const handleAcceptOrder = async () => {
    if (selectedOrder && riderId) {
      const { error } = await riderAcceptOrder(selectedOrder.id, riderId);
      if (!error) {
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
          setActiveTab("ongoing");
          setView("list");
          fetchOrders();
        }, 1500);
      }
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;
    
    if (activeTab === "pending") {
      // For available orders, rejecting just means going back
      setView("list");
      return;
    }

    const { error } = await riderRejectOrder(selectedOrder.id);
    if (!error) {
      fetchOrders();
      setView("list");
    }
  };

  // Helper to change status to Picked Up or Delivered
  const updateStatus = async (status: string) => {
    if (!selectedOrder) return;
    const { error } = await supabase.from('orders').update({ status }).eq('id', selectedOrder.id);
    if (!error) {
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
    <div className="min-h-screen bg-gray-50">
      <RiderNav />
      {view === "list" ? (
        <>
          <div className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">Orders</h1>
              <Bell className="w-6 h-6 text-gray-700" />
            </div>
          </div>

          <div className="max-w-5xl mx-auto p-4">
            <h2 className="text-xl font-bold text-green-600 mb-4">My Orders</h2>
            
            {/* Tabs */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeTab === "pending" ? "bg-green-600 text-white shadow-lg" : "bg-gray-100 text-gray-600"}`}
              >
                Available ({pendingOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("ongoing")}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeTab === "ongoing" ? "bg-green-600 text-white shadow-lg" : "bg-gray-100 text-gray-600"}`}
              >
                Ongoing ({ongoingOrders.length})
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-20 text-gray-400"><Loader2 className="animate-spin mb-2" /><p>Loading...</p></div>
            ) : (
              <div className="space-y-3">
                {(activeTab === "pending" ? pendingOrders : ongoingOrders).map((order) => (
                  <div key={order.id} onClick={() => { setSelectedOrder(order); setView("details"); }} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 cursor-pointer transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
  {order.order_items?.[0]?.menu_items?.image_url ? (
    <img 
      src={order.order_items[0].menu_items.image_url} 
      className="w-full h-full object-cover" 
      alt="Food" 
    />
  ) : (
    <span className="text-3xl">🥘</span>
  )}
</div>
                        <div>
                          <h3 className="font-bold text-gray-900">{order.vendor_profiles?.business_name}</h3>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1"><MapPin size={14} /><span>{order.delivery_address}</span></div>
                          <p className="text-sm mt-1 text-green-600 font-bold">₦{(order.total_amount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-300" />
                    </div>
                  </div>
                ))}
                {(activeTab === "pending" ? pendingOrders : ongoingOrders).length === 0 && (
                  <div className="text-center py-20 opacity-30"><Package size={48} className="mx-auto" /><p>No orders here</p></div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* RESTORED ORIGINAL DESIGN FOR DETAILS */
        <div className="min-h-screen bg-gray-50 animate-fadeIn">
          {showNotification && (
            <div className="fixed top-4 left-4 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slideDown">
              <CheckCircle className="w-6 h-6" /><span className="font-bold">Order accepted! Proceed to pickup.</span>
            </div>
          )}

          <div className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
              <ArrowLeft className="w-6 h-6 cursor-pointer text-gray-700" onClick={() => setView("list")} />
              <h1 className="text-lg font-bold text-gray-900">Order details</h1>
              <div className="w-6"></div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto p-4 pb-32">
            {/* Pickup Info */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-5 mb-4 border-l-4 border-green-500 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-green-600" /><h3 className="font-bold text-green-700">Pick Up</h3>
              </div>
              <p className="text-sm font-bold text-gray-800">{selectedOrder.vendor_profiles?.business_name}</p>
              <p className="text-sm text-gray-600">{selectedOrder.vendor_profiles?.business_address}</p>
            </div>

            {/* Delivery Info */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 mb-4 border-l-4 border-blue-500 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" /><h3 className="font-bold text-blue-700">Delivery</h3>
              </div>
              <p className="text-sm text-gray-700">{selectedOrder.delivery_address}</p>
            </div>
 <div className="flex items-center gap-2 mt-2">
    <Phone size={14} className="text-green-600" />
    <a href={`tel:${selectedOrder.vendor_profiles?.business_phone}`} className="text-xs text-green-600 font-bold">
      {selectedOrder.vendor_profiles?.business_phone || "No phone provided"}
    </a>
  </div>
            {/* Customer Contact */}
            <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-black text-gray-400">
                  {selectedOrder.customer_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{selectedOrder.customer_name}</h3>
                  <div className="flex items-center gap-2 mt-1"><Phone className="w-4 h-4 text-green-600" />
                    <a href={`tel:${selectedOrder.customer_phone}`} className="text-sm text-green-600 font-bold">{selectedOrder.customer_phone}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Financials & Items */}
            <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-200">
              <div className="flex justify-between mb-4">
                <p className="text-sm text-gray-500 font-bold uppercase">Order ID: {selectedOrder.id.slice(0, 8)}</p>
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full font-bold">Wallet Payment</span>
              </div>

              {/* Real items from Supabase */}
              <div className="space-y-3 mb-6 border-b pb-4">
                {selectedOrder.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">x{item.quantity} {item.menu_items?.name}</span>
                    <span className="font-bold text-gray-900">₦{(item.price_at_order || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-bold">₦{(selectedOrder.total_amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-lg font-black pt-2 border-t text-green-700"><span>TOTAL</span><span>₦{(selectedOrder.total_amount || 0).toLocaleString()}</span></div>
              </div>
            </div>

            {/* Special Instructions */}
            {selectedOrder.special_instructions && (
              <div className="bg-amber-50 rounded-2xl p-5 mb-4 border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-2">Instructions</h4>
                <p className="text-sm text-amber-800 italic">"{selectedOrder.special_instructions}"</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-2xl">
              <div className="max-w-md mx-auto">
                {activeTab === "pending" ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleRejectOrder} 
                      className="flex-1 py-4 border-2 border-red-500 text-red-500 font-bold rounded-xl"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={handleAcceptOrder} 
                      className="flex-2 w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg"
                    >
                      Accept Order
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleRejectOrder} 
                      className="flex-1 py-4 border-2 border-red-500 text-red-500 font-bold rounded-xl"
                    >
                      Reject
                    </button>
                    {selectedOrder.status === 'accepted' ? (
                      <button 
                        onClick={() => updateStatus('picked_up')} 
                        className="flex-2 w-full py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg"
                      >
                        Mark as Picked Up
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateStatus('completed')} 
                        className="flex-2 w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderOrder;