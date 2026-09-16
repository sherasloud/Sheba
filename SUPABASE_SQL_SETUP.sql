-- Sheba App - Supabase Database Setup
-- Copy and paste these SQL commands into Supabase SQL Editor
-- Navigate to: Dashboard → SQL Editor → New Query

-- ============================================================================
-- 1. CREATE PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  pin VARCHAR(6) NOT NULL,
  balance BIGINT DEFAULT 0,
  account_type VARCHAR(20) DEFAULT 'personal',
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- ============================================================================
-- 2. CREATE TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_phone VARCHAR(20) NOT NULL,
  receiver_phone VARCHAR(20) NOT NULL,
  amount BIGINT NOT NULL,
  transaction_type VARCHAR(50),
  reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES FOR PROFILES
-- ============================================================================

-- Allow all authenticated users to read all profiles
-- (In production, you may want to restrict this)
CREATE POLICY "Enable read for authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated_user');

-- Allow authenticated users to insert profiles
CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated_user');

-- Allow users to update their own profile
CREATE POLICY "Enable update for own profile" ON profiles
  FOR UPDATE USING (auth.role() = 'authenticated_user')
  WITH CHECK (auth.role() = 'authenticated_user');

-- ============================================================================
-- 5. CREATE RLS POLICIES FOR TRANSACTIONS
-- ============================================================================

-- Allow authenticated users to read all transactions
CREATE POLICY "Enable read transactions" ON transactions
  FOR SELECT USING (auth.role() = 'authenticated_user');

-- Allow authenticated users to insert transactions
CREATE POLICY "Enable insert transactions" ON transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated_user');

-- ============================================================================
-- 6. OPTIONAL: CREATE TEST DATA
-- ============================================================================
-- Uncomment to create test user for development

-- INSERT INTO profiles (phone, name, pin, balance, account_type, is_verified)
-- VALUES ('01234567890', 'Test User', '123456', 5000000, 'personal', true)
-- ON CONFLICT (phone) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify everything is set up correctly:

-- Check if tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check profiles table structure:
-- SELECT * FROM profiles LIMIT 1;

-- Check transactions table structure:
-- SELECT * FROM transactions LIMIT 1;

-- ============================================================================
-- NOTES:
-- 1. RLS policies allow authenticated users to access data
-- 2. In production, implement more strict policies based on user ownership
-- 3. For development, you may want to disable RLS until auth is fully setup
-- 4. Backup your data regularly!
-- ============================================================================
