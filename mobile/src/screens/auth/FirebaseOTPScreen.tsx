import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { initializeAuth, signInWithPhoneNumber, RecaptchaVerifier, PhoneAuthProvider, signInWithCredential } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha'

// Initialize Firebase (use your config)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

const firebaseApp = initializeApp(firebaseConfig)

export default function FirebaseOTPScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [verificationId, setVerificationId] = useState<string | null>(null)
  const recaptchaVerifier = useRef<RecaptchaVerifier>(null)

  // Format phone number
  const formatPhoneNumber = (number: string) => {
    let formatted = number.replace(/\D/g, '')
    if (!formatted.startsWith('880')) {
      if (formatted.startsWith('0')) {
        formatted = '880' + formatted.slice(1)
      } else {
        formatted = '880' + formatted
      }
    }
    return '+' + formatted
  }

  // Send OTP
  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter phone number')
      return
    }

    setLoading(true)
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber)
      console.log('[v0] Sending OTP to:', formattedPhone)

      const auth = initializeAuth(firebaseApp)
      
      // Send verification code
      const response = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier.current as RecaptchaVerifier)
      
      setVerificationId(response.verificationId)
      setStep('otp')
      Alert.alert('Success', 'OTP sent to your phone number')
    } catch (error: any) {
      console.error('[v0] OTP send error:', error)
      Alert.alert('Error', error.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      console.log('[v0] Verifying OTP:', otp)
      
      const auth = initializeAuth(firebaseApp)
      const credential = PhoneAuthProvider.credential(verificationId!, otp)
      const userCredential = await signInWithCredential(auth, credential)

      // Get ID token
      const idToken = await userCredential.user.getIdToken()

      // Verify on backend
      const response = await fetch('/api/firebase-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      const result = await response.json()

      if (result.success) {
        console.log('[v0] Verification successful')
        Alert.alert('Success', 'Phone verified successfully!')
        // Navigate to next screen
        navigation.replace('Home')
      } else {
        Alert.alert('Error', result.message)
      }
    } catch (error: any) {
      console.error('[v0] OTP verification error:', error)
      Alert.alert('Error', error.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Phone Verification</Text>
          <Text style={styles.subtitle}>
            {step === 'phone' ? 'Enter your phone number' : 'Enter OTP from SMS'}
          </Text>
        </View>

        {step === 'phone' ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInput}>
                <Text style={styles.prefix}>+880</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1709783145"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  editable={!loading}
                />
              </View>
              <Text style={styles.hint}>Enter your 11-digit mobile number</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>6-Digit OTP</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                editable={!loading}
              />
              <Text style={styles.hint}>Check your SMS for the code</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setStep('phone')
                setOtp('')
                setVerificationId(null)
              }}
            >
              <Text style={styles.backText}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    backgroundColor: '#111',
    paddingHorizontal: 12,
  },
  prefix: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#fff',
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    backgroundColor: '#111',
    paddingVertical: 16,
  },
  hint: {
    fontSize: 12,
    color: '#666',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
})
