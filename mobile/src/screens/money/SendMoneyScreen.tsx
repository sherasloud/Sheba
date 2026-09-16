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
  FlatList,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'

interface Recipient {
  id: string
  name: string
  phone: string
  avatar: string
}

export default function SendMoneyScreen() {
  const navigation = useNavigation()
  const [step, setStep] = useState<'recipient' | 'amount' | 'confirm'>('recipient')
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Mock recent recipients
  const recentRecipients: Recipient[] = [
    { id: '1', name: 'Ahmed Khan', phone: '01712345678', avatar: 'A' },
    { id: '2', name: 'Fatima Akhter', phone: '01987654321', avatar: 'F' },
    { id: '3', name: 'Karim Hassan', phone: '01612345678', avatar: 'K' },
    { id: '4', name: 'Nasima Begum', phone: '01512345678', avatar: 'N' },
  ]

  const handleSelectRecipient = (recipient: Recipient) => {
    setSelectedRecipient(recipient)
    setPhone(recipient.phone)
    setStep('amount')
    setError('')
  }

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '')
    setPhone(cleaned)
    setSelectedRecipient(null)
    setError('')
  }

  const validateRecipient = () => {
    if (!phone.trim()) {
      setError('Please enter recipient phone number')
      return false
    }

    const banglaPhoneRegex = /^01[3-9]\d{8}$/
    if (!banglaPhoneRegex.test(phone)) {
      setError('Invalid phone number')
      return false
    }

    return true
  }

  const validateAmount = () => {
    if (!amount.trim()) {
      setError('Please enter amount')
      return false
    }

    const numAmount = parseInt(amount)
    if (isNaN(numAmount) || numAmount < 50) {
      setError('Minimum transfer amount is ৳50')
      return false
    }

    if (numAmount > 50000) {
      setError('Maximum transfer amount is ৳50,000')
      return false
    }

    return true
  }

  const handleProceedToAmount = () => {
    if (validateRecipient()) {
      setStep('amount')
    }
  }

  const handleProceedToConfirm = () => {
    if (validateAmount()) {
      setStep('confirm')
    }
  }

  const handleConfirmTransfer = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      setTimeout(() => {
        Alert.alert(
          'Success',
          `Successfully transferred ৳${amount} to ${selectedRecipient?.name || 'recipient'}`,
          [
            {
              text: 'Done',
              onPress: () => {
                navigation.goBack()
              },
            },
          ]
        )
        setIsLoading(false)
      }, 2000)
    } catch (err) {
      setError('Transfer failed')
      setIsLoading(false)
    }
  }

  // Step 1: Select Recipient
  if (step === 'recipient') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.title}>Send Money</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search */}
          <View style={styles.searchSection}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or phone"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.phoneSection}>
            <Text style={styles.sectionTitle}>Enter Phone Number</Text>
            <View style={styles.phoneInput}>
              <Text style={styles.countryCode}>+880</Text>
              <TextInput
                style={styles.input}
                placeholder="1700000000"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={handlePhoneChange}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Recent Recipients */}
          <View style={styles.recipientsSection}>
            <Text style={styles.sectionTitle}>Recent Transfers</Text>
            <View style={styles.recipientsGrid}>
              {recentRecipients.map((recipient) => (
                <TouchableOpacity
                  key={recipient.id}
                  style={styles.recipientCard}
                  onPress={() => handleSelectRecipient(recipient)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{recipient.avatar}</Text>
                  </View>
                  <Text style={styles.recipientName}>{recipient.name}</Text>
                  <Text style={styles.recipientPhone}>
                    {recipient.phone.slice(-4)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.button, !phone && styles.buttonDisabled]}
            onPress={handleProceedToAmount}
            disabled={!phone}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Step 2: Enter Amount
  if (step === 'amount') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setStep('recipient')}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.title}>Enter Amount</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Recipient Info */}
          <View style={styles.recipientInfo}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarTextLarge}>
                {phone.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.recipientNameLarge}>
              {selectedRecipient?.name || `+880${phone}`}
            </Text>
            <Text style={styles.recipientPhoneLarge}>
              +880{phone}
            </Text>
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Transfer Amount</Text>
            <View style={styles.amountBox}>
              <Text style={styles.currencySymbol}>৳</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="number-pad"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text.replace(/[^0-9]/g, ''))
                  setError('')
                }}
                placeholderTextColor="#D1D5DB"
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Quick Amounts */}
          <View style={styles.quickAmounts}>
            {[100, 500, 1000, 5000].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickButton,
                  amount === quickAmount.toString() && styles.quickButtonActive,
                ]}
                onPress={() => {
                  setAmount(quickAmount.toString())
                  setError('')
                }}
              >
                <Text
                  style={[
                    styles.quickButtonText,
                    amount === quickAmount.toString() &&
                      styles.quickButtonTextActive,
                  ]}
                >
                  ৳{quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Fees Info */}
          {amount && (
            <View style={styles.feeInfo}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Transfer Amount</Text>
                <Text style={styles.feeValue}>৳{amount}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Transfer Fee</Text>
                <Text style={styles.feeValue}>Free</Text>
              </View>
              <View style={[styles.feeRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Debit</Text>
                <Text style={styles.totalValue}>৳{amount}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.button, (!amount || isLoading) && styles.buttonDisabled]}
            onPress={handleProceedToConfirm}
            disabled={!amount || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Review Transfer</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Step 3: Confirm
  if (step === 'confirm') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setStep('amount')}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.title}>Confirm Transfer</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Transfer Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>From</Text>
              <Text style={styles.summaryValue}>Your Account</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>To</Text>
              <Text style={styles.summaryValue}>
                {selectedRecipient?.name || `+880${phone}`}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={styles.summaryAmountValue}>৳{amount}</Text>
            </View>
          </View>

          {/* Confirmation Checklist */}
          <View style={styles.checklistSection}>
            <Text style={styles.sectionTitle}>Verify Details</Text>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.checklistText}>Recipient phone verified</Text>
            </View>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.checklistText}>Amount is valid</Text>
            </View>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.checklistText}>Sufficient balance available</Text>
            </View>
          </View>

          {/* Warning */}
          <View style={styles.warningBox}>
            <Ionicons name="information-circle" size={16} color="#F59E0B" />
            <Text style={styles.warningText}>
              Please verify all details before confirming. Transfers cannot be reversed once sent.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setStep('amount')}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleConfirmTransfer}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Confirm & Send</Text>
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return null
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
    paddingBottom: 120,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  phoneSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    gap: 8,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },
  recipientsSection: {
    marginBottom: 24,
  },
  recipientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recipientCard: {
    width: '23%',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recipientName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  recipientPhone: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  recipientInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: 8,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarTextLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recipientNameLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  recipientPhoneLarge: {
    fontSize: 13,
    color: '#6B7280',
  },
  amountSection: {
    marginBottom: 24,
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
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  quickButton: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  quickButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  quickButtonTextActive: {
    color: '#FFFFFF',
  },
  feeInfo: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  feeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#BFDBFE',
    paddingTopSeparatelyByMarginsNotPadding: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  checklistSection: {
    marginBottom: 24,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checklistText: {
    fontSize: 13,
    color: '#1F2937',
  },
  warningBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
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
  buttonGroup: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#3B82F6',
  },
})
