// src/services/api.service.ts

// src/services/api.service.ts
import type {
  RegisterRequest,
  RegisterResponse,

  // LoginRequest,
  LoginResponse,

  // ApiError,
} from "../types/api.types";

const API_BASE_URL = "https://pickit-biem.onrender.com";

// Export the ApiError class so it can be used in components
export class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || "An error occurred",
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Network error. Please check your connection.", 0);
    }
  }

  // Auth APIs
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email: string, otp: string): Promise<{ message: string }> {
    return this.request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, password: newPassword }),
    });
  }
}

// Export a single instance
export const apiService = new ApiService();

// Also create an authService alias for backward compatibility
export const authService = {
  login: (email: string, password: string) => apiService.login(email, password),
  register: (data: RegisterRequest) => apiService.register(data),
  forgotPassword: (email: string) => apiService.forgotPassword(email),
  verifyOTP: (email: string, otp: string) => apiService.verifyOTP(email, otp),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    apiService.resetPassword(email, otp, newPassword),
};
