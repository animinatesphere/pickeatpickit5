/* eslint-disable @typescript-eslint/no-unused-vars */
// src/services/api.ts
// All calls go to the FastAPI backend. No Supabase.
import axios, { type AxiosError } from "axios";

const API_BASE_URL = "http://localhost:8000/api"; // For local development
// const API_BASE_URL = "https://pickeatpickitbe.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

type AdminRefreshResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role?: string;
    firstname?: string | null;
    lastname?: string | null;
  };
};

type RetryableRequestConfig = NonNullable<AxiosError["config"]> & {
  _retry?: boolean;
};

let adminSessionRefreshPromise: Promise<string | null> | null = null;

export const clearAdminSession = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");
};

export const confirmAdminSession = (): Promise<string | null> => {
  if (adminSessionRefreshPromise) return adminSessionRefreshPromise;

  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return Promise.resolve(null);

  adminSessionRefreshPromise = axios
    .post<AdminRefreshResponse>(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    })
    .then(({ data }) => {
      if (!data.access_token || data.user?.role !== "admin") {
        clearAdminSession();
        throw new Error("Refreshed session does not have admin access");
      }
      localStorage.setItem("authToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token || refreshToken);
      localStorage.setItem("userData", JSON.stringify(data.user));
      return data.access_token;
    })
    .catch((error: unknown) => {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 422)
      ) {
        clearAdminSession();
      }
      throw error;
    })
    .finally(() => {
      adminSessionRefreshPromise = null;
    });

  return adminSessionRefreshPromise;
};

// ─── Auth interceptors ────────────────────────────────────────────────────────

api.interceptors.request.use(
  async (config) => {
    if (adminSessionRefreshPromise && !config.url?.includes("/auth/refresh")) {
      await adminSessionRefreshPromise;
    }
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;
      try {
        const token = await confirmAdminSession();
        if (!token) throw new Error("No refresh token available");
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Invalid refresh credentials clear storage inside confirmAdminSession.
        // Keep a still-usable local session on temporary network/server failure.
        if (!localStorage.getItem("authToken") || !localStorage.getItem("refreshToken")) {
          clearAdminSession();
          if (window.location.pathname.startsWith("/admin-dashboard")) {
            window.location.assign("/admin-login");
          }
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  menu_item_id: string;
  quantity: number;
  price: number;
  name?: string;
}

export interface OrderPayload {
  vendor_id: string;
  delivery_address?: string;
  notes?: string;
  promo_code?: string;
  items?: OrderItem[];
}

export interface TrackingData {
  status: string;
  message?: string;
  location?: string;
}

export interface ConversationRow {
  id: string;
  updated_at: string;
  last_message_text: string | null;
  last_message_time: string | null;
  type: string;
  metadata: Record<string, unknown>;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
}

export interface MessagePayload {
  content: string;
  type?: string;
  url?: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAdminStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

export const getAllSystemUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

export const getPendingVendors = () => api.get("/admin/vendors/pending");
export const getAdminVendorDetails = (vendorId: string) =>
  api.get(`/admin/vendors/${vendorId}`);
export const getAdminRiderDetails = (riderId: string) =>
  api.get(`/admin/riders/${riderId}`);

export const updateVendorStatus = async (vendorId: string, status: string) =>
  api.patch(`/admin/vendors/${vendorId}/status`, null, { params: { status } });

export const getAdminUsers = async () => {
  const res = await api.get("/admin/users");
  return { data: res.data, error: null };
};

export const getAdminVendors = async () => {
  const res = await api.get("/admin/vendors");
  return { data: res.data, error: null };
};

export const getAdminRiders = async () => {
  const res = await api.get("/admin/riders");
  return { data: res.data, error: null };
};

export const getAllOrders = async () => {
  const res = await api.get("/admin/orders");
  return { data: res.data, error: null };
};

export const getAdminOrderDetails = async (orderId: string | number) => {
  const res = await api.get(`/admin/orders/${orderId}`);
  return { data: res.data, error: null };
};

export const getRevenueAnalytics = async (period: string) => {
  const res = await api.get("/admin/analytics/revenue", { params: { period } });
  return { data: res.data, error: null };
};

export const getTopUsers = async (limit = 5) => {
  const res = await api.get("/admin/analytics/top-users", { params: { limit } });
  return { data: res.data, error: null };
};

export const getPopularItems = async (limit = 3) => {
  const res = await api.get("/admin/analytics/popular-items", { params: { limit } });
  return { data: res.data, error: null };
};

export const getAllTransactions = async () => {
  const res = await api.get("/admin/transactions");
  return { data: res.data, error: null };
};

export const getPayoutRequests = async () => {
  const res = await api.get("/admin/payouts");
  return { data: res.data, error: null };
};

export const updatePayoutStatus = async (
  payoutId: string | number,
  status: string,
) => {
  const res = await api.patch(`/admin/payouts/${payoutId}`, { status });
  return { data: res.data, error: null };
};

export const getPlatformTotals = async () => {
  const res = await api.get("/admin/balance");
  return res.data;
};

export const deleteUserFromSystem = async (
  id: string | number,
  _type?: string,
) => {
  const res = await api.delete(`/admin/users/${id}`);
  return { error: res.status >= 400 ? new Error("Delete failed") : null };
};

export const getAdminAccounts = () => api.get("/admin/accounts");
export const createAdminAccount = (payload: Record<string, unknown>) =>
  api.post("/admin/accounts", payload);
export const updateAdminAccount = (
  id: string,
  payload: Record<string, unknown>,
) => api.put(`/admin/accounts/${id}`, payload);
export const deleteAdminAccount = (id: string) =>
  api.delete(`/admin/accounts/${id}`);
export const resetAdminAccountPassword = (id: string) =>
  api.post(`/admin/accounts/${id}/reset-password`);
export const getMyAdminAccount = () => api.get("/admin/account/me");
export const updateMyAdminAccount = (payload: Record<string, unknown>) =>
  api.patch("/admin/account/me", payload);
export const changeMyAdminPassword = (payload: {
  old_password: string;
  new_password: string;
}) => api.post("/admin/account/me/change-password", payload);

export const getSystemBalance = () => api.get("/admin/balance");
export const getPendingRiders = () => api.get("/admin/riders/pending");
export const getPendingNameChanges = () =>
  api.get("/admin/vendors/pending-name-changes");
export const updateAdminRiderStatus = (riderId: string, status: string) =>
  api.patch(`/admin/riders/${riderId}/status`, null, { params: { status } });
export const approveVendorName = (vendorId: string) =>
  api.patch(`/admin/vendors/${vendorId}/approve-name`);
export const rejectVendorName = (vendorId: string) =>
  api.patch(`/admin/vendors/${vendorId}/reject-name`);
export const updateVendorLogo = (vendorId: string, logo_url: string) =>
  api.patch(`/admin/vendors/${vendorId}/logo`, { logo_url });
export const deleteVendorLogo = (vendorId: string) =>
  api.delete(`/admin/vendors/${vendorId}/logo`);
export const updateMenuItemImage = (menuItemId: string, image_url: string) =>
  api.patch(`/admin/menu-items/${menuItemId}/image`, { image_url });
export const deleteMenuItemImage = (menuItemId: string) =>
  api.delete(`/admin/menu-items/${menuItemId}/image`);
export const getAdminVendorMenuItems = (vendorId: string) =>
  api.get(`/admin/vendors/${vendorId}/menu-items`);
export const updateAdminMenuItem = (
  menuItemId: string,
  payload: Record<string, unknown>,
) => api.put(`/admin/menu-items/${menuItemId}`, payload);
export const deleteAdminMenuItem = (menuItemId: string) =>
  api.delete(`/admin/menu-items/${menuItemId}`);
export const uploadAdminVendorLogo = (vendorId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/admin/vendors/${vendorId}/logo/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const uploadAdminMenuItemImage = (menuItemId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/admin/menu-items/${menuItemId}/image/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getSystemSettings = () => api.get("/system/settings");
export const createSystemSetting = (payload: Record<string, unknown>) =>
  api.post("/system/settings", payload);
export const updateSystemSetting = (
  key: string,
  payload: Record<string, unknown>,
) => api.patch(`/system/settings/${encodeURIComponent(key)}`, payload);
export const deleteSystemSetting = (key: string) =>
  api.delete(`/system/settings/${encodeURIComponent(key)}`);

export const getPromoCodes = () => api.get("/system/promo-codes");
export const createPromoCode = (payload: Record<string, unknown>) =>
  api.post("/system/promo-codes", payload);
export const updatePromoCode = (
  id: string,
  payload: Record<string, unknown>,
) => api.patch(`/system/promo-codes/${id}`, payload);
export const deletePromoCode = (id: string) =>
  api.delete(`/system/promo-codes/${id}`);

export const getDiscoveryFilters = () => api.get("/system/filters");
export const createDiscoveryFilter = (payload: Record<string, unknown>) =>
  api.post("/system/filters", payload);
export const updateDiscoveryFilter = (
  id: string,
  payload: Record<string, unknown>,
) => api.patch(`/system/filters/${id}`, payload);
export const deleteDiscoveryFilter = (id: string) =>
  api.delete(`/system/filters/${id}`);

export const createRiderGame = (payload: Record<string, unknown>) =>
  api.post("/games/", payload);
export const getAdminRiderGames = () => api.get("/games/");
export const updateRiderGame = (
  id: string,
  payload: Record<string, unknown>,
) => api.patch(`/games/${id}`, payload);
export const deleteRiderGame = (id: string) => api.delete(`/games/${id}`);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerUser = (userData: Record<string, unknown>) =>
  api.post("/auth/register", userData);

export const sendOTP = (email: string) => api.post("/auth/send-otp", { email });

export const verifyOTP = (otpData: { email: string; otp_code: string }) =>
  api.post("/auth/verify-otp", otpData);

export const updateProfile = (data: Record<string, unknown>) =>
  api.patch("/auth/profile", data);

// ─── Payments ─────────────────────────────────────────────────────────────────

export const initializePayment = (paymentData: Record<string, unknown>) =>
  api.post("/payments/initialize", paymentData);

export const verifyPayment = (reference: string) =>
  api.post(`/payments/verify/${reference}`);

export const getMyPayments = () => api.get("/payments/my-payments");

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const registerVendor = (vendorData: Record<string, unknown>) =>
  api.post("/vendors/", vendorData);

export const getVendors = (status?: string) =>
  api.get("/vendors/", { params: { status } });

export const getVendorById = (id: string | number) => api.get(`/vendors/${id}`);

export const updateVendor = (
  id: string | number,
  updates: Record<string, unknown>,
) => api.patch(`/vendors/${id}`, updates);

export const getVendorDashboardStats = () =>
  api.get("/vendors/dashboard-stats");

export const getVendorProfile = (vendorId: string | number) =>
  api.get(`/vendors/${vendorId}`);

export const updateVendorProfile = (
  vendorId: string | number,
  updates: Record<string, unknown>,
) => api.patch(`/vendors/${vendorId}`, updates);

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const addMenuItem = (itemData: Record<string, unknown>) =>
  api.post("/menu/", itemData);

export const createMenuItem = (itemData: Record<string, unknown>) =>
  api.post("/menu/", itemData);

export const getMenuItems = (vendorId: string | number) =>
  api.get("/menu/", { params: { vendor_id: vendorId } });

export const getMenuItemById = (id: string | number) => api.get(`/menu/${id}`);

export const updateMenuItem = (
  id: string | number,
  updates: Record<string, unknown>,
) => api.put(`/menu/${id}`, updates);

export const deleteMenuItem = (id: string | number) =>
  api.delete(`/menu/${id}`);

export const uploadMenuImage = async (
  file: File,
  vendorId: string | number,
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(
      `/menu/upload-image?vendor_id=${vendorId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    if (res.data?.success) return { data: res.data.url as string, error: null };
    return {
      data: null,
      error: new Error(
        "Upload failed: " +
          ((res.data as { detail?: string })?.detail ?? "Unknown error"),
      ),
    };
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { detail?: string } };
      message?: string;
    };
    return {
      data: null,
      error: new Error(
        err.response?.data?.detail ?? err.message ?? "Failed to upload image",
      ),
    };
  }
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const createOrder = (
  orderData: OrderPayload,
  orderItems?: OrderItem[],
) => {
  const payload = { ...orderData, items: orderItems };
  return api.post("/orders/", payload);
};

export const getOrders = (params: Record<string, unknown>) =>
  api.get("/orders/", { params });

export const getOrderById = (id: string | number) => api.get(`/orders/${id}`);

export const updateOrderStatus = (
  id: string | number,
  updates: Record<string, unknown>,
) => api.patch(`/orders/${id}`, updates);

export const getOrderDetails = async (orderId: string | number) => {
  const res = await api.get(`/orders/${orderId}`);
  return { data: res.data, error: null };
};

export const getUserOrders = async (userId: string) => {
  const res = await api.get("/customer/orders", {
    params: { user_id: userId },
  });
  return { data: res.data, error: null };
};

// ─── Order tracking ───────────────────────────────────────────────────────────

export const getVendorOrdersBackend = (vendorId: string | number) =>
  api.get("/orders/", { params: { vendor_id: vendorId } });

export const getVendorOrderTracking = (orderId: string | number) =>
  api.get(`/orders/${orderId}/tracking`);

export const addOrderTrackingUpdate = (
  orderId: string | number,
  trackingData: TrackingData,
) => api.post(`/orders/${orderId}/tracking`, trackingData);

export const getOrderTracking = async (orderId: string | number) => {
  const res = await api.get(`/orders/${orderId}/tracking`);
  return { data: res.data, error: null };
};

export const addTrackingUpdate = async (
  orderId: string | number,
  trackingData: TrackingData,
) => {
  const res = await api.post(`/orders/${orderId}/tracking`, trackingData);
  return { data: res.data, error: null };
};

// Alias kept for call-site compat
export const getVendorOrders = async (vendorId: string | number) => {
  const res = await api.get("/orders/", { params: { vendor_id: vendorId } });
  return { data: res.data, error: null };
};

// ─── Riders ───────────────────────────────────────────────────────────────────

export const riderAcceptOrder = (orderId: string | number) =>
  api.post(`/riders/accept-orders/${orderId}`);

export const riderRejectOrder = (orderId: string | number) =>
  api.post(`/riders/reject-orders/${orderId}`);

export const getAvailableDeliveries = () => api.get("/riders/available-orders");

export const getRiderOrders = () => api.get("/riders/orders");

export const getRiderStats = async () => {
  const res = await api.get("/riders/dashboard-stats");
  return res.data;
};

export const getRiderTransactions = async () => {
  const res = await api.get("/riders/earnings-history");
  return { data: Array.isArray(res.data) ? res.data : [] };
};

export const getRiderBankInfo = async () => {
  try {
    const res = await api.get("/riders/bank-info");
    return { data: res.data };
  } catch {
    return { data: null };
  }
};

export const saveRiderBankInfo = async (bankInfo: Record<string, unknown>) => {
  const res = await api.post("/riders/bank-info", bankInfo);
  return { data: res.data };
};

export const getRiderEarningsHistory = async () => {
  const res = await api.get("/riders/earnings-history");
  return { data: Array.isArray(res.data) ? res.data : [] };
};

export const updateRiderStatus = (_riderId: string, status: string) =>
  api.patch("/riders/status", null, {
    params: { is_active: status === "active" },
  });

export const updateRiderOrderStatus = (
  orderId: string | number,
  status: string,
) =>
  api.patch(`/riders/orders/${orderId}/status`, null, { params: { status } });

export const getRiderProfile = () => api.get("/riders/profile");

export const updateRiderProfile = (updates: Record<string, unknown>) =>
  api.patch("/riders/profile", updates);

// ─── User profile ─────────────────────────────────────────────────────────────

export const getUserProfile = async (userId: string) => {
  const res = await api.get(`/users/${userId}`);
  return { data: res.data, error: null };
};

export const updateUserProfile = async (
  userId: string,
  updates: Record<string, unknown>,
) => {
  const res = await api.patch(`/users/${userId}`, updates);
  return { data: res.data, error: null };
};

export const getUserById = async (id: string | number) => {
  const res = await api.get(`/users/${id}`);
  return { data: res.data, error: null };
};

export const createUserProfileIfNotExists = async (
  _: string,
  __: string,
  ___: Record<string, unknown>,
) => {
  // Profile is created automatically on registration via the backend.
  // This stub exists for call-site compatibility.
  return { data: null, error: null };
};

// ─── Chat / Conversations ─────────────────────────────────────────────────────

export const getConversations = async (userId: string) => {
  const res = await api.get("/chat/conversations", {
    params: { user_id: userId },
  });
  return { data: res.data, error: null };
};

export const getConversationWithParticipantNames = async (userId: string) => {
  const res = await api.get("/chat/conversations", {
    params: { user_id: userId, include_names: true },
  });
  return { data: res.data, error: null };
};

export const getMessages = async (conversationId: string) => {
  const res = await api.get(`/chat/conversations/${conversationId}/messages`);
  return { data: res.data, error: null };
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  type: string = "text",
  url?: string,
) => {
  const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
    sender_id: senderId,
    content,
    type,
    url,
  });
  return { data: res.data, error: null };
};

export const createConversation = async (
  participants: string[],
  type: string = "direct",
  metadata: Record<string, unknown> = {},
) => {
  const res = await api.post("/chat/conversations", {
    participants,
    type,
    metadata,
  });
  return { data: res.data, error: null };
};

export const startDirectConversation = async (
  userId: string,
  recipientId: string,
) => {
  const res = await api.post("/chat/conversations/direct", {
    user_a: userId,
    user_b: recipientId,
  });
  return { data: res.data, error: null };
};

export const searchUserByPhone = async (phoneQuery: string) => {
  const res = await api.get("/users/search", {
    params: { phone: phoneQuery },
  });
  return { data: res.data, error: null };
};

/**
 * Real-time message subscription.
 * Supabase channels are no longer available — poll or use a WebSocket
 * endpoint from your backend instead. This stub returns an unsubscribe
 * no-op so existing call sites don't break.
 */
export const subscribeToMessages = (
  _: string,
  __: (payload: unknown) => void,
) => {
  // TODO: replace with backend WebSocket / SSE when available
  return { unsubscribe: () => undefined };
};

export const removeSupabaseChannel = (channel: { unsubscribe: () => void }) => {
  channel.unsubscribe();
};

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const checkHealth = () => api.get("/health");

export default api;
