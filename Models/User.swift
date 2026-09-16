import Foundation

struct User: Codable, Identifiable {
    let id = UUID()
    var name: String
    var phoneNumber: String
    var balance: Double
    var isVerified: Bool
    var accountType: AccountType
    var transactions: [Transaction] = [] // Initialize with empty array
    var profilePhoto: String? // Optional profile photo name

    enum AccountType: String, Codable, CaseIterable {
        case student = "Student"
        case adult = "Adult"
        case verified = "Verified"
        case admin = "Admin"
    }

    var formattedBalance: String {
        return "৳\(String(format: "%.0f", balance).formattedWithCommas)"
    }

    var maskedPhoneNumber: String {
        guard phoneNumber.count >= 11 else { return phoneNumber }
        let prefix = String(phoneNumber.prefix(3))
        let suffix = String(phoneNumber.suffix(4))
        return "\(prefix)****\(suffix)"
    }

    // Sample users for demonstration
    static let sampleUsers: [User] = [
        User(
            name: "Admin User",
            phoneNumber: "01930314459",
            balance: 99979997979999,
            isVerified: true,
            accountType: .admin,
            transactions: [
                Transaction(
                    id: UUID(),
                    type: .sendMoney,
                    amount: -500,
                    recipient: "01712345678",
                    date: Date().addingTimeInterval(-3600),
                    status: .completed,
                    method: "Sheba App",
                    fee: 0,
                    recipientPhone: "01712345678"
                ),
                Transaction(
                    id: UUID(),
                    type: .recharge,
                    amount: -100,
                    recipient: "01930314459",
                    date: Date().addingTimeInterval(-7200),
                    status: .completed,
                    method: "Grameenphone",
                    fee: 0,
                    recipientPhone: "01930314459"
                )
            ]
        ),
        User(
            name: "John Doe",
            phoneNumber: "01712345678",
            balance: 1500,
            isVerified: true, // Changed from false to true for testing
            accountType: .adult,
            transactions: []
        ),
        User(
            name: "Jane Smith",
            phoneNumber: "01812345678",
            balance: 2500,
            isVerified: true,
            accountType: .verified,
            transactions: []
        )
    ]
}

// String extension for number formatting
extension String {
    var formattedWithCommas: String {
        guard let number = Double(self) else { return self }
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = ","
        return formatter.string(from: NSNumber(value: number)) ?? self
    }
}
