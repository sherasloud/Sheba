/**
 * Firebase Cloud Messaging (FCM) Setup for React Native
 */

import messaging from '@react-native-firebase/messaging'

/**
 * Initialize Firebase Cloud Messaging
 * Call this in your App.tsx on app startup
 */
export async function initializeFCM(): Promise<void> {
  try {
    // Request permission for notifications
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (!enabled) {
      console.log('[v0] Notification permissions not granted')
      return
    }

    // Get FCM device token
    const fcmToken = await messaging().getToken()
    console.log('[v0] FCM Token:', fcmToken)

    // Save token to user profile in database
    // You should send this to your backend to store it
    localStorage.setItem('fcmToken', fcmToken)

    // Listen for token refresh
    messaging().onTokenRefresh((token) => {
      console.log('[v0] FCM Token refreshed:', token)
      localStorage.setItem('fcmToken', token)
      // TODO: Update token in your backend
    })

    console.log('[v0] FCM initialized successfully')
  } catch (error) {
    console.error('[v0] FCM initialization error:', error)
  }
}

/**
 * Send OTP via FCM to a specific device
 * This should be called from your backend
 *
 * Backend flow:
 * 1. Get user's FCM token from database
 * 2. Call Firebase Admin SDK to send message
 * 3. Message includes OTP code
 *
 * Example backend code (Node.js):
 * ```
 * const admin = require('firebase-admin');
 *
 * async function sendOTPNotification(fcmToken, otp, phone) {
 *   const message = {
 *     notification: {
 *       title: 'Your OTP Code',
 *       body: `Your OTP is: ${otp}`,
 *     },
 *     data: {
 *       otp: otp,
 *       phone: phone,
 *       type: 'otp_verification',
 *       timestamp: Date.now().toString(),
 *     },
 *     token: fcmToken,
 *   };
 *
 *   const response = await admin.messaging().send(message);
 *   console.log('FCM message sent:', response);
 * }
 * ```
 */

export interface FCMOTPMessage {
  otp: string
  phone: string
  expiresIn: number
  type: 'otp_verification'
}

/**
 * Handle background messages
 * Call this in your App.tsx
 */
export function setupBackgroundMessageHandler(): void {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[v0] Background message received:', remoteMessage)

    if (remoteMessage.data?.type === 'otp_verification') {
      console.log('[v0] OTP received in background:', remoteMessage.data.otp)
      // Handle background OTP - store in app state or local storage
    }
  })
}

/**
 * Get FCM token for current device
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken()
    return token
  } catch (error) {
    console.error('[v0] Error getting FCM token:', error)
    return null
  }
}
