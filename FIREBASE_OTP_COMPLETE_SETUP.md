# Firebase Phone OTP - সম্পূর্ণ Setup Guide

## What's Been Setup:

✅ **Backend:**
- `/lib/firebase-admin.ts` - Firebase Admin SDK initialization
- `/app/api/firebase-otp/send/route.ts` - OTP send endpoint

✅ **React Native App:**
- `/mobile/src/services/firebase.ts` - Firebase client initialization
- `/mobile/src/screens/auth/FirebasePhoneOTPScreen.tsx` - Complete OTP UI

✅ **Environment Variables:**
- `.env.local` has all Firebase credentials

## How It Works:

### Step 1: User enters phone number
```
User Input: 01709783145 or +880191425540
```

### Step 2: Frontend sends to Backend
```
POST /api/firebase-otp/send
Body: { phoneNumber: "01709783145" }
```

### Step 3: Backend validates and returns
```
Response: {
  success: true,
  phoneNumber: "+8801709783145",
  customToken: "eyJhbGc..."
}
```

### Step 4: Frontend calls Firebase signInWithPhoneNumber
```typescript
const confirmation = await signInWithPhoneNumber(auth, "+8801709783145")
```

### Step 5: Firebase sends real OTP to user's phone

### Step 6: User enters OTP
```
User Input: 123456
```

### Step 7: Frontend confirms OTP
```typescript
const userCredential = await confirmation.confirm("123456")
```

### Step 8: User authenticated ✓

## Testing:

### For Development (Test Phone Numbers):
1. Firebase Console → Authentication → Sign-in method → Phone
2. Add test phone number: +8801709783145
3. Test OTP: 123456

### For Production:
1. User's real phone will receive real OTP
2. 10,000 SMS/month = FREE on Firebase

## Environment Variables Already Set:
```
FIREBASE_PROJECT_ID=sheba-1fc71
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sheba-1fc71.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sheba-1fc71.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sheba-1fc71
```

## Next Steps:

1. **Install Firebase packages in React Native app:**
```bash
cd mobile
npm install firebase @react-native-async-storage/async-storage
npx expo install firebase @react-native-async-storage/async-storage
```

2. **Update App.tsx to use FirebasePhoneOTPScreen:**
```typescript
import FirebasePhoneOTPScreen from './src/screens/auth/FirebasePhoneOTPScreen'

// In Stack.Navigator
<Stack.Screen name="Login" component={FirebasePhoneOTPScreen} />
```

3. **Test on Expo:**
- Use test phone number: +8801709783145
- Test OTP code: 123456
- Should authenticate and go to PIN setup

4. **For Production:**
- Users get real OTP on their phones
- Costs 10,000 free SMS/month from Firebase

## Features:

✅ Real OTP sent to user's phone (10K/month FREE)
✅ Bangladesh phone number support (+880)
✅ Automatic phone number formatting
✅ Error handling and validation
✅ Loading states
✅ Secure Firebase authentication
✅ Persistent authentication with AsyncStorage
