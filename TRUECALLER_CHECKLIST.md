# Truecaller Integration - ডিপ্লয়মেন্ট চেকলিস্ট

## 🎯 এখনই করতে হবে (5 মিনিট)

### 1. Vercel Environment Variables যোগ করুন
```
□ Vercel Dashboard খুলুন → Settings → Vars
□ TRUECALLER_APP_KEY যোগ করুন (Truecaller Dashboard থেকে)
□ TRUECALLER_SECRET_KEY যোগ করুন (Truecaller Dashboard থেকে)
□ TRUECALLER_API_URL = https://verification-sdk-console.truecaller.com/api/v1/otp
□ Save করুন এবং Deploy করুন
```

### 2. Truecaller Dashboard Setup করুন
```
□ https://verification-sdk-console.truecaller.com এ লগইন করুন
□ আপনার "Sheba" application খুলুন
□ Settings যান
□ Webhook URL সেট করুন:
   https://shebabangladesh.vercel.app/api/truecaller/callback
□ Save করুন
```

### 3. Webhook Events Enable করুন
```
□ Dashboard → Settings → Webhooks
□ নিচের events check করুন:
  □ OTP Sent
  □ OTP Verified  
  □ OTP Expired
  □ OTP Failed
□ Save করুন
```

---

## ✅ যাচাই করুন (3 মিনিট)

### 1. Environment Variables চেক করুন
```
□ Vercel Deploy logs দেখুন
□ কোন "missing env var" error দেখা দিচ্ছে?
   - হাঁ → দেখুন কোন variable মিস করেছেন
   - না → পরবর্তী স্টেপে যান
```

### 2. OTP Page Test করুন
```
□ https://shebabangladesh.vercel.app এ যান
□ একটি ফোন নম্বর enter করুন
□ OTP page load হয়েছে কি?
   - হাঁ → পরবর্তী দেখুন
   - না → console error দেখুন (F12)
```

### 3. Truecaller Integration Check করুন
```
□ OTP page এ indicator দেখা দিচ্ছে?
   - "✓ Truecaller OTP" দেখা দিলে → সফল! ✅
   - Demo OTP দেখা দিলে → Truecaller fail হয়েছে, এখনও demo mode এ আছে ⚠️
```

### 4. Demo OTP Test করুন
```
□ Demo OTP screen এ দেখান OTP লিখুন
□ Verify button ক্লিক করুন
□ যদি success হয় → সবকিছু ঠিক আছে ✅
```

---

## 🚀 Production Deployment (2 মিনিট)

### 1. Vercel Deploy করুন
```
□ Code changes committed
□ Git push করুন main branch এ
□ Vercel auto-deploy হবে
□ Deploy complete check করুন (কোন errors?)
```

### 2. Live Testing করুন
```
□ Real phone number দিয়ে test করুন
□ Truecaller app install করুন phone এ
□ OTP notification আসবে
□ Copy করুন এবং verify করুন
```

### 3. Monitor First 10 Transactions
```
□ Vercel Logs monitor করুন
□ কোন errors দেখা দিচ্ছে?
   - হাঁ → Error details লিখুন
   - না → সবকিছু perfect ✅
```

---

## 📊 Integration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Truecaller Service | ✅ Ready | `/lib/services/truecaller.ts` |
| Request API | ✅ Ready | `/app/api/truecaller/request/route.ts` |
| Verify API | ✅ Ready | `/app/api/truecaller/verify/route.ts` |
| Webhook Handler | ✅ Ready | `/app/api/truecaller/callback/route.ts` |
| OTP Page | ✅ Updated | Truecaller + Demo fallback |
| Environment Vars | ⏳ Pending | দরকার: APP_KEY, SECRET_KEY |
| Webhook URL | ⏳ Pending | দরকার: Truecaller Dashboard এ set করতে হবে |

---

## 🆘 Troubleshooting

### Error: "Missing environment variables"
```
→ Vercel Settings → Vars এ check করুন
→ TRUECALLER_APP_KEY আছে?
→ TRUECALLER_SECRET_KEY আছে?
→ Values correctly পেস্ট করা?
```

### Error: "OTP request failed"
```
→ Truecaller Dashboard এ app status check করুন (active?)
→ API credentials correct?
→ Webhook URL set করা?
```

### Error: "Invalid signature"
```
→ SECRET_KEY exactly match করছে কি check করুন
→ Dashboard এ যা দেখা যায় তার সাথে exactly পেস্ট করুন
→ Deploy করুন fresh
```

### Demo OTP দেখা দিচ্ছে?
```
This is NORMAL fallback behavior ✅
→ Truecaller API temporarily unavailable
→ App still works with demo OTP
→ যখন Truecaller available হবে তখন auto-switch করবে
```

---

## 📞 Quick Support

| Issue | Solution | Time |
|-------|----------|------|
| Env vars | Vercel → Settings → Vars | 1 min |
| Webhook | Truecaller → Settings | 1 min |
| Test | Run on phone | 2 min |
| Debug | Check Vercel logs | 2 min |

---

## ✨ সাফল্যের চিহ্ন

যখন সবকিছু ঠিক হবে:

✅ OTP page এ "✓ Truecaller OTP" দেখা যাবে  
✅ User phone এ Truecaller notification আসবে  
✅ User app এ OTP auto-fill হবে  
✅ Verification instant হবে  
✅ Logs এ কোন errors থাকবে না  

---

## Done! 🎉

এই checklist complete করলে:
- ✅ Truecaller integrate হবে
- ✅ OTP verification instant হবে  
- ✅ Fallback demo mode আছে
- ✅ Production ready!

**Questions?** Check `/TRUECALLER_SETUP.md` for detailed guide
