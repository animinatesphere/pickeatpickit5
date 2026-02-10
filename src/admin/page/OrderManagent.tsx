import React, { useState, useEffect } from "react";
import { Menu, Bell, ChevronRight, ArrowLeft } from "lucide-react";
import { getAllOrders, getAdminOrderDetails } from "../../services/api";

type OrderStatus = "Completed" | "Pending" | "Cancelled" | "Preparing" | "Accepted" | "Picked_up";
type StatusTab = "All" | "Pending" | "Completed" | "Cancelled";
type Screen = "main" | "details" | "status-control";

interface Order {
  id: string;
  name: string;
  date: string;
  amount: string;
  status: OrderStatus;
  image: string;
}

interface OrderDetail {
  id: string;
  title: string;
  price: string;
  quantity: string;
  status: string;
  items: Array<{
    quantity: number;
    name: string;
    price: string;
  }>;
  serviceCharges: string;
  deliveryCharges: string;
  promoCode: string;
  total: string;
  deliverTo: string;
  assignedRider: string;
}

interface StatusOrder {
  id: string;
  name: string;
  location: string;
  time: string;
  status: string;
  image: string;
  showCheckout?: boolean;
}

const OrderManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StatusTab>("All");
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllOrders();
      if (!error && data) {
        const formattedOrders: Order[] = data.map(o => ({
          id: o.id,
          name: o.users ? `${o.users.firstname} ${o.users.lastname}` : (o.restaurant_name || "Unknown"),
          date: new Date(o.created_at).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          amount: `₦${(o.total_amount || 0).toLocaleString()}`,
          status: (o.status.charAt(0).toUpperCase() + o.status.slice(1)) as OrderStatus,
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop" // Placeholder image for now
        }));
        setOrders(formattedOrders);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCheckClick = async (orderId: string) => {
    try {
      const { data, error } = await getAdminOrderDetails(orderId);
      if (!error && data) {
        const detail: OrderDetail = {
          id: data.id.slice(0, 4), // Using short ID for display
          title: data.order_items?.[0]?.menu_items?.name || "Multiple Items",
          price: `₦${(data.total_amount || 0).toLocaleString()}`,
          quantity: `X${data.items_count || 1}`,
          status: data.status.toUpperCase(),
          items: (data.order_items || []).map((item: any) => ({
            quantity: item.quantity,
            name: item.menu_items?.name || "Unknown Item",
            price: `₦${(item.price || 0).toLocaleString()}`
          })),
          serviceCharges: "₦500", // Fixed or calculated
          deliveryCharges: "₦1,000",
          promoCode: "None",
          total: `₦${(data.total_amount || 0).toLocaleString()}`,
          deliverTo: data.delivery_address,
          assignedRider: data.riders ? `${data.riders.firstname} ${data.riders.lastname}` : "Not Assigned"
        };
        setSelectedOrder(detail);
        setCurrentScreen("details");
      }
    } catch (err) {
      console.error("Failed to fetch order details", err);
    }
  };

  const statusOrders: StatusOrder[] = orders.slice(0, 5).map(o => ({
    id: o.id,
    name: o.name,
    location: "Vila Nova Estate, New Agp Ext.", // Hardcoded as it's not in the summary item
    time: o.date,
    status: o.status,
    image: o.image,
    showCheckout: o.status === "Preparing"
  }));

  const handleStatusControlClick = () => {
    setCurrentScreen("status-control");
  };

  const handleBackClick = () => {
    setCurrentScreen("main");
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      case "preparing":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-600";
      case "pending":
        return "bg-yellow-600";
      case "cancelled":
        return "bg-red-600";
      case "preparing":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  const filteredOrders =
    activeTab === "All"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="w-full bg-white dark:bg-gray-950 min-h-screen">
        {/* Main Screen */}
        {currentScreen === "main" && (
          <div className="animate-fadeIn">
            {/* Header */}
            <div className="bg-green-600 dark:bg-green-700 text-white p-6 sticky top-0 z-40 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <button className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-95">
                  <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold font-inter italic tracking-tighter uppercase whitespace-nowrap">Order Management</h1>
                <button className="hover:bg-white/20 p-2 rounded-xl transition-all relative active:scale-95">
                  <Bell size={24} />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 dark:border-green-700 animate-pulse"></span>
                </button>
              </div>

              {/* Status Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                {(
                  ["All", "Pending", "Completed", "Cancelled"] as StatusTab[]
                ).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-2xl whitespace-nowrap transition-all font-bold text-xs uppercase tracking-widest italic ${
                      activeTab === tab
                        ? "bg-white text-green-600 shadow-xl scale-105"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Control Buttons */}
              <button
                onClick={handleStatusControlClick}
                className="w-full flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-[2rem] hover:shadow-2xl transition-all transform hover:scale-[1.01] group shadow-xl"
              >
                <span className="font-bold text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">
                  Order status control
                </span>
                <ChevronRight
                  className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform"
                  size={24}
                />
              </button>

              <button className="w-full flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-[2rem] hover:shadow-2xl transition-all transform hover:scale-[1.01] group shadow-xl">
                <div>
                  <span className="font-bold text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">
                    Order dispute{" "}
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-black ml-2 animate-pulse">(5)</span>
                </div>
                <ChevronRight
                  className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform"
                  size={24}
                />
              </button>

              {/* Orders List */}
              <div className="space-y-4 mt-6">
                {filteredOrders.map((order, index) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-[2.5rem] p-5 hover:shadow-2xl transition-all transform hover:scale-[1.01] animate-slideUp shadow-xl overflow-hidden relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex gap-5">
                      <div className="relative">
                        <img
                          src={order.image}
                          alt={order.name}
                          className="w-24 h-24 rounded-3xl object-cover shadow-2xl"
                        />
                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${getStatusBgColor(order.status)} rounded-full border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center`}>
                          <span className="text-white text-[10px] font-black">!</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase whitespace-nowrap">
                              {order.name}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic mt-1">
                              {order.date}
                            </p>
                          </div>
                          {order.status !== "Completed" && (
                            <button
                              onClick={() => handleCheckClick(order.id)}
                              className="px-5 py-2 bg-green-600 dark:bg-green-700 text-white text-[10px] font-black uppercase italic tracking-widest rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg shadow-green-500/20 active:scale-95"
                            >
                              Details
                            </button>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic">
                            Amt:{" "}
                            <span className="font-black text-gray-800 dark:text-gray-100 text-sm font-inter not-italic">
                              {order.amount}
                            </span>
                          </p>
                          <span
                            className={`font-black text-[10px] uppercase italic tracking-widest px-3 py-1 bg-opacity-10 rounded-lg ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Order Details Screen */}
        {currentScreen === "details" && selectedOrder && (
          <div className="animate-slideIn h-screen overflow-y-auto">
            {/* Header */}
            <div className="bg-green-600 dark:bg-green-700 text-white p-6 sticky top-0 z-40 shadow-xl">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBackClick}
                  className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-95"
                >
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold font-inter italic tracking-tighter uppercase">Order Details</h1>
                <button className="hover:bg-white/20 p-2 rounded-xl transition-all relative">
                  <Bell size={24} />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 dark:border-green-700 animate-pulse"></span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Main Item Card */}
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-6 transform hover:scale-[1.01] transition-all border border-transparent dark:border-gray-800">
                <div className="flex gap-6 items-center">
                  <img
                    src="https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop"
                    alt={selectedOrder.title}
                    className="w-32 h-32 rounded-[2rem] object-cover shadow-2xl rotate-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase whitespace-nowrap">
                          {selectedOrder.title}
                        </h2>
                        <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-2 font-inter italic tracking-tighter">
                          {selectedOrder.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-gray-800 dark:text-gray-100 font-inter italic">
                          {selectedOrder.quantity}
                        </span>
                        <div className="mt-2 px-4 py-1.5 bg-green-600 dark:bg-green-700 text-white text-[10px] rounded-xl font-black uppercase italic tracking-widest shadow-lg shadow-green-500/20">
                          {selectedOrder.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-transparent dark:border-gray-800">
                <div className="flex justify-between items-center pb-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest italic mb-1">Receipt ID</span>
                    <span className="font-black text-green-600 dark:text-green-400 text-2xl font-inter italic tracking-tighter">
                      #{selectedOrder.id}
                    </span>
                  </div>
                  <span className="text-green-600 dark:text-green-500 text-[10px] font-black uppercase italic tracking-widest bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-full">
                    order just now
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-green-600 dark:text-green-400 font-black font-inter text-lg group-hover:scale-110 transition-transform">
                          x{item.quantity}
                        </span>
                        <span className="text-gray-700 dark:text-gray-200 font-bold font-inter tracking-tight uppercase text-sm">{item.name}</span>
                      </div>
                      <span className="font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Charges */}
                <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest italic">
                    <span className="text-gray-400 dark:text-gray-500">Services Charges</span>
                    <span className="text-gray-800 dark:text-gray-100">
                      {selectedOrder.serviceCharges}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest italic">
                    <span className="text-gray-400 dark:text-gray-500">Delivery Charges</span>
                    <span className="text-gray-800 dark:text-gray-100">
                      {selectedOrder.deliveryCharges}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest italic">
                    <span className="text-gray-400 dark:text-gray-500">Promo Applied</span>
                    <span className="text-red-600 font-black">
                      {selectedOrder.promoCode}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-6 border-t-4 border-gray-100 dark:border-gray-800">
                  <span className="text-xl font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">Grand Total</span>
                  <span className="text-4xl font-black text-green-600 dark:text-green-400 font-inter italic tracking-tighter">
                    {selectedOrder.total}
                  </span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-[2.5rem] shadow-2xl p-8 space-y-8 border border-green-100 dark:border-green-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 dark:bg-green-400/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest italic mb-4">
                    DELIVERY LOGISTICS
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 flex-shrink-0">
                      <span className="text-2xl">📍</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-100 font-bold font-inter leading-relaxed text-sm">
                      {selectedOrder.deliverTo}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl border-4 border-green-50 dark:border-gray-900 flex-shrink-0">
                      <span className="text-2xl">🏍️</span>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest italic mb-1">
                        ASSIGNED RIDER
                      </h3>
                      <p className="text-gray-800 dark:text-gray-100 font-black font-inter uppercase text-sm tracking-tight italic">
                        {selectedOrder.assignedRider}
                      </p>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto px-8 py-4 bg-green-600 dark:bg-green-700 text-white rounded-2xl hover:bg-green-700 dark:hover:bg-green-600 transition-all transform hover:scale-105 shadow-xl shadow-green-500/20 font-black text-xs uppercase italic tracking-widest active:scale-95">
                    Reassign Rider
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Control Screen */}
        {currentScreen === "status-control" && (
          <div className="animate-slideIn h-screen overflow-y-auto">
            {/* Header */}
            <div className="bg-green-600 dark:bg-green-700 text-white p-6 sticky top-0 z-40 shadow-xl">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBackClick}
                  className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-95"
                >
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold font-inter italic tracking-tighter uppercase whitespace-nowrap">Status Control</h1>
                <button className="hover:bg-white/20 p-2 rounded-xl transition-all relative active:scale-95">
                  <Bell size={24} />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600 dark:border-green-700 animate-pulse"></span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {statusOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-6 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all transform hover:scale-[1.01] animate-slideUp border border-transparent dark:border-gray-800"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex gap-5">
                    <img
                      src={order.image}
                      alt={order.name}
                      className="w-24 h-24 rounded-[2rem] object-cover shadow-2xl rotate-2"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase text-lg border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
                            {order.name}
                          </h3>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest italic flex items-center gap-2 truncate">
                            <span className="text-green-600 dark:text-green-500">📍</span>
                            {order.location}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase italic tracking-widest mt-3">
                            TIMESTAMP:{" "}
                            <span className="text-green-600 dark:text-green-500 font-inter not-italic tracking-tighter">{order.time}</span>
                          </p>
                        </div>
                        <span
                          className={`px-4 py-1.5 ${getStatusBgColor(
                            order.status
                          )} text-white text-[10px] rounded-xl font-black uppercase italic tracking-widest shadow-lg shadow-green-500/10 ml-2`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="flex gap-3 mt-6">
                        {order.showCheckout && (
                          <button className="flex-1 px-5 py-3 bg-green-600 dark:bg-green-700 text-white text-[10px] font-black uppercase italic tracking-widest rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 shadow-xl shadow-green-500/20">
                            Check Out
                          </button>
                        )}
                        {order.status === "Completed" && (
                          <button className="flex-1 px-5 py-3 border-2 border-green-600 dark:border-green-700 text-green-600 dark:text-green-400 text-[10px] font-black uppercase italic tracking-widest rounded-xl hover:bg-green-50 dark:hover:bg-green-900/10 transition-all transform hover:scale-105">
                            Undo Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default OrderManagement;
