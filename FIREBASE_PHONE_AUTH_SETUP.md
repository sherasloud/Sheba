# Firebase Phone Authentication Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: "Bengali Wallet"
3. Enable Phone Authentication
4. Set up reCAPTCHA v3 (for app verification)

## Step 2: Get Firebase Credentials

### Backend (Next.js):
Go to Project Settings → Service Accounts → Generate Private Key

Add to `.env.local`:
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### Frontend/App (React Native):
Go to Project Settings → General → Your Apps → Web App

Add to `.env.local` (React Native):
```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 3: Enable Phone Authentication

In Firebase Console:
1. Go to Authentication → Sign-in method
2. Enable "Phone Number"
3. Add Bangladesh (+880) to allowed countries

## Step 4: Setup reCAPTCHA

For React Native app verification:
1. Go to Project Settings → App Check
2. Enable "Firebase App Check"
3. Register your app with reCAPTCHA Enterprise

## Step 5: Install Dependencies

### Backend:
```bash
npm install firebase-admin
```

### React Native App:
```bash
npx expo install firebase expo-firebase-recaptcha
```

## Step 6: Update package.json

Mobile app already has `firebase` in dependencies.

## Testing

### Phone Number Format:
- Input: `1709783145` or `01709783145`
- Converted: `+8801709783145`

### Test OTP:
Firebase provides test phone numbers for development:
- Add phone numbers in Firebase Console → Authentication → Phone numbers for testing
- Use OTP: `123456`

## Production

When in production mode:
- reCAPTCHA verification required
- Real SMS sent via Firebase
- First 10,000 SMS/month = FREE
- After that: $0.06 per SMS

## Pricing

- SMS: $0.06 per message (after 10K free monthly)
- Usage: ~100 users × 1 SMS = $6 (well within budget)
- Monthly estimate: $0-200 depending on usage

## API Endpoints

### Send OTP:
```
POST /app/api/firebase-otp/send
Body: { phoneNumber: "01709783145" }
```

### Verify OTP:
```
POST /app/api/firebase-otp/verify
Body: { idToken: "firebase_id_token" }
```

## Next Steps

1. Create Firebase project
2. Add credentials to `.env.local`
3. Update mobile app navigation to use `FirebaseOTPScreen`
4. Test with Firebase test phone number
5. Deploy!
