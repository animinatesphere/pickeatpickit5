# PickitPickEat

A comprehensive food delivery platform connecting customers, vendors (restaurants), and delivery riders. Built with React, TypeScript, and Supabase.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [User Roles](#user-roles)
- [Features](#features)
- [Routes](#routes)
- [Database Schema](#database-schema)
- [API Services](#api-services)
- [Real-Time Features](#real-time-features)
- [Payment Integration](#payment-integration)
- [Theming](#theming)

## Overview

PickitPickEat is a full-featured food ordering and delivery platform that supports four user roles:

- **Customers** browse restaurants, order food, pay online or with cash, and track deliveries in real time.
- **Vendors** manage their restaurant profile, menu items, incoming orders, earnings, and payouts.
- **Riders** accept delivery requests, navigate with Google Maps, track daily earnings, and manage payouts.
- **Admins** oversee the entire platform — approve vendors/riders, monitor transactions, view analytics, and manage users.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Language | TypeScript 5 |
| Build Tool | Vite 7 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4 (dark mode via `class` strategy) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| Backend / DB | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Payments | Paystack |
| Maps | Google Maps API |

## Project Structure

```
src/
├── admin/                  # Admin panel (dashboard, login, management pages)
├── auth/                   # Vendor auth (login, signup, forgot/reset password)
├── component/              # Shared components (Navbar, ChatBubble, Toast, etc.)
├── components/             # Global theme toggle
├── config/                 # Paystack configuration
├── context/                # React context providers (Theme, Toast)
├── home/                   # Landing page and role selection
├── pages/                  # Static footer pages (About, Careers, Privacy, Terms)
├── ride/                   # Rider features (dashboard, orders, map, earnings, chat)
├── rider/                  # Rider onboarding welcome screens
├── services/               # API functions and auth service (Supabase client calls)
├── types/                  # TypeScript interfaces and type definitions
├── user/                   # Customer features (dashboard, market, cart, profile, booking)
├── utils/                  # Error handling utilities
├── vendor/                 # Vendor features (dashboard, menu, orders, earnings, chat)
├── App.tsx                 # Root component with providers
├── AppRoutes.tsx           # All route definitions
├── main.tsx                # Application entry point
└── index.css               # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd PickitPickEat

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=<your-paystack-public-key>

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

## User Roles

### Customer (User)

Customers can browse vendors, add items to cart, place orders, pay via Paystack or cash on delivery, and track their deliveries in real time.

### Vendor (Restaurant)

Vendors register and await admin approval. Once approved, they can manage their menu (add/edit/delete items with images), process incoming orders, track earnings, and request payouts.

### Rider (Delivery Personnel)

Riders complete a 6-step onboarding flow, provide guarantor and bank details, and await admin approval. Once accepted, they can view available deliveries, accept orders, navigate via Google Maps, and track earnings.

### Admin

Admins have full platform oversight — approving/rejecting vendors and riders, managing all users, viewing order and revenue analytics, processing payout requests, and restricting accounts.

## Features

### Customer Features
- Email/password signup with OTP verification
- Browse restaurants and menu items
- Shopping cart and checkout
- Paystack (card) and cash on delivery payments
- Real-time order status tracking
- In-app chat with vendors and riders
- Wallet management
- Favorite/bookmark vendors
- Order history and booking management
- Profile and device management
- Support tickets

### Vendor Features
- Restaurant registration with admin approval workflow
- Menu management with image uploads (Supabase Storage)
- Real-time order notifications and management
- Earnings dashboard and payout requests
- Chat with customers and riders
- Availability and business hour settings
- Reviews and ratings
- Device and session management

### Rider Features
- 6-step onboarding welcome flow
- Accept/reject available deliveries
- Google Maps integration for navigation
- Daily earnings tracker
- Bank information management for payouts
- Availability toggle (online/offline)
- Guarantor (next of kin) information
- Chat with customers and vendors

### Admin Features
- Dashboard with real-time platform statistics
- User, vendor, and rider management (approve/restrict/delete)
- Order management and detailed order views
- Revenue analytics (daily, weekly, monthly, yearly)
- Transaction history and payout approvals
- Top users and popular items reports
- Content management

## Routes

### Public
| Route | Page |
|-------|------|
| `/` | Landing page |
| `/about` | About us |
| `/careers` | Careers |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/forgot-password` | Password reset |

### Customer
| Route | Page |
|-------|------|
| `/signup` | Registration |
| `/login` | Login |
| `/user-dashboard` | Home dashboard |
| `/market` | Restaurant marketplace |
| `/search` | Food search |
| `/cart` | Shopping cart |
| `/payment` | Checkout |
| `/booking` | Order history |
| `/inbox` | Chat |
| `/profile` | User profile |
| `/profile-edit` | Edit profile |
| `/wallet` | Wallet |
| `/notification` | Notifications |
| `/support` | Support tickets |
| `/device` | Device management |

### Vendor
| Route | Page |
|-------|------|
| `/vendor-signup` | Registration |
| `/vendor-login` | Login |
| `/vendor-dashboard` | Main dashboard |
| `/menu` | Menu management |
| `/order` | Order management |
| `/orderhistory` | Order history |
| `/earning` | Earnings and payouts |
| `/vendor-chat` | Chat |
| `/vendor-profile` | Account settings |
| `/ProfileSetting` | Profile customization |
| `/reviews` | Customer reviews |
| `/Support-vendor` | Support |
| `/DevicesSession` | Device management |
| `/smsg` | Notifications |

### Rider
| Route | Page |
|-------|------|
| `/onboarding` | Welcome screens (6 steps) |
| `/rider-registration` | Signup |
| `/rider-login` | Login |
| `/rider-dashboard` | Main dashboard |
| `/rider-order` | Available deliveries |
| `/map` | Delivery map (Google Maps) |
| `/daily-rider` | Daily statistics |
| `/rider-earning` | Earnings |
| `/rider-chat` | Chat |
| `/rider-profile` | Profile |
| `/rider-profilesetting` | Settings |
| `/rider-notifications` | Notifications |
| `/rider-support` | Support |
| `/rider-device` | Device management |

### Admin
| Route | Page |
|-------|------|
| `/admin-login` | Login |
| `/admin-dashboard` | Dashboard (users, orders, analytics, transactions, payouts, restrictions) |

## Database Schema

The application uses Supabase (PostgreSQL) with Row Level Security (RLS) policies. Key tables:

### Users & Auth

| Table | Description |
|-------|-------------|
| `users` | Customer profiles (name, email, phone, address) |
| `vendors` | Vendor accounts with approval status (pending/approved/rejected) |
| `vendor_profiles` | Extended vendor info (business name, address, logo, cover image) |
| `vendor_availability` | Business hours and worker count |
| `vendor_bank_info` | Vendor bank details for payouts |
| `riders` | Rider accounts with vehicle info and approval status (pending/accepted/rejected) |
| `rider_bank_info` | Rider bank details for payouts |
| `rider_guarantors` | Rider next-of-kin / guarantor information |

### Orders & Menu

| Table | Description |
|-------|-------------|
| `menu_items` | Food items (name, description, price, category, image, availability) |
| `orders` | Orders linking customer, vendor, and rider with payment and status info |
| `order_items` | Individual items within an order (quantity, price at time of order) |
| `order_status_updates` | Status change history with timestamps |
| `user_favorites` | Customer-vendor bookmark relationships |

### Communication

| Table | Description |
|-------|-------------|
| `conversations` | Chat threads with metadata and last message preview |
| `conversation_participants` | Users in each conversation |
| `messages` | Individual messages (text, media URL, sender, timestamp) |

### Financial

| Table | Description |
|-------|-------------|
| `transactions` | All platform transactions (payments, payouts, transfers) with commission tracking |
| `payout_requests` | Vendor/rider payout requests with approval status |

## API Services

All backend interactions go through two service files:

### Auth Service (`src/services/authService.ts`)

| Function | Description |
|----------|-------------|
| `registerUser()` | Customer signup with email/password |
| `registerVendor()` | Vendor signup |
| `registerRider()` | Rider signup |
| `loginUser()` / `login()` / `loginRider()` | Role-specific login |
| `logout()` | Sign out |
| `sendEmailOTP()` / `verifyEmailOTP()` / `resendOtp()` | OTP verification |

### API Service (`src/services/api.ts`)

**Menu Management:** `addMenuItem()`, `updateMenuItem()`, `deleteMenuItem()`, `getMenuItems()`, `uploadMenuImage()`

**Orders:** `createOrder()`, `getVendorOrders()`, `getUserOrders()`, `getOrderDetails()`, `updateOrderStatus()`, `riderAcceptOrder()`, `riderRejectOrder()`, `getAvailableDeliveries()`

**User Profiles:** `getUserProfile()`, `updateUserProfile()`, `createUserProfileIfNotExists()`

**Chat:** `getConversations()`, `getMessages()`, `sendMessage()`, `createConversation()`, `startDirectConversation()`, `searchUserByPhone()`, `subscribeToMessages()`

**Rider:** `getRiderStats()`, `getRiderTransactions()`, `getRiderBankInfo()`, `saveRiderBankInfo()`, `getRiderEarningsHistory()`

**Admin:** `getAdminStats()`, `getAllOrders()`, `getRevenueAnalytics()`, `getTopUsers()`, `getPopularItems()`, `getAllSystemUsers()`, `updateRiderStatus()`, `deleteUserFromSystem()`, `getAllTransactions()`, `getPayoutRequests()`, `updatePayoutStatus()`, `getPlatformTotals()`

## Real-Time Features

The app leverages Supabase Realtime for:

- **Chat messaging** — Messages are delivered instantly via Supabase channel subscriptions (`subscribeToMessages()`).
- **Unread message count** — The floating chat bubble (`ChatFloatingBubble`) shows a live badge with unread message count.
- **Order status updates** — Order status changes are tracked and reflected in real time.

## Payment Integration

Payments are processed through **Paystack**:

- **Card payments** — Customers pay via Paystack's inline checkout.
- **Cash on delivery** — Orders can be placed without online payment.
- **Payment tracking** — Each order stores `is_paid`, `payment_method`, and `payment_reference` fields.
- **Payouts** — Vendors and riders can request payouts through the platform, approved by admins.

## Theming

The app supports **dark and light mode** via Tailwind CSS `class` strategy:

- Theme preference is persisted in `localStorage`.
- System preference is detected on first visit.
- A global toggle button is available on all pages.
- The `ThemeProvider` context manages theme state across the app.

## Order Lifecycle

```
1. Customer places order          -> status: "pending"
2. Vendor accepts                 -> status: "accepted"
3. Vendor starts preparing        -> status: "preparing"
4. Rider picks up                 -> status: "picked_up"
5. Rider delivers                 -> status: "completed"

   (At any point, order can be)   -> status: "cancelled"
```

## License

This project is proprietary. All rights reserved.
