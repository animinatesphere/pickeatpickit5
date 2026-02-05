-- Add Vendor Availability Table
CREATE TABLE IF NOT EXISTS vendor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID UNIQUE NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  day_from TEXT,
  day_to TEXT,
  holidays_available BOOLEAN DEFAULT true,
  opening_time TEXT,
  closing_time TEXT,
  total_workers INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Vendor Bank Info Table
CREATE TABLE IF NOT EXISTS vendor_bank_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID UNIQUE NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bank_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage their own availability" ON vendor_availability
FOR ALL TO authenticated USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);

CREATE POLICY "Vendors can manage their own bank info" ON vendor_bank_info
FOR ALL TO authenticated USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);
