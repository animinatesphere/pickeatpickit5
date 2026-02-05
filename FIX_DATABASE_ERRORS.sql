-- FIX FOR ERROR 42P10 (Unique constraint missing)
-- Run this in your Supabase SQL Editor to enable the 'upsert' functionality

-- 1. Add Unique Constraint to vendor_availability
ALTER TABLE vendor_availability 
ADD CONSTRAINT vendor_availability_vendor_id_key UNIQUE (vendor_id);

-- 2. Add Unique Constraint to vendor_bank_info
ALTER TABLE vendor_bank_info 
ADD CONSTRAINT vendor_bank_info_vendor_id_key UNIQUE (vendor_id);

-- 3. (Optional) If the tables don't exist yet, use these instead:
/*
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

CREATE TABLE IF NOT EXISTS vendor_bank_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID UNIQUE NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/
