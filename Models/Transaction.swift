import Foundation

struct Transaction: Identifiable, Codable {
    let id: UUID
    let transactionId: String
    let type: TransactionType
    let amount: Double
    let recipient: String // Name or description of recipient/service
    let date: Date
    let status: TransactionStatus
    let method: String // e.g., "Sheba App", "Grameenphone", "Bank"
    let fee: Double
    let recipientPhone: String? // Optional: phone number for send money/recharge
    
    init(id: UUID = UUID(), transactionId: String? = nil, type: TransactionType, amount: Double, recipient: String, date: Date, status: TransactionStatus, method: String, fee: Double, recipientPhone: String? = nil) {
        self.id = id
        self.transactionId = transactionId ?? "TXN\(Int(Date().timeIntervalSince1970))\(Int.random(in: 100...999))"
        self.type = type
        self.amount = amount
        self.recipient = recipient
        self.date = date
        self.status = status
        self.method = method
        self.fee = fee
        self.recipientPhone = recipientPhone
    }

    enum TransactionType: String, Codable, CaseIterable {
        case sendMoney = "Send Money"
        case recharge = "Recharge"
        case cashout = "Cashout"
        case addMoney = "Add Money"
        case billPayment = "Bill Payment"
        case bankTransfer = "Bank Transfer"
        case donation = "Donation"
        case airTicket = "Air Ticket"
        case eduFee = "Education Fee"
        case payment = "Payment"
        case savings = "Savings"
        case remittance = "Remittance"
        case loan = "Loan"
        case debenture = "Debenture"
        case profileUpdate = "Profile Update" // Added for profile photo/name changes
    }

    enum TransactionStatus: String, Codable, CaseIterable {
        case completed = "Completed"
        case pending = "Pending"
        case failed = "Failed"
    }

    var formattedAmount: String {
        let prefix = amount >= 0 ? "+" : ""
        return "\(prefix)৳\(String(format: "%.0f", abs(amount)).formattedWithCommas)"
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM dd, yyyy"
        return formatter.string(from: date)
    }

    var formattedTime: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "hh:mm a"
        return formatter.string(from: date)
    }
}
