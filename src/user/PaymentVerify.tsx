import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { verifyPayment, createOrder } from "../services/api.ts";
import { useToast } from "../context/ToastContext";

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const reference = searchParams.get("reference");

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus("failed");
        toast.error("No payment reference found");
        return;
      }

      try {
        const response = await verifyPayment(reference);
        if (response.data?.status === "success") {
          // Payment verified, now create the order
          const pendingDetailsStr = sessionStorage.getItem('pendingOrderDetails');
          if (pendingDetailsStr) {
            const parsedData = JSON.parse(pendingDetailsStr);
            console.log('=== RAW PARSED DATA ===');
            console.log('Full parsed data:', parsedData);
            console.log('Keys:', Object.keys(parsedData));
            
            const orderPayload = parsedData.orderPayload;
            const orderItems = parsedData.orderItems;
            
            console.log('=== PAYLOAD DEBUG ===');
            console.log('orderPayload:', orderPayload);
            console.log('orderItems:', orderItems);
            console.log('orderItems type:', Array.isArray(orderItems) ? 'ARRAY' : typeof orderItems);
            console.log('orderItems length:', orderItems?.length);
            
            // Fallback: if orderItems is missing, try to get from other possible keys
            const safeOrderItems = orderItems || parsedData.items || [];
            
            if (!safeOrderItems || safeOrderItems.length === 0) {
              console.error('❌ CRITICAL: No order items found!');
              throw new Error('Order items are missing. Please start a new order.');
            }
            
            // Ensure required fields are present (safeguard for old cached data)
            const safeOrderPayload = {
              ...orderPayload,
              total_price: orderPayload.total_price || orderPayload.total_amount || 0,
              total_amount: orderPayload.total_amount || orderPayload.total_price || 0,
            };
            
            // Add payment reference to order payload
            const finalOrderPayload = {
              ...safeOrderPayload,
              payment_reference: reference
            };

            console.log('finalOrderPayload:', finalOrderPayload);
            console.log('Sending to API with items:', safeOrderItems);
            
            // Debug: Check what will be sent
            const payloadToSend = { ...finalOrderPayload, items: safeOrderItems };
            console.log('=== COMPLETE PAYLOAD TO BE SENT ===');
            console.log(JSON.stringify(payloadToSend, null, 2));

            const orderResponse = await createOrder(finalOrderPayload, safeOrderItems);
            console.log('Order response:', orderResponse.data);
            
            // Check if order was created successfully (backend returns order directly)
            if (orderResponse.data?.id) {
              setStatus("success");
              sessionStorage.removeItem("cart");
              sessionStorage.removeItem("pendingOrder");
              sessionStorage.removeItem("checkoutItems");
              sessionStorage.removeItem("pendingOrderDetails");
              
              toast.success("Payment verified and order placed!");
              
              // Redirect to tracking page after a short delay
              setTimeout(() => {
                navigate("/user-dashboard");
              }, 3000);
            } else {
              throw new Error("Order creation failed after payment");
            }
          } else {
            setStatus("success");
            toast.success("Payment verified!");
            navigate("/user-dashboard");
          }
        } else {
          setStatus("failed");
          toast.error("Payment verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
        toast.error("An error occurred during payment verification");
      }
    };

    verify();
  }, [reference, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-3xl p-10 shadow-xl max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-800 mb-2">Verifying Payment</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Securing transaction with central network...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-800 mb-2">Payment Secured</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-8">Mission confirmed. Order is being transmitted.</p>
            <p className="text-xs text-gray-400">Redirecting to dashboard...</p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-800 mb-2">Transaction Aborted</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-8">We couldn't verify your payment. Please contact support if debited.</p>
            <button 
              onClick={() => navigate("/payment")}
              className="w-full py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all"
            >
              Return to Payment
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentVerify;
