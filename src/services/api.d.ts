// // Type declarations for api.ts module

// import { AxiosResponse } from 'axios';

// // Generic API response type
// export interface ApiResponse<T = any> {
//   data: T;
//   error?: any;
// }

// // Authentication
// export function registerUser(userData: any): Promise<AxiosResponse>;
// export function sendOTP(email: string): Promise<AxiosResponse>;
// export function verifyOTP(otpData: any): Promise<AxiosResponse>;

// // Vendor Management
// export function registerVendor(vendorData: any): Promise<AxiosResponse>;
// export function getVendors(status?: string): Promise<AxiosResponse>;
// export function getVendorById(id: string): Promise<AxiosResponse>;
// export function updateVendor(id: string, updates: any): Promise<AxiosResponse>;

// // Menu Management
// export function addMenuItem(itemData: any): Promise<AxiosResponse>;
// export function createMenuItem(itemData: any): Promise<AxiosResponse>;
// export function getMenuItems(vendorId?: string): Promise<AxiosResponse>;
// export function getMenuItemById(id: string): Promise<AxiosResponse>;
// export function updateMenuItem(id: string, updates: any): Promise<AxiosResponse>;
// export function deleteMenuItem(id: string): Promise<AxiosResponse>;

// // Order Management
// export function createOrder(orderData: any): Promise<AxiosResponse>;
// export function getOrders(params?: any): Promise<AxiosResponse>;
// export function getOrderById(id: string): Promise<AxiosResponse>;
// export function updateOrderStatus(id: string, updates: any): Promise<AxiosResponse>;

// // Vendor Dashboard & Management
// export function getVendorDashboardStats(): Promise<AxiosResponse>;
// export function getVendorProfile(vendorId: string): Promise<AxiosResponse>;
// export function updateVendorProfile(vendorId: string, updates: any): Promise<AxiosResponse>;

// // Vendor Order Management (Backend)
// export function getVendorOrdersBackend(vendorId: string): Promise<AxiosResponse>;
// export function getVendorOrderTracking(orderId: string): Promise<AxiosResponse>;
// export function addOrderTrackingUpdate(orderId: string, trackingData: any): Promise<AxiosResponse>;

// // Vendor System (Supabase)
// export function getVendorOrders(vendorId: string): Promise<{ data: any; error: any }>;
// export function getVendorMenu(vendorId: string): Promise<{ data: any; error: any }>;
// export function updateVendorMenu(vendorId: string, menuData: any): Promise<{ data: any; error: any }>;

// // Rider Management
// export function getRiderOrders(riderId: string): Promise<AxiosResponse>;
// export function assignRiderToOrder(orderId: string, riderId: string): Promise<AxiosResponse>;
// export function getRiderById(id: string): Promise<AxiosResponse>;
// export function getAllRiders(): Promise<AxiosResponse>;

// // Admin Functions
// export function getAdminStats(): Promise<AxiosResponse>;
// export function getRevenueAnalytics(params?: any): Promise<AxiosResponse>;
// export function getAllOrders(params?: any): Promise<AxiosResponse>;
// export function getAdminOrderDetails(orderId: string): Promise<AxiosResponse>;
// export function getAdminUsers(params?: any): Promise<AxiosResponse>;
// export function getAdminVendors(params?: any): Promise<AxiosResponse>;
// export function getAdminRiders(params?: any): Promise<AxiosResponse>;
// export function getAllSystemUsers(params?: any): Promise<AxiosResponse>;
// export function updateRiderStatus(riderId: string, status: string): Promise<AxiosResponse>;
// export function deleteUserFromSystem(userId: string): Promise<AxiosResponse>;

// // Chat/Messaging
// export function getConversations(userId: string): Promise<AxiosResponse>;
// export function subscribeToMessages(chatId: string, callback: (payload: any) => void): any;
// export function sendMessage(data: any): Promise<AxiosResponse>;

// // Payment related
// export function initializePayment(paymentData: any): Promise<AxiosResponse>;
// export function verifyPayment(reference: string): Promise<AxiosResponse>;
// export function getPaymentHistory(userId: string): Promise<AxiosResponse>;

// // Promo Codes
// export function validatePromoCode(code: string): Promise<AxiosResponse>;

// // User Management
// export function getUserProfile(userId: string): Promise<AxiosResponse>;
// export function updateUserProfile(userId: string, updates: any): Promise<AxiosResponse>;

// // Rider specific
// export function riderAcceptOrder(orderId: string): Promise<AxiosResponse>;
// export function getAvailableDeliveries(): Promise<AxiosResponse>;
// export function riderRejectOrder(orderId: string): Promise<AxiosResponse>;
// export function getRiderStats(): Promise<AxiosResponse>;

// // Customer specific
// export function fetchVendorDetails(vendorId: string): Promise<AxiosResponse>;
// export function createCustomerOrder(orderData: any): Promise<AxiosResponse>;
