// src/services/authService.ts
import { createClient } from "@supabase/supabase-js";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginResponse,
  GetOTPResponse,
} from "../types/api.types";

// Initialize Supabase client
const SUPABASE_URL = "https://acuqcetaduizgwchoosa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdXFjZXRhZHVpemd3Y2hvb3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3OTUyMDksImV4cCI6MjA4NDM3MTIwOX0.RwkXc68xkA31UnMvGfdK9nTRQfjEqIVIutL9Z3y0xMg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export the APIError class so it can be used in components
export class APIError extends Error {
  status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

class AuthService {
  // Add this to your AuthService class in authService.ts

  // src/services/authService.ts

  async createInitialRiderProfile(
    userId: string,
    email: string,
  ): Promise<string> {
    const { data, error } = await supabase
      .from("riders")
      .insert([
        {
          user_id: userId,
          email: email,
          status: "pending",
          firstname: "", // Provide empty string instead of NULL
          lastname: "", // Provide empty string instead of NULL
          phone: "", // Provide empty string instead of NULL
        },
      ])
      .select("id")
      .single();

    if (error) throw new APIError(error.message, 400);
    return data.id;
  }
  // Update the existing registerRider to handle UPDATES instead of a new SIGNUP
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateRiderProfile(riderId: string, data: any): Promise<void> {
    const { error } = await supabase
      .from("riders")
      .update({
        firstname: data.firstName,
        lastname: data.lastName,
        phone: data.phone,
        gender: data.gender,
        previous_work: data.previousWork,
        work_duration: data.workDuration,
        referral_code: data.referralCode,
      })
      .eq("id", riderId);

    if (error) throw new APIError(error.message, 400);
  }
  async sendEmailOTP(
    email: string,
    password?: string,
  ): Promise<{ message: string }> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        // If a password is provided (from Step 0), use it.
        // Otherwise, use a temp one (not recommended for this flow).
        password: password || "TempPassword123!",
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (error) throw new APIError(error.message, 400);
      return { message: "OTP sent!" };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to send OTP. Please try again.", 400);
    }
  }

  // Verify Email OTP (update existing method)
  async verifyEmailOTP(
    email: string,
    otp: string,
  ): Promise<{ message: string }> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        throw new APIError(error.message, 400);
      }

      return { message: "Email verified successfully!" };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("OTP verification failed. Please try again.", 400);
    }
  }
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
    guarantor1?: {
      name: string;
      phone: string;
      relationship: string;
    };
    guarantor2?: {
      name: string;
      phone: string;
      relationship: string;
    };
    previousWork?: string;
    workDuration?: string;
    referralCode?: string;
    bankInfo?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
    availability?: {
      fromDay: string;
      toDay: string;
      holidayAvailable: string;
      timeStart: string;
      timeEnd: string;
    };
  }): Promise<RegisterResponse> {
    try {
      // Sign up with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstname: data.firstName,
            lastname: data.lastName,
            phone: data.phone,
            user_type: "rider", // distinguish from vendors and customers
          },
        },
      });

      if (authError) {
        throw new APIError(authError.message, 400);
      }

      if (!authData.user) {
        throw new APIError("Registration failed", 400);
      }

      // Insert rider profile into riders table
      const { error: riderProfileError } = await supabase
        .from("riders")
        .insert([
          {
            user_id: authData.user.id,
            email: data.email,
            firstname: data.firstName,
            lastname: data.lastName,
            phone: data.phone,
            gender: data.gender || null,
            next_of_kin_name: data.nextOfKinName || null,
            next_of_kin_phone: data.nextOfKinPhone || null,
            vehicle_type: data.vehicleType || null,
            vehicle_brand: data.vehicleBrand || null,
            plate_number: data.plateNumber || null,
            previous_work: data.previousWork || null,
            work_duration: data.workDuration || null,
            referral_code: data.referralCode || null,
            status: "pending", // Application starts as pending
          },
        ]);

      if (riderProfileError) {
        // Handle duplicate key violation
        if (riderProfileError.code === "23505") {
          throw new APIError(
            "Account already exists. Please log in instead.",
            409,
          );
        }
        throw new APIError("Failed to create rider profile", 400);
      }

      // Query for the rider record to get its ID
      const { data: riderDataArray, error: riderQueryError } = await supabase
        .from("riders")
        .select("id")
        .eq("user_id", authData.user.id)
        .single();

      if (riderQueryError || !riderDataArray) {
        throw new APIError("Failed to retrieve rider ID", 400);
      }

      const riderId = riderDataArray.id;

      // Save guarantor information if provided
      if (data.guarantor1 || data.guarantor2) {
        const guarantors = [];

        if (data.guarantor1?.name && data.guarantor1?.phone) {
          guarantors.push({
            rider_id: riderId,
            name: data.guarantor1.name,
            phone: data.guarantor1.phone,
            relationship: data.guarantor1.relationship,
            guarantor_number: 1,
          });
        }

        if (data.guarantor2?.name && data.guarantor2?.phone) {
          guarantors.push({
            rider_id: riderId,
            name: data.guarantor2.name,
            phone: data.guarantor2.phone,
            relationship: data.guarantor2.relationship,
            guarantor_number: 2,
          });
        }

        if (guarantors.length > 0) {
          const { error: guarantorError } = await supabase
            .from("rider_guarantors")
            .insert(guarantors);

          if (guarantorError) {
            console.warn("Guarantor save warning:", guarantorError.message);
          }
        }
      }

      // Save bank information if provided
      if (data.bankInfo?.bankName && data.bankInfo?.accountNumber) {
        const { error: bankError } = await supabase
          .from("rider_bank_info")
          .insert([
            {
              rider_id: riderId,
              bank_name: data.bankInfo.bankName,
              account_number: data.bankInfo.accountNumber,
              account_name: data.bankInfo.accountName,
            },
          ]);

        if (bankError) {
          console.warn("Bank info save warning:", bankError.message);
        }
      }

      // Save availability if provided
      if (data.availability) {
        const { error: availabilityError } = await supabase
          .from("rider_availability")
          .insert([
            {
              rider_id: riderId,
              day_from: data.availability.fromDay,
              day_to: data.availability.toDay,
              holidays_available:
                data.availability.holidayAvailable === "Yes, I'm available",
              time_start: data.availability.timeStart,
              time_end: data.availability.timeEnd,
            },
          ]);

        if (availabilityError) {
          console.warn("Availability save warning:", availabilityError.message);
        }
      }

      return {
        success: true,
        message: "Registration successful! Your application is under review.",
        data: {
          id: riderId,
          email: authData.user.email || data.email,
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Registration failed. Please try again.", 400);
    }
  }
  // Inside class AuthService...

  async loginRider(email: string, password: string): Promise<LoginResponse> {
    // 1. Try to log in to Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new APIError(error.message, 401);

    // 2. If Auth works, check the database profile
    const { data: riderData, error: dbError } = await supabase
      .from("riders")
      .select("*")
      .eq("user_id", data.user.id)
      .single();

    // Check if rider profile exists - if not, user is not a rider
    if (dbError || !riderData) {
      // Sign out the user since they're not a rider
      await supabase.auth.signOut();
      throw new APIError(
        "This account is not registered as a rider. Please use the correct login portal.",
        403
      );
    }

    // 3. Check Status
    if (riderData.status === "pending") {
      throw new APIError(
        "Account pending approval. Please wait for an email.",
        403,
      );
    }

    return {
      success: true,
      message: "Login successful!",
      user: riderData,
      token: data.session.access_token,
    };
  }
  async uploadRiderDocument(
    riderId: string,
    file: File,
    documentType: "drivers_license" | "selfie",
  ): Promise<{ success: boolean; url: string; message: string }> {
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${riderId}/${documentType}_${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      // AFTER (Fixed)
      const { error: uploadError } = await supabase.storage
        .from("rider-documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new APIError(uploadError.message, 400);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("rider-documents")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Save document info to database (optional - create table if needed)
      const { error: dbError } = await supabase.from("rider_documents").insert([
        {
          rider_id: riderId,
          document_type: documentType,
          document_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          uploaded_at: new Date().toISOString(),
        },
      ]);

      if (dbError) {
        console.warn("Document record save warning:", dbError.message);
        // Don't fail if table doesn't exist, still return success
      }

      return {
        success: true,
        url: publicUrl,
        message: "Document uploaded successfully!",
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError("Failed to upload document. Please try again.", 400);
    }
  }
  // Register new vendor
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Sign up with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstname: data.firstname,
            lastname: data.lastname,
            phone: data.phone,
          },
        },
      });

      if (authError) {
        throw new APIError(authError.message, 400);
      }

      if (!authData.user) {
        throw new APIError("Registration failed", 400);
      }

      // Insert vendor profile into vendors table
      const { error: profileError } = await supabase.from("vendors").insert([
        {
          user_id: authData.user.id,
          email: data.email,
          firstname: data.firstname,
          lastname: data.lastname,
          phone: data.phone,
        },
      ]);

      if (profileError) {
        // Handle duplicate key violation (account already exists)
        if (profileError.code === "23505") {
          throw new APIError(
            "Account already exists. Please log in instead.",
            409,
          );
        }
        throw new APIError("Failed to create vendor profile", 400);
      }

      // Query for the vendor record to get its ID
      const { data: vendorDataArray, error: vendorQueryError } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", authData.user.id);

      if (
        vendorQueryError ||
        !vendorDataArray ||
        vendorDataArray.length === 0
      ) {
        throw new APIError("Failed to retrieve vendor ID", 400);
      }

      const vendorData = vendorDataArray[0];

      return {
        success: true,
        message: "Registration successful! Please verify your email.",
        data: {
          id: vendorData.id,
          email: authData.user.email || data.email,
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Registration failed. Please try again.", 400);
    }
  }
  // Register new USER (not vendor)
  async registerUser(data: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phone: string;
    address?: string;
  }): Promise<RegisterResponse> {
    try {
      // Sign up with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstname: data.firstname,
            lastname: data.lastname,
            phone: data.phone,
            user_type: "customer", // distinguish from vendors
          },
        },
      });

      if (authError) {
        throw new APIError(authError.message, 400);
      }

      if (!authData.user) {
        throw new APIError("Registration failed", 400);
      }

      // Insert user profile into users table
      const { error: profileError } = await supabase.from("users").insert([
        {
          user_id: authData.user.id,
          email: data.email,
          firstname: data.firstname,
          lastname: data.lastname,
          phone: data.phone,
          address: data.address || null,
        },
      ]);

      if (profileError) {
        // Handle duplicate key violation
        if (profileError.code === "23505") {
          throw new APIError(
            "Account already exists. Please log in instead.",
            409,
          );
        }
        throw new APIError("Failed to create user profile", 400);
      }

      // Query for the user record to get its ID
      const { data: userDataArray, error: userQueryError } = await supabase
        .from("users")
        .select("id")
        .eq("user_id", authData.user.id)
        .single();

      if (userQueryError || !userDataArray) {
        throw new APIError("Failed to retrieve user ID", 400);
      }

      return {
        success: true,
        message: "Registration successful!",
        data: {
          id: userDataArray.id,
          email: authData.user.email || data.email,
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Registration failed. Please try again.", 400);
    }
  }
  // Login vendor
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new APIError(error.message, 401);
      }

      if (!data.user || !data.session) {
        throw new APIError("Login failed", 401);
      }

      // Fetch vendor profile
      const { data: vendorDataArray, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", data.user.id);

      // Check if vendor profile exists - if not, user is not a vendor
      if (vendorError || !vendorDataArray || vendorDataArray.length === 0) {
        // Sign out the user since they're not a vendor
        await supabase.auth.signOut();
        throw new APIError(
          "This account is not registered as a vendor. Please use the correct login portal.",
          403
        );
      }

      const vendorData = vendorDataArray[0];

      return {
        success: true,
        message: "Login successful!",
        user: {
          id: data.user.id,
          email: data.user.email,
          ...vendorData,
        },
        token: data.session.access_token,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Login failed. Please check your credentials.", 401);
    }
  }
  // Login user (not vendor)
  async loginUser(email: string, password: string): Promise<LoginResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new APIError(error.message, 401);
      }

      if (!data.user || !data.session) {
        throw new APIError("Login failed", 401);
      }

      // Fetch user profile from users table
      const { data: userDataArray, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", data.user.id);

      // Check if user profile exists - if not, user is not a customer
      if (userError || !userDataArray || userDataArray.length === 0) {
        // Sign out the user since they're not a customer
        await supabase.auth.signOut();
        throw new APIError(
          "This account is not registered as a customer. Please use the correct login portal.",
          403
        );
      }

      const userData = userDataArray[0];

      return {
        success: true,
        message: "Login successful!",
        user: {
          id: data.user.id,
          email: data.user.email,
          ...userData,
        },
        token: data.session.access_token,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Login failed. Please check your credentials.", 401);
    }
  }
  // Request password reset
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new APIError(error.message, 400);
      }

      return { message: "Password reset email sent!" };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to send reset email. Please try again.", 400);
    }
  }

  // Verify OTP (for email verification)
  async verifyOTP(email: string, otp: string): Promise<{ message: string }> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        throw new APIError(error.message, 400);
      }

      return { message: "Email verified successfully!" };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("OTP verification failed. Please try again.", 400);
    }
  }

  // Get OTP for phone verification (if using Supabase phone auth)
  async getOTP(phone: string): Promise<GetOTPResponse> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) {
        throw new APIError(error.message, 400);
      }

      return {
        success: true,
        message: "OTP sent to your phone!",
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to send OTP. Please try again.", 400);
    }
  }

  // Reset password with token
  async resetPassword(
    _email: string,
    _token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new APIError(error.message, 400);
      }

      return { message: "Password reset successfully!" };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Password reset failed. Please try again.", 400);
    }
  }

  // Send OTP for password reset - using same method as signup
  async sendPasswordResetOTP(email: string): Promise<{ message: string }> {
    try {
      console.log("Attempting to send OTP to:", email);
      
      // Use the SAME method as signup - this sends a numeric OTP code
      const { error } = await supabase.auth.signUp({
        email,
        password: "TempPasswordForReset123!", // Temporary password, will be changed
        options: {
          emailRedirectTo: undefined, // This makes it send OTP instead of link
        },
      });

      console.log("OTP send response:", { error });

      if (error) {
        // If user already exists, that's fine - we still want to send OTP
        // Supabase will send OTP for existing users too
        if (error.message.includes("already registered")) {
          console.log("User exists, OTP should still be sent");
          // Store email for verification
          localStorage.setItem("password_reset_email", email);
          return { message: "OTP sent to your email!" };
        }
        console.error("OTP send error:", error);
        throw new APIError(error.message, 400);
      }

      // Store email for verification
      localStorage.setItem("password_reset_email", email);
      console.log("OTP sent successfully");

      return { message: "OTP sent to your email!" };
    } catch (error) {
      console.error("Caught error in sendPasswordResetOTP:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to send OTP. Please try again.", 400);
    }
  }

  // Verify OTP for password reset - using same method as signup
  async verifyPasswordResetOTP(
    email: string,
    otp: string,
  ): Promise<{ message: string; access_token?: string }> {
    try {
      console.log("Verifying OTP for:", email);
      console.log("Provided OTP:", otp);

      // Use the SAME verification method as signup
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email", // Same as signup
      });

      console.log("OTP verification response:", { data, error });

      if (error) {
        console.error("OTP verification error:", error);
        throw new APIError(error.message, 400);
      }

      console.log("OTP verified successfully!");

      // Store that OTP was verified
      localStorage.setItem("password_reset_verified", "true");
      
      return {
        message: "OTP verified successfully!",
        access_token: data.session?.access_token,
      };
    } catch (error) {
      console.error("OTP verification error:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("OTP verification failed. Please try again.", 400);
    }
  }

  // Reset password after OTP verification
  async resetPasswordWithOTP(newPassword: string): Promise<{ message: string }> {
    try {
      console.log("Attempting to reset password");

      // Check if OTP was verified
      const verified = localStorage.getItem("password_reset_verified");
      
      if (!verified) {
        throw new APIError("Please verify OTP first.", 400);
      }

      console.log("OTP verification confirmed, updating password");

      // Update the password using Supabase's updateUser
      // The user should be authenticated from the OTP verification
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Password update error:", error);
        throw new APIError(error.message, 400);
      }

      // Clean up
      localStorage.removeItem("password_reset_email");
      localStorage.removeItem("password_reset_verified");
      console.log("Password reset successful");

      return { message: "Password reset successfully!" };
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Password reset failed. Please try again.", 400);
    }
  }

  // Logout
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new APIError(error.message, 400);
    }
  }

  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      throw new APIError(error.message, 400);
    }
    return user;
  }

  // Verify vendor exists
  private async verifyVendorExists(vendorId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select("id")
        .eq("id", vendorId);

      return !error && !!data && data.length > 0;
    } catch {
      return false;
    }
  }

  // Save vendor profile details
  async saveProfileDetails(
    vendorId: string,
    profileData: Record<string, string | number>,
  ): Promise<Record<string, unknown>[] | null> {
    try {
      // Verify vendor exists before attempting to save profile
      const vendorExists = await this.verifyVendorExists(vendorId);
      if (!vendorExists) {
        throw new APIError(
          "Vendor account not found. Please register again.",
          404,
        );
      }
      const { data, error } = await supabase
        .from("vendor_profiles")
        .insert([
          {
            vendor_id: vendorId,
            business_name: profileData.businessName,
            how_to_address: profileData.howToAddress,
            full_name: profileData.fullName,
            business_email: profileData.businessEmail,
            country_name: profileData.country,
            business_phone: profileData.businessPhone,
            business_address: profileData.businessAddress,
            membership_id: profileData.membershipId,
          },
        ])
        .select();

      if (error) {
        if (error.code === "23505") {
          throw new APIError("Profile already exists for this account.", 409);
        }
        if (error.code === "23503") {
          throw new APIError(
            "Vendor account not found. Please register again.",
            404,
          );
        }
        throw new APIError(error.message, 400);
      }
      return data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError("Failed to save profile details", 400);
    }
  }

  // Upload vendor photo
  async uploadVendorPhoto(
    vendorId: string,
    file: File,
    photoType: "store_logo" | "store_cover",
  ): Promise<Record<string, unknown>[] | null> {
    try {
      const fileName = `${vendorId}/${photoType}/${Date.now()}_${file.name}`;

      // Try to upload, but don't fail if bucket doesn't exist
      let publicUrl = `https://acuqcetaduizgwchoosa.supabase.co/storage/v1/object/public/vendor-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("vendor-photos")
        .upload(fileName, file);

      // If upload fails due to bucket not existing, use placeholder
      if (uploadError) {
        console.warn("Photo upload warning:", uploadError.message);
        // Generate a placeholder URL
        publicUrl = `placeholder:${photoType}:${Date.now()}`;
      } else {
        // Get actual public URL if upload succeeded
        const { data: publicUrlData } = supabase.storage
          .from("vendor-photos")
          .getPublicUrl(fileName);
        publicUrl = publicUrlData.publicUrl;
      }

      // Try to save photo record
      const { data, error } = await supabase
        .from("vendor_photos")
        .insert([
          {
            vendor_id: vendorId,
            photo_type: photoType,
            photo_url: publicUrl,
            file_size: file.size,
            file_format: file.type,
          },
        ])
        .select();

      if (error) {
        // If vendor_photos table doesn't exist or vendor not found, just return success
        if (error.code === "23503" || error.code === "42P01") {
          console.warn("Photo table warning:", error.message);
          return [{ photo_type: photoType, photo_url: publicUrl }];
        }
        // For duplicate photos, still allow it
        if (error.code === "23505") {
          return [{ photo_type: photoType, photo_url: publicUrl }];
        }
        throw new APIError(error.message, 400);
      }
      return data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      // Allow upload to continue even if there's an error
      console.warn("Photo upload error (non-critical):", error);
      return [{ photo_type: photoType, success: true }];
    }
  }

  // Save business details
  async saveBusinessDetails(
    vendorId: string,
    details: { businessDescription: string; additionalInfo: string },
  ): Promise<Record<string, unknown>[] | null> {
    try {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .update({
          business_description: details.businessDescription,
        })
        .eq("vendor_id", vendorId)
        .select();

      if (error) {
        if (error.code === "23503") {
          throw new APIError(
            "Vendor account not found. Please register again.",
            404,
          );
        }
        throw new APIError(error.message, 400);
      }
      return data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError("Failed to save business details", 400);
    }
  }

  // Save availability
  async saveAvailability(
    vendorId: string,
    availability: Record<string, unknown>,
  ): Promise<Record<string, unknown>[] | null> {
    try {
      const { data, error } = await supabase
        .from("vendor_availability")
        .insert([
          {
            vendor_id: vendorId,
            day_from: availability.dayFrom,
            day_to: availability.dayTo,
            holidays_available: availability.holidaysAvailable === "yes",
            opening_time: availability.timeStart,
            closing_time: availability.timeEnd,
            total_workers: parseInt(availability.workers as string),
          },
        ])
        .select();

      if (error) {
        if (error.code === "23505") {
          throw new APIError("Availability already set for this account.", 409);
        }
        if (error.code === "23503") {
          throw new APIError(
            "Vendor account not found. Please register again.",
            404,
          );
        }
        throw new APIError(error.message, 400);
      }
      return data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError("Failed to save availability", 400);
    }
  }

  // Fetch vendor profile by vendor ID
  async getVendorProfile(
    vendorId: string,
  ): Promise<Record<string, unknown> | null> {
    try {
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId);

      if (vendorError || !vendor || vendor.length === 0) {
        throw new APIError("Vendor not found", 404);
      }

      const vendorData = vendor[0];

      // Fetch vendor profile details
      const { data: profile, error: profileError } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("vendor_id", vendorId);

      if (profileError) {
        console.warn("Profile fetch warning:", profileError.message);
      }

      const profileData = profile && profile.length > 0 ? profile[0] : {};

      // Combine vendor and profile data
      return {
        ...vendorData,
        ...profileData,
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError("Failed to fetch vendor profile", 400);
    }
  }
}

// Export a single instance
export const apiService = new AuthService();

// Also create an authService alias for backward compatibility
export const authService = {
  login: (email: string, password: string) => apiService.login(email, password),
  loginUser: (email: string, password: string) =>
    apiService.loginUser(email, password), // ADD THIS LINE
  register: (data: RegisterRequest) => apiService.register(data),
  registerUser: (data: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phone: string;
    address?: string;
  }) => apiService.registerUser(data),
  uploadRiderDocument: (
    riderId: string,
    file: File,
    documentType: "drivers_license" | "selfie",
  ) => apiService.uploadRiderDocument(riderId, file, documentType),
  loginRider: (email: string, password: string) =>
    apiService.loginRider(email, password), // NEW

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerRider: (data: any) => apiService.registerRider(data), // NEW
  sendEmailOTP: (email: string, password?: string) =>
    apiService.sendEmailOTP(email, password),
  createInitialRiderProfile: (userId: string, email: string) =>
    apiService.createInitialRiderProfile(userId, email),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateRiderProfile: (riderId: string, data: any) =>
    apiService.updateRiderProfile(riderId, data),
  forgotPassword: (email: string) => apiService.forgotPassword(email),
  verifyOTP: (email: string, otp: string) => apiService.verifyOTP(email, otp),

  verifyEmailOTP: (email: string, otp: string) =>
    apiService.verifyEmailOTP(email, otp),

  getOTP: (phone: string) => apiService.getOTP(phone),
  resetPassword: (email: string, token: string, newPassword: string) =>
    apiService.resetPassword(email, token, newPassword),
  // New OTP-based password reset methods
  sendPasswordResetOTP: (email: string) =>
    apiService.sendPasswordResetOTP(email),
  verifyPasswordResetOTP: (email: string, otp: string) =>
    apiService.verifyPasswordResetOTP(email, otp),
  resetPasswordWithOTP: (newPassword: string) =>
    apiService.resetPasswordWithOTP(newPassword),
  logout: () => apiService.logout(),
  getCurrentUser: () => apiService.getCurrentUser(),
  saveProfileDetails: (
    vendorId: string,
    profileData: Record<string, string | number>,
  ) => apiService.saveProfileDetails(vendorId, profileData),
  uploadVendorPhoto: (
    vendorId: string,
    file: File,
    photoType: "store_logo" | "store_cover",
  ) => apiService.uploadVendorPhoto(vendorId, file, photoType),
  saveBusinessDetails: (
    vendorId: string,
    details: { businessDescription: string; additionalInfo: string },
  ) => apiService.saveBusinessDetails(vendorId, details),
  saveAvailability: (vendorId: string, availability: Record<string, unknown>) =>
    apiService.saveAvailability(vendorId, availability),
  getVendorProfile: (vendorId: string) => apiService.getVendorProfile(vendorId),
};

export type { GetOTPResponse } from "../types/api.types";
