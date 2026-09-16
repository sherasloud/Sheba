-- Create transactions table for persistent transaction history
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  operator TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow all to read transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Allow all to insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_phone ON public.transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
