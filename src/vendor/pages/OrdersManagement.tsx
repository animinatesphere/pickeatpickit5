import { useState, useEffect } from "react";
import { MapPin, Clock, Check, Package } from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { supabase } from "../../services/authService"; // Add this import
import {
  getVendorOrders,
  updateOrderStatus,
  addTrackingUpdate,
} from "../../services/api";

interface OrderData {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  created_at: string;
  status: string;
  total_amount: number;
  order_items?: { menu_items?: { image_url?: string } }[];
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  time: string;
  image: string;
  status: "pending" | "accepted" | "canceled" | "completed";
  total: number;
}

const OrdersManagement = () => {
  const [activeTab, setActiveTab] = useState<
    "pending" | "accepted" | "canceled" | "completed"
  >("pending");
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null); // Add this
  const [loading, setLoading] = useState(true); // Add this

  // Update useEffect to get vendor ID first
  useEffect(() => {
    const initializeOrders = async () => {
      try {
        // Get current user from session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          console.error("No user session found");
          setLoading(false);
          return;
        }

        // Get vendor ID from vendors table
        const { data: vendorData, error: vendorError } = await supabase
          .from("vendors")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (vendorError || !vendorData) {
          console.error("Vendor not found:", vendorError);
          setLoading(false);
          return;
        }

        setVendorId(vendorData.id);

        // Now load orders with the vendor ID
        // Inside OrdersManagement.tsx -> initializeOrders
        // Inside OrdersManagement.tsx -> initializeOrders
        // Inside OrdersManagement.tsx -> initializeOrders
        const { data, error } = await getVendorOrders(vendorData.id);

        console.log("📦 Raw Orders Data:", data); // Debug log

        if (!error && data) {
          const formattedOrders: Order[] = data.map((order: OrderData) => {
            const customerName = order.customer_name || "Guest";
            const customerPhone = order.customer_phone || "No Phone";
            let image = "🍽️";
            if (
              order.order_items &&
              order.order_items[0]?.menu_items?.image_url
            ) {
              image = order.order_items[0].menu_items.image_url;
            }
            return {
              id: order.id,
              customerName,
              phone: customerPhone,
              address: order.delivery_address || "No address",
              time: new Date(order.created_at).toLocaleString(),
              image,
              status: order.status as Order["status"],
              total: order.total_amount || 0,
            };
          });

          console.log("✅ Formatted Orders:", formattedOrders); // Debug log
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error("Error initializing orders:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeOrders();
  }, []);

  // Fix the handler types
  const handleAccept = async (orderId: string) => {
    const { error } = await updateOrderStatus(orderId, "preparing");
    if (!error) {
      // Add tracking update
      await addTrackingUpdate(orderId, {
        status: "accepted",
        message: "Your order has been accepted and is being prepared",
        timestamp: new Date().toISOString(),
      });

      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: "accepted" as const }
            : order,
        ),
      );
    }
  };

  const handleCancel = async (orderId: string) => {
    const { error } = await updateOrderStatus(orderId, "canceled");
    if (!error) {
      // Add tracking update
      await addTrackingUpdate(orderId, {
        status: "canceled",
        message: "Your order has been canceled",
        timestamp: new Date().toISOString(),
      });

      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: "canceled" as const }
            : order,
        ),
      );
    }
  };

  const handleCheckOut = async (orderId: string) => {
    const { error } = await updateOrderStatus(orderId, "completed");
    if (!error) {
      // Add tracking update
      await addTrackingUpdate(orderId, {
        status: "completed",
        message: "Your order has been delivered",
        timestamp: new Date().toISOString(),
      });

      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: "completed" as const }
            : order,
        ),
      );
    }
  };

  const filteredOrders = orders.filter((order) => order.status === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            Pending
          </span>
        );
      case "accepted":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Preparing
          </span>
        );
      case "canceled":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            Completed
          </span>
        );
      default:
        return <p>Nothing for now </p>;
    }
  };

  const getOrderCount = (status: string) => {
    return orders.filter((order) => order.status === status).length;
  };

  // Add loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!vendorId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold text-lg mb-4">
            Vendor not found
          </p>
          <p className="text-gray-600">Please log in again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-24">
      <VendorNav />
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold">Orders</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* My Orders Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-4 sm:mb-6">
          My Orders
        </h2>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "pending"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {activeTab === "pending" && <Check className="w-4 h-4" />}
            <span className="text-sm">Pending</span>
            {getOrderCount("pending") > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-green-600 text-xs font-bold">
                {getOrderCount("pending")}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("accepted")}
            className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "accepted"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {activeTab === "accepted" && <Check className="w-4 h-4" />}
            <span className="text-sm">Accepted</span>
            {getOrderCount("accepted") > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-green-600 text-xs font-bold">
                {getOrderCount("accepted")}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("canceled")}
            className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "canceled"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {activeTab === "canceled" && <Check className="w-4 h-4" />}
            <span className="text-sm">Canceled</span>
            {getOrderCount("canceled") > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-green-600 text-xs font-bold">
                {getOrderCount("canceled")}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "completed"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {activeTab === "completed" && <Check className="w-4 h-4" />}
            <span className="text-sm">Completed</span>
            {getOrderCount("completed") > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-green-600 text-xs font-bold">
                {getOrderCount("completed")}
              </span>
            )}
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold">
                No {activeTab} orders
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Orders will appear here when available
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6 transform hover:-translate-y-1"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Order Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden mx-auto sm:mx-0">
                    {order.image.startsWith("http") ? (
                      <img
                        src={order.image}
                        alt="Food"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/80?text=Food"; // Fallback if link is broken
                        }}
                      />
                    ) : (
                      <span className="text-2xl sm:text-4xl">
                        {order.image}
                      </span>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                          {order.customerName}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono font-semibold">
                          Order ID: {order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-1">
                        <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                          {order.phone}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Display Phone Number as a link */}
                    <div className="mb-3">
                      <a
                        href={`tel:${order.phone}`}
                        className="text-emerald-600 font-bold text-sm hover:underline flex items-center justify-center sm:justify-start gap-1"
                      >
                        📞 {order.phone || "No phone provided"}
                      </a>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 text-gray-600 text-sm mb-3">
                      <div className="flex items-start gap-2 justify-center sm:justify-start">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                        <span className="line-clamp-2 text-center sm:text-left">
                          {order.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-2 text-green-600 text-sm font-semibold">
                      <Clock className="w-4 h-4" />
                      <span>Time: {order.time}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-green-600 bg-green-50 hover:bg-green-100 transition-all duration-300 hover:shadow-md text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAccept(order.id)}
                        className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
                      >
                        Accept
                      </button>
                    </>
                  )}
                  {order.status === "accepted" && (
                    <button
                      onClick={() => handleCheckOut(order.id)}
                      className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
                    >
                      Check Out
                    </button>
                  )}
                  {order.status === "canceled" && (
                    <div className="w-full text-center py-2.5 px-4 text-gray-500 text-sm font-semibold">
                      Order was canceled
                    </div>
                  )}
                  {order.status === "completed" && (
                    <div className="w-full text-center py-2.5 px-4 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Order Completed
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;
