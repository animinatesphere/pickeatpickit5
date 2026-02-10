-- ============================================
-- ADMIN TRANSACTIONS & PAYOUTS SETUP
-- ============================================

-- 1. PAYOUT REQUESTS (Vendors and Riders requesting money)
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('vendor', 'rider')),
  amount DECIMAL(10, 2) NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'successful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TRANSACTIONS (Record of all financial movements)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('payment', 'payout', 'transfer')),
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  commission DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'successful' CHECK (status IN ('pending', 'successful', 'failed')),
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS POLICIES
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow admins to see everything (Simplified policy)
CREATE POLICY "Admins can do everything" ON payout_requests FOR ALL USING (true);
CREATE POLICY "Admins can do everything" ON transactions FOR ALL USING (true);

-- Users see their own payouts
CREATE POLICY "Users can see own payouts" ON payout_requests FOR SELECT 
USING (auth.uid() = user_id);

-- 4. HELPER DATA (Optional: Insert some initial data if needed)
-- INSERT INTO transactions (type, title, amount, commission, status) 
-- VALUES ('payment', 'Order Received', 5000, 500, 'successful');
