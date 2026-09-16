-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Allow all read on profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow all insert on profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on profiles" ON profiles FOR UPDATE USING (true);

-- Create policies for transactions
CREATE POLICY "Allow all read on transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow all insert on transactions" ON transactions FOR INSERT WITH CHECK (true);
