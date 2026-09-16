import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { auth } from '@/mobile/src/services/firebase'
import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth'
import { useAuthStore } from '@/mobile/src/store/authStore'

const FirebasePhoneOTPScreen = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [error, setError] = useState('')
  const { setAuthenticated, setPhoneNumber: setStoredPhone } = useAuthStore()

  // Send OTP to phone number
  const handleSendOTP = async () => {
    try {
      setError('')
      setLoading(true)

      // Validate phone number
      const cleanPhone = phoneNumber.replace(/\D/g, '')
      let formattedPhone = ''

      if (cleanPhone.startsWith('88')) {
        formattedPhone = '+' + cleanPhone
      } else if (cleanPhone.startsWith('01')) {
        formattedPhone = '+880' + cleanPhone.substring(1)
      } else {
        setError('বৈধ বাংলাদেশী ফোন নম্বর নয়')
        setLoading(false)
        return
      }

      console.log('[v0] Sending OTP to:', formattedPhone)

      // Sign in with phone number
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone)
      setConfirmationResult(confirmation)
      setStep('otp')
      setStoredPhone(formattedPhone)
    } catch (err: any) {
      console.error('[v0] Send OTP error:', err.message)
      setError('OTP পাঠাতে ব্যর্থ: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP
  const handleVerifyOTP = async () => {
    try {
      setError('')
      setLoading(true)

      if (!confirmationResult) {
        setError('পুনরায় চেষ্টা করুন')
        return
      }

      if (otp.length !== 6) {
        setError('OTP 6 অঙ্কের হওয়া উচিত')
        setLoading(false)
        return
      }

      console.log('[v0] Verifying OTP...')

      // Confirm OTP
      const userCredential = await confirmationResult.confirm(otp)

      console.log('[v0] OTP verified successfully, user:', userCredential.user.uid)

      // Update auth store
      setAuthenticated(true)

      // Navigate to PIN setup or home
      navigation.replace('PINSetup')
    } catch (err: any) {
      console.error('[v0] Verify OTP error:', err.message)
      setError('OTP verification failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {step === 'phone' ? 'ফোন নম্বর দিন' : 'OTP যাচাই করুন'}
        </Text>

        {step === 'phone' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="01XXXXXXXXX অথবা +880..."
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!loading}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading || !phoneNumber}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>OTP পাঠান</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.info}>
              আপনার ফোনে 6 অঙ্কের OTP পাঠানো হয়েছে
            </Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>যাচাই করুন</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('phone')}>
              <Text style={styles.resendText}>নম্বর পরিবর্তন করুন</Text>
            </TouchableOpacity>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#1E293B',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  error: {
    color: '#EF4444',
    marginTop: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  resendText: {
    color: '#3B82F6',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 15,
  },
})

export default FirebasePhoneOTPScreen
