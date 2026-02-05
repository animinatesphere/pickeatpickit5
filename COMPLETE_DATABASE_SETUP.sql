-- ============================================
-- PICKIT PICKEAT FULL DATABASE SCHEMA
-- ============================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS (Customers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname TEXT,
  lastname TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. VENDORS
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname TEXT,
  lastname TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VENDOR PROFILES
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID UNIQUE NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  business_name TEXT,
  business_category TEXT,
  years_of_experience TEXT,
  business_phone TEXT,
  business_address TEXT,
  business_description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RIDERS
CREATE TABLE IF NOT EXISTS riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname TEXT,
  lastname TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  gender TEXT,
  vehicle_type TEXT,
  vehicle_brand TEXT,
  plate_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  is_active BOOLEAN DEFAULT true,  -- Crucial for the toggle fix
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  rider_id UUID REFERENCES riders(id) ON DELETE SET NULL, -- Track assigned rider
  restaurant_name TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  customer_phone TEXT,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Used by dashboard stats
  items_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'picked_up', 'completed', 'cancelled')),
  scheduled_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_at_order DECIMAL(10, 2), -- Snapshot of price at time of order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ORDER TRACKING / UPDATES
CREATE TABLE IF NOT EXISTS order_status_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. VENDOR PHOTOS (Log/History)
CREATE TABLE IF NOT EXISTS vendor_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  photo_type TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. RIDER LOGISTICS TABLES
CREATE TABLE IF NOT EXISTS rider_guarantors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID REFERENCES riders(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rider_bank_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID UNIQUE REFERENCES riders(id) ON DELETE CASCADE,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. RLS POLICIES (Simplified)
ALTER TABLE orders ENABLE ROW LEVEL_SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL_SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL_SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL_SECURITY;

-- Basic policies - In a production app, these should be more granular
CREATE POLICY "Public profiles are viewable by everyone" ON riders FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone" ON vendors FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone" ON vendor_profiles FOR SELECT USING (true);

-- Users see their own orders
CREATE POLICY "Users can see own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

-- Riders see assigned orders
CREATE POLICY "Riders see assigned orders" ON orders FOR SELECT USING (
  rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid()) OR status = 'preparing'
);

-- Vendors see their orders
CREATE POLICY "Vendors see their orders" ON orders FOR SELECT USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);
