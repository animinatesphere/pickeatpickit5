/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  ChevronRight,
  Search,
  Bell,
  Menu,
  ChevronLeft,
  CheckCircle,
  Clock,
  MapPin,
  User as UserIcon,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

// ── Types ─────────────────────────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  type: "Client" | "Vendor" | "Rider";
  dateJoined: string;
  isSuspended: boolean;
  email: string;
  phone: string;
  address: string;
  zip: string;
  city: string;
  state: string;
  fullName: string;
  avatar?: string;
  status?: string;
}

type ModalType = "details" | "delete" | null;
type ViewType = "list" | "profile";

// ── API helpers (all backend, no Supabase) ────────────────────────────────────
const fetchAllUsers = () => api.get("/admin/users");
const fetchPendingVendors = () => api.get("/admin/vendors/pending");
const fetchPendingRiders = () => api.get("/admin/riders/pending");
const approveVendor = (id: string, status: string) =>
  api.patch(`/admin/vendors/${id}/status`, null, { params: { status } });
const approveRider = (id: string, status: string) =>
  api.patch(`/admin/riders/${id}/status`, null, { params: { status } });
const deleteUser = (id: string, type: string) =>
  api.delete(`/admin/users/${id}`, { params: { type } });

// ── Component ─────────────────────────────────────────────────────────────────
const UserManagement = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<
    "all" | "client" | "vendor" | "rider"
  >("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<User>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all three in parallel
      const [usersRes, vendorsRes, ridersRes] = await Promise.allSettled([
        fetchAllUsers(),
        fetchPendingVendors(),
        fetchPendingRiders(),
      ]);

      // Main users list (customers)
      const customers: any[] =
        usersRes.status === "fulfilled" ? usersRes.value.data || [] : [];

      // Pending vendors (supplement main list)
      const pendingVendors: any[] =
        vendorsRes.status === "fulfilled" ? vendorsRes.value.data || [] : [];

      // Pending riders
      const pendingRiders: any[] =
        ridersRes.status === "fulfilled" ? ridersRes.value.data || [] : [];

      // Format customers — backend shape: { id, email, firstname, lastname, phone, address, city, state, zip }
      const formattedCustomers: User[] = customers.map((u: any) => ({
        id: u.id,
        name:
          `${u.firstname || ""} ${u.lastname || ""}`.trim() ||
          u.email ||
          "Unknown",
        type: "Client",
        dateJoined: u.created_at
          ? new Date(u.created_at).toLocaleDateString()
          : "—",
        isSuspended: false,
        fullName: `${u.firstname || ""} ${u.lastname || ""}`.trim(),
        email: u.email || "—",
        phone: u.phone || "—",
        address: u.address || "—",
        zip: u.zip || "",
        city: u.city || "",
        state: u.state || "",
        status: u.is_verified ? "verified" : "unverified",
      }));

      // Format vendors
      const formattedVendors: User[] = pendingVendors.map((u: any) => ({
        id: u.id,
        name:
          u.business_name ||
          `${u.firstname || ""} ${u.lastname || ""}`.trim() ||
          "Vendor",
        type: "Vendor",
        dateJoined: u.created_at
          ? new Date(u.created_at).toLocaleDateString()
          : "—",
        isSuspended: false,
        fullName:
          u.full_name || `${u.firstname || ""} ${u.lastname || ""}`.trim(),
        email: u.email || u.business_email || "—",
        phone: u.phone || u.business_phone || "—",
        address: u.business_address || "—",
        zip: "",
        city: u.lga || "",
        state: u.state || "",
        status: u.status || "pending",
      }));

      // Format riders
      const formattedRiders: User[] = pendingRiders.map((u: any) => ({
        id: u.id,
        name: `${u.firstname || ""} ${u.lastname || ""}`.trim() || "Rider",
        type: "Rider",
        dateJoined: u.created_at
          ? new Date(u.created_at).toLocaleDateString()
          : "—",
        isSuspended: false,
        fullName: `${u.firstname || ""} ${u.lastname || ""}`.trim(),
        email: u.email || "—",
        phone: u.phone || "—",
        address: "—",
        zip: "",
        city: "",
        state: "",
        status: u.status || "pending",
      }));

      // Merge — deduplicate by id
      const seen = new Set<string>();
      const merged: User[] = [];
      for (const u of [
        ...formattedCustomers,
        ...formattedVendors,
        ...formattedRiders,
      ]) {
        if (!seen.has(u.id)) {
          seen.add(u.id);
          merged.push(u);
        }
      }
      setUsers(merged);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setEditValues(user);
    setModalType("details");
  };

  const handleSaveField = () => {
    if (!selectedUser) return;
    const updated = { ...selectedUser, ...editValues };
    setSelectedUser(updated);
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? updated : u)),
    );
    setEditingField(null);
  };

  const handleApproveRider = async (id: string) => {
    setActionLoading(true);
    try {
      await approveRider(id, "active");
      toast.success("Rider approved successfully!", "Rider Approved");
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve rider");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveVendor = async (id: string) => {
    setActionLoading(true);
    try {
      await approveVendor(id, "active");
      toast.success("Vendor approved successfully!", "Vendor Approved");
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve vendor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await deleteUser(selectedUser.id, selectedUser.type);
      toast.success("User deactivated", "Done");
      closeModal();
      setCurrentView("list");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to deactivate user");
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setModalType(null);
    if (currentView === "list") setSelectedUser(null);
  };

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const matchTab = activeTab === "all" || u.type.toLowerCase() === activeTab;
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Loading Users...
          </p>
        </div>
      </div>
    );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* ── PROFILE VIEW ──────────────────────────────────────────────────── */}
      {currentView === "profile" && selectedUser && (
        <div className="min-h-screen bg-white pb-20">
          <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
            <button
              onClick={() => {
                setCurrentView("list");
                setEditingField(null);
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold tracking-tighter uppercase">
              User Profile
            </h1>
            <Bell className="w-6 h-6" />
          </div>

          <div className="px-4 py-10 max-w-xl mx-auto">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-28 h-28 rounded-3xl bg-green-100 flex items-center justify-center mb-6 border-4 border-white shadow-2xl shadow-green-500/20">
                <UserIcon size={48} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 tracking-tighter uppercase">
                {selectedUser.name}
              </h2>
              <span className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold mt-2 uppercase tracking-widest border border-green-200">
                {selectedUser.type}
              </span>
              {selectedUser.status && (
                <span
                  className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    selectedUser.status === "pending"
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : "bg-green-50 text-green-600 border border-green-200"
                  }`}
                >
                  {selectedUser.status}
                </span>
              )}
            </div>

            {/* Approve buttons on profile view */}
            {selectedUser.type === "Rider" &&
              selectedUser.status === "pending" && (
                <button
                  onClick={() => handleApproveRider(selectedUser.id)}
                  disabled={actionLoading}
                  className="w-full mb-4 py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-60"
                >
                  {actionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Approve Rider
                </button>
              )}
            {selectedUser.type === "Vendor" &&
              selectedUser.status === "pending" && (
                <button
                  onClick={() => handleApproveVendor(selectedUser.id)}
                  disabled={actionLoading}
                  className="w-full mb-4 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-60"
                >
                  {actionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Approve Vendor
                </button>
              )}

            {/* Info cards */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
                  Contact Information
                </h3>

                {/* Name */}
                <div className="mb-5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                    Full Name
                  </p>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                    {editingField === "name" ? (
                      <input
                        className="bg-transparent flex-1 outline-none font-bold text-gray-800"
                        value={editValues.name || ""}
                        onChange={(e) =>
                          setEditValues({ ...editValues, name: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-bold text-gray-800">
                        {selectedUser.name}
                      </p>
                    )}
                    <button
                      onClick={() =>
                        editingField === "name"
                          ? handleSaveField()
                          : setEditingField("name")
                      }
                      className="text-green-600 text-xs font-bold ml-3 uppercase tracking-widest"
                    >
                      {editingField === "name" ? "Save" : "Edit"}
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                    Email
                  </p>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="font-bold text-gray-800">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                    Phone
                  </p>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                    {editingField === "phone" ? (
                      <input
                        className="bg-transparent flex-1 outline-none font-bold text-gray-800"
                        value={editValues.phone || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            phone: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-bold text-gray-800">
                        {selectedUser.phone}
                      </p>
                    )}
                    <button
                      onClick={() =>
                        editingField === "phone"
                          ? handleSaveField()
                          : setEditingField("phone")
                      }
                      className="text-green-600 text-xs font-bold ml-3 uppercase tracking-widest"
                    >
                      {editingField === "phone" ? "Save" : "Edit"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-green-600" />
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Address
                  </h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  {editingField === "address" ? (
                    <textarea
                      className="bg-transparent w-full outline-none text-sm text-gray-800 resize-none"
                      rows={3}
                      value={editValues.address || ""}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          address: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedUser.address}
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    editingField === "address"
                      ? handleSaveField()
                      : setEditingField("address")
                  }
                  className="text-green-600 text-xs font-bold mt-3 uppercase tracking-widest"
                >
                  {editingField === "address" ? "Save Address" : "Edit Address"}
                </button>
              </div>

              {/* Joined */}
              <div className="bg-gray-50 px-6 py-4 rounded-2xl flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Date Joined
                </span>
                <span className="text-sm font-bold text-gray-700">
                  {selectedUser.dateJoined}
                </span>
              </div>

              {/* Deactivate */}
              <button
                onClick={() => setModalType("delete")}
                className="w-full py-5 text-red-500 font-bold border-2 border-red-100 rounded-3xl hover:bg-red-50 transition-all uppercase tracking-widest text-xs"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIST VIEW ─────────────────────────────────────────────────────── */}
      {currentView === "list" && (
        <div>
          {/* Header */}
          <div className="bg-green-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xl">
            <Menu className="w-6 h-6 cursor-pointer" />
            <h1 className="text-lg font-bold tracking-tighter uppercase">
              User Management
            </h1>
            <Bell className="w-6 h-6" />
          </div>

          {/* Search */}
          <div className="px-4 py-4 bg-white border-b border-gray-100">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-gray-800"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 py-3 flex gap-3 overflow-x-auto bg-white border-b border-gray-100">
            {(["all", "client", "vendor", "rider"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
                <span className="ml-2 opacity-60">
                  (
                  {tab === "all"
                    ? users.length
                    : users.filter((u) => u.type.toLowerCase() === tab).length}
                  )
                </span>
              </button>
            ))}
          </div>

          {/* User list */}
          <div className="px-4 py-4 space-y-3 max-w-3xl mx-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-20 text-gray-300">
                <UserIcon size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold uppercase tracking-widest text-sm">
                  No users found
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="bg-white rounded-2xl py-5 px-5 flex items-center justify-between border border-gray-100 hover:border-green-300 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center font-bold text-emerald-600 text-lg shadow-inner group-hover:rotate-6 transition-transform">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-gray-800 font-bold tracking-tight">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        {user.type} • {user.dateJoined}
                      </p>
                      {user.status === "pending" && (
                        <span className="text-[10px] text-orange-600 font-bold uppercase flex items-center gap-1 mt-1 tracking-widest">
                          <Clock size={10} className="animate-pulse" /> Pending
                          Approval
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-hover:text-green-600 transition-colors"
                  />
                </div>
              ))
            )}
          </div>

          {/* ── DETAILS MODAL ──────────────────────────────────────────────── */}
          {modalType === "details" && selectedUser && (
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <div
                className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <UserIcon size={32} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 tracking-tighter uppercase">
                    {selectedUser.name}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedUser.email}
                  </p>
                  {selectedUser.status === "pending" && (
                    <span className="inline-block mt-2 px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-200">
                      Pending Approval
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Approve Rider */}
                  {selectedUser.type === "Rider" &&
                    selectedUser.status === "pending" && (
                      <button
                        onClick={() => handleApproveRider(selectedUser.id)}
                        disabled={actionLoading}
                        className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-60"
                      >
                        {actionLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Approve Rider
                      </button>
                    )}

                  {/* Approve Vendor */}
                  {selectedUser.type === "Vendor" &&
                    selectedUser.status === "pending" && (
                      <button
                        onClick={() => handleApproveVendor(selectedUser.id)}
                        disabled={actionLoading}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-60"
                      >
                        {actionLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Approve Vendor
                      </button>
                    )}

                  {/* View Profile */}
                  <button
                    onClick={() => {
                      setCurrentView("profile");
                      setModalType(null);
                    }}
                    className="w-full py-4 bg-gray-50 text-gray-700 font-bold rounded-2xl flex justify-between px-6 items-center active:scale-95 transition-all uppercase tracking-widest text-xs"
                  >
                    View Full Profile <ChevronRight size={18} />
                  </button>

                  {/* Deactivate */}
                  <button
                    onClick={() => setModalType("delete")}
                    className="w-full py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all uppercase tracking-widest text-xs"
                  >
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── DELETE MODAL ───────────────────────────────────────────────── */}
          {modalType === "delete" && selectedUser && (
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <div
                className="bg-white rounded-[2.5rem] w-full max-w-xs p-10 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 tracking-tighter uppercase">
                  Are you sure?
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  This will deactivate{" "}
                  <span className="font-bold text-gray-600">
                    {selectedUser.name}
                  </span>
                  . This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeactivate}
                    disabled={actionLoading}
                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : null}
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
