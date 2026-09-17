import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { initiateSSLCommerce } from '../../services/sslcommerce'

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000]

export default function AddMoneyScreen() {
  const navigation = useNavigation()
  const [amount, setAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAmountSelect = (value: number) => {
    setSelectedAmount(value)
    setAmount(value.toString())
    setError('')
  }

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '')
    setAmount(cleaned)
    setSelectedAmount(null)
    setError('')
  }

  const validateAmount = () => {
    if (!amount.trim()) {
      setError('Please enter an amount')
      return false
    }

    const numAmount = parseInt(amount)
    if (isNaN(numAmount)) {
      setError('Invalid amount')
      return false
    }

    if (numAmount < 100) {
      setError('Minimum amount is ৳100')
      return false
    }

    if (numAmount > 100000) {
      setError('Maximum amount is ৳100,000')
      return false
    }

    return true
  }

  const handleProceedToPayment = async () => {
    if (!validateAmount()) return

    setIsLoading(true)
    setError('')

    try {
      const numAmount = parseInt(amount)
      
      // For now, simulate SSL Commerce transaction
      // In production, this would call your backend to initiate payment
      const transactionId = `TXN_${Date.now()}`
      
      // Simulate payment gateway redirect
      setTimeout(() => {
        Alert.alert(
          'Payment Gateway',
          `Proceeding to SSL Commerce payment for ৳${numAmount}`,
          [
            {
              text: 'Simulate Payment Success',
              onPress: () => {
                // Simulate successful payment
                navigation.navigate('PaymentSuccess' as any, { 
                  amount: numAmount,
                  transactionId,
                })
              },
            },
            {
              text: 'Simulate Payment Failed',
              onPress: () => {
                setError('Payment failed. Please try again.')
                setIsLoading(false)
              },
            },
            {
              text: 'Cancel',
              onPress: () => setIsLoading(false),
              style: 'cancel',
            },
          ]
        )
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to process payment')
      console.error('[v0] Payment error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Money</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Amount Display */}
        <View style={styles.amountDisplay}>
          <Text style={styles.amountLabel}>Amount to Add</Text>
          <View style={styles.amountBox}>
            <Text style={styles.currencySymbol}>৳</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              keyboardType="number-pad"
              value={amount}
              onChangeText={handleAmountChange}
              placeholderTextColor="#D1D5DB"
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Preset Amounts */}
        <View style={styles.presetSection}>
          <Text style={styles.sectionTitle}>Quick Amounts</Text>
          <View style={styles.presetGrid}>
            {PRESET_AMOUNTS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetButton,
                  selectedAmount === preset && styles.presetButtonActive,
                ]}
                onPress={() => handleAmountSelect(preset)}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    selectedAmount === preset && styles.presetButtonTextActive,
                  ]}
                >
                  ৳{(preset / 1000).toFixed(0)}K
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.infoCardTitle}>Secure Payment</Text>
            <Text style={styles.infoCardText}>SSL encrypted transactions</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="flash" size={20} color="#F59E0B" />
            <Text style={styles.infoCardTitle}>Instant Credit</Text>
            <Text style={styles.infoCardText}>Money added immediately</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="card" size={20} color="#8B5CF6" />
            <Text style={styles.infoCardTitle}>Multiple Methods</Text>
            <Text style={styles.infoCardText}>Card, Mobile banking, etc</Text>
          </View>
        </View>

        {/* Payment Methods Info */}
        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Accepted Payment Methods</Text>
          <View style={styles.methodsGrid}>
            <View style={styles.methodItem}>
              <Ionicons name="card-outline" size={28} color="#3B82F6" />
              <Text style={styles.methodName}>Debit Card</Text>
            </View>
            <View style={styles.methodItem}>
              <Ionicons name="card-outline" size={28} color="#3B82F6" />
              <Text style={styles.methodName}>Credit Card</Text>
            </View>
            <View style={styles.methodItem}>
              <Ionicons name="phone-portrait-outline" size={28} color="#3B82F6" />
              <Text style={styles.methodName}>Mobile Banking</Text>
            </View>
            <View style={styles.methodItem}>
              <Ionicons name="wallet-outline" size={28} color="#3B82F6" />
              <Text style={styles.methodName}>Bank Transfer</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By proceeding, you agree to our payment terms and conditions. Your transaction is secured with SSL Commerce payment gateway.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.button, (!amount || isLoading) && styles.buttonDisabled]}
          onPress={handleProceedToPayment}
          disabled={!amount || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Proceed to Payment</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  amountDisplay: {
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },
  presetSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  presetButtonTextActive: {
    color: '#FFFFFF',
  },
  infoSection: {
    gap: 12,
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoCardText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentMethodsSection: {
    marginBottom: 24,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  methodItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  methodName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 6,
    textAlign: 'center',
  },
  termsSection: {
    marginTop: 20,
  },
  termsText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
