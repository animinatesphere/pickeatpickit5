# Booking Database Setup - Troubleshooting Guide

## ❌ Error: "column user_id does not exist"

This error typically means one of these issues:

### **Solution 1: Check if tables already exist**

If tables exist from a previous attempt, drop them first:

```sql
-- Drop existing tables in correct order (foreign keys first)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
```

Then run the full SQL from `DATABASE_SETUP.sql`

---

### **Solution 2: Check auth.users reference**

Verify Supabase auth.users table exists and has correct columns:

```sql
-- This should work (lists all columns in auth.users)
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users';

-- Should return: id, email, created_at, etc.
```

---

### **Solution 3: Create without foreign key first**

If foreign key is causing issues:

```sql
-- Create orders table WITHOUT foreign key constraint
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  restaurant_name TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  customer_phone TEXT,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  items_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'canceled')),
  scheduled_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items WITHOUT foreign key
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  menu_item_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Now add foreign keys
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE orders 
ADD CONSTRAINT fk_orders_vendor_id 
FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;

ALTER TABLE order_items 
ADD CONSTRAINT fk_order_items_order_id 
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items 
ADD CONSTRAINT fk_order_items_menu_item_id 
FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
```

---

### **Solution 4: Verify vendor table exists**

```sql
-- Check if vendors table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'vendors';

-- Check if menu_items table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'menu_items';
```

If `vendors` or `menu_items` don't exist, remove those foreign key constraints.

---

## 🔧 **Simplest Solution: Create tables without foreign keys**

If you're having issues with foreign keys, use this simplified version:

```sql
-- Create orders table (NO foreign keys)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  vendor_id UUID,
  restaurant_name TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  customer_phone TEXT,
  total_price DECIMAL(10, 2) DEFAULT 0,
  items_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  scheduled_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table (NO foreign keys)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  menu_item_id UUID,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

This version:
- ✅ Creates tables without foreign key constraints
- ✅ Still allows you to use the data
- ✅ Works with app logic
- ⚠️ Doesn't enforce referential integrity at database level

---

## ✅ **How to Test If Tables Were Created**

```sql
-- List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check orders table structure
\d orders

-- Check order_items table structure
\d order_items

-- Insert test data
INSERT INTO orders (user_id, restaurant_name, delivery_address, total_price, items_count)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Test Restaurant', '123 Main St', 25.99, 2);

-- Verify data inserted
SELECT * FROM orders;
```

---

## 📝 **Quick Checklist**

- [ ] Navigate to Supabase SQL Editor
- [ ] Copy SQL from `DATABASE_SETUP.sql`
- [ ] Run the query
- [ ] Check for errors
- [ ] If error, try **Solution 3** (create without foreign keys first)
- [ ] Verify tables exist with SELECT queries
- [ ] Test with INSERT statement

---

## 🚀 **After Tables Are Created**

Update the Booking component to use real data:
1. Component already has code to fetch from `orders` table
2. Real-time updates are enabled
3. Just need to insert test data or have users create orders!
