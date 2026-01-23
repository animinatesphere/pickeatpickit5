import { useState, useEffect } from "react"; 
import { ChevronLeft, Search, Filter, Minus, Plus, Clock } from "lucide-react";
import { Navbar } from "../../component/Navbar";
import { Link } from "react-router-dom";
// import { getMenuItems, createOrder } from '../services/api'
import { getMenuItems, createOrder } from '../../services/api'

type Screen = "kitchen" | "confirm" | "payment" | "success";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  discount: number;
  image: string;
  description: string;
  quantity: number;
}

interface OrderItem {
  id: number; // Add this line
  name: string;
  quantity: number;
  price: number;
}

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Fried Rice",
    price: 23.45,
    discount: 15,
    image:
      "https://images.unsplash.com/photo-1562909895-d82f9655a90c?w=500&h=500&fit=crop",
    description: "Delicious fried rice with vegetables",
    quantity: 0,
  },
  {
    id: 2,
    name: "Fresh Salad",
    price: 23.45,
    discount: 30,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
    description: "Crisp and fresh garden salad",
    quantity: 0,
  },
  {
    id: 3,
    name: "Chicken BBQ",
    price: 23.45,
    discount: 38,
    image:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&h=500&fit=crop",
    description: "Smoky grilled chicken",
    quantity: 0,
  },
  {
    id: 4,
    name: "Fried Plantain",
    price: 23.45,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1585238341710-4b4e6ceea842?w=500&h=500&fit=crop",
    description: "Golden crispy plantain slices",
    quantity: 0,
  },
  {
    id: 5,
    name: "Grilled Fish",
    price: 23.45,
    discount: 15,
    image:
      "https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=500&h=500&fit=crop",
    description: "Fresh grilled fish fillet",
    quantity: 0,
  },
  {
    id: 6,
    name: "Premium Burger",
    price: 23.45,
    discount: 40,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop",
    description: "Juicy beef burger with toppings",
    quantity: 0,
  },
  {
    id: 7,
    name: "Fried Chicken",
    price: 23.45,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc45e?w=500&h=500&fit=crop",
    description: "Crispy golden fried chicken",
    quantity: 0,
  },
];

export default function MArket() {
  const [screen, setScreen] = useState<Screen>("kitchen");
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [spiceLevel, setSpiceLevel] = useState(30);
  const [scheduleOrder, setScheduleOrder] = useState(true);
useEffect(() => {
  const loadMenu = async () => {
    const { data, error } = await getMenuItems() // Gets all vendors' items
    if (!error && data) {
      const formattedItems = data.map(item => ({
        ...item,
        quantity: 0,
        discount: 15 // Add discount logic if needed
      }))
      setItems(formattedItems)
    }
  }
  loadMenu()
}, [])

const handleConfirmOrder = async () => {
  const userId = 'CURRENT_USER_ID' // Get from auth context
  const vendorId = 'VENDOR_ID' // Get from selected restaurant
  
  const cart = getCart()
  const total = cart.reduce((sum, item) => sum + item.price, 0)
  
  const orderData = {
    vendor_id: vendorId,
    customer_id: userId,
    customer_name: 'User Name', // Get from user profile
    delivery_address: 'User Address',
    scheduled_time: scheduleOrder ? 'SELECTED_DATE_TIME' : new Date(),
    status: 'pending',
    spice_level: spiceLevel,
    special_instructions: 'FROM_TEXTAREA',
    total_amount: total
  }
  
  const orderItems = cart.map(item => ({
    menu_item_id: item.id,
    quantity: item.quantity,
    price_at_order: item.price / item.quantity
  }))
  
  const { error } = await createOrder(orderData, orderItems)
  if (!error) {
    // Navigate to payment
  }
}
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
    <div className="min-h-screen w-full bg-gray-50">
      <div className="sticky top-0 bg-white z-40 border-b border-gray-200 shadow-sm">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for available items"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex flex-col h-full">
                  <div className="relative overflow-hidden h-40 bg-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-green-600 font-bold text-sm mb-2">
                      {item.discount}% OFF
                    </p>
                    <p className="text-gray-600 text-sm mb-3">
                      <span className="line-through text-gray-400">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="ml-2 font-bold text-gray-900">
                        ${discountedPrice}
                      </span>
                    </p>
                    <p className="text-gray-500 text-xs mb-4 flex-1">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                      <button
                        onClick={() => setScreen("confirm")}
                        className="text-green-600 font-bold text-sm hover:text-green-700 transition-colors"
                      >
                        Order Now
                      </button>
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
    <div className="min-h-screen w-full bg-gray-50">
      <div className="sticky top-0 bg-white z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <ChevronLeft
            className="w-6 h-6 cursor-pointer text-gray-700 hover:text-gray-900"
            // onClick={() => setScreen("kitchen")}
          onClick={handleConfirmOrder}
          />
          <h1 className="text-xl font-bold text-gray-900 flex-1">
            Confirm Order
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 hover:shadow-md transition-shadow">
          <div className="flex gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1555939594-58d7cb561404?w=80&h=80&fit=crop"
                alt="Restaurant"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-gray-900">
                Mardiya Kitchen
              </h2>
              <p className="text-gray-600 text-sm">
                Rice and chicken
                <br />
                Both fried and Jollof
              </p>
              <p className="text-green-600 font-bold text-sm mt-2 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                15 mins | $23.45/item
              </p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            This Kitchen provides both Delivery and self pickup options. By
            default Delivery has been selected
            <span className="text-green-600 font-semibold cursor-pointer hover:text-green-700">
              {" "}
              change
            </span>
          </p>
        </div>

        <div className="space-y-6 mb-6">
          <div className="bg-white rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Spice Level</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(Number(e.target.value))}
                className="flex-1 h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="w-24 text-right">
                <p className="text-sm font-bold text-gray-900">
                  {spiceLevel === 0
                    ? "Mild"
                    : spiceLevel > 50
                    ? "Hot"
                    : "Medium"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Add Ons</h3>
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
                  className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
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
              className="bg-white rounded-xl p-5 flex justify-between items-center border border-gray-200"
            >
              <span className="font-bold text-gray-900">{item.name}</span>
              <span className="font-bold text-green-600">
                ${item.price.toFixed(2)}
              </span>
            </div>
          ))}

          <textarea
            placeholder="Write instructions for the kitchen such as allergies"
            className="w-full border border-gray-300 rounded-lg p-4 text-sm h-24 resize-none focus:outline-none focus:border-green-500"
          />

          <div className="bg-white rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Schedule Delivery</h3>
              <button
                onClick={() => setScheduleOrder(!scheduleOrder)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  scheduleOrder ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    scheduleOrder ? "translate-x-5" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>
            {scheduleOrder && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 border border-gray-300 rounded-lg p-3 hover:border-green-500 transition-colors">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <input
                    type="date"
                    defaultValue="2024-05-29"
                    className="flex-1 outline-none text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 border border-gray-300 rounded-lg p-3 hover:border-green-500 transition-colors">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <input
                    type="time"
                    defaultValue="10:00"
                    className="flex-1 outline-none text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <Link to="/payment">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl">
            Confirm Order
          </button>
        </Link>
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
    <div className="min-h-screen bg-white">
      {screen === "kitchen" && <Kitchen />}
      {screen === "confirm" && <Confirm />}
    </div>
  );
}
