import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Check, Navigation, Edit3, Save, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await authService.getCurrentUserProfile();
        if (profile) {
          const fullName = `${profile.firstname || ""} ${profile.lastname || ""}`.trim();
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
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (mapRef.current && !mapRef.current.hasChildNodes()) {
      const iframe = document.createElement("iframe");
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.style.border = "0";
      iframe.style.borderRadius = "2rem";
      iframe.loading = "lazy";
      iframe.src = "https://www.openstreetmap.org/export/embed.html?bbox=7.2461%2C8.9806%2C7.2861%2C9.0206&layer=mapnik&marker=9.0006,7.2661";
      mapRef.current.appendChild(iframe);
    }
  }, [loading]);

  const handleUpdate = async (field: keyof EditState) => {
    try {
      setSaving(true);
      const [firstName, lastName] = tempValues.fullName.split(" ");
      let updateData: Record<string, string> = {};

      if (field === "fullName") {
        updateData = { firstname: firstName || "", lastname: lastName || "" };
      } else if (field === "email") {
        updateData = { email: tempValues.email };
      } else if (field === "phone") {
        updateData = { phone: tempValues.phone };
      }

      await authService.updateCurrentUserProfile(updateData);
      setPersonalInfo(tempValues);
      setEditMode({ ...editMode, [field]: false });
      setToastMessage({ message: "Update Successful", type: "success" });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      setToastMessage({ message: "Update Failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 font-inter pb-20">
      <Navbar />
      
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-10 left-1/2 -translate-x-1/2 px-10 py-5 rounded-3xl shadow-3xl text-white z-[100] font-black italic uppercase tracking-tighter flex items-center gap-4 ${
              toastMessage.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toastMessage.type === "success" ? <Check className="w-6 h-6" /> : "⚠️"}
            {toastMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky top-[80px] z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:scale-105 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">Edit Profile</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              {[1, 2, 3].map(i => <div key={i} className="h-32 w-full bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] animate-pulse" />)}
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-12">
              
              {/* Profile Overview Section */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-3 h-8 bg-green-500 rounded-full" />
                   <h2 className="text-3xl font-black italic tracking-tighter uppercase">Identity</h2>
                </div>

                <div className="space-y-6">
                  {[
                    { key: 'fullName', label: 'Full Name', value: personalInfo.fullName, temp: tempValues.fullName, type: 'text' },
                    { key: 'email', label: 'Email Control', value: personalInfo.email, temp: tempValues.email, type: 'email' },
                    { key: 'phone', label: 'Phone Access', value: personalInfo.phone, temp: tempValues.phone, type: 'tel' },
                  ].map((field) => (
                    <motion.div key={field.key} variants={itemVariants} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-50 dark:border-gray-800 shadow-xl relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-4">
                        <label className="text-[10px] font-black uppercase italic tracking-widest text-gray-400">{field.label}</label>
                        {!editMode[field.key as keyof EditState] ? (
                          <button onClick={() => setEditMode({...editMode, [field.key]: true})} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleUpdate(field.key as keyof EditState)} disabled={saving} className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg active:scale-95">
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving' : 'Save'}
                          </button>
                        )}
                      </div>
                      
                      {editMode[field.key as keyof EditState] ? (
                        <input
                          type={field.type}
                          value={field.temp}
                          onChange={(e) => setTempValues({ ...tempValues, [field.key]: e.target.value })}
                          className="w-full text-2xl font-black italic tracking-tighter uppercase bg-transparent text-green-600 outline-none border-b-4 border-green-600/20 focus:border-green-600 transition-all"
                          autoFocus
                        />
                      ) : (
                        <p className="text-2xl font-black italic tracking-tighter uppercase text-gray-800 dark:text-gray-100 leading-tight">
                          {field.value}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Geographic Section */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-3 h-8 bg-orange-500 rounded-full" />
                   <h2 className="text-3xl font-black italic tracking-tighter uppercase">Geography</h2>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-50 dark:border-gray-800 shadow-2xl space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase italic tracking-widest text-gray-400">Tactical Address</label>
                    <input
                      type="text"
                      value={tempValues.address}
                      onChange={(e) => setTempValues({...tempValues, address: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[1.5rem] font-bold italic text-lg outline-none border-2 border-transparent focus:border-green-600 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {['city', 'state', 'zip'].map((cityField) => (
                      <div key={cityField} className="space-y-2">
                        <label className="text-[10px] font-black uppercase italic tracking-widest text-gray-400">{cityField}</label>
                        <input
                          type="text"
                          value={tempValues[cityField as keyof PersonalInfo]}
                          onChange={(e) => setTempValues({...tempValues, [cityField]: e.target.value})}
                          className="w-full bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[1.5rem] font-bold italic outline-none border-2 border-transparent focus:border-green-600 transition-all"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="relative h-72 rounded-[2.5rem] overflow-hidden border-4 border-gray-50 dark:border-gray-800 shadow-inner group">
                    <div ref={mapRef} className="w-full h-full" />
                    <button className="absolute top-6 right-6 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 active:scale-95 transition-all text-green-600">
                      <Compass className="w-6 h-6 animate-pulse" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Operational Section */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-3 h-8 bg-blue-500 rounded-full" />
                   <h2 className="text-3xl font-black italic tracking-tighter uppercase">Operations</h2>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    { id: 'direct', label: 'Hand it to me Directly' },
                    { id: 'available', label: 'Hand to who is available' },
                    { id: 'door', label: 'Tactical drop at my door' }
                  ].map((opt) => (
                    <div 
                      key={opt.id}
                      onClick={() => setServiceOption(opt.id)}
                      className={`p-6 rounded-[1.5rem] border-4 cursor-pointer transition-all flex items-center justify-between ${
                        serviceOption === opt.id 
                          ? 'border-green-600 bg-green-500/5' 
                          : 'border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900/40'
                      }`}
                    >
                      <span className={`font-black italic uppercase tracking-tighter text-lg ${serviceOption === opt.id ? 'text-green-600' : 'text-gray-400'}`}>
                        {opt.label}
                      </span>
                      {serviceOption === opt.id && <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={4} /></div>}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase italic tracking-widest text-gray-400">Directives for Operatives</label>
                  <textarea
                    value={riderInstructions}
                    onChange={(e) => setRiderInstructions(e.target.value)}
                    placeholder="Enter deployment notes..."
                    className="w-full h-40 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border-4 border-gray-50 dark:border-gray-800 outline-none focus:border-green-600 transition-all font-bold italic resize-none shadow-xl"
                  />
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileEditForm;
