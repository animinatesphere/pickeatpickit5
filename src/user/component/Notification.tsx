import React, { useState, useEffect } from "react";
import {
  Bell,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { backendAuthService } from "../../services/backendAuthService";

// ─── Types ────────────────────────────────────────────────────────────────────

type UIStatus = "delivered" | "processing" | "received" | "canceled";

interface NotificationItem {
  id: string;
  restaurant: string;
  message: string;
  orderId: string;
  items: number;
  price: number;
  time: string;
  date: string;
  status: UIStatus;
  image: string;
}

interface TrackingEntry {
  id: string;
  status: string;
  message: string;
  timestamp: string;
}

interface OrderEntry {
  id: string;
  status: string;
  restaurant_name?: string;
  total?: number;
  total_price?: number;
  items_count?: number;
  tracking?: TrackingEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getOrdinalDate = (date: Date): string => {
  const day = date.getDate();
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const year = date.getFullYear();
  const s = ["th", "st", "nd", "rd"];
  const v = day % 100;
  const suffix = s[(v - 20) % 10] ?? s[v] ?? s[0];
  return `${day}${suffix} ${month} ${year}`;
};

const mapStatus = (raw: string): UIStatus => {
  if (raw === "completed" || raw === "delivered") return "delivered";
  if (["accepted", "preparing", "ready"].includes(raw)) return "processing";
  if (raw === "canceled" || raw === "cancelled") return "canceled";
  return "received";
};

// ─── Component ────────────────────────────────────────────────────────────────

const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        // Fetch all customer orders
        const orders = (await backendAuthService.getOrders()) as OrderEntry[];

        const items: NotificationItem[] = [];

        for (const order of orders) {
          // Each order's tracking entries become individual notifications
          try {
            const tracking = (await backendAuthService.getOrderTracking(
              order.id,
            )) as TrackingEntry[];

            for (const entry of tracking) {
              const dateObj = new Date(entry.timestamp);
              items.push({
                id: entry.id,
                restaurant: order.restaurant_name ?? "Restaurant",
                message: entry.message,
                orderId: order.id.slice(0, 8).toUpperCase(),
                items: order.items_count ?? 0,
                price: order.total_price ?? order.total ?? 0,
                time: dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                date: getOrdinalDate(dateObj),
                status: mapStatus(entry.status),
                image: "🍽️",
              });
            }
          } catch {
            // If tracking fails for one order, skip it
          }
        }

        // Sort newest first
        items.sort(
          (a, b) =>
            new Date(`${b.date} ${b.time}`).getTime() -
            new Date(`${a.date} ${a.time}`).getTime(),
        );

        setNotifications(items);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getStatusIcon = (status: UIStatus) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "processing":
        return <Package className="w-4 h-4 text-blue-600" />;
      case "received":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "canceled":
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const groupedNotifications = notifications.reduce<
    Record<string, NotificationItem[]>
  >((groups, n) => {
    if (!groups[n.date]) groups[n.date] = [];
    groups[n.date].push(n);
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
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Notifications
            </h1>
            <div className="relative p-2">
              <Bell
                className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                fill="currentColor"
              />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
            <Bell className="mx-auto w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm opacity-60">
              Updates about your orders will appear here
            </p>
          </div>
        ) : (
          Object.keys(groupedNotifications).map((date) => (
            <div key={date} className="mb-8">
              <div className="mb-4">
                <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
                  {date}
                </p>
              </div>

              <div className="space-y-4">
                {groupedNotifications[date].map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-50 flex items-center justify-center bg-emerald-50">
                          {notification.image.startsWith("http") ? (
                            <img
                              src={notification.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">
                              {notification.image}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              From {notification.restaurant}
                            </h3>
                            {getStatusIcon(notification.status)}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium uppercase">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            #{notification.orderId}
                          </span>
                          <span className="text-sm font-black text-gray-900">
                            ₦{notification.price.toLocaleString()}
                          </span>
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
