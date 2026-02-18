import React from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <div className="container mx-auto px-6 py-12 relative z-10">
        <button 
          onClick={() => navigate("/")} 
          className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Base
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Terms of <span className="text-gray-500">Service</span></h1>
          </div>

          <p className="text-sm text-gray-500 font-bold uppercase mb-12 tracking-widest">Effective Date: February 2026</p>

          <div className="space-y-12 text-gray-400 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white uppercase mb-4">1. Acceptance of Terms</h2>
              <p>By accessing or using the PickEAT PickIT platform, you agree to be bound by these terms. If you do not agree, you must cease use of our services immediately.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase mb-4">2. Service Usage</h2>
              <p>Users must be at least 18 years of age to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase mb-4">3. Delivery & Payments</h2>
              <p>Delivery times are estimates and may vary based on conditions. All payments made through the platform are final unless otherwise specified in our refund policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase mb-4">4. Prohibited Conduct</h2>
              <p>You agree not to misuse the platform, attempt to bypass our logistics security, or engage in any fraudulent activity that disrupts the network heartbeat.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
