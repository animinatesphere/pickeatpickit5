import api from "./api";
import { APIError } from "./authService";

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VendorData {
  id: string;
  business_name: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  status: string;
}

export interface UserData {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  is_verified: boolean;
  role: string;
  vendor_id?: string;
  rider_id?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserData;
  vendor?: VendorData;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phone: string;
  user_type?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    user_id?: string;
  };
}

export interface OTPRequest {
  email: string;
}

export interface OTPVerify {
  email: string;
  otp_code: string;
}

export interface JwtPayload {
  sub: string;
  user_id: string;
  email: string;
  role: string;
  firstname?: string;
  lastname?: string;
  vendor_id?: string;
  rider_id?: string;
  business_name?: string;
  exp: number;
}

export interface MenuItem {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  discount: number;
  is_available: boolean;
  vendor_name: string;
}

// In the Vendor interface, add this field:
export interface Vendor {
  id: string;
  vendor_id: string;
  business_name: string | null;
  business_description: string | null;
  business_address: string | null;
  business_phone: string | null;
  logo_url: string | null;
  cover_url: string | null;
  business_category: string | null;
  is_open: boolean;
  status: string;
  accept_cod: boolean; // ← add this
}

export interface FavoriteVendor {
  vendor_id: string;
}

export interface VendorRegistrationPayload {
  user_id: string;
  business_name?: string;
  business_email?: string;
  business_phone?: string;
  business_address?: string;
  business_description?: string;
  full_name?: string;
  how_to_address?: string;
  years_of_experience?: string;
  country_name?: string;
  profession?: string;
  vendor_type?: string;
  work_alone?: string;
  membership_id?: string;
  day_from?: string;
  day_to?: string;
  holidays_available?: boolean;
  opening_time?: string;
  closing_time?: string;
  total_workers?: number;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  accept_cod?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export interface VendorRegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    id?: string;
    vendor_id?: string;
    [key: string]: string | undefined;
  };
}

export interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderTracking {
  id: string;
  status: string;
  timestamp: string;
  message: string;
}

export interface PaymentData {
  order_id: string;
  amount: number;
  email: string;
  callback_url?: string;
}

export interface PaymentResponse {
  authorization_url: string;
  reference: string;
}

export interface PaymentVerification {
  status: string;
  reference: string;
  amount: number;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  status: string;
  reference: string;
  created_at: string;
}

export interface PromoCodeValidation {
  valid: boolean;
  code: string;
  discount_type: string;
  discount_value: number;
  message?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ApiErrorShape = {
  response?: { data?: { detail?: string }; status?: number };
  message?: string;
};

function extractError(error: unknown, fallback: string): never {
  const err = error as ApiErrorShape;
  if (err.response?.data?.detail) {
    throw new APIError(err.response.data.detail, err.response.status ?? 500);
  }
  throw new APIError(err.message ?? fallback, err.response?.status ?? 500);
}

export function decodeJwtToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
}

// ─── Service Class ────────────────────────────────────────────────────────────

class BackendAuthService {
  // ── Auth ───────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data?.access_token) {
        localStorage.setItem("authToken", response.data.access_token);
        const tokenPayload = decodeJwtToken(response.data.access_token);
        const userData: UserData = {
          id: tokenPayload?.user_id ?? response.data.user?.id,
          email: tokenPayload?.email ?? response.data.user?.email,
          firstname:
            tokenPayload?.firstname ?? response.data.user?.firstname ?? null,
          lastname:
            tokenPayload?.lastname ?? response.data.user?.lastname ?? null,
          phone: response.data.user?.phone ?? null,
          is_verified: response.data.user?.is_verified ?? true,
          role: tokenPayload?.role ?? "customer",
          vendor_id: tokenPayload?.vendor_id,
          rider_id: tokenPayload?.rider_id,
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        return {
          success: true,
          message: "Login successful",
          token: response.data.access_token,
          user: userData,
        };
      }
      throw new APIError("Invalid response from server", 500);
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Login failed. Please check your credentials.");
    }
  }

  async vendorLogin(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post("/auth/vendor/login", {
        email,
        password,
      });
      if (response.data?.access_token) {
        localStorage.setItem("authToken", response.data.access_token);
        const tokenPayload = decodeJwtToken(response.data.access_token);
        const userData: UserData = {
          id: tokenPayload?.user_id ?? response.data.user?.id,
          email: tokenPayload?.email ?? response.data.user?.email,
          firstname:
            tokenPayload?.firstname ?? response.data.user?.firstname ?? null,
          lastname:
            tokenPayload?.lastname ?? response.data.user?.lastname ?? null,
          phone: response.data.user?.phone ?? null,
          is_verified: response.data.user?.is_verified ?? true,
          role: "vendor",
          vendor_id: tokenPayload?.vendor_id ?? response.data.vendor?.id,
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        if (response.data.vendor) {
          localStorage.setItem(
            "vendorData",
            JSON.stringify(response.data.vendor),
          );
        }
        return {
          success: true,
          message: "Vendor login successful",
          token: response.data.access_token,
          user: userData,
          vendor: response.data.vendor,
        };
      }
      throw new APIError("Invalid response from server", 500);
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(
        error,
        "Vendor login failed. Please check your credentials.",
      );
    }
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post("/auth/register", data);
      const responseData = response.data as RegisterResponse["data"];

      // Backend does NOT auto-send OTP — call send-otp explicitly
      try {
        await api.post("/auth/send-otp", { email: data.email });
      } catch (otpError) {
        // Log but don't fail registration if OTP send fails
        console.warn("OTP send failed after registration:", otpError);
      }

      return {
        success: true,
        message: "Registration successful! OTP sent to your email.",
        data: responseData,
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      const err = error as ApiErrorShape;
      const detail = err.response?.data?.detail ?? "";
      if (detail.includes("already exists")) {
        throw new APIError(
          "An account with this email already exists. Please log in instead.",
          400,
        );
      }
      extractError(error, "Registration failed. Please try again.");
    }
  }

  async customerLogin(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post("/auth/customer/login", {
        email,
        password,
      });
      if (response.data?.access_token) {
        localStorage.setItem("authToken", response.data.access_token);
        const tokenPayload = decodeJwtToken(response.data.access_token);
        const userData: UserData = {
          id: tokenPayload?.user_id ?? response.data.user?.id,
          email: tokenPayload?.email ?? response.data.user?.email,
          firstname:
            tokenPayload?.firstname ?? response.data.user?.firstname ?? null,
          lastname:
            tokenPayload?.lastname ?? response.data.user?.lastname ?? null,
          phone: response.data.user?.phone ?? null,
          is_verified: response.data.user?.is_verified ?? true,
          role: "customer",
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        return {
          success: true,
          message: "Customer login successful",
          token: response.data.access_token,
          user: userData,
        };
      }
      throw new APIError("Invalid response from server", 500);
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(
        error,
        "Customer login failed. Please check your credentials.",
      );
    }
  }

  async customerRegister(data: {
    email: string;
    password: string;
  }): Promise<RegisterResponse> {
    try {
      const response = await api.post("/auth/register", {
        ...data,
        role: "customer",
      });
      return {
        success: true,
        message: "Registration successful! Please verify your email.",
        data: response.data as RegisterResponse["data"],
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      const err = error as ApiErrorShape;
      const detail = err.response?.data?.detail ?? "";
      if (detail.includes("already exists")) {
        throw new APIError(
          "An account with this email already exists. Please log in instead.",
          400,
        );
      }
      extractError(error, "Registration failed. Please try again.");
    }
  }

  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await api.post("/auth/send-otp", { email });
      return {
        success: true,
        message: "OTP sent successfully! Please check your email.",
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to send OTP. Please try again.");
    }
  }

  async verifyOTP(email: string, otpCode: string): Promise<LoginResponse> {
    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp_code: otpCode,
      });
      if (response.data?.access_token) {
        localStorage.setItem("authToken", response.data.access_token);
        const tokenPayload = decodeJwtToken(response.data.access_token);
        const user = response.data.user;
        const userData: UserData = {
          id: user.id,
          email: user.email,
          firstname: user.firstname ?? tokenPayload?.firstname ?? null,
          lastname: user.lastname ?? tokenPayload?.lastname ?? null,
          phone: user.phone ?? null,
          is_verified: true,
          role: user.role ?? tokenPayload?.role ?? "customer",
          vendor_id: user.vendor_id ?? tokenPayload?.vendor_id,
          rider_id: user.rider_id ?? tokenPayload?.rider_id,
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        return {
          success: true,
          message: response.data.message ?? "Email verified successfully!",
          token: response.data.access_token,
          user: userData,
        };
      }
      throw new APIError("Invalid response from server", 500);
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "OTP verification failed. Please try again.");
    }
  }

  async updateProfile(data: {
    firstname?: string;
    lastname?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
  }): Promise<{ success: boolean; message: string; user?: UserData }> {
    try {
      const response = await api.patch("/auth/profile", data);
      if (response.data.user) {
        localStorage.setItem("userData", JSON.stringify(response.data.user));
      }
      return {
        success: true,
        message: response.data.message ?? "Profile updated successfully",
        user: response.data.user as UserData,
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to update profile. Please try again.");
    }
  }

  async getProfile(): Promise<UserData> {
    try {
      const response = await api.get("/auth/profile");
      return {
        id: response.data.id as string,
        email: response.data.email as string,
        firstname: response.data.firstname as string | null,
        lastname: response.data.lastname as string | null,
        phone: response.data.phone as string | null,
        is_verified: response.data.is_verified as boolean,
        role: "customer",
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to get profile.");
    }
  }

  // ── Session helpers ────────────────────────────────────────────────────────

  async getCurrentUser(): Promise<UserData | null> {
    try {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("userData");
      if (!token) throw new APIError("No authentication token found", 401);
      if (!storedUser) {
        const tokenPayload = decodeJwtToken(token);
        if (tokenPayload) {
          return {
            id: tokenPayload.user_id,
            email: tokenPayload.email,
            firstname: tokenPayload.firstname ?? null,
            lastname: tokenPayload.lastname ?? null,
            phone: null,
            is_verified: true,
            role: tokenPayload.role,
            vendor_id: tokenPayload.vendor_id,
            rider_id: tokenPayload.rider_id,
          };
        }
        throw new APIError("No user data found. Please login again.", 401);
      }
      return JSON.parse(storedUser) as UserData;
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to fetch user profile.");
    }
  }

  async getCurrentVendor(): Promise<VendorData | null> {
    try {
      const storedVendor = localStorage.getItem("vendorData");
      if (storedVendor) return JSON.parse(storedVendor) as VendorData;
      const userData = await this.getCurrentUser();
      if (userData?.vendor_id) {
        return {
          id: userData.vendor_id,
          business_name: null,
          business_email: null,
          business_phone: null,
          business_address: null,
          status: "active",
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  getTokenContext(): JwtPayload | null {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    return decodeJwtToken(token);
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("vendorData");
    return { success: true, message: "Logged out successfully" };
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  setToken(token: string): void {
    localStorage.setItem("authToken", token);
  }

  // ── Vendor ─────────────────────────────────────────────────────────────────

  async registerVendor(
    vendorData: VendorRegistrationPayload,
  ): Promise<VendorRegistrationResponse> {
    try {
      const response = await api.post("/vendors/", vendorData);
      return {
        success: true,
        message: "Vendor profile created successfully!",
        data: response.data as VendorRegistrationResponse["data"],
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to create vendor profile. Please try again.");
    }
  }

  async uploadVendorAsset(
    vendorId: string,
    file: File,
    assetType: "store_logo" | "store_cover",
  ): Promise<{ success: boolean; url: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post(
        `/vendors/upload-asset?vendor_id=${vendorId}&asset_type=${assetType}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (response.data?.success) {
        return { success: true, url: response.data.url as string };
      }
      throw new Error("Upload failed");
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to upload vendor asset.");
    }
  }

  // ── Rider ──────────────────────────────────────────────────────────────────

  async uploadRiderDocument(
    _riderId: string,
    file: File,
    documentType: "drivers_license" | "selfie",
  ): Promise<{ success: boolean; url: string; message: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const backendDocType =
        documentType === "drivers_license" ? "license_photo" : "profile_photo";
      const response = await api.post(
        `/riders/upload-document?document_type=${backendDocType}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (response.data?.success) {
        return {
          success: true,
          url: response.data.url as string,
          message: "Document uploaded successfully",
        };
      }
      throw new Error("Upload failed");
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to upload document.");
    }
  }

  // ── Customer: Favorites ────────────────────────────────────────────────────

  async getFavorites(): Promise<FavoriteVendor[]> {
    try {
      const response = await api.get("/customer/favorites");
      return response.data as FavoriteVendor[];
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to get favorites.");
    }
  }

  async addFavorite(
    vendorId: string,
  ): Promise<{ message: string; vendor_id: string }> {
    try {
      const response = await api.post("/customer/favorites", {
        vendor_id: vendorId,
      });
      return response.data as { message: string; vendor_id: string };
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to add favorite.");
    }
  }

  async removeFavorite(
    vendorId: string,
  ): Promise<{ message: string; vendor_id: string }> {
    try {
      const response = await api.delete(`/customer/favorites/${vendorId}`);
      return response.data as { message: string; vendor_id: string };
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to remove favorite.");
    }
  }

  // ── Customer: Vendors ──────────────────────────────────────────────────────

  async getVendors(limit: number = 8): Promise<Vendor[]> {
    try {
      const response = await api.get(`/customer/vendors?limit=${limit}`);
      return response.data as Vendor[];
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to get vendors.");
    }
  }

  async getVendorByID(vendorId: string): Promise<Vendor> {
    try {
      const response = await api.get(`/customer/vendors/${vendorId}`);
      return response.data as Vendor;
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to get vendor by ID.");
    }
  }

  // ── Customer: Menu & Offers ────────────────────────────────────────────────

  async getMenuItems(
    limit: number = 10,
    vendorId?: string,
  ): Promise<MenuItem[]> {
    try {
      const finalLimit = limit || 10;
      let url = `/customer/menu-items?limit=${finalLimit}`;
      if (vendorId?.trim() && vendorId !== "undefined") {
        url += `&vendor_id=${vendorId}`;
      }
      const response = await api.get(url);
      return response.data as MenuItem[];
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to get menu items.");
    }
  }

  async getOffers(limit: number = 5): Promise<MenuItem[]> {
    try {
      const response = await api.get(`/customer/offers?limit=${limit}`);
      return response.data as MenuItem[];
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to get offers.");
    }
  }

  // ── Customer: Promo Codes ──────────────────────────────────────────────────

  async validatePromoCode(code: string): Promise<PromoCodeValidation> {
    try {
      const response = await api.get(`/customer/promo-codes/${code}`);
      return response.data as PromoCodeValidation;
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to validate promo code.");
    }
  }

  // ── Customer: Orders ───────────────────────────────────────────────────────

  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get("/customer/orders");
      return response.data as Order[];
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to get orders.");
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await api.get(`/customer/orders/${orderId}`);
      return response.data as Order;
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to get order.");
    }
  }

  async getOrderTracking(orderId: string): Promise<OrderTracking[]> {
    try {
      const response = await api.get(`/customer/orders/${orderId}/tracking`);
      return response.data as OrderTracking[];
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to get order tracking.");
    }
  }

  // ── Customer: Payments ─────────────────────────────────────────────────────

  async initializePayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await api.post(
        "/customer/payments/initialize",
        paymentData,
      );
      return response.data as PaymentResponse;
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to initialize payment.");
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    try {
      const response = await api.get(`/customer/payments/verify/${reference}`);
      return response.data as PaymentVerification;
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to verify payment.");
    }
  }

  async getPaymentHistory(
    limit: number = 20,
    offset: number = 0,
  ): Promise<PaymentHistory[]> {
    try {
      const response = await api.get(
        `/customer/payments/history?limit=${limit}&offset=${offset}`,
      );
      return response.data as PaymentHistory[];
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to get payment history.");
    }
  }

  async getVendorPaymentHistory(
    vendorId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<PaymentHistory[]> {
    try {
      const response = await api.get(
        `/customer/vendors/${vendorId}/payments?limit=${limit}&offset=${offset}`,
      );
      return response.data as PaymentHistory[];
    } catch (error) {
      if (error instanceof APIError) throw error;
      extractError(error, "Failed to get vendor payment history.");
    }
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

export const backendAuthService = new BackendAuthService();
export default BackendAuthService;
