import { NextRequest, NextResponse } from 'next/server'
import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null

function initializeFirebase() {
  if (firebaseApp) return firebaseApp

  try {
    const privateKeyString = process.env.FIREBASE_PRIVATE_KEY
    
    if (!privateKeyString) {
      console.error('[v0] FIREBASE_PRIVATE_KEY not set')
      throw new Error('Firebase private key not configured')
    }

    // Parse private key - handle both escaped and unescaped formats
    let privateKey = privateKeyString
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1)
    }
    privateKey = privateKey.replace(/\\n/g, '\n')

    const serviceAccountConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'sheba-1fc71',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@sheba-1fc71.iam.gserviceaccount.com',
      privateKey: privateKey,
    }

    if (admin.apps.length === 0) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountConfig as admin.ServiceAccount),
      })
      console.log('[v0] Firebase Admin SDK initialized')
    } else {
      firebaseApp = admin.app()
    }

    return firebaseApp
  } catch (error: any) {
    console.error('[v0] Firebase initialization failed:', error.message)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone, phoneNumber } = await request.json()
    const targetPhone = phone || phoneNumber

    if (!targetPhone) {
      return NextResponse.json(
        { success: false, message: 'ফোন নম্বর প্রয়োজন' },
        { status: 400 }
      )
    }

    console.log('[v0] OTP request for phone:', targetPhone)

    // Format phone number properly
    let formattedPhone = targetPhone
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+880' + formattedPhone.substring(1)
      } else if (formattedPhone.startsWith('880')) {
        formattedPhone = '+' + formattedPhone
      }
    }

    console.log('[v0] Formatted phone:', formattedPhone)

    // Initialize Firebase Admin
    initializeFirebase()
    const auth = admin.auth()

    // For real phone authentication:
    // The frontend will use Firebase SDK to handle the OTP flow
    // We prepare the backend to verify the token later
    
    // Create a custom claim token for this phone number
    try {
      const customToken = await auth.createCustomToken(formattedPhone, {
        phoneNumber: formattedPhone,
        timestamp: Date.now(),
      })

      console.log('[v0] Created custom token for:', formattedPhone)

      return NextResponse.json({
        success: true,
        message: 'OTP পাঠানোর প্রস্তুতি সম্পন্ন',
        phoneNumber: formattedPhone,
        customToken: customToken,
        status: 'ready_for_otp',
        instructions: 'ক্লায়েন্ট সাইডে Firebase OTP verification চালু করুন',
      })
    } catch (tokenError: any) {
      console.error('[v0] Token creation error:', tokenError.message)
      return NextResponse.json(
        { success: false, message: 'টোকেন তৈরিতে ব্যর্থ: ' + tokenError.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[v0] Send OTP error:', error.message)
    return NextResponse.json(
      { success: false, message: 'সার্ভার ত্রুটি: ' + error.message },
      { status: 500 }
    )
  }
}
