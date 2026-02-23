import React, { useState, useEffect, useRef } from "react";
import {
  User,
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
import { Navbar } from "../../component/Navbar";
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

export default function ChatApp() {
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
        name: "Support / Partner", // In a real app, join with users table for names
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
      setTimeout(scrollToBottom, 100);
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
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full overflow-hidden bg-white md:my-4 md:rounded-[2.5rem] md:shadow-2xl md:border md:border-gray-100">
        
        {/* Sidebar / Messages List */}
        <div className={`flex-col w-full md:w-80 lg:w-96 border-r border-gray-100 bg-white ${activeView === "chat" ? "hidden md:flex" : "flex"}`}>
          <div className="p-6 border-b border-gray-50 bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-800">Operational Comms</h2>
              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                <MoreVertical size={20} />
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search encrypted channels..." 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500/20 placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
            {loading ? (
                <div className="flex flex-col gap-4 p-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="animate-pulse flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-1/2" />
                                <div className="h-3 bg-gray-100 rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mb-6">
                        <MessageCircle size={40} className="text-green-600" />
                    </div>
                    <h3 className="font-black italic uppercase text-gray-800 tracking-tight">No Active Comms</h3>
                    <p className="text-xs text-gray-400 font-bold mt-2 leading-relaxed">Your secure communication channels will appear here once orders are initiated.</p>
                </div>
            ) : (
                conversations.map((conv) => (
                    <motion.div
                        layoutId={conv.id}
                        key={conv.id}
                        onClick={() => openChat(conv)}
                        className={`group flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all ${activeChat?.id === conv.id ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' : 'hover:bg-gray-50'}`}
                    >
                        <div className="relative">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl italic ${activeChat?.id === conv.id ? 'bg-white/20' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800'}`}>
                                {conv.name.charAt(0)}
                            </div>
                            {conv.online && (
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 ${activeChat?.id === conv.id ? 'bg-green-400 border-green-600' : 'bg-green-500 border-white'}`} />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-black italic uppercase text-sm tracking-tight truncate ${activeChat?.id === conv.id ? 'text-white' : 'text-gray-800'}`}>{conv.name}</h3>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${activeChat?.id === conv.id ? 'text-green-200' : 'text-gray-400'}`}>{conv.time}</span>
                            </div>
                            <p className={`text-xs font-bold truncate ${activeChat?.id === conv.id ? 'text-green-100' : 'text-gray-500'}`}>{conv.message}</p>
                        </div>
                    </motion.div>
                ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex-col bg-gray-50/30 ${activeView === "messages" ? "hidden md:flex" : "flex"}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveView("messages")} className="md:hidden p-3 bg-gray-50 rounded-2xl text-gray-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center font-black text-green-700 italic">
                        {activeChat.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-black italic uppercase text-gray-800 tracking-tight flex items-center gap-2">
                            {activeChat.name}
                            <Circle size={8} fill="#22c55e" className="text-green-500" />
                        </h3>
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest italic">Operational Status: Ready</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-green-100 hover:text-green-600 transition-all">
                        <Phone size={18} />
                    </button>
                    <button className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                        <MoreVertical size={18} />
                    </button>
                </div>
              </div>

              {/* Messages View */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                {chatMessages.map((msg) => {
                  const isMe = msg.sender_id === userId;
                  return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${isMe ? 'order-2' : ''}`}>
                        <div className={`px-5 py-4 rounded-[1.5rem] shadow-sm ${isMe ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                          <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-2 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <Check size={12} className="text-green-500" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 bg-white border-t border-gray-50">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                  <div className="relative flex-1 group">
                    <input 
                        type="text" 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Transmit message..." 
                        className="w-full pl-6 pr-24 py-5 bg-gray-50 rounded-[1.5rem] text-sm font-bold placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-green-500/5 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button type="button" className="p-2 text-gray-400 hover:text-green-600"><Smile size={20} /></button>
                        <button type="button" className="p-2 text-gray-400 hover:text-green-600"><Paperclip size={20} /></button>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="w-16 h-16 bg-green-600 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 disabled:opacity-50 active:scale-90 flex-shrink-0"
                  >
                    <Send size={24} className="transform rotate-12" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/50">
              <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center mb-10 transform -rotate-6">
                <MessageCircle size={60} className="text-green-600 opacity-20" />
              </div>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-gray-800">Secure Protocol Active</h3>
              <p className="text-xs text-gray-400 font-bold mt-4 max-w-xs leading-relaxed uppercase tracking-widest">Select a channel from the tactical overview to initiate end-to-end encrypted communication.</p>
              <div className="mt-12 p-6 bg-green-50 rounded-[2rem] border border-green-100 w-full max-w-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                        <User size={20} />
                    </div>
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Intelligence Summary</span>
                </div>
                <p className="text-[10px] font-bold text-green-600/70 text-left leading-relaxed">Ensure all operational coordinations are conducted within these channels for system-wide synchronicity.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for icons that were used but not imported
const MessageCircle = ({ size, className }: { size: number, className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
);
