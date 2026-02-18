import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, Zap, Globe, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Careers: React.FC = () => {
  const navigate = useNavigate();

  const jobs = [
    { title: "Fleet Lead", dept: "Logistics", location: "Lagos, NG" },
    { title: "Senior AI Engineer", dept: "Engineering", location: "Remote" },
    { title: "Growth Specialist", dept: "Marketing", location: "Lagos, NG" },
    { title: "Support Ninja", dept: "Customer Success", location: "Remote" }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        <button 
          onClick={() => navigate("/")} 
          className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Base
        </button>

        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">
              Join the <span className="text-blue-500">Fleet</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
              We're looking for visionaries, rebels, and builders to help us rewrite the rules of delivery.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {[
              { title: "High Velocity", icon: Zap, desc: "We move fast, iterate faster, and never settle for 'good enough'." },
              { title: "Global Impact", icon: Globe, desc: "Solve real-world problems that touch millions of lives every day." },
              { title: "Owner Mindset", icon: Heart, desc: "Every team member is an owner. Your voice counts, your impact is felt." },
              { title: "Elite Talent", icon: Briefcase, desc: "Work with the best in the industry in a culture of excellence." }
            ].map((benefit, i) => (
              <div key={i} className="p-8 bg-zinc-900/40 border border-white/5 rounded-3xl hover:border-blue-500/30 transition-colors">
                <benefit.icon className="w-6 h-6 text-blue-500 mb-6" />
                <h3 className="text-lg font-bold uppercase mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase italic mb-8">Open Roles</h2>
            {jobs.map((job, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-zinc-900/30 border border-white/5 rounded-2xl hover:bg-white/5 transition-all"
              >
                <div>
                  <h4 className="text-xl font-bold uppercase group-hover:text-blue-500 transition-colors">{job.title}</h4>
                  <p className="text-xs text-gray-500 font-black uppercase tracking-widest">{job.dept} • {job.location}</p>
                </div>
                <button className="mt-4 md:mt-0 px-6 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-blue-500 hover:text-white transition-all">
                  Apply Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
