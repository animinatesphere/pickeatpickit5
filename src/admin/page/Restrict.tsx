import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { getAdminUsers, getAdminVendors, getAdminRiders } from "../../services/api";

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
  orders: number;
  pages: PageItem[];
}

const Restrict: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentPageType, setCurrentPageType] = useState<PageType>("user");
  const [loading, setLoading] = useState(false);

  // Users with their individual page settings
  const [users, setUsers] = useState<UserItem[]>([]);
  const [vendors, setVendors] = useState<UserItem[]>([]);
  const [riders, setRiders] = useState<UserItem[]>([]);

  const defaultUserPages = [
    { id: "1", name: "Special Offers", enabled: true },
    { id: "2", name: "Featured Sellers", enabled: true },
    { id: "3", name: "Kitchens near you", enabled: true },
    { id: "4", name: "Schedule Delivery", enabled: true },
    { id: "5", name: "Order", enabled: true },
  ];

  const defaultVendorPages = [
    { id: "1", name: "Orders", enabled: true },
    { id: "2", name: "Earnings", enabled: true },
    { id: "3", name: "Chat", enabled: true },
    { id: "4", name: "Reviews and Feedback", enabled: true },
  ];

  const defaultRiderPages = [
    { id: "1", name: "Rider Games", enabled: true },
    { id: "2", name: "Map", enabled: true },
    { id: "3", name: "Order", enabled: true },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, vRes, rRes] = await Promise.all([
        getAdminUsers(),
        getAdminVendors(),
        getAdminRiders()
      ]);

      if (!uRes.error && uRes.data) {
        setUsers(uRes.data.map(u => ({
          id: u.user_id,
          name: `${u.firstname} ${u.lastname}`,
          avatar: u.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
          orders: 0, // In a real app, we'd fetch this too
          pages: [...defaultUserPages]
        })));
      }

      if (!vRes.error && vRes.data) {
        setVendors(vRes.data.map(v => ({
          id: v.id,
          name: v.business_name || "Unknown Vendor",
          avatar: v.avatar_url || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
          orders: 0,
          pages: [...defaultVendorPages]
        })));
      }

      if (!rRes.error && rRes.data) {
        setRiders(rRes.data.map(r => ({
          id: r.id,
          name: `${r.firstname} ${r.lastname}`,
          avatar: r.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
          orders: 0,
          pages: [...defaultRiderPages]
        })));
      }
    } catch (err) {
      console.error("Restriction fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUserClick = (userId: string, pageType: PageType) => {
    setSelectedUserId(userId);
    setCurrentPageType(pageType);

    if (pageType === "user") {
      setCurrentScreen("user-pages");
    } else if (pageType === "vendor") {
      setCurrentScreen("vendor-pages");
    } else {
      setCurrentScreen("rider-pages");
    }
  };

  const handleToggle = (pageId: string) => {
    if (!selectedUserId) return;

    if (currentPageType === "user") {
      setUsers(
        users.map((user) =>
          user.id === selectedUserId
            ? {
                ...user,
                pages: user.pages.map((page) =>
                  page.id === pageId
                    ? { ...page, enabled: !page.enabled }
                    : page
                ),
              }
            : user
        )
      );
    } else if (currentPageType === "vendor") {
      setVendors(
        vendors.map((vendor) =>
          vendor.id === selectedUserId
            ? {
                ...vendor,
                pages: vendor.pages.map((page) =>
                  page.id === pageId
                    ? { ...page, enabled: !page.enabled }
                    : page
                ),
              }
            : vendor
        )
      );
    } else if (currentPageType === "rider") {
      setRiders(
        riders.map((rider) =>
          rider.id === selectedUserId
            ? {
                ...rider,
                pages: rider.pages.map((page) =>
                  page.id === pageId
                    ? { ...page, enabled: !page.enabled }
                    : page
                ),
              }
            : rider
        )
      );
    }
  };

  const getCurrentList = () => {
    switch (currentPageType) {
      case "user":
        return users;
      case "vendor":
        return vendors;
      case "rider":
        return riders;
      default:
        return users;
    }
  };

  const getSelectedUser = () => {
    const list = getCurrentList();
    return list.find((item) => item.id === selectedUserId);
  };

  const getScreenTitle = () => {
    if (currentScreen === "user-list") return "User Pages";
    if (currentScreen === "vendor-list") return "Vendor Pages";
    if (currentScreen === "rider-list") return "Rider Pages";
    if (
      currentScreen === "user-pages" ||
      currentScreen === "vendor-pages" ||
      currentScreen === "rider-pages"
    ) {
      return "Pages";
    }
    return "Pages";
  };

  const filteredList = getCurrentList().filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackClick = () => {
    if (currentScreen === "user-pages") {
      setCurrentScreen("user-list");
      setSelectedUserId(null);
    } else if (currentScreen === "vendor-pages") {
      setCurrentScreen("vendor-list");
      setSelectedUserId(null);
    } else if (currentScreen === "rider-pages") {
      setCurrentScreen("rider-list");
      setSelectedUserId(null);
    } else {
      setCurrentScreen("main");
      setSearchQuery("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="w-full">
        {/* Main Pages Screen */}
        {currentScreen === "main" && (
          <div className="animate-fadeIn min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
              <div className="flex items-center gap-4">
                <button className="hover:bg-white/10 p-2 rounded-lg transition-all">
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Pages</h1>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-6 space-y-3">
              <button
                onClick={() => {
                  setCurrentScreen("user-list");
                  setCurrentPageType("user");
                }}
                className="w-full flex justify-between items-center p-5 bg-white border border-gray-200 rounded-xl hover:shadow-xl transition-all transform hover:scale-[1.02] group"
              >
                <span className="font-semibold text-gray-800 text-lg">
                  Users
                </span>
                <ChevronRight
                  className="text-gray-400 group-hover:translate-x-1 transition-transform"
                  size={22}
                />
              </button>

              <button
                onClick={() => {
                  setCurrentScreen("vendor-list");
                  setCurrentPageType("vendor");
                }}
                className="w-full flex justify-between items-center p-5 bg-white border border-gray-200 rounded-xl hover:shadow-xl transition-all transform hover:scale-[1.02] group"
              >
                <span className="font-semibold text-gray-800 text-lg">
                  Vendors
                </span>
                <ChevronRight
                  className="text-gray-400 group-hover:translate-x-1 transition-transform"
                  size={22}
                />
              </button>

              <button
                onClick={() => {
                  setCurrentScreen("rider-list");
                  setCurrentPageType("rider");
                }}
                className="w-full flex justify-between items-center p-5 bg-white border border-gray-200 rounded-xl hover:shadow-xl transition-all transform hover:scale-[1.02] group"
              >
                <span className="font-semibold text-gray-800 text-lg">
                  Riders
                </span>
                <ChevronRight
                  className="text-gray-400 group-hover:translate-x-1 transition-transform"
                  size={22}
                />
              </button>
            </div>
          </div>
        )}

        {/* User/Vendor/Rider List Screen */}
        {(currentScreen === "user-list" ||
          currentScreen === "vendor-list" ||
          currentScreen === "rider-list") && (
          <div className="animate-slideIn min-h-screen overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 sticky top-0 z-20 shadow-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={handleBackClick}
                    className="hover:bg-white/10 p-2 rounded-lg transition-all"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <h1 className="text-xl font-bold">{getScreenTitle()}</h1>
                </div>
                <span className="text-white/90 font-semibold text-lg">
                  64,098
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-6 pb-4 bg-white sticky top-[88px] z-10 shadow-sm">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search for User/Vendor/Riders"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Users/Vendors/Riders List */}
            <div className="px-6 pb-6 space-y-3">
              {filteredList.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleUserClick(item.id, currentPageType)}
                  className="w-full flex items-center gap-4 p-4 bg-white border-b border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all animate-slideUp rounded-lg group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover shadow-md"
                  />
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.orders} orders
                    </p>
                  </div>
                  <ChevronRight
                    className="text-gray-400 group-hover:translate-x-1 transition-transform"
                    size={20}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Individual User/Vendor/Rider Pages Screen */}
        {(currentScreen === "user-pages" ||
          currentScreen === "vendor-pages" ||
          currentScreen === "rider-pages") && (
          <div className="animate-slideIn min-h-screen overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 sticky top-0 z-20 shadow-lg">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackClick}
                  className="hover:bg-white/10 p-2 rounded-lg transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">{getScreenTitle()}</h1>
              </div>
            </div>

            {/* User Info */}
            {getSelectedUser() && (
              <div className="p-6 pb-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <img
                    src={getSelectedUser()!.avatar}
                    alt={getSelectedUser()!.name}
                    className="w-16 h-16 rounded-full object-cover shadow-lg"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {getSelectedUser()!.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {getSelectedUser()!.orders} orders
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Toggle Settings */}
            <div className="px-6 py-6 space-y-3">
              {getSelectedUser()?.pages.map((page, index) => (
                <div
                  key={page.id}
                  className="flex justify-between items-center p-5 bg-white border-b border-gray-200 hover:bg-gray-50 transition-all animate-slideUp rounded-lg"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="font-semibold text-gray-800 text-base">
                    {page.name}
                  </span>
                  <button
                    onClick={() => handleToggle(page.id)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md ${
                      page.enabled ? "bg-green-600" : "bg-gray-300"
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

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #16a34a;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #15803d;
        }
      `}</style>
    </div>
  );
};

export default Restrict;
