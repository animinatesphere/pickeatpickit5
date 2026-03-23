import axios from "axios";
import { supabase } from "./authService";

// const API_BASE_URL = 'http://localhost:8000/api';
const API_BASE_URL =
  "https://smoggy-alexandrina-justboj-92783a09.koyeb.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add Bearer token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (set by backendAuthService)
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");

      // Optionally redirect to login page
      // window.location.href = '/vendor-login';
    }
    return Promise.reject(error);
  },
);

// Authentication
export const registerUser = (userData) => api.post("/auth/register", userData);
export const sendOTP = (email) => api.post("/auth/send-otp", { email });
export const verifyOTP = (otpData) => api.post("/auth/verify-otp", otpData);
export const updateProfile = (data) => api.patch("/auth/profile", data);

// Payment Management
export const initializePayment = (paymentData) =>
  api.post("/payments/initialize", paymentData);
export const verifyPayment = (reference) =>
  api.post(`/payments/verify/${reference}`);
export const getMyPayments = () => api.get("/payments/my-payments");

// Vendor Management
export const registerVendor = (vendorData) => api.post("/vendors/", vendorData);
export const getVendors = (status) =>
  api.get("/vendors/", { params: { status } });
export const getVendorById = (id) => api.get(`/vendors/${id}`);
export const updateVendor = (id, updates) =>
  api.patch(`/vendors/${id}`, updates);

// Menu Management
export const addMenuItem = (itemData) => api.post("/menu/", itemData);
export const createMenuItem = (itemData) => api.post("/menu/", itemData); // Keep for compatibility if needed
export const getMenuItems = (vendorId) =>
  api.get("/menu/", { params: { vendor_id: vendorId } });
export const getMenuItemById = (id) => api.get(`/menu/${id}`);
export const updateMenuItem = (id, updates) => api.put(`/menu/${id}`, updates);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

// Order Management
export const createOrder = (orderData) => api.post("/orders/", orderData);
export const getOrders = (params) => api.get("/orders/", { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, updates) =>
  api.patch(`/orders/${id}`, updates);

// Vendor Dashboard & Management
export const getVendorDashboardStats = () =>
  api.get("/vendors/dashboard-stats");
export const getVendorProfile = (vendorId) => api.get(`/vendors/${vendorId}`);
export const updateVendorProfile = (vendorId, updates) =>
  api.patch(`/vendors/${vendorId}`, updates);

// Vendor Order Management (Backend)
export const getVendorOrdersBackend = (vendorId) =>
  api.get("/orders/", { params: { vendor_id: vendorId } });
export const getVendorOrderTracking = (orderId) =>
  api.get(`/orders/${orderId}/tracking`);
export const addOrderTrackingUpdate = (orderId, trackingData) =>
  api.post(`/orders/${orderId}/tracking`, trackingData);

// --- VENDOR SYSTEM (SUPABASE) ---

export const getVendorOrders = async (vendorId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        menu_items!order_items_menu_item_id_fkey (*)
      ),
      riders!orders_rider_id_fkey (*)
    `,
    )
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  return { data, error };
};

export const uploadMenuImage = async (file, vendorId) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/menu/upload-image?vendor_id=${vendorId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (response.data && response.data.success) {
      return { data: response.data.url, error: null };
    } else {
      return {
        data: null,
        error: new Error(
          "Upload failed: " + (response.data?.detail || "Unknown error"),
        ),
      };
    }
  } catch (error) {
    return {
      data: null,
      error: new Error(
        error.response?.data?.detail ||
          error.message ||
          "Failed to upload image",
      ),
    };
  }
};

// Health Check
export const checkHealth = () => api.get("/health");

// --- USER & PROFILE (SUPABASE) ---

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId);
  return { data: data?.[0] || null, error };
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("user_id", userId)
    .select();
  return { data, error };
};

export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return { data, error };
};

export const createUserProfileIfNotExists = async (
  userId,
  userEmail,
  userData,
) => {
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return { data: existing, error: null };

  const { data: newUser, error } = await supabase
    .from("users")
    .insert([
      {
        user_id: userId,
        email: userEmail,
        firstname: userData?.firstname || "",
        lastname: userData?.lastname || "",
        phone: userData?.phone || "",
      },
    ])
    .select()
    .single();
  return { data: newUser, error };
};

export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const getOrderDetails = async (orderId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items(*, menu_items(*))`)
    .eq("id", orderId)
    .maybeSingle();
  return { data, error };
};

// --- TRACKING (SUPABASE) ---

export const getOrderTracking = async (orderId) => {
  const { data, error } = await supabase
    .from("order_status_updates")
    .select("*")
    .eq("order_id", orderId)
    .order("timestamp", { ascending: true });
  return { data, error };
};

export const addTrackingUpdate = async (orderId, trackingData) => {
  const { data, error } = await supabase
    .from("order_status_updates")
    .insert([{ order_id: orderId, ...trackingData }])
    .select();
  return { data, error };
};

// --- CHAT SYSTEM (SUPABASE) ---

export const getConversations = async (userId) => {
  const { data: participantData, error: partError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  if (partError || !participantData || participantData.length === 0) {
    return { data: [], error: partError };
  }

  const convIds = participantData.map((p) => p.conversation_id);

  const { data: convData, error: convError } = await supabase
    .from("conversations")
    .select(
      "id, updated_at, last_message_text, last_message_time, type, metadata",
    )
    .in("id", convIds)
    .order("updated_at", { ascending: false });

  if (convError) return { data: [], error: convError };

  const formatted = (convData || []).map((conv) => ({
    conversation_id: conv.id,
    conversations: conv,
  }));

  return { data: formatted, error: null };
};

export const getConversationWithParticipantNames = async (userId) => {
  const { data: participantData, error: partError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  if (partError || !participantData || participantData.length === 0) {
    return { data: [], error: partError };
  }

  const convIds = participantData.map((p) => p.conversation_id);

  const { data: convData, error: convError } = await supabase
    .from("conversations")
    .select(
      "id, updated_at, last_message_text, last_message_time, type, metadata",
    )
    .in("id", convIds)
    .order("updated_at", { ascending: false });

  if (convError) return { data: [], error: convError };

  const enriched = await Promise.all(
    (convData || []).map(async (conv) => {
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conv.id);

      const otherUserId = participants?.find(
        (p) => p.user_id !== userId,
      )?.user_id;

      let otherName = "Unknown";

      if (otherUserId) {
        const { data: user } = await supabase
          .from("users")
          .select("firstname, lastname")
          .eq("user_id", otherUserId)
          .maybeSingle();

        if (user) {
          otherName = `${user.firstname} ${user.lastname}`.trim();
        } else {
          const { data: vendor } = await supabase
            .from("vendors")
            .select("business_name")
            .eq("id", otherUserId)
            .maybeSingle();

          if (vendor) {
            otherName = vendor.business_name;
          } else {
            const { data: rider } = await supabase
              .from("riders")
              .select("firstname, lastname")
              .eq("id", otherUserId)
              .maybeSingle();

            if (rider) {
              otherName = `${rider.firstname} ${rider.lastname}`.trim();
            }
          }
        }
      }

      return {
        conversation_id: conv.id,
        conversations: conv,
        otherName,
      };
    }),
  );

  return { data: enriched, error: null };
};

export const getMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return { data, error };
};

export const sendMessage = async (
  conversationId,
  senderId,
  content,
  type = "text",
  url,
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      type,
      url,
    })
    .select()
    .single();
  return { data, error };
};

export const createConversation = async (
  participants,
  type = "direct",
  metadata = {},
) => {
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({ type, metadata })
    .select()
    .single();

  if (convError) return { data: null, error: convError };

  const participantData = participants.map((userId) => ({
    conversation_id: conversation.id,
    user_id: userId,
  }));

  const { error: partError } = await supabase
    .from("conversation_participants")
    .insert(participantData);

  return { data: conversation, error: partError };
};

export const subscribeToMessages = (conversationId, callback) => {
  const channelName =
    conversationId === "all" ? "messages-all" : `messages:${conversationId}`;
  const filter =
    conversationId === "all" ? "*" : `conversation_id=eq.${conversationId}`;

  return supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter,
      },
      callback,
    )
    .subscribe();
};

export const removeSupabaseChannel = (channel) => {
  return supabase.removeChannel(channel);
};

export const startDirectConversation = async (userId, recipientId) => {
  const { data, error } = await supabase.rpc(
    "find_or_create_direct_conversation",
    {
      user_a: userId,
      user_b: recipientId,
    },
  );

  if (error) return { data: null, error };

  return {
    data: {
      id: data,
      last_message_text: null,
      last_message_time: null,
    },
    error: null,
  };
};

export const searchUserByPhone = async (phoneQuery) => {
  const { data, error } = await supabase.rpc("search_user_by_phone", {
    phone_query: phoneQuery,
  });
  return { data, error };
};

// --- MISC SUPABASE ENDPOINTS (PENDING MIGRATION) ---

export const getAllSystemUsers = async () => {
  const { data: clients } = await supabase.from("users").select("*");
  const { data: vendors } = await supabase.from("vendors").select("*");
  const { data: riders } = await supabase.from("riders").select("*");

  const combined = [
    ...(clients || []).map((u) => ({
      ...u,
      type: "Client",
      name: `${u.firstname} ${u.lastname}`,
    })),
    ...(vendors || []).map((v) => ({
      ...v,
      type: "Vendor",
      name: v.business_name || v.firstname,
    })),
    ...(riders || []).map((r) => ({
      ...r,
      type: "Rider",
      name: `${r.firstname} ${r.lastname}`,
    })),
  ];

  return combined;
};

export const riderAcceptOrder = async (orderId) => {
  return api.post(`/riders/accept-order/${orderId}`);
};

export const riderRejectOrder = async (orderId) => {
  return api.post(`/riders/reject-order/${orderId}`);
};

export const getAvailableDeliveries = async () => {
  return api.get("/riders/available-orders");
};

export const getRiderOrders = async (riderId) => {
  return api.get("/riders/orders");
};

export const getRiderStats = async (riderId) => {
  const response = await api.get("/riders/dashboard-stats");
  return response.data;
};

export const getRiderTransactions = async (riderId) => {
  return api.get("/riders/transactions");
};

export const getRiderBankInfo = async (riderId) => {
  return api.get("/riders/bank-info");
};

export const saveRiderBankInfo = async (riderId, bankInfo) => {
  return api.post("/riders/bank-info", bankInfo);
};

export const getRiderEarningsHistory = async (riderId) => {
  return api.get("/riders/earnings-history");
};

export const updateRiderStatus = async (riderId, status) => {
  return api.patch("/riders/status", null, {
    params: { is_active: status === "active" },
  });
};

export const updateRiderOrderStatus = async (orderId, status) => {
  return api.patch(`/riders/orders/${orderId}/status`, null, {
    params: { status },
  });
};

export const getRiderProfile = async () => {
  return api.get("/riders/profile");
};

export const updateRiderProfile = async (updates) => {
  return api.patch("/riders/profile", updates);
};

// --- ADMIN SYSTEM (SUPABASE) ---

export const getAdminStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: orders } = await supabase
    .from("orders")
    .select("status, total_amount, created_at");

  const stats = {
    activeOrders:
      orders?.filter((o) =>
        ["preparing", "accepted", "picked_up"].includes(o.status),
      ).length || 0,
    completedOrders:
      orders?.filter((o) => o.status === "completed").length || 0,
    canceledOrders: orders?.filter((o) => o.status === "cancelled").length || 0,
    todayEarnings:
      orders
        ?.filter((o) => {
          const orderDate = new Date(o.created_at);
          return orderDate >= today && o.status === "completed";
        })
        .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
    pendingApprovals: 0,
  };

  const { count: pendingRiders } = await supabase
    .from("riders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  stats.pendingApprovals = pendingRiders || 0;

  const { count: clients } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });
  const { count: vendors } = await supabase
    .from("vendors")
    .select("*", { count: "exact", head: true });
  const { count: riders } = await supabase
    .from("riders")
    .select("*", { count: "exact", head: true });

  return {
    ...stats,
    userCounts: {
      clients: clients || 0,
      vendors: vendors || 0,
      riders: riders || 0,
      total: (clients || 0) + (vendors || 0) + (riders || 0),
    },
  };
};

export const deleteUserFromSystem = async (id, type) => {
  const table =
    type === "Client" ? "users" : type === "Vendor" ? "vendors" : "riders";
  const { error } = await supabase.from(table).delete().eq("id", id);
  return { error };
};

export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, users (firstname, lastname), vendors (business_name)")
    .order("created_at", { ascending: false });
  return { data, error };
};

export const getAdminOrderDetails = async (orderId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `*, users (firstname, lastname, email, phone, address, city, state), vendors (business_name, business_address, business_phone), riders (firstname, lastname, phone), order_items (id, quantity, price, menu_items (name))`,
    )
    .eq("id", orderId)
    .single();
  return { data, error };
};

export const getRevenueAnalytics = async (period) => {
  const now = new Date();
  let startDate = new Date();
  switch (period) {
    case "D":
      startDate.setDate(now.getDate() - 1);
      break;
    case "W":
      startDate.setDate(now.getDate() - 7);
      break;
    case "M":
      startDate.setDate(now.getDate() - 30);
      break;
    case "Y":
      startDate.setDate(now.getDate() - 365);
      break;
  }
  const { data, error } = await supabase
    .from("orders")
    .select("total_amount, created_at, status")
    .eq("status", "completed")
    .gte("created_at", startDate.toISOString());
  return { data, error };
};

export const getTopUsers = async (limit = 5) => {
  const { data, error } = await supabase
    .from("orders")
    .select("user_id, users(firstname, lastname)")
    .eq("status", "completed");
  if (error) return { data: null, error };
  const counts = {};
  data.forEach((order) => {
    const id = order.user_id;
    if (!counts[id]) {
      counts[id] = {
        name: order.users
          ? `${order.users.firstname} ${order.users.lastname}`
          : "Unknown",
        orders: 0,
      };
    }
    counts[id].orders++;
  });
  return {
    data: Object.values(counts)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, limit),
    error: null,
  };
};

export const getPopularItems = async (limit = 3) => {
  const { data, error } = await supabase
    .from("order_items")
    .select("menu_item_id, menu_items(name, category)")
    .order("created_at", { ascending: false });
  if (error) return { data: null, error };
  const counts = {};
  data.forEach((item) => {
    const id = item.menu_item_id;
    if (!id) return;
    if (!counts[id]) {
      counts[id] = {
        name: item.menu_items?.name || "Unknown",
        category: item.menu_items?.category || "General",
        count: 0,
      };
    }
    counts[id].count++;
  });
  return {
    data: Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit),
    error: null,
  };
};

export const getAllTransactions = async () => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
};

export const getPayoutRequests = async () => {
  const { data, error } = await supabase
    .from("payout_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
};

export const updatePayoutStatus = async (payoutId, status) => {
  const { data, error } = await supabase
    .from("payout_requests")
    .update({ status, updated_at: new Date() })
    .eq("id", payoutId)
    .select();
  return { data, error };
};

export const getPlatformTotals = async () => {
  const { data: orders } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "completed");
  const totalEarnings =
    orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
  const { data: pendingPayouts } = await supabase
    .from("payout_requests")
    .select("amount")
    .eq("status", "pending");
  const totalPendingPayouts =
    pendingPayouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  return { totalEarnings, totalPendingPayouts };
};

export const getAdminUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, firstname, lastname, avatar_url")
    .order("created_at", { ascending: false });
  return { data, error };
};

export const getAdminVendors = async () => {
  const { data, error } = await supabase
    .from("vendors")
    .select("id, business_name, avatar_url")
    .order("created_at", { ascending: false });
  return { data, error };
};

export const getAdminRiders = async () => {
  const { data, error } = await supabase
    .from("riders")
    .select("id, firstname, lastname, avatar_url")
    .order("created_at", { ascending: false });
  return { data, error };
};

export default api;
