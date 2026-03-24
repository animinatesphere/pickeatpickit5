// src/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  name?: string;
  role?: string;
}

export interface ConversationRaw {
  id: string;
  type: string;
  chat_metadata?: string;
  last_message_text: string | null;
  last_message_time: string | null;
  created_at: string;
  updated_at: string;
  participants: Participant[];
}

export interface Conversation {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: number;
  online: boolean;
  participantId?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  is_read: boolean;
  created_at: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

export async function fetchConversations(): Promise<ConversationRaw[]> {
  const res = await api.get("/chat/conversations");
  return res.data as ConversationRaw[];
}

export async function fetchMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const res = await api.get(`/chat/messages/${conversationId}`);
  return res.data as ChatMessage[];
}

export async function postMessage(
  conversationId: string,
  senderId: string,
  text: string,
): Promise<ChatMessage> {
  const res = await api.post("/chat/messages", {
    text,
    conversation_id: conversationId,
    sender_id: senderId,
  });
  return res.data as ChatMessage;
}

export async function getOrCreateConversation(
  recipientId: string,
): Promise<ConversationRaw> {
  const res = await api.post("/chat/get-or-create", {
    type: "direct",
    participant_ids: [recipientId],
    chat_metadata: "",
  });
  return res.data as ConversationRaw;
}

export async function searchUsers(phone: string): Promise<Participant[]> {
  const res = await api.get("/users/search", { params: { phone } });
  return res.data as Participant[];
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function otherParticipantName(
  conv: ConversationRaw,
  myId: string,
): { name: string; id: string } {
  const other = conv.participants.find((p) => p.id !== myId);
  return {
    name: other?.name ?? other?.role ?? "Unknown",
    id: other?.id ?? "",
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChat(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const raw = await fetchConversations();
      setConversations(
        raw.map((c) => {
          const other = otherParticipantName(c, userId);
          return {
            id: c.id,
            name: other.name,
            message: c.last_message_text ?? "No messages yet",
            time: formatTime(c.last_message_time),
            unread: 0,
            online: true,
            participantId: other.id,
          };
        }),
      );
    } catch {
      /* silent */
    }
  }, [userId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const msgs = await fetchMessages(convId);
      setMessages(msgs);
    } catch {
      /* silent */
    }
  }, []);

  // Poll for new messages in the active chat
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeChatId) return;

    loadMessages(activeChatId);

    pollRef.current = setInterval(() => {
      loadMessages(activeChatId);
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeChatId, loadMessages]);

  // Initial load
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    loadConversations().finally(() => setLoading(false));
  }, [userId, loadConversations]);

  const openChat = useCallback((conv: Conversation) => {
    setActiveChatId(conv.id);
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c)),
    );
  }, []);

  const startChat = useCallback(
    async (
      recipientId: string,
      recipientName: string,
    ): Promise<Conversation | null> => {
      if (!userId) return null;
      try {
        const conv = await getOrCreateConversation(recipientId);
        const formatted: Conversation = {
          id: conv.id,
          name: recipientName,
          message: conv.last_message_text ?? "Say hello!",
          time: formatTime(conv.last_message_time),
          unread: 0,
          online: true,
          participantId: recipientId,
        };
        setConversations((prev) =>
          prev.find((c) => c.id === conv.id) ? prev : [formatted, ...prev],
        );
        setActiveChatId(conv.id);
        return formatted;
      } catch {
        return null;
      }
    },
    [userId],
  );

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      if (!activeChatId || !userId || !text.trim()) return;
      setSending(true);
      try {
        const msg = await postMessage(activeChatId, userId, text);
        setMessages((prev) => [...prev, msg]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? { ...c, message: text, time: formatTime(msg.created_at) }
              : c,
          ),
        );
      } catch {
        /* silent */
      } finally {
        setSending(false);
      }
    },
    [activeChatId, userId],
  );

  const activeConversation =
    conversations.find((c) => c.id === activeChatId) ?? null;

  return {
    conversations,
    messages,
    activeConversation,
    activeChatId,
    loading,
    sending,
    openChat,
    startChat,
    sendMessage,
    loadConversations,
  };
}
