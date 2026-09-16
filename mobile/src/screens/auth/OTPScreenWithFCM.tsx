import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import messaging from '@react-native-firebase/messaging'
import { useAuthStore } from '../../store/authStore'

interface OTPMessage {
  otp: string
  phone: string
  timestamp: number
}

export default function OTPScreenWithFCM({ route, navigation }: any) {
  const { phone } = route.params
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [canResend, setCanResend] = useState(false)
  const { verifyOTP } = useAuthStore()
  const messageListenerRef = useRef<any>(null)

  // Setup FCM listener for auto-fill
  useEffect(() => {
    console.log('[v0] Setting up FCM listener for OTP')

    // Listen for foreground messages
    messageListenerRef.current = messaging().onMessage(async (remoteMessage) => {
      console.log('[v0] FCM message received:', remoteMessage)

      try {
        // Extract OTP from message data
        const otpData = remoteMessage.data as OTPMessage

        if (otpData.otp && otpData.phone === phone) {
          console.log('[v0] OTP received via FCM:', otpData.otp)
          setOtp(otpData.otp)

          // Show notification
          Alert.alert('OTP Received', `Your OTP is: ${otpData.otp}`)
        }
      } catch (error) {
        console.error('[v0] Error processing FCM message:', error)
      }
    })

    // Also handle background message notification tap
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('[v0] Notification opened:', remoteMessage)

      if (remoteMessage?.data?.otp) {
        setOtp(remoteMessage.data.otp as string)
      }
    })

    // Check if app was opened from notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.data?.otp) {
          setOtp(remoteMessage.data.otp as string)
        }
      })

    return () => {
      if (messageListenerRef.current) {
        messageListenerRef.current()
      }
    }
  }, [phone])

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setCanResend(true)
    }
  }, [timeLeft, canResend])

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP')
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyOTP(phone, otp)

      if (result.success) {
        Alert.alert('Success', 'OTP verified successfully!')
        navigation.replace('PINSetup')
      } else {
        Alert.alert('Error', result.message || 'OTP verification failed')
        setOtp('')
      }
    } catch (error) {
      console.error('[v0] OTP verification error:', error)
      Alert.alert('Error', 'An error occurred during verification')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return

    setIsLoading(true)
    setTimeLeft(120)
    setCanResend(false)
    setOtp('')

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const result = await response.json()

      if (result.success) {
        Alert.alert('OTP Sent', 'New OTP has been sent to your phone')
      } else {
        Alert.alert('Error', result.message || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('[v0] Error resending OTP:', error)
      Alert.alert('Error', 'Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (value: string) => {
    // Only allow digits and max 6 characters
    const filtered = value.replace(/[^0-9]/g, '').slice(0, 6)
    setOtp(filtered)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>We've sent a code to {phone}</Text>

        {/* OTP Input */}
        <TextInput
          style={styles.otpInput}
          placeholder="000000"
          keyboardType="numeric"
          maxLength={6}
          value={otp}
          onChangeText={handleOtpChange}
          editable={!isLoading}
          placeholderTextColor="#999"
        />

        {/* Auto-fill hint */}
        <Text style={styles.hintText}>
          💬 OTP will auto-fill when received via notification
        </Text>

        {/* Timer */}
        <Text style={styles.timerText}>
          {canResend ? 'Resend OTP available' : `Resend OTP in ${timeLeft}s`}
        </Text>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, !otp || isLoading ? styles.disabledButton : {}]}
          onPress={handleVerifyOTP}
          disabled={!otp || otp.length !== 6 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        {/* Resend Button */}
        <TouchableOpacity
          style={[styles.resendButton, !canResend ? styles.disabledButton : {}]}
          onPress={handleResendOTP}
          disabled={!canResend || isLoading}
        >
          <Text style={[styles.resendButtonText, !canResend ? { color: '#999' } : {}]}>
            Resend OTP
          </Text>
        </TouchableOpacity>

        {/* Change Phone Number */}
        <TouchableOpacity
          style={styles.changePhoneButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.changePhoneText}>Change phone number</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 16,
    letterSpacing: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  timerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  resendButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  changePhoneButton: {
    marginTop: 12,
  },
  changePhoneText: {
    color: '#3B82F6',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
})
