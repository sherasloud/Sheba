import SwiftUI

struct TransactionHistoryView: View {
    @EnvironmentObject var userManager: UserManager
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var transactionManager: TransactionManager
    
    var body: some View {
        NavigationView {
            VStack {
                if let currentUser = userManager.currentUser {
                    List {
                        ForEach(transactionManager.transactions) { transaction in
                            TransactionRow(transaction: transaction)
                        }
                    }
                    .listStyle(PlainListStyle())
                } else {
                    Text("Please log in to view transactions.")
                        .foregroundColor(.gray)
                }
            }
            .navigationTitle("Transaction History")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                if let phoneNumber = authManager.currentUser?.phoneNumber {
                    transactionManager.loadTransactions(for: phoneNumber)
                }
            }
        }
    }
}

struct TransactionRow: View {
    let transaction: Transaction
    
    var body: some View {
        HStack {
            Image(systemName: iconForTransactionType(transaction.type))
                .font(.title2)
                .foregroundColor(colorForTransactionStatus(transaction.status))
                .frame(width: 40, height: 40)
                .background(colorForTransactionStatus(transaction.status).opacity(0.1))
                .clipShape(Circle())
            
            VStack(alignment: .leading) {
                Text(transaction.type.rawValue)
                    .font(.headline)
                Text(transaction.recipient)
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            
            Spacer()
            
            VStack(alignment: .trailing) {
                Text(transaction.formattedAmount)
                    .font(.headline)
                    .foregroundColor(transaction.amount < 0 ? .red : .green)
                Text(transaction.formattedDate)
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .padding(.vertical, 5)
    }
    
    private func iconForTransactionType(_ type: Transaction.TransactionType) -> String {
        switch type {
        case .sendMoney: return "arrow.up.right"
        case .recharge: return "phone.fill"
        case .cashout: return "arrow.down.left"
        case .addMoney: return "plus.circle.fill"
        case .billPayment: return "doc.text.fill"
        case .bankTransfer: return "banknote.fill"
        case .donation: return "heart.fill"
        case .airTicket: return "airplane"
        case .eduFee: return "graduationcap.fill"
        case .payment: return "creditcard.fill"
        case .savings: return "leaf.fill"
        case .remittance: return "globe"
        case .loan: return "dollarsign.circle.fill"
        case .debenture: return "chart.line.uptrend.xyaxis"
        case .profileUpdate: return "person.fill"
        }
    }
    
    private func colorForTransactionStatus(_ status: Transaction.TransactionStatus) -> Color {
        switch status {
        case .completed: return .green
        case .pending: return .orange
        case .failed: return .red
        }
    }
}

#Preview {
    TransactionHistoryView()
        .environmentObject(AuthenticationManager.shared)
        .environmentObject(UserManager(authManager: .shared))
        .environmentObject(TransactionManager.shared)
}
