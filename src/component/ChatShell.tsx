// src/components/chat/ChatShell.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  Paperclip,
  Smile,
  ArrowLeft,
  Send,
  Search,
  MoreVertical,
  X,
  Check,
  CheckCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  useChat,
  searchUsers,
  type Conversation,
  type Participant,
} from "../hooks/useChat";
// import { backendAuthService } from "../../services/backendAuthService";
import { backendAuthService } from "../services/backendAuthService";
// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  nav: React.ReactNode;
  theme?: "light" | "dark";
}

// ─── MessageCircle icon ───────────────────────────────────────────────────────

const MessageCircle = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
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
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

// ─── ChatShell ────────────────────────────────────────────────────────────────

export default function ChatShell({ nav, theme = "light" }: Props) {
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"messages" | "chat">("messages");
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    messages,
    activeConversation,
    loading,
    sending,
    openChat,
    startChat,
    sendMessage,
  } = useChat(userId);

  // Get current user
  useEffect(() => {
    backendAuthService.getCurrentUser().then((u) => {
      if (u) setUserId(u.id);
    });
  }, []);

  // Handle recipientId query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const recipientId = params.get("recipientId");
    const recipientName = params.get("recipientName") ?? "User";
    if (recipientId && userId) {
      startChat(recipientId, recipientName).then((conv) => {
        if (conv) setActiveView("chat");
      });
    }
  }, [location.search, userId, startChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debounced phone search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch {
        /* silent */
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  const handleSearchSelect = async (result: Participant) => {
    setSearchQuery("");
    setSearchResults([]);
    const conv = await startChat(result.id, result.name ?? result.id);
    if (conv) setActiveView("chat");
  };

  const handleOpenChat = (conv: Conversation) => {
    openChat(conv);
    setActiveView("chat");
  };

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const isDark = theme === "dark";
  const bg = isDark ? "bg-[#0A0A0A]" : "bg-gray-50";
  const sidebarBg = isDark
    ? "bg-[#0F0F0F] border-white/5"
    : "bg-white border-gray-100";
  const chatBg = isDark ? "bg-[#0D0D0D]" : "bg-gray-50";
  const headerBg = isDark
    ? "bg-[#111] border-white/5"
    : "bg-white border-gray-100";
  const inputBg = isDark
    ? "bg-white/5 border-white/5 text-white placeholder:text-gray-600"
    : "bg-gray-100 text-gray-900 placeholder:text-gray-400";
  const convActiveBg = isDark ? "bg-green-700" : "bg-green-600";
  const convHoverBg = isDark ? "hover:bg-white/5" : "hover:bg-gray-50";
  const convNameColor = isDark ? "text-white" : "text-gray-900";
  const mutedText = isDark ? "text-gray-500" : "text-gray-400";
  const headingColor = isDark ? "text-white" : "text-gray-900";
  const myBubble = isDark
    ? "bg-green-700 text-white"
    : "bg-green-600 text-white";
  const theirBubble = isDark
    ? "bg-white/10 text-white"
    : "bg-white text-gray-900 border border-gray-100 shadow-sm";

  return (
    <div className={`flex flex-col h-screen ${bg} overflow-hidden`}>
      {nav}
      <div
        className={`flex-1 flex flex-col md:flex-row max-w-full w-full overflow-hidden ${isDark ? "bg-[#111]" : "bg-white md:my-4 md:mx-4 md:rounded-2xl md:shadow-xl md:border md:border-gray-100"}`}
      >
        {/* ── Sidebar ── */}
        <div
          className={`flex-col w-full md:w-80 lg:w-96 border-r ${sidebarBg} ${activeView === "chat" ? "hidden md:flex" : "flex"}`}
        >
          {/* Header */}
          <div
            className={`p-5 border-b ${isDark ? "border-white/5" : "border-gray-100"} sticky top-0 z-10`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-lg font-black tracking-tight uppercase ${headingColor}`}
              >
                Messages
              </h2>
              <button
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5 text-gray-500" : "bg-gray-100 text-gray-400"}`}
              >
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Phone search */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${mutedText}`}
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by phone number..."
                className={`w-full pl-10 pr-9 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${inputBg}`}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText}`}
                >
                  <X size={15} />
                </button>
              )}

              <AnimatePresence>
                {(searchResults.length > 0 || searching) && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border overflow-hidden z-50 ${isDark ? "bg-[#1A1A1A] border-white/10" : "bg-white border-gray-100"}`}
                  >
                    {searching ? (
                      <div className={`p-4 text-center text-xs ${mutedText}`}>
                        Searching...
                      </div>
                    ) : (
                      searchResults.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleSearchSelect(r)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-green-50"}`}
                        >
                          <div className="w-9 h-9 bg-green-500/15 rounded-full flex items-center justify-center font-bold text-green-600 flex-shrink-0">
                            {(r.name ?? r.id).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-semibold text-sm truncate ${headingColor}`}
                            >
                              {r.name ?? r.id}
                            </p>
                            {r.role && (
                              <p
                                className={`text-xs flex items-center gap-1 ${mutedText}`}
                              >
                                <Phone size={10} /> {r.role}
                              </p>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
            {loading ? (
              <div className="space-y-1 p-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center gap-3 p-3"
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                    />
                    <div className="flex-1 space-y-2">
                      <div
                        className={`h-3.5 rounded w-1/2 ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                      />
                      <div
                        className={`h-3 rounded w-3/4 ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-white/5" : "bg-green-50"}`}
                >
                  <MessageCircle size={28} className="text-green-500" />
                </div>
                <p className={`font-semibold text-sm ${headingColor}`}>
                  No conversations yet
                </p>
                <p className={`text-xs mt-1 ${mutedText}`}>
                  Search by phone to start chatting.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConversation?.id === conv.id;
                return (
                  <motion.div
                    key={conv.id}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleOpenChat(conv)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                      isActive ? `${convActiveBg} text-white` : convHoverBg
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg ${
                          isActive
                            ? "bg-white/20 text-white"
                            : isDark
                              ? "bg-white/10 text-white"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {conv.name.charAt(0).toUpperCase()}
                      </div>
                      {conv.online && (
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                            isActive
                              ? "bg-green-300 border-green-600"
                              : "bg-green-500 border-white"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3
                          className={`font-semibold text-sm truncate ${isActive ? "text-white" : convNameColor}`}
                        >
                          {conv.name}
                        </h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          {conv.unread > 0 && !isActive && (
                            <span className="min-w-[18px] h-[18px] px-1 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                              {conv.unread > 99 ? "99+" : conv.unread}
                            </span>
                          )}
                          <span
                            className={`text-[11px] ${isActive ? "text-green-100" : mutedText}`}
                          >
                            {conv.time}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-xs truncate ${
                          isActive
                            ? "text-green-100"
                            : conv.unread > 0
                              ? `font-semibold ${headingColor}`
                              : mutedText
                        }`}
                      >
                        {conv.message}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div
          className={`flex-1 flex flex-col ${chatBg} h-full overflow-hidden ${activeView === "messages" ? "hidden md:flex" : "flex"}`}
        >
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div
                className={`px-4 py-3 border-b flex items-center justify-between ${headerBg}`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveView("messages")}
                    className={`md:hidden p-2 rounded-xl ${isDark ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"}`}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isDark ? "bg-green-700 text-white" : "bg-green-100 text-green-700"}`}
                  >
                    {activeConversation.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm ${headingColor}`}>
                      {activeConversation.name}
                    </h3>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className={`text-sm ${mutedText}`}>
                      No messages yet. Say hello!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === userId;
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-[72%]">
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? `${myBubble} rounded-br-sm`
                                : `${theirBubble} rounded-bl-sm`
                            }`}
                          >
                            {msg.text}
                          </div>
                          <div
                            className={`flex items-center gap-1 mt-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            <span className={`text-[11px] ${mutedText}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe &&
                              (msg.is_read ? (
                                <CheckCheck
                                  size={12}
                                  className="text-green-400"
                                />
                              ) : (
                                <Check size={12} className={mutedText} />
                              ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div
                className={`px-4 py-3 border-t ${isDark ? "bg-[#111] border-white/5" : "bg-white border-gray-100"}`}
              >
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`p-2 hidden sm:block ${mutedText} hover:text-green-500 flex-shrink-0`}
                  >
                    <Paperclip size={18} />
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type a message..."
                      className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${inputBg}`}
                    />
                    <button
                      type="button"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText} hover:text-green-500`}
                    >
                      <Smile size={18} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="w-11 h-11 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 transition-all disabled:opacity-40 active:scale-95 flex-shrink-0"
                  >
                    <Send size={17} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isDark ? "bg-white/5" : "bg-green-50"}`}
              >
                <MessageCircle
                  size={32}
                  className="text-green-500 opacity-60"
                />
              </div>
              <h3 className={`text-lg font-bold ${headingColor}`}>
                Start a Conversation
              </h3>
              <p className={`text-sm mt-2 max-w-xs ${mutedText}`}>
                Search for someone by phone number to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
