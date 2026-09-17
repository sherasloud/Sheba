// Account persistence and management system

export interface Account {
  id: string
  phone: string
  name: string
  pin: string
  balance: number
  created_at: string
}

const ACCOUNTS_KEY = "sheba_accounts"
const CURRENT_USER_KEY = "sheba_current_user"

// Initialize test accounts with balance
const TEST_ACCOUNTS: Account[] = [
  {
    id: "test_01709783145",
    phone: "01709783145",
    name: "Admin User",
    pin: "123456",
    balance: 99979997979999, // Admin massive balance
    created_at: new Date().toISOString(),
  },
  {
    id: "test_01930314459",
    phone: "01930314459",
    name: "Admin User",
    pin: "123456",
    balance: 99979997979999, // Admin massive balance
    created_at: new Date().toISOString(),
  },
  {
    id: "test_01712345678",
    phone: "01712345678",
    name: "User 5406",
    pin: "1234",
    balance: 100000,
    created_at: new Date().toISOString(),
  },
  {
    id: "test_01798765432",
    phone: "01798765432",
    name: "Test Account",
    pin: "1234",
    balance: 75000,
    created_at: new Date().toISOString(),
  },
]

// Get all accounts
export function getAllAccounts(): Account[] {
  if (typeof window === "undefined") return []
  
  const stored = localStorage.getItem(ACCOUNTS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return TEST_ACCOUNTS
    }
  }
  
  // Initialize with test accounts
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(TEST_ACCOUNTS))
  return TEST_ACCOUNTS
}

// Get account by phone
export function getAccountByPhone(phone: string): Account | null {
  const accounts = getAllAccounts()
  return accounts.find(acc => acc.phone === phone) || null
}

// Create new account
export function createAccount(phone: string, name: string, pin: string): Account {
  const accounts = getAllAccounts()
  
  // Check if account exists
  if (accounts.find(acc => acc.phone === phone)) {
    throw new Error("Account already exists")
  }
  
  const newAccount: Account = {
    id: `acc_${phone}_${Date.now()}`,
    phone,
    name,
    pin,
    balance: 10000, // Initial balance for new accounts
    created_at: new Date().toISOString(),
  }
  
  accounts.push(newAccount)
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  
  return newAccount
}

// Verify PIN
export function verifyPIN(phone: string, pin: string): boolean {
  const account = getAccountByPhone(phone)
  if (!account) return false
  return account.pin === pin
}

// Set current user
export function setCurrentUser(phone: string): void {
  const account = getAccountByPhone(phone)
  if (!account) throw new Error("Account not found")
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    phone: account.phone,
    name: account.name,
    loginTime: Date.now(),
  }))
}

// Get current user
export function getCurrentUser(): { phone: string; name: string } | null {
  if (typeof window === "undefined") return null
  
  const stored = localStorage.getItem(CURRENT_USER_KEY)
  if (stored) {
    try {
      const user = JSON.parse(stored)
      return { phone: user.phone, name: user.name }
    } catch {
      return null
    }
  }
  return null
}

// Logout
export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}

// Update balance
export function updateBalance(phone: string, amount: number): Account {
  const accounts = getAllAccounts()
  const account = accounts.find(acc => acc.phone === phone)
  
  if (!account) throw new Error("Account not found")
  
  account.balance += amount
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  
  return account
}

// Get current user account
export function getCurrentUserAccount(): Account | null {
  const currentUser = getCurrentUser()
  if (!currentUser) return null
  return getAccountByPhone(currentUser.phone)
}

// Transfer money between accounts
export function transferMoney(
  fromPhone: string,
  toPhone: string,
  amount: number
): { success: boolean; message: string } {
  const fromAccount = getAccountByPhone(fromPhone)
  const toAccount = getAccountByPhone(toPhone)
  
  if (!fromAccount) return { success: false, message: "Sender account not found" }
  if (!toAccount) return { success: false, message: "Recipient account not found" }
  if (fromAccount.balance < amount) return { success: false, message: "Insufficient balance" }
  
  // Update balances
  updateBalance(fromPhone, -amount)
  updateBalance(toPhone, amount)
  
  return { success: true, message: "Money transferred successfully" }
}

// Cashout (withdraw)
export function cashOut(phone: string, amount: number): { success: boolean; message: string } {
  const account = getAccountByPhone(phone)
  
  if (!account) return { success: false, message: "Account not found" }
  if (account.balance < amount) return { success: false, message: "Insufficient balance" }
  
  updateBalance(phone, -amount)
  
  return { success: true, message: "Cashout successful" }
}

// Check if user is admin
export function isAdminPhone(phone: string): boolean {
  return phone === "01709783145" || phone === "01930314459"
}
