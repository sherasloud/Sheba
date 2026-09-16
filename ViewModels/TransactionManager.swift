import Foundation
import Combine

class TransactionManager: ObservableObject {
    static let shared = TransactionManager()
    
    @Published var transactions: [Transaction] = []
    
    private let userDefaults = UserDefaults.standard
    private let transactionsKeyPrefix = "userTransactions_"
    
    private init() {
        // Transactions are now managed per user by AuthenticationManager
        // This manager can be used to filter/display transactions for the current user
    }
    
    // This function would typically be called by AuthenticationManager
    // when a user logs in or a transaction occurs.
    func loadTransactions(for phoneNumber: String) {
        if let data = userDefaults.data(forKey: transactionsKeyPrefix + phoneNumber),
           let decodedTransactions = try? JSONDecoder().decode([Transaction].self, from: data) {
            transactions = decodedTransactions.sorted { $0.date > $1.date }
        } else {
            transactions = []
        }
    }
    
    func addTransaction(_ transaction: Transaction, for phoneNumber: String) {
        var currentTransactions = transactions
        currentTransactions.insert(transaction, at: 0) // Add to top
        transactions = currentTransactions.sorted { $0.date > $1.date } // Re-sort
        saveTransactions(for: phoneNumber)
    }
    
    func clearAllTransactions(for phoneNumber: String) {
        transactions.removeAll()
        saveTransactions(for: phoneNumber)
    }
    
    private func saveTransactions(for phoneNumber: String) {
        if let encoded = try? JSONEncoder().encode(transactions) {
            userDefaults.set(encoded, forKey: transactionsKeyPrefix + phoneNumber)
        }
    }
}
