-- Bank Account Schema for Sheba App

-- 1. Linked Bank Accounts Table
CREATE TABLE IF NOT EXISTS linked_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name VARCHAR(100) NOT NULL, -- 'Jamuna Bank' or 'Probash Kallyan'
  account_number VARCHAR(20) NOT NULL,
  account_holder_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(50), -- 'Savings', 'Current', 'Business'
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(50), -- 'micro_deposit', 'bank_verification', 'instant'
  verified_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'inactive', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, account_number)
);

-- 2. Bank Transfer Log Table
CREATE TABLE IF NOT EXISTS bank_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES linked_bank_accounts(id) ON DELETE CASCADE,
  bank_name VARCHAR(100) NOT NULL,
  transfer_type VARCHAR(20), -- 'to_bank', 'from_bank'
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BDT',
  transaction_reference VARCHAR(100) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'success', 'failed'
  error_message TEXT,
  bank_response JSONB, -- Store full response from bank API
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Bank Transaction Webhooks
CREATE TABLE IF NOT EXISTS bank_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name VARCHAR(100) NOT NULL,
  webhook_event VARCHAR(100), -- 'transfer_success', 'transfer_failed', etc.
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  received_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- 4. Bank Account Verification Logs
CREATE TABLE IF NOT EXISTS bank_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES linked_bank_accounts(id) ON DELETE CASCADE,
  verification_type VARCHAR(50), -- 'micro_deposit', 'instant', 'manual'
  verification_status VARCHAR(20), -- 'pending', 'verified', 'failed'
  bank_response JSONB,
  attempts INT DEFAULT 1,
  last_attempted TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Bank Integration Settings (for admins)
CREATE TABLE IF NOT EXISTS bank_integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name VARCHAR(100) UNIQUE NOT NULL,
  api_endpoint VARCHAR(500) NOT NULL,
  merchant_id VARCHAR(100),
  api_key_encrypted VARCHAR(500),
  webhook_secret VARCHAR(500),
  status VARCHAR(20) DEFAULT 'inactive', -- 'active', 'inactive', 'maintenance'
  daily_limit DECIMAL(12, 2),
  monthly_limit DECIMAL(12, 2),
  transaction_fee DECIMAL(5, 2), -- percentage
  settlement_cycle VARCHAR(20), -- 'daily', 'weekly', 'monthly'
  support_email VARCHAR(100),
  support_phone VARCHAR(20),
  documentation_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Indexes for Performance
CREATE INDEX idx_linked_bank_accounts_user_id ON linked_bank_accounts(user_id);
CREATE INDEX idx_linked_bank_accounts_status ON linked_bank_accounts(status);
CREATE INDEX idx_bank_transfers_user_id ON bank_transfers(user_id);
CREATE INDEX idx_bank_transfers_status ON bank_transfers(status);
CREATE INDEX idx_bank_transfers_created_at ON bank_transfers(created_at DESC);
CREATE INDEX idx_bank_webhooks_bank_name ON bank_webhooks(bank_name);
CREATE INDEX idx_bank_webhooks_processed ON bank_webhooks(processed);

-- 7. Sample Data for Integration Settings

-- Jamuna Bank
INSERT INTO bank_integration_settings (
  bank_name,
  api_endpoint,
  merchant_id,
  transaction_fee,
  settlement_cycle,
  status,
  support_email,
  support_phone
) VALUES (
  'Jamuna Bank',
  'https://api.jamuna-bank.com/v1',
  'SHEBA_JAMUNA_001',
  0.5, -- 0.5% fee
  'daily',
  'inactive', -- Will be 'active' after configuration
  'corporate@jamuna-bank.com',
  '+880-2-58055555'
) ON CONFLICT DO NOTHING;

-- Probash Kallyan Bank
INSERT INTO bank_integration_settings (
  bank_name,
  api_endpoint,
  merchant_id,
  transaction_fee,
  settlement_cycle,
  status,
  support_email,
  support_phone
) VALUES (
  'Probash Kallyan Bank',
  'https://api.probashkallyankbank.com.bd/v1',
  'SHEBA_PROBASH_001',
  0.25, -- 0.25% fee (lower due to partnership)
  'daily',
  'inactive', -- Will be 'active' after configuration
  'corporate@probashkb.com',
  '+880-2-58055500'
) ON CONFLICT DO NOTHING;

-- 8. RLS Policies (Row Level Security)

-- Users can only see their own linked bank accounts
CREATE POLICY "Users can view own bank accounts"
  ON linked_bank_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
  ON linked_bank_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON linked_bank_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE linked_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_verification_logs ENABLE ROW LEVEL SECURITY;

-- Similar policies for bank_transfers
CREATE POLICY "Users can view own transfers"
  ON bank_transfers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transfers"
  ON bank_transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
