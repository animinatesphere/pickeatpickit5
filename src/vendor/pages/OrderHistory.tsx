import { useState, useEffect } from "react";
import { ArrowLeft, Package } from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { supabase } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";

interface Order {
  id: string;
  customerName: string;
  date: string;
  time: string;
  amount: string;
  status: "completed" | "pending" | "canceled" | "accepted";
  image: string;
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setVendorId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        // 1. Get the current logged-in vendor's ID
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/vendor-login");
          return;
        }

        const { data: vendorData } = await supabase
          .from("vendors")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (!vendorData) return;
        setVendorId(vendorData.id);

        // 2. Fetch all orders for this vendor
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              menu_items (image_url)
            )
          `)
          .eq("vendor_id", vendorData.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedOrders = data.map((order: any) => {
            const dateObj = new Date(order.created_at);
            return {
              id: order.id,
              customerName: order.customer_name || "Guest Customer",
              date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              amount: `₦${Number(order.total_amount).toLocaleString()}`,
              status: order.status,
              // Get image from the first item in the order, or fallback to emoji
              image: order.order_items?.[0]?.menu_items?.image_url || "🥘"
            };
          });
          setOrders(formattedOrders);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="text-green-600 font-bold text-sm">Completed</span>;
      case "pending":
        return <span className="text-yellow-600 font-bold text-sm">Pending</span>;
      case "accepted":
        return <span className="text-blue-600 font-bold text-sm">Preparing</span>;
      case "canceled":
        return <span className="text-red-600 font-bold text-sm">Cancelled</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <VendorNav />
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-lg transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Order History</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 border border-transparent hover:border-green-100"
                style={{ animation: `slideIn 0.5s ease-out ${index * 0.1}s both` }}
              >
                <div className="flex gap-4">
                  {/* Order Image Container */}
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-4xl flex-shrink-0 shadow-inner overflow-hidden">
                    {order.image.startsWith('http') ? (
                      <img src={order.image} className="w-full h-full object-cover" alt="Food" />
                    ) : (
                      order.image
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-800 text-lg truncate">
                        {order.customerName}
                      </h3>
                      <p className="text-xs font-mono text-gray-400">#{order.id.slice(0, 5).toUpperCase()}</p>
                    </div>

                    <p className="text-sm text-gray-500 mb-2">
                      {order.date} at {order.time}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-gray-800 font-bold">
                        Amount: <span className="text-green-600">{order.amount}</span>
                      </p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="bg-white p-10 rounded-3xl shadow-xl">
              <Package className="w-20 h-20 text-gray-200 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No History Found</h2>
              <p className="text-gray-500 max-w-xs mx-auto">You haven't received any orders yet. Once you do, they will appear here.</p>
              <Link to="/vendor-dashboard" className="mt-8 inline-block px-8 py-3 bg-green-600 text-white rounded-xl font-bold">
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default OrderHistory;