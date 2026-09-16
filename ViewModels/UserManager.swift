import Foundation
import Combine

class UserManager: ObservableObject {
    @Published var currentUser: User?
    @Published var showBalance = false
    
    private let userDefaults = UserDefaults.standard
    private var authManager: AuthenticationManager // Reference to AuthManager
    
    init(authManager: AuthenticationManager = .shared) {
        self.authManager = authManager
        // Listen to changes in AuthManager's currentUser
        authManager.$currentUser
            .assign(to: &$currentUser)
        
        loadBalanceVisibility()
    }
    
    func updateUserName(_ newName: String) {
        authManager.updateCurrentUserName(newName) // Delegate to AuthManager
    }
    
    func updateBalance(_ newBalance: Double) {
        if let phoneNumber = currentUser?.phoneNumber {
            authManager.updateUserBalance(for: phoneNumber, newBalance: newBalance)
        }
    }
    
    func toggleBalanceVisibility() {
        showBalance.toggle()
        userDefaults.set(showBalance, forKey: "showBalance")
    }
    
    private func loadBalanceVisibility() {
        showBalance = userDefaults.bool(forKey: "showBalance")
    }
    
    func addTransaction(_ transaction: Transaction) {
        authManager.addTransaction(transaction) // Delegate to AuthManager
    }
    
    func getTransactions(for phoneNumber: String) -> [Transaction] {
        return authManager.loadUser(for: phoneNumber)?.transactions ?? []
    }
}
