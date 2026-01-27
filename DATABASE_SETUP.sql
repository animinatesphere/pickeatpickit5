-- ============================================
-- BOOKING SYSTEM DATABASE SETUP
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- Create orders table for users
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
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

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);

-- ============================================
-- ALTERNATIVE: If you prefer to use a different approach
-- ============================================
-- If the foreign key to auth.users is causing issues, you can:

-- Option 1: Drop the existing tables and recreate (if needed)
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;

-- Option 2: Create without foreign key first, then add it
-- ALTER TABLE orders 
-- ADD CONSTRAINT fk_orders_user_id 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- VERIFY TABLES WERE CREATED
-- ============================================
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('orders', 'order_items');

-- ============================================
-- ROW LEVEL SECURITY (Optional but Recommended)
-- ============================================
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can view orders for their restaurant" ON orders
  FOR SELECT USING (vendor_id IN (
    SELECT id FROM vendors WHERE user_id = auth.uid()
  ));

-- Users can view their own order items
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );
