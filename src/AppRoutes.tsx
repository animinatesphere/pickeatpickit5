import { Routes, Route } from "react-router-dom";
import LandingPage from "./home/LandingPage";

import Signup from "./user/signup/Signup";
// import Login from "./auth/login/VendorLogin";
import UserDashboard from "./user/user-dashboard/UserDashboard";

import { Rider1 } from "./rider/Rider1";
import { Rider2 } from "./rider/Rider2";
import { Rider3 } from "./rider/Rider3";
import { Rider4 } from "./rider/Rider4";
import { Rider5 } from "./rider/Rider5";
import { Rider6 } from "./rider/Rider6";
// import Signup from "./auth/sigup/VendorSignup";
import VendorSignup from "./auth/sigup/VendorSignup";
import VendorLogin from "./auth/login/VendorLogin";
import VendorDashboard from "./vendor/dashboard/VendorDashboard";
import Login from "./user/login/Login";
import SearchComponent from "./user/component/SearchComponent";
import Home from "./user/home/Home";
import MArket from "./user/market/MArket";
import ChatApp from "./user/component/ChatApp";
import Notification from "./user/component/Notification";
import FoodCartApp from "./user/component/FoodCartApp";
import PaymentComponent from "./user/component/PaymentComponent";
import Profile from "./user/Profile";
import ProfileEditForm from "./user/ProfileEditForm";
import Support from "./user/Support";
import WalletComponent from "./user/component/WalletComponent";
import Booking from "./user/Booking";
import OrdersManagement from "./vendor/pages/OrdersManagement";
import Account from "./vendor/pages/Account";
import ProfileSetting from "./vendor/pages/ProfileSetting";
import OrderHistory from "./vendor/pages/OrderHistory";
import SupportPage from "./vendor/pages/SupportPage";
import DevicesAndSessions from "./vendor/pages/DevicesAndSessions";
import RestaurantMenu from "./vendor/pages/RestaurantMenu";
import EarningsPayment from "./vendor/pages/EarningsPayment";
import ReviewsPage from "./vendor/pages/ReviewsPage";
import NotificationsPage from "./vendor/pages/NotificationsPage";
import OnboardingScreen from "./ride/rideWelcome/OnboardingScreen";
import RiderRegistration from "./ride/rideWelcome/RiderRegistration";
import RiderLogin from "./ride/login/RiderLogin";
import RiderDashboard from "./ride/riderDasboard/RiderDashboard";
import RiderOrder from "./ride/pages/RiderOrder";
import FoodDeliveryMap from "./ride/pages/FoodDeliveryMap";
import ProfileScreen from "./ride/pages/ProfileScreen";
import DeliveryNotifications from "./ride/pages/DeliveryNotifications";
import RiderProfileSettings from "./ride/pages/RiderProfileSettings";
import DailyRiderApp from "./ride/pages/DailyRiderApp";
import RiderEarningsPayment from "./ride/pages/RiderEarningsPayment";
import RiderDevice from "./ride/pages/RiderDevice";
import RiderSupport from "./ride/pages/RiderSupport";
import SettingsScreen from "./ride/pages/SettingsScreen";
import AdminDashboard from "./admin/dashboard/AdminDashboard";
import AdminLogin from "./admin/login/AdminLogin";
import VendorChat from "./vendor/pages/VendorChat";
import ForgotPassword from "./auth/ForgotPassword";
import Device from "./user/component/Device";
import RiderChat from "./ride/pages/RiderChat";

// Footer Pages
import About from "./pages/About";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

const AppRoutes = () => {
  return (
    <Routes>
      {/* normal user */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/user-home" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/search" element={<SearchComponent />} />
      <Route path="/market" element={<MArket />} />
      <Route path="/inbox" element={<ChatApp />} />
      <Route path="/notification" element={<Notification />} />
      <Route path="/cart" element={<FoodCartApp />} />
      <Route path="/payment" element={<PaymentComponent />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/device" element={<Device />} />
      <Route path="/profile-edit" element={<ProfileEditForm />} />
      <Route path="/support" element={<Support />} />
      <Route path="/wallet" element={<WalletComponent />} />
      <Route path="/booking" element={<Booking />} />

      {/* Password Reset Route - Shared by all user types */}
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* vendor */}

      <Route path="/vendor-dashboard" element={<VendorDashboard />} />
      <Route path="/vendor-chat" element={<VendorChat />} />

      <Route path="/welcome1" element={<Rider1 />} />
      <Route path="/welcome2" element={<Rider2 />} />
      <Route path="/welcome3" element={<Rider3 />} />
      <Route path="/welcome4" element={<Rider4 />} />
      <Route path="/welcome5" element={<Rider5 />} />
      <Route path="/welcome6" element={<Rider6 />} />
      <Route path="/vendor-signup" element={<VendorSignup />} />
      <Route path="/vendor-login" element={<VendorLogin />} />
      <Route path="/order" element={<OrdersManagement />} />
      <Route path="/vendor-profile" element={<Account />} />
      <Route path="/ProfileSetting" element={<ProfileSetting />} />
      <Route path="/orderhistory" element={<OrderHistory />} />
      <Route path="/Support-vendor" element={<SupportPage />} />
      <Route path="/DevicesSession" element={<DevicesAndSessions />} />
      <Route path="/menu" element={<RestaurantMenu />} />
      <Route path="/earning" element={<EarningsPayment />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/smsg" element={<NotificationsPage />} />

      {/* rider */}
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/rider-login" element={<RiderLogin />} />
      <Route path="/rider-registration" element={<RiderRegistration />} />
      <Route path="/rider-dashboard" element={<RiderDashboard />} />
      <Route path="/rider-order" element={<RiderOrder />} />
      <Route path="/map" element={<FoodDeliveryMap />} />
      <Route path="/rider-profile" element={<ProfileScreen />} />
      <Route path="/rider-notifications" element={<DeliveryNotifications />} />
      <Route path="*" element={<div>404 Not Found</div>} />
      <Route path="/rider-profilesetting" element={<RiderProfileSettings />} />
      <Route path="/daily-rider" element={<DailyRiderApp />} />
      <Route path="/rider-earning" element={<RiderEarningsPayment />} />
      <Route path="/rider-device" element={<RiderDevice />} />
      <Route path="/rider-support" element={<RiderSupport />} />
      <Route path="/rider-settings" element={<SettingsScreen />} />
      <Route path="/rider-chat" element={<RiderChat />} />

      {/* Admin section */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* Footer Pages */}
      <Route path="/about" element={<About />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
    </Routes>
  );
};

export default AppRoutes;
