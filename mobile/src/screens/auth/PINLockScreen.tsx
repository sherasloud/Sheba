import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Vibration,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../../store/authStore'

const { width, height } = Dimensions.get('window')

export default function PINLockScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { setPINSet, setAuthenticated } = useAuthStore()
  
  const isSetupMode = route.name === 'PINSetup'
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState('setup') // setup, confirm, or lock
  const [error, setError] = useState('')
  const [showPin, setShowPin] = useState(false)

  useEffect(() => {
    if (isSetupMode) {
      setStep('setup')
    } else {
      setStep('lock')
    }
  }, [isSetupMode])

  const handleNumberPress = (num: string) => {
    if (step === 'setup' && pin.length < 4) {
      setPin(pin + num)
      setError('')
    } else if (step === 'confirm' && confirmPin.length < 4) {
      setConfirmPin(confirmPin + num)
      setError('')
    } else if (step === 'lock' && pin.length < 4) {
      setPin(pin + num)
      setError('')
    }
  }

  const handleBackspace = () => {
    if (step === 'setup') {
      setPin(pin.slice(0, -1))
    } else if (step === 'confirm') {
      setConfirmPin(confirmPin.slice(0, -1))
    } else if (step === 'lock') {
      setPin(pin.slice(0, -1))
    }
  }

  const handleContinue = async () => {
    if (step === 'setup') {
      if (pin.length !== 4) {
        setError('PIN must be 4 digits')
        Vibration.vibrate(500)
        return
      }
      setStep('confirm')
      setConfirmPin('')
      setError('')
    } else if (step === 'confirm') {
      if (confirmPin.length !== 4) {
        setError('PIN must be 4 digits')
        Vibration.vibrate(500)
        return
      }
      if (pin !== confirmPin) {
        setError('PINs do not match')
        Vibration.vibrate(500)
        setPin('')
        setConfirmPin('')
        setStep('setup')
        return
      }

      // Save PIN to secure storage
      try {
        await SecureStore.setItemAsync('userPin', pin)
        setPINSet(true)
        setAuthenticated(true, 'temp-user-id')
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      } catch (err) {
        setError('Failed to save PIN')
        console.error('[v0] PIN save error:', err)
      }
    } else if (step === 'lock') {
      if (pin.length !== 4) {
        setError('PIN must be 4 digits')
        Vibration.vibrate(500)
        return
      }

      // Verify PIN
      try {
        const savedPin = await SecureStore.getItemAsync('userPin')
        if (pin === savedPin) {
          setAuthenticated(true, 'temp-user-id')
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        } else {
          setError('Incorrect PIN')
          Vibration.vibrate([100, 50, 100])
          setPin('')
        }
      } catch (err) {
        setError('Failed to verify PIN')
        console.error('[v0] PIN verify error:', err)
      }
    }
  }

  const handleForgotPin = () => {
    // Navigate to login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    })
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {step === 'setup' ? 'Create PIN' : step === 'confirm' ? 'Confirm PIN' : 'Enter PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'setup'
            ? 'Create a 4-digit PIN for security'
            : step === 'confirm'
            ? 'Re-enter your PIN'
            : 'Enter your 4-digit PIN'}
        </Text>
      </View>

      {/* PIN Display */}
      <View style={styles.pinDisplay}>
        {[0, 1, 2, 3].map((index) => {
          const currentPin = step === 'setup' ? pin : step === 'confirm' ? confirmPin : pin
          const isFilled = index < currentPin.length
          return (
            <View key={index} style={[styles.pinDot, isFilled && styles.pinDotFilled]} />
          )
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Number Pad */}
      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => handleNumberPress(num.toString())}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}

        {/* 0 Button */}
        <View style={{ width: '33.33%' }} />
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => handleNumberPress('0')}
        >
          <Text style={styles.numberText}>0</Text>
        </TouchableOpacity>

        {/* Backspace Button */}
        <TouchableOpacity style={styles.numberButton} onPress={handleBackspace}>
          <Ionicons name="backspace" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.button,
          (step === 'setup' && pin.length !== 4) ||
          (step === 'confirm' && confirmPin.length !== 4) ||
          (step === 'lock' && pin.length !== 4)
            ? styles.buttonDisabled
            : null,
        ]}
        onPress={handleContinue}
        disabled={
          (step === 'setup' && pin.length !== 4) ||
          (step === 'confirm' && confirmPin.length !== 4) ||
          (step === 'lock' && pin.length !== 4)
        }
      >
        <Text style={styles.buttonText}>
          {step === 'lock' ? 'Unlock' : 'Continue'}
        </Text>
      </TouchableOpacity>

      {/* Forgot PIN (Only in lock mode) */}
      {step === 'lock' && (
        <TouchableOpacity onPress={handleForgotPin}>
          <Text style={styles.forgotPin}>Forgot PIN?</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    textAlign: 'center',
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  pinDotFilled: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  numberButton: {
    width: '33.33%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPin: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
})
