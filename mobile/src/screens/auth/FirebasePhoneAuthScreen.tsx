import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { firebaseAuth } from '../../config/firebase'
import { useAuthStore } from '../../store/authStore'

const FirebasePhoneAuthScreen = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [timer, setTimer] = useState(0)
  const recaptchaVerifier = useRef<any>(null)
  const { setUser, setIsAuthenticated } = useAuthStore()

  // Timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('ফোন নম্বর লিখুন')
      return
    }

    // Format phone number
    const formattedPhone = phoneNumber.startsWith('+880')
      ? phoneNumber
      : '+880' + phoneNumber.replace(/^0/, '')

    if (!/^\+880\d{9}$/.test(formattedPhone)) {
      setError('বৈধ বাংলাদেশ ফোন নম্বর লিখুন')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('[v0] Sending OTP to:', formattedPhone)

      // Send OTP via Firebase
      const result = await signInWithPhoneNumber(firebaseAuth, formattedPhone)
      setConfirmationResult(result)
      setStep('otp')
      setTimer(120) // 2 minute timer
    } catch (err: any) {
      console.error('[v0] Firebase error:', err.message)
      setError(err.message || 'OTP পাঠাতে ব্যর্থ')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('6 সংখ্যার OTP লিখুন')
      return
    }

    if (!confirmationResult) {
      setError('ফোন নম্বর যাচাই করুন পুনরায়')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('[v0] Verifying OTP:', otp)

      const userCredential = await confirmationResult.confirm(otp)
      const user = userCredential.user

      console.log('[v0] OTP verified successfully:', user.phoneNumber)

      // Update auth store
      setUser({
        uid: user.uid,
        phoneNumber: user.phoneNumber || phoneNumber,
      })
      setIsAuthenticated(true)

      // Navigate to PIN setup
      navigation.replace('PINSetup')
    } catch (err: any) {
      console.error('[v0] OTP verification error:', err.message)
      setError(err.message || 'OTP যাচাইকরণ ব্যর্থ')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = () => {
    if (timer === 0) {
      setOtp('')
      setStep('phone')
      setConfirmationResult(null)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'center',
          padding: 20,
          backgroundColor: '#0f172a',
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#3b82f6' }}>
            শেবা
          </Text>
          <Text style={{ fontSize: 14, color: '#94a3b8', marginTop: 8 }}>
            ডিজিটাল ওয়ালেট
          </Text>
        </View>

        {step === 'phone' ? (
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#e2e8f0', marginBottom: 16 }}>
              ফোন নম্বর লিখুন
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 2,
                borderColor: '#475569',
                marginBottom: 20,
              }}
            >
              <Text style={{ color: '#64748b', fontSize: 16, marginRight: 8 }}>
                +880
              </Text>
              <TextInput
                style={{
                  flex: 1,
                  padding: 12,
                  color: '#e2e8f0',
                  fontSize: 16,
                }}
                placeholder="1XXXXXXXXX"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text.replace(/[^0-9]/g, ''))
                  setError('')
                }}
                editable={!loading}
              />
            </View>

            {error && (
              <Text style={{ color: '#ef4444', fontSize: 14, marginBottom: 16 }}>
                {error}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleSendOTP}
              disabled={loading || !phoneNumber}
              style={{
                backgroundColor: loading ? '#475569' : '#3b82f6',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
                opacity: loading || !phoneNumber ? 0.5 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                  OTP পাঠান
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#e2e8f0', marginBottom: 8 }}>
              OTP যাচাই করুন
            </Text>
            <Text style={{ color: '#64748b', marginBottom: 20 }}>
              {phoneNumber.replace(/^0/, '+880')} এ পাঠানো OTP লিখুন
            </Text>

            <TextInput
              style={{
                borderWidth: 2,
                borderColor: '#475569',
                padding: 12,
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 24,
                textAlign: 'center',
                letterSpacing: 8,
                marginBottom: 20,
              }}
              placeholder="000000"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^0-9]/g, ''))
                setError('')
              }}
              editable={!loading}
            />

            {error && (
              <Text style={{ color: '#ef4444', fontSize: 14, marginBottom: 16 }}>
                {error}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              style={{
                backgroundColor: loading || otp.length !== 6 ? '#475569' : '#3b82f6',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 16,
                opacity: loading || otp.length !== 6 ? 0.5 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                  যাচাই করুন
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (timer === 0) {
                  handleResendOTP()
                }
              }}
              disabled={timer > 0}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: timer > 0 ? '#64748b' : '#3b82f6',
                  fontSize: 14,
                }}
              >
                {timer > 0 ? `পুনরায় পাঠান (${timer}s)` : 'পুনরায় OTP পাঠান'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default FirebasePhoneAuthScreen
