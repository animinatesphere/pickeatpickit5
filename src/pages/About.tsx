import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Eye, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo SVG 1.png";

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <button 
          onClick={() => navigate("/")} 
          className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-green-500 transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Base
        </button>

        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <img src={logo} alt="PickEAT" className="w-20 h-20 mx-auto mb-8 grayscale opacity-50" />
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">
              About <span className="text-green-500">PickEAT</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              We're not just a delivery service. We're the infrastructure powering the future of urban commerce.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { title: "Our Mission", icon: Target, desc: "To democratize high-speed logistics for every vendor and customer." },
              { title: "Our Vision", icon: Eye, desc: "A world where distance is no longer a barrier to instant gratification." },
              { title: "Our Community", icon: Users, desc: "Building a fair and thriving ecosystem for riders, vendors, and foodies." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl"
              >
                <item.icon className="w-8 h-8 text-green-500 mb-6" />
                <h3 className="text-xl font-bold uppercase mb-4">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="prose prose-invert max-w-none space-y-8 text-gray-400 font-medium"
          >
            <p>
              Founded in 2026, PickEAT PickIT emerged from a simple realization: the pulse of the city was held back by outdated logistics. We set out to build a system that moves as fast as your cravings. 
            </p>
            <p>
              By combining cutting-edge AI routing with a dedicated fleet of professional riders, we've created a network that delivers accuracy, security, and lightning speed. Whether you're a local vendor looking to scale or a customer wanting the best the city has to offer, we are your partner in motion.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
