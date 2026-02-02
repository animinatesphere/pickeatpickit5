import { useState, useEffect } from "react"; 
import { ChevronLeft, Search, Filter, Minus, Plus, Clock } from "lucide-react";
import { Navbar } from "../../component/Navbar";
import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
// import { getMenuItems, createOrder } from '../services/api'
import { getMenuItems } from '../../services/api'
import { useToast } from "../../context/ToastContext";

type Screen = "kitchen" | "confirm" | "payment" | "success";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  discount: number;
  image_url: string; // Changed to match DB
  description: string;
  quantity: number;
}
interface OrderItem {
  id: number; // Add this line
  name: string;
  quantity: number;
  price: number;
}


export default function MArket() {
  const [screen, setScreen] = useState<Screen>("kitchen");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [spiceLevel, setSpiceLevel] = useState(30);
  const [scheduleOrder, setScheduleOrder] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
useEffect(() => {
  const loadMenu = async () => {
    const { data, error } = await getMenuItems(); 
    if (!error && data) {
      const formattedItems = data.map((item: any) => ({
        ...item,
        quantity: 0,
        // Ensure we use image_url from the DB, fallback to a placeholder if null
        image_url: item.image_url || "https://via.placeholder.com/150", 
        discount: item.discount || 15 
      }));
      setItems(formattedItems);
    }
  };
  loadMenu();
}, []);
const handleOrderNow = (item: MenuItem) => {
  if (item.quantity === 0) return;

  const checkoutItems = [{
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    image_url: item.image_url
  }];

  // Save to session storage so PaymentComponent can read it
  sessionStorage.setItem("checkoutItems", JSON.stringify(checkoutItems));
  
  // Navigate to payment
  navigate("/payment"); 
};

const addToCart = (item: MenuItem) => {
  if (item.quantity === 0) {
    toast.warning('Please select quantity first', 'Quantity Required');
    return;
  }

  const existingCart = sessionStorage.getItem('cart');
  let cart = existingCart ? JSON.parse(existingCart) : [];

  const cartItem = {
    id: item.id,
    name: item.name,
    restaurant: "Mardiya Kitchen", // You can make this dynamic
    items: item.description,
    date: new Date().toLocaleString(),
    price: item.price * (1 - item.discount / 100),
    quantity: item.quantity,
    selected: true,
    image_url: item.image_url
  };

  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex((i: any) => i.id === item.id);
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += item.quantity;
  } else {
    cart.push(cartItem);
  }

  sessionStorage.setItem('cart', JSON.stringify(cart));
  toast.success('Item added to cart!', 'Cart Updated');
};
const handleConfirmOrder = async () => {
  const cart = getCart();
  
  if (cart.length === 0) {
    toast.warning('Please add items to cart first', 'Cart Empty');
    return;
  }

  // Get the input elements with proper typing
  const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
  const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
  const instructionsTextarea = document.querySelector('textarea') as HTMLTextAreaElement;

  // Store cart in sessionStorage to access in payment page
  sessionStorage.setItem('pendingOrder', JSON.stringify({
    items: cart,
    spiceLevel,
    scheduleOrder,
    scheduledDate: scheduleOrder ? dateInput?.value : null,
    scheduledTime: scheduleOrder ? timeInput?.value : null,
    specialInstructions: instructionsTextarea?.value || ''
  }));

  navigate('/payment');
};

const getCart = (): OrderItem[] =>
  items
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      id: item.id, // Add this line
      name: item.name,
      quantity: item.quantity,
      price: item.price * item.quantity,
    }))

  const updateQuantity = (id: number, delta: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const Kitchen = () => (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="sticky top-0 bg-white dark:bg-gray-950 z-40 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for available items"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-sm dark:text-gray-100 focus:outline-none focus:border-green-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const discountedPrice = (
              item.price *
              (1 - item.discount / 100)
            ).toFixed(2);
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex flex-col h-full">
                  <div className="relative overflow-hidden h-40 bg-gray-200 dark:bg-gray-800">
                 <img
  src={item.image_url} // Changed from item.imageUrl
  alt={item.name}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
  // Error handling: if the image fails to load, show a placeholder
  onError={(e) => {
    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";
  }} />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-green-600 dark:text-green-400 font-bold text-sm mb-2">
                      {item.discount}% OFF
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      <span className="line-through text-gray-400 dark:text-gray-600">
                         ₦{item.price.toLocaleString()}
                      </span>
                      <span className="ml-2 font-bold text-gray-900 dark:text-gray-100">
                       ₦{discountedPrice}
                      </span>
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 flex-1">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900 dark:text-gray-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </button>
                      </div>
                    <div className="flex items-center gap-2">
  <button
    onClick={() => addToCart(item)}
    className="text-green-600 dark:text-green-400 font-bold text-sm hover:text-green-700 dark:hover:text-green-300 transition-colors"
  >
    Add to Cart
  </button>
  <button
  onClick={() => handleOrderNow(item)}
    className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
  >
    Order Now
  </button>
</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const Confirm = () => (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="sticky top-0 bg-white dark:bg-gray-950 z-40 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
      <ChevronLeft
  className="w-6 h-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
  onClick={() => setScreen("kitchen")} // Go back to the menu
/>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex-1">
            Confirm Order
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6 hover:shadow-md transition-all">
          <div className="flex gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
            <img
  src={getCart().length > 0 ? items.find(i => i.id === getCart()[0].id)?.image_url : "https://images.unsplash.com/photo-1555939594-58d7cb561404"}
  alt="Restaurant"
  className="w-full h-full object-cover"
/>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                Mardiya Kitchen
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Rice and chicken
                <br />
                Both fried and Jollof
              </p>
              <p className="text-green-600 dark:text-green-400 font-bold text-sm mt-2 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                15 mins | $23.45/item
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            This Kitchen provides both Delivery and self pickup options. By
            default Delivery has been selected
            <span className="text-green-600 dark:text-green-400 font-semibold cursor-pointer hover:text-green-700 dark:hover:text-green-300">
              {" "}
              change
            </span>
          </p>
        </div>

        <div className="space-y-6 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Spice Level</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(Number(e.target.value))}
                className="flex-1 h-2 bg-red-200 dark:bg-red-900/30 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="w-24 text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {spiceLevel === 0
                    ? "Mild"
                    : spiceLevel > 50
                    ? "Hot"
                    : "Medium"}
                </p>
              </div>
            </div>
          </div>

 
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Add Ons</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                "https://images.unsplash.com/photo-1626082927389-6cd097cdc45e?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1585238341710-4b4e6ceea842?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1609855159490-40c9ac1d37f9?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=80&h=80&fit=crop",
              ].map((img, i) => (
                <button
                  key={i}
                  className="flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <img
                    src={img}
                    alt="addon"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </button>
              ))}
            </div>
          </div>

          {getCart().map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-xl p-5 flex justify-between items-center border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <span className="font-bold text-gray-900 dark:text-gray-100">{item.name}</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                ${item.price.toFixed(2)}
              </span>
            </div>
          ))}

          <textarea
            placeholder="Write instructions for the kitchen such as allergies"
            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg p-4 text-sm dark:text-gray-200 h-24 resize-none focus:outline-none focus:border-green-500 dark:focus:border-green-400 font-inter transition-colors"
          />

          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Schedule Delivery</h3>
              <button
                onClick={() => setScheduleOrder(!scheduleOrder)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  scheduleOrder ? "bg-green-600" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white dark:bg-gray-200 rounded-full transition-transform ${
                    scheduleOrder ? "translate-x-5" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>
            {scheduleOrder && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 hover:border-green-500 dark:hover:border-green-400 transition-colors">
                  <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <input
                    type="date"
                    defaultValue="2024-05-29"
                    className="flex-1 outline-none text-sm bg-transparent dark:text-gray-100"
                  />
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 hover:border-green-500 dark:hover:border-green-400 transition-colors">
                  <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <input
                    type="time"
                    defaultValue="10:00"
                    className="flex-1 outline-none text-sm bg-transparent dark:text-gray-100"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      <button 
  onClick={handleConfirmOrder}
  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl"
>
  Confirm Order
</button>
      </div>
    </div>
  );

  // const Payment = () => {
  //   const { subtotal, coupon, delivery, total } = calculateTotal();
  //   return (
  //     <div className="min-h-screen w-full bg-gray-50">
  //       <div className="sticky top-0 bg-white z-40 border-b border-gray-200 shadow-sm">
  //         <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
  //           <ChevronLeft
  //             className="w-6 h-6 cursor-pointer text-gray-700 hover:text-gray-900"
  //             onClick={() => setScreen("confirm")}
  //           />
  //           <h1 className="text-xl font-bold text-gray-900 flex-1">Payment</h1>
  //         </div>
  //       </div>

  //       <div className="max-w-3xl mx-auto px-4 py-6">
  //         <div className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
  //           <h2 className="font-bold text-gray-900 mb-4">Order Items</h2>
  //           <div className="space-y-4">
  //             {getCart().map((item, i) => (
  //               <div
  //                 key={i}
  //                 className="flex gap-4 items-center pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
  //               >
  //                 <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
  //                   <img
  //                     src={items[i].image}
  //                     alt={item.name}
  //                     className="w-full h-full object-cover"
  //                   />
  //                 </div>
  //                 <div className="flex-1">
  //                   <p className="font-bold text-gray-900">{item.name}</p>
  //                   <p className="text-sm text-gray-600">x{item.quantity}</p>
  //                 </div>
  //                 <p className="font-bold text-green-600">
  //                   ${item.price.toFixed(2)}
  //                 </p>
  //               </div>
  //             ))}
  //           </div>
  //         </div>

  //         <div className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
  //           <div className="flex gap-3 mb-5 p-3 bg-gray-50 rounded-lg border border-gray-300 hover:border-green-500 transition-colors">
  //             <input
  //               type="text"
  //               placeholder="Enter your promo code"
  //               className="flex-1 outline-none text-sm bg-gray-50"
  //             />
  //             <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
  //           </div>

  //           <div className="space-y-3 text-sm">
  //             <div className="flex justify-between text-gray-700">
  //               <span>Subtotal</span>
  //               <span className="font-semibold">${subtotal.toFixed(2)}</span>
  //             </div>
  //             <div className="flex justify-between text-green-600 font-bold">
  //               <span>Coupon Discount</span>
  //               <span>-${coupon.toFixed(2)}</span>
  //             </div>
  //             <div className="flex justify-between text-gray-700">
  //               <span>Delivery Fee</span>
  //               <span className="font-semibold">${delivery.toFixed(2)}</span>
  //             </div>
  //             <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold text-base">
  //               <span className="text-gray-900">Total Amount</span>
  //               <span className="text-green-600">${total.toFixed(2)}</span>
  //             </div>
  //           </div>
  //         </div>

  //         <div className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
  //           <div className="flex items-center gap-3">
  //             <Wallet className="w-6 h-6 text-green-600" />
  //             <div className="flex-1">
  //               <p className="font-semibold text-gray-900">Payment Method</p>
  //               <p className="text-sm text-gray-600">
  //                 Visa •••• •••• •••• 8970
  //               </p>
  //             </div>
  //             <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
  //           </div>
  //         </div>

  //         <div className="flex gap-3 mb-6">
  //           <button className="flex-1 border-2 border-green-600 text-green-600 font-bold py-4 rounded-lg hover:bg-green-50 transition-colors">
  //             Add to Cart
  //           </button>
  //           <button
  //             onClick={() => setShowSuccess(true)}
  //             className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl"
  //           >
  //             Pay Now
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {screen === "kitchen" && <Kitchen />}
      {screen === "confirm" && <Confirm />}
    </div>
  );
}
