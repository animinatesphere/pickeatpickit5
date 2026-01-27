import React, { useState, useEffect } from "react";
import { Bell, ChevronLeft, CheckCircle, Clock } from "lucide-react";
import { Navbar } from "../component/Navbar";
import { authService } from "../services/authService";
import { supabase } from "../services/authService";
import { getOrderTracking } from "../services/api";

interface Order {
  id: string;
  restaurant_name: string;
  items_count: number;
  total_amount: number; // Changed from total_price
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
  const [activeTab, setActiveTab] = useState<
    "accepted" | "canceled" | "completed"
  >("accepted");
  const [currentView, setCurrentView] = useState<
    "bookings" | "track" | "history"
  >("bookings");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);

  // Fetch user orders on component mount
  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const authUser = await authService.getCurrentUser();

        if (!authUser) {
          console.error("User not authenticated");
          setLoading(false);
          return;
        }

        // Fetch orders for the current user
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          setLoading(false);
          return;
        }

        // Transform data to match Order interface
      const formattedOrders = (data || []).map(
  (order: any) => ({ // Use any here for easier mapping
    id: order.id,
    restaurant_name: order.restaurant_name,
    items_count: order.items_count || 0,
    total_amount: order.total_amount || 0, // Changed from total_price: order.total_price
    scheduled_time: order.scheduled_time,
    status: (order.status || "pending") as
      | "pending"
      | "completed"
      | "canceled"
      | "accepted",
  }),
)

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();

    // Set up real-time listener for order updates
    const subscription = supabase
      .channel("user-orders-changes")
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${authService.getCurrentUser().then((u) => u?.id)}`,
        },
        (payload: {
          eventType: string;
          new: {
            id: string;
            restaurant_name: string;
            items_count: number;
            total_amount: number;
            scheduled_time: string;
            status: string;
          };
        }) => {
          if (payload.eventType === "INSERT") {
            const newOrder: Order = {
              id: payload.new.id,
              restaurant_name: payload.new.restaurant_name,
              items_count: payload.new.items_count,
              total_amount: payload.new.total_amount, // Changed from total_price
              scheduled_time: payload.new.scheduled_time,
              status: (payload.new.status || "pending") as
                | "pending"
                | "completed"
                | "canceled"
                | "accepted",
            };
            setOrders((prev) => [newOrder, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? {
                      ...order,
                      status: (payload.new.status || "pending") as
                        | "pending"
                        | "completed"
                        | "canceled"
                        | "accepted",
                      total_price: payload.new. total_amount,
                    }
                  : order,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const orderProgress: OrderProgress[] = [
    {
      time: "09:45am",
      message: "Mardiya Kitchen has received and confirmed your order",
      completed: true,
    },
    {
      time: "09:47am",
      message: "Mardiya Kitchen is preparing your order",
      completed: true,
    },
    {
      time: "09:50am",
      message: "A courier has been assigned to your order",
      completed: true,
    },
    {
      time: "09:55am",
      message: "The courier is on the way to deliver your order",
      completed: false,
    },
    {
      time: "10:03am",
      message: "The courier is delivering your order",
      completed: false,
    },
  ];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "accepted")
      return order.status === "pending" || order.status === "accepted";
    if (activeTab === "canceled") return order.status === "canceled";
    if (activeTab === "completed") return order.status === "completed";
    return true;
  });

  const handleTrackOrder = async (order: Order) => {
    setSelectedOrder(order);
    setCurrentView("track");

    // Fetch real tracking data
    const { data: updates } = await getOrderTracking(order.id);
    if (updates) {
      setTrackingUpdates(updates);
    }
  };

  const handleReOrder = () => {
    // Re-order logic
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "accepted":
        return "text-orange-500";
      case "completed":
        return "text-green-600";
      case "canceled":
        return "text-red-500";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Bookings iew
  if (currentView === "bookings") {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <Navbar />
        <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="text-xl font-semibold text-gray-800">Bookings</div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            My Bookings
          </h2>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setActiveTab("accepted")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "accepted"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              ✓ Accepted
            </button>
            <button
              onClick={() => setActiveTab("canceled")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "canceled"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Canceled
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "completed"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Completed
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1">
                        {order.restaurant_name}
                      </h3>
                      <p className="text-green-600 font-medium text-sm">
                        Order ID:{" "}
                        <span className="font-semibold">{order.id}</span> |{" "}
                        {order.items_count} items
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-800">
                         ₦{order.total_amount.toLocaleString()}
                      </div>
                      <div
                        className={`text-sm font-semibold ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-gray-500 text-sm">
                      {new Date(order.scheduled_time).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() =>
                        order.status === "pending" ||
                        order.status === "accepted"
                          ? handleTrackOrder(order)
                          : handleReOrder()
                      }
                      className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
                        order.status === "pending" ||
                        order.status === "accepted"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                      }`}
                    >
                      {order.status === "pending" || order.status === "accepted"
                        ? "Track Order"
                        : "Re Order"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="w-32 h-40 bg-gray-100 rounded-lg border-4 border-white shadow-md transform -rotate-12"></div>
                <div className="w-32 h-40 bg-gray-50 rounded-lg border-4 border-white shadow-lg absolute top-0 left-8 transform rotate-6">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-6 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <p className="text-gray-400 text-lg">No orders found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Track Order View
  if (currentView === "track" && selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white px-6 py-4 flex items-center shadow-sm sticky top-0 z-10">
          <button
            onClick={() => setCurrentView("bookings")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="text-xl font-semibold text-gray-800">Track order</div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            Order Progress
          </h2>

          {/* Tracking Code */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 shadow-sm border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Your Tracking Code</p>
            <div className="bg-white rounded-lg p-4 border-2 border-green-300">
              <p className="text-3xl font-bold text-green-600 text-center font-mono tracking-wider">
                {selectedOrder.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Show this code to your rider
            </p>
          </div>

          {/* Progress Timeline - Real Data or Fallback */}
          <div className="relative">
            {trackingUpdates.length > 0
              ? trackingUpdates.map((update, index) => (
                  <div key={update.id} className="flex gap-4 mb-8 relative">
                    {/* Timeline Line */}
                    {index < trackingUpdates.length - 1 && (
                      <div className="absolute left-3 top-8 w-0.5 h-12 bg-green-500"></div>
                    )}

                    {/* Time */}
                    <div className="w-20 flex-shrink-0">
                      <span className="text-sm text-gray-600 font-medium">
                        {new Date(update.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex-1 pb-2">
                      <p className="text-sm text-gray-800 font-medium">
                        {update.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: {update.status}
                      </p>
                    </div>
                  </div>
                ))
              : // Fallback to default progress if no updates exist
                orderProgress.map((progress, index) => (
                  <div key={index} className="flex gap-4 mb-8 relative">
                    {/* Timeline Line */}
                    {index < orderProgress.length - 1 && (
                      <div
                        className={`absolute left-3 top-8 w-0.5 h-12 ${
                          progress.completed ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                    )}

                    {/* Time */}
                    <div className="w-16 flex-shrink-0">
                      <span className="text-sm text-gray-600 font-medium">
                        {progress.time}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {progress.completed ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div className="flex-1 pb-2">
                      <p
                        className={`text-sm ${
                          progress.completed
                            ? "text-gray-800 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {progress.message}
                      </p>
                    </div>
                  </div>
                ))}
          </div>

          {/* Estimated Delivery */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold text-green-700 mb-1">
                  10:01AM
                </div>
                <div className="text-sm text-gray-500">
                  Estimated time of delivery
                </div>
              </div>
              <button className="bg-green-50 text-green-700 px-6 py-2.5 rounded-lg font-medium hover:bg-green-100 border border-green-200 transition-colors">
                Accept Order
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                Restaurant:{" "}
                <span className="font-semibold text-gray-800">
                  {selectedOrder.restaurant_name}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Booking History (Empty State)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button
          onClick={() => setCurrentView("bookings")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <h2 className="text-2xl font-bold text-green-700 mb-12">
          Booking History
        </h2>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-8">
            {/* Clipboard 1 */}
            <div className="w-40 h-52 bg-white rounded-xl border-4 border-gray-200 shadow-lg transform -rotate-12 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-8 bg-green-600 rounded-full shadow-md"></div>
              </div>
            </div>

            {/* Clipboard 2 */}
            <div className="w-40 h-52 bg-white rounded-xl border-4 border-gray-200 shadow-2xl absolute top-4 left-16 transform rotate-6">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-8 bg-green-600 rounded-full shadow-md"></div>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-lg font-medium">
            No booking history yet
          </p>
          <p className="text-gray-300 text-sm mt-2">
            Your past orders will appear here
          </p>

          <button
            onClick={() => setCurrentView("bookings")}
            className="mt-8 bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    </div>
  );
};

export default Booking;
