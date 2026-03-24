// src/services/authService.ts
// ⚠️  NO Supabase. All calls go to the FastAPI backend via the `api` axios instance.
import api from "./api";
import { decodeJwtToken } from "./backendAuthService";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginResponse,
  GetOTPResponse,
} from "../types/api.types";

// ─── APIError ─────────────────────────────────────────────────────────────────

export class APIError extends Error {
  status: number;
  constructor(message: string, status: number = 400) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

type ApiErrorShape = {
  response?: { data?: { detail?: string }; status?: number };
  message?: string;
};

/** Throws an APIError from an axios error, never returns. */
function throwApiError(error: unknown, fallback: string): never {
  const err = error as ApiErrorShape;
  throw new APIError(
    err.response?.data?.detail ?? err.message ?? fallback,
    err.response?.status ?? 400,
  );
}

const safeAsync = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error: unknown) {
    const err = error as { name?: string };
    if (err.name === "AbortError") throw new APIError("Request cancelled", 499);
    throw error;
  }
};

// ─── Service ──────────────────────────────────────────────────────────────────

class AuthService {
  // ════════════════════════════════════════
  //  REGISTRATION
  // ════════════════════════════════════════

  /** Vendor signup — backend sends OTP automatically after /auth/register */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return safeAsync(async () => {
      try {
        const res = await api.post("/auth/register", {
          email: data.email,
          password: data.password,
          firstname: data.firstname,
          lastname: data.lastname,
          phone: data.phone,
          user_type: "vendor",
          role: "vendor",
        });
        const d = res.data as { id?: string; user_id?: string; email?: string };
        return {
          success: true,
          message: "Registration successful! Check your email for the OTP.",
          data: { id: d.id ?? d.user_id ?? "", email: d.email ?? data.email },
        };
      } catch (error: unknown) {
        if (error instanceof APIError) throw error;
        const err = error as ApiErrorShape;
        if (err.response?.data?.detail?.includes("already exists"))
          throw new APIError("An account with this email already exists.", 400);
        throwApiError(error, "Registration failed. Please try again.");
      }
    });
  }

  /** Customer signup */
  async registerUser(data: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phone: string;
    address?: string;
  }): Promise<RegisterResponse> {
    return safeAsync(async () => {
      try {
        const res = await api.post("/auth/register", {
          email: data.email,
          password: data.password,
          firstname: data.firstname,
          lastname: data.lastname,
          phone: data.phone,
          user_type: "customer",
          role: "customer",
        });
        const d = res.data as { id?: string; user_id?: string; email?: string };
        return {
          success: true,
          message: "Registration successful! Please verify your email.",
          data: { id: d.id ?? d.user_id ?? "", email: d.email ?? data.email },
        };
      } catch (error: unknown) {
        if (error instanceof APIError) throw error;
        const err = error as ApiErrorShape;
        if (err.response?.data?.detail?.includes("already exists"))
          throw new APIError("An account with this email already exists.", 409);
        throwApiError(error, "Registration failed. Please try again.");
      }
    });
  }

  /** Rider signup */
  async registerRider(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
    vehicleType?: string;
    vehicleBrand?: string;
    plateNumber?: string;
    guarantor1?: { name: string; phone: string; relationship: string };
    guarantor2?: { name: string; phone: string; relationship: string };
    previousWork?: string;
    workDuration?: string;
    referralCode?: string;
    bankInfo?: { bankName: string; accountNumber: string; accountName: string };
    availability?: {
      fromDay: string;
      toDay: string;
      holidayAvailable: string;
      timeStart: string;
      timeEnd: string;
    };
  }): Promise<RegisterResponse> {
    return safeAsync(async () => {
      try {
        // 1 — create account
        const regRes = await api.post("/auth/register", {
          email: data.email,
          password: data.password,
          firstname: data.firstName,
          lastname: data.lastName,
          phone: data.phone,
          user_type: "rider",
          role: "rider",
        });
        const rd = regRes.data as {
          id?: string;
          user_id?: string;
          email?: string;
        };
        const userId = rd.id ?? rd.user_id ?? "";

        // 2 — create rider profile
        await api.post("/riders/", {
          user_id: userId,
          email: data.email,
          firstname: data.firstName,
          lastname: data.lastName,
          phone: data.phone,
          gender: data.gender ?? null,
          next_of_kin_name: data.nextOfKinName ?? null,
          next_of_kin_phone: data.nextOfKinPhone ?? null,
          vehicle_type: data.vehicleType ?? null,
          vehicle_brand: data.vehicleBrand ?? null,
          plate_number: data.plateNumber ?? null,
          previous_work: data.previousWork ?? null,
          work_duration: data.workDuration ?? null,
          referral_code: data.referralCode ?? null,
          status: "pending",
        });

        // 3 — guarantors
        if (data.guarantor1?.name)
          await api.post("/riders/guarantors", {
            ...data.guarantor1,
            guarantor_number: 1,
          });
        if (data.guarantor2?.name)
          await api.post("/riders/guarantors", {
            ...data.guarantor2,
            guarantor_number: 2,
          });

        // 4 — bank info
        if (data.bankInfo?.bankName)
          await api.post("/riders/bank-info", {
            bank_name: data.bankInfo.bankName,
            account_number: data.bankInfo.accountNumber,
            account_name: data.bankInfo.accountName,
          });

        // 5 — availability
        if (data.availability)
          await api.post("/riders/availability", {
            day_from: data.availability.fromDay,
            day_to: data.availability.toDay,
            holidays_available:
              data.availability.holidayAvailable === "Yes, I'm available",
            time_start: data.availability.timeStart,
            time_end: data.availability.timeEnd,
          });

        return {
          success: true,
          message: "Registration successful! Your application is under review.",
          data: { id: userId, email: rd.email ?? data.email },
        };
      } catch (error: unknown) {
        if (error instanceof APIError) throw error;
        const err = error as ApiErrorShape;
        if (err.response?.data?.detail?.includes("already exists"))
          throw new APIError(
            "Account already exists. Please log in instead.",
            409,
          );
        throwApiError(error, "Registration failed. Please try again.");
      }
    });
  }

  // ════════════════════════════════════════
  //  OTP
  // ════════════════════════════════════════

  /**
   * With password → registers + backend auto-sends OTP.
   * Without password → resends OTP only.
   */
  async sendEmailOTP(
    email: string,
    password?: string,
    role: string = "customer",
  ): Promise<{ message: string }> {
    return safeAsync(async () => {
      const e = email.toLowerCase().trim();
      if (password) {
        try {
          await api.post("/auth/register", {
            email: e,
            password,
            user_type: role,
            role,
          });
          // Explicitly send OTP after registration
          await api.post("/auth/send-otp", { email: e });
          return {
            message:
              "Registration successful! Verification OTP sent to your email.",
          };
        } catch (error: unknown) {
          if (error instanceof APIError) throw error;
          const err = error as ApiErrorShape;
          if (
            err.response?.status === 400 &&
            err.response.data?.detail?.includes("already exists")
          )
            throw new APIError(
              "An account with this email already exists.",
              400,
            );
          throwApiError(error, "Registration failed. Please try again.");
        }
      }
      try {
        await api.post("/auth/send-otp", { email: e });
        return { message: "OTP sent successfully! Please check your email." };
      } catch (error: unknown) {
        throwApiError(error, "Failed to send OTP. Please try again.");
      }
    });
  }

  async verifyEmailOTP(email: string, otp: string): Promise<LoginResponse> {
    return safeAsync(async () => {
      try {
        const res = await api.post("/auth/verify-otp", {
          email: email.toLowerCase().trim(),
          otp_code: otp,
        });
        if (res.data?.access_token) {
          localStorage.setItem("authToken", res.data.access_token as string);
          const user = res.data.user as Record<string, unknown>;
          const userData = {
            id: user.id as string,
            email: user.email as string,
            fullname:
              `${(user.firstname as string) ?? ""} ${(user.lastname as string) ?? ""}`.trim() ||
              "User",
            role: user.role as string,
            rider_id: user.rider_id as string | undefined,
            vendor_id: user.vendor_id as string | undefined,
          };
          localStorage.setItem("userData", JSON.stringify(userData));
          return {
            success: true,
            message:
              (res.data.message as string) ?? "Email verified successfully!",
            user: userData,
            token: res.data.access_token as string,
          };
        }
        throw new APIError("Invalid response from server", 500);
      } catch (e: unknown) {
        if (e instanceof APIError) throw e;
        throwApiError(e, "OTP verification failed");
      }
    });
  }

  async verifyOTP(email: string, otp: string): Promise<{ message: string }> {
    return safeAsync(async () => {
      try {
        await api.post("/auth/verify-otp", {
          email: email.toLowerCase().trim(),
          otp_code: otp,
        });
        return { message: "Email verified successfully!" };
      } catch (error: unknown) {
        if (error instanceof APIError) throw error;
        throwApiError(error, "OTP verification failed. Please try again.");
      }
    });
  }

  async resendOtp(email: string): Promise<GetOTPResponse> {
    return safeAsync(async () => {
      try {
        await api.post("/auth/send-otp", { email: email.toLowerCase().trim() });
        return {
          success: true,
          message: "A new code has been sent to your email.",
        };
      } catch (error: unknown) {
        const err = error as { message?: string };
        throw new APIError(err.message ?? "Failed to resend OTP", 400);
      }
    });
  }

  async getOTP(phone: string): Promise<GetOTPResponse> {
    return safeAsync(async () => {
      try {
        await api.post("/auth/send-otp", { phone });
        return { success: true, message: "Code sent to your phone!" };
      } catch (error: unknown) {
        throwApiError(error, "Failed to send OTP. Please try again.");
      }
    });
  }

  // ════════════════════════════════════════
  //  LOGIN
  // ════════════════════════════════════════

  async login(email: string, password: string): Promise<LoginResponse> {
    return safeAsync(async () => {
      try {
        const res = await api.post("/auth/vendor/login", { email, password });
        if (res.data?.access_token) {
          localStorage.setItem("authToken", res.data.access_token as string);
          const tp = decodeJwtToken(res.data.access_token as string);
          const userData = {
            id: tp?.user_id ?? (res.data.user as { id?: string })?.id ?? "",
            email:
              tp?.email ?? (res.data.user as { email?: string })?.email ?? "",
            fullname:
              `${tp?.firstname ?? ""} ${tp?.lastname ?? ""}`.trim() || "Vendor",
            role: "vendor",
            vendor_id:
              tp?.vendor_id ?? (res.data.vendor as { id?: string })?.id,
          };
          localStorage.setItem("userData", JSON.stringify(userData));
          if (res.data.vendor)
            localStorage.setItem("vendorData", JSON.stringify(res.data.vendor));
          return {
            success: true,
            message: "Welcome back!",
            user: userData,
            token: res.data.access_token as string,
          };
        }
        throw new APIError("Invalid response from server", 500);
      } catch (error: unknown) {
        if (error instanceof APIError) throw error;
        throwApiError(error, "Login failed. Please check your credentials.");
      }
    });
  }

  async loginUser(email: string, password: string): Promise<LoginResponse> {
    return safeAsync(async () => {
      try {
        const res = await api.post("/auth/customer/login", { email, password });
        if (res.data?.access_token) {
          localStorage.setItem("authToken", res.data.access_token as string);
          const tp = decodeJwtToken(res.data.access_token as string);
          const userData = {
            id: tp?.user_id ?? (res.data.user as { id?: string })?.id ?? "",
            email:
              tp?.email ?? (res.data.user as { email?: string })?.email ?? "",
            fullname:
              `${tp?.firstname ?? ""} ${tp?.lastname ?? ""}`.trim() || "User",
            role: "customer",
          };
          localStorage.setItem("userData", JSON.stringify(userData));
          return {
            success: true,
            message: "Login successful!",
            user: userData,
            token: res.data.access_token as string,
          };
        }
        throw new APIError("Invalid response from server", 500);
      } catch (error: unknown) {
        if (error instanceof APIError) throw error;
        throwApiError(error, "Login failed. Please check your credentials.");
      }
    });
  }

  async loginRider(email: string, password: string): Promise<LoginResponse> {
    return safeAsync(async () => {
      try {
        const res = await api.post("/auth/login", { email, password });
        if (res.data?.access_token) {
          const tp = decodeJwtToken(res.data.access_token as string);
          if (!tp) throw new APIError("Failed to authenticate session.", 401);
          if (tp.role !== "rider")
            throw new APIError(
              "This account is not registered as a rider.",
              403,
            );
          localStorage.setItem("authToken", res.data.access_token as string);
          const userData = {
            id: tp.user_id ?? tp.sub,
            email: tp.email,
            fullname:
              `${tp.firstname ?? ""} ${tp.lastname ?? ""}`.trim() || "Rider",
            role: "rider",
            rider_id: tp.rider_id,
          };
          localStorage.setItem("userData", JSON.stringify(userData));
          return {
            success: true,
            message: "Login successful!",
            user: userData,
            token: res.data.access_token as string,
          };
        }
        throw new APIError("Invalid response from server", 500);
      } catch (error: unknown) {
        if (error instanceof APIError) throw error;
        throwApiError(error, "Login failed. Please check your credentials.");
      }
    });
  }

  // ════════════════════════════════════════
  //  PASSWORD RESET
  // ════════════════════════════════════════

  async forgotPassword(email: string): Promise<{ message: string }> {
    return safeAsync(async () => {
      try {
        await api.post("/auth/forgot-password", { email });
        return { message: "We've sent a password reset link to your email!" };
      } catch (error: unknown) {
        throwApiError(error, "Failed to send reset email. Please try again.");
      }
    });
  }

  async sendPasswordResetOTP(email: string): Promise<{ message: string }> {
    return safeAsync(async () => {
      try {
        await api.post("/auth/forgot-password", { email });
        localStorage.setItem("password_reset_email", email);
        return { message: "We've sent a recovery code to your email!" };
      } catch (error: unknown) {
        throwApiError(error, "Failed to send code. Please try again.");
      }
    });
  }

  async verifyPasswordResetOTP(
    email: string,
    otp: string,
  ): Promise<{ message: string; access_token?: string }> {
    return safeAsync(async () => {
      try {
        const res = await api.post("/auth/verify-otp", {
          email,
          otp_code: otp,
        });
        localStorage.setItem("password_reset_verified", "true");
        if (res.data?.access_token)
          localStorage.setItem("authToken", res.data.access_token as string);
        return {
          message: "Code verified successfully!",
          access_token: res.data?.access_token as string | undefined,
        };
      } catch (error: unknown) {
        throwApiError(error, "Code verification failed. Please try again.");
      }
    });
  }

  async resetPassword(
    _email: string,
    _token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return this.resetPasswordWithOTP(newPassword);
  }

  async resetPasswordWithOTP(
    newPassword: string,
  ): Promise<{ message: string }> {
    return safeAsync(async () => {
      try {
        if (!localStorage.getItem("password_reset_verified"))
          throw new APIError("Please verify OTP first.", 400);
        await api.post("/auth/reset-password", { new_password: newPassword });
        localStorage.removeItem("password_reset_email");
        localStorage.removeItem("password_reset_verified");
        return { message: "Your password has been reset successfully!" };
      } catch (error: unknown) {
        if (error instanceof APIError) throw error;
        throwApiError(error, "Password reset failed. Please try again.");
      }
    });
  }

  // ════════════════════════════════════════
  //  RIDER HELPERS
  // ════════════════════════════════════════

  async createInitialRiderProfile(): Promise<string> {
    return safeAsync(async () => {
      try {
        const res = await api.get("/riders/profile");
        return res.data.id as string;
      } catch {
        throw new APIError("Failed to retrieve rider profile", 400);
      }
    });
  }

  async updateRiderProfile(
    _riderId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      gender?: string;
      vehicleType?: string;
      vehicleBrand?: string;
      plateNumber?: string;
      previousWork?: string;
      workDuration?: string;
      referralCode?: string;
    },
  ): Promise<void> {
    return safeAsync(async () => {
      try {
        await api.patch("/riders/profile", {
          firstname: data.firstName,
          lastname: data.lastName,
          phone: data.phone,
          gender: data.gender,
          vehicle_type: data.vehicleType,
          vehicle_brand: data.vehicleBrand,
          plate_number: data.plateNumber,
          previous_work: data.previousWork,
          work_duration: data.workDuration,
          referral_code: data.referralCode,
        });
      } catch (error: unknown) {
        throwApiError(error, "We couldn't save your profile updates.");
      }
    });
  }

  async uploadRiderDocument(
    _riderId: string,
    file: File,
    documentType: "drivers_license" | "selfie",
  ): Promise<{ success: boolean; url: string; message: string }> {
    return safeAsync(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const backendDocType =
          documentType === "drivers_license"
            ? "license_photo"
            : "profile_photo";
        const res = await api.post(
          `/riders/upload-document?document_type=${backendDocType}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        if (res.data?.success)
          return {
            success: true,
            url: res.data.url as string,
            message: "Document uploaded successfully",
          };
        throw new Error("Upload failed");
      } catch (error: unknown) {
        throwApiError(error, "Failed to upload document.");
      }
    });
  }

  async uploadRiderPhoto(riderId: string, file: File, type: string) {
    const docType =
      type === "license_photo"
        ? ("drivers_license" as const)
        : ("selfie" as const);
    return this.uploadRiderDocument(riderId, file, docType);
  }

  async saveRiderRegistration(data: Record<string, unknown>) {
    return safeAsync(async () => {
      try {
        await api.post("/riders/", {
          firstname: data.firstName,
          lastname: data.lastName,
          phone: data.phone,
          gender: data.gender,
          vehicle_type: data.vehicleType,
          vehicle_brand: data.vehicleBrand,
          plate_number: data.plateNumber,
          previous_work: data.previousWork,
          work_duration: data.workDuration,
          referral_code: data.referralCode,
          status: "pending",
        });
        if (data.bankName)
          await api.post("/riders/bank-info", {
            bank_name: data.bankName,
            account_number: data.accountNumber,
            account_name: data.accountName,
          });
        if (data.guarantor1Name)
          await api.post("/riders/guarantors", {
            name: data.guarantor1Name,
            phone: data.guarantor1Phone,
            relationship: data.guarantor1Relationship,
          });
        if (data.guarantor2Name)
          await api.post("/riders/guarantors", {
            name: data.guarantor2Name,
            phone: data.guarantor2Phone,
            relationship: data.guarantor2Relationship,
          });
        return { success: true };
      } catch (error: unknown) {
        throwApiError(error, "Failed to finalize rider registration.");
      }
    });
  }

  // ════════════════════════════════════════
  //  VENDOR HELPERS
  // ════════════════════════════════════════

  async registerVendor(vendorData: Record<string, unknown>): Promise<unknown> {
    return safeAsync(async () => {
      try {
        const res = await api.post("/vendors/", vendorData);
        return res.data;
      } catch (error: unknown) {
        throwApiError(error, "Failed to register vendor.");
      }
    });
  }

  async uploadVendorPhoto(
    vendorId: string,
    file: File,
    photoType: string,
  ): Promise<{ publicUrl: string }> {
    return safeAsync(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post(
          `/vendors/upload-asset?vendor_id=${vendorId}&asset_type=${photoType}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        if (res.data?.success) return { publicUrl: res.data.url as string };
        throw new Error("Upload failed");
      } catch (error: unknown) {
        const err = error as { message?: string };
        throw new Error(err.message ?? "Failed to upload vendor asset");
      }
    });
  }

  async saveProfileDetails(
    vendorId: string,
    profileData: Record<string, string | number>,
  ): Promise<unknown> {
    return safeAsync(async () => {
      try {
        const res = await api.patch(`/vendors/${vendorId}`, {
          business_name: profileData.businessName,
          how_to_address: profileData.howToAddress,
          full_name: profileData.fullName,
          business_email: profileData.businessEmail,
          country_name: profileData.country,
          business_phone: profileData.businessPhone,
          business_address: profileData.businessAddress,
          membership_id: profileData.membershipId,
        });
        return res.data;
      } catch (error: unknown) {
        throwApiError(error, "Failed to save profile details.");
      }
    });
  }

  async saveBusinessDetails(
    vendorId: string,
    details: { businessDescription: string; additionalInfo: string },
  ): Promise<unknown> {
    return safeAsync(async () => {
      try {
        const res = await api.patch(`/vendors/${vendorId}`, {
          business_description: details.businessDescription,
        });
        return res.data;
      } catch (error: unknown) {
        throwApiError(error, "Failed to save business details.");
      }
    });
  }

  async saveAvailabilityDetails(
    vendorId: string,
    availability: {
      dayFrom?: string;
      dayTo?: string;
      holidaysAvailable?: string;
      timeStart?: string;
      timeEnd?: string;
      workers?: string;
    },
  ): Promise<unknown> {
    return safeAsync(async () => {
      try {
        const res = await api.patch(`/vendors/${vendorId}`, {
          day_from: availability.dayFrom,
          day_to: availability.dayTo,
          holidays_available: availability.holidaysAvailable === "YES",
          opening_time: availability.timeStart,
          closing_time: availability.timeEnd,
          total_workers: parseInt(availability.workers ?? "1"),
        });
        return res.data;
      } catch (error: unknown) {
        throwApiError(error, "Failed to save availability.");
      }
    });
  }

  async savePaymentDetails(
    vendorId: string,
    payment: {
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
    },
  ): Promise<unknown> {
    return safeAsync(async () => {
      try {
        const res = await api.patch(`/vendors/${vendorId}`, {
          bank_name: payment.bankName,
          account_number: payment.accountNumber,
          account_name: payment.accountName,
        });
        return res.data;
      } catch (error: unknown) {
        throwApiError(error, "Failed to save payment details.");
      }
    });
  }

  async getVendorProfile(
    vendorId: string,
  ): Promise<Record<string, unknown> | null> {
    return safeAsync(async () => {
      try {
        const res = await api.get(`/vendors/${vendorId}`);
        return res.data as Record<string, unknown>;
      } catch (error: unknown) {
        throwApiError(error, "Failed to fetch vendor profile.");
      }
    });
  }

  // ════════════════════════════════════════
  //  SESSION
  // ════════════════════════════════════════

  async logout(): Promise<void> {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("vendorData");
  }

  async getCurrentUser(): Promise<Record<string, unknown> | null> {
    const stored = localStorage.getItem("userData");
    return stored ? (JSON.parse(stored) as Record<string, unknown>) : null;
  }

  async getCurrentUserProfile(): Promise<unknown> {
    return safeAsync(async () => {
      if (!localStorage.getItem("authToken"))
        throw new APIError("User not authenticated", 401);
      try {
        const res = await api.get("/auth/profile");
        return res.data;
      } catch (error: unknown) {
        throwApiError(error, "Failed to fetch profile");
      }
    });
  }

  async updateCurrentUserProfile(
    updates: Record<string, unknown>,
  ): Promise<unknown> {
    return safeAsync(async () => {
      try {
        const res = await api.patch("/auth/profile", updates);
        return res.data;
      } catch (error: unknown) {
        throwApiError(error, "Failed to update user profile");
      }
    });
  }
}

// ─── Singleton + named export ─────────────────────────────────────────────────

export const apiService = new AuthService();

export const authService = {
  login: (e: string, p: string) => apiService.login(e, p),
  loginUser: (e: string, p: string) => apiService.loginUser(e, p),
  loginRider: (e: string, p: string) => apiService.loginRider(e, p),
  register: (d: RegisterRequest) => apiService.register(d),
  registerUser: (d: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phone: string;
    address?: string;
  }) => apiService.registerUser(d),
  registerRider: (d: Parameters<AuthService["registerRider"]>[0]) =>
    apiService.registerRider(d),
  registerVendor: (d: Record<string, unknown>) => apiService.registerVendor(d),
  sendEmailOTP: (e: string, p?: string, r?: string) =>
    apiService.sendEmailOTP(e, p, r),
  verifyEmailOTP: (e: string, o: string) => apiService.verifyEmailOTP(e, o),
  verifyOTP: (e: string, o: string) => apiService.verifyOTP(e, o),
  resendOtp: (e: string) => apiService.resendOtp(e),
  getOTP: (phone: string) => apiService.getOTP(phone),
  forgotPassword: (e: string) => apiService.forgotPassword(e),
  sendPasswordResetOTP: (e: string) => apiService.sendPasswordResetOTP(e),
  verifyPasswordResetOTP: (e: string, o: string) =>
    apiService.verifyPasswordResetOTP(e, o),
  resetPassword: (e: string, t: string, p: string) =>
    apiService.resetPassword(e, t, p),
  resetPasswordWithOTP: (p: string) => apiService.resetPasswordWithOTP(p),
  logout: () => apiService.logout(),
  getCurrentUser: () => apiService.getCurrentUser(),
  getCurrentUserProfile: () => apiService.getCurrentUserProfile(),
  updateCurrentUserProfile: (u: Record<string, unknown>) =>
    apiService.updateCurrentUserProfile(u),
  createInitialRiderProfile: () => apiService.createInitialRiderProfile(),
  updateRiderProfile: (
    id: string,
    d: Parameters<AuthService["updateRiderProfile"]>[1],
  ) => apiService.updateRiderProfile(id, d),
  uploadRiderDocument: (id: string, f: File, t: "drivers_license" | "selfie") =>
    apiService.uploadRiderDocument(id, f, t),
  uploadRiderPhoto: (id: string, f: File, t: string) =>
    apiService.uploadRiderPhoto(id, f, t),
  saveRiderRegistration: (d: Record<string, unknown>) =>
    apiService.saveRiderRegistration(d),
  saveProfileDetails: (id: string, d: Record<string, string | number>) =>
    apiService.saveProfileDetails(id, d),
  uploadVendorPhoto: (id: string, f: File, t: "store_logo" | "store_cover") =>
    apiService.uploadVendorPhoto(id, f, t),
  saveBusinessDetails: (
    id: string,
    d: { businessDescription: string; additionalInfo: string },
  ) => apiService.saveBusinessDetails(id, d),
  saveAvailabilityDetails: (
    id: string,
    a: Parameters<AuthService["saveAvailabilityDetails"]>[1],
  ) => apiService.saveAvailabilityDetails(id, a),
  savePaymentDetails: (
    id: string,
    p: Parameters<AuthService["savePaymentDetails"]>[1],
  ) => apiService.savePaymentDetails(id, p),
  getVendorProfile: (id: string) => apiService.getVendorProfile(id),
};

export type { GetOTPResponse } from "../types/api.types";
