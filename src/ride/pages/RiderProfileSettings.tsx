import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, X, Check, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/authService";

interface ProfileData {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  city: string;
  state: string;
  address: string;
  profileImage: string;
  isActive: boolean;
}

type EditField = "fullName" | "email" | "phone" | "address" | null;

export default function RiderProfileSettings() {
  const [profileData, setProfileData] = useState<ProfileData>({
    id: "",
    fullName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    zip: "",
    city: "",
    state: "",
    address: "",
    profileImage: "",
    isActive: true,
  });

  const [editingField, setEditingField] = useState<EditField>(null);
  const [tempValue, setTempValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchRiderProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/rider-login");
          return;
        }

        const { data: rider, error } = await supabase
          .from("riders")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (rider) {
          // Also fetch address from users table
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

          setProfileData({
            id: rider.id,
            fullName: `${rider.firstname || ""} ${rider.lastname || ""}`.trim() || "Unidentified Operative",
            firstName: rider.firstname || "",
            lastName: rider.lastname || "",
            email: rider.email || session.user.email || "",
            phone: rider.phone || "",
            zip: userData?.zip || "",
            city: userData?.city || "",
            state: userData?.state || "",
            address: userData?.address || "",
            profileImage: rider.profile_image || "",
            isActive: rider.is_active ?? true,
          });
        }
      } catch (err) {
        console.error("Error fetching rider profile:", err);
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    }

    fetchRiderProfile();
  }, [navigate]);

  const handleEdit = (field: EditField) => {
    if (field) {
      setEditingField(field);
      setTempValue(profileData[field] as string);
    }
  };

  const handleSaveField = (field: EditField) => {
    if (field) {
      if (field === "fullName") {
        const parts = tempValue.split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";
        setProfileData({ ...profileData, fullName: tempValue, firstName, lastName });
      } else {
        setProfileData({ ...profileData, [field]: tempValue });
      }
      setEditingField(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, upload to storage
      // For now, let's just use local preview or direct update if we have storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setProfileData(prev => ({ ...prev, profileImage: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Update riders table
      const { error: riderError } = await supabase
        .from("riders")
        .update({
          firstname: profileData.firstName,
          lastname: profileData.lastName,
          phone: profileData.phone,
          profile_image: profileData.profileImage,
          is_active: profileData.isActive
        })
        .eq("id", profileData.id);

      if (riderError) throw riderError;

      // Update users table for address info
      const { error: userError } = await supabase
        .from("users")
        .upsert({
          user_id: session.user.id,
          email: session.user.email,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip: profileData.zip,
          phone: profileData.phone,
          firstname: profileData.firstName,
          lastname: profileData.lastName,
        }, { onConflict: 'user_id' });

      if (userError) throw userError;

      // Success! Maybe show a toast
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActiveStatus = async () => {
    const newStatus = !profileData.isActive;
    setProfileData(prev => ({ ...prev, isActive: newStatus }));
    
    // Immediate update in background
    try {
      await supabase
        .from("riders")
        .update({ is_active: newStatus })
        .eq("id", profileData.id);
    } catch (err) {
      console.error("Error toggling active status:", err);
    }
  };

  const renderEditableField = (
    label: string,
    field: EditField,
    value: string,
    type: string = "text"
  ) => {
    const isEditing = editingField === field;

    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-[10px] font-black italic uppercase tracking-[0.2em] text-gray-400 mb-1 block">{label}</label>
            {isEditing ? (
              <input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full text-sm font-black italic uppercase tracking-tighter text-gray-900 border-b-2 border-green-500 focus:outline-none bg-transparent pb-1 transition-all"
                autoFocus
              />
            ) : (
              <p className="text-sm font-black italic uppercase tracking-tighter text-gray-800">{value || "NOT SET"}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleSaveField(field)}
                  className="w-10 h-10 bg-green-600 text-white rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="w-10 h-10 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleEdit(field)}
                className="px-6 py-2 bg-gray-50 text-green-600 text-[10px] font-black italic uppercase tracking-widest rounded-xl hover:bg-green-50 active:scale-95 transition-all"
              >
                Modify
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter pb-32">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/rider-profile">
            <button className="w-12 h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all duration-300 active:scale-90 shadow-sm border border-gray-100">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
          </Link>
          <h1 className="text-lg font-black italic uppercase tracking-tighter text-gray-800">Operational profile</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Active Status */}
        <div
          className={`transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] shadow-xl border border-gray-50">
            <div>
              <span className="text-xs font-black italic uppercase tracking-[0.3em] text-gray-400">Network Status</span>
              <p className={`text-xl font-black italic uppercase tracking-tighter mt-1 ${profileData.isActive ? "text-green-600" : "text-gray-400"}`}>
                {profileData.isActive ? "Online & Ready" : "Signal Offline"}
              </p>
            </div>
            <button
              onClick={toggleActiveStatus}
              className={`relative w-16 h-9 rounded-full transition-all duration-500 shadow-inner ${
                profileData.isActive ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-xl transition-all duration-500 transform ${
                  profileData.isActive ? "translate-x-7 rotate-180" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div
          className={`transform transition-all duration-700 delay-100 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-gray-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Camera size={120} className="text-gray-900" />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
              {/* Profile Photo */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-green-400 to-green-600 p-1 shadow-2xl overflow-hidden group-hover:rotate-6 transition-transform duration-500">
                  <div className="w-full h-full rounded-[2.3rem] bg-white overflow-hidden">
                    {profileData.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                        <Camera size={48} />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-gray-50 active:scale-90 transition-all text-green-600 z-20"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-[10px] font-black italic uppercase tracking-[0.4em] text-gray-400 mb-2">Agent ID: {profileData.id.slice(0, 8)}</p>
                <h2 className="text-3xl font-black italic tracking-tighter text-gray-800 uppercase leading-none mb-3">
                  {profileData.firstName || "New"} <br/> {profileData.lastName || "Operative"}
                </h2>
                <div className="flex flex-col gap-2">
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">{profileData.email}</p>
                   <p className="text-lg font-black italic text-green-600 tracking-tighter underline decoration-2 underline-offset-4">{profileData.phone || "--- --- ----"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intel Sections */}
        <div
          className={`space-y-6 transform transition-all duration-700 delay-200 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="flex items-center gap-3 mb-2 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <h3 className="text-xs font-black italic uppercase tracking-[0.4em] text-gray-800">Personal Intel</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {renderEditableField("Display Name", "fullName", profileData.fullName)}
            {renderEditableField("Active Signal (Phone)", "phone", profileData.phone, "tel")}
          </div>
        </div>

        <div
          className={`space-y-6 transform transition-all duration-700 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="flex items-center gap-3 mb-2 px-2 mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-xs font-black italic uppercase tracking-[0.4em] text-gray-800">Logistics Data</h3>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50">
            <label className="text-[10px] font-black italic uppercase tracking-[0.2em] text-gray-400 mb-4 block">Base of Operations</label>
            {editingField === "address" ? (
              <div className="space-y-4">
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full text-sm font-bold text-gray-800 border-2 border-green-500 rounded-2xl p-4 focus:outline-none bg-gray-50 transition-all resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => handleSaveField("address")}
                    className="px-8 py-3 bg-green-600 text-white text-xs font-black italic uppercase tracking-widest rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-8 py-3 bg-gray-100 text-gray-500 text-xs font-black italic uppercase tracking-widest rounded-xl active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-6 p-2">
                <p className="text-sm font-black italic uppercase tracking-tight text-gray-800 leading-relaxed">
                  {profileData.address || "NO ADDRESS DATA"}
                </p>
                <button
                  onClick={() => handleEdit("address")}
                  className="px-6 py-2 bg-gray-50 text-green-600 text-[10px] font-black italic uppercase tracking-widest rounded-xl hover:bg-green-50 active:scale-95 transition-all flex-shrink-0"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Regional Data */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Sector (Zip)", key: "zip" },
              { label: "Node (City)", key: "city" },
              { label: "District (State)", key: "state" }
            ].map((field) => (
              <div key={field.key} className="bg-white rounded-[1.5rem] p-4 shadow-lg border border-gray-50">
                <label className="text-[8px] font-black italic uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={profileData[field.key as keyof ProfileData] as string}
                  onChange={(e) =>
                    setProfileData({ ...profileData, [field.key]: e.target.value })
                  }
                  className="text-xs font-black text-gray-800 w-full focus:outline-none border-b border-transparent focus:border-green-500 bg-transparent py-1 tracking-tighter uppercase italic transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-md mx-auto p-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-5 rounded-2xl font-black italic uppercase tracking-[0.2em] text-white text-base shadow-2xl transition-all duration-500 ${
              isSaving
                ? "bg-gray-400 scale-95"
                : "bg-green-600 hover:bg-green-700 hover:shadow-green-600/30 active:scale-95"
            }`}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-3 animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin" />
                Encrypting Intel...
              </span>
            ) : (
              "Upload profile data"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
