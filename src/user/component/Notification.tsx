import React, { useState, useEffect } from "react";
import { Bell, ArrowLeft, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/authService";
import { authService } from "../../services/authService";

interface NotificationItem {
  id: string;
  restaurant: string;
  message: string;
  orderId: string;
  items: number;
  price: number;
  time: string;
  date: string;
  status: "delivered" | "processing" | "received" | "canceled";
  image: string;
}

const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to add ordinal suffix (1st, 2nd, 3rd...)
  const getOrdinalDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    const s = ["th", "st", "nd", "rd"];
    const v = day % 100;
    const suffix = s[(v - 20) % 10] || s[v] || s[0];
    return `${day}${suffix} ${month} ${year}`;
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const user = await authService.getCurrentUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("order_status_updates")
          .select(`
            id,
            message,
            status,
            timestamp,
            order_id,
            orders!inner (
              restaurant_name,
              total_amount,
              items_count,
              user_id,
              order_items (
                menu_items (image_url)
              )
            )
          `)
          .eq("orders.user_id", user.id)
          .order("timestamp", { ascending: false });

        if (error) throw error;

        if (data) {
          const formatted: NotificationItem[] = data.map((update: any) => {
            const dateObj = new Date(update.timestamp);
            
            // Map DB status to UI status
            let uiStatus: any = "received";
            if (update.status === "completed") uiStatus = "delivered";
            if (["accepted", "preparing", "preparing"].includes(update.status)) uiStatus = "processing";
            if (update.status === "canceled" || update.status === "canceled") uiStatus = "canceled";

            return {
              id: update.id,
              restaurant: update.orders?.restaurant_name || "Restaurant",
              message: update.message,
              orderId: update.order_id ? update.order_id.slice(0, 8).toUpperCase() : "N/A",
              items: update.orders?.items_count || 0,
              price: update.orders?.total_amount || 0,
              time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: getOrdinalDate(dateObj), // Using fixed helper
              status: uiStatus,
              image: update.orders?.order_items?.[0]?.menu_items?.image_url || "🍽️"
            };
          });
          setNotifications(formatted);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "processing":
        return <Package className="w-4 h-4 text-blue-600" />;
      case "received":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "canceled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const groupedNotifications = notifications.reduce((groups: any, n) => {
    const date = n.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(n);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/user-dashboard">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Notifications</h1>
            <div className="relative p-2">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="currentColor" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
            <Bell className="mx-auto w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm opacity-60">Updates about your orders will appear here</p>
          </div>
        ) : (
          Object.keys(groupedNotifications).map((date) => (
            <div key={date} className="mb-8">
              <div className="mb-4">
                <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">{date}</p>
              </div>

              <div className="space-y-4">
                {groupedNotifications[date].map((notification: NotificationItem) => (
                  <div key={notification.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-50 flex items-center justify-center bg-emerald-50">
                          {notification.image.startsWith('http') ? (
                            <img src={notification.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{notification.image}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900 truncate">From {notification.restaurant}</h3>
                            {getStatusIcon(notification.status)}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium uppercase">{notification.time}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            #{notification.orderId}
                          </span>
                          <span className="text-sm font-black text-gray-900">₦{notification.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notification; 