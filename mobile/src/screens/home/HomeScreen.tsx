import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'

const { width, height } = Dimensions.get('window')

interface Transaction {
  id: string
  type: 'send' | 'receive' | 'topup'
  amount: number
  recipient: string
  date: string
}

export default function HomeScreen() {
  const navigation = useNavigation()
  const [balance, setBalance] = useState(5250)
  const [bannerIndex, setBannerIndex] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'send',
      amount: 500,
      recipient: 'Ahmed Khan',
      date: 'Today, 2:30 PM',
    },
    {
      id: '2',
      type: 'topup',
      amount: 2000,
      recipient: 'Wallet Top-up',
      date: 'Yesterday, 5:15 PM',
    },
    {
      id: '3',
      type: 'receive',
      amount: 1000,
      recipient: 'Fatima Akhter',
      date: '2 days ago',
    },
  ])

  const banners = [
    {
      id: '1',
      title: 'Unlimited Transfers',
      subtitle: 'Send money to anyone instantly',
      color: '#3B82F6',
    },
    {
      id: '2',
      title: 'Secure & Fast',
      subtitle: 'Your money is protected 24/7',
      color: '#10B981',
    },
    {
      id: '3',
      title: 'Low Fees',
      subtitle: 'Best rates in the market',
      color: '#F59E0B',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const QuickActionButton = ({
    icon,
    label,
    onPress,
  }: {
    icon: string
    label: string
    onPress: () => void
  }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={styles.actionIconContainer}>
        <Ionicons name={icon as any} size={24} color="#3B82F6" />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  )

  const TransactionItem = ({ transaction }: { transaction: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons
          name={
            transaction.type === 'send'
              ? 'arrow-up'
              : transaction.type === 'receive'
              ? 'arrow-down'
              : 'add-circle'
          }
          size={20}
          color={transaction.type === 'receive' ? '#10B981' : '#EF4444'}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionName}>{transaction.recipient}</Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          transaction.type === 'receive' && styles.amountPositive,
        ]}
      >
        {transaction.type === 'receive' ? '+' : '-'}৳{transaction.amount}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello!</Text>
          <Text style={styles.subGreeting}>Welcome to Bengali Wallet</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings' as any)}
        >
          <Ionicons name="settings-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>৳{balance.toLocaleString()}</Text>
          <View style={styles.balanceFooter}>
            <Text style={styles.balanceFooterText}>Last updated: Just now</Text>
            <TouchableOpacity>
              <Ionicons name="eye" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Carousel */}
        <View style={styles.bannerContainer}>
          <View
            style={[
              styles.banner,
              { backgroundColor: banners[bannerIndex].color },
            ]}
          >
            <Text style={styles.bannerTitle}>{banners[bannerIndex].title}</Text>
            <Text style={styles.bannerSubtitle}>
              {banners[bannerIndex].subtitle}
            </Text>
          </View>
          <View style={styles.bannerDots}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === bannerIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <QuickActionButton
              icon="arrow-forward"
              label="Send Money"
              onPress={() => navigation.navigate('SendMoney' as any)}
            />
            <QuickActionButton
              icon="add-circle"
              label="Add Money"
              onPress={() => navigation.navigate('AddMoney' as any)}
            />
            <QuickActionButton
              icon="id-card"
              label="Verify"
              onPress={() => navigation.navigate('Verification' as any)}
            />
            <QuickActionButton
              icon="document-text"
              label="History"
              onPress={() => navigation.navigate('TransactionHistory' as any)}
            />
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('TransactionHistory' as any)}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
            />
          ))}
        </View>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="lock-closed" size={24} color="#10B981" />
            <Text style={styles.infoCardTitle}>Secure</Text>
            <Text style={styles.infoCardText}>Bank-level encryption</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="flash" size={24} color="#F59E0B" />
            <Text style={styles.infoCardTitle}>Fast</Text>
            <Text style={styles.infoCardText}>Instant transfers</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="leaf" size={24} color="#8B5CF6" />
            <Text style={styles.infoCardTitle}>Easy</Text>
            <Text style={styles.infoCardText}>Simple interface</Text>
          </View>
        </View>
      </ScrollView>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subGreeting: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#BFDBFE',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E40AF',
    paddingTop: 12,
  },
  balanceFooterText: {
    fontSize: 12,
    color: '#BFDBFE',
  },
  bannerContainer: {
    marginBottom: 24,
  },
  banner: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  amountPositive: {
    color: '#10B981',
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  infoCardText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
})
