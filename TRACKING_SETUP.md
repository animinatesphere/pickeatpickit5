# Real Order Tracking System Setup

## Database Table

The `order_status_updates` table stores real tracking data with the following structure:

```sql
CREATE TABLE order_status_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50), -- e.g., "order_received", "preparing", "ready", "out_for_delivery", "delivered"
  message TEXT, -- e.g., "Your order has been confirmed"
  timestamp TIMESTAMP DEFAULT NOW(),
  rider_id UUID
);
```

## How It Works

### 1. **User Places Order**

- Order is created in the `orders` table with status = "pending"
- User sees tracking code (first 8 chars of order ID in uppercase)

### 2. **Vendor Accepts Order** (OrdersManagement.tsx)

- Vendor clicks "Accept" button
- Order status updates to "confirmed"
- **A tracking update should be inserted:** status: "preparing", message: "Your order is being prepared"

### 3. **Vendor Updates Order Status**

- When order is ready, insert tracking update: status: "ready", message: "Your order is ready for pickup"
- When rider arrives, insert: status: "out_for_delivery", message: "Your order is on the way"
- When delivered, insert: status: "delivered", message: "Your order has been delivered"

### 4. **User Tracks Order** (Booking.tsx)

- Clicks "Track Order" button
- Component fetches all tracking updates from `order_status_updates` table
- Displays real timeline instead of hardcoded progress
- Updates in real-time as vendor adds new updates

## API Functions Available

```typescript
// Get all tracking updates for an order
getOrderTracking(orderId: string)

// Add a new tracking update
addTrackingUpdate(orderId: string, {
  status: "preparing" | "ready" | "out_for_delivery" | "delivered",
  message: "Your message here",
  rider_id: "optional-rider-id"
})
```

## Implementation in OrdersManagement.tsx (Vendor)

When vendor accepts/updates order status, also insert tracking update:

```typescript
// After accepting order
await addTrackingUpdate(orderId, {
  status: "preparing",
  message: "Your order is being prepared",
  timestamp: new Date().toISOString(),
});

// When order is ready
await addTrackingUpdate(orderId, {
  status: "ready",
  message: "Your order is ready for pickup",
  timestamp: new Date().toISOString(),
});

// When rider picks up
await addTrackingUpdate(orderId, {
  status: "out_for_delivery",
  message: "Your order is on the way",
  timestamp: new Date().toISOString(),
});

// When delivered
await addTrackingUpdate(orderId, {
  status: "delivered",
  message: "Your order has been delivered",
  timestamp: new Date().toISOString(),
});
```

## Current Status

✅ **Booking.tsx** - Fetches real tracking data and displays it on track order screen
✅ **api.ts** - Has `getOrderTracking()` and `addTrackingUpdate()` functions
✅ **Database** - `order_status_updates` table is created

## Next Steps

1. Update **OrdersManagement.tsx** to call `addTrackingUpdate()` when vendor changes order status
2. Add a rider/delivery interface to update tracking status
3. Add real-time listeners so tracking updates appear instantly

## Testing

1. Place an order through user payment flow
2. Accept order in vendor dashboard
3. Add tracking updates via Supabase SQL editor:
   ```sql
   INSERT INTO order_status_updates (order_id, status, message, timestamp)
   VALUES ('order-id', 'preparing', 'Your order is being prepared', NOW());
   ```
4. Check user's "Track Order" page - should see real updates
