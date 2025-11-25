-- Create payments table
-- This table stores Razorpay payment information

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
  razorpay_payment_id VARCHAR(255) UNIQUE NOT NULL,
  razorpay_signature VARCHAR(512) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Add RLS (Row Level Security) policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Service role can do everything
CREATE POLICY "Service role has full access"
  ON payments
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE payments IS 'Razorpay payment records';
COMMENT ON COLUMN payments.razorpay_order_id IS 'Razorpay order ID (e.g., order_xxx)';
COMMENT ON COLUMN payments.razorpay_payment_id IS 'Razorpay payment ID (e.g., pay_xxx)';
COMMENT ON COLUMN payments.razorpay_signature IS 'HMAC signature for verification';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, captured, failed, refunded';
