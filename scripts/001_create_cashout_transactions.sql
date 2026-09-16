-- Create cashout_transactions table
CREATE TABLE IF NOT EXISTS public.cashout_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  recipient_phone TEXT,
  transaction_reference TEXT UNIQUE NOT NULL DEFAULT 'CSH-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cashout_user_id ON public.cashout_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cashout_status ON public.cashout_transactions(status);
CREATE INDEX IF NOT EXISTS idx_cashout_created_at ON public.cashout_transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.cashout_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own cashout transactions
CREATE POLICY "Users can view their own cashout transactions"
  ON public.cashout_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cashout transactions"
  ON public.cashout_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending cashout transactions"
  ON public.cashout_transactions
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_cashout_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Automatically set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the update function
DROP TRIGGER IF EXISTS trigger_update_cashout_updated_at ON public.cashout_transactions;
CREATE TRIGGER trigger_update_cashout_updated_at
  BEFORE UPDATE ON public.cashout_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cashout_updated_at();
