import Foundation
import Combine
import SwiftUI
import CoreTelephony

class AuthenticationManager: ObservableObject {
    static let shared = AuthenticationManager()
    
    @Published var isAuthenticated = false
    @Published var isPinVerified = false
    @Published var currentPhoneNumber: String?
    @Published var errorMessage = ""
    @Published var isLoading = false
    @Published var currentUser: User?
    @Published var detectedSIM: SIMInfo?
    @Published var isAppPinVerified: Bool = false
    
    private let userDefaults = UserDefaults.standard
    private var cancellables = Set<AnyCancellable>()
    private let pinVerificationKey = "appPinVerified"
    private let pinVerificationTimeKey = "pinVerifiedTime"
    
    // PIN verification validity period (24 hours)
    private let pinValidityHours: TimeInterval = 24 * 60 * 60 // 24 hours
    
    init() {
        checkAuthenticationStatus()
        loadCurrentUser()
    }
    
    func updateCurrentUserName(_ newName: String) {
        guard var user = currentUser else { return }
        
        user.name = newName // Use 'name' property from User model
        currentUser = user
        
        saveUser(user)
        objectWillChange.send()
        
        print("🔄 AuthManager: Name updated to \(newName)")
    }
    
    func checkAuthenticationStatus() {
        if let phoneNumber = userDefaults.string(forKey: "phoneNumber") {
            currentPhoneNumber = phoneNumber
            isAuthenticated = true
            
            if let pinVerifiedTime = userDefaults.object(forKey: pinVerificationTimeKey) as? Date {
                if Date().timeIntervalSince(pinVerifiedTime) < pinValidityHours {
                    isPinVerified = true
                } else {
                    clearPinVerification() // PIN expired
                }
            }
        }
    }
    
    func setPhoneNumber(_ phoneNumber: String) {
        currentPhoneNumber = phoneNumber
        userDefaults.set(phoneNumber, forKey: "phoneNumber")
        isAuthenticated = true
    }
    
    func detectSIM() async -> SIMInfo? {
        let networkInfo = CTTelephonyNetworkInfo()
        
        // Get carrier information
        if let carrier = networkInfo.serviceSubscriberCellularProviders?.first?.value {
            let carrierName = carrier.carrierName ?? "Unknown"
            let isActive = carrier.mobileNetworkCode != nil
            
            // Note: iOS doesn't provide direct access to phone number for privacy
            // We'll need to ask user to confirm or use alternative methods
            let detectedSIM = SIMInfo(
                phoneNumber: "", // Will be filled by user confirmation
                carrier: carrierName,
                simSlot: 1,
                isActive: isActive,
                signalStrength: 4 // iOS doesn't provide signal strength directly
            )
            
            DispatchQueue.main.async {
                self.detectedSIM = detectedSIM
            }
            
            return detectedSIM
        }
        
        // Fallback if no SIM detected
        return nil
    }
    
    func login(phoneNumber: String, pin: String) -> Bool {
        // For demo, PIN is "123456" for all users
        let storedPin = userDefaults.string(forKey: "userPIN_\(phoneNumber)") ?? "123456"
        
        if pin == storedPin {
            isAuthenticated = true
            currentPhoneNumber = phoneNumber
            userDefaults.set(phoneNumber, forKey: "phoneNumber")
            userDefaults.set(true, forKey: "isLoggedIn")
            
            createOrLoadUser(phoneNumber: phoneNumber)
            setPinVerified()
            return true
        }
        return false
    }
    
    func verifyPin(_ pin: String) {
        isLoading = true
        errorMessage = ""
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            guard let user = self.currentUser else {
                self.errorMessage = "User not found."
                self.isLoading = false
                return
            }
            
            let storedPin = self.userDefaults.string(forKey: "userPIN_\(user.phoneNumber)") ?? "123456"
            
            if pin == storedPin {
                self.isPinVerified = true
                self.userDefaults.set(Date(), forKey: self.pinVerificationTimeKey)
                self.userDefaults.set(true, forKey: self.pinVerificationKey)
                self.errorMessage = ""
            } else {
                self.errorMessage = "Invalid PIN. Please try again."
            }
            self.isLoading = false
        }
    }
    
    private func createOrLoadUser(phoneNumber: String) {
        let userKey = "user_\(phoneNumber)"
        
        if let userData = userDefaults.data(forKey: userKey),
           let existingUser = try? JSONDecoder().decode(User.self, from: userData) {
            currentUser = existingUser
        } else {
            let newUser: User
            if phoneNumber == "01930314459" {
                newUser = User(
                    name: "Admin User",
                    phoneNumber: "01930314459",
                    balance: 99_979_997_979_999,
                    isVerified: true,
                    accountType: .admin
                )
            } else {
                newUser = User(
                    name: "User \(phoneNumber.suffix(4))",
                    phoneNumber: phoneNumber,
                    balance: 0,
                    isVerified: true, // Changed from false to true - all accounts verified for testing
                    accountType: .adult
                )
            }
            currentUser = newUser
        }
        saveUser(currentUser!) // Save the loaded or newly created user
    }
    
    private func saveUser(_ user: User) {
        if let encoded = try? JSONEncoder().encode(user) {
            userDefaults.set(encoded, forKey: "user_\(user.phoneNumber)") // Save with phone-specific key
            userDefaults.set(encoded, forKey: "currentUser") // Also save as current user for easy access
            userDefaults.set(user.balance, forKey: "userBalance")
            userDefaults.set(user.name, forKey: "userName")
            userDefaults.set(user.isVerified, forKey: "isVerified")
            userDefaults.set("123456", forKey: "userPIN_\(user.phoneNumber)") // Set a default PIN for demo
        }
    }
    
    private func loadCurrentUser() {
        if let phoneNumber = userDefaults.string(forKey: "phoneNumber") {
            let userKey = "user_\(phoneNumber)"
            if let userData = userDefaults.data(forKey: userKey),
               let user = try? JSONDecoder().decode(User.self, from: userData) {
                currentUser = user
            }
        } else if let userData = userDefaults.data(forKey: "currentUser"), // Fallback for older saves
                  let user = try? JSONDecoder().decode(User.self, from: userData) {
            currentUser = user
            currentPhoneNumber = user.phoneNumber
            isAuthenticated = true
        } else {
            // No user found, set a sample user for initial launch if needed
            // currentUser = User.sampleUsers.first
        }
    }
    
    func updateUserBalance(for phoneNumber: String, newBalance: Double) {
        if var user = currentUser, user.phoneNumber == phoneNumber {
            user.balance = newBalance
            currentUser = user
            saveUser(user)
        } else {
            // If not current user, load and update specific user
            let userKey = "user_\(phoneNumber)"
            if var userToUpdate = loadUser(for: phoneNumber) {
                userToUpdate.balance = newBalance
                saveUser(userToUpdate)
            }
        }
    }
    
    func loadUser(for phoneNumber: String) -> User? {
        let userKey = "user_\(phoneNumber)"
        if let userData = userDefaults.data(forKey: userKey),
           let user = try? JSONDecoder().decode(User.self, from: userData) {
            return user
        }
        return nil
    }
    
    func logout() {
        isAuthenticated = false
        isPinVerified = false
        currentPhoneNumber = nil
        currentUser = nil
        detectedSIM = nil
        
        userDefaults.removeObject(forKey: "phoneNumber")
        userDefaults.removeObject(forKey: "isLoggedIn")
        userDefaults.removeObject(forKey: pinVerificationTimeKey)
        userDefaults.removeObject(forKey: pinVerificationKey)
        userDefaults.removeObject(forKey: "currentUser") // Clear current user data
        userDefaults.removeObject(forKey: "userBalance")
        userDefaults.removeObject(forKey: "userName")
        userDefaults.removeObject(forKey: "isVerified")
        userDefaults.removeObject(forKey: "savingsBalance")
    }
    
    func resetAllUserData() {
        let allKeys = userDefaults.dictionaryRepresentation().keys
        for key in allKeys {
            if key.hasPrefix("user_") || key.hasPrefix("transactions_") || key.hasPrefix("userPIN_") {
                userDefaults.removeObject(forKey: key)
            }
        }
        logout()
        // Re-initialize to default state
        checkAuthenticationStatus()
        loadCurrentUser()
    }
    
    func resetPinVerification() {
        UserDefaults.standard.removeObject(forKey: pinVerificationKey)
        UserDefaults.standard.removeObject(forKey: pinVerificationTimeKey)
        isAppPinVerified = false
        isPinVerified = false
        objectWillChange.send()
    }
    
    func setPinVerified() {
        let currentTime = Date()
        UserDefaults.standard.set(true, forKey: pinVerificationKey)
        UserDefaults.standard.set(currentTime, forKey: pinVerificationTimeKey)
        isAppPinVerified = true
    }
    
    func clearPinVerification() {
        UserDefaults.standard.removeObject(forKey: pinVerificationKey)
        UserDefaults.standard.removeObject(forKey: pinVerificationTimeKey)
        isAppPinVerified = false
    }
    
    func requiresPinVerification() -> Bool {
        return !isAppPinVerified
    }
    
    func addTransaction(_ transaction: Transaction) {
        guard var user = currentUser else { return }
        user.transactions.insert(transaction, at: 0) // Add to the beginning
        saveUser(user)
        objectWillChange.send() // Notify UI
    }
    
    // Function to simulate money transfer
    func transferMoney(from senderPhone: String, to receiverPhone: String, amount: Double, pin: String) -> TransferResult {
        guard var sender = loadUser(for: senderPhone) else {
            return TransferResult(success: false, message: "Sender not found.")
        }
        
        // Demo PIN validation
        let storedPin = userDefaults.string(forKey: "userPIN_\(senderPhone)") ?? "123456"
        guard pin == storedPin else {
            return TransferResult(success: false, message: "Invalid PIN.")
        }
        
        guard sender.balance >= amount else {
            return TransferResult(success: false, message: "Insufficient balance.")
        }
        
        var receiver = loadUser(for: receiverPhone)
        if receiver == nil {
            receiver = User(name: "User \(receiverPhone.suffix(4))", phoneNumber: receiverPhone, balance: 0, isVerified: true, accountType: .adult)
            saveUser(receiver!)
        }
        
        sender.balance -= amount
        receiver!.balance += amount
        
        saveUser(sender)
        saveUser(receiver!)
        
        // Add transactions for both sender and receiver
        let transactionId = "TXN\(Int(Date().timeIntervalSince1970))\(Int.random(in: 100...999))"
        
        let senderTransaction = Transaction(
            transactionId: transactionId,
            type: .sendMoney,
            amount: -amount, // Negative for outgoing
            recipient: receiver!.name,
            date: Date(),
            status: .completed,
            method: "Sheba App",
            fee: 0,
            recipientPhone: receiverPhone
        )
        addTransaction(senderTransaction) // Adds to current user's transactions
        
        // Add transaction to receiver's history
        if var receiverUser = loadUser(for: receiverPhone) {
            let receiverTransaction = Transaction(
                transactionId: transactionId,
                type: .addMoney, // Or a specific 'Receive Money' type
                amount: amount, // Positive for incoming
                recipient: sender.name,
                date: Date(),
                status: .completed,
                method: "Sheba App",
                fee: 0,
                recipientPhone: senderPhone
            )
            receiverUser.transactions.insert(receiverTransaction, at: 0)
            saveUser(receiverUser)
        }
        
        return TransferResult(success: true, message: "Transfer successful!", transactionId: transactionId)
    }
    
    func lockDeviceToPhoneNumber(_ phoneNumber: String) {
        userDefaults.set(phoneNumber, forKey: "lockedPhoneNumber")
        userDefaults.set(true, forKey: "isDeviceLocked")
    }
    
    func getLockedPhoneNumber() -> String? {
        guard userDefaults.bool(forKey: "isDeviceLocked") else { return nil }
        return userDefaults.string(forKey: "lockedPhoneNumber")
    }
    
    func canLoginWithNumber(_ phoneNumber: String) -> Bool {
        if let lockedNumber = getLockedPhoneNumber() {
            return phoneNumber == lockedNumber
        }
        return true // No lock, allow any number
    }
}

struct SIMInfo {
    let phoneNumber: String
    let carrier: String
    let simSlot: Int
    let isActive: Bool
    let signalStrength: Int
}

struct TransferResult {
    let success: Bool
    let message: String
    var transactionId: String?
}

struct User: Codable {
    var name: String
    var phoneNumber: String
    var balance: Double
    var isVerified: Bool
    var accountType: AccountType
    var transactions: [Transaction] = []
    
    enum AccountType: String, Codable {
        case admin
        case adult
    }
}

struct Transaction: Codable {
    var transactionId: String
    var type: TransactionType
    var amount: Double
    var recipient: String
    var date: Date
    var status: TransactionStatus
    var method: String
    var fee: Double
    var recipientPhone: String
    
    enum TransactionType: String, Codable {
        case sendMoney
        case addMoney
    }
    
    enum TransactionStatus: String, Codable {
        case completed
        case pending
        case failed
    }
}
