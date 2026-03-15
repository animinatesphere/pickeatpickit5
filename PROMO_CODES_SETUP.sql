-- Create promo_codes table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookup
CREATE INDEX idx_promo_codes_code ON promo_codes(code);

-- Sample Promo Codes for testing
-- You can uncomment these to add them after creating the table
-- INSERT INTO promo_codes (code, discount_type, discount_value, expiry_date) 
-- VALUES ('WELCOME10', 'percentage', 10, '2026-12-31 23:59:59'),
--        ('SAVE500', 'fixed', 500, '2026-12-31 23:59:59');
