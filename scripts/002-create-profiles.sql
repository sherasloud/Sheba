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
