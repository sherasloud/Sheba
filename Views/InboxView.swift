import SwiftUI

struct InboxView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var transactionManager: TransactionManager
    
    @State private var selectedSegment = 0 // 0 for Notifications, 1 for Transactions
    @State private var notifications: [NotificationItem] = [
        NotificationItem(
            id: "1",
            title: "Welcome to Sheba!",
            message: "Your account has been created successfully. Start exploring our features.",
            type: .welcome,
            date: Date(),
            isRead: false
        ),
        NotificationItem(
            id: "2",
            title: "Transaction Successful",
            message: "You have successfully sent ৳500 to 01712345678",
            type: .transaction,
            date: Calendar.current.date(byAdding: .hour, value: -2, to: Date()) ?? Date(),
            isRead: true
        ),
        NotificationItem(
            id: "3",
            title: "Special Offer!",
            message: "Get 10% cashback on your next mobile recharge. Limited time offer!",
            type: .promotion,
            date: Calendar.current.date(byAdding: .day, value: -1, to: Date()) ?? Date(),
            isRead: false
        )
    ]
    
    var body: some View {
        NavigationView {
            VStack {
                Picker("Select Segment", selection: $selectedSegment) {
                    Text("Notifications").tag(0)
                    Text("Transactions").tag(1)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                if selectedSegment == 0 {
                    // Notifications View
                    VStack(spacing: 0) {
                        // Header
                        HStack {
                            Text("Notifications")
                                .font(.title2)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                            
                            Spacer()
                            
                            Button("Mark All Read") {
                                markAllAsRead()
                            }
                            .font(.caption)
                            .foregroundColor(.white)
                        }
                        .padding()
                        .background(Color(red: 0.16, green: 0.66, blue: 0.92))
                        
                        // Notifications list
                        if notifications.isEmpty {
                            VStack(spacing: 20) {
                                Spacer()
                                
                                Image(systemName: "envelope")
                                    .font(.system(size: 60))
                                    .foregroundColor(.gray.opacity(0.5))
                                
                                VStack(spacing: 8) {
                                    Text("No Messages")
                                        .font(.title3)
                                        .fontWeight(.semibold)
                                        .foregroundColor(.gray)
                                    
                                    Text("Your notifications will appear here")
                                        .font(.subheadline)
                                        .foregroundColor(.gray.opacity(0.7))
                                        .multilineTextAlignment(.center)
                                }
                                
                                Spacer()
                            }
                            .frame(maxWidth: .infinity)
                        } else {
                            List {
                                ForEach(notifications) { notification in
                                    NotificationRowView(notification: notification) {
                                        markAsRead(notification.id)
                                    }
                                    .listRowSeparator(.hidden)
                                    .listRowBackground(Color.clear)
                                }
                                .onDelete(perform: deleteNotifications)
                            }
                            .listStyle(PlainListStyle())
                        }
                    }
                } else {
                    // Transactions View (Re-using TransactionHistoryView content)
                    if let currentUser = authManager.currentUser {
                        List {
                            ForEach(transactionManager.transactions) { transaction in
                                TransactionRow(transaction: transaction)
                            }
                        }
                        .listStyle(PlainListStyle())
                    } else {
                        Text("Please log in to view transactions.")
                            .foregroundColor(.gray)
                        Spacer()
                    }
                }
            }
            .navigationTitle("Inbox")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                if let phoneNumber = authManager.currentUser?.phoneNumber {
                    transactionManager.loadTransactions(for: phoneNumber)
                }
            }
        }
    }
    
    private func markAsRead(_ id: String) {
        if let index = notifications.firstIndex(where: { $0.id == id }) {
            notifications[index].isRead = true
        }
    }
    
    private func markAllAsRead() {
        for index in notifications.indices {
            notifications[index].isRead = true
        }
    }
    
    private func deleteNotifications(at offsets: IndexSet) {
        notifications.remove(atOffsets: offsets)
    }
}

struct NotificationItem: Identifiable {
    let id: String
    let title: String
    let message: String
    let type: NotificationType
    let date: Date
    var isRead: Bool
    
    enum NotificationType {
        case welcome, transaction, promotion, security, update
        
        var icon: String {
            switch self {
            case .welcome:
                return "hand.wave.fill"
            case .transaction:
                return "checkmark.circle.fill"
            case .promotion:
                return "gift.fill"
            case .security:
                return "shield.fill"
            case .update:
                return "arrow.up.circle.fill"
            }
        }
        
        var color: Color {
            switch self {
            case .welcome:
                return .blue
            case .transaction:
                return .green
            case .promotion:
                return .orange
            case .security:
                return .red
            case .update:
                return .purple
            }
        }
    }
}

struct NotificationRowView: View {
    let notification: NotificationItem
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 15) {
                // Notification icon
                Circle()
                    .fill(notification.type.color.opacity(0.1))
                    .frame(width: 50, height: 50)
                    .overlay(
                        Image(systemName: notification.type.icon)
                            .font(.system(size: 20))
                            .foregroundColor(notification.type.color)
                    )
                
                // Notification content
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(notification.title)
                            .font(.subheadline)
                            .fontWeight(notification.isRead ? .medium : .bold)
                            .foregroundColor(.primary)
                        
                        Spacer()
                        
                        if !notification.isRead {
                            Circle()
                                .fill(Color(red: 0.16, green: 0.66, blue: 0.92))
                                .frame(width: 8, height: 8)
                        }
                    }
                    
                    Text(notification.message)
                        .font(.caption)
                        .foregroundColor(.gray)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                    
                    Text(formatDate(notification.date))
                        .font(.caption)
                        .foregroundColor(.gray.opacity(0.7))
                }
                
                Spacer()
            }
            .padding()
            .background(notification.isRead ? Color.white : Color.blue.opacity(0.05))
            .cornerRadius(12)
            .shadow(color: .gray.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

struct TransactionRow: View {
    let transaction: Transaction
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(transaction.recipient)
                    .font(.headline)
                Text(transaction.amount.formatted())
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            Spacer()
            Text(transaction.date.formatted(date: .abbreviated, time: .omitted))
                .font(.caption)
                .foregroundColor(.gray.opacity(0.7))
        }
        .padding()
    }
}

struct Transaction: Identifiable {
    let id = UUID()
    let recipient: String
    let amount: Decimal
    let date: Date
}

class AuthenticationManager: ObservableObject {
    static let shared = AuthenticationManager()
    
    @Published var currentUser: User?
}

class TransactionManager: ObservableObject {
    static let shared = TransactionManager()
    
    @Published var transactions: [Transaction] = []
    
    func loadTransactions(for phoneNumber: String) {
        // Simulate loading transactions
        transactions = [
            Transaction(recipient: "John Doe", amount: 500, date: Calendar.current.date(byAdding: .day, value: -1, to: Date()) ?? Date()),
            Transaction(recipient: "Jane Smith", amount: 300, date: Calendar.current.date(byAdding: .hour, value: -3, to: Date()) ?? Date())
        ]
    }
}

class UserManager {
    let authManager: AuthenticationManager
    
    init(authManager: AuthenticationManager) {
        self.authManager = authManager
    }
}

struct User {
    let phoneNumber: String
}
