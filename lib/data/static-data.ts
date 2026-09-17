import {
  Activity,
  CreditCard,
  DollarSign,
  Handshake,
  Landmark,
  Plane,
  PiggyBank,
  Receipt,
  Scan,
  Wallet,
  Home,
  Bell,
  Settings,
  BarChart,
  Gift,
  FileText,
  Train,
  Heart,
  GraduationCap,
  Globe,
  Phone,
  Store,
} from "lucide-react"

interface User {
  phoneNumber: string
  fullName: string
  balance: number
  pin: string
  isVerified: boolean
  accountNumber: string
  role?: string // "user" | "admin" | "agent" | "merchant"
  accountType?: "regular" | "business" | "state"
}

interface Transaction {
  transactionId: string
  senderPhone: string
  receiverPhone: string
  amount: number
  type: string
  status: string
  reference?: string
  fee: number
  createdAt: string
}

// Initial dummy data
const users: User[] = [
  {
    phoneNumber: "01709783145", // Test user
    fullName: "New User",
    balance: 99979997979999,
    pin: "112026",
    isVerified: true,
    accountNumber: "USR001",
    role: "user",
    accountType: "regular",
  },
  {
    phoneNumber: "01930314459", // Secondary admin user
    fullName: "Admin User",
    balance: 99979997979999, // Keep massive balance for admin
    pin: "123456",
    isVerified: true,
    accountNumber: "ADMIN002",
    role: "admin",
    accountType: "business",
  },
]

const transactionsArray: Transaction[] = []

export function findUserByPhone(phoneNumber: string): User | undefined {
  return users.find((user) => user.phoneNumber === phoneNumber)
}

export function updateUserBalance(phoneNumber: string, newBalance: number): boolean {
  const user = findUserByPhone(phoneNumber)
  if (user) {
    user.balance = newBalance
    console.log(`[v0] Updated balance for ${phoneNumber}: ${newBalance}`)
    return true
  }
  console.log(`[v0] Failed to update balance - user ${phoneNumber} not found`)
  return false
}

export function getUserBalance(phoneNumber: string): number {
  console.log(`[v0] getUserBalance called for: ${phoneNumber}`)

  const user = findUserByPhone(phoneNumber)
  if (user) {
    console.log(`[v0] Found user in memory: ${phoneNumber}, balance: ${user.balance}`)
    return user.balance
  }

  if (typeof window !== "undefined") {
    try {
      const phoneBalanceKey = `userBalance_${phoneNumber}`
      const storedPhoneBalance = localStorage.getItem(phoneBalanceKey)
      const storedUserBalance = localStorage.getItem("userBalance")

      console.log(`[v0] localStorage check:`, {
        phoneBalanceKey,
        storedPhoneBalance,
        storedUserBalance,
      })

      const storedBalance = storedPhoneBalance || storedUserBalance

      if (storedBalance && !isNaN(Number(storedBalance))) {
        const balance = Number(storedBalance)
        console.log(`[v0] FOUND localStorage balance for ${phoneNumber}: ${balance}`)
        return balance
      }
    } catch (error) {
      console.log(`[v0] Error reading localStorage balance: ${error}`)
    }
  }

  console.log(`[v0] No balance found for ${phoneNumber}, returning 0`)
  return 0
}

export function validateUserPin(phoneNumber: string, pin: string): boolean {
  const user = findUserByPhone(phoneNumber)
  return user ? user.pin === pin : false
}

export function addTransaction(transactionData: Omit<Transaction, "transactionId">): Transaction {
  const newTransaction: Transaction = {
    transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
    ...transactionData,
  }
  transactionsArray.push(newTransaction)
  return newTransaction
}

export function getAllTransactions(): Transaction[] {
  return []
}

export function registerUser(userData: {
  phoneNumber: string
  fullName: string
  balance: number
  pin: string
}): User | null {
  try {
    // Check if user already exists
    const existingUser = findUserByPhone(userData.phoneNumber)
    if (existingUser) {
      console.log(`[v0] User ${userData.phoneNumber} already exists`)
      return existingUser
    }

    let actualBalance = userData.balance
    if (typeof window !== "undefined") {
      try {
        const storedBalance = localStorage.getItem(`balance_${userData.phoneNumber}`)
        if (storedBalance && !isNaN(Number(storedBalance))) {
          actualBalance = Number(storedBalance)
          console.log(`[v0] Using localStorage balance for new user ${userData.phoneNumber}: ${actualBalance}`)
        }
      } catch (error) {
        console.log(`[v0] Error reading localStorage balance during registration: ${error}`)
      }
    }

    const newUser: User = {
      phoneNumber: userData.phoneNumber,
      fullName: userData.fullName,
      balance: actualBalance, // Use actual balance from localStorage if available
      pin: userData.pin,
      isVerified: true,
      accountNumber: `ACC${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      accountType: "regular", // Default account type
    }

    users.push(newUser)
    console.log(`[v0] Created new user: ${userData.phoneNumber} with balance: ${actualBalance}`)
    return newUser
  } catch (error) {
    console.error("Error registering user:", error)
    return null
  }
}

export function addUser(userData: {
  phoneNumber: string
  fullName: string
  balance: number
  pin: string
}): User | null {
  return registerUser(userData)
}

export function verifyUser(phoneNumber: string): boolean {
  const user = findUserByPhone(phoneNumber)
  if (user) {
    user.isVerified = true
    return true
  }
  return false
}

export function updateUserName(phoneNumber: string, newName: string): boolean {
  const user = findUserByPhone(phoneNumber)
  if (user) {
    user.fullName = newName
    return true
  }
  return false
}

export function updateUserPin(phoneNumber: string, newPin: string): boolean {
  const user = findUserByPhone(phoneNumber)
  if (user) {
    user.pin = newPin
    return true
  }
  return false
}

// For admin panel to get all users
export function getAllUsers(): User[] {
  return [...users]
}

// For admin panel to update user verification status
export function setVerificationStatus(phoneNumber: string, status: boolean): boolean {
  const user = findUserByPhone(phoneNumber)
  if (user) {
    user.isVerified = status
    return true
  }
  return false
}

// For admin panel to update user balance
export function adminUpdateUserBalance(phoneNumber: string, newBalance: number): boolean {
  const user = findUserByPhone(phoneNumber)
  if (user) {
    user.balance = newBalance
    return true
  }
  return false
}

export function verifyAllUsers(): number {
  let verifiedCount = 0
  users.forEach((user) => {
    if (!user.isVerified) {
      user.isVerified = true
      verifiedCount++
    }
  })
  return verifiedCount
}

export function getUserAccountType(phoneNumber: string): "regular" | "business" | "state" {
  if (typeof window !== "undefined") {
    const accountType = localStorage.getItem(`accountType_${phoneNumber}`)
    return (accountType as "regular" | "business" | "state") || "regular"
  }
  return "regular"
}

export function setUserAccountType(phoneNumber: string, accountType: "regular" | "business" | "state"): boolean {
  if (typeof window !== "undefined") {
    localStorage.setItem(`accountType_${phoneNumber}`, accountType)
    console.log(`[v0] Account type for ${phoneNumber} set to ${accountType}`)
    return true
  }
  return false
}

export const services = [
  {
    name: "Send Money",
    icon: DollarSign,
    link: "/send-money",
    description: "Transfer money to friends and family",
  },
  {
    name: "Cash Out",
    icon: Wallet,
    link: "/cashout",
    description: "Withdraw money from agent points",
  },
  {
    name: "Mobile Recharge",
    icon: Phone,
    link: "/recharge",
    description: "Recharge your mobile balance",
  },
  {
    name: "Pay Bill",
    icon: Receipt,
    link: "/bill",
    description: "Pay utility bills",
  },
  {
    name: "Bank Transfer",
    icon: Landmark,
    link: "/transfer/bank",
    description: "Transfer money to bank accounts",
  },
  {
    name: "Add Money",
    icon: CreditCard,
    link: "/add-money",
    description: "Add money to your account",
  },
  {
    name: "Remittance",
    icon: Globe,
    link: "/remittance",
    description: "Receive money from abroad",
  },
  {
    name: "Savings",
    icon: PiggyBank,
    link: "/savings",
    description: "Save money for your future",
  },
  {
    name: "Loan",
    icon: Handshake,
    link: "/loan",
    description: "Apply for a loan",
  },
  {
    name: "Education Fee",
    icon: GraduationCap,
    link: "/edu-fee",
    description: "Pay your education fees",
  },
  {
    name: "Donation",
    icon: Heart,
    link: "/donate",
    description: "Donate to charities",
  },
  {
    name: "Air Tickets",
    icon: Plane,
    link: "/air-tickets",
    description: "Book your flight tickets",
  },
  {
    name: "Rail Tickets",
    icon: Train,
    link: "/rail-tickets",
    description: "Book your train tickets",
  },
  {
    name: "Merchant Pay",
    icon: Store,
    link: "/payment",
    description: "Pay at your favorite stores",
  },
  {
    name: "Scan QR",
    icon: Scan,
    link: "/scan-qr",
    description: "Scan QR codes for payments",
  },
  {
    name: "Cashback Offer",
    icon: Gift,
    link: "/cashback-offer",
    description: "View available cashback offers",
  },
  {
    name: "Monthly Budget",
    icon: BarChart,
    link: "/monthly-budget",
    description: "Manage your monthly budget",
  },
  {
    name: "Debenture",
    icon: FileText,
    link: "/debenture",
    description: "Invest in debentures",
  },
]

export const bottomNavigationItems = [
  {
    name: "Home",
    icon: Home,
    link: "/home",
  },
  {
    name: "Activity",
    icon: Activity,
    link: "/inbox",
  },
  {
    name: "Scan",
    icon: Scan,
    link: "/scan-qr",
  },
  {
    name: "Inbox",
    icon: Bell,
    link: "/inbox",
  },
  {
    name: "Settings",
    icon: Settings,
    link: "/settings",
  },
]

export const transactions = [
  {
    id: "1",
    type: "send-money",
    amount: 500,
    date: "2024-07-15T10:00:00Z",
    status: "completed",
    recipient: "John Doe",
    storeName: "Sheba Business",
  },
  {
    id: "2",
    type: "cash-out",
    amount: 1000,
    date: "2024-07-14T14:30:00Z",
    status: "completed",
    agent: "Agent A",
    storeName: "Sheba Business",
  },
  {
    id: "3",
    type: "mobile-recharge",
    amount: 50,
    date: "2024-07-13T09:15:00Z",
    status: "completed",
    operator: "Grameenphone",
    storeName: "Grameenphone",
  },
  {
    id: "4",
    type: "pay-bill",
    amount: 250,
    date: "2024-07-12T11:00:00Z",
    status: "pending",
    billType: "Electricity",
    storeName: "DESCO",
  },
  {
    id: "5",
    type: "bank-transfer",
    amount: 2000,
    date: "2024-07-11T16:45:00Z",
    status: "completed",
    bank: "ABC Bank",
    storeName: "ABC Bank",
  },
  {
    id: "6",
    type: "add-money",
    amount: 3000,
    date: "2024-07-10T08:00:00Z",
    status: "completed",
    method: "Credit Card",
    storeName: "Visa",
  },
  {
    id: "7",
    type: "remittance",
    amount: 1500,
    date: "2024-07-09T13:00:00Z",
    status: "completed",
    sender: "Jane Smith",
    country: "USA",
    storeName: "RemitGlobal",
  },
  {
    id: "8",
    type: "savings",
    amount: 200,
    date: "2024-07-08T10:00:00Z",
    status: "completed",
    goal: "New Phone",
    storeName: "Savings Account",
  },
  {
    id: "9",
    type: "loan",
    amount: 1000,
    date: "2024-07-07T15:00:00Z",
    status: "approved",
    storeName: "Loan Provider",
  },
  {
    id: "10",
    type: "education-fee",
    amount: 700,
    date: "2024-07-06T09:00:00Z",
    status: "completed",
    institution: "Dhaka University",
    storeName: "Dhaka University",
  },
  {
    id: "11",
    type: "donation",
    amount: 100,
    date: "2024-07-05T12:00:00Z",
    status: "completed",
    charity: "Save the Children",
    storeName: "Save the Children",
  },
  {
    id: "12",
    type: "air-ticket",
    amount: 5000,
    date: "2024-07-04T11:00:00Z",
    status: "booked",
    airline: "Biman Bangladesh",
    storeName: "Biman Bangladesh",
  },
  {
    id: "13",
    type: "merchant-pay",
    amount: 350,
    date: "2024-07-03T17:00:00Z",
    status: "completed",
    merchant: "Daraz",
    storeName: "Daraz",
  },
  {
    id: "14",
    type: "send-money",
    amount: 250,
    date: "2024-07-02T09:30:00Z",
    status: "completed",
    recipient: "Alice Wonderland",
    storeName: "Sheba Business",
  },
  {
    id: "15",
    type: "cash-out",
    amount: 800,
    date: "2024-07-01T14:00:00Z",
    status: "completed",
    agent: "Agent B",
    storeName: "Sheba Business",
  },
  {
    id: "16",
    type: "mobile-recharge",
    amount: 100,
    date: "2024-06-30T10:00:00Z",
    status: "completed",
    operator: "Robi",
    storeName: "Robi",
  },
  {
    id: "17",
    type: "pay-bill",
    amount: 400,
    date: "2024-06-29T11:30:00Z",
    status: "completed",
    billType: "Gas",
    storeName: "Titas Gas",
  },
  {
    id: "18",
    type: "bank-transfer",
    amount: 1500,
    date: "2024-06-28T16:00:00Z",
    status: "completed",
    bank: "XYZ Bank",
    storeName: "XYZ Bank",
  },
  {
    id: "19",
    type: "add-money",
    amount: 2000,
    date: "2024-06-27T08:30:00Z",
    status: "completed",
    method: "Bank Transfer",
    storeName: "Bank Transfer",
  },
  {
    id: "20",
    type: "remittance",
    amount: 1000,
    date: "2024-06-26T13:45:00Z",
    status: "pending",
    sender: "David Lee",
    country: "UK",
    storeName: "RemitNow",
  },
  {
    id: "21",
    type: "savings",
    amount: 150,
    date: "2024-06-25T10:30:00Z",
    status: "completed",
    goal: "Vacation Fund",
    storeName: "Savings Account",
  },
  {
    id: "22",
    type: "loan",
    amount: 500,
    date: "2024-06-24T15:30:00Z",
    status: "repaid",
    storeName: "Loan Provider",
  },
  {
    id: "23",
    type: "education-fee",
    amount: 600,
    date: "2024-06-23T09:45:00Z",
    status: "completed",
    institution: "BUET",
    storeName: "BUET",
  },
  {
    id: "24",
    type: "donation",
    amount: 75,
    date: "2024-06-22T12:30:00Z",
    status: "completed",
    charity: "BRAC",
    storeName: "BRAC",
  },
  {
    id: "25",
    type: "air-ticket",
    amount: 4000,
    date: "2024-06-21T11:45:00Z",
    status: "cancelled",
    airline: "Novo Air",
    storeName: "Novo Air",
  },
  {
    id: "26",
    type: "merchant-pay",
    amount: 120,
    date: "2024-06-20T17:30:00Z",
    status: "completed",
    merchant: "KFC",
    storeName: "KFC",
  },
  {
    id: "27",
    type: "send-money",
    amount: 300,
    date: "2024-06-19T10:15:00Z",
    status: "completed",
    recipient: "Bob Johnson",
    storeName: "Sheba Business",
  },
  {
    id: "28",
    type: "cash-out",
    amount: 700,
    date: "2024-06-18T14:10:00Z",
    status: "completed",
    agent: "Agent C",
    storeName: "Sheba Business",
  },
  {
    id: "29",
    type: "mobile-recharge",
    amount: 70,
    date: "2024-06-17T09:00:00Z",
    status: "completed",
    operator: "Airtel",
    storeName: "Airtel",
  },
  {
    id: "30",
    type: "pay-bill",
    amount: 300,
    date: "2024-06-16T11:15:00Z",
    status: "completed",
    billType: "Water",
    storeName: "WASA",
  },
  {
    id: "31",
    type: "bank-transfer",
    amount: 1800,
    date: "2024-06-15T16:30:00Z",
    status: "completed",
    bank: "DEF Bank",
    storeName: "DEF Bank",
  },
  {
    id: "32",
    type: "add-money",
    amount: 2500,
    date: "2024-06-14T08:45:00Z",
    status: "completed",
    method: "Debit Card",
    storeName: "Mastercard",
  },
  {
    id: "33",
    type: "remittance",
    amount: 1200,
    date: "2024-06-13T13:15:00Z",
    status: "completed",
    sender: "Chris Green",
    country: "Canada",
    storeName: "RemitFast",
  },
  {
    id: "34",
    type: "savings",
    amount: 180,
    date: "2024-06-12T10:45:00Z",
    status: "completed",
    goal: "Emergency Fund",
    storeName: "Savings Account",
  },
  {
    id: "35",
    type: "loan",
    amount: 800,
    date: "2024-06-11T15:45:00Z",
    status: "approved",
    storeName: "Loan Provider",
  },
  {
    id: "36",
    type: "education-fee",
    amount: 550,
    date: "2024-06-10T09:30:00Z",
    status: "completed",
    institution: "RUET",
    storeName: "RUET",
  },
  {
    id: "37",
    type: "donation",
    amount: 90,
    date: "2024-06-09T12:45:00Z",
    status: "completed",
    charity: "Oxfam",
    storeName: "Oxfam",
  },
  {
    id: "38",
    type: "air-ticket",
    amount: 6000,
    date: "2024-06-08T11:30:00Z",
    status: "booked",
    airline: "US-Bangla Airlines",
    storeName: "US-Bangla Airlines",
  },
  {
    id: "39",
    type: "merchant-pay",
    amount: 200,
    date: "2024-06-07T17:15:00Z",
    status: "completed",
    merchant: "Pizza Hut",
    storeName: "Pizza Hut",
  },
  {
    id: "40",
    type: "send-money",
    amount: 400,
    date: "2024-06-06T10:00:00Z",
    status: "completed",
    recipient: "Diana Prince",
    storeName: "Sheba Business",
  },
  {
    id: "41",
    type: "cash-out",
    amount: 900,
    date: "2024-06-05T14:20:00Z",
    status: "completed",
    agent: "Agent D",
    storeName: "Sheba Business",
  },
  {
    id: "42",
    type: "mobile-recharge",
    amount: 60,
    date: "2024-06-04T09:05:00Z",
    status: "completed",
    operator: "Banglalink",
    storeName: "Banglalink",
  },
  {
    id: "43",
    type: "pay-bill",
    amount: 350,
    date: "2024-06-03T11:20:00Z",
    status: "pending",
    billType: "Internet",
    storeName: "ISP Provider",
  },
  {
    id: "44",
    type: "bank-transfer",
    amount: 2200,
    date: "2024-06-02T16:50:00Z",
    status: "completed",
    bank: "GHI Bank",
    storeName: "GHI Bank",
  },
  {
    id: "45",
    type: "add-money",
    amount: 3500,
    date: "2024-06-01T08:10:00Z",
    status: "completed",
    method: "Visa Card",
    storeName: "Visa",
  },
  {
    id: "46",
    type: "remittance",
    amount: 1800,
    date: "2024-05-31T13:00:00Z",
    status: "completed",
    sender: "Frank Miller",
    country: "Germany",
    storeName: "QuickRemit",
  },
  {
    id: "47",
    type: "savings",
    amount: 220,
    date: "2024-05-30T10:00:00Z",
    status: "completed",
    goal: "Car Down Payment",
    storeName: "Savings Account",
  },
  {
    id: "48",
    type: "loan",
    amount: 1200,
    date: "2024-05-29T15:00:00Z",
    status: "approved",
    storeName: "Loan Provider",
  },
  {
    id: "49",
    type: "education-fee",
    amount: 750,
    date: "2024-05-28T09:00:00Z",
    status: "completed",
    institution: "CUET",
    storeName: "CUET",
  },
  {
    id: "50",
    type: "donation",
    amount: 110,
    date: "2024-05-27T12:00:00Z",
    status: "completed",
    charity: "Plan International",
    storeName: "Plan International",
  },
  {
    id: "51",
    type: "air-ticket",
    amount: 5500,
    date: "2024-05-26T11:00:00Z",
    status: "booked",
    airline: "Qatar Airways",
    storeName: "Qatar Airways",
  },
  {
    id: "52",
    type: "merchant-pay",
    amount: 400,
    date: "2024-05-25T17:00:00Z",
    status: "completed",
    merchant: "Shwapno",
    storeName: "Shwapno",
  },
  {
    id: "53",
    type: "send-money",
    amount: 550,
    date: "2024-05-24T09:30:00Z",
    status: "completed",
    recipient: "Clark Kent",
    storeName: "Sheba Business",
  },
  {
    id: "54",
    type: "cash-out",
    amount: 1100,
    date: "2024-05-23T14:30:00Z",
    status: "completed",
    agent: "Agent E",
    storeName: "Sheba Business",
  },
  {
    id: "55",
    type: "mobile-recharge",
    amount: 80,
    date: "2024-05-22T09:15:00Z",
    status: "completed",
    operator: "Teletalk",
    storeName: "Teletalk",
  },
  {
    id: "56",
    type: "pay-bill",
    amount: 280,
    date: "2024-05-21T11:00:00Z",
    status: "completed",
    billType: "Telephone",
    storeName: "BTCL",
  },
  {
    id: "57",
    type: "bank-transfer",
    amount: 2500,
    date: "2024-05-20T16:45:00Z",
    status: "completed",
    bank: "JKL Bank",
    storeName: "JKL Bank",
  },
  {
    id: "58",
    type: "add-money",
    amount: 4000,
    date: "2024-05-19T08:00:00Z",
    status: "completed",
    method: "Amex Card",
    storeName: "Amex",
  },
  {
    id: "59",
    type: "remittance",
    amount: 1600,
    date: "2024-05-18T13:00:00Z",
    status: "completed",
    sender: "Eve Black",
    country: "Australia",
    storeName: "SwiftRemit",
  },
  {
    id: "60",
    type: "savings",
    amount: 250,
    date: "2024-05-17T10:00:00Z",
    status: "completed",
    goal: "Home Renovation",
    storeName: "Savings Account",
  },
  {
    id: "61",
    type: "loan",
    amount: 900,
    date: "2024-05-16T15:00:00Z",
    status: "repaid",
    storeName: "Loan Provider",
  },
  {
    id: "62",
    type: "education-fee",
    amount: 650,
    date: "2024-05-15T09:00:00Z",
    status: "completed",
    institution: "Daffodil University",
    storeName: "Daffodil University",
  },
  {
    id: "63",
    type: "donation",
    amount: 120,
    date: "2024-05-14T12:00:00Z",
    status: "completed",
    charity: "WaterAid",
    storeName: "WaterAid",
  },
  {
    id: "64",
    type: "air-ticket",
    amount: 4800,
    date: "2024-05-13T11:00:00Z",
    status: "booked",
    airline: "Biman Bangladesh",
    storeName: "Biman Bangladesh",
  },
  {
    id: "65",
    type: "merchant-pay",
    amount: 180,
    date: "2024-05-12T17:00:00Z",
    status: "completed",
    merchant: "Agora",
    storeName: "Agora",
  },
  {
    id: "66",
    type: "send-money",
    amount: 320,
    date: "2024-05-11T09:30:00Z",
    status: "completed",
    recipient: "Peter Parker",
    storeName: "Sheba Business",
  },
  {
    id: "67",
    type: "cash-out",
    amount: 750,
    date: "2024-05-10T14:00:00Z",
    status: "completed",
    agent: "Agent F",
    storeName: "Sheba Business",
  },
]

export const promoBanners = [
  {
    id: 1,
    image: "/images/promo-banner.png",
    alt: "Promotional Banner 1",
    link: "/cashback-offer",
  },
  {
    id: 2,
    image: "/images/new-promo-banner.png",
    alt: "New Promotional Banner",
    link: "/savings",
  },
  {
    id: 3,
    image: "/images/sheba-send-money-banner.jpeg",
    alt: "Sheba Send Money Offer",
    link: "/send-money",
  },
  {
    id: 4,
    image: "/images/sheba-send-money-banner-2.jpeg",
    alt: "Sheba Send Money Offer 2",
    link: "/send-money",
  },
  {
    id: 5,
    image: "/images/sheba-send-money-banner-new.jpeg",
    alt: "Sheba Send Money Offer New",
    link: "/send-money",
  },
  {
    id: 6,
    image: "/images/sheba-cashout-banner-new.png",
    alt: "Sheba Cashout Offer New",
    link: "/cashout",
  },
  {
    id: 7,
    image: "/images/sheba-cashout-banner-beach.jpeg",
    link: "/cashout",
    alt: "Sheba Cashout Offer Beach",
  },
  {
    id: 8,
    image: "/images/sheba-send-money-banner-updated.jpeg",
    alt: "Sheba Send Money Offer Updated",
    link: "/send-money",
  },
  {
    id: 9,
    image: "/images/sheba-international-banner.png",
    alt: "Sheba International Remittance",
    link: "/remittance",
  },
  {
    id: 10,
    image: "/images/sheba-new-international-banner.png",
    alt: "Sheba New International Remittance",
    link: "/remittance",
  },
  {
    id: 11,
    image: "/images/add-money-cloud-banner-new.png",
    alt: "Add Money Banner",
    link: "/add-money",
  },
]

export const stores = [
  { name: "Daraz", logo: "/images/stores/daraz-real-logo.jpeg" },
  { name: "Pickaboo", logo: "/images/stores/pickaboo-real-logo.jpeg" },
  { name: "Ajkerdeal", logo: "/images/stores/ajkerdeal-real-logo.png" },
  { name: "Bagdoom", logo: "/images/stores/bagdoom-real-logo.jpeg" },
  { name: "Chaldal", logo: "/images/stores/chaldal-real-logo.webp" },
  { name: "KFC", logo: "/images/stores/kfc-logo.png" },
  { name: "Pizza Hut", logo: "/images/stores/pizza-hut-real-logo.png" },
  { name: "Burger King", logo: "/images/stores/burger-king-logo.jpeg" },
  { name: "Walton", logo: "/images/stores/walton-logo.png" },
  { name: "Samsung", logo: "/images/stores/samsung-logo.png" },
  { name: "Sheba Business", logo: "/images/seba-logo-splash.png" },
  { name: "New Sheba", logo: "/images/seba-logo-splash.png" },
]

export const cardProviders = [
  { name: "Visa", logo: "/images/visa-logo.png" },
  {
    name: "Mastercard",
    logo: "data:image/svg+xml,%3Csvg viewBox='0 0 200 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='60' cy='60' r='50' fill='%23EB001B'/%3E%3Ccircle cx='140' cy='60' r='50' fill='%23F79E1B'/%3E%3C/svg%3E",
  },
  { name: "American Express", logo: "/images/amex-logo.png" },
  { name: "Discover", logo: "/images/discover-logo.jpeg" },
]

export const operators = [
  { name: "Grameenphone", logo: "/images/grameenphone-logo.png" },
  { name: "Robi", logo: "/images/robi-logo.jpeg" },
  { name: "Airtel", logo: "/images/airtel-logo.png" },
  { name: "Banglalink", logo: "/images/banglalink-logo.png" },
  { name: "Teletalk", logo: "/images/teletalk-logo.webp" },
  { name: "Skitto", logo: "/images/skitto-official-logo.png" },
]

export const billProviders = [
  { name: "DESCO", logo: "/images/desco-logo.png" },
  { name: "DPDC", logo: "/images/dpdc-logo.webp" },
  { name: "REB", logo: "/images/reb-logo.jpeg" },
  { name: "BPDB", logo: "/images/bpdb-logo.jpeg" },
  { name: "WASA", logo: "/images/water-droplet-icon.png" },
  { name: "Titas Gas", logo: "/images/droplet-logo.png" },
  { name: "Bakhrabad Gas", logo: "/images/droplet-logo.png" },
  { name: "BTCL", logo: "/images/phone-entry-design.png" },
]

export const banks = [
  { name: "ABC Bank", logo: "/placeholder.svg" },
  { name: "XYZ Bank", logo: "/placeholder.svg" },
  { name: "DEF Bank", logo: "/placeholder.svg" },
  { name: "GHI Bank", logo: "/placeholder.svg" },
  { name: "JKL Bank", logo: "/placeholder.svg" },
  { name: "MNO Bank", logo: "/placeholder.svg" },
  { name: "PQR Bank", logo: "/placeholder.svg" },
  { name: "STU Bank", logo: "/placeholder.svg" },
]

export const airlines = [
  { name: "Biman Bangladesh", logo: "/images/biman-logo.png" },
  { name: "Novo Air", logo: "/images/novo-air-logo.png" },
  { name: "US-Bangla Airlines", logo: "/images/us-bangla-logo.png" },
  { name: "Air Astra", logo: "/images/air-astra-logo.png" },
  { name: "Qatar Airways", logo: "/images/qatar-logo.png" },
  { name: "Emirates", logo: "/images/emirates-logo.png" },
  { name: "Thai Airways", logo: "/images/thai-airways-logo.png" },
]

export const educationalInstitutions = [
  { name: "Dhaka University", logo: "/images/dhaka-university-official-logo.jpeg" },
  { name: "BUET", logo: "/images/buet-logo.png" },
  { name: "RUET", logo: "/images/ruet-new-logo.png" },
  { name: "CUET", logo: "/images/cuet-new-logo.jpeg" },
  { name: "BSMMU", logo: "/images/bsmmu-logo.jpeg" },
  { name: "Daffodil University", logo: "/images/daffodil-logo.png" },
  { name: "Islamic University", logo: "/images/islamic-university-logo.jpeg" },
  { name: "DUET", logo: "/images/duet-new-logo.jpeg" },
  { name: "Jahangirnagar University", logo: "/images/jahangirnagar-logo.webp" },
  { name: "East West University", logo: "/images/east-west-university-logo.png" },
]

export const charities = [
  { name: "Save the Children", logo: "/images/charity-logos/save-the-children-official-logo.png" },
  { name: "UNICEF Bangladesh", logo: "/images/unicef-bangladesh-logo.png" },
  { name: "JAAGO Foundation", logo: "/images/jaago-foundation-logo.jpeg" },
  { name: "CARE", logo: "/images/charity-logos/care-official-logo.png" },
  { name: "BRAC", logo: "/images/charity-logos/brac-real-logo.jpeg" },
  { name: "Oxfam", logo: "/images/charity-logos/oxfam-real-logo.jpeg" },
  { name: "World Vision", logo: "/images/charity-logos/world-vision-official-logo.jpeg" },
  { name: "Grameen Foundation", logo: "/images/grameen-foundation-logo.png" },
  { name: "Bangladesh Red Crescent", logo: "/images/charity-logos/bangladesh-red-crescent-official-logo.jpeg" },
  { name: "ActionAid", logo: "/images/charity-logos/actionaid-real-logo.jpeg" },
  { name: "Islamic Relief", logo: "/images/charity-logos/islamic-relief-real-logo.jpeg" },
  { name: "Plan International", logo: "/images/charity-logos/plan-international-real-logo.jpeg" },
  { name: "WaterAid", logo: "/images/charity-logos/wateraid-real-logo.jpeg" },
]
