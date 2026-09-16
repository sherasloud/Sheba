# Supabase Setup Guide

## Problem Fixed
The account creation error "আকাউন্ট তৈরি করতে সমস্যা হয়েছে" was occurring because Supabase environment variables were missing.

## Solution

### 1. Get Your Supabase Credentials
1. Go to https://supabase.com
2. Create a new project or log in to existing
3. Navigate to Project Settings → API
4. Copy your credentials:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 2. Update Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create Database Tables
Run these SQL queries in Supabase SQL Editor:

```sql
-- Create profiles table
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

-- Create transactions table
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read for authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated_user');

CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated_user');
```

### 4. Restart Development Server
```bash
npm run dev
```

## Testing Account Creation
1. Open the app
2. Click "অ্যাকাউন্ট তৈরি করুন" (Create Account)
3. Enter phone number: `01234567890`
4. Enter name
5. Create PIN (6 digits)
6. Confirm PIN

If you see the success screen, Supabase is properly configured!

## Troubleshooting

### Still getting error?
Check browser console (F12) for detailed error messages:
- "Missing environment variables" → Supabase keys not set
- "42P01" → Tables don't exist in database
- "Permission denied" → RLS policies need adjustment

### Enable Realtime (Optional)
For live balance updates, enable Realtime on tables:
1. Go to Database → Replication
2. Enable for `profiles` and `transactions` tables
