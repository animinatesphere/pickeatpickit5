import React from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <div className="container mx-auto px-6 py-12 relative z-10">
        <button 
          onClick={() => navigate("/")} 
          className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-green-500 transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Base
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <h1 className="text-4xl font-black uppercase italic italic tracking-tighter">Privacy <span className="text-green-500">Policy</span></h1>
          </div>

          <p className="text-sm text-gray-500 font-bold uppercase mb-12 tracking-widest">Last Updated: February 2026</p>

          <div className="space-y-12 text-gray-400 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white uppercase mb-4">1. Data Collection</h2>
              <p>We collect information that you provide directly to us when you create an account, such as your name, email address, phone number, and location data to ensure accurate delivery services.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase mb-4">2. Real-Time Tracking</h2>
              <p>To power our logistics network, we process real-time geolocation data from riders and customers during active orders. This data is handled with bank-grade encryption and is only used for the duration of the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase mb-4">3. Security</h2>
              <p>We implement industry-standard security measures to protect your personal information. All payment processing is handled via secure, PCI-compliant third-party providers.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase mb-4">4. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal data at any time through your profile settings or by contacting our support team.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
