import React, { useEffect, useState } from "react";
import { Bell, X, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../../component/Navbar";

interface CartItem {
  id: number;
  name: string;
  restaurant: string;
  items: string;
  date: string;
  price: number;
  quantity: number;
  selected: boolean;
  image_url?: string;
}
const FoodCartApp: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
 const navigate=useNavigate()
  useEffect(() => {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);
  useEffect(() => {
    if (cartItems.length > 0) {
      sessionStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const toggleSelectAll = () => {
    const allSelected = cartItems.every((item) => item.selected);
    setCartItems(
      cartItems.map((item) => ({ ...item, selected: !allSelected }))
    );
  };

  const toggleItem = (id: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };


   const updateQuantity = (id: number, change: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    const newCart = cartItems.filter((item) => item.id !== id);
    setCartItems(newCart);
    sessionStorage.setItem('cart', JSON.stringify(newCart));
  };
   const handleCheckout = () => {
    const selectedItems = cartItems.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      alert('Please select items to checkout');
      return;
    }
    
    sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    navigate('/payment');
  };

const selectedCount = cartItems.filter((item) => item.selected).length;
  const totalPrice = cartItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="w-6"></div>
        <h1 className="text-lg font-semibold text-gray-900">Cart</h1>
        <Link to="/notification">
          <button className="p-1">
            <Bell className="w-6 h-6 text-gray-700" />
          </button>
        </Link>
      </div>

      {/* Status Bar */}

      {/* Select All */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={selectedCount === cartItems.length}
            onChange={toggleSelectAll}
            className="w-5 h-5 rounded border-2 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
          />
          <span className="ml-3 text-gray-700 font-medium">Select all</span>
        </label>
        <span className="text-emerald-600 font-semibold">
          ({selectedCount}/{cartItems.length})
        </span>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-white mb-2 px-4 py-4 border-b border-gray-100"
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => toggleItem(item.id)}
                className="w-5 h-5 mt-1 rounded border-2 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex-1 ml-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {item.restaurant}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">
                      ₦{item.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">3 items</span> ({item.items})
                </p>

                <p className="text-xs text-gray-400 mb-3">{item.date}</p>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="mx-4 text-lg font-medium text-gray-900 w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Total and Checkout */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Total:</p>
            <p className="text-2xl font-bold text-gray-900">
              ₦{totalPrice.toFixed(2)}
            </p>
          </div>
         <button 
    onClick={handleCheckout}
    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-16 py-4 rounded-xl transition-colors"
  >
    Checkout
  </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCartApp;
