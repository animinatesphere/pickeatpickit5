-- ============================================
-- FIX ORDERS JOIN RELATIONSHIP
-- ============================================

-- This script ensures that the 'orders' table has a direct relationship 
-- with the 'public.users' table so that the admin dashboard can join them.

-- 1. Ensure the constraint exists to the public.users table
-- We use public.users(user_id) because that links directly to the auth ID
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE orders
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Optional: If order_items -> menu_items join fails, ensure this too
-- ALTER TABLE order_items
-- DROP CONSTRAINT IF EXISTS order_items_menu_item_id_fkey;

-- ALTER TABLE order_items
-- ADD CONSTRAINT order_items_menu_item_id_fkey 
-- FOREIGN KEY (menu_item_id) REFERENCES menu_items(id);
