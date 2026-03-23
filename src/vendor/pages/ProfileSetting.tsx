import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { backendAuthService } from "../../services/backendAuthService";
import { supabase } from "../../services/authService";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";

const ProfileSetting = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>("");

  const [formData, setFormData] = useState({
    restaurantName: "",
    category: "Restaurant",
    email: "",
    phone: "",
    fullName: "",
    address: "",
    zip: "",
    city: "",
    state: "",
    deliveryRange: "",
  });

  // ── Fetch vendor from backend ───────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        const user = await backendAuthService.getCurrentUser();
        if (!user) {
          window.location.href = "/vendor-login";
          return;
        }

        const vId = user.vendor_id || user.id;
        setVendorId(vId);

        // GET /vendors/{vendor_id}
        const res = await api.get(`/vendors/${vId}`);
        const d = res.data;

        setProfileImage(d.logo_url || "");
        setIsOpen(d.opening_time ? true : false);

        setFormData({
          restaurantName: d.business_name || "",
          category: d.business_category || d.profession || "Restaurant",
          email: d.business_email || d.email || "",
          phone: d.business_phone || d.phone || "",
          fullName:
            d.full_name || `${d.firstname || ""} ${d.lastname || ""}`.trim(),
          address: d.business_address || "",
          zip: "",
          city: d.lga || "",
          state: d.state || "",
          deliveryRange:
            d.day_from && d.day_to ? `${d.day_from} – ${d.day_to}` : "Not Set",
        });
      } catch (e) {
        console.error("ProfileSetting load error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Inline field editing ────────────────────────────────────────────────────
  const handleEdit = (field: string, val: string) => {
    setEditingField(field);
    setTempValue(val);
  };
  const handleSave = (field: string) => {
    setFormData((p) => ({ ...p, [field]: tempValue }));
    setEditingField(null);
  };
  const handleCancel = () => {
    setEditingField(null);
    setTempValue("");
  };

  // ── Photo upload — Supabase storage ─────────────────────────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vendorId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warning("File must be under 5MB", "File Too Large");
      return;
    }

    setIsPhotoLoading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `vendor-logos/${vendorId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("vendor-assets") // update bucket name if different
        .upload(path, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      const { data } = supabase.storage
        .from("vendor-assets")
        .getPublicUrl(path);
      const url = data.publicUrl;

      // Save URL back to backend
      await api.patch(`/vendors/${vendorId}`, { logo_url: url });
      setProfileImage(url);
      toast.success("Profile photo updated!");
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error("Failed to upload photo");
    } finally {
      setIsPhotoLoading(false);
    }
  };

  // ── Save all changes ─────────────────────────────────────────────────────────
  const handleSaveChanges = async () => {
    if (!vendorId) return;
    setIsSaving(true);
    try {
      await api.patch(`/vendors/${vendorId}`, {
        business_name: formData.restaurantName,
        full_name: formData.fullName,
        business_email: formData.email,
        business_phone: formData.phone,
        business_address: formData.address,
        state: formData.state,
        lga: formData.city,
      });
      toast.success("Profile saved successfully!");
    } catch (e) {
      console.error("Save error:", e);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Editable field component ────────────────────────────────────────────────
  const EditableField = ({
    label,
    field,
    value,
    type = "text",
  }: {
    label: string;
    field: string;
    value: string;
    type?: string;
  }) => (
    <div className="mb-5">
      <label className="text-xs text-gray-500 mb-2 block font-bold uppercase tracking-widest">
        {label}
      </label>
      <div className="flex gap-2">
        {editingField === field ? (
          <>
            <input
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              autoFocus
              className="flex-1 px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-xl text-gray-900 outline-none focus:border-blue-500 transition-all font-medium"
            />
            <button
              onClick={() => handleSave(field)}
              className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all active:scale-95"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-bold border border-gray-100 min-h-[48px] flex items-center">
              {value || (
                <span className="text-gray-300 font-normal">Not set</span>
              )}
            </div>
            <button
              onClick={() => handleEdit(field, value)}
              className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all active:scale-95 font-bold uppercase text-xs tracking-widest"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-32">
      <VendorNav />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/20 rounded-lg transition-all active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tighter uppercase">
            Profile Settings
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Status toggle */}
        <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-800 uppercase tracking-tighter">
              Restaurant Status
            </h3>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              {isOpen ? "Currently open for orders" : "Currently closed"}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative w-16 h-8 rounded-full transition-all duration-300 ${isOpen ? "bg-green-600" : "bg-gray-300"}`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${isOpen ? "left-9" : "left-1"}`}
            />
          </button>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-50">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Photo */}
            <div className="relative flex-shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center shadow-lg cursor-pointer overflow-hidden border-4 border-white relative"
              >
                {isPhotoLoading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-all active:scale-90"
              >
                <Edit2 className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Name preview */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
                {formData.restaurantName || "Restaurant Name"}
              </h2>
              <p className="text-green-600 font-bold uppercase text-sm tracking-widest">
                {formData.category}
              </p>
              <p className="text-gray-400 text-sm mt-1">{formData.email}</p>
              <p className="text-gray-500 text-sm font-bold">
                {formData.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-50">
          <h3 className="font-black text-green-700 uppercase tracking-tighter mb-6">
            Personal Information
          </h3>
          <EditableField
            label="Full Name"
            field="fullName"
            value={formData.fullName}
          />
          <EditableField
            label="Business Name"
            field="restaurantName"
            value={formData.restaurantName}
          />
          <EditableField
            label="Email"
            field="email"
            value={formData.email}
            type="email"
          />
          <EditableField
            label="Phone"
            field="phone"
            value={formData.phone}
            type="tel"
          />
        </div>

        {/* Address */}
        <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-50">
          <h3 className="font-black text-gray-800 uppercase tracking-tighter mb-4">
            Address
          </h3>

          {editingField === "address" ? (
            <div className="mb-4">
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                rows={3}
                autoFocus
                className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-xl text-gray-900 outline-none transition-all resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSave("address")}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleEdit("address", formData.address)}
              className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all font-medium text-gray-700 mb-4 min-h-[48px]"
            >
              {formData.address || (
                <span className="text-gray-300">Click to add address</span>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Zip", key: "zip" },
              { label: "City", key: "city" },
              { label: "State", key: "state" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[10px] text-gray-400 mb-1 block font-bold uppercase tracking-widest">
                  {f.label}
                </label>
                <input
                  type="text"
                  value={formData[f.key as keyof typeof formData]}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-gray-50 border-b-2 border-gray-200 rounded-lg text-gray-900 outline-none focus:border-green-500 transition-all font-bold text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Delivery range */}
        <div className="bg-white rounded-[2rem] shadow-xl p-6 border border-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-black text-gray-800 uppercase tracking-tighter">
                Delivery Range
              </h3>
              <p className="text-sm text-gray-400">{formData.deliveryRange}</p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-56 bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126182.48419177555!2d7.314454!3d9.073676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0a5e32c9a903%3A0x9c9b57a5e7c0f5d6!2sAbuja%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1234567890"
            />
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-5 z-40">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetting;
