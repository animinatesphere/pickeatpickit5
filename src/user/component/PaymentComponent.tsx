/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, MapPin, Package } from "lucide-react";
import { createOrder, initializePayment } from "../../services/api";
import { backendAuthService } from "../../services/backendAuthService";
import { Navbar } from "../../component/Navbar";
import { useToast } from "../../context/ToastContext";

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
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">(
    "online",
  );
  const [userEmail, setUserEmail] = useState("");
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [promoCode, setPromoCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{
    code: string;
    type: "percentage" | "fixed";
    value: number;
  } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  useEffect(() => {
    const pendingOrder = sessionStorage.getItem("pendingOrder");
    const checkoutItems = sessionStorage.getItem("checkoutItems");
    console.log({ pendingOrder, checkoutItems });
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

    const fetchInitialData = async () => {
      // Get user email
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        setUserEmail(user.email);
      }

      // Fetch vendor info to check COD
      try {
        const items = pendingOrder
          ? JSON.parse(pendingOrder).items
          : checkoutItems
            ? JSON.parse(checkoutItems)
            : [];
        if (items.length > 0) {
          // Extract vendor_id directly from the first item (all items should be from same vendor)
          const vendorId = items[0].vendor_id;
          if (vendorId) {
            const vendors = await backendAuthService.getVendors(100);
            const vendor = vendors.find((v: any) => v.id === vendorId);
            if (vendor) {
              setVendorInfo(vendor);
              // If vendor doesn't accept COD and currently selected method is COD, switch to online
              if (!vendor.accept_cod && paymentMethod === "cod") {
                setPaymentMethod("online");
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching vendor data:", err);
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, toast]);

  const calculateTotal = (): {
    subtotal: number;
    delivery: number;
    discount: number;
    total: number;
  } => {
    if (!orderData) return { subtotal: 0, delivery: 5, discount: 0, total: 5 };

    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const delivery = 5.0;

    let discount = 0;
    if (discountInfo) {
      if (discountInfo.type === "percentage") {
        discount = (subtotal * discountInfo.value) / 100;
      } else {
        discount = discountInfo.value;
      }
    }

    const total = Math.max(0, subtotal + delivery - discount);

    return { subtotal, delivery, discount, total };
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    try {
      const data = await backendAuthService.validatePromoCode(
        promoCode.toUpperCase(),
      );

      if (!data.valid) {
        toast.error("Invalid or inactive promo code", "Invalid Code");
        setDiscountInfo(null);
        return;
      }

      setDiscountInfo({
        code: data.code,
        type: data.discount_type as "percentage" | "fixed",
        value: data.discount_value,
      });
      toast.success(`${data.code} applied successfully!`, "Promo Applied");
    } catch {
      toast.error("Something went wrong validating promo code", "Error");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // FIXED handlePayment function
  // Replace your current handlePayment function with this:

  // FINAL CORRECTED handlePayment function
  // Replace your current handlePayment function with this:
  const { subtotal, delivery, discount, total } = calculateTotal();

  const handlePayment = async () => {
    if (!orderData) return;
    if (!deliveryAddress.trim()) {
      toast.warning("Please enter delivery address", "Address Required");
      return;
    }

    setLoading(true);

    if (paymentMethod === "online") {
      try {
        const userDataStr = localStorage.getItem("userData");
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const fullName = userData
          ? `${userData.firstname || ""} ${userData.lastname || ""}`.trim()
          : "Customer";
        console.log({ vendorInfo });
        // Ensure vendor_id is available
        if (!vendorInfo?.id) {
          toast.error(
            "Vendor information is not available. Please try again.",
            "Payment Error",
          );
          setLoading(false);
          return;
        }

        const paymentPayload = {
          amount: total,
          vendor_id: vendorInfo.id, // Remove optional chaining to ensure it's required
          payment_method: "paystack",
          customer_email: userEmail,
          customer_phone: userData?.phone,
          customer_name: fullName,
          delivery_address: deliveryAddress,
          callback_url: `${window.location.origin}/payment-verify`,
          metadata: {
            order_items: orderData.items,
            spice_level: orderData.spiceLevel,
            special_instructions: orderData.specialInstructions,
          },
        };

        const response = await initializePayment(paymentPayload);
        if (response.data?.authorization_url) {
          // Store order details temporarily to create order after verification
          sessionStorage.setItem(
            "pendingOrderDetails",
            JSON.stringify({
              orderPayload: {
                vendor_id: vendorInfo?.id,
                restaurant_name: vendorInfo?.business_name,
                user_id: userData?.id,
                customer_name: fullName,
                customer_phone: userData?.phone,
                delivery_address: deliveryAddress,
                total_price: total,
                status: "pending",
                items_count: orderData.items.length,
                scheduled_time: new Date().toISOString(),
                payment_method: "online",
                is_paid: true,
              },
              orderItems: orderData.items.map((item) => ({
                menu_item_id: item.id,
                quantity: item.quantity,
                price: item.price, // Backend expects 'price', not 'price_at_order'
              })),
            }),
          );

          // Redirect to Paystack
          window.location.href = response.data.authorization_url;
        } else {
          toast.error("Failed to initialize payment", "Payment Error");
          setLoading(false);
        }
      } catch (error) {
        console.error("Payment initialization error:", error);
        toast.error("Failed to initialize payment", "Payment Error");
        setLoading(false);
      }
    } else {
      // Cash on delivery flow
      await processOrderCreation();
    }
  };

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handlePaystackSuccess = async (reference: { reference: string }) => {
  //   await processOrderCreation(reference.reference);
  // };

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handlePaystackClose = () => {
  //   toast.info("Transaction was not completed", "Payment Cancelled");
  //   setLoading(false);
  // };

  const processOrderCreation = async (paymentRef: string | null = null) => {
    try {
      // Get user data from localStorage (set during login)
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        toast.error(
          "Please log in to place an order",
          "Authentication Required",
        );
        return;
      }
      const userData = JSON.parse(userDataStr);

      // Build fullName from user data
      const fullName =
        `${userData.firstname || ""} ${userData.lastname || ""}`.trim() ||
        "Customer";
      const phoneNum = userData.phone || "No phone";

      // 2. Fetch vendor business name correctly
      const firstItemId = orderData!.items[0].id;

      // Get menu items to find vendor_id
      const menuItems = await backendAuthService.getMenuItems(100);
      const menuItem = menuItems.find(
        (item: { id: string | number }) =>
          String(item.id) === String(firstItemId),
      );

      if (!menuItem) {
        toast.error("Unable to find menu item information.", "Menu Error");
        setLoading(false);
        return;
      }

      // Get vendor info
      const vendors = await backendAuthService.getVendors(100);
      const vendor = vendors.find(
        (v: { id: string }) => v.id === menuItem.vendor_id,
      );
      const restaurantName = vendor?.business_name || "Restaurant";

      // 3. Prepare Payload
      const orderPayload = {
        vendor_id: menuItem.vendor_id,
        restaurant_name: restaurantName,
        user_id: userData.id,
        customer_name: fullName,
        customer_phone: phoneNum,
        delivery_address: deliveryAddress,
        total_price: total, // Required by backend schema
        status: "pending",
        items_count: orderData!.items.length,
        scheduled_time: new Date().toISOString(),
        payment_method: paymentMethod,
        payment_reference: paymentRef,
        is_paid: paymentMethod === "online",
      };

      const orderItems = orderData!.items.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price, // Backend expects 'price', not 'price_at_order'
      }));

      try {
        const response = await createOrder(orderPayload, orderItems);
        const createdOrder = response.data;

        // Backend returns order directly, not nested under 'order'
        if (createdOrder?.id) {
          sessionStorage.removeItem("cart");
          sessionStorage.removeItem("pendingOrder");
          sessionStorage.removeItem("checkoutItems");
          setTrackingCode(createdOrder.id);
        } else {
          toast.error(
            "Unable to place your order at this time. Please try again.",
            "Order Failed",
          );
        }
      } catch (orderError: any) {
        // Humanize error messages instead of showing technical database errors
        let errorMessage =
          "Unable to place your order at this time. Please try again.";

        if (orderError?.response?.data?.detail) {
          errorMessage = orderError.response.data.detail;
        } else if (orderError?.message) {
          if (
            orderError.message.includes("column") ||
            orderError.message.includes("schema")
          ) {
            errorMessage =
              "We're experiencing technical difficulties. Please contact support if this persists.";
          } else if (
            orderError.message.includes("network") ||
            orderError.message.includes("connection")
          ) {
            errorMessage =
              "Network connection issue. Please check your internet and try again.";
          } else if (
            orderError.message.includes("permission") ||
            orderError.message.includes("unauthorized")
          ) {
            errorMessage =
              "Authentication issue. Please log in again and try placing your order.";
          }
        }

        toast.error(errorMessage, "Order Failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Payment processing error
      toast.error("An error occurred. Please try again.", "Payment Error");
    } finally {
      setLoading(false);
    }
  };
  if (!orderData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold font-inter">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  // Success screen with tracking code
  if (trackingCode) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 transition-colors duration-300">
        <div className="max-w-md w-full">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
              <svg
                className="w-10 h-10 text-green-600"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-inter">
              Order Placed!
            </h1>
            <p className="text-gray-600 mb-6 font-medium">
              Your order has been confirmed successfully
            </p>
          </div>

          {/* Tracking Code Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl mb-6 border-2 border-green-100">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 font-medium mb-3 uppercase tracking-wider">
                Your Tracking Code
              </p>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300">
                <p className="text-4xl font-bold text-green-600 font-mono tracking-widest uppercase">
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
                className="mt-4 text-sm text-green-600 hover:text-green-700 font-semibold transition-colors font-inter"
              >
                Copy Code
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-600 text-center font-medium">
                📱 Show this code to your rider when they arrive
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="space-y-4 font-inter">
              <div className="flex justify-between">
                <span className="text-gray-600">Restaurant</span>
                <span className="font-semibold text-gray-900">
                  {orderData.items[0]?.name || "Order"}
                </span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="text-gray-600">Items</span>
                <span className="font-semibold text-gray-900">
                  {orderData.items.length} items
                </span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="text-gray-600">Delivery Address</span>
                <span className="font-semibold text-gray-900 text-right max-w-xs text-sm truncate">
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
            className="w-full bg-white text-green-600 font-bold py-4 rounded-xl hover:bg-gray-50 border-2 border-green-200 transition-colors shadow-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // totals is already destructured at the component level

  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <ChevronLeft
            className="w-6 h-6 cursor-pointer text-white hover:bg-white/10 rounded-full p-1 transition-all"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-xl font-bold text-white flex-1 font-inter  tracking-tight">
            Payment
          </h1>
          <Package className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-24">
        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg hover:shadow-xl transition-all border border-transparent">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-gray-900 text-lg font-inter  uppercase tracking-tighter">
              Delivery Address
            </h2>
          </div>
          <input
            type="text"
            placeholder="Enter your delivery address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all font-inter"
          />
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg border border-transparent">
          <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2 font-inter  uppercase tracking-tighter">
            <Package className="w-5 h-5 text-green-600" />
            Order Items ({orderData.items.length})
          </h2>
          <div className="space-y-4">
            {orderData.items.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 items-center pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
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
                  <p className="font-bold text-gray-900 text-lg font-inter">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity:{" "}
                    <span className="font-semibold">{item.quantity}</span>
                  </p>
                </div>
                <p className="font-bold text-green-600 text-lg font-inter">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Code */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg border border-transparent">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🏷️</span>
            <h2 className="font-bold text-gray-900 text-lg font-inter uppercase tracking-tighter">
              Promo Code
            </h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              disabled={!!discountInfo || isValidatingPromo}
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-green-500 transition-all font-inter uppercase"
            />
            {discountInfo ? (
              <button
                onClick={() => {
                  setDiscountInfo(null);
                  setPromoCode("");
                }}
                className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={handleApplyPromoCode}
                disabled={!promoCode.trim() || isValidatingPromo}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                {isValidatingPromo ? "..." : "Apply"}
              </button>
            )}
          </div>
          {discountInfo && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              ✓ Promo code {discountInfo.code} applied!
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-4 shadow-lg border-2 border-green-100">
          <h2 className="font-bold text-gray-900 text-lg mb-4 font-inter  uppercase tracking-tighter">
            Order Summary
          </h2>
          <div className="space-y-3 text-base font-inter">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span className="font-semibold">
                {" "}
                ₦{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span className="font-semibold">
                ₦{delivery.toLocaleString()}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({discountInfo?.code})</span>
                <span className="font-semibold">
                  -₦{discount.toLocaleString()}
                </span>
              </div>
            )}
            {orderData.spiceLevel && (
              <div className="flex justify-between text-gray-600 text-sm pt-2 border-t font-medium">
                <span>Spice Level</span>
                <span className="font-semibold text-green-600">
                  {orderData.spiceLevel === 0
                    ? "Mild"
                    : orderData.spiceLevel > 50
                      ? "Hot"
                      : "Medium"}
                </span>
              </div>
            )}
            {orderData.specialInstructions && (
              <div className="pt-2 border-t">
                <p className="text-gray-600 text-sm mb-1 font-medium ">
                  Special Instructions:
                </p>
                <p className="text-gray-800 text-sm bg-white p-3 rounded-lg border">
                  {orderData.specialInstructions}
                </p>
              </div>
            )}
            <div className="border-t-2 border-green-200 pt-4 mt-4 flex justify-between font-bold text-xl uppercase  tracking-tighter">
              <span className="text-gray-900">Total Amount</span>
              <span className="text-green-600">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Seçimi */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-lg border border-transparent">
          <h2 className="font-bold text-gray-900 text-lg mb-4 font-inter  uppercase tracking-tighter">
            Choose Payment Method
          </h2>
          <div className="space-y-3">
            <label
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === "online"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-100 hover:border-green-200"
              }`}
              onClick={() => setPaymentMethod("online")}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "online"
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
              >
                {paymentMethod === "online" && (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </div>
              <div className="flex-1 font-inter">
                <p className="font-bold text-gray-900 ">
                  Pay Online (Paystack)
                </p>
                <p className="text-xs text-gray-600">
                  Secure payment with Card, Transfer, USSD
                </p>
              </div>
              <CreditCard className="w-6 h-6 text-green-600" />
            </label>

            <label
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                vendorInfo && !vendorInfo.accept_cod
                  ? "opacity-50 cursor-not-allowed border-gray-100 bg-gray-50"
                  : paymentMethod === "cod"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-100 hover:border-green-200 cursor-pointer"
              }`}
              onClick={() => {
                if (vendorInfo?.accept_cod) {
                  setPaymentMethod("cod");
                } else if (vendorInfo && !vendorInfo.accept_cod) {
                  toast.info(
                    "This vendor does not accept Cash on Delivery",
                    "COD Unavailable",
                  );
                }
              }}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "cod"
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
              >
                {paymentMethod === "cod" && (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </div>
              <div className="flex-1 font-inter">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 ">Cash on Delivery</p>
                  {vendorInfo && !vendorInfo.accept_cod && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  Pay with cash when your order arrives
                </p>
              </div>
              <MapPin className="w-6 h-6 text-green-600" />
            </label>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !deliveryAddress.trim()}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-5 rounded-2xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 text-lg uppercase font-inter  tracking-tighter"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : (
            `Place Order - ₦${total.toLocaleString()}`
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
