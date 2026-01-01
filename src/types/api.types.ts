// src/types/api.types.ts

export interface RegisterRequest {
  email: string;
  fullname: string;
  password: string;
  phone: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    fullname: string;
    phone: string;
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
