# Bank Integration Guide - Jamuna Bank & Probash Kallyan Bank

## Overview
আপনার Sheba app এ Jamuna Bank এবং Probash Kallyan Bank integration করার জন্য এই গাইড।

---

## 1. Jamuna Bank Integration

### Required Information:
- **Bank Name**: Jamuna Bank Limited
- **Integration Type**: Corporate/Business Account
- **Website**: https://www.jamuna-bank.com/

### Steps:

#### Step 1: Corporate Account Opening
```
1. Visit Jamuna Bank Head Office (Dhaka)
   Address: Jamuna Bank Tower, Plot No. 1, Sector-7, 
            Uttara Model Town, Dhaka-1230

2. Required Documents:
   - Business Registration Certificate
   - Trade License
   - NID/Passport of Owner
   - Bank Statements (3 months)
   - Business Address Proof
   - Partnership Deed (if applicable)

3. Account Type: Salary/Current Account for SMEs
```

#### Step 2: API Setup
```
1. Contact Jamuna Bank's Corporate Banking Division
   - Email: corporate@jamuna-bank.com
   - Phone: +880-2-58055555

2. Request for:
   - API Access
   - Developer Documentation
   - Merchant ID
   - API Keys (Live & Sandbox)
   - Payment Gateway Setup

3. Security Requirements:
   - SSL Certificate
   - IP Whitelisting
   - 2FA Authentication
```

#### Step 3: Integration Points
```
Node.js/API Implementation:

// Example endpoint for Jamuna Bank transfer
POST /api/transfer/jamuna
{
  "accountNumber": "1234567890",
  "beneficiaryName": "Customer Name",
  "amount": 5000,
  "description": "Payment for Order #123"
}

// Jamuna Bank will provide:
- Transaction Reference Number
- Real-time Status Updates
- Webhook URLs for callbacks
- Settlement Details
```

---

## 2. Probash Kallyan Bank Integration

### Required Information:
- **Bank Name**: Probash Kallyan Bank Limited
- **Integration Type**: Remittance/Investment Partnership
- **Website**: https://www.probashkallyankbank.com.bd/

### Steps:

#### Step 1: Partnership Agreement
```
1. Contact Probash Kallyan Bank's Corporate Division
   Address: Probash Kallyan Bank Head Office
   Mirpur, Dhaka-1216, Bangladesh

2. Submit:
   - Business Proposal
   - Company Profile
   - Financial Statements
   - Ownership Structure
   - Service Offering Details

3. Expected Timeline: 2-4 weeks for approval

4. Contact Details:
   - Email: corporate@probashkb.com
   - Phone: +880-2-58055500
```

#### Step 2: Investment Partnership Terms
```
Typical Arrangement:
- Revenue Share Model: 60-70% to Probash Kallyan, 30-40% to your app
- Minimum Transaction Volume: BDT 50 Lac/Month
- Settlement Cycle: Daily or Weekly
- Float Management: Probash maintains account balance
- API Access: Real-time transaction processing

Benefits:
- No upfront capital required
- Regulatory compliance handled by bank
- Insurance on transactions
- Customer support from bank
```

#### Step 3: Implementation

```typescript
// POST /api/transfer/probash-kallyan
// Your system would:

1. Validate recipient details
2. Check balance availability
3. Submit to Probash Kallyan API
4. Receive transaction reference
5. Store transaction locally
6. Send confirmation to user

// Probash Kallyan Integration:
const probashAPI = {
  baseURL: "https://api.probashkallyankbank.com.bd/v1",
  endpoints: {
    remittance: "/remittance/send",
    billPayment: "/bills/pay",
    fundTransfer: "/funds/transfer",
    accountBalance: "/account/balance",
    transactionStatus: "/transactions/status"
  }
}
```

---

## 3. Comparative Overview

| Feature | Jamuna Bank | Probash Kallyan |
|---------|-------------|-----------------|
| **Account Type** | Corporate/Current | Partnership |
| **Setup Cost** | 500-2000 BDT | Negotiable |
| **API Rate** | Per transaction | Revenue share |
| **Settlement** | Daily | Daily/Weekly |
| **Min. Volume** | Flexible | BDT 50 Lac/Month |
| **Best For** | Direct transfers | Remittance/Investment |
| **Support** | Corporate desk | Partnership manager |

---

## 4. Recommended Approach

### Phase 1: Jamuna Bank (Immediate)
```
Timeline: 3-4 weeks
Cost: ~5000-10000 BDT (account opening + setup)
Benefit: Direct fund management

Steps:
1. Week 1-2: Account opening + documentation
2. Week 2-3: API access + sandbox testing
3. Week 3-4: Production deployment
```

### Phase 2: Probash Kallyan (Future)
```
Timeline: 4-6 weeks
Cost: Minimal (revenue share model)
Benefit: Scale without capital

Steps:
1. Week 1-2: Partnership discussion + terms
2. Week 2-4: Agreement + API setup
3. Week 4-6: Testing + live deployment
```

---

## 5. Implementation Checklist

### Before Contact Bank:
- [ ] Prepare business documents
- [ ] Define transaction volume expectations
- [ ] Identify API requirements
- [ ] Plan transaction flow in your app

### After API Access:
- [ ] Create Sandbox testing environment
- [ ] Implement endpoints in your backend
- [ ] Test with test accounts
- [ ] Set up webhooks for callbacks
- [ ] Implement error handling
- [ ] Add logging/monitoring

### Pre-Production:
- [ ] Security audit
- [ ] Load testing
- [ ] User UAT
- [ ] Compliance review
- [ ] Go-live checklist

---

## 6. API Integration Code Template

```typescript
// /app/api/transfer/jamuna/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { accountNumber, beneficiaryName, amount, description } = await request.json()

    // Validate inputs
    if (!accountNumber || !beneficiaryName || !amount) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Call Jamuna Bank API
    const jamunaResponse = await fetch('https://api.jamuna-bank.com/v1/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.JAMUNA_API_KEY}`,
      },
      body: JSON.stringify({
        merchantId: process.env.JAMUNA_MERCHANT_ID,
        accountNumber,
        beneficiaryName,
        amount,
        description,
        timestamp: new Date().toISOString(),
      })
    })

    const result = await jamunaResponse.json()

    if (jamunaResponse.ok) {
      // Store transaction in database
      // Send notification to user
      return NextResponse.json({
        success: true,
        transactionId: result.reference,
        amount,
        status: 'pending'
      })
    } else {
      return NextResponse.json(
        { success: false, message: result.error || "Transfer failed" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("[v0] Jamuna Bank transfer error:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
```

---

## 7. Contact Information Summary

### Jamuna Bank
- **Corporate Division**: +880-2-58055555
- **Email**: corporate@jamuna-bank.com
- **Developer Portal**: dev.jamuna-bank.com
- **Helpline**: 09612-400400

### Probash Kallyan Bank
- **Partnership Team**: +880-2-58055500
- **Email**: corporate@probashkb.com
- **Partner Portal**: partner.probashkb.com
- **Support**: 09612-500500

---

## 8. Regulatory Compliance

- **Bangladesh Bank**: Ensure compliance with directives
- **BFIU**: Money laundering prevention
- **KYC/AML**: Customer verification requirements
- **ACI**: Automated Clearing House requirements

Contact Bangladesh Bank's Financial Inclusion Department for requirements.

---

## Next Steps:

1. Prepare business documents (this week)
2. Contact Jamuna Bank Corporate Division (next week)
3. Apply for corporate account (Week 2-3)
4. Simultaneously discuss with Probash Kallyan (Week 1-2)
5. Once API keys received, start development

**Estimated Total Timeline: 6-8 weeks for both banks fully integrated**
