import React, { useState, useRef } from "react";
import {
  User,
  Phone,
  Paperclip,
  Smile,
  Mic,
  ArrowLeft,
  Check,
  Send,
  X,
} from "lucide-react";

import { VendorNav } from "../component/VendorNav";

interface Conversation {
  id: number;
  name: string;
  message: string;
  time: string;
  unread: number;
  online: boolean;
  verified?: boolean;
}

interface Message {
  id: number;
  text?: string;
  time: string;
  sender: string;
  type?: string;
  url?: string;
  duration?: string;
}

export default function VendorChat() {
  const [activeView, setActiveView] = useState<"messages" | "chat">("messages");
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: 1, text: "I'm on my way", time: "2:00 pm", sender: "other" },
    { id: 2, text: "I can't use the closet", time: "2:00 pm", sender: "me" },
    { id: 3, text: "Haha that's terrifying", time: "2:00 pm", sender: "other" },
    { id: 4, text: "I'm serious", time: "2:00 pm", sender: "me" },
    {
      id: 5,
      text: "I'll be there in 2 mins... also I'm coming with the new parts",
      time: "2:00 pm",
      sender: "other",
    },
    { id: 6, text: "perfect!", time: "2:00 pm", sender: "me" },
    {
      id: 7,
      type: "image",
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400",
      time: "2:00 pm",
      sender: "other",
    },
    {
      id: 8,
      type: "voice",
      duration: "0:35",
      time: "2:00 PM",
      sender: "other",
    },
    { id: 9, type: "voice", duration: "0:35", time: "2:00 PM", sender: "me" },
  ]);

  const emojis = [
    "😀",
    "😂",
    "🥰",
    "😍",
    "🤗",
    "🤔",
    "😎",
    "😢",
    "😭",
    "😡",
    "👍",
    "👎",
    "❤️",
    "🔥",
    "✨",
    "🎉",
    "💯",
    "👏",
    "🙏",
    "💪",
  ];

  const conversations = [
    {
      id: 1,
      name: "Mylotz",
      message: "I hope it goes well.",
      time: "06:32 pm",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Em_studios",
      message: "I hope it goes well.",
      time: "06:32 pm",
      unread: 0,
      online: true,
      verified: true,
    },
    {
      id: 3,
      name: "El-vicshotit",
      message: "I hope it goes well.",
      time: "06:32 pm",
      unread: 2,
      online: true,
    },
    {
      id: 4,
      name: "Johnex studio",
      message: "I hope it goes well.",
      time: "06:32 pm",
      unread: 0,
      online: false,
      verified: true,
    },
    {
      id: 5,
      name: "Tolex Photography",
      message: "I hope it goes well.",
      time: "06:32 pm",
      unread: 0,
      online: true,
      verified: true,
    },
    {
      id: 6,
      name: "Photo lounge",
      message: "I hope it goes well.",
      time: "06:32 pm",
      unread: 0,
      online: true,
      verified: true,
    },
    {
      id: 7,
      name: "Kenny's Shot",
      message: "I hope it goes well.",
      time: "06:32 pm",
      unread: 0,
      online: false,
      verified: true,
    },
  ];

  const openChat = (conversation: Conversation) => {
    setActiveChat(conversation);
    setActiveView("chat");
  };

  const backToMessages = () => {
    setActiveView("messages");
    setActiveChat(null);
  };

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (messageInput.trim() === "") return;

    const newMessage: Message = {
      id: chatMessages.length + 1,
      text: messageInput,
      time: getCurrentTime(),
      sender: "me",
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageInput("");
    setShowEmojiPicker(false);

    // Simulate a response after 1.5 seconds
    setTimeout(() => {
      const responses = [
        "Got it, thanks!",
        "Okay, I understand.",
        "Perfect! I'll take care of that.",
        "Sounds good!",
        "Great, thank you for letting me know.",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const responseMessage: Message = {
        id: chatMessages.length + 2,
        text: randomResponse,
        time: getCurrentTime(),
        sender: "other",
      };

      setChatMessages((prev) => [...prev, responseMessage]);
    }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          const newMessage: Message = {
            id: chatMessages.length + 1,
            type: "image",
            url: event.target.result,
            time: getCurrentTime(),
            sender: "me",
          };
          setChatMessages([...chatMessages, newMessage]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sendEmoji = (emoji: string) => {
    const newMessage: Message = {
      id: chatMessages.length + 1,
      text: emoji,
      time: getCurrentTime(),
      sender: "me",
    };
    setChatMessages([...chatMessages, newMessage]);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-full mx-auto">
      {activeView === "messages" ? (
        <>
          {/* Header */}
          <VendorNav />
          {/* Messages Header */}
          <div className="bg-white border-b border-gray-200">
            <h2 className="text-green-700 font-bold text-lg px-4 py-4">
              Messages
            </h2>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto bg-white">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => openChat(conv)}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {conv.name.charAt(0)}
                  </div>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conv.name}
                    </h3>
                    {conv.verified && (
                      <Check
                        className="text-green-600 flex-shrink-0"
                        size={14}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    {conv.verified && (
                      <Check size={12} className="text-gray-400" />
                    )}
                    <p className="truncate">{conv.message}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs ${
                      conv.unread > 0
                        ? "text-green-600 font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    {conv.time}
                  </span>
                  {conv.unread > 0 && (
                    <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Chat Header */}
          <div className="bg-green-700 text-white px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={backToMessages} className="p-1">
                <ArrowLeft size={24} />
              </button>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <User size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Customer care - Omotayo</h3>
                {/* <p className="text-xs text-green-100">Last Seen: Online</p>
                <p className="text-xs text-green-200 italic">Typing</p> */}
              </div>
              <button className="p-2" onClick={() => activeChat}>
                <Phone size={22} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.type === "image" ? (
                  <div className="max-w-xs">
                    <img
                      src={msg.url}
                      alt="Shared"
                      className="rounded-lg shadow-md"
                    />
                  </div>
                ) : msg.type === "voice" ? (
                  <div
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg shadow-sm ${
                      msg.sender === "me"
                        ? "bg-green-700 text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.sender === "me" ? "bg-white/20" : "bg-gray-200"
                      }`}
                    >
                      {msg.sender === "me" ? (
                        <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs">
                          U
                        </div>
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <div className="h-8 flex-1 bg-gray-300 rounded-full relative max-w-[200px]">
                      <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-xs">{msg.duration}</span>
                  </div>
                ) : (
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${
                      msg.sender === "me"
                        ? "bg-green-700 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span
                      className={`text-xs mt-1 block ${
                        msg.sender === "me" ? "text-green-100" : "text-gray-500"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {showEmojiPicker && (
              <div className="absolute bottom-20 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 mb-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">
                    Stickers & Emojis
                  </h3>
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2 max-w-xs">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => sendEmoji(emoji)}
                      className="text-3xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={sendMessage} className="flex items-center gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Write a message"
                className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Paperclip size={22} />
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Smile size={22} />
              </button>
              <button
                type="submit"
                className="p-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
              >
                {messageInput.trim() ? <Send size={20} /> : <Mic size={20} />}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
