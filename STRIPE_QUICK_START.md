# Stripe Integration - Quick Start Checklist

Complete these steps to get Stripe payments working in your Sheba Chai app.

## ⏱️ Estimated Time: 15 minutes

---

## 📋 Pre-Setup Checklist

- [ ] Stripe account created (free at https://stripe.com)
- [ ] Access to Vercel project settings
- [ ] Admin access to Stripe dashboard

---

## 🚀 Step 1: Get Stripe API Keys (2 min)

1. [ ] Go to https://dashboard.stripe.com
2. [ ] Click **Developers** → **API keys**
3. [ ] Copy **Publishable key** (starts with `pk_`)
4. [ ] Copy **Secret key** (starts with `sk_`)
5. [ ] Save both keys safely

**Your Keys:**
```
Publishable Key: pk_test_________________
Secret Key:      sk_test_________________
```

---

## 📦 Step 2: Install Dependencies (1 min)

Run in your project terminal:

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

Or use your package manager:
```bash
yarn add stripe @stripe/stripe-js @stripe/react-stripe-js
```

- [ ] Dependencies installed successfully

---

## 🔐 Step 3: Add Environment Variables (3 min)

In your Vercel project:

1. [ ] Go to **Settings** → **Environment Variables**
2. [ ] Add these 4 variables:

| Variable Name | Value |
|---|---|
| `STRIPE_PUBLISHABLE_KEY` | Your publishable key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your publishable key (same) |
| `STRIPE_SECRET_KEY` | Your secret key |
| `STRIPE_WEBHOOK_SECRET` | (Get this in Step 4) |

3. [ ] Save all variables
4. [ ] Wait for redeploy

---

## 🪝 Step 4: Set Up Webhook (5 min)

This lets Stripe tell your app when payments succeed.

### In Stripe Dashboard:

1. [ ] Go to **Developers** → **Webhooks**
2. [ ] Click **Add an endpoint**
3. [ ] Enter endpoint URL:
   ```
   https://your-domain.com/api/stripe/webhook
   ```
   (Replace `your-domain.com` with your actual domain)

4. [ ] Under **Events to send**, select:
   - [ ] `checkout.session.completed`

5. [ ] Click **Add endpoint**
6. [ ] Copy the **Signing secret** (starts with `whsec_`)
7. [ ] Save this secret

### In Vercel:

1. [ ] Go back to **Settings** → **Environment Variables**
2. [ ] Add new variable:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: The signing secret from step 6
3. [ ] Save and wait for redeploy

---

## ✅ Step 5: Test in Your App (4 min)

### In the app:

1. [ ] Go to **Add Money** page
2. [ ] Look for **"Stripe Payment"** option
3. [ ] Click it
4. [ ] Select an amount (e.g., Tk500)

### Use Test Card:

1. [ ] Card number: `4242 4242 4242 4242`
2. [ ] Expiry: Any future date (e.g., `12/30`)
3. [ ] CVC: Any 3 digits (e.g., `123`)
4. [ ] Name: Any name

### Result:

- [ ] Payment processes
- [ ] You see "Success" message
- [ ] Balance increases in your wallet
- [ ] No error messages

---

## 🎉 Success!

If all checkboxes are done and test worked, you're ready!

---

## 🆘 Troubleshooting Quick Fix

### "Stripe Payment button not showing"
- [ ] Rebuild/redeploy your app
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Check environment variables are set

### "Webhook signature verification failed"
- [ ] Check `STRIPE_WEBHOOK_SECRET` is exactly correct
- [ ] No extra spaces before/after
- [ ] Redeploy after updating

### "Payment form doesn't load"
- [ ] Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- [ ] Starts with `pk_test_` or `pk_live_`
- [ ] No typos in the key

### "Balance not updating"
- [ ] Check webhook received event (Stripe Dashboard → Events)
- [ ] Verify phone number in test is correct
- [ ] Check database connection

### Still stuck?
- Read: `/STRIPE_SETUP.md` (detailed setup guide)
- Check: `/STRIPE_ADVANCED.md` (troubleshooting section)

---

## 📱 What Users Will See

1. **Home Page** → Click "Add Money"
2. **Choose Method** → Click "Stripe Payment" (NEW!)
3. **Select Amount** → Pick Tk500-10,000
4. **Secure Form** → Enter card details
5. **Success** → Balance updates instantly

---

## 🔒 Security Checklist

- [ ] Using HTTPS (required by Stripe)
- [ ] Secret keys NOT in code (using env vars)
- [ ] Webhook signature verified
- [ ] Phone number validated
- [ ] Payment amounts validated
- [ ] Test thoroughly before going live

---

## 💳 Accepted Cards

✅ VISA  
✅ Mastercard  
✅ American Express  
✅ Many others (automatic)

**Test Cards Available:**
- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- Amex: `3782 822463 10005`

---

## 🚀 Going Live (When Ready)

When ready to accept real payments:

1. [ ] Complete Stripe account verification
2. [ ] Get live API keys from Stripe
3. [ ] Replace test keys with live keys in env vars
4. [ ] Update webhook endpoint if domain changed
5. [ ] Test with a small amount
6. [ ] Monitor transactions

---

## 📊 What's Working Now

✅ Stripe checkout UI (secure form)  
✅ Payment processing  
✅ Automatic balance updates  
✅ Test mode ready  
✅ Webhook verification  
✅ Error handling  

---

## 📚 Documentation Files

Your project now has complete documentation:

- **`STRIPE_SETUP.md`** - Detailed setup guide
- **`STRIPE_USER_GUIDE.md`** - User instructions
- **`STRIPE_IMPLEMENTATION_SUMMARY.md`** - Technical overview
- **`STRIPE_ADVANCED.md`** - Advanced configuration
- **`STRIPE_QUICK_START.md`** - This file!

---

## ✨ Next Steps

1. [ ] Complete all steps above
2. [ ] Test payment with Tk500
3. [ ] Verify balance updated
4. [ ] Prepare for production keys
5. [ ] Deploy to production

---

**You're all set!** 🎉

Your Sheba Chai app now accepts VISA, Mastercard, and Amex payments securely through Stripe.

Questions? Check the detailed guides or contact Stripe support.

Happy coding! 🚀
