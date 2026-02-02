import React, { useState } from "react";
import {
  Bell,
  Menu,
  ChevronRight,
  Clock,
  ArrowLeft,
  Plus,
  MoreVertical,
  Upload,
  X,
} from "lucide-react";

interface Game {
  id: number;
  kilometers: number;
  prize: number;
  date: string;
  time: string;
  progress: number;
}

interface Notification {
  id: number;
  title: string;
  content: string;
  visible: boolean;
}

interface Banner {
  id: number;
  title: string;
  heading: string;
  bodyText: string;
  buttonText: string;
  buttonUrl: string;
  status: "Active" | "Inactive";
  image?: string;
}

type Screen =
  | "home"
  | "game-history"
  | "notifications"
  | "banners"
  | "banner-form"
  | "preview";

const Content: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("home");
  // const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [notificationCount] = useState(3);

  const [formData, setFormData] = useState({
    kilometers: "",
    prize: "",
    startTime: "11:00am",
    endTime: "05:00pm",
    notificationDetails: "",
  });

  const [games] = useState<Game[]>([
    {
      id: 1,
      kilometers: 90,
      prize: 5000,
      date: "20/11/2024",
      time: "11:00am - 11:59pm",
      progress: 27,
    },
    {
      id: 2,
      kilometers: 75,
      prize: 4000,
      date: "19/11/2024",
      time: "10:00am - 10:59pm",
      progress: 45,
    },
    {
      id: 3,
      kilometers: 100,
      prize: 6000,
      date: "18/11/2024",
      time: "09:00am - 09:59pm",
      progress: 60,
    },
    {
      id: 4,
      kilometers: 85,
      prize: 4500,
      date: "17/11/2024",
      time: "11:00am - 11:59pm",
      progress: 35,
    },
    {
      id: 5,
      kilometers: 95,
      prize: 5500,
      date: "16/11/2024",
      time: "08:00am - 08:59pm",
      progress: 80,
    },
  ]);

  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Lorem ipsum dolor",
      content:
        "sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.",
      visible: true,
    },
    {
      id: 2,
      title: "Lorem ipsum dolor",
      content:
        "sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.",
      visible: false,
    },
  ]);

  const [banners, setBanners] = useState<Banner[]>([
    {
      id: 1,
      title: "Receive money, win up to 1k!",
      heading: "Win up to N1K bonus",
      bodyText: "Receive big payments, Spin...",
      buttonText: "Check it Out",
      buttonUrl: "https://www.google.com",
      status: "Active",
    },
    {
      id: 2,
      title: "Receive money, win up to 1k!",
      heading: "Win up to N1K bonus",
      bodyText: "Receive big payments, Spin...",
      buttonText: "Check it Out",
      buttonUrl: "https://www.google.com",
      status: "Inactive",
    },
  ]);

  const [bannerForm, setBannerForm] = useState<Banner>({
    id: 0,
    title: "",
    heading: "",
    bodyText: "",
    buttonText: "",
    buttonUrl: "",
    status: "Active",
    image: "",
  });

  const handleSaveBanner = () => {
    if (bannerForm.id === 0) {
      setBanners([...banners, { ...bannerForm, id: banners.length + 1 }]);
    } else {
      setBanners(banners.map((b) => (b.id === bannerForm.id ? bannerForm : b)));
    }
    setScreen("banners");
  };

  const renderHeader = () => (
    <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xl">
      <div className="flex items-center gap-3">
        {screen !== "home" && (
          <button
            onClick={() =>
              setScreen(
                screen === "banner-form" || screen === "preview"
                  ? "banners"
                  : "home"
              )
            }
            className="hover:bg-white/20 p-2 rounded-xl transition-all duration-200 active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        {screen === "home" && (
          <button className="hover:bg-white/20 p-2 rounded-xl transition-all duration-200 active:scale-95">
            <Menu size={24} />
          </button>
        )}
        <h1 className="text-lg font-bold font-inter italic tracking-tighter uppercase">
          {screen === "home" && "Content management"}
          {screen === "game-history" && "Content Management"}
          {screen === "notifications" && "Content Management"}
          {screen === "banners" && "Banner"}
          {screen === "banner-form" && "Banner Info"}
          {screen === "preview" && "Preview"}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {screen === "banners" && (
          <button
            onClick={() => {
              setBannerForm({
                id: 0,
                title: "",
                heading: "",
                bodyText: "",
                buttonText: "",
                buttonUrl: "",
                status: "Active",
                image: "",
              });
              setScreen("banner-form");
            }}
            className="hover:bg-white/20 p-2 rounded-xl transition-all duration-200 active:scale-95"
          >
            <Plus size={24} />
          </button>
        )}
        <button
          onClick={() => setScreen("notifications")}
          className="relative hover:bg-white/20 p-2 rounded-xl transition-all duration-200 active:scale-95"
        >
          <Bell size={24} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold animate-pulse border-2 border-green-600 dark:border-green-700">
              {notificationCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="p-4 space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 transform hover:scale-[1.01] transition-all duration-300 border border-transparent dark:border-gray-800">
        <h2 className="text-green-600 dark:text-green-400 font-black text-xl mb-6 font-inter italic tracking-tighter uppercase">
          Daily Rider Game Target
        </h2>
        <div className="space-y-5">
          <input
            type="text"
            placeholder="Enter Kilometers"
            value={formData.kilometers}
            onChange={(e) =>
              setFormData({ ...formData, kilometers: e.target.value })
            }
            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 dark:text-gray-100 font-inter"
          />
          <input
            type="text"
            placeholder="Enter prize"
            value={formData.prize}
            onChange={(e) =>
              setFormData({ ...formData, prize: e.target.value })
            }
            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 dark:text-gray-100 font-inter"
          />
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest italic mb-2 block ml-1">Start</label>
              <input
                type="text"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 dark:text-gray-100 font-inter"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest italic mb-2 block ml-1">End</label>
              <input
                type="text"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 dark:text-gray-100 font-inter"
              />
            </div>
          </div>
          <button className="w-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-4 px-6 rounded-2xl font-bold flex items-center justify-between hover:bg-green-100 dark:hover:bg-green-900/30 active:scale-[0.98] transition-all duration-300 uppercase italic tracking-widest text-xs border border-green-100 dark:border-green-800/50 shadow-sm">
            Save new target
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 transform hover:scale-[1.01] transition-all duration-300 border border-transparent dark:border-gray-800">
        <h3 className="text-green-600 dark:text-green-400 font-black text-xl mb-2 font-inter italic tracking-tighter uppercase whitespace-nowrap">New notification</h3>
        <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest italic mb-6">
          Kindly Provide details below
        </p>
        <textarea
          placeholder="Enter notification details..."
          value={formData.notificationDetails}
          onChange={(e) =>
            setFormData({ ...formData, notificationDetails: e.target.value })
          }
          className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 min-h-[140px] resize-none dark:text-gray-100 font-inter"
        />
        <button className="w-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-4 px-6 rounded-2xl font-bold flex items-center justify-between mt-6 hover:bg-green-100 dark:hover:bg-green-900/30 active:scale-[0.98] transition-all duration-300 uppercase italic tracking-widest text-xs border border-green-100 dark:border-green-800/50 shadow-sm">
          Push notification
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setScreen("game-history")}
          className="w-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-lg p-5 flex items-center justify-between border border-transparent dark:border-gray-800 hover:shadow-2xl hover:border-green-500/20 active:scale-[0.98] transition-all duration-300 group"
        >
          <span className="font-bold text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">
            View rider game history <span className="text-green-600 dark:text-green-400 ml-2">({games.length})</span>
          </span>
          <ChevronRight className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" size={24} />
        </button>
        <button
          onClick={() => setScreen("notifications")}
          className="w-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-lg p-5 flex items-center justify-between border border-transparent dark:border-gray-800 hover:shadow-2xl hover:border-green-500/20 active:scale-[0.98] transition-all duration-300 group"
        >
          <span className="font-bold text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">
            View available notifications <span className="text-green-600 dark:text-green-400 ml-2">({notifications.length})</span>
          </span>
          <ChevronRight className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" size={24} />
        </button>
        <button
          onClick={() => setScreen("banners")}
          className="w-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-lg p-5 flex items-center justify-between border border-transparent dark:border-gray-800 hover:shadow-2xl hover:border-green-500/20 active:scale-[0.98] transition-all duration-300 group"
        >
          <span className="font-bold text-gray-800 dark:text-gray-100 font-inter italic tracking-tighter uppercase">Banner Management</span>
          <ChevronRight className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" size={24} />
        </button>
      </div>
    </div>
  );

  const renderGameHistory = () => (
    <div className="p-4 space-y-6 animate-fadeIn max-w-2xl mx-auto">
      {games.map((game, idx) => (
        <div
          key={game.id}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 transform hover:scale-[1.01] transition-all duration-300 border border-transparent dark:border-gray-800"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-gray-800 dark:text-gray-100 font-bold text-xl font-inter tracking-tight">
              At least {game.kilometers} kilometers
            </h3>
            <span className="text-green-600 dark:text-green-400 font-bold text-sm uppercase italic tracking-widest">{game.date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 mb-6 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl w-fit">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase italic tracking-widest">{game.time}</span>
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] italic">Prize</span>
              <span className="text-green-600 dark:text-green-400 font-black text-xs uppercase italic tracking-widest">{game.progress}% Complete</span>
            </div>
            <div className="text-3xl font-black text-gray-800 dark:text-gray-100 font-inter tracking-tighter mb-4 italic">
              ₦{game.prize.toLocaleString()}
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden p-1 border border-gray-200 dark:border-gray-700 shadow-inner">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                style={{ width: `${game.progress}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNotifications = () => (
    <div className="p-4 space-y-6 animate-fadeIn max-w-2xl mx-auto">
      {notifications.map((notif, idx) => (
        <div
          key={notif.id}
          className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 transform hover:scale-[1.01] transition-all duration-300 border border-transparent dark:border-gray-800"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-green-600 dark:text-green-400 font-black text-lg font-inter italic tracking-tighter uppercase whitespace-nowrap">
              #{notif.id} Notification
            </h3>
            <span
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase italic tracking-widest border transition-all ${
                notif.visible
                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 shadow-sm"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-500 border-gray-200 dark:border-gray-700 shadow-sm"
              }`}
            >
              {notif.visible ? "active" : "hidden"}
            </span>
          </div>
          <h4 className="font-black text-gray-800 dark:text-gray-100 mb-4 font-inter italic tracking-tighter text-2xl underline decoration-green-500 decoration-4 underline-offset-8 decoration-dashed">{notif.title}</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8 font-inter font-medium">
            {notif.content}
          </p>
          <button className="w-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-4 px-6 rounded-2xl font-bold flex items-center justify-between hover:bg-green-100 dark:hover:bg-green-900/30 active:scale-[0.98] transition-all duration-300 uppercase italic tracking-widest text-xs border border-green-100 dark:border-green-800/50 shadow-sm">
            Manage Action
            <ChevronRight size={20} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderBanners = () => (
    <div className="p-4 space-y-6 animate-fadeIn max-w-2xl mx-auto">
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border-4 border-green-200/50 dark:border-green-900/30 p-8 transform hover:scale-[1.01] transition-all duration-300 relative overflow-hidden"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-green-400/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-green-600 dark:text-green-400 font-black text-xl font-inter italic tracking-tighter uppercase whitespace-nowrap">
              Banner {banner.id}
            </h3>
            <button className="text-gray-400 dark:text-gray-600 hover:text-green-600 dark:hover:text-green-400 transition-all p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">
              <MoreVertical size={24} />
            </button>
          </div>
          <div className="space-y-4 text-sm relative z-10">
            <div className="flex justify-between py-4 border-b border-gray-100 dark:border-gray-800 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl px-2 transition-all">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic flex items-center">Title</span>
              <span className="text-gray-800 dark:text-gray-100 font-bold text-right font-inter max-w-[200px]">
                {banner.title}
              </span>
            </div>
            <div className="flex justify-between py-4 border-b border-gray-100 dark:border-gray-800 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl px-2 transition-all">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic flex items-center">Heading</span>
              <span className="text-gray-800 dark:text-gray-100 font-bold text-right font-inter max-w-[200px]">
                {banner.heading}
              </span>
            </div>
            <div className="flex justify-between py-4 border-b border-gray-100 dark:border-gray-800 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl px-2 transition-all">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic flex items-center">Body Text</span>
              <span className="text-gray-800 dark:text-gray-100 font-bold text-right font-inter max-w-[200px]">
                {banner.bodyText}
              </span>
            </div>
            <div className="flex justify-between py-4 border-b border-gray-100 dark:border-gray-800 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl px-2 transition-all">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic flex items-center">Text Button</span>
              <span className="text-gray-800 dark:text-gray-100 font-bold text-right font-inter">
                {banner.buttonText}
              </span>
            </div>
            <div className="flex justify-between py-4 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl px-2 transition-all">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic flex items-center">Status</span>
              <span
                className={`text-xs font-black uppercase italic tracking-widest px-4 py-1.5 rounded-full shadow-sm ${
                  banner.status === "Active"
                    ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700"
                }`}
              >
                {banner.status}
              </span>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={() => {
          setBannerForm(banners[0]);
          setScreen("preview");
        }}
        className="w-full bg-green-600 dark:bg-green-700 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-green-700 dark:hover:bg-green-800 active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-green-500/20 uppercase italic tracking-tighter"
      >
        Preview Active Banner
      </button>
    </div>
  );

  const renderBannerForm = () => (
    <div className="p-4 space-y-8 animate-fadeIn max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 border border-transparent dark:border-gray-800">
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1 italic">
              Banner Title
            </label>
            <input
              type="text"
              value={bannerForm.title}
              onChange={(e) =>
                setBannerForm({ ...bannerForm, title: e.target.value })
              }
              placeholder="Receive money, win up to 1k!"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 dark:text-gray-100 font-inter font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1 italic">
              Main Heading
            </label>
            <input
              type="text"
              value={bannerForm.heading}
              onChange={(e) =>
                setBannerForm({ ...bannerForm, heading: e.target.value })
              }
              placeholder="Win up to N1K bonus"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 dark:text-gray-100 font-inter font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1 italic">
              Body Message
            </label>
            <textarea
              value={bannerForm.bodyText}
              onChange={(e) =>
                setBannerForm({ ...bannerForm, bodyText: e.target.value })
              }
              placeholder="Receive big payments, Spin to get up to N1K"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 min-h-[120px] resize-none dark:text-gray-100 font-inter font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1 italic">
                Button Text
              </label>
              <input
                type="text"
                value={bannerForm.buttonText}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, buttonText: e.target.value })
                }
                placeholder="Check it Out"
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 dark:text-gray-100 font-inter font-bold uppercase italic tracking-widest text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1 italic">
                Status
              </label>
              <select
                value={bannerForm.status}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, status: e.target.value as any })
                }
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 dark:text-gray-100 font-inter font-bold uppercase italic tracking-widest text-xs appearance-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1 italic">
              Action URL
            </label>
            <input
              type="url"
              value={bannerForm.buttonUrl}
              onChange={(e) =>
                setBannerForm({ ...bannerForm, buttonUrl: e.target.value })
              }
              placeholder="https://www.google.com"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 dark:text-gray-100 font-inter font-bold text-green-600 dark:text-green-400 underline"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1 italic">
              Promotional Asset
            </label>
            <div className="border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-12 text-center hover:border-green-500 dark:hover:border-green-500/50 transition-all duration-500 cursor-pointer group bg-gray-50/50 dark:bg-black/10">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <Upload className="text-green-600 dark:text-green-400" size={32} />
                </div>
                <p className="text-gray-800 dark:text-gray-100 font-black font-inter italic tracking-tighter uppercase text-lg">Upload visual assets</p>
                <p className="text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-2">Max size: 5MB • PNG, JPG</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 pt-10">
          <button
            onClick={handleSaveBanner}
            className="flex-1 bg-green-600 dark:bg-green-700 text-white py-5 rounded-2xl font-black text-lg hover:bg-green-700 dark:hover:bg-green-800 active:scale-[0.98] transition-all duration-300 shadow-xl shadow-green-500/20 uppercase italic tracking-tighter"
          >
            Deploy
          </button>
          <button
            onClick={() => setScreen("preview")}
            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 py-5 rounded-2xl font-black text-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all duration-300 uppercase italic tracking-tighter border border-gray-200 dark:border-gray-700"
          >
            Review
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
          <button
            onClick={() => setScreen("banner-form")}
            className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200"
          >
            <X size={24} />
          </button>

          <div className="relative h-96 bg-gradient-to-br from-purple-900 via-gray-900 to-black">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    📷
                  </div>
                  <span className="font-semibold">JOHNEX PHOTOGRAPHY</span>
                </div>
                <h1 className="text-yellow-400 text-3xl font-bold mb-2 animate-pulse">
                  Your One-Stop Shop for Visual
                </h1>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h2 className="text-yellow-400 text-2xl font-bold mb-3">
                    {bannerForm.heading || "Win up to 1K bonus"}
                  </h2>
                  <p className="text-white text-lg leading-relaxed">
                    {bannerForm.bodyText ||
                      "Receive big payments, Spin to get up to N1K"}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg opacity-70"
                    />
                  ))}
                </div>

                <button className="w-full bg-white text-gray-900 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 shadow-xl">
                  {bannerForm.buttonText || "Check it Out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {renderHeader()}
      <div className="pb-8">
        {screen === "home" && renderHome()}
        {screen === "game-history" && renderGameHistory()}
        {screen === "notifications" && renderNotifications()}
        {screen === "banners" && renderBanners()}
        {screen === "banner-form" && renderBannerForm()}
        {screen === "preview" && renderPreview()}
      </div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Content;
