// src/services/authService.ts

const API_BASE_URL = "https://pickeat.onrender.com";

// Types for API requests and responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
  token?: string;
}

export interface GetOTPRequest {
  phone: string;
}

export interface GetOTPResponse {
  success: boolean;
  message: string;
  otp?: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface RegisterRequest {
  phone: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  address: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    phone: string;
    email: string;
    firstname: string;
    lastname: string;
  };
  token?: string;
}

// API Error class
export class APIError extends Error {
  public statusCode?: number;
  public response?: unknown;

  constructor(message: string, statusCode?: number, response?: unknown) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.response = response;
  }
}

// API Service class
class AuthService {
  private async handleResponse<T>(response: Response): Promise<T> {
    // Log the response for debugging
    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);

    // Try to get the response body
    const textResponse = await response.text();
    console.log("Response body:", textResponse);

    let data;
    try {
      data = textResponse ? JSON.parse(textResponse) : {};
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      throw new APIError("Invalid response from server", response.status);
    }

    if (!response.ok) {
      // Extract error message from various possible structures
      const errMsg =
        data.message ||
        data.error ||
        data.msg ||
        `Request failed with status ${response.status}`;

      console.error("API Error:", errMsg, data);
      throw new APIError(errMsg, response.status, data);
    }

    return data as T;
  }

  /**
   * Request OTP for phone number
   */
  async getOTP(phone: string): Promise<GetOTPResponse> {
    try {
      console.log("Sending OTP request for phone:", phone);

      const response = await fetch(`${API_BASE_URL}/api/get-otp`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const result = await this.handleResponse<GetOTPResponse>(response);
      console.log("OTP Response:", result);
      return result;
    } catch (error: unknown) {
      console.error("getOTP error:", error);
      if (error instanceof APIError) throw error;
      throw new APIError(
        "Failed to request OTP. Please check your connection."
      );
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(phone: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      console.log("Verifying OTP for phone:", phone);

      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }),
      });

      const result = await this.handleResponse<VerifyOTPResponse>(response);
      console.log("Verify OTP Response:", result);
      return result;
    } catch (error: unknown) {
      console.error("verifyOTP error:", error);
      if (error instanceof APIError) throw error;
      throw new APIError("Failed to verify OTP. Please check your connection.");
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      console.log("Registering user:", { ...data, password: "[HIDDEN]" });

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<RegisterResponse>(response);
      console.log("Register Response:", result);
      return result;
    } catch (error: unknown) {
      console.error("register error:", error);
      if (error instanceof APIError) throw error;
      throw new APIError("Failed to register. Please check your connection.");
    }
  }

  /**
   * Login user (works for both customers and vendors)
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log("Attempting login for email:", email);
      console.log("API URL:", `${API_BASE_URL}/login`);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response received");
      const result = await this.handleResponse<LoginResponse>(response);
      console.log("Login successful:", result);
      return result;
    } catch (error: unknown) {
      console.error("login error:", error);
      if (error instanceof APIError) throw error;
      if (error instanceof TypeError) {
        throw new APIError(
          "Network error. Please check your internet connection."
        );
      }
      throw new APIError("Failed to login. Please check your connection.");
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
