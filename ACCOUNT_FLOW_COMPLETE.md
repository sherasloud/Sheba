# Account Flow - Complete System ✅

## How It Works Now

### 1. FIRST TIME - Account Creation
- User enters phone number and name
- User creates a PIN
- Account is saved to browser storage with initial balance of 10,000 টাকা
- User is logged in automatically
- User sees home page with balance

### 2. NEXT TIME - PIN Login Only
- User enters phone number
- App checks if account exists
- If yes → Shows PIN input (no account creation page)
- User enters PIN
- Account verified → User logged in
- User sees home page with their balance

### 3. Account Storage & Balance

All accounts stored in localStorage with:
- Phone number
- Full name
- PIN code
- Account balance (usable for Send Money / Cashout)
- Creation timestamp

Test Accounts Available:
```
Phone: 01709783145 | Name: Test User | PIN: 1234 | Balance: 50,000 টাকা
Phone: 01712345678 | Name: User 5406 | PIN: 1234 | Balance: 100,000 টাকা
Phone: 01798765432 | Name: Test Account | PIN: 1234 | Balance: 75,000 টাকা
```

### 4. Send Money & Cashout
- Balance shown on home page
- Can send money to any phone number
- Can cashout to any account
- Balance updates in real-time

## Files Modified

✅ `/app/onboarding/page.tsx` - Account creation now uses account-manager
✅ `/app/login/page.tsx` - Login checks if account exists, shows PIN only
✅ `/app/page.tsx` - Home page loads balance from account-manager
✅ `/app/layout.tsx` - Fixed script tag error

## Testing Flow

1. First time:
   - Go to /onboarding
   - Enter phone + name + PIN
   - Click "আকাউন্ট তৈরি করুন"
   - See home page with balance

2. Second time:
   - Go to /login
   - Enter phone
   - See PIN field (not account creation)
   - Enter PIN
   - Logged in ✓

3. Test existing accounts:
   - Phone: 01709783145
   - PIN: 1234
   - See balance: 50,000 টাকা
   - Can send/cashout

## Balance System

- New accounts: 10,000 টাকা initial balance
- Test accounts: 50,000-100,000 টাকা
- Balance persistent in localStorage
- Balance updates on transactions
- Balance visible on home page (tap "সেবা" to show)

---
All set! The app now properly persists accounts and only asks for PIN on subsequent logins. ✅
