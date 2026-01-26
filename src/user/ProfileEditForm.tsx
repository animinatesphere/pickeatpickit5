import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Check, Navigation } from "lucide-react";
import { Navbar } from "../component/Navbar";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  city: string;
  state: string;
}

interface EditState {
  fullName: boolean;
  email: boolean;
  phone: boolean;
}

interface ToastMessage {
  message: string;
  type: "success" | "error";
}

const ProfileEditForm: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    zip: "",
    city: "",
    state: "",
  });

  const [editMode, setEditMode] = useState<EditState>({
    fullName: false,
    email: false,
    phone: false,
  });

  const [tempValues, setTempValues] = useState<PersonalInfo>(personalInfo);
  const [serviceOption, setServiceOption] = useState<string>("direct");
  const [riderInstructions, setRiderInstructions] = useState<string>("");

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await authService.getCurrentUserProfile();
        if (profile) {
          const fullName = `${profile.firstname || ""} ${
            profile.lastname || ""
          }`.trim();
          const userInfo: PersonalInfo = {
            fullName: fullName,
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            zip: profile.zip || "",
            city: profile.city || "",
            state: profile.state || "",
          };
          setPersonalInfo(userInfo);
          setTempValues(userInfo);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setToastMessage({
          message: "Failed to load profile",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapRef.current.hasChildNodes()) {
      const iframe = document.createElement("iframe");
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.style.border = "0";
      iframe.style.borderRadius = "12px";
      iframe.loading = "lazy";
      iframe.src =
        "https://www.openstreetmap.org/export/embed.html?bbox=7.2461%2C8.9806%2C7.2861%2C9.0206&layer=mapnik&marker=9.0006,7.2661";
      mapRef.current.appendChild(iframe);
    }
  }, []);

  const handleEdit = (field: keyof EditState) => {
    setEditMode({ ...editMode, [field]: true });
    setTempValues(personalInfo);
  };

  const handleUpdate = async (field: keyof EditState) => {
    try {
      setSaving(true);
      const [firstName, lastName] = tempValues.fullName.split(" ");

      // Prepare update data based on field being edited
      let updateData: Record<string, string> = {};

      if (field === "fullName") {
        updateData = {
          firstname: firstName || "",
          lastname: lastName || "",
        };
      } else if (field === "email") {
        updateData = { email: tempValues.email };
      } else if (field === "phone") {
        updateData = { phone: tempValues.phone };
      }

      // Call update service
      await authService.updateCurrentUserProfile(updateData);

      setPersonalInfo(tempValues);
      setEditMode({ ...editMode, [field]: false });
      setToastMessage({
        message: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Update failed:", error);
      setToastMessage({
        message: "Failed to update profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    setTempValues({ ...tempValues, [field]: value });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
      {/* Status Bar */}
      <Navbar />
      {/* Show Toast if there's a message */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 animate-fade-in ${
            toastMessage.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <span>⚠️</span>
            )}
            <p>{toastMessage.message}</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 shadow-sm">
        <button
          onClick={handleBackClick}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content */}
          <div className="px-6 py-6 max-w-4xl mx-auto pb-20">
            {/* Personal Information Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-green-400 rounded-full"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  Personal information
                </h2>
              </div>

              {/* Full Name */}
              <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Full Name
                  </label>
                  {!editMode.fullName ? (
                    <button
                      onClick={() => handleEdit("fullName")}
                      className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-md shadow-green-600/30 hover:shadow-lg hover:shadow-green-600/40 active:scale-95"
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdate("fullName")}
                      disabled={saving}
                      className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-md shadow-green-600/30 hover:shadow-lg hover:shadow-green-600/40 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      {saving ? "Saving..." : "Update"}
                    </button>
                  )}
                </div>
                {editMode.fullName ? (
                  <input
                    type="text"
                    value={tempValues.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className="w-full text-base font-semibold text-gray-900 border-b-2 border-green-500 focus:outline-none pb-2 bg-transparent"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-900">
                    {personalInfo.fullName}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  {!editMode.email ? (
                    <button
                      onClick={() => handleEdit("email")}
                      className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-md shadow-green-600/30 hover:shadow-lg hover:shadow-green-600/40 active:scale-95"
                    >
                      Update
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdate("email")}
                      className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-md shadow-green-600/30 hover:shadow-lg hover:shadow-green-600/40 active:scale-95 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Update
                    </button>
                  )}
                </div>
                {editMode.email ? (
                  <input
                    type="email"
                    value={tempValues.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full text-base font-semibold text-gray-900 border-b-2 border-green-500 focus:outline-none pb-2 bg-transparent"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-900">
                    {personalInfo.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </label>
                  {!editMode.phone ? (
                    <button
                      onClick={() => handleEdit("phone")}
                      className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-md shadow-green-600/30 hover:shadow-lg hover:shadow-green-600/40 active:scale-95"
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdate("phone")}
                      className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-md shadow-green-600/30 hover:shadow-lg hover:shadow-green-600/40 active:scale-95 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Update
                    </button>
                  )}
                </div>
                {editMode.phone ? (
                  <input
                    type="tel"
                    value={tempValues.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full text-base font-semibold text-gray-900 border-b-2 border-green-500 focus:outline-none pb-2 bg-transparent"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-900">
                    {personalInfo.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-gradient-to-r from-green-600 to-green-400 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-900">Address</h3>
              </div>
              <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300">
                <input
                  type="text"
                  value={personalInfo.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full text-base font-semibold text-gray-700 border-b-2 border-gray-200 focus:border-green-500 focus:outline-none pb-3 transition-all bg-transparent"
                  placeholder="Enter address"
                />
              </div>

              {/* Zip, City, State */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300">
                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">
                    Zip
                  </label>
                  <input
                    type="text"
                    value={personalInfo.zip}
                    onChange={(e) => handleChange("zip", e.target.value)}
                    className="w-full text-base font-semibold text-gray-700 border-b-2 border-gray-200 focus:border-green-500 focus:outline-none pb-2 transition-all bg-transparent"
                  />
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300">
                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">
                    City
                  </label>
                  <input
                    type="text"
                    value={personalInfo.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full text-base font-semibold text-gray-700 border-b-2 border-gray-200 focus:border-green-500 focus:outline-none pb-2 transition-all bg-transparent"
                  />
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300">
                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">
                    State
                  </label>
                  <input
                    type="text"
                    value={personalInfo.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full text-base font-semibold text-gray-700 border-b-2 border-gray-200 focus:border-green-500 focus:outline-none pb-2 transition-all bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Location Display */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/30 flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">
                    Villa Nova Estate Apu Gudu District Garki Abuja
                  </h4>
                  <p className="text-sm text-gray-600">
                    Apt/House · Block A Second Floor Room 302
                  </p>
                </div>
              </div>

              {/* Real Map */}
              <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100">
                <div ref={mapRef} className="w-full h-full"></div>
                <button className="absolute top-4 right-4 bg-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 border border-gray-200">
                  <Navigation className="w-5 h-5 text-green-600" />
                </button>
              </div>
            </div>

            {/* Service Options */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Service Options
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border-2 border-green-600 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="service"
                    value="direct"
                    checked={serviceOption === "direct"}
                    onChange={(e) => setServiceOption(e.target.value)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-base font-medium text-gray-900">
                    Hand it to me Directly
                  </span>
                </label>

                <label className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="service"
                    value="available"
                    checked={serviceOption === "available"}
                    onChange={(e) => setServiceOption(e.target.value)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-base font-medium text-gray-900">
                    Hand to me or who's available
                  </span>
                </label>

                <label className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="service"
                    value="door"
                    checked={serviceOption === "door"}
                    onChange={(e) => setServiceOption(e.target.value)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-base font-medium text-gray-900">
                    Leave it at my door
                  </span>
                </label>
              </div>
            </div>

            {/* Instruction for Rider */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Instruction for Rider
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                e.g enter the main street, its 1st door on the right
              </p>

              <textarea
                value={riderInstructions}
                onChange={(e) => setRiderInstructions(e.target.value)}
                placeholder="Enter instructions for the rider..."
                className="w-full h-32 p-4 bg-white rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none resize-none text-base text-gray-900 placeholder-gray-400 shadow-sm transition-colors"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileEditForm;
