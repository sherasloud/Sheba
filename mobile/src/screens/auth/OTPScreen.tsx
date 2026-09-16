import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { auth } from '../config/firebase'
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth'
import { useAuthStore } from '../../store/authStore'

export default function OTPScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { phoneNumber, verificationId } = route.params || {}
  const { setAuthenticated, setPhoneNumber } = useAuthStore()
  
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(120)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    // Timer for OTP expiry
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleOTPChange = (text: string) => {
    // Allow only digits, max 6 characters
    const cleaned = text.replace(/\D/g, '')
    setOtp(cleaned.slice(0, 6))
    setError('')
  }

  const handleVerifyOTP = async () => {
    setError('')

    if (!otp.trim()) {
      setError('OTP is required')
      return
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    if (!verificationId) {
      setError('Verification ID not found. Please try again.')
      return
    }

    setIsLoading(true)
    try {
      console.log('[v0] Verifying OTP:', otp)
      
      // Create credential with OTP
      const credential = PhoneAuthProvider.credential(verificationId, otp)
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential)
      
      console.log('[v0] OTP verified successfully for:', userCredential.user.phoneNumber)
      
      // Update auth store
      setAuthenticated(true)
      setPhoneNumber(phoneNumber)
      
      // Navigate to PIN setup
      navigation.reset({
        index: 0,
        routes: [{ name: 'PINSetup' }],
      })
    } catch (err: any) {
      console.error('[v0] OTP verification error:', err.message)
      setError(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setTimeLeft(120)
    setCanResend(false)
    setOtp('')
    setError('')
    console.log('[v0] OTP resend requested for:', phoneNumber)
    // Navigate back to phone entry screen to start over
    navigation.goBack()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#3B82F6" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Enter the OTP sent to {phoneNumber}</Text>
        </View>

        {/* Illustration */}
        <View style={styles.illustration}>
          <Ionicons name="mail" size={80} color="#10B981" />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>One-Time Password</Text>
          <View style={[styles.otpContainer, error ? styles.inputError : null]}>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={handleOTPChange}
              editable={!isLoading}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.timerContainer}>
            {!canResend ? (
              <Text style={styles.timerText}>Resend OTP in {formatTime(timeLeft)}</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, (isLoading || otp.length !== 6) && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Ionicons name="information-circle" size={16} color="#6B7280" />
          <Text style={styles.infoText}>Check your phone for the verification code</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  illustration: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  form: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  otpContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    marginBottom: 8,
    height: 50,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    letterSpacing: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 12,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  resendText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
})
