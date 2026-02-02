import { useEffect, useState } from "react";
import { getAllSystemUsers, updateRiderStatus, deleteUserFromSystem } from "../../services/api";
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
  X
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

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

type ModalType = "details" | "suspend" | "delete" | "suspendSuccess" | "deleteSuccess" | null;
type ViewType = "list" | "profile";

const UserManagement = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"all" | "client" | "vendor" | "rider">("all");
  // const [showSuspended, setShowSuspended] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("list");
  
  // States for Editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<User>>({});
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllSystemUsers();
      const formattedData = data.map((u: any) => ({
        ...u,
        id: u.id,
        name: u.name || u.business_name || "Unknown",
        type: u.type,
        dateJoined: new Date(u.created_at).toLocaleDateString(),
        isSuspended: u.is_suspended || false,
        fullName: u.name || u.full_name,
        phone: u.phone || u.business_phone || "No phone",
        address: u.address || u.business_address || "No address",
        email: u.email || u.business_email
      }));
      setUsers(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setModalType("details");
    // Pre-fill edit values
    setEditValues(user);
  };

  const handleViewProfile = () => {
    setCurrentView("profile");
    setModalType(null);
  };

  const handleEditField = (field: string) => {
    setEditingField(field);
  };

  const handleSaveField = async () => {
    if (selectedUser) {
      // Optmistically update UI
      const updatedUser = { ...selectedUser, ...editValues };
      setSelectedUser(updatedUser);
      
      // Here you would call an API update if needed
      // await updateUserProfile(selectedUser.id, editValues);
      
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
    }
    setEditingField(null);
  };

  const handleApproveRider = async (id: string) => {
    const { error } = await updateRiderStatus(id, 'accepted');
    if (!error) {
      toast.success("Rider approved successfully!", "Rider Approved");
      fetchUsers(); 
      closeModal();
    }
  };

  const handleDeactivate = async () => {
    if (selectedUser) {
      const { error } = await deleteUserFromSystem(selectedUser.id, selectedUser.type);
      if (!error) {
        setModalType("deleteSuccess");
        fetchUsers();
      }
    }
  };

  const closeModal = () => {
    setModalType(null);
    if (currentView === 'list') setSelectedUser(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === "all" || user.type.toLowerCase() === activeTab;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-bold font-inter italic tracking-widest uppercase">Loading Users...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* 1. PROFILE VIEW (FULL DETAILS) */}
      {currentView === "profile" && selectedUser && (
        <div className="min-h-screen bg-white dark:bg-gray-950 animate-fadeIn pb-20">
          <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
            <button onClick={() => setCurrentView("list")} className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold font-inter italic tracking-tighter uppercase">User Profile</h1>
            <Bell className="w-6 h-6" />
          </div>

          <div className="px-4 py-10">
            <div className="flex flex-col items-center mb-10">
              <div className="w-28 h-28 rounded-3xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 border-4 border-white dark:border-gray-800 shadow-2xl shadow-green-500/20 transform -rotate-3 transition-transform hover:rotate-0">
                <UserIcon size={48} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">{selectedUser.name}</h2>
              <span className="px-4 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold mt-4 uppercase italic tracking-widest border border-green-200 dark:border-green-800">
                {selectedUser.type}
              </span>
            </div>

            {/* Information Cards */}
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-transparent dark:border-gray-800 transition-all">
                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-6">Contact Information</h3>
                
                {/* Full Name Edit */}
                <div className="mb-6">
                  <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-widest mb-2">Full Name</p>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-transparent focus-within:border-green-500 transition-all">
                    {editingField === 'name' ? (
                      <input className="bg-transparent flex-1 outline-none font-bold text-gray-800 dark:text-gray-100 font-inter" 
                        value={editValues.name} onChange={e => setEditValues({...editValues, name: e.target.value})} />
                    ) : <p className="font-bold text-gray-800 dark:text-gray-100 font-inter">{selectedUser.name}</p>}
                    <button onClick={() => editingField === 'name' ? handleSaveField() : handleEditField('name')} className="text-green-600 dark:text-green-400 text-xs font-bold ml-2 uppercase italic tracking-widest">
                      {editingField === 'name' ? 'Save' : 'Edit'}
                    </button>
                  </div>
                </div>
 
                {/* Email (Read Only usually) */}
                <div className="mb-6">
                  <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-widest mb-2">Email Address</p>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-transparent">
                    <p className="font-bold text-gray-800 dark:text-gray-100 font-inter">{selectedUser.email}</p>
                  </div>
                </div>
 
                {/* Phone Edit */}
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-widest mb-2">Phone Number</p>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-transparent focus-within:border-green-500 transition-all">
                    {editingField === 'phone' ? (
                      <input className="bg-transparent flex-1 outline-none font-bold text-gray-800 dark:text-gray-100 font-inter" 
                        value={editValues.phone} onChange={e => setEditValues({...editValues, phone: e.target.value})} />
                    ) : <p className="font-bold text-gray-800 dark:text-gray-100 font-inter">{selectedUser.phone}</p>}
                    <button onClick={() => editingField === 'phone' ? handleSaveField() : handleEditField('phone')} className="text-green-600 dark:text-green-400 text-xs font-bold ml-2 uppercase italic tracking-widest">
                      {editingField === 'phone' ? 'Save' : 'Edit'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-transparent dark:border-gray-800 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-green-600 dark:text-green-400" />
                  <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">Delivery Address</h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-transparent focus-within:border-green-500 transition-all">
                  {editingField === 'address' ? (
                    <textarea className="bg-transparent w-full outline-none text-sm text-gray-800 dark:text-gray-100 font-inter resize-none" rows={3}
                      value={editValues.address} onChange={e => setEditValues({...editValues, address: e.target.value})} />
                  ) : <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-inter">{selectedUser.address}</p>}
                </div>
                <button onClick={() => editingField === 'address' ? handleSaveField() : handleEditField('address')} className="text-green-600 dark:text-green-400 text-xs font-bold mt-4 uppercase italic tracking-widest">
                   {editingField === 'address' ? 'Save Address' : 'Change Address'}
                </button>
              </div>

              <button onClick={() => setModalType('delete')} className="w-full py-5 text-red-500 font-bold border-2 border-red-100 dark:border-red-900/30 rounded-3xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all uppercase italic tracking-widest text-xs">
                Delete User Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. LIST VIEW */}
      {currentView === "list" && (
        <div className="animate-fadeIn">
          {/* ... Header ... */}
          <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xl transition-all">
            <Menu className="w-6 h-6 hover:scale-110 transition-transform cursor-pointer" />
            <h1 className="text-lg font-bold font-inter italic tracking-tighter uppercase">User management</h1>
            <Bell className="w-6 h-6 hover:scale-110 transition-transform cursor-pointer" />
          </div>

          <div className="px-4 py-6 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
            <div className="relative group max-w-lg mx-auto">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              <input type="text" placeholder="Search through users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 dark:focus:border-green-400 outline-none text-gray-800 dark:text-gray-100 transition-all font-inter" />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 py-4 flex gap-3 overflow-x-auto bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 no-scrollbar">
            {['all', 'client', 'vendor', 'rider'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-2.5 rounded-full font-bold text-xs uppercase italic tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? "bg-green-600 dark:bg-green-700 text-white shadow-lg shadow-green-500/20 active:scale-95" : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* User List */}
          <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
            {filteredUsers.map((user) => (
              <div key={user.id} onClick={() => handleUserClick(user)} 
                className="bg-white dark:bg-gray-900 rounded-2xl py-5 px-5 flex items-center justify-between border border-transparent dark:border-gray-800 hover:border-green-200 dark:hover:border-green-900/50 transition-all cursor-pointer shadow-sm hover:shadow-xl group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 font-inter transform group-hover:rotate-12 transition-transform shadow-inner">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-gray-800 dark:text-gray-100 font-bold font-inter tracking-tight">{user.name}</p>
                    {user.type === 'Rider' && user.status === 'pending' && (
                      <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase flex items-center gap-1 mt-0.5 italic tracking-widest">
                        <Clock size={10} className="animate-pulse" /> Pending Approval
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 dark:text-gray-700 group-hover:text-green-600 transition-colors" />
              </div>
            ))}
          </div>

          {/* MODALS */}
          {modalType === "details" && selectedUser && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={closeModal}>
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-sm p-8 animate-slideUp border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <UserIcon size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-500 font-inter mt-1">{selectedUser.email}</p>
                </div>
 
                <div className="space-y-4">
                  {selectedUser.type === 'Rider' && selectedUser.status === 'pending' && (
                    <button onClick={() => handleApproveRider(selectedUser.id)}
                      className="w-full py-5 bg-green-600 dark:bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 active:scale-95 transition-all uppercase italic tracking-widest text-xs">
                      <CheckCircle size={20}/> Approve Rider
                    </button>
                  )}
                  <button onClick={handleViewProfile} className="w-full py-5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl flex justify-between px-8 items-center active:scale-95 transition-all uppercase italic tracking-widest text-xs">
                    View Full Profile <ChevronRight size={18} />
                  </button>
                  <button onClick={() => setModalType('delete')} className="w-full py-5 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all uppercase italic tracking-widest text-xs">
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Modals ... (Rest of your existing Delete Modal logic) */}
          {modalType === "delete" && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-xs p-10 text-center animate-bounceIn border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 font-inter italic tracking-tighter uppercase">Are you sure?</h2>
                <p className="text-gray-500 dark:text-gray-500 text-sm mb-8 font-inter">This action cannot be undone.</p>
                <div className="flex gap-4 font-inter">
                  <button onClick={closeModal} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold uppercase italic tracking-widest text-xs active:scale-95 transition-all">No</button>
                  <button onClick={handleDeactivate} className="flex-1 py-4 bg-red-600 dark:bg-red-700 text-white rounded-2xl font-bold uppercase italic tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 transition-all">Yes</button>
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