

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, MapPin, Package } from "lucide-react";
import { createOrder } from "../../services/api";
import { supabase } from "../../services/authService";
import { Navbar } from "../../component/Navbar";
import { useToast } from "../../context/ToastContext";
import { usePaystackPayment } from "react-paystack";
import { PAYSTACK_PUBLIC_KEY } from "../../config/paystack";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface PendingOrder {
  items: OrderItem[];
  spiceLevel: number;
  scheduleOrder: boolean;
  scheduledDate: string | null;
  scheduledTime: string | null;
  specialInstructions: string;
}

const PaymentComponent: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [orderData, setOrderData] = useState<PendingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("online");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {

    const pendingOrder = sessionStorage.getItem("pendingOrder");
    const checkoutItems = sessionStorage.getItem("checkoutItems");

    if (pendingOrder) {
      setOrderData(JSON.parse(pendingOrder));
    } else if (checkoutItems) {
      const items = JSON.parse(checkoutItems);
      setOrderData({
        items,
        spiceLevel: 30,
        scheduleOrder: false,
        scheduledDate: null,
        scheduledTime: null,
        specialInstructions: "",
      });
    } else {
      toast.warning("No order found. Please add items first.", "Cart Empty");
      navigate("/market");
    }

    const getUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    getUserEmail();
  }, [navigate]);

  const calculateTotal = () => {
    if (!orderData) return { subtotal: 0, delivery: 5, total: 5 };

    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const delivery = 5.0;
    const total = subtotal + delivery;

    return { subtotal, delivery, total };
  };

// FIXED handlePayment function
// Replace your current handlePayment function with this:

// FINAL CORRECTED handlePayment function
// Replace your current handlePayment function with this:
  const totals = calculateTotal();
  const total = totals.total;

  const config = {
    reference: (new Date()).getTime().toString(),
    email: userEmail,
    amount: Math.round(total * 100), // Convert to kobo
    publicKey: PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = async () => {
    if (!orderData) return;
    if (!deliveryAddress.trim()) {
      toast.warning("Please enter delivery address", "Address Required");
      return;
    }

    setLoading(true);

    if (paymentMethod === "online") {
      try {
        // @ts-ignore
        initializePayment({onSuccess: handlePaystackSuccess, onClose: handlePaystackClose});
      } catch (error) {
        console.error("Paystack init error:", error);
        toast.error("Failed to initialize payment", "Payment Error");
        setLoading(false);
      }
    } else {
      // Cash on delivery flow
      await processOrderCreation();
    }
  };

  const handlePaystackSuccess = async (reference: any) => {
    console.log("Paystack Reference:", reference);
    await processOrderCreation(reference.reference);
  };

  const handlePaystackClose = () => {
    toast.info("Transaction was not completed", "Payment Cancelled");
    setLoading(false);
  };

  const processOrderCreation = async (paymentRef: string | null = null) => {
    try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // 1. Fetch user profile data from 'users' table (the correct table name!)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')  // ← Changed from 'user_profiles' to 'users'
      .select('firstname, lastname, phone')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    // Build fullName and phoneNum from the fetched profile
    const fullName = userProfile 
      ? `${userProfile.firstname || ""} ${userProfile.lastname || ""}`.trim() || "Customer"
      : "Customer";
    const phoneNum = userProfile?.phone || "No phone";

    console.log("Customer Info:", { fullName, phoneNum }); // Debug log

    // 2. Fetch vendor business name correctly
    const firstItemId = orderData!.items[0].id;
    
    // Fetch menu info to get the vendor_id
    const { data: menuInfo, error: menuErr } = await supabase
      .from('menu_items')
      .select('vendor_id')
      .eq('id', firstItemId)
      .single();

    if (menuErr || !menuInfo) {
      toast.error("Unable to find vendor information.", "Vendor Error");
      setLoading(false);
      return;
    }

    // Fetch the restaurant name using vendor_id
    const { data: vendorProfile } = await supabase
      .from('vendor_profiles')
      .select('business_name')
      .eq('vendor_id', menuInfo.vendor_id)
      .single();

    // Define the variables the payload is looking for
    const restaurantName = vendorProfile?.business_name || "Restaurant";

    // 3. Prepare Payload
    const orderPayload = {
      vendor_id: menuInfo.vendor_id,
      restaurant_name: restaurantName,  
      user_id: session.user.id,
      customer_name: fullName,      // Now correctly from users table
      customer_phone: phoneNum,     // Now correctly from users table
      delivery_address: deliveryAddress,
      total_amount: total,          
      status: "pending",
      items_count: orderData!.items.length,
      scheduled_time: new Date().toISOString(),
      payment_method: paymentMethod,
      payment_reference: paymentRef,
      is_paid: paymentMethod === "online",
    };

    console.log("Order Payload:", orderPayload); // Debug log

    const orderItems = orderData!.items.map(item => ({
      menu_item_id: item.id,
      quantity: item.quantity,
      price_at_order: item.price
    }));

    const { data: createdOrder, error: orderError } = await createOrder(orderPayload, orderItems);

    if (!orderError && createdOrder?.order?.id) {
      sessionStorage.removeItem("cart");
      sessionStorage.removeItem("pendingOrder");
      sessionStorage.removeItem("checkoutItems");
      setTrackingCode(createdOrder.order.id);
    } else {
      console.error("Order Error:", orderError);
      toast.error("Failed to place order. " + (orderError?.message || ""), "Order Failed");
    }
  } catch (error) {
    console.error("Payment error:", error);
    toast.error("An error occurred. Please try again.", "Payment Error");
  } finally {
    setLoading(false);
  }
};
  if (!orderData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 dark:border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-semibold font-inter">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  // Success screen with tracking code
  if (trackingCode) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="max-w-md w-full">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 animate-bounce">
              <svg
                className="w-10 h-10 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-inter">
              Order Placed!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
              Your order has been confirmed successfully
            </p>
          </div>

          {/* Tracking Code Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl mb-6 border-2 border-green-100 dark:border-green-900/30">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-3 uppercase tracking-wider">
                Your Tracking Code
              </p>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-300 dark:border-green-800">
                <p className="text-4xl font-bold text-green-600 dark:text-green-400 font-mono tracking-widest uppercase">
                  {trackingCode.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    trackingCode.slice(0, 8).toUpperCase(),
                  );
                  toast.success("Tracking code copied to clipboard!", "Copied");
                }}
                className="mt-4 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold transition-colors font-inter"
              >
                Copy Code
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                📱 Show this code to your rider when they arrive
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
            <div className="space-y-4 font-inter">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Restaurant</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {orderData.items[0]?.name || "Order"}
                </span>
              </div>
              <div className="flex justify-between border-t dark:border-gray-800 pt-4">
                <span className="text-gray-600 dark:text-gray-400">Items</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {orderData.items.length} items
                </span>
              </div>
              <div className="flex justify-between border-t dark:border-gray-800 pt-4">
                <span className="text-gray-600 dark:text-gray-400">Delivery Address</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-right max-w-xs text-sm truncate">
                  {deliveryAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => navigate("/booking")}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors shadow-lg mb-3"
          >
            Track Your Order
          </button>
          <button
            onClick={() => navigate("/market")}
            className="w-full bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 font-bold py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-green-200 dark:border-green-900/50 transition-colors shadow-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const { subtotal, delivery } = totals;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-800 shadow-lg sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <ChevronLeft
            className="w-6 h-6 cursor-pointer text-white hover:bg-white/10 rounded-full p-1 transition-all"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-xl font-bold text-white flex-1 font-inter italic tracking-tight">Payment</h1>
          <Package className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-24">
        {/* Delivery Address */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-lg hover:shadow-xl transition-all border border-transparent dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg font-inter italic uppercase tracking-tighter">
              Delivery Address
            </h2>
          </div>
          <input
            type="text"
            placeholder="Enter your delivery address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 transition-all font-inter"
          />
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-lg border border-transparent dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4 flex items-center gap-2 font-inter italic uppercase tracking-tighter">
            <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
            Order Items ({orderData.items.length})
          </h2>
          <div className="space-y-4">
            {orderData.items.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 items-center pb-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 last:pb-0"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  {item.image_url?.startsWith("http") ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {item.image_url || "🍽️"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-lg font-inter">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quantity:{" "}
                    <span className="font-semibold">{item.quantity}</span>
                  </p>
                </div>
                <p className="font-bold text-green-600 dark:text-green-400 text-lg font-inter">
                    ₦{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 mb-4 shadow-lg border-2 border-green-100 dark:border-green-900/30">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4 font-inter italic uppercase tracking-tighter">
            Order Summary
          </h2>
          <div className="space-y-3 text-base font-inter">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Subtotal</span>
              <span className="font-semibold"> ₦{subtotal.toFixed(2).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Delivery Fee</span>
              <span className="font-semibold">₦{delivery.toFixed(2).toLocaleString()}</span>
            </div>
            {orderData.spiceLevel && (
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm pt-2 border-t dark:border-gray-800 font-medium">
                <span>Spice Level</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {orderData.spiceLevel === 0
                    ? "Mild"
                    : orderData.spiceLevel > 50
                      ? "Hot"
                      : "Medium"}
                </span>
              </div>
            )}
            {orderData.specialInstructions && (
              <div className="pt-2 border-t dark:border-gray-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-medium italic">
                  Special Instructions:
                </p>
                <p className="text-gray-800 dark:text-gray-200 text-sm bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                  {orderData.specialInstructions}
                </p>
              </div>
            )}
            <div className="border-t-2 border-green-200 dark:border-green-800 pt-4 mt-4 flex justify-between font-bold text-xl uppercase italic tracking-tighter">
              <span className="text-gray-900 dark:text-gray-100">Total Amount</span>
              <span className="text-green-600 dark:text-green-400">₦{total.toFixed(2).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Seçimi */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 mb-6 shadow-lg border border-transparent dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4 font-inter italic uppercase tracking-tighter">
            Choose Payment Method
          </h2>
          <div className="space-y-3">
            <label 
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === "online" 
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                  : "border-gray-100 dark:border-gray-800 hover:border-green-200"
              }`}
              onClick={() => setPaymentMethod("online")}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "online" ? "border-green-500" : "border-gray-300"
              }`}>
                {paymentMethod === "online" && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
              </div>
              <div className="flex-1 font-inter">
                <p className="font-bold text-gray-900 dark:text-gray-100 italic">Pay Online (Paystack)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Secure payment with Card, Transfer, USSD</p>
              </div>
              <CreditCard className="w-6 h-6 text-green-600" />
            </label>

            <label 
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === "cod" 
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                  : "border-gray-100 dark:border-gray-800 hover:border-green-200"
              }`}
              onClick={() => setPaymentMethod("cod")}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "cod" ? "border-green-500" : "border-gray-300"
              }`}>
                {paymentMethod === "cod" && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
              </div>
              <div className="flex-1 font-inter">
                <p className="font-bold text-gray-900 dark:text-gray-100 italic">Cash on Delivery</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Pay when you receive your food</p>
              </div>
              <span className="text-2xl">💵</span>
            </label>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !deliveryAddress.trim()}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-800 text-white font-bold py-5 rounded-2xl hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-800 dark:hover:to-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 text-lg uppercase font-inter italic tracking-tighter"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : (
            `Place Order - $${total.toFixed(2)}`
          )}
        </button>

        {!deliveryAddress.trim() && (
          <p className="text-center text-sm text-red-500 mt-3">
            Please enter delivery address to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentComponent;
