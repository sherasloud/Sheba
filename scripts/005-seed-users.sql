-- Insert default admin users
INSERT INTO profiles (phone, name, pin, balance, account_type, is_verified)
VALUES 
  ('01aborbd', 'Admin', '112233', 999999999.00, 'admin', true),
  ('01915566453', 'Habibur Rahman', '131SEBAh', 50000.00, 'personal', true)
ON CONFLICT (phone) DO NOTHING;
