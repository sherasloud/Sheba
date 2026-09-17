# Stripe Payment Integration Setup Guide

This guide explains how to set up Stripe payment integration for your Sheba Chai wallet system.

## What's Been Added

✅ **Stripe Checkout Integration** - Users can add money using VISA, Mastercard, and Amex  
✅ **Wallet Amount Selection** - Predefined wallet amounts (Tk500, Tk1000, Tk2500, Tk5000, Tk10000)  
✅ **Webhook Handler** - Automatic balance updates when payments complete  
✅ **New Add Money Route** - `/add-money-stripe` for Stripe payments  
✅ **Updated Add Money Page** - Added Stripe as a payment option alongside SSLCommerz

## Setup Steps

### 1. Install Stripe Package
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Get Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in with your account
3. Navigate to **Developers → API Keys**
4. Copy your keys:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

### 3. Set Environment Variables

In your Vercel project settings or `.env.local`:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Note:** The `NEXT_PUBLIC_` prefix makes the publishable key available in the browser (this is safe and required).

### 4. Set Up Webhook

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Set Endpoint URL to: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
5. Copy the **Signing Secret** and add it to `STRIPE_WEBHOOK_SECRET`

## How It Works

### User Flow

1. **Home Page** → Click "Add Money"
2. **Choose Method** → Select "Stripe Payment"
3. **Select Amount** → Pick Tk500, Tk1000, Tk2500, Tk5000, or Tk10000
4. **Secure Checkout** → Enter card details (VISA/Mastercard/Amex)
5. **Auto Balance Update** → Wallet updates automatically via webhook

### Payment Flow

```
User selects amount
    ↓
Creates Stripe checkout session
    ↓
User enters card details (hosted on Stripe, never touches your server)
    ↓
Payment processed by Stripe
    ↓
Webhook notifies your server of success
    ↓
Balance updated in Neon database
    ↓
Success confirmation to user
```

## File Structure

```
/lib/
  ├─ stripe.ts                      # Stripe client setup
  └─ stripe-products.ts              # Wallet amounts/products

/app/
  ├─ add-money/page.tsx              # Updated with Stripe option
  ├─ add-money-stripe/
  │  └─ page.tsx                     # Stripe wallet page
  ├─ components/
  │  └─ stripe-checkout.tsx          # Stripe embedded checkout UI
  ├─ actions/
  │  └─ stripe-checkout.ts           # Server action for session creation
  └─ api/stripe/webhook/
     └─ route.ts                     # Webhook handler for payment success
```

## Testing

### Stripe Test Cards

Use these test card numbers in sandbox mode:

- **VISA**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **Amex**: `3782 822463 10005`

Expiry: Any future date (e.g., 12/30)
CVV: Any 3 digits (e.g., 123)

### Test Payment Flow

1. Use test card numbers above
2. Payment will complete successfully
3. Check your Stripe Dashboard for the transaction
4. Verify balance was updated in your database

## Customization

### Change Wallet Amounts

Edit `/lib/stripe-products.ts`:

```typescript
export const WALLET_PRODUCTS: WalletProduct[] = [
  {
    id: 'wallet-100',
    name: 'Tk 100',
    description: 'Add Tk100 to your wallet',
    amountInCents: 10000,  // Amount in cents
    amountInTaka: 100,
    currency: 'USD',
  },
  // Add more amounts...
]
```

### Change Currency

To use BDT directly (when Stripe adds support in Bangladesh):

```typescript
// In /app/actions/stripe-checkout.ts
currency: 'bdt', // instead of 'usd'
unit_amount: product.amountInTaka * 100, // BDT cents
```

### Update Success Messages

Edit `/app/api/stripe/webhook/route.ts` to add SMS/email notifications:

```typescript
// After balance update
await shebaSMS.sendTransactionSMS(
  phoneNumber,
  'cashin',
  takaAmount,
  newBalance
)
```

## Troubleshooting

### "Webhook signature verification failed"
- Check your `STRIPE_WEBHOOK_SECRET` is correct in environment variables
- Ensure webhook is pointing to correct URL: `https://yourdomain/api/stripe/webhook`

### "Product not found" error
- Verify product IDs in checkout match those in `/lib/stripe-products.ts`
- Check productId is being passed correctly from the UI

### Balance not updating after payment
- Check webhook is receiving requests: Stripe Dashboard → Events
- Verify phone number is being passed in metadata
- Check Neon database connection in webhook handler
- Look for errors in server logs

### "Publishable key is invalid"
- Make sure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- It should start with `pk_test_` or `pk_live_`
- Don't prefix publishable key with `STRIPE_PUBLISHABLE_KEY` only

## Security Notes

✅ **PCI Compliant** - Card details never touch your server (handled by Stripe)  
✅ **HTTPS Only** - Stripe checkout requires HTTPS  
✅ **Webhook Verification** - All webhooks are cryptographically verified  
✅ **Rate Limited** - Built-in fraud protection from Stripe  

## Going Live

When ready to accept real payments:

1. Complete Stripe account verification
2. Replace test keys with **live keys** from Stripe Dashboard
3. Update environment variables with live keys
4. Test with real test cards (usually available to verified accounts)
5. Monitor transactions in Stripe Dashboard

## Support

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Webhook Debugging**: Stripe Dashboard → Developers → Events

---

**Status**: ✅ Ready to Deploy

Need help? Check Stripe documentation or contact support.
