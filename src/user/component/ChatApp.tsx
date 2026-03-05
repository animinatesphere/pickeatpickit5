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
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Navbar } from "../../component/Navbar";
import { supabase } from "../../services/authService";
import {
  getConversationWithParticipantNames,
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

export default function ChatApp() {
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

        // Check for recipientId in URL
        const params = new URLSearchParams(location.search);
        const recipientId = params.get("recipientId");
        if (recipientId) {
          const res = await startDirectConversation(session.user.id, recipientId);
          if (res && !res.error && res.data) {
            const conv = res.data;
            const formattedConv = {
              id: conv.id,
              name: "New Chat",
              message: conv.last_message_text || "Starting conversation...",
              time: conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
              unread: 0,
              online: true
            };
            setActiveChat(formattedConv);
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
      // Clear unread for the active conversation
      setConversations(prev => prev.map(c => c.id === activeChat.id ? { ...c, unread: 0 } : c));
      const subscription = subscribeToMessages(activeChat.id, (payload) => {
        const newMessage = payload.new as Message;
        setChatMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      });
      return () => { supabase.removeChannel(subscription); };
    }
  }, [activeChat]);

  // Listen for new messages across ALL conversations to update unread badges
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('chat-unread-listener')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          const msg = payload.new;
          if (msg.sender_id === userId) return;
          // If the message is in a conversation we're NOT currently viewing, bump unread
          if (!activeChat || msg.conversation_id !== activeChat.id) {
            setConversations(prev => prev.map(c =>
              c.id === msg.conversation_id
                ? { ...c, unread: c.unread + 1, message: msg.content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                : c
            ));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, activeChat]);

  // Debounced phone search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data, error } = await searchUserByPhone(searchQuery);
      if (!error && data) setSearchResults(data as SearchResult[]);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async (uid: string) => {
    const { data, error } = await getConversationWithParticipantNames(uid);
    if (!error && data) {
      const formatted = data.map((item: any) => ({
        id: item.conversations.id,
        name: item.otherName || "Unknown",
        message: item.conversations.last_message_text || "No messages yet",
        time: item.conversations.last_message_time ? new Date(item.conversations.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        unread: 0,
        online: true
      }));
      setConversations(formatted);
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
    if (error) console.error("Failed to send message:", error);
  };

  const openChat = (conversation: Conversation) => {
    setActiveChat(conversation);
    setActiveView("chat");
  };

  const handleSearchSelect = async (result: SearchResult) => {
    if (!userId) return;
    setSearching(true);
    setSearchQuery("");
    setSearchResults([]);

    const res = await startDirectConversation(userId, result.user_id);
    if (res && !res.error && res.data) {
      const conv = res.data;
      const formattedConv: Conversation = {
        id: conv.id,
        name: result.name,
        message: conv.last_message_text || "Say hello!",
        time: "Just now",
        unread: 0,
        online: true
      };
      // Update conversations list
      setConversations(prev => {
        if (prev.find(c => c.id === conv.id)) return prev;
        return [{ ...formattedConv }, ...prev];
      });
      setActiveChat(formattedConv);
      setActiveView("chat");
    }
    setSearching(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full overflow-hidden bg-white dark:bg-gray-900 md:my-4 md:rounded-2xl md:shadow-xl md:border md:border-gray-200 dark:md:border-gray-800">

        {/* Sidebar */}
        <div className={`flex-col w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${activeView === "chat" ? "hidden md:flex" : "flex"}`}>
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">
                <MoreVertical size={18} />
              </div>
            </div>
            {/* Search by phone */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by phone number..."
                className="w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <X size={16} />
                </button>
              )}
              {/* Search results dropdown */}
              <AnimatePresence>
                {(searchResults.length > 0 || searching) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    {searching ? (
                      <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
                    ) : (
                      searchResults.map((result) => (
                        <button
                          key={result.user_id}
                          onClick={() => handleSearchSelect(result)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left"
                        >
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center font-semibold text-green-700 dark:text-green-400 flex-shrink-0">
                            {result.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{result.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10}/> {result.phone} · {result.role}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {loading ? (
              <div className="flex flex-col gap-3 p-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">No Chats Yet</h3>
                <p className="text-sm text-gray-400 mt-2">Search by phone number to start chatting.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  onClick={() => openChat(conv)}
                  className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${activeChat?.id === conv.id ? 'bg-green-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${activeChat?.id === conv.id ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                      {conv.name.charAt(0).toUpperCase()}
                    </div>
                    {conv.online && (
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${activeChat?.id === conv.id ? 'bg-green-300 border-green-600' : 'bg-green-500 border-white dark:border-gray-900'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className={`font-semibold text-sm truncate ${activeChat?.id === conv.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{conv.name}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {conv.unread > 0 && activeChat?.id !== conv.id && (
                          <span className="min-w-[20px] h-5 px-1.5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                            {conv.unread > 99 ? '99+' : conv.unread}
                          </span>
                        )}
                        <span className={`text-[11px] ${activeChat?.id === conv.id ? 'text-green-200' : 'text-gray-400'}`}>{conv.time}</span>
                      </div>
                    </div>
                    <p className={`text-xs truncate ${activeChat?.id === conv.id ? 'text-green-100' : conv.unread > 0 ? 'font-semibold text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>{conv.message}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 h-full overflow-hidden ${activeView === "messages" ? "hidden md:flex" : "flex"}`}>
          {activeChat ? (
            <>
              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveView("messages")} className="md:hidden p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center font-semibold text-green-700 dark:text-green-400">
                    {activeChat.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {activeChat.name}
                      <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                    </h3>
                    <p className="text-xs text-green-600 dark:text-green-400">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30 transition-all">
                    <Phone size={18} />
                  </button>
                  <button className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4 scroll-smooth">
                {chatMessages.map((msg) => {
                  const isMe = msg.sender_id === userId;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] sm:max-w-[65%]`}>
                        <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700'}`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[11px] text-gray-400">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <Check size={12} className="text-green-400" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button type="button" className="p-2 text-gray-400 hover:text-green-600 flex-shrink-0 hidden sm:block"><Paperclip size={20} /></button>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"><Smile size={20} /></button>
                  </div>
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="w-11 h-11 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 transition-all disabled:opacity-40 active:scale-95 flex-shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                <MessageCircle size={40} className="text-green-600 dark:text-green-400 opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Start a Conversation</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-xs">Search for someone by their phone number to start chatting.</p>
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl w-full max-w-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <User size={18} />
                  </div>
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 text-left">Type a phone number in the search box to find someone</p>
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
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
  </svg>
);
