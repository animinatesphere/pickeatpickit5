import api from './api';
import { APIError } from './authService';

// Types for backend authentication
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
  };
}

export interface OTPRequest {
  email: string;
}

export interface OTPVerify {
  email: string;
  otp_code: string;
}

// JWT Token payload interface
export interface JwtPayload {
  sub: string;           // user_id
  user_id: string;
  email: string;
  role: string;
  firstname?: string;
  lastname?: string;
  vendor_id?: string;
  rider_id?: string;
  business_name?: string;
  exp: number;           // expiration timestamp
}

// Helper function to decode JWT token
function decodeJwtToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

// Backend API Authentication Service
class BackendAuthService {
  
  // Login with email and password (general login)
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data && response.data.access_token) {
        // Store token for future requests
        localStorage.setItem('authToken', response.data.access_token);
        
        // Decode token to get user context
        const tokenPayload = decodeJwtToken(response.data.access_token);
        
        // Store user data for current user retrieval
        const userData: UserData = {
          id: tokenPayload?.user_id || response.data.user?.id,
          email: tokenPayload?.email || response.data.user?.email,
          firstname: tokenPayload?.firstname || response.data.user?.firstname,
          lastname: tokenPayload?.lastname || response.data.user?.lastname,
          phone: response.data.user?.phone,
          is_verified: response.data.user?.is_verified ?? true,
          role: tokenPayload?.role || 'customer',
          vendor_id: tokenPayload?.vendor_id,
          rider_id: tokenPayload?.rider_id,
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        return {
          success: true,
          message: 'Login successful',
          token: response.data.access_token,
          user: userData
        };
      }
      
      throw new APIError('Invalid response from server', 500);
      
    } catch (error: any) {
      console.error('Backend login error:', error);
      
      if (error.response?.data?.detail) {
        throw new APIError(error.response.data.detail, error.response.status);
      }
      
      throw new APIError(
        error.message || 'Login failed. Please check your credentials.',
        error.response?.status || 500
      );
    }
  }

  // Vendor-specific login with enhanced response
  async vendorLogin(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/vendor/login', { email, password });
      
      if (response.data && response.data.access_token) {
        // Store token for future requests
        localStorage.setItem('authToken', response.data.access_token);
        
        // Decode token to get user context
        const tokenPayload = decodeJwtToken(response.data.access_token);
        
        // Store user data for current user retrieval
        const userData: UserData = {
          id: tokenPayload?.user_id || response.data.user?.id,
          email: tokenPayload?.email || response.data.user?.email,
          firstname: tokenPayload?.firstname || response.data.user?.firstname,
          lastname: tokenPayload?.lastname || response.data.user?.lastname,
          phone: response.data.user?.phone,
          is_verified: response.data.user?.is_verified ?? true,
          role: 'vendor',
          vendor_id: tokenPayload?.vendor_id || response.data.vendor?.id,
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Store vendor data separately if available
        if (response.data.vendor) {
          localStorage.setItem('vendorData', JSON.stringify(response.data.vendor));
        }
        
        return {
          success: true,
          message: 'Vendor login successful',
          token: response.data.access_token,
          user: userData,
          vendor: response.data.vendor
        };
      }
      
      throw new APIError('Invalid response from server', 500);
      
    } catch (error: any) {
      console.error('Vendor login error:', error);
      
      if (error.response?.data?.detail) {
        throw new APIError(error.response.data.detail, error.response.status);
      }
      
      throw new APIError(
        error.message || 'Vendor login failed. Please check your credentials.',
        error.response?.status || 500
      );
    }
  }

  // Register new user
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post('/auth/register', data);
      
      return {
        success: true,
        message: 'Registration successful! Please verify your email.',
        data: response.data
      };
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Backend registration error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Registration failed. Please try again.',
        err.response?.status || 500
      );
    }
  }

  // Customer-specific login
  async customerLogin(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/customer/login', { email, password });
      
      if (response.data && response.data.access_token) {
        // Store token for future requests
        localStorage.setItem('authToken', response.data.access_token);
        
        // Decode token to get user context
        const tokenPayload = decodeJwtToken(response.data.access_token);
        
        // Store user data
        const userData: UserData = {
          id: tokenPayload?.user_id || response.data.user?.id,
          email: tokenPayload?.email || response.data.user?.email,
          firstname: tokenPayload?.firstname || response.data.user?.firstname,
          lastname: tokenPayload?.lastname || response.data.user?.lastname,
          phone: response.data.user?.phone,
          is_verified: response.data.user?.is_verified ?? true,
          role: 'customer',
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        return {
          success: true,
          message: 'Customer login successful',
          token: response.data.access_token,
          user: userData
        };
      }
      
      throw new APIError('Invalid response from server', 500);
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Customer login error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Customer login failed. Please check your credentials.',
        err.response?.status || 500
      );
    }
  }

  // Customer registration - sends OTP automatically
  async customerRegister(data: { email: string; password: string }): Promise<RegisterResponse> {
    try {
      const response = await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        role: 'customer'
      });
      
      return {
        success: true,
        message: 'Registration successful! Please verify your email.',
        data: response.data
      };
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Customer registration error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Registration failed. Please try again.',
        err.response?.status || 500
      );
    }
  }

  // Update user profile (requires authentication)
  async updateProfile(data: {
    firstname?: string;
    lastname?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
  }): Promise<{ success: boolean; message: string; user?: UserData }> {
    try {
      const response = await api.patch('/auth/profile', data);
      
      // Update stored user data
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        message: response.data.message || 'Profile updated successfully',
        user: response.data.user
      };
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Profile update error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to update profile. Please try again.',
        err.response?.status || 500
      );
    }
  }

  // Send OTP for email verification
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await api.post('/auth/send-otp', { email });
      
      return {
        success: true,
        message: 'OTP sent successfully! Please check your email.'
      };
      
    } catch (error: any) {
      console.error('Backend send OTP error:', error);
      
      if (error.response?.data?.detail) {
        throw new APIError(error.response.data.detail, error.response.status);
      }
      
      throw new APIError(
        error.message || 'Failed to send OTP. Please try again.',
        error.response?.status || 500
      );
    }
  }

  // Verify OTP code
  async verifyOTP(email: string, otpCode: string): Promise<{ success: boolean; message: string }> {
    try {
      await api.post('/auth/verify-otp', { email, otp_code: otpCode });
      
      return {
        success: true,
        message: 'Email verified successfully!'
      };
      
    } catch (error: any) {
      console.error('Backend verify OTP error:', error);
      
      if (error.response?.data?.detail) {
        throw new APIError(error.response.data.detail, error.response.status);
      }
      
      throw new APIError(
        error.message || 'OTP verification failed. Please try again.',
        error.response?.status || 500
      );
    }
  }

  // Get current user profile (authenticated)
  async getCurrentUser(): Promise<UserData | null> {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (!token) {
        throw new APIError('No authentication token found', 401);
      }
      
      if (!userData) {
        // Try to get user from token
        const tokenPayload = decodeJwtToken(token);
        if (tokenPayload) {
          return {
            id: tokenPayload.user_id,
            email: tokenPayload.email,
            firstname: tokenPayload.firstname || null,
            lastname: tokenPayload.lastname || null,
            phone: null,
            is_verified: true,
            role: tokenPayload.role,
            vendor_id: tokenPayload.vendor_id,
            rider_id: tokenPayload.rider_id,
          };
        }
        throw new APIError('No user data found. Please login again.', 401);
      }
      
      // Return the stored user data from login
      return JSON.parse(userData);
      
    } catch (error: any) {
      console.error('Backend get current user error:', error);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError(
        error.message || 'Failed to fetch user profile.',
        500
      );
    }
  }

  // Get current vendor data
  async getCurrentVendor(): Promise<VendorData | null> {
    try {
      const vendorData = localStorage.getItem('vendorData');
      
      if (vendorData) {
        return JSON.parse(vendorData);
      }
      
      // If not stored, get from user data
      const userData = await this.getCurrentUser();
      if (userData?.vendor_id) {
        return {
          id: userData.vendor_id,
          business_name: null,
          business_email: null,
          business_phone: null,
          business_address: null,
          status: 'active',
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Get current vendor error:', error);
      return null;
    }
  }

  // Get user context from token
  getTokenContext(): JwtPayload | null {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return decodeJwtToken(token);
  }

  // Logout (clear local storage)
  async logout(): Promise<{ success: boolean; message: string }> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('vendorData');
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Get authentication token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Set authentication token (for external use)
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Register vendor profile (after user is created and verified)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async registerVendor(vendorData: any): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('Registering vendor with data:', vendorData);
      
      const response = await api.post('/vendors/', vendorData);
      
      console.log('Vendor registration response:', response.data);
      
      return {
        success: true,
        message: 'Vendor profile created successfully!',
        data: response.data
      };
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Vendor registration error:', error);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to create vendor profile. Please try again.',
        err.response?.status || 500
      );
    }
  }

  // ============ CUSTOMER DASHBOARD METHODS ============

  // Get user profile
  async getProfile(): Promise<UserData> {
    try {
      const response = await api.get('/auth/profile');
      
      const userData: UserData = {
        id: response.data.id,
        email: response.data.email,
        firstname: response.data.firstname,
        lastname: response.data.lastname,
        phone: response.data.phone,
        is_verified: response.data.is_verified,
        role: 'customer',
      };
      
      return userData;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Get profile error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to get profile.',
        err.response?.status || 500
      );
    }
  }

  // Get user favorites
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getFavorites(): Promise<any[]> {
    try {
      const response = await api.get('/customer/favorites');
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Get favorites error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to get favorites.',
        err.response?.status || 500
      );
    }
  }

  // Add favorite vendor
  async addFavorite(vendorId: string): Promise<{ message: string; vendor_id: string }> {
    try {
      const response = await api.post('/customer/favorites', { vendor_id: vendorId });
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Add favorite error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to add favorite.',
        err.response?.status || 500
      );
    }
  }

  // Remove favorite vendor
  async removeFavorite(vendorId: string): Promise<{ message: string; vendor_id: string }> {
    try {
      const response = await api.delete(`/customer/favorites/${vendorId}`);
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Remove favorite error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to remove favorite.',
        err.response?.status || 500
      );
    }
  }

  // Get vendors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getVendors(limit: number = 8): Promise<any[]> {
    try {
      const response = await api.get(`/customer/vendors?limit=${limit}`);
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Get vendors error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to get vendors.',
        err.response?.status || 500
      );
    }
  }

  // Get menu items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMenuItems(limit: number = 10, vendorId?: string): Promise<any[]> {
    try {
      let url = `/customer/menu-items?limit=${limit}`;
      if (vendorId) {
        url += `&vendor_id=${vendorId}`;
      }
      const response = await api.get(url);
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Get menu items error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to get menu items.',
        err.response?.status || 500
      );
    }
  }

  // Get offers (menu items with discount)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getOffers(limit: number = 5): Promise<any[]> {
    try {
      const response = await api.get(`/customer/offers?limit=${limit}`);
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Get offers error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to get offers.',
        err.response?.status || 500
      );
    }
  }

  // ============ PROMO CODES ============

  // Validate promo code
  async validatePromoCode(code: string): Promise<{ valid: boolean; code: string; discount_type: string; discount_value: number; message?: string }> {
    try {
      const response = await api.get(`/customer/promo-codes/${code}`);
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Validate promo code error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to validate promo code.',
        err.response?.status || 500
      );
    }
  }

  // ============ ORDERS ============

  // Get customer orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getOrders(): Promise<any[]> {
    try {
      const response = await api.get('/customer/orders');
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Get orders error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to get orders.',
        err.response?.status || 500
      );
    }
  }

  // Get specific order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getOrder(orderId: string): Promise<any> {
    try {
      const response = await api.get(`/customer/orders/${orderId}`);
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Get order error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to get order.',
        err.response?.status || 500
      );
    }
  }

  // Get order tracking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getOrderTracking(orderId: string): Promise<any[]> {
    try {
      const response = await api.get(`/customer/orders/${orderId}/tracking`);
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Get order tracking error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to get order tracking.',
        err.response?.status || 500
      );
    }
  }

  // ============ PAYMENTS ============

  // Initialize payment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async initializePayment(paymentData: any): Promise<any> {
    try {
      const response = await api.post('/customer/payments/initialize', paymentData);
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Initialize payment error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to initialize payment.',
        err.response?.status || 500
      );
    }
  }

  // Verify payment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await api.get(`/customer/payments/verify/${reference}`);
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Verify payment error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to verify payment.',
        err.response?.status || 500
      );
    }
  }

  // Get payment history
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPaymentHistory(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await api.get(`/customer/payments/history?limit=${limit}&offset=${offset}`);
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Get payment history error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to get payment history.',
        err.response?.status || 500
      );
    }
  }

  // Get vendor payment history
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getVendorPaymentHistory(vendorId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await api.get(`/customer/vendors/${vendorId}/payments?limit=${limit}&offset=${offset}`);
      return response.data;
      
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      console.error('Get vendor payment history error:', error);
      
      if (err.response?.data?.detail) {
        throw new APIError(err.response.data.detail, err.response.status || 500);
      }
      
      throw new APIError(
        err.message || 'Failed to get vendor payment history.',
        err.response?.status || 500
      );
    }
  }
}

// Export a single instance
export const backendAuthService = new BackendAuthService();

export default BackendAuthService;