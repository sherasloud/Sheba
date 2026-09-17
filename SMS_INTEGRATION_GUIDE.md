# SMS Integration Guide - MyGP OTP System

## Overview
আপনার MyGP phone number থেকে automatic OTP পাঠানো হবে।

## System Flow

```
1. User enters phone number in app
   ↓
2. App sends request to /api/send-otp
   ↓
3. Backend generates 6-digit OTP
   ↓
4. Backend calls sendOTP() function [YOUR MyGP METHOD HERE]
   ↓
5. MyGP sends SMS to user's phone number
   ↓
6. Firebase Cloud Messaging sends notification to app
   ↓
7. App auto-fills OTP (or user can manually enter)
   ↓
8. User clicks "Verify OTP"
   ↓
9. App verifies OTP against database
   ↓
10. User logged in ✓
```

## Implementation Steps

### Step 1: Update `/lib/services/sms.ts`

Replace the placeholder with your MyGP SMS method:

```typescript
// In /lib/services/sms.ts - sendOTP function

export async function sendOTP(phoneNumber: string, otp: string): Promise<SMSResult> {
  try {
    const message = `আপনার OTP কোড: ${otp}\nএই কোডটি 5 মিনিটের জন্য বৈধ।`

    // ========================
    // YOUR MyGP SMS METHOD HERE
    // ========================
    
    // Example implementation (replace with your actual method):
    const result = await myGPSendSMS({
      toNumber: phoneNumber,
      message: message,
      fromNumber: process.env.MYGP_NUMBER || '+8801709783145'
    })

    if (result.success) {
      return {
        success: true,
        message: 'OTP sent successfully',
        messageId: result.messageId
      }
    } else {
      return {
        success: false,
        message: result.error || 'Failed to send SMS'
      }
    }
  } catch (error: any) {
    console.error('[v0] Error sending OTP:', error.message)
    return {
      success: false,
      message: error.message || 'Failed to send OTP',
    }
  }
}
```

### Step 2: Add Your MyGP SMS Function

Create a new file `/lib/services/mygp.ts`:

```typescript
/**
 * MyGP SMS Service
 * Implement your MyGP SMS sending logic here
 */

interface MyGPSMSOptions {
  toNumber: string
  message: string
  fromNumber: string
}

interface MyGPSMSResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function myGPSendSMS(options: MyGPSMSOptions): Promise<MyGPSMSResult> {
  try {
    const { toNumber, message, fromNumber } = options

    console.log('[v0] MyGP SMS:', {
      from: fromNumber,
      to: toNumber,
      message: message,
    })

    // TODO: Implement your MyGP SMS sending logic here
    // This could be:
    // - Direct API call to MyGP
    // - Browser automation
    // - Third-party service
    // - Custom implementation

    // Example:
    /*
    const response = await fetch('YOUR_MYGP_API_ENDPOINT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromNumber,
        to: toNumber,
        text: message
      })
    })

    const result = await response.json()

    return {
      success: result.success,
      messageId: result.messageId
    }
    */

    // Placeholder for now
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
    }
  } catch (error: any) {
    console.error('[v0] MyGP SMS error:', error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}
```

### Step 3: Update `/lib/services/sms.ts` Import

Add this at the top of `/lib/services/sms.ts`:

```typescript
import { myGPSendSMS } from './mygp'
```

Then update the sendOTP function to use it:

```typescript
export async function sendOTP(phoneNumber: string, otp: string): Promise<SMSResult> {
  try {
    const message = `আপনার OTP কোড: ${otp}\nএই কোডটি 5 মিনিটের জন্য বৈধ।`

    const result = await myGPSendSMS({
      toNumber: phoneNumber,
      message: message,
      fromNumber: process.env.MYGP_NUMBER || '+8801709783145'
    })

    if (result.success) {
      return {
        success: true,
        message: 'OTP sent successfully',
        messageId: result.messageId
      }
    } else {
      return {
        success: false,
        message: result.error || 'Failed to send SMS'
      }
    }
  } catch (error: any) {
    console.error('[v0] Error sending OTP:', error.message)
    return {
      success: false,
      message: error.message || 'Failed to send OTP',
    }
  }
}
```

### Step 4: Firebase Cloud Messaging Setup (Optional)

If you want auto-fill OTP in the app:

1. Create Firebase Project at https://console.firebase.google.com
2. Add Firebase service account JSON
3. Store FCM server key in environment variables
4. Use Firebase Admin SDK to send notifications with OTP

Backend code example:
```typescript
import admin from 'firebase-admin'

async function sendOTPNotification(fcmToken: string, otp: string, phone: string) {
  const message = {
    notification: {
      title: 'Your OTP Code',
      body: `Your OTP is: ${otp}`,
    },
    data: {
      otp: otp,
      phone: phone,
      type: 'otp_verification',
    },
    token: fcmToken,
  }

  const response = await admin.messaging().send(message)
  return response
}
```

## API Endpoints

### 1. Send OTP
**POST** `/api/send-otp`

```json
{
  "phone": "01709783145"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "01709783145",
    "expiresIn": 300
  }
}
```

### 2. Verify OTP
**POST** `/api/verify-otp`

```json
{
  "phone": "01709783145",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP verification successful",
  "authToken": "...",
  "phone": "01709783145"
}
```

## Database Table

Make sure you have this table in Supabase:

```sql
CREATE TABLE IF NOT EXISTS otp_sessions (
  phone VARCHAR(20) PRIMARY KEY,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## React Native App Integration

The app is already set up with:
- `/mobile/src/screens/auth/OTPScreenWithFCM.tsx` - OTP input screen with auto-fill
- `/mobile/src/services/fcm.ts` - Firebase Cloud Messaging setup

Just make sure to:
1. Add Firebase config to your React Native app
2. Initialize FCM in App.tsx
3. Handle incoming FCM messages

## Testing

1. Run backend: `npm run dev`
2. Run mobile app: `expo start`
3. Enter phone number: `01709783145`
4. Click "Send OTP"
5. Check if SMS is received
6. Enter OTP in app
7. Click "Verify OTP"
8. Should be logged in ✓

## Troubleshooting

- **OTP not sending**: Check if your MyGP method is implemented correctly
- **OTP not auto-filling**: Check Firebase Cloud Messaging setup
- **OTP expired**: Increase expiry time in sendOTP function (default: 5 minutes)
- **Too many attempts error**: Reset database or wait for expiry
