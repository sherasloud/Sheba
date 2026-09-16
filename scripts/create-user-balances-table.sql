-- Create user_balances table for persistent balance storage
CREATE TABLE IF NOT EXISTS user_balances (
  id BIGSERIAL PRIMARY KEY,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_balances_phone ON user_balances(phone_number);

-- Insert default admin balances
INSERT INTO user_balances (phone_number, balance) 
VALUES 
  ('01709783145', 99979997979999),
  ('01930314459', 99979997979999)
ON CONFLICT (phone_number) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_balances_updated_at ON user_balances;
CREATE TRIGGER update_user_balances_updated_at
    BEFORE UPDATE ON user_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
