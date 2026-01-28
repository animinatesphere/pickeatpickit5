import React, { useState, useEffect } from "react";
import {  Smartphone, ShieldCheck } from "lucide-react";
import { Navbar } from "../../component/Navbar";
import { supabase } from "../../services/authService";

interface DeviceItem {
  id: string;
  device_name: string;
  last_active: string;
  is_active: boolean;
}

const Device: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [, setIsVisible] = useState(false);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("user_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("last_active", { ascending: false });

        if (!error && data) {
          setDevices(data);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    };

    fetchSessions();
  }, []);

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 5) return "NOW";
    return date.toLocaleString('en-US', { 
      weekday: 'short', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-green-600">Syncing Sessions...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <Navbar />
      {/* ... Header ... */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-green-800 mb-6">Devices & Sessions</h1>

        <div className="space-y-4">
          {devices.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            devices.map((device, ) => (
              <div
                key={device.id}
                className={`bg-white rounded-3xl p-6 shadow-md border-2 transition-all ${
                  device.is_active ? "border-green-200" : "border-gray-100"
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${
                    device.is_active ? "bg-green-600" : "bg-gray-400"
                  }`}>
                    <Smartphone size={32} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{device.device_name}</h3>
                    <p className="text-sm text-gray-500">
                      Last active: <span className="font-bold text-green-600">{formatLastSeen(device.last_active)}</span>
                    </p>
                  </div>

                  {device.is_active && (
                    <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-inner border-2 border-dashed">
              <ShieldCheck size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No session history found.</p>
            </div>
          )}
        </div>

        {/* Security Tip */}
        <div className="mt-10 bg-blue-600 text-white p-6 rounded-3xl shadow-xl flex gap-4 items-center">
            <ShieldCheck size={40} />
            <p className="text-sm">Don't recognize a device? Log out of all other sessions in your account settings immediately.</p>
        </div>
      </div>
    </div>
  );
};

export default Device;