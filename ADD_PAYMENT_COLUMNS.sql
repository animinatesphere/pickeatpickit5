-- Add is_paid column to orders table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;

-- Add payment_method column if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';

-- Add payment_reference column for online payments
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Update existing records to have proper payment status
-- For orders with status 'completed' or 'accepted', assume they were paid
UPDATE orders SET is_paid = true WHERE status IN ('completed', 'accepted') AND payment_method = 'online';

-- For cash on delivery orders, is_paid should remain false until delivery