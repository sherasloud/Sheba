import React, { useState } from 'react'
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
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { auth } from '../config/firebase'
import { PhoneAuthProvider, signInWithPhoneNumber } from 'firebase/auth'

export default function LoginScreen() {
  const navigation = useNavigation()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validatePhoneNumber = (phone: string) => {
    const banglaPhoneRegex = /^01[3-9]\d{8}$/
    return banglaPhoneRegex.test(phone)
  }

  const handleContinue = async () => {
    setError('')

    if (!phoneNumber.trim()) {
      setError('Phone number is required')
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Bangladeshi phone number')
      return
    }

    setIsLoading(true)
    try {
      // Format phone number with +880 prefix
      const formattedPhone = '+880' + phoneNumber.substring(1)
      console.log('[v0] Sending OTP to:', formattedPhone)

      // Send OTP via Firebase
      const verificationId = await signInWithPhoneNumber(auth, formattedPhone)
      
      console.log('[v0] Verification ID received:', verificationId.verificationId)
      
      // Navigate to OTP screen with verification ID
      navigation.navigate('OTP', {
        phoneNumber: formattedPhone,
        verificationId: verificationId.verificationId,
      })
    } catch (err: any) {
      console.error('[v0] Firebase error:', err.message)
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneChange = (text: string) => {
    // Allow only digits
    const cleaned = text.replace(/\D/g, '')
    setPhoneNumber(cleaned)
    setError('')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bengali Wallet</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>
        </View>

        {/* Illustration */}
        <View style={styles.illustration}>
          <Ionicons name="wallet" size={80} color="#3B82F6" />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={[styles.inputContainer, error ? styles.inputError : null]}>
            <Text style={styles.countryCode}>+880</Text>
            <TextInput
              style={styles.input}
              placeholder="1700000000"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              editable={!isLoading}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.hint}>Enter your 10-digit mobile number</Text>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{'\n'}
            <Text style={styles.footerLink}>Terms of Service</Text> and{'\n'}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
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
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    marginBottom: 8,
    height: 50,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 20,
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
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
})
