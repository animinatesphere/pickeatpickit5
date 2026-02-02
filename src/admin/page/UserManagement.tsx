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
  User as UserIcon
} from "lucide-react";

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
      alert("Rider approved!");
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Loading Users...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. PROFILE VIEW (FULL DETAILS) */}
      {currentView === "profile" && selectedUser && (
        <div className="min-h-screen bg-gray-50 animate-fadeIn pb-20">
          <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
            <button onClick={() => setCurrentView("list")} className="p-1 hover:bg-green-700 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">User Profile</h1>
            <Bell className="w-6 h-6" />
          </div>

          <div className="px-4 py-6">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4 border-4 border-white shadow-lg">
                <UserIcon size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold mt-2 uppercase">
                {selectedUser.type}
              </span>
            </div>

            {/* Information Cards */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contact Information</h3>
                
                {/* Full Name Edit */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Full Name</p>
                  <div className="flex justify-between items-center">
                    {editingField === 'name' ? (
                      <input className="border-b-2 border-green-500 flex-1 outline-none font-bold" 
                        value={editValues.name} onChange={e => setEditValues({...editValues, name: e.target.value})} />
                    ) : <p className="font-bold text-gray-800">{selectedUser.name}</p>}
                    <button onClick={() => editingField === 'name' ? handleSaveField() : handleEditField('name')} className="text-green-600 text-sm font-bold ml-2">
                      {editingField === 'name' ? 'Save' : 'Edit'}
                    </button>
                  </div>
                </div>

                {/* Email (Read Only usually) */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <p className="font-bold text-gray-800">{selectedUser.email}</p>
                </div>

                {/* Phone Edit */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                  <div className="flex justify-between items-center">
                    {editingField === 'phone' ? (
                      <input className="border-b-2 border-green-500 flex-1 outline-none font-bold" 
                        value={editValues.phone} onChange={e => setEditValues({...editValues, phone: e.target.value})} />
                    ) : <p className="font-bold text-gray-800">{selectedUser.phone}</p>}
                    <button onClick={() => editingField === 'phone' ? handleSaveField() : handleEditField('phone')} className="text-green-600 text-sm font-bold ml-2">
                      {editingField === 'phone' ? 'Save' : 'Edit'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-green-600" />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery Address</h3>
                </div>
                {editingField === 'address' ? (
                  <textarea className="w-full border-2 border-green-500 rounded-lg p-2 text-sm" 
                    value={editValues.address} onChange={e => setEditValues({...editValues, address: e.target.value})} />
                ) : <p className="text-gray-700 text-sm leading-relaxed">{selectedUser.address}</p>}
                <button onClick={() => editingField === 'address' ? handleSaveField() : handleEditField('address')} className="text-green-600 text-sm font-bold mt-2">
                   {editingField === 'address' ? 'Save Address' : 'Change Address'}
                </button>
              </div>

              <button onClick={() => setModalType('delete')} className="w-full py-4 text-red-600 font-bold border-2 border-red-100 rounded-2xl hover:bg-red-50">
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
          <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
            <Menu className="w-6 h-6" />
            <h1 className="text-lg font-semibold">User management</h1>
            <Bell className="w-6 h-6" />
          </div>

          <div className="px-4 py-4 bg-white shadow-sm">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 py-4 flex gap-2 overflow-x-auto bg-white border-b">
            {['all', 'client', 'vendor', 'rider'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === tab ? "bg-green-600 text-white shadow-md" : "bg-gray-100 text-gray-600"}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* User List */}
          <div className="px-4 py-2 space-y-2 mt-2">
            {filteredUsers.map((user) => (
              <div key={user.id} onClick={() => handleUserClick(user)} 
                className="bg-white rounded-xl py-4 px-4 flex items-center justify-between border border-gray-100 hover:border-green-200 transition-all cursor-pointer shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center font-bold text-emerald-600">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-gray-800 font-bold">{user.name}</p>
                    {user.type === 'Rider' && user.status === 'pending' && (
                      <span className="text-[10px] text-orange-600 font-bold uppercase flex items-center gap-1">
                        <Clock size={10} className="animate-pulse" /> Pending Approval
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            ))}
          </div>

          {/* MODALS */}
          {modalType === "details" && selectedUser && (
            <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4" onClick={closeModal}>
              <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-slideUp" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>

                <div className="space-y-3">
                  {selectedUser.type === 'Rider' && selectedUser.status === 'pending' && (
                    <button onClick={() => handleApproveRider(selectedUser.id)}
                      className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                      <CheckCircle size={20}/> Approve Rider
                    </button>
                  )}
                  <button onClick={handleViewProfile} className="w-full py-4 bg-gray-50 text-gray-700 font-bold rounded-2xl flex justify-between px-6 items-center">
                    View Full Profile <ChevronRight size={18} />
                  </button>
                  <button onClick={() => setModalType('delete')} className="w-full py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl">
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Modals ... (Rest of your existing Delete Modal logic) */}
          {modalType === "delete" && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeModal}>
              <div className="bg-white rounded-3xl w-full max-w-xs p-8 text-center" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-red-600 mb-2">Are you sure?</h2>
                <p className="text-gray-500 text-sm mb-8">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">No</button>
                  <button onClick={handleDeactivate} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Yes</button>
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