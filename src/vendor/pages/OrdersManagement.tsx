import { useState, useEffect } from "react"; // Add useEffect
import { MapPin, Clock, Check, Package } from "lucide-react";
import { VendorNav } from "../component/VendorNav";

import { getVendorOrders, updateOrderStatus } from '../../services/api'

interface Order {
  id: string;
  customerName: string;
  address: string;
  time: string;
  image: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
}

const OrdersManagement = () => {
 const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "cancelled" | "completed">("pending");

  const [orders, setOrders] = useState<Order[]>([]); // Add this line

  // Add useEffect to load orders
  useEffect(() => {
    const loadOrders = async () => {
      const vendorId = 'vendor_id' // Get from auth context
      const { data, error } = await getVendorOrders(vendorId)
      if (!error && data) {
        const formattedOrders = data.map((order: any) => ({
          id: order.id,
          customerName: order.customer_name,
          address: order.delivery_address,
          time: new Date(order.scheduled_time).toLocaleString(),
          image: order.order_items[0]?.menu_items?.image_url || '🍽️',
          status: order.status
        }))
        setOrders(formattedOrders)
      }
    }
    loadOrders()
  }, [])

  // Fix the handler types
  const handleAccept = async (orderId: string) => {
    const { error } = await updateOrderStatus(orderId, 'confirmed')
    if (!error) {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'confirmed' as const } : order
      ))
    }
  }

  const handleCancel = async (orderId: string) => {
    const { error } = await updateOrderStatus(orderId, 'cancelled')
    if (!error) {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' as const } : order
      ))
    }
  }

  const handleCheckOut = async (orderId: string) => {
    const { error } = await updateOrderStatus(orderId, 'completed')
    if (!error) {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'completed' as const } : order
      ))
    }
  }

  // Rest of your component...
  const filteredOrders = orders.filter((order) => order.status === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Preparing
          </span>
        );
      case "cancelled":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const getOrderCount = (status: string) => {
    return orders.filter((order) => order.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-24">
      <VendorNav />
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold">Orders</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* My Orders Title */}
        <h2 className="text-2xl font-bold text-green-700 mb-6">My Orders</h2>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "pending"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {activeTab === "pending" && <Check className="w-4 h-4" />}
            <span className="text-sm">Pending</span>
            {getOrderCount("pending") > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-green-600 text-xs font-bold">
                {getOrderCount("pending")}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("confirmed")}
            className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "confirmed"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {activeTab === "confirmed" && <Check className="w-4 h-4" />}
            <span className="text-sm">Confirmed</span>
            {getOrderCount("confirmed") > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-green-600 text-xs font-bold">
                {getOrderCount("confirmed")}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "cancelled"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {activeTab === "cancelled" && <Check className="w-4 h-4" />}
            <span className="text-sm">Cancelled</span>
            {getOrderCount("cancelled") > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-green-600 text-xs font-bold">
                {getOrderCount("cancelled")}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "completed"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {activeTab === "completed" && <Check className="w-4 h-4" />}
            <span className="text-sm">Completed</span>
            {getOrderCount("completed") > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-green-600 text-xs font-bold">
                {getOrderCount("completed")}
              </span>
            )}
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold">
                No {activeTab} orders
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Orders will appear here when available
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 transform hover:-translate-y-1"
              >
                <div className="flex gap-4">
                  {/* Order Image */}
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-4xl flex-shrink-0 shadow-md">
                    {order.image}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {order.customerName}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                      <span className="line-clamp-1">{order.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                      <Clock className="w-4 h-4" />
                      <span>Time: {order.time}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-green-600 bg-green-50 hover:bg-green-100 transition-all duration-300 hover:shadow-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAccept(order.id)}
                        className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        Accept
                      </button>
                    </>
                  )}
                  {order.status === "confirmed" && (
                    <button
                      onClick={() => handleCheckOut(order.id)}
                      className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Check Out
                    </button>
                  )}
                  {order.status === "cancelled" && (
                    <div className="flex-1 text-center py-2.5 px-4 text-gray-500 text-sm font-semibold">
                      Order was cancelled
                    </div>
                  )}
                  {order.status === "completed" && (
                    <div className="flex-1 text-center py-2.5 px-4 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Order Completed
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;
