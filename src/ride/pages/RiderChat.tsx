import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  Paperclip,
  Smile,
  ArrowLeft,
  Check,
  Send,
  Search,
  MoreVertical,
  Circle
} from "lucide-react";
import { motion } from "framer-motion";
import { RiderNav } from "../component/RiderNav";
import { supabase } from "../../services/authService";
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  subscribeToMessages 
} from "../../services/api";

interface Conversation {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: number;
  online: boolean;
  verified?: boolean;
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

export default function RiderChat() {
  const [activeView, setActiveView] = useState<"messages" | "chat">("messages");
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        await loadConversations(session.user.id);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      const subscription = subscribeToMessages(activeChat.id, (payload) => {
        const newMessage = payload.new as Message;
        setChatMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      });

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async (uid: string) => {
    const { data, error } = await getConversations(uid);
    if (!error && data) {
      const formattedConversations = data.map((item: any) => ({
        id: item.conversations.id,
        name: "Support / Client", 
        message: item.conversations.last_message_text || "No messages yet",
        time: item.conversations.last_message_time ? new Date(item.conversations.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        unread: 0,
        online: true
      }));
      setConversations(formattedConversations);
    }
  };

  const loadMessages = async (cid: string) => {
    const { data, error } = await getMessages(cid);
    if (!error && data) {
      setChatMessages(data);
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeChat || !userId) return;

    const content = messageInput;
    setMessageInput("");
    
    const { error } = await sendMessage(activeChat.id, userId, content);
    if (error) {
      console.error("Failed to send message:", error);
    }
  };

  const openChat = (conversation: Conversation) => {
    setActiveChat(conversation);
    setActiveView("chat");
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
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500">
                <MoreVertical size={24} />
              </div>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-green-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Scan Frequencies..." 
                className="w-full pl-12 pr-4 py-5 bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-green-500/10 placeholder:text-gray-700 transition-all text-white border border-white/5"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
            {loading ? (
                <div className="flex flex-col gap-6 p-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="animate-pulse flex items-center gap-5">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl" />
                            <div className="flex-1 space-y-3">
                                <div className="h-5 bg-white/5 rounded w-1/2" />
                                <div className="h-4 bg-white/5 rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10 m-2">
                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 rotate-3 border border-white/5">
                        <MessageCircle size={48} className="text-green-500 opacity-20" />
                    </div>
                    <h3 className="font-black italic uppercase text-white tracking-tight text-xl">No Comms Logged</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-4 leading-loose">Waiting for dispatch or operational signals...</p>
                </div>
            ) : (
                conversations.map((conv) => (
                    <motion.div
                        whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        key={conv.id}
                        onClick={() => openChat(conv)}
                        className={`group flex items-center gap-5 p-5 rounded-[2rem] cursor-pointer transition-all ${activeChat?.id === conv.id ? 'bg-green-600 text-white shadow-2xl shadow-green-600/20' : 'bg-white/[0.02] border border-white/5'}`}
                    >
                        <div className="relative">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl italic transform transition-transform group-hover:rotate-6 ${activeChat?.id === conv.id ? 'bg-white/20' : 'bg-white/10 text-white'}`}>
                                {conv.name.charAt(0)}
                            </div>
                            {conv.online && (
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 shadow-sm ${activeChat?.id === conv.id ? 'bg-green-400 border-green-600' : 'bg-green-500 border-[#0F0F0F]'}`} />
                            )}
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
        <div className={`flex-1 flex flex-col bg-[#0D0D0D] ${activeView === "messages" ? "hidden md:flex" : "flex"}`}>
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-8 bg-[#111111] border-b border-white/5 flex items-center justify-between z-10">
                <div className="flex items-center gap-5">
                    <button onClick={() => setActiveView("messages")} className="md:hidden p-4 bg-white/5 rounded-2xl text-gray-500 active:scale-90 transition-all">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="w-16 h-16 bg-green-600 rounded-3xl flex items-center justify-center font-black text-white italic text-3xl shadow-xl shadow-green-600/20 border border-white/10">
                        {activeChat.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-black italic uppercase text-white text-2xl tracking-tighter flex items-center gap-3">
                            {activeChat.name}
                            <Circle size={10} fill="#22c55e" className="text-green-500 animate-pulse" />
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest italic opacity-80">Link Synchronized</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="w-14 h-14 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-gray-500 hover:bg-green-600 hover:text-white transition-all active:scale-90 border border-white/5">
                        <Phone size={24} />
                    </button>
                    <button className="w-14 h-14 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-gray-500 hover:bg-white/10 transition-all active:scale-90 border border-white/5">
                        <MoreVertical size={24} />
                    </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth">
                {chatMessages.map((msg) => {
                  const isMe = msg.sender_id === userId;
                  return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
                        <div className={`px-8 py-6 rounded-[2.5rem] shadow-2xl ${isMe ? 'bg-green-600 text-white rounded-br-none border border-white/10' : 'bg-white/10 text-white rounded-bl-none border border-white/5'}`}>
                          <p className="text-sm font-black italic tracking-wide leading-relaxed">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-3 mt-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <Check size={14} className="text-green-500" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-8 bg-[#111111] border-t border-white/5">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-5 max-w-5xl mx-auto">
                  <div className="relative flex-1">
                    <input 
                        type="text" 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Encrypted Uplink..." 
                        className="w-full pl-10 pr-32 py-7 bg-white/5 rounded-[2rem] text-sm font-black uppercase tracking-widest placeholder:text-gray-700 focus:outline-none focus:ring-8 focus:ring-green-500/5 transition-all border border-white/5 text-white"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                        <button type="button" className="p-2 text-gray-500 hover:text-green-500 transition-colors"><Smile size={24} /></button>
                        <button type="button" className="p-2 text-gray-500 hover:text-green-500 transition-colors"><Paperclip size={24} /></button>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="w-20 h-20 bg-green-600 text-white rounded-[2rem] flex items-center justify-center hover:bg-green-700 hover:scale-105 transition-all shadow-2xl shadow-green-600/40 disabled:opacity-50 active:scale-90 flex-shrink-0"
                  >
                    <Send size={32} className="transform rotate-12" />
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
              <p className="text-[10px] text-gray-600 font-black mt-8 max-w-sm leading-loose uppercase tracking-[0.4em]">Grid locked... Select a signal to bridge communication.</p>
              
              <div className="mt-16 flex gap-4 w-full max-w-md">
                <div className="flex-1 p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 text-center">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-6">
                        <Check size={24} />
                    </div>
                    <h4 className="font-black italic uppercase text-[10px] tracking-widest text-white">Ops Link Ready</h4>
                </div>
                <div className="flex-1 p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-6">
                        <Circle size={10} fill="currentColor" />
                    </div>
                    <h4 className="font-black italic uppercase text-[10px] tracking-widest text-white italic opacity-50">Signal Stable</h4>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MessageCircle = ({ size, className }: { size: number, className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
);
