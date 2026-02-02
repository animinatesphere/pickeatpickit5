import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, MapPin, Edit2, Check, X } from "lucide-react";
import { VendorNav } from "../component/VendorNav";
// import { apiService } from "../services/authService";
import { apiService, supabase } from "../../services/authService";
import { useToast } from "../../context/ToastContext";
// import { error } from "console";

const ProfileSetting = () => {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
const [profileImage, setProfileImage] = useState<string>("");
const [isPhotoLoading, setIsPhotoLoading] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
  // Initialize formData with empty values - will be populated by useEffect
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

  const [tempValue, setTempValue] = useState("");

  // ... rest of your code
  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSave = (field: string) => {
    setFormData({ ...formData, [field]: tempValue });
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue("");
  };
useEffect(() => {
  const fetchVendorData = async () => {
    try {
      setIsLoading(true);

      // 1. Check session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/vendor-login";
        return;
      }

      // 2. Check email verification
      if (!session.user.email_confirmed_at) {
        toast.warning("Please verify your email before accessing your profile.", "Email Verification Required");
        window.location.href = "/vendor-login";
        return;
      }

      // 3. Get current user
      const user = await apiService.getCurrentUser();
      if (!user) {
        window.location.href = "/vendor-login";
        return;
      }

      // 4. Get vendor record FIRST (This provides the vendor ID)
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("id, email, firstname, lastname, phone, business_address, business_name, state, lga")
        .eq("user_id", user.id)
        .single();

      if (vendorError || !vendorData) {
        console.error("Error fetching vendor:", vendorError);
        return;
      }

      setVendorId(vendorData.id);

      // 5. NOW fetch the photo using the valid vendorData.id
      const { data: photoData } = await supabase
        .from("vendor_photos")
        .select("photo_url")
        .eq("vendor_id", vendorData.id)
        .eq("photo_type", "store_logo")
        .order("uploaded_at", { ascending: false })
        .limit(1);

      if (photoData && photoData.length > 0) {
        setProfileImage(photoData[0].photo_url);
      }

      // 6. Fetch remaining profile data
      const { data: profileData } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("vendor_id", vendorData.id)
        .single();

      const { data: availabilityData } = await supabase
        .from("vendor_availability")
        .select("*")
        .eq("vendor_id", vendorData.id)
        .single();

      // 7. Update formData
      setFormData({
        restaurantName: profileData?.business_name || vendorData.business_name || "Restaurant Name",
        category: "Restaurant",
        email: profileData?.business_email || vendorData.email || "",
        phone: profileData?.business_phone || vendorData.phone || "",
        fullName: profileData?.full_name || `${vendorData.firstname || ""} ${vendorData.lastname || ""}`.trim(),
        address: profileData?.business_address || vendorData.business_address || "",
        zip: "900104",
        city: profileData?.lga || vendorData.lga || "City",
        state: profileData?.state || vendorData.state || "State",
        deliveryRange: availabilityData?.day_from && availabilityData?.day_to
            ? `${availabilityData.day_from} - ${availabilityData.day_to}`
            : "Not Set",
      });

      if (availabilityData?.is_open !== undefined) {
        setIsOpen(availabilityData.is_open);
      }
    } catch (error) {
      console.error("Error loading vendor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchVendorData();
}, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !vendorId) return;

  // Basic validation
  if (file.size > 1024 * 1024) {
    toast.warning("File size must be less than 1MB", "File Too Large");
    return;
  }

  try {
    setIsPhotoLoading(true);
    
    // Call your existing service
    const response = await apiService.uploadVendorPhoto(vendorId, file, "store_logo");
    
    if (response && response.length > 0) {
      // Update local UI
      const newUrl = response[0].photo_url as string;
      setProfileImage(newUrl);
      toast.success("Profile photo updated!", "Photo Updated");
    }
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("Failed to upload photo", "Upload Error");
  } finally {
    setIsPhotoLoading(false);
  }
};
  const handleSaveChanges = async () => {
    if (!vendorId) return;

    try {
      // Update vendor_profiles
      await supabase
        .from("vendor_profiles")
        .update({
          business_name: formData.restaurantName,
          full_name: formData.fullName,
          business_email: formData.email,
          business_phone: formData.phone,
          business_address: formData.address,
          state: formData.state,
          lga: formData.city,
        })
        .eq("vendor_id", vendorId);

      toast.success("Profile updated successfully!", "Profile Saved");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save changes", "Save Error");
    }
  };
  // / Add this before the main return
  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
  //       <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
  //         <p className="text-red-600 mb-4">{error}</p>
  //         <button
  //           onClick={() => (window.location.href = "/vendor-login")}
  //           className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
  //         >
  //           Go to Login
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <VendorNav />
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white px-6 py-4 shadow-lg sticky top-0 z-20 transition-all">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/20 rounded-lg transition-all" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-inter italic tracking-tighter uppercase">Profile Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Restaurant Status Toggle */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-transparent dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-inter italic uppercase tracking-tighter">
              Restaurant Status
            </h3>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                isOpen ? "bg-green-600" : "bg-gray-300 dark:bg-gray-800"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white dark:bg-gray-100 rounded-full shadow-md transition-all duration-300 ${
                  isOpen ? "left-9" : "left-1"
                }`}
              />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-2">
            {isOpen
              ? "Your restaurant is currently open"
              : "Your restaurant is currently closed"}
          </p>
        </div>

        {/* Profile Card */}
     <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-transparent dark:border-gray-800 transition-all">
  <div className="flex items-start gap-4">
    <div className="relative group">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-lg cursor-pointer overflow-hidden border-4 border-white dark:border-gray-800 relative group transition-all"
      >
        {isPhotoLoading ? (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : null}

        {profileImage ? (
          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <Camera className="w-10 h-10 text-gray-400" />
        )}
      </div>

      <button 
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-all transform hover:scale-110"
      >
        <Edit2 className="w-4 h-4 text-white" />
      </button>
    </div>
    
            <div className="flex-1 font-inter transition-all">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 italic uppercase tracking-tighter">
                {formData.restaurantName}
              </h2>
              <p className="text-green-600 dark:text-green-400 font-bold uppercase text-sm tracking-wide">
                {formData.category}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">{formData.email}</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mt-1">
                {formData.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-transparent dark:border-gray-800 transition-all">
          <h3 className="text-xl font-bold text-green-700 dark:text-green-500 mb-6 font-inter italic uppercase tracking-tighter">
            Personal Information
          </h3>

          {/* Full Name */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block font-medium">
              Full Name
            </label>
            <div className="flex gap-2">
              {editingField === "fullName" ? (
                <>
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all font-inter"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave("fullName")}
                    className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-800 dark:text-gray-200 font-bold font-inter border border-transparent dark:border-gray-800">
                    {formData.fullName}
                  </div>
                  <button
                    onClick={() => handleEdit("fullName", formData.fullName)}
                    className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-800 transition-all font-bold uppercase text-xs tracking-widest italic"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block font-medium">
              Email Address
            </label>
            <div className="flex gap-2">
              {editingField === "email" ? (
                <>
                  <input
                    type="email"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all font-inter"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave("email")}
                    className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-800 dark:text-gray-200 font-bold font-inter border border-transparent dark:border-gray-800">
                    {formData.email}
                  </div>
                  <button
                    onClick={() => handleEdit("email", formData.email)}
                    className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-800 transition-all font-bold uppercase text-xs tracking-widest italic"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block font-medium">
              Phone Number
            </label>
            <div className="flex gap-2">
              {editingField === "phone" ? (
                <>
                  <input
                    type="tel"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all font-inter"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave("phone")}
                    className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-800 dark:text-gray-200 font-bold font-inter border border-transparent dark:border-gray-800">
                    {formData.phone}
                  </div>
                  <button
                    onClick={() => handleEdit("phone", formData.phone)}
                    className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-800 transition-all font-bold uppercase text-xs tracking-widest italic"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-transparent dark:border-gray-800 transition-all">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 font-inter italic uppercase tracking-tighter">Address</h3>

          {editingField === "address" ? (
            <div className="mb-4">
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all font-inter"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSave("address")}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleEdit("address", formData.address)}
              className="text-gray-700 dark:text-gray-300 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent dark:border-gray-800 transition-all font-inter font-medium"
            >
              {formData.address}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block font-medium uppercase tracking-widest">Zip</label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) =>
                  setFormData({ ...formData, zip: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none transition-all font-inter font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block font-medium uppercase tracking-widest">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none transition-all font-inter font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block font-medium uppercase tracking-widest">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none transition-all font-inter font-bold"
              />
            </div>
          </div>
        </div>

        {/* Delivery Range */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-transparent dark:border-gray-800 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-inter italic uppercase tracking-tighter">
                Delivery Range
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{formData.deliveryRange}</p>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="relative rounded-xl overflow-hidden shadow-md h-64 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 border dark:border-gray-800">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126182.48419177555!2d7.314454!3d9.073676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0a5e32c9a903%3A0x9c9b57a5e7c0f5d6!2sAbuja%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1234567890"
            />
            {/* Map Overlay Marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
              <div className="w-12 h-12 bg-green-600 rounded-full shadow-lg flex items-center justify-center animate-bounce">
                <MapPin className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveChanges}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700..."
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileSetting;
