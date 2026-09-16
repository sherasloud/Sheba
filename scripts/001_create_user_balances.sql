-- Create user_balances table for persistent balance storage
CREATE TABLE IF NOT EXISTS public.user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  balance DECIMAL NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're not using auth.users)
CREATE POLICY "Allow all to read balances" ON public.user_balances FOR SELECT USING (true);
CREATE POLICY "Allow all to insert balances" ON public.user_balances FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update balances" ON public.user_balances FOR UPDATE USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_balances_phone ON public.user_balances(phone_number);
