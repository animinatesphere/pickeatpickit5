/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import api from "../../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────
type Screen =
  | "main"
  | "user-list"
  | "vendor-list"
  | "rider-list"
  | "user-pages"
  | "vendor-pages"
  | "rider-pages";
type PageType = "user" | "vendor" | "rider";

interface PageItem {
  id: string;
  name: string;
  enabled: boolean;
}
interface UserItem {
  id: string;
  name: string;
  avatar: string;
  pages: PageItem[];
}

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchAllUsers = () => api.get("/admin/users");
const fetchPendingVendors = () => api.get("/admin/vendors/pending");
const fetchPendingRiders = () => api.get("/admin/riders/pending");
const deleteAdminUser = (id: string) => api.delete(`/admin/users/${id}`);

// ── Default page sets ─────────────────────────────────────────────────────────
const defaultUserPages: PageItem[] = [
  { id: "1", name: "Special Offers", enabled: true },
  { id: "2", name: "Featured Sellers", enabled: true },
  { id: "3", name: "Kitchens Near You", enabled: true },
  { id: "4", name: "Schedule Delivery", enabled: true },
  { id: "5", name: "Order", enabled: true },
];
const defaultVendorPages: PageItem[] = [
  { id: "1", name: "Orders", enabled: true },
  { id: "2", name: "Earnings", enabled: true },
  { id: "3", name: "Chat", enabled: true },
  { id: "4", name: "Reviews & Feedback", enabled: true },
];
const defaultRiderPages: PageItem[] = [
  { id: "1", name: "Rider Games", enabled: true },
  { id: "2", name: "Map", enabled: true },
  { id: "3", name: "Order", enabled: true },
];

// ── Component ─────────────────────────────────────────────────────────────────
const Restrict: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentPageType, setCurrentPageType] = useState<PageType>("user");
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    user: UserItem | null;
  }>({ show: false, user: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [vendors, setVendors] = useState<UserItem[]>([]);
  const [riders, setRiders] = useState<UserItem[]>([]);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, vRes, rRes] = await Promise.allSettled([
        fetchAllUsers(),
        fetchPendingVendors(),
        fetchPendingRiders(),
      ]);

      if (uRes.status === "fulfilled") {
        const data: any[] = Array.isArray(uRes.value.data)
          ? uRes.value.data
          : [];
        setUsers(
          data.map((u) => ({
            id: u.id || u.user_id,
            name:
              `${u.firstname || ""} ${u.lastname || ""}`.trim() ||
              u.email ||
              "Unknown",
            avatar: u.profile_image || "",
            pages: defaultUserPages.map((p) => ({ ...p })),
          })),
        );
      }

      if (vRes.status === "fulfilled") {
        const data: any[] = Array.isArray(vRes.value.data)
          ? vRes.value.data
          : [];
        setVendors(
          data.map((v) => ({
            id: v.id,
            name:
              v.business_name ||
              `${v.firstname || ""} ${v.lastname || ""}`.trim() ||
              "Unknown",
            avatar: v.logo_url || "",
            pages: defaultVendorPages.map((p) => ({ ...p })),
          })),
        );
      }

      if (rRes.status === "fulfilled") {
        const data: any[] = Array.isArray(rRes.value.data)
          ? rRes.value.data
          : [];
        setRiders(
          data.map((r) => ({
            id: r.id,
            name: `${r.firstname || ""} ${r.lastname || ""}`.trim() || "Rider",
            avatar: r.profile_image || "",
            pages: defaultRiderPages.map((p) => ({ ...p })),
          })),
        );
      }
    } catch (err) {
      console.error("Failed to fetch restriction data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleUserClick = (userId: string, pageType: PageType) => {
    setSelectedUserId(userId);
    setCurrentPageType(pageType);
    setCurrentScreen(
      pageType === "user"
        ? "user-pages"
        : pageType === "vendor"
          ? "vendor-pages"
          : "rider-pages",
    );
  };

  const handleToggle = (pageId: string) => {
    if (!selectedUserId) return;
    const toggle = (list: UserItem[]) =>
      list.map((item) =>
        item.id === selectedUserId
          ? {
              ...item,
              pages: item.pages.map((p) =>
                p.id === pageId ? { ...p, enabled: !p.enabled } : p,
              ),
            }
          : item,
      );
    if (currentPageType === "user") setUsers(toggle(users));
    if (currentPageType === "vendor") setVendors(toggle(vendors));
    if (currentPageType === "rider") setRiders(toggle(riders));
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    setDeleteLoading(true);
    try {
      await deleteAdminUser(deleteModal.user.id);
      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.user!.id));
      setVendors((prev) => prev.filter((u) => u.id !== deleteModal.user!.id));
      setRiders((prev) => prev.filter((u) => u.id !== deleteModal.user!.id));
      setDeleteModal({ show: false, user: null });
      // If on pages screen, go back
      if (selectedUserId === deleteModal.user.id) {
        setCurrentScreen(
          currentPageType === "user"
            ? "user-list"
            : currentPageType === "vendor"
              ? "vendor-list"
              : "rider-list",
        );
        setSelectedUserId(null);
      }
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBack = () => {
    if (currentScreen === "user-pages") {
      setCurrentScreen("user-list");
      setSelectedUserId(null);
      return;
    }
    if (currentScreen === "vendor-pages") {
      setCurrentScreen("vendor-list");
      setSelectedUserId(null);
      return;
    }
    if (currentScreen === "rider-pages") {
      setCurrentScreen("rider-list");
      setSelectedUserId(null);
      return;
    }
    setCurrentScreen("main");
    setSearchQuery("");
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const getCurrentList = () =>
    currentPageType === "user"
      ? users
      : currentPageType === "vendor"
        ? vendors
        : riders;

  const getSelectedUser = () =>
    getCurrentList().find((i) => i.id === selectedUserId);

  const filteredList = getCurrentList().filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const screenTitle =
    currentScreen === "user-list"
      ? "Users"
      : currentScreen === "vendor-list"
        ? "Vendors"
        : currentScreen === "rider-list"
          ? "Riders"
          : currentScreen === "user-pages"
            ? "User Pages"
            : currentScreen === "vendor-pages"
              ? "Vendor Pages"
              : currentScreen === "rider-pages"
                ? "Rider Pages"
                : "Pages & Restrictions";

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      {/* ── MAIN ──────────────────────────────────────────────────────────── */}
      {currentScreen === "main" && (
        <div>
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 shadow-lg">
            <h1 className="text-lg font-bold tracking-tighter uppercase">
              Pages & Restrictions
            </h1>
            <p className="text-white/70 text-xs mt-1">
              Control page access per user type
            </p>
          </div>
          <div className="p-6 space-y-3">
            {[
              {
                label: "Users",
                count: users.length,
                type: "user" as PageType,
                screen: "user-list" as Screen,
              },
              {
                label: "Vendors",
                count: vendors.length,
                type: "vendor" as PageType,
                screen: "vendor-list" as Screen,
              },
              {
                label: "Riders",
                count: riders.length,
                type: "rider" as PageType,
                screen: "rider-list" as Screen,
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setCurrentScreen(item.screen);
                  setCurrentPageType(item.type);
                }}
                className="w-full flex justify-between items-center p-5 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl transition-all group shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center font-black text-green-600 text-xl group-hover:rotate-6 transition-transform">
                    {item.label.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gray-800 tracking-tighter uppercase">
                      {item.label}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {item.count} accounts
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all"
                  size={22}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── LIST SCREEN ───────────────────────────────────────────────────── */}
      {(currentScreen === "user-list" ||
        currentScreen === "vendor-list" ||
        currentScreen === "rider-list") && (
        <div className="min-h-screen">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 shadow-lg sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"
                >
                  <ArrowLeft size={22} />
                </button>
                <h1 className="text-lg font-bold tracking-tighter uppercase">
                  {screenTitle}
                </h1>
              </div>
              <span className="text-white/80 font-black text-sm">
                {filteredList.length}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4 bg-white border-b border-gray-100 sticky top-[60px] z-30">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-sm"
              />
            </div>
          </div>

          {/* List */}
          <div className="px-4 py-4 space-y-3">
            {filteredList.length === 0 ? (
              <div className="text-center py-20 text-gray-300">
                <p className="font-bold uppercase tracking-widest text-sm">
                  No accounts found
                </p>
              </div>
            ) : (
              filteredList.map((item, i) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-50 flex items-center gap-4 hover:border-green-200 hover:shadow-2xl transition-all"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Avatar */}
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-14 h-14 rounded-2xl object-cover shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center font-black text-green-600 text-2xl flex-shrink-0 shadow-inner">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-800 tracking-tighter uppercase truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                      {item.pages.filter((p) => p.enabled).length}/
                      {item.pages.length} pages active
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setDeleteModal({ show: true, user: item })}
                      className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => handleUserClick(item.id, currentPageType)}
                      className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all active:scale-95 group"
                    >
                      <ChevronRight
                        size={16}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── PAGES SCREEN ──────────────────────────────────────────────────── */}
      {(currentScreen === "user-pages" ||
        currentScreen === "vendor-pages" ||
        currentScreen === "rider-pages") && (
        <div className="min-h-screen">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 shadow-lg sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"
              >
                <ArrowLeft size={22} />
              </button>
              <h1 className="text-lg font-bold tracking-tighter uppercase">
                {screenTitle}
              </h1>
            </div>
          </div>

          {/* User info */}
          {getSelectedUser() && (
            <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getSelectedUser()!.avatar ? (
                  <img
                    src={getSelectedUser()!.avatar}
                    alt={getSelectedUser()!.name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center font-black text-green-600 text-3xl shadow-inner">
                    {getSelectedUser()!.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-black text-gray-800 tracking-tighter uppercase">
                    {getSelectedUser()!.name}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    {getSelectedUser()!.pages.filter((p) => p.enabled).length}{" "}
                    of {getSelectedUser()!.pages.length} pages enabled
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setDeleteModal({ show: true, user: getSelectedUser()! })
                }
                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all active:scale-95"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}

          {/* Toggles */}
          <div className="px-4 py-4 space-y-3">
            {getSelectedUser()?.pages.map((page, i) => (
              <div
                key={page.id}
                className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-50 flex justify-between items-center hover:border-green-100 transition-all"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div>
                  <p className="font-black text-gray-800 uppercase tracking-tighter">
                    {page.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 text-gray-400">
                    {page.enabled ? "Enabled" : "Restricted"}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(page.id)}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner ${
                    page.enabled ? "bg-green-600" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                      page.enabled ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ──────────────────────────────────────────────────── */}
      {deleteModal.show && deleteModal.user && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteModal({ show: false, user: null })}
        >
          <div
            className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tighter uppercase">
              Delete Account?
            </h2>
            <p className="text-gray-400 text-sm mb-2">
              You are about to delete{" "}
              <span className="font-bold text-gray-600">
                {deleteModal.user.name}
              </span>
              .
            </p>
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-8">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, user: null })}
                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restrict;
