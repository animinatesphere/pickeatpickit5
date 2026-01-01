// src/types/api.types.ts

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
  firstname?: string;
  lastname?: string;
  address?: string;
  fullname?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: {
    id: string;
    email: string;
    fullname?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    fullname: string;
    phone?: string;
  };
}

export interface ApiError {
  message: string;
  status: number;
}

export interface GetOTPResponse {
  success?: boolean;
  message?: string;
  otp?: string;
  OTP?: string;
  otpCode?: string;
}
