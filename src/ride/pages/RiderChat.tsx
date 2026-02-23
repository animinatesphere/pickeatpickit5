import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  Paperclip,
  Smile,
  ArrowLeft,
  // Check,
  Send,
  Search,
  MoreVertical,
  Circle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { RiderNav } from "../component/RiderNav";
import { supabase } from "../../services/authService";
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  subscribeToMessages,
  startDirectConversation,
  searchUserByPhone
} from "../../services/api";

interface Conversation {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  url?: string;
  created_at: string;
}

interface SearchResult {
  user_id: string;
  name: string;
  role: string;
  phone: string;
}

export default function RiderChat() {
  const location = useLocation();
  const [activeView, setActiveView] = useState<"messages" | "chat">("messages");
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        await loadConversations(session.user.id);

        const params = new URLSearchParams(location.search);
        const recipientId = params.get("recipientId");
        if (recipientId) {
          const res = await startDirectConversation(session.user.id, recipientId);
          if (res && !res.error && res.data) {
            const conv = res.data;
            setActiveChat({ id: conv.id, name: "New Conversation", message: conv.last_message_text || "Starting secure link...", time: "Just now", unread: 0, online: true });
            setActiveView("chat");
          }
        }
      }
      setLoading(false);
    };
    init();
  }, [location.search]);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      const subscription = subscribeToMessages(activeChat.id, (payload) => {
        const newMessage = payload.new as Message;
        setChatMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      });
      return () => { supabase.removeChannel(subscription); };
    }
  }, [activeChat]);

  // Debounced phone search
  useEffect(() => {
    if (searchQuery.length < 3) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data, error } = await searchUserByPhone(searchQuery);
      if (!error && data) setSearchResults(data as SearchResult[]);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadConversations = async (uid: string) => {
    const { data, error } = await getConversations(uid);
    if (!error && data) {
      setConversations(data.map((item: any) => ({
        id: item.conversations.id,
        name: "Conversation",
        message: item.conversations.last_message_text || "No messages yet",
        time: item.conversations.last_message_time ? new Date(item.conversations.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        unread: 0, online: true
      })));
    }
  };

  const loadMessages = async (cid: string) => {
    const { data, error } = await getMessages(cid);
    if (!error && data) { setChatMessages(data); setTimeout(scrollToBottom, 50); }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeChat || !userId) return;
    const content = messageInput;
    setMessageInput("");
    const { error } = await sendMessage(activeChat.id, userId, content);
    if (error) console.error("Failed to send message:", error);
  };

  const handleSearchSelect = async (result: SearchResult) => {
    if (!userId) return;
    setSearching(true);
    setSearchQuery(""); setSearchResults([]);
    const res = await startDirectConversation(userId, result.user_id);
    if (res && !res.error && res.data) {
      const conv = res.data;
      const formattedConv: Conversation = { id: conv.id, name: result.name, message: conv.last_message_text || "Say hello!", time: "Just now", unread: 0, online: true };
      setConversations(prev => prev.find(c => c.id === conv.id) ? prev : [formattedConv, ...prev]);
      setActiveChat(formattedConv);
      setActiveView("chat");
    }
    setSearching(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] overflow-hidden text-white">
      <RiderNav />
      <div className="flex-1 flex flex-col md:flex-row max-w-full mx-auto w-full overflow-hidden bg-[#111111]">
        
        {/* Sidebar */}
        <div className={`flex-col w-full md:w-80 lg:w-96 border-r border-white/5 bg-[#0F0F0F] ${activeView === "chat" ? "hidden md:flex" : "flex"}`}>
          <div className="p-8 border-b border-white/5">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Grid Signal</h2>
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1 italic">Secure Link: 256-bit</p>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500"><MoreVertical size={24} /></div>
            </div>
            {/* Phone Search */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-green-500 transition-colors" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by phone..."
                className="w-full pl-12 pr-10 py-5 bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-green-500/10 placeholder:text-gray-700 transition-all text-white border border-white/5"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"><X size={16} /></button>
              )}
              <AnimatePresence>
                {(searchResults.length > 0 || searching) && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
                    {searching ? (
                      <div className="p-4 text-center text-xs text-gray-500 font-black uppercase tracking-widest">Scanning Frequencies...</div>
                    ) : searchResults.map((result) => (
                      <button key={result.user_id} onClick={() => handleSearchSelect(result)} className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left">
                        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center font-black text-green-500 italic flex-shrink-0">
                          {result.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black italic uppercase text-sm text-white truncate">{result.name}</p>
                          <p className="text-xs text-gray-500 font-bold flex items-center gap-1"><Phone size={10} /> {result.phone} · {result.role}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
            {loading ? (
              <div className="flex flex-col gap-6 p-4">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl" />
                    <div className="flex-1 space-y-3"><div className="h-5 bg-white/5 rounded w-1/2" /><div className="h-4 bg-white/5 rounded w-full" /></div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10 m-2">
                <div className="w-24 h-24 bg-white/5 rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 rotate-3 border border-white/5">
                  <MessageCircle size={48} className="text-green-500 opacity-20" />
                </div>
                <h3 className="font-black italic uppercase text-white tracking-tight text-xl">No Comms Logged</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-4 leading-loose">Search by phone number to connect.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <motion.div whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }} whileTap={{ scale: 0.98 }} key={conv.id}
                  onClick={() => { setActiveChat(conv); setActiveView("chat"); }}
                  className={`group flex items-center gap-5 p-5 rounded-[2rem] cursor-pointer transition-all ${activeChat?.id === conv.id ? 'bg-green-600 text-white shadow-2xl shadow-green-600/20' : 'bg-white/[0.02] border border-white/5'}`}>
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl italic transform transition-transform group-hover:rotate-6 ${activeChat?.id === conv.id ? 'bg-white/20' : 'bg-white/10 text-white'}`}>
                      {conv.name.charAt(0)}
                    </div>
                    {conv.online && <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 shadow-sm ${activeChat?.id === conv.id ? 'bg-green-400 border-green-600' : 'bg-green-500 border-[#0F0F0F]'}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black italic uppercase text-sm tracking-tight truncate">{conv.name}</h3>
                      <span className="text-[9px] font-black uppercase tracking-widest pt-1 opacity-50">{conv.time}</span>
                    </div>
                    <p className="text-[11px] font-bold truncate opacity-60">{conv.message}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-[#0D0D0D] h-full overflow-hidden ${activeView === "messages" ? "hidden md:flex" : "flex"}`}>
          {activeChat ? (
            <>
            <div className="p-4 sm:p-6 md:p-8 bg-white border-b border-gray-100 flex items-center justify-between z-10 shadow-sm">
  <div className="flex items-center gap-3 sm:gap-5">
    <button onClick={() => setActiveView("messages")} 
      className="md:hidden p-2 sm:p-4 bg-gray-100 rounded-xl sm:rounded-2xl text-gray-500">
      <ArrowLeft size={20} />
    </button>
    <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-700 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-white italic text-lg sm:text-2xl md:text-3xl shadow-xl">
      {activeChat.name.charAt(0)}
    </div>
    <div>
      <h3 className="font-black italic uppercase text-gray-800 text-sm sm:text-lg md:text-2xl tracking-tighter flex items-center gap-2">
        {activeChat.name}
        <Circle size={8} fill="#22c55e" className="text-green-500 animate-pulse" />
      </h3>
      <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" />
        <p className="text-[8px] sm:text-[10px] font-black text-green-600 uppercase tracking-widest italic">Active Now</p>
      </div>
    </div>
  </div>
  <div className="flex items-center gap-2 sm:gap-4">
    <button className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gray-50 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-gray-400">
      <Phone size={18} />
    </button>
    <button className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gray-50 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-gray-400">
      <MoreVertical size={18} />
    </button>
  </div>
</div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 space-y-4 sm:space-y-6 md:space-y-8 scroll-smooth">
  {chatMessages.map((msg) => {
    const isMe = msg.sender_id === userId;
    return (
      <motion.div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[85%] sm:max-w-[75%] ${isMe ? "order-2" : ""}`}>
          <div className={`px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 rounded-2xl sm:rounded-[2.5rem] shadow-xl ${
            isMe
              ? "bg-green-700 text-white rounded-br-none"
              : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
          }`}>
            <p className="text-xs sm:text-sm font-black italic tracking-wide leading-relaxed">
              {msg.content}
            </p>
          </div>
        </div>
      </motion.div>
    );
  })}
  <div ref={messagesEndRef} />
</div>

           <div className="p-3 sm:p-5 md:p-8 bg-white border-t border-gray-50">
  <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 sm:gap-4 md:gap-5 max-w-5xl mx-auto">
    <div className="relative flex-1">
      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder="Type a message..."
        className="w-full pl-4 sm:pl-8 md:pl-10 pr-20 sm:pr-28 md:pr-32 py-4 sm:py-5 md:py-7 bg-gray-50 rounded-2xl sm:rounded-[2rem] text-xs text-black sm:text-sm font-black uppercase tracking-widest placeholder:text-gray-300 focus:outline-none focus:ring-4 sm:focus:ring-8 focus:ring-green-500/5 transition-all border-2 border-transparent focus:border-green-100"
      />
      <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-4">
        <button type="button" className="p-1 sm:p-2 text-gray-400 hover:text-green-700">
          <Smile size={18} />
        </button>
        <button type="button" className="hidden sm:block p-2 text-gray-400 hover:text-green-700">
          <Paperclip size={18} />
        </button>
      </div>
    </div>
    <button
      type="submit"
      disabled={!messageInput.trim()}
      className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-700 text-white rounded-xl sm:rounded-2xl md:rounded-[2rem] flex items-center justify-center flex-shrink-0"
    >
      <Send size={20} className="transform rotate-12" />
    </button>
  </form>
</div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="w-48 h-48 bg-white/5 rounded-[4rem] shadow-2xl flex items-center justify-center mb-12 transform rotate-6 border border-white/10">
                <MessageCircle size={80} className="text-green-500 opacity-20" />
              </div>
              <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">System Standby</h3>
              <p className="text-[10px] text-gray-600 font-black mt-8 max-w-sm leading-loose uppercase tracking-[0.4em]">Search by phone number to bridge communication.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MessageCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
  </svg>
);
