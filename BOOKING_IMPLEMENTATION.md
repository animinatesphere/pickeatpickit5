# Booking Orders Implementation Guide

## ✅ What You Need To Do

### 1. **Create Database Tables**

Run this SQL in your Supabase SQL editor:

```sql
-- Create orders table for user bookings
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  customer_phone TEXT,
  total_price DECIMAL(10, 2) NOT NULL,
  items_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'canceled')),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table (to store individual items in an order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### 2. **What's Changed**

#### Booking.tsx Updated:

- ✅ Fetches real orders from database on component load
- ✅ Shows loading state while fetching
- ✅ Displays user's actual orders
- ✅ Real-time updates when order status changes
- ✅ Filters by "Accepted" (pending/accepted), "Canceled", "Completed"
- ✅ Shows order details: restaurant, items count, total price, date

#### API Functions Added:

- `getUserOrders(userId)` - Fetch all user orders
- `getOrderDetails(orderId)` - Fetch single order with items detail

#### Real-Time Features:

- Orders update automatically when vendor changes status
- New orders appear instantly without page refresh
- Cancellations/completions sync in real-time

---

## 📊 Order Flow

```
User Places Order
    ↓
Order Created in Database (orders table)
    ↓
Order Items Added (order_items table)
    ↓
Booking Component Fetches Orders
    ↓
Display in Booking View
    ↓
Real-Time Updates Enabled
    ↓
User Sees Live Status Changes
```

---

## 💾 Database Schema

### orders table

```
id              UUID (primary key)
user_id         UUID (foreign key -> auth.users)
vendor_id       UUID (foreign key -> vendors)
restaurant_name TEXT
delivery_address TEXT
customer_phone  TEXT
total_price     DECIMAL
items_count     INTEGER
status          TEXT (pending, accepted, completed, canceled)
scheduled_time  TIMESTAMP
created_at      TIMESTAMP (auto)
updated_at      TIMESTAMP (auto)
```

### order_items table

```
id              UUID (primary key)
order_id        UUID (foreign key -> orders)
menu_item_id    UUID (foreign key -> menu_items)
quantity        INTEGER
price           DECIMAL
created_at      TIMESTAMP (auto)
```

---

## 🔄 How Real-Time Works

The Booking component uses **Supabase Realtime** to listen for changes:

```typescript
// Automatically updates when:
1. New order is created
2. Order status changes (pending → accepted → completed)
3. Order is canceled
4. Any order field is updated
```

No page refresh needed - updates happen instantly!

---

## 🎯 Creating An Order (From Checkout)

When user completes checkout, create an order:

```typescript
import { supabase } from "../services/authService";

const createOrder = async (
  userId: string,
  vendorId: string,
  restaurantName: string,
  deliveryAddress: string,
  customerPhone: string,
  totalPrice: number,
  items: Array<{ menuItemId: string; quantity: number; price: number }>,
) => {
  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        user_id: userId,
        vendor_id: vendorId,
        restaurant_name: restaurantName,
        delivery_address: deliveryAddress,
        customer_phone: customerPhone,
        total_price: totalPrice,
        items_count: items.length,
        status: "pending",
        scheduled_time: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menuItemId,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
};
```

---

## 📱 Order Status Flow

```
pending
   ↓
accepted (Vendor confirms)
   ↓
completed (Delivered) or canceled
```

Booking component automatically updates as status changes!

---

## ✨ Features Implemented

✅ Fetch real user orders from database
✅ Real-time order status updates
✅ Loading state while fetching
✅ Filter orders by status (accepted, canceled, completed)
✅ Display order details (restaurant, items, price, date)
✅ Track order functionality
✅ Re-order functionality (ready for implementation)
✅ Persistent data (orders stay in database)
✅ No loss on page refresh

---

## 🚀 Next Steps

1. **Create the database tables** (copy SQL above)
2. **Update your checkout** to create orders in the database
3. **Test the Booking page** - should show real orders now
4. **Implement order tracking** with real-time progress updates
5. **Add re-order functionality** to easily repeat past orders

---

## ⚠️ Important Notes

- Orders are stored in database permanently
- Real-time updates require Supabase Realtime enabled
- User must be authenticated to see their orders
- Vendor status changes update immediately on user's screen
- No manual refresh needed - updates are instant
