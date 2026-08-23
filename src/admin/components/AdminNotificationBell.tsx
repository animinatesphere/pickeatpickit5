/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Bell, X, Loader2 } from "lucide-react";
import api from "../../services/api";

export type AdminNotificationNavigate = (section: string, drill?: Record<string, string>) => void;

type AdminNotificationBellProps = {
  onNavigate?: AdminNotificationNavigate;
  sections?: Record<string, string>;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  type?: string;
  data?: Record<string, any>;
  created_at?: string;
};

const AdminNotificationBell = ({ onNavigate = () => undefined, sections = {} }: AdminNotificationBellProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((item) => !item.is_read).length;
  const badgeCount = unreadCount || pendingPayouts;

  const refresh = async () => {
    try {
      const [payoutsRes, notifRes] = await Promise.all([
        api.get("/admin/payouts", { params: { status: "pending" } }),
        api.get("/admin/notifications", { params: { limit: 6 } }),
      ]);
      setPendingPayouts(Array.isArray(payoutsRes.data) ? payoutsRes.data.length : 0);
      setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
      setError(null);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    refresh().finally(() => {
      if (active) setLoading(false);
    });
    const timer = window.setInterval(refresh, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = async (notification: NotificationItem) => {
    try {
      if (!notification.is_read) {
        setActionLoading(notification.id);
        await api.patch(`/admin/notifications/${notification.id}/read`);
        setNotifications((items) => items.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)));
      }
    } catch {
      // navigation still works even if marking read fails
    } finally {
      setActionLoading(null);
    }

    const data = notification.data || {};
    const type = (notification.type || "").toLowerCase();

    if (data.payout_id || type === "payout") {
      onNavigate(sections.finance || "finance");
    } else if (data.order_id) {
      onNavigate(sections.orders || "orders", { search: String(data.order_id) });
    } else if (data.vendor_id) {
      onNavigate(sections.vendors || "vendors");
    } else if (data.rider_id) {
      onNavigate(sections.riders || "riders");
    } else if (data.ticket_id) {
      onNavigate(sections.support || "support");
    } else {
      onNavigate(sections.attention || "attention");
    }

    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 transition-colors"
        aria-label="Admin notifications"
      >
        <Bell size={17} />
        {badgeCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <p className="font-black text-slate-900">Notifications</p>
                <p className="text-xs text-slate-400">Select an alert to open the related item.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition-colors"
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
              ) : error ? (
                <p className="p-6 text-center text-sm font-bold text-red-700">{error}</p>
              ) : notifications.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-400">No notifications.</p>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    disabled={actionLoading === item.id}
                    className={`block w-full border-b border-slate-100 p-4 text-left transition-colors hover:bg-green-50 disabled:opacity-60 ${
                      item.is_read ? "opacity-65" : "bg-amber-50/50"
                    }`}
                  >
                    <p className="text-sm font-black text-slate-900">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.message}</p>
                    {item.created_at ? (
                      <p className="mt-1 text-[10px] font-bold text-slate-400">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    ) : null}
                  </button>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={async () => {
                const { data } = await api.get("/admin/notifications", { params: { limit: 100 } });
                setNotifications(Array.isArray(data) ? data : []);
              }}
              className="w-full bg-slate-50 p-3 text-xs font-black text-green-700 hover:bg-slate-100 transition-colors"
            >
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;
