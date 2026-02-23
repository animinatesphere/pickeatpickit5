import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bike, ShieldCheck, Zap, DollarSign, ArrowRight } from "lucide-react";

const OnboardingScreen: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black font-inter text-white">
      {/* Background Image with Cinematic Overlay */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1600&auto=format&fit=crop"
          alt="Rider"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Ambient Lights */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[150px] rounded-full" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl"
        >
          <div className="inline-block px-4 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            Elite Logistics Program
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black uppercase italic italic tracking-tighter leading-[0.9] mb-8">
            DRIVE YOUR <br />
            <span className="text-orange-500">DESTINY</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed mb-12">
            Join the ranks of the city's most efficient delivery fleet. Complete autonomy, real-time earnings, maximum power.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
               { icon: Zap, label: "Fast Routing" },
               { icon: DollarSign, label: "Instant Pays" },
               { icon: ShieldCheck, label: "Total Safety" },
               { icon: Bike, label: "Elite Tech" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex flex-col items-center gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5"
              >
                <feature.icon className="w-5 h-5 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{feature.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <Link to="/rider-registration">
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-md mx-auto bg-white text-black font-black uppercase italic tracking-widest py-6 rounded-2xl shadow-2xl flex items-center justify-center gap-3"
              >
                Register
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            
            <Link to="/rider-login">
              <button 
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors"
              >
                Already have an account? Login
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Cinematic Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
           <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
