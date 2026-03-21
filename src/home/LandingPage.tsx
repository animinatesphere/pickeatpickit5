import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Store, Bike, ArrowRight, ChevronDown } from "lucide-react";
import logo from "../assets/Logo SVG 1.png";

// ── Fonts injected globally ───────────────────────────────────────────────────
const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; }
  .font-display { font-family: 'Syne', sans-serif; }
  .no-scroll { overflow: hidden; }
`;

// ── Data ──────────────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "customer",
    label: "Customer",
    tagline: "Order anything, anywhere.",
    icon: User,
    path: "/user-home",
    bg: "bg-[#E8F5E0]",
    accent: "#2D6A2D",
    img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "vendor",
    label: "Vendor",
    tagline: "Reach thousands of hungry customers.",
    icon: Store,
    path: "/vendor-login",
    bg: "bg-[#FFF5E0]",
    accent: "#7A4800",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "rider",
    label: "Rider",
    tagline: "Earn on your schedule.",
    icon: Bike,
    path: "/onboarding",
    bg: "bg-[#E0F0FF]",
    accent: "#0A3D8F",
    img: "https://images.unsplash.com/photo-1614518921492-be70c6e9b843?w=800&q=80&auto=format&fit=crop",
  },
];

const STATS = [
  { value: "40K+", label: "Daily Orders" },
  { value: "2.4K", label: "Riders" },
  { value: "800+", label: "Restaurants" },
  { value: "15min", label: "Avg Delivery" },
];

const FEATURES = [
  {
    num: "01",
    title: "Real-time tracking",
    body: "Watch your order move from kitchen to doorstep on a live map.",
  },
  {
    num: "02",
    title: "Instant Payouts",
    body: "Vendors and riders get paid same day, every day.",
  },
  {
    num: "03",
    title: "Smart routing",
    body: "AI assigns the nearest available rider within seconds.",
  },
  {
    num: "04",
    title: "Built for Nigeria",
    body: "Local payment methods, local languages, local flavours.",
  },
];

// ── Marquee strip ─────────────────────────────────────────────────────────────
const MarqueeStrip: React.FC = () => {
  const items = [
    "Fast Delivery",
    "Fresh Food",
    "Happy Riders",
    "Growing Vendors",
    "Zero Hassle",
  ];
  return (
    <div className="overflow-hidden border-y border-[#1A1A1A] py-4 bg-[#0D0D0D]">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-16 whitespace-nowrap"
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="font-display text-base font-700 uppercase tracking-widest text-[#2ECC71] flex items-center gap-6"
          >
            {item} <span className="text-white/20">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// ── Counter animation ─────────────────────────────────────────────────────────
const Counter: React.FC<{ value: string }> = ({ value }) => {
  const [display, setDisplay] = useState("0");
  const numericPart = parseFloat(value.replace(/[^0-9.]/g, ""));
  const suffix = value.replace(/[0-9.]/g, "");

  useEffect(() => {
    let start = 0;
    const end = numericPart;
    const duration = 1800;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplay(value);
        clearInterval(timer);
      } else setDisplay(`${Math.floor(start)}${suffix}`);
    }, 16);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span>{display}</span>;
};

// ── Main ──────────────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeRole, setActiveRole] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);

  // Auto-cycle roles
  useEffect(() => {
    const t = setInterval(
      () => setActiveRole((p) => (p + 1) % ROLES.length),
      3500,
    );
    return () => clearInterval(t);
  }, []);

  // Stats intersection observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const current = ROLES[activeRole];

  return (
    <>
      <style>{FONT_STYLE}</style>

      <div className="bg-[#0A0A0A] text-white overflow-x-hidden">
        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 flex items-center justify-between backdrop-blur-md bg-black/40 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-9 h-9" />
            <span className="font-display font-800 text-lg tracking-tight">
              PickEAT
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50 font-medium">
            {["Features", "How it works", "For Vendors", "Careers"].map((l) => (
              <span
                key={l}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {l}
              </span>
            ))}
          </div>
          <button
            onClick={() => navigate("/user-home")}
            className="bg-[#2ECC71] text-black font-display font-800 text-sm px-5 py-2.5 rounded-full hover:bg-[#27AE60] transition-colors"
          >
            Order now
          </button>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-end pb-24 pt-32 overflow-hidden"
        >
          {/* Background image parallax */}
          <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={current.id}
                src={current.img}
                alt={current.label}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.35, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-transparent" />
          </motion.div>

          <motion.div
            style={{ y: heroTextY, opacity: heroOpacity }}
            className="relative z-10 w-full px-6 md:px-16 max-w-7xl mx-auto"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
              <span className="text-[#2ECC71] font-display text-xs font-700 uppercase tracking-[0.3em]">
                Nigeria's Premier Food Platform
              </span>
            </motion.div>

            {/* Main headline */}
            <div className="overflow-hidden mb-4">
              <motion.h1
                initial={{ y: 120 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-display font-800 text-[clamp(3.5rem,10vw,9rem)] leading-[0.88] tracking-[-0.03em] uppercase"
              >
                Eat Well.
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-10">
              <motion.h1
                initial={{ y: 120 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="font-display font-800 text-[clamp(3.5rem,10vw,9rem)] leading-[0.88] tracking-[-0.03em] uppercase text-[#2ECC71]"
              >
                Deliver Fast.
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <p className="text-white/50 text-lg font-300 max-w-md leading-relaxed">
                Food from your favourite restaurants, delivered in under 15
                minutes. Join 40,000+ happy customers.
              </p>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => navigate("/user-home")}
                  className="group flex items-center gap-2 bg-[#2ECC71] text-black font-display font-800 uppercase tracking-wider text-sm px-7 py-4 rounded-full hover:gap-4 transition-all"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/vendor-login")}
                  className="flex items-center gap-2 border border-white/20 text-white/70 font-display font-700 uppercase tracking-wider text-sm px-7 py-4 rounded-full hover:border-white/50 hover:text-white transition-all"
                >
                  List your restaurant
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-2 opacity-40"
          >
            <span className="text-[10px] font-display uppercase tracking-widest rotate-90 mb-4">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── MARQUEE ─────────────────────────────────────────────────────── */}
        <MarqueeStrip />

        {/* ── STATS ───────────────────────────────────────────────────────── */}
        <section
          ref={statsRef}
          className="px-6 md:px-16 py-24 max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="border-l border-white/10 pl-6"
              >
                <div className="font-display font-800 text-4xl md:text-5xl text-[#2ECC71] mb-1">
                  {statsVisible ? <Counter value={s.value} /> : "0"}
                </div>
                <div className="text-white/40 text-sm font-medium uppercase tracking-widest">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── ROLE SELECTOR ───────────────────────────────────────────────── */}
        <section className="px-6 md:px-16 py-24 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="text-[#2ECC71] font-display text-xs uppercase tracking-[0.3em] mb-3">
                Who are you?
              </p>
              <h2 className="font-display font-800 text-5xl md:text-7xl uppercase tracking-tight leading-none">
                Choose
                <br />
                Your Role
              </h2>
            </div>
            <p className="text-white/40 max-w-xs leading-relaxed font-300">
              PickEAT PickIT serves customers, empowers vendors, and enables
              riders to earn more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLES.map((role, i) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                onClick={() => navigate(role.path)}
                className="group relative rounded-3xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-500"
                style={{ minHeight: 420 }}
              >
                {/* Image */}
                <img
                  src={role.img}
                  alt={role.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Number */}
                <div className="absolute top-6 right-6 font-display font-800 text-6xl text-white/5 group-hover:text-white/10 transition-colors">
                  0{i + 1}
                </div>

                {/* Content */}
                <div
                  className="relative z-10 flex flex-col h-full p-8 justify-end"
                  style={{ minHeight: 420 }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: role.accent + "33",
                      border: `1px solid ${role.accent}55`,
                    }}
                  >
                    <role.icon
                      className="w-6 h-6"
                      style={{
                        color:
                          role.accent === "#2D6A2D"
                            ? "#2ECC71"
                            : role.accent === "#0A3D8F"
                              ? "#60A5FA"
                              : "#FBBF24",
                      }}
                    />
                  </div>
                  <h3 className="font-display font-800 text-3xl uppercase tracking-tight mb-2">
                    {role.label}
                  </h3>
                  <p className="text-white/50 text-sm font-300 mb-6 leading-relaxed">
                    {role.tagline}
                  </p>
                  <div className="flex items-center gap-2 font-display font-700 text-sm uppercase tracking-widest text-[#2ECC71] group-hover:gap-4 transition-all">
                    Enter <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────────────── */}
        <section className="px-6 md:px-16 py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-16">
              {/* Sticky left */}
              <div className="md:w-2/5">
                <div className="md:sticky md:top-32">
                  <p className="text-[#2ECC71] font-display text-xs uppercase tracking-[0.3em] mb-4">
                    Why PickEAT?
                  </p>
                  <h2 className="font-display font-800 text-5xl md:text-6xl uppercase leading-tight tracking-tight mb-6">
                    Built
                    <br />
                    different.
                  </h2>
                  <p className="text-white/40 leading-relaxed font-300 mb-10">
                    We didn't just build another food app. We engineered a
                    logistics platform that thinks as fast as hunger strikes.
                  </p>
                  <button
                    onClick={() => navigate("/user-home")}
                    className="group inline-flex items-center gap-3 bg-white text-black font-display font-800 text-sm uppercase tracking-wider px-7 py-4 rounded-full hover:bg-[#2ECC71] transition-colors"
                  >
                    Start ordering{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right: feature list */}
              <div className="md:w-3/5 space-y-0">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={f.num}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="group flex items-start gap-8 py-10 border-b border-white/5 hover:border-white/20 transition-colors cursor-default"
                  >
                    <span className="font-display font-800 text-xs text-[#2ECC71]/40 group-hover:text-[#2ECC71] transition-colors mt-1 w-6 flex-shrink-0">
                      {f.num}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-display font-800 text-xl uppercase tracking-tight">
                          {f.title}
                        </h4>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#2ECC71] group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-white/40 font-300 leading-relaxed text-sm">
                        {f.body}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── APP BANNER ──────────────────────────────────────────────────── */}
        <section className="px-6 md:px-16 py-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[2.5rem] overflow-hidden bg-[#111] border border-white/10 p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12"
            >
              {/* Grid texture */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#2ECC71]/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />

              <div className="relative z-10">
                <p className="text-[#2ECC71] font-display text-xs uppercase tracking-[0.3em] mb-4">
                  Ready to eat?
                </p>
                <h2 className="font-display font-800 text-5xl md:text-7xl uppercase tracking-tight leading-[0.9] mb-6">
                  Hungry?
                  <br />
                  <span className="text-[#2ECC71]">We got you.</span>
                </h2>
                <p className="text-white/40 max-w-sm font-300 leading-relaxed">
                  Join over 40,000 Nigerians who trust PickEAT for their daily
                  meals. Order now, eat fast.
                </p>
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                <button
                  onClick={() => navigate("/user-home")}
                  className="flex items-center gap-3 bg-[#2ECC71] text-black font-display font-800 uppercase tracking-wider px-8 py-5 rounded-2xl hover:bg-[#27AE60] transition-colors text-sm"
                >
                  <User className="w-5 h-5" /> Order as Customer
                </button>
                <button
                  onClick={() => navigate("/vendor-login")}
                  className="flex items-center gap-3 border border-white/20 text-white font-display font-700 uppercase tracking-wider px-8 py-5 rounded-2xl hover:border-white/50 transition-colors text-sm"
                >
                  <Store className="w-5 h-5" /> List Your Restaurant
                </button>
                <button
                  onClick={() => navigate("/onboarding")}
                  className="flex items-center gap-3 border border-white/20 text-white/60 font-display font-700 uppercase tracking-wider px-8 py-5 rounded-2xl hover:border-white/50 hover:text-white transition-colors text-sm"
                >
                  <Bike className="w-5 h-5" /> Become a Rider
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 px-6 md:px-16 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
              <div className="max-w-xs">
                <div className="flex items-center gap-3 mb-4">
                  <img src={logo} alt="Logo" className="w-9 h-9 opacity-70" />
                  <span className="font-display font-800 text-lg">
                    PickEAT PickIT
                  </span>
                </div>
                <p className="text-white/30 text-sm font-300 leading-relaxed">
                  Nigeria's fastest-growing food delivery and logistics
                  platform.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
                {[
                  {
                    heading: "Platform",
                    links: ["Customer App", "Vendor Portal", "Rider App"],
                  },
                  { heading: "Company", links: ["About", "Blog", "Careers"] },
                  { heading: "Legal", links: ["Privacy", "Terms", "Cookies"] },
                ].map((col) => (
                  <div key={col.heading}>
                    <p className="font-display font-700 text-[#2ECC71] uppercase tracking-widest text-xs mb-4">
                      {col.heading}
                    </p>
                    <ul className="space-y-2">
                      {col.links.map((l) => (
                        <li key={l}>
                          <span className="text-white/30 hover:text-white transition-colors cursor-pointer">
                            {l}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5">
              <p className="text-white/20 text-xs font-300">
                © 2026 PickEAT PickIT Ltd. All rights reserved.
              </p>
              <div className="flex gap-6 text-white/20 text-xs uppercase tracking-widest font-display font-700">
                <span className="hover:text-white transition-colors cursor-pointer">
                  Twitter
                </span>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Instagram
                </span>
                <span className="hover:text-white transition-colors cursor-pointer">
                  LinkedIn
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
