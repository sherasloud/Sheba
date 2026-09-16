## Firebase Phone OTP Integration - সম্পূর্ণ Setup

### যা তৈরি হয়েছে:

**1. Backend APIs:**
- `/app/api/firebase/send-otp/route.ts` - OTP send করে Firebase দিয়ে
- `/app/api/firebase/verify-otp/route.ts` - OTP verify করে এবং auth token generate করে

**2. React Native App:**
- `/mobile/src/config/firebase.ts` - Firebase initialization
- `/mobile/src/screens/auth/FirebasePhoneAuthScreen.tsx` - সম্পূর্ণ OTP UI (বাংলায়)

**3. Configuration:**
- `/mobile/package.json` - Firebase dependency যোগ করা
- `.env.local` - Firebase credentials সহ

---

### কীভাবে কাজ করবে:

1. **User app খোলে** → `FirebasePhoneAuthScreen` দেখবে
2. **ফোন নম্বর লিখে "OTP পাঠান" ক্লিক করে**
3. **Firebase real SMS পাঠায়** ফোনে (10K/month free)
4. **User OTP app এ লিখে "যাচাই করুন" ক্লিক করে**
5. **Firebase verify করে এবং session তৈরি করে**
6. **User PIN setup স্ক্রিনে যায়**

---

### Next Steps:

**১. npm dependencies install করুন:**
```bash
cd mobile
npm install
```

**২. Firebase Console এ test phone number যোগ করুন (optional):**
- Settings → Phone numbers for testing
- Number: +880XXXXXXXXX
- OTP code: 123456 (যেকোনো 6 digit)

**३. App run করুন:**
```bash
npm start
npm run android
```

**४. Test করুন:**
- +880 prefix সহ বাংলাদেশ নম্বর লিখুন
- Real SMS পাবেন বা test number এর OTP use করুন

---

### Production এ:
- প্রথম 10,000 SMS/month FREE
- এর পরে প্রতি SMS = ~$0.15
- কোন setup খরচ নেই

**সবকিছু ready! 🎉**
