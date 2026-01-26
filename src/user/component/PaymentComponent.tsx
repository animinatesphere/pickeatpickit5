import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, MapPin, Package } from 'lucide-react';
import { createOrder } from '../../services/api';
import { supabase } from '../../services/authService';
import { Navbar } from '../../component/Navbar';

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
  const [orderData, setOrderData] = useState<PendingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    const pendingOrder = sessionStorage.getItem('pendingOrder');
    const checkoutItems = sessionStorage.getItem('checkoutItems');
    
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
        specialInstructions: ''
      });
    } else {
      alert('No order found. Please add items first.');
      navigate('/market');
    }
  }, [navigate]);

  const calculateTotal = () => {
    if (!orderData) return { subtotal: 0, delivery: 5, total: 5 };
    
    const subtotal = orderData.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    const delivery = 5.00;
    const total = subtotal + delivery;
    
    return { subtotal, delivery, total };
  };

  const handlePayment = async () => {
    if (!orderData) return;
    if (!deliveryAddress.trim()) {
      alert('Please enter delivery address');
      return;
    }

    setLoading(true);
    
    try {
     const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        alert('Please login first');
        navigate('/login');
        return;
      }
         const userPhone = session.user.user_metadata?.phone || "";

      // Get vendor_id from the first menu item
      const firstItemId = orderData.items[0].id;
      const { data: menuItem, error: menuError } = await supabase
        .from('menu_items')
        .select('vendor_id')
        .eq('id', firstItemId)
        .single();

      if (menuError || !menuItem?.vendor_id) {
        console.error('Menu item error:', menuError);
        alert('Unable to find vendor information. Please try again.');
        setLoading(false);
        return;
      }

      const { total } = calculateTotal();

      // Prepare scheduled time
      let scheduledTime = new Date();
      if (orderData.scheduleOrder && orderData.scheduledDate && orderData.scheduledTime) {
        scheduledTime = new Date(`${orderData.scheduledDate}T${orderData.scheduledTime}`);
      }

      const orderPayload = {
        vendor_id: menuItem.vendor_id,
        customer_id: session.user.id,
        customer_name: session.user.email || 'Customer',
        delivery_address: deliveryAddress,
        scheduled_time: scheduledTime.toISOString(),
        status: 'pending',
           customer_phone: userPhone,
        spice_level: orderData.spiceLevel,
        special_instructions: orderData.specialInstructions,
        total_amount: total
      };

      const orderItems = orderData.items.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_order: item.price / item.quantity
      }));

      const { error } = await createOrder(orderPayload, orderItems);
      
      if (!error) {
        sessionStorage.removeItem('cart');
        sessionStorage.removeItem('pendingOrder');
        sessionStorage.removeItem('checkoutItems');
        
        alert('Order placed successfully! 🎉');
        navigate('/market');
      } else {
        console.error('Order error:', error);
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading order details...</p>
        </div>
      </div>
    );
  }

  const { subtotal, delivery, total } = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <ChevronLeft 
            className="w-6 h-6 cursor-pointer text-white hover:bg-white/10 rounded-full p-1 transition-all" 
            onClick={() => navigate(-1)}
          />
          <h1 className="text-xl font-bold text-white flex-1">Payment</h1>
          <Package className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-24">
        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-gray-900 text-lg">Delivery Address</h2>
          </div>
          <input
            type="text"
            placeholder="Enter your delivery address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
          />
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
          <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Order Items ({orderData.items.length})
          </h2>
          <div className="space-y-4">
            {orderData.items.map((item, i) => (
              <div key={i} className="flex gap-4 items-center pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  {item.image_url?.startsWith('http') ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {item.image_url || '🍽️'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: <span className="font-semibold">{item.quantity}</span></p>
                </div>
                <p className="font-bold text-green-600 text-lg">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-4 shadow-lg border-2 border-green-100">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 text-base">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span className="font-semibold">${delivery.toFixed(2)}</span>
            </div>
            {orderData.spiceLevel && (
              <div className="flex justify-between text-gray-600 text-sm pt-2 border-t">
                <span>Spice Level</span>
                <span className="font-semibold">
                  {orderData.spiceLevel === 0 ? 'Mild' : orderData.spiceLevel > 50 ? 'Hot' : 'Medium'}
                </span>
              </div>
            )}
            {orderData.specialInstructions && (
              <div className="pt-2 border-t">
                <p className="text-gray-600 text-sm mb-1">Special Instructions:</p>
                <p className="text-gray-800 text-sm bg-white p-3 rounded-lg">{orderData.specialInstructions}</p>
              </div>
            )}
            <div className="border-t-2 border-green-200 pt-4 mt-4 flex justify-between font-bold text-xl">
              <span className="text-gray-900">Total Amount</span>
              <span className="text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Payment Method</p>
              <p className="text-sm text-gray-600">Cash on Delivery</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">💵</span>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !deliveryAddress.trim()}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-5 rounded-2xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 text-lg"
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