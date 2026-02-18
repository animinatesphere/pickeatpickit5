
import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { User, Store, Bike, ChevronRight, Play, ArrowDown } from "lucide-react";
import logo from "../assets/Logo SVG 1.png";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Fixed transformations
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 1.1]);
  const bgTranslateY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);
  
  // Cinematic zoom/fade for logo group
  const logoScale = useTransform(smoothProgress, [0, 0.2], [1, 1.5]);
  const logoAlpha = useTransform(smoothProgress, [0, 0.15], [1, 0]);

  // Rider movement
  const riderX = useTransform(smoothProgress, [0.3, 0.7], ["-20%", "120%"]);
  const riderRotate = useTransform(smoothProgress, [0.3, 0.5, 0.7], [0, -5, 0]);

  const roles = [
    {
      label: "Customer",
      icon: User,
      desc: "Instant cravings, delivered fast.",
      path: "/user-home",
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Vendor",
      icon: Store,
      desc: "Grow your culinary empire.",
      path: "/vendor-login",
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "Rider",
      icon: Bike,
      desc: "Drive your destiny.",
      path: "/onboarding",
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <div ref={containerRef} className="relative bg-black text-white font-sans overflow-x-hidden min-h-screen">
      
      {/* CUSTOM SCROLL PROGRESS INDICATOR */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-green-500 origin-left z-[100] shadow-[0_0_20px_rgba(34,197,94,0.5)]"
        style={{ scaleX: smoothProgress }}
      />
      
      {/* SECTION 1: CINEMATIC HERO */}
      <section className="relative h-[100vh] z-10 w-full">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
        >
          <motion.div style={{ translateY: bgTranslateY }} className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black z-10" />
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop" 
              alt="Hero BG" 
              className="w-full h-full object-cover scale-110"
              loading="eager"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <motion.div 
            style={{ scale: logoScale, opacity: logoAlpha }}
            className="relative z-20 flex flex-col items-center text-center px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <img src={logo} alt="PickEAT" className="w-32 h-32 mb-8 drop-shadow-2xl mx-auto" />
              <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4 leading-none select-none">
                PickEAT <span className="text-green-500">PickIT</span>
              </h1>
              <p className="text-xl md:text-2xl font-light tracking-widest uppercase text-gray-400">
                The Future of Delivery. Redefined.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-xs tracking-widest uppercase opacity-50">Scroll to Explore</span>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <ArrowDown className="w-5 h-5 text-green-500" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2: RIDER ANIMATION SECTION (REDESIGNED) */}
      <section className="relative h-screen flex items-center overflow-hidden bg-zinc-950 text-white">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-12 relative z-10">
          <div className="max-w-xl">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="inline-block px-4 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-sm font-bold uppercase tracking-widest mb-6"
             >
                Precision Logistics
             </motion.div>
             
             <h2 className="text-6xl md:text-8xl font-black uppercase italic leading-[0.9] mb-8 tracking-tighter">
                {"LIGHTNING".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, rotateY: 90, x: -20 }}
                    whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
                <br />
                <span className="text-green-500">SPEED</span>
             </h2>

             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="text-lg text-gray-400 mb-10 leading-relaxed font-medium max-w-md"
             >
                We're redefining the urban pulse. Experience delivery that doesn't just move fast—it moves ahead of time.
             </motion.p>
             
             <div className="grid grid-cols-2 gap-8 mb-12">
                {[
                  { label: "Delivery Time", value: "15min" },
                  { label: "Active Riders", value: "2.4k+" }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (i * 0.1) }}
                  >
                    <div className="text-3xl font-black text-white italic">{stat.value}</div>
                    <div className="text-xs uppercase tracking-widest text-green-500 font-bold">{stat.label}</div>
                  </motion.div>
                ))}
             </div>

             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="group flex items-center gap-4 bg-white text-black px-8 py-5 rounded-full font-bold uppercase transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-green-500/20"
             >
                Launch Tracker
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12">
                   <Play className="w-4 h-4 fill-white text-white" />
                </div>
             </motion.button>
          </div>
        </div>

        <motion.div style={{ x: riderX, rotate: riderRotate }} className="absolute bottom-20 z-0 h-96 w-auto">
           <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 blur-[120px] rounded-full scale-150 animate-pulse" />
              <img 
                src="https://images.unsplash.com/photo-1630533663703-2f5981838e60?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWxlY3RyaWMlMjBkZWxpdmVyeSUyMGJpa2UlMjBpc29sYXRlfGVufDB8fDB8fHww" 
                alt="Rider" 
                className="h-[500px] w-auto object-contain drop-shadow-[0_20px_50px_rgba(34,197,94,0.4)]"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
           </div>
        </motion.div>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </section>

      {/* SECTION 2.5: INFRASTRUCTURE GRID (NEW CONTENT) */}
      <section className="relative py-32 bg-black overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
             <div className="max-w-2xl">
                <h3 className="text-4xl md:text-6xl font-black uppercase italic mb-6">World Class <br /><span className="text-green-500">Infrastructure</span></h3>
                <p className="text-gray-500 font-medium">Powering the future of urban commerce with proprietary AI and high-speed logistics networks.</p>
             </div>
             <div className="text-right hidden md:block">
                <div className="text-6xl font-black text-white/5 uppercase italic">Engineered</div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { title: "Smart Routing", icon: Play, desc: "AI-driven paths for sub-15min delivery." },
               { title: "Vault Security", icon: Store, desc: "Bank-grade encryption for every transaction." },
               { title: "Peak Scalability", icon: User, desc: "Handling millions of orders with zero lag." },
               { title: "Fleet Sync", icon: Bike, desc: "Real-time coordination of 10k+ active riders." }
             ].map((feat, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 viewport={{ once: true }}
                 className="group p-8 bg-zinc-900/50 border border-white/5 rounded-3xl hover:border-green-500/30 transition-all duration-500"
               >
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 group-hover:text-green-500 transition-colors">
                     <feat.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold uppercase mb-2">{feat.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">{feat.desc}</p>
               </motion.div>
             ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 blur-[120px] rounded-full" />
      </section>

      {/* SECTION 3: ROLE SELECTION */}
      <section className="relative min-h-screen py-32 bg-zinc-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic mb-4">Choose Your Path</h2>
            <div className="h-1 w-24 bg-green-500 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, idx) => (
              <motion.div
                key={role.label}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
                onClick={() => navigate(role.path)}
                className="group relative h-[500px] cursor-pointer"
              >
                <div className="absolute inset-0 rounded-3xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                   <img 
                    src={`https://images.unsplash.com/photo-${idx === 0 ? '1540189549336-e6e99c3679fe' : idx === 1 ? '1552566626-52f8b828add9' : '1554672408-730436b60dde'}?w=800&q=80&auto=format&fit=crop`} 
                    alt={role.label}
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                    loading="lazy"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                   />
                   <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-colors duration-500" />
                </div>

                <div className="absolute bottom-8 left-8 right-8 p-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl group-hover:bg-green-500/20 group-hover:border-green-500/50 transition-all duration-500 transform group-hover:-translate-y-4">
                  <div className={`w-14 h-14 rounded-xl mb-6 bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                     <role.icon className="w-8 h-8 text-white" />
                  </div>
                  <Link to={role.path}>
                  <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tight">{role.label}</h3>
                  </Link>
                  <p className="text-gray-300 font-medium mb-6">{role.desc}</p>
                  <div className="flex items-center gap-2 text-green-400 font-bold uppercase tracking-widest text-sm group-hover:text-white transition-colors">
                    Explore <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
                <div className="absolute top-8 right-8 text-8xl font-black text-white opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
                  0{idx + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-black border-t border-zinc-900 pt-24 pb-12 overflow-hidden">
        <div className="container mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
              <div className="col-span-1 lg:col-span-2">
                 <img src={logo} alt="Logo" className="w-16 h-16 mb-8 grayscale opacity-50" />
                 <h2 className="text-4xl md:text-6xl font-black uppercase italic mb-8">Ready to <span className="text-green-500">PickIT?</span></h2>
              </div>
              <div className="space-y-4">
                 <h4 className="text-sm font-bold uppercase tracking-tighter text-green-500">Company</h4>
                 <ul className="space-y-2 text-gray-400 font-medium font-inter">
                    <li className="hover:text-white transition-colors">
                       <Link to="/about">About Us</Link>
                    </li>
                    <li className="hover:text-white transition-colors">
                       <Link to="/careers">Careers</Link>
                    </li>
                 </ul>
              </div>
              <div className="space-y-4">
                 <h4 className="text-sm font-bold uppercase tracking-tighter text-green-500">Legal</h4>
                 <ul className="space-y-2 text-gray-400 font-medium font-inter">
                    <li className="hover:text-white transition-colors">
                       <Link to="/privacy">Privacy Policy</Link>
                    </li>
                    <li className="hover:text-white transition-colors">
                       <Link to="/terms">Terms</Link>
                    </li>
                 </ul>
              </div>
           </div>
           
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-zinc-900">
              <p className="text-gray-500 text-sm font-medium font-inter">© 2026 PickEAT PickIT. All rights reserved.</p>
              <div className="flex gap-6 uppercase text-xs font-black tracking-widest opacity-30">
                 <span className="hover:opacity-100 cursor-pointer transition-opacity">Twitter</span>
                 <span className="hover:opacity-100 cursor-pointer transition-opacity">Instagram</span>
              </div>
           </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-500/10 blur-[150px] rounded-full pointer-events-none" />
      </footer>
    </div>
  );
};

export default LandingPage;
