-- Create transfers table for real-time money transfers
CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_phone TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transfers_sender ON transfers(sender_phone);
CREATE INDEX IF NOT EXISTS idx_transfers_receiver ON transfers(receiver_phone);
CREATE INDEX IF NOT EXISTS idx_transfers_created_at ON transfers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
CREATE POLICY "Allow all operations on transfers" ON transfers
  FOR ALL
  USING (true)
  WITH CHECK (true);
