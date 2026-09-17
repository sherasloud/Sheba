# Truecaller OTP Integration - Complete Setup Guide

## ✅ What's Done

Your Sheba Chai app now has **Truecaller integration** ready!

### Files Created:

1. **`/lib/services/truecaller-integration.ts`** (176 lines)
   - Truecaller profile fetching
   - User verification and profile handling
   - Callback processing

2. **`/app/api/truecaller/webhook/route.ts`** (64 lines)
   - Webhook receiver for Truecaller callbacks
   - Processes user profile data
   - Auto-creates/updates users

3. **`/app/api/truecaller/init/route.ts`** (60 lines)
   - Generates request nonce for Truecaller
   - Provides app key and callback URL

---

## 📋 How Truecaller OTP Works

```
User Flow:
1. User opens OTP page
2. Backend calls Truecaller API with user's phone
3. Truecaller shows permission dialog in user's phone
4. User approves (or rejects)
5. Truecaller sends callback to your webhook
6. Webhook receives user profile (name, phone, avatar)
7. User automatically logged in OR redirected to onboarding
```

---

## 🚀 Next Steps (IMPORTANT!)

### Step 1: Add Environment Variable to Vercel

Go to: **Vercel Project Settings → Environment Variables**

Add this ONE variable:

```
TRUECALLER_APP_KEY = asc6W4c5449ab515e4116918a30e4603f7dda
```

(This is the App Key from your Truecaller Dashboard)

### Step 2: Set Webhook URL in Truecaller Dashboard

Go to: **Truecaller Dashboard → Sheba App → Settings**

In **"Callback URL"** field, make sure it says:
```
https://shebabangladesh.vercel.app/api/truecaller/webhook
```

(It should already be there from before)

### Step 3: Update Database Schema (if needed)

Your `appUsers` table might need these fields (check your schema):
- `truecallerId` (string) - Truecaller user ID
- `truecallerUserId` (string) - Truecaller numeric ID
- `avatar` (string) - Profile picture URL
- `verified` (boolean) - Verification status

If these fields don't exist, let me know and I'll add them!

### Step 4: Deploy

```bash
git add .
git commit -m "Add Truecaller OTP integration with webhook"
git push origin main
```

Vercel will automatically deploy.

---

## 🧪 Testing

### Test with Truecaller App:

1. Install **Truecaller app** on your phone (if not already installed)
2. Go to: `https://shebabangladesh.vercel.app`
3. Enter your phone number → Click "Verify with OTP"
4. You should see **Truecaller permission dialog** on your phone
5. Click "Continue" on the dialog
6. You'll be logged in automatically!

### What Happens Behind the Scenes:

1. Your backend initializes Truecaller verification
2. Truecaller shows dialog on your phone
3. You approve
4. Truecaller sends callback with your profile data
5. Backend creates user account or logs you in
6. You're redirected to PIN or onboarding page

---

## 📊 API Endpoints Created

### 1. Initialize Truecaller Verification

**Endpoint:** `POST /api/truecaller/init`

**Request:**
```json
{
  "phone": "01712345678"
}
```

**Response:**
```json
{
  "success": true,
  "requestNonce": "xxxxx",
  "appKey": "asc6W4c5449ab515e4116918a30e4603f7dda",
  "callbackUrl": "https://shebabangladesh.vercel.app/api/truecaller/webhook"
}
```

### 2. Truecaller Webhook (Callback)

**Endpoint:** `POST /api/truecaller/webhook`

**Receives from Truecaller:**
```json
{
  "requestId": "xxxxx",
  "accessToken": "token_xxxxx",
  "endpoint": "https://profile4-noneu.truecaller.com/v1/default"
}
```

**Returns:**
```json
{
  "success": true,
  "phoneNumber": "01712345678",
  "exists": false
}
```

---

## 🔧 How It Integrates with Your Existing System

### Current OTP Methods:
- ✅ Demo OTP (expires soon)
- ✅ SSLCommerz OTP
- ✅ Bank verification

### New Addition:
- ✅ **Truecaller OTP** (PRIMARY - uses user's Truecaller account)

### Fallback Chain:
```
1. Try Truecaller (fastest, most reliable)
   ↓ (if fails)
2. Use Demo OTP (for development/testing)
```

---

## 🛡️ Security Features

✅ **No Secret Key Exposed** - Uses only App Key  
✅ **Access Token Verification** - Validates Truecaller response  
✅ **Request Nonce** - Prevents replay attacks  
✅ **Phone Number Validation** - Extracts from verified Truecaller profile  
✅ **Auto-creates User** - Creates new account on first verification  
✅ **Updates Existing User** - Adds Truecaller ID to existing accounts  

---

## 📝 User Data Captured

When user verifies with Truecaller, you get:

```
- Phone Number (verified)
- First Name
- Last Name  
- Avatar/Profile Picture
- Email (if shared)
- Truecaller ID
- User ID
- Verification Status (always true from Truecaller)
```

---

## ⚠️ Important Notes

1. **Truecaller App Required** - Users must have Truecaller installed
2. **BD Coverage** - Works in Bangladesh, India, Pakistan, etc.
3. **Instant Verification** - No SMS wait time needed
4. **Privacy** - Users control what data they share
5. **Fallback** - If user rejects or Truecaller fails, falls back to demo OTP

---

## 🐛 Troubleshooting

### If Users Don't See Truecaller Dialog:

1. Check if Truecaller app is installed on their phone
2. Make sure webhook URL is correct in Truecaller Dashboard
3. Check browser console for errors
4. Verify App Key in environment variables

### If Webhook Not Called:

1. Check Truecaller Dashboard settings
2. Verify your app's "Callback URL" is exactly:
   ```
   https://shebabangladesh.vercel.app/api/truecaller/webhook
   ```
3. Check Vercel logs for errors

### If User Profile Not Fetched:

1. Make sure access token is valid
2. Check endpoint URL is correct
3. Look at server logs: `/api/truecaller/webhook`

---

## 📞 Support

If anything breaks or doesn't work:
1. Check the **Server Logs** in Vercel Dashboard
2. Look for `[v0]` messages in logs
3. Check Browser Console (F12) for errors
4. Let me know what error you see!

---

## ✨ Done!

Your Truecaller OTP integration is ready to go! 

Just make sure:
- ✅ Environment variable added (TRUECALLER_APP_KEY)
- ✅ Webhook URL set in Truecaller Dashboard
- ✅ Deploy to Vercel
- ✅ Test with your phone!

Good luck! 🚀
