-- Create profiles table for user data and balance
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  pin VARCHAR(10) NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  account_type VARCHAR(20) DEFAULT 'personal',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table for send money history
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_phone VARCHAR(20) NOT NULL,
  receiver_phone VARCHAR(20) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles (allow all operations for now - can be restricted later)
CREATE POLICY "Allow all read on profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow all insert on profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on profiles" ON profiles FOR UPDATE USING (true);

-- Create policies for transactions
CREATE POLICY "Allow all read on transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow all insert on transactions" ON transactions FOR INSERT WITH CHECK (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Insert default admin users
INSERT INTO profiles (phone, name, pin, balance, account_type, is_verified)
VALUES 
  ('01aborbd', 'Admin', '112233', 999999999.00, 'admin', true),
  ('01915566453', 'Habibur Rahman', '131SEBAh', 50000.00, 'personal', true)
ON CONFLICT (phone) DO NOTHING;
