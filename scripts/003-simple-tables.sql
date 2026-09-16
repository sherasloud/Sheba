-- Create profiles table
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

-- Create transactions table
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
