# Account Creation Error Troubleshooting Guide

## Error: createProfile returned null

### What This Means
The account creation failed in Supabase. The system now has a fallback mechanism, but it's important to fix the underlying Supabase configuration.

### Root Causes & Solutions

#### 1. **Missing Supabase Configuration** (Most Common)
**Symptoms:** Immediate error after clicking "অ্যাকাউন্ট তৈরি করুন"

**Fix:**
```bash
# Open .env.local and add:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from:
1. Go to https://supabase.com
2. Select your project
3. Settings → API → Project URL (copy this)
4. Settings → API → Anon Key (copy this)
5. Paste into `.env.local`
6. Restart dev server: `npm run dev`

---

#### 2. **Profiles Table Doesn't Exist**
**Symptoms:** Error in browser console: "table does not exist"

**Fix:**
Copy and paste this SQL into Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  pin VARCHAR(10) NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  account_type VARCHAR(50) DEFAULT 'personal',
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
```

**Steps:**
1. Go to Supabase → Your Project
2. Click "SQL Editor" (left sidebar)
3. Click "New Query"
4. Paste the SQL above
5. Click "Run"
6. Restart dev server: `npm run dev`

---

#### 3. **Row Level Security (RLS) Blocking Inserts**
**Symptoms:** Error in console: "permission denied" or "policy"

**Fix:**
```sql
-- Disable RLS for now (enable later for production)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Or create permissive policies:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable update for all" ON profiles
  FOR UPDATE WITH CHECK (true);

CREATE POLICY "Enable delete for all" ON profiles
  FOR DELETE USING (true);
```

**Steps:**
1. Go to Supabase → Your Project
2. Click "SQL Editor"
3. Run the SQL above
4. Restart dev server: `npm run dev`

---

#### 4. **Invalid Anon Key or Expired Session**
**Symptoms:** Connection fails silently, no error in console

**Fix:**
1. Go to Supabase → Your Project
2. Settings → API
3. Look for "Anon Key" (public key)
4. Copy it completely (with no extra spaces)
5. Update `.env.local` with the exact value
6. Restart dev server: `npm run dev`

---

### Current Fallback System

The code now includes a fallback mechanism:

1. **First Attempt:** Try to create account in Supabase
2. **If Supabase Fails:** Create account locally using localStorage
3. **Success:** Account is created and you're logged in

When using the fallback:
- Account data is stored locally (not cloud)
- Reloading the page won't lose your account
- Transfers to other phones won't work until Supabase is set up
- Admin features won't work until Supabase is properly configured

### Browser Console Debugging

**To see what's happening:**
1. Open browser DevTools: `F12` or `Right Click → Inspect`
2. Go to "Console" tab
3. Attempt account creation
4. Look for messages starting with `[v0]`

**Common messages you might see:**
- `[v0] Starting profile creation for phone: 01XXXXXXXXX` → Process started
- `[v0] Database error code: 42P01` → Table doesn't exist
- `[v0] Database error code: 42501` → RLS policy blocking
- `[v0] createProfile returned null` → General failure
- `[v0] Local account creation successful` → Using fallback

### Verification Checklist

- [ ] `.env.local` has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Both values copied exactly from Supabase (no extra spaces)
- [ ] Dev server restarted after .env changes: `npm run dev`
- [ ] `profiles` table created in Supabase
- [ ] RLS policies are set correctly or RLS is disabled
- [ ] Browser console shows `[v0]` debug messages
- [ ] Account creation redirects to home page

### Still Not Working?

1. Check browser console for exact error message (F12 → Console)
2. Verify Supabase credentials one more time
3. Try creating table again (copy from `SUPABASE_SQL_SETUP.sql`)
4. Make sure you're using the right Supabase project
5. Check if anon key has insert permissions (should be public)

### Production Notes

For production deployment:
- Enable RLS policies for security
- Use environment variables from Vercel (not .env.local)
- Test with real Supabase credentials before deploying
- Monitor error logs for account creation failures

---

**Need more help?** Check the browser console for specific error codes and search for them in the Supabase documentation at https://supabase.com/docs
