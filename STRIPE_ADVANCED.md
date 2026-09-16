# Stripe Integration - Advanced Guide

## 🔧 Advanced Configuration

### Custom Webhook Handling

Add email/SMS notifications after successful payment:

**File**: `/app/api/stripe/webhook/route.ts`

```typescript
if (session.payment_status === 'paid') {
  // ... existing code ...
  
  // Add SMS notification
  try {
    await shebaSMS.sendTransactionSMS(
      phoneNumber,
      'cashin',
      takaAmount,
      newBalance
    )
  } catch (err) {
    console.error('SMS failed (non-critical):', err)
  }
  
  // Add email notification
  const user = await db.select().from(appUsers)
    .where(eq(appUsers.phoneNumber, phoneNumber))
  if (user[0]?.email) {
    await sendWalletTopupEmail(user[0].email, takaAmount, newBalance)
  }
}
```

### Transaction Logging

Add detailed transaction records:

```typescript
// In webhook, after balance update
await db.insert(transactions).values({
  id: crypto.randomUUID(),
  userid: user[0].id,
  phonenumber: phoneNumber,
  amount: takaAmount,
  balanceBefore: currentBalance,
  balanceAfter: newBalance,
  type: 'stripe_topup',
  status: 'completed',
  description: `Stripe payment - Session: ${session.id}`,
  createdAt: new Date(),
})
```

### Admin Dashboard Integration

Add Stripe payments to admin analytics:

```typescript
// File: /app/api/admin/stripe-stats/route.ts

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const period = searchParams.get('period') || '30' // days
  
  const daysAgo = new Date()
  daysAgo.setDate(daysAgo.getDate() - parseInt(period))
  
  const stripeTransactions = await db.select({
    amount: transactions.amount,
    count: sql`COUNT(*)`,
  })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'stripe_topup'),
        gte(transactions.createdAt, daysAgo)
      )
    )
    .groupBy(transactions.amount)
  
  return Response.json(stripeTransactions)
}
```

## 🔍 Testing Scenarios

### Test Case 1: Successful Payment
```
1. Select Tk1000
2. Use card: 4242 4242 4242 4242
3. Any future date, any CVC
4. Complete payment
✅ Expected: Balance increases by 1000, success message
```

### Test Case 2: Declined Card
```
1. Select Tk500
2. Use card: 4000 0000 0000 0002 (declined)
3. Complete form
✅ Expected: Error message, balance unchanged
```

### Test Case 3: Expired Card
```
1. Select Tk2500
2. Use card: 4000 0000 0000 0069 (expired)
3. Use past expiry date
✅ Expected: Error message, balance unchanged
```

### Test Case 4: Insufficient Funds
```
1. Select Tk5000
2. Use card: 4000 0000 0000 9995 (insufficient funds)
✅ Expected: Error message, balance unchanged
```

### Test Case 5: Webhook Verification
```
1. Make successful payment
2. Check Stripe Dashboard → Events
3. Look for checkout.session.completed
✅ Expected: Event shows successful, database updated
```

## 🛡️ Security Best Practices

### 1. Webhook Verification
Always verify signature (already implemented):

```typescript
let event
try {
  event = stripe.webhooks.constructEvent(
    body,
    signature,
    webhookSecret
  )
} catch (err) {
  // If signature doesn't match, reject
  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
}
```

### 2. Rate Limiting
Add rate limiting to webhook endpoint:

```typescript
// File: /app/api/stripe/webhook/route.ts
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '60s'),
})

export async function POST(request: NextRequest) {
  const { success } = await ratelimit.limit('webhook')
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  // ... rest of webhook
}
```

### 3. Phone Number Validation
Ensure phone number is valid before updating:

```typescript
// Add phone validation
const phoneRegex = /^01[3-9]\d{8}$/; // Bangladesh phone format

if (!phoneRegex.test(phoneNumber)) {
  console.error('Invalid phone number format:', phoneNumber)
  return NextResponse.json(
    { error: 'Invalid phone number' },
    { status: 400 }
  )
}
```

### 4. Amount Validation
Prevent abuse:

```typescript
const MAX_SINGLE_AMOUNT = 50000 // Tk50,000
const MIN_SINGLE_AMOUNT = 50    // Tk50

if (takaAmount < MIN_SINGLE_AMOUNT || takaAmount > MAX_SINGLE_AMOUNT) {
  console.error('Amount out of range:', takaAmount)
  return NextResponse.json(
    { error: 'Amount out of allowed range' },
    { status: 400 }
  )
}
```

### 5. Idempotency
Prevent duplicate balance updates:

```typescript
// File: /lib/db/schema.ts
export const stripePayments = pgTable('stripePayments', {
  id: text('id').primaryKey(),
  stripeSessionId: text('stripeSessionId').notNull().unique(), // Prevent duplicates
  phoneNumber: text('phoneNumber').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  status: text('status').notNull(),
  processedAt: timestamp('processedAt').notNull().defaultNow(),
})

// In webhook:
const existing = await db.query.stripePayments
  .findFirst({
    where: eq(stripePayments.stripeSessionId, session.id)
  })

if (existing) {
  console.log('Payment already processed')
  return NextResponse.json({ received: true })
}
```

## 📈 Monitoring & Analytics

### Log Payment Events
```typescript
// Add to webhook
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  event: 'payment_success',
  phoneNumber: phoneNumber,
  amount: takaAmount,
  sessionId: session.id,
  customerId: session.customer,
}))
```

### Track Key Metrics
```typescript
// File: /app/api/admin/stripe-metrics/route.ts

export async function GET() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayMetrics = await db
    .select({
      totalAmount: sql`SUM(amount)`,
      totalTransactions: sql`COUNT(*)`,
      averageAmount: sql`AVG(amount)`,
    })
    .from(stripePayments)
    .where(
      and(
        eq(stripePayments.status, 'success'),
        gte(stripePayments.processedAt, today)
      )
    )
  
  return Response.json({
    date: today,
    ...todayMetrics[0],
  })
}
```

## 🔄 Error Recovery

### Handle Webhook Failures
```typescript
// Retry mechanism in webhook
const MAX_RETRIES = 3
let retries = 0

async function updateBalanceWithRetry(phone: string, amount: number) {
  try {
    await db.update(appUsers)
      .set({ balance: amount })
      .where(eq(appUsers.phoneNumber, phone))
  } catch (err) {
    if (retries < MAX_RETRIES) {
      retries++
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries)))
      return updateBalanceWithRetry(phone, amount)
    }
    throw err
  }
}
```

### Payment Failed - Refund Logic
```typescript
// If webhook fails to update balance, mark for manual review
if (session.payment_status === 'paid') {
  const updateSuccess = await updateBalanceWithRetry(phoneNumber, takaAmount)
  
  if (!updateSuccess) {
    // Log for manual intervention
    await db.insert(failedPayments).values({
      stripeSessionId: session.id,
      phoneNumber: phoneNumber,
      amount: takaAmount,
      reason: 'Balance update failed',
      status: 'pending_review',
    })
    
    // Alert admin
    await alertAdmin(`Payment ${session.id} failed to apply`)
  }
}
```

## 🌍 Multi-Currency Support

When Stripe adds BDT support:

```typescript
// File: /lib/stripe-products.ts

// Current: USD conversion
export const WALLET_PRODUCTS: WalletProduct[] = [
  {
    id: 'wallet-500',
    amountInCents: 50000,  // $500 (temporary)
    currency: 'USD',
  },
]

// Future: Direct BDT
// export const WALLET_PRODUCTS: WalletProduct[] = [
//   {
//     id: 'wallet-500',
//     amountInCents: 50000,  // Tk500 in cents
//     currency: 'BDT',
//   },
// ]
```

## 🚨 Debugging

### Enable Detailed Logging
```typescript
// In webhook
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('[STRIPE_WEBHOOK_DEBUG]', {
    eventType: event.type,
    sessionId: session.id,
    amount: takaAmount,
    phone: phoneNumber,
    timestamp: new Date().toISOString(),
  })
}
```

### Test Webhook Locally
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger test event
stripe trigger payment_intent.succeeded
```

### Monitor Stripe Events
```bash
# List recent webhook attempts
stripe logs tail

# See specific webhook details
stripe webhooks retrieve <webhook_id>
```

## 📞 Support & Resources

**Stripe Resources:**
- API Reference: https://stripe.com/docs/api
- Webhook Events: https://stripe.com/docs/api/events/types
- Testing: https://stripe.com/docs/testing
- Error Codes: https://stripe.com/docs/error-codes

**Your Resources:**
- Setup: `/STRIPE_SETUP.md`
- User Guide: `/STRIPE_USER_GUIDE.md`
- Summary: `/STRIPE_IMPLEMENTATION_SUMMARY.md`

---

**Advanced Level**: Configuration complete
**Status**: 🟢 Production ready
