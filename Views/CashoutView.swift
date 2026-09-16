import SwiftUI

struct CashoutView: View {
    @Environment(\.presentationMode) var presentationMode
    @EnvironmentObject var userManager: UserManager
    @EnvironmentObject var authManager: AuthenticationManager
    
    @State private var agentNumber: String = ""
    @State private var amount: String = ""
    @State private var pin: String = ""
    @State private var currentStep: Int = 1
    @State private var showError: Bool = false
    @State private var errorMessage: String = ""
    @State private var isLoading: Bool = false
    @State private var showSuccess: Bool = false
    @State private var transactionId: String = ""
    
    // Cashout charge: 1.85% of the amount
    private let cashoutChargeRate: Double = 0.0185
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: {
                    if currentStep > 1 {
                        currentStep -= 1
                    } else {
                        presentationMode.wrappedValue.dismiss()
                    }
                }) {
                    Image(systemName: "arrow.left")
                        .foregroundColor(.white)
                        .font(.title2)
                }
                
                Text("Cashout")
                    .font(.title2)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                
                Spacer()
            }
            .padding()
            .background(Color(red: 0.16, green: 0.66, blue: 0.92))
            
            if showSuccess {
                successView
            } else {
                switch currentStep {
                case 1:
                    agentNumberStep
                case 2:
                    amountStep
                case 3:
                    pinConfirmationStep
                default:
                    agentNumberStep
                }
            }
        }
        .navigationBarHidden(true)
    }
    
    private var agentNumberStep: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Cashout from Agent")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Enter Agent Phone Number")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("👤")
                    Text("Agent Phone Number")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                TextField("01XXXXXXXXX", text: $agentNumber)
                    .keyboardType(.phonePad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .font(.title3)
            }
            
            if showError {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            Spacer()
            
            Button(action: validateAgentNumberAndProceed) {
                Text("Next")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(red: 0.16, green: 0.66, blue: 0.92))
                    .cornerRadius(10)
            }
        }
        .padding()
    }
    
    private var amountStep: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Enter Amount")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("To Agent: \(agentNumber)")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("💰")
                    Text("Amount (৳)")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                TextField("0", text: $amount)
                    .keyboardType(.numberPad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .font(.title)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 5) {
                Text("Your Balance: \(userManager.currentUser?.formattedBalance ?? "৳0")")
                    .font(.subheadline)
                    .foregroundColor(.blue)
            }
            .padding()
            .background(Color.blue.opacity(0.1))
            .cornerRadius(10)
            
            if showError {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            Spacer()
            
            HStack(spacing: 10) {
                Button("Back") {
                    currentStep = 1
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.gray.opacity(0.2))
                .cornerRadius(10)
                
                Button(action: validateAmountAndProceed) {
                    Text("Next")
                        .foregroundColor(.white)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(red: 0.16, green: 0.66, blue: 0.92))
                .cornerRadius(10)
            }
        }
        .padding()
    }
    
    private var pinConfirmationStep: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Confirm Cashout")
                    .font(.title)
                    .fontWeight(.bold)
                
                VStack(alignment: .leading, spacing: 5) {
                    Text("To Agent: \(agentNumber)")
                    Text("Amount: ৳\(amount)")
                    Text("Cashout Fee: ৳\(calculateCashoutFee())")
                }
                .font(.subheadline)
                .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("🔒")
                    Text("Enter PIN")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                SecureField("••••••", text: $pin)
                    .keyboardType(.numberPad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .font(.title2)
                    .multilineTextAlignment(.center)
            }
            
            if showError {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            Spacer()
            
            HStack(spacing: 10) {
                Button("Back") {
                    currentStep = 2
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.gray.opacity(0.2))
                .cornerRadius(10)
                
                Button(action: processCashout) {
                    HStack {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        }
                        Text(isLoading ? "Processing..." : "Cashout")
                            .foregroundColor(.white)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(red: 0.16, green: 0.66, blue: 0.92))
                .cornerRadius(10)
                .disabled(isLoading)
            }
        }
        .padding()
    }
    
    private var successView: some View {
        VStack(spacing: 30) {
            Spacer()
            
            Circle()
                .fill(Color.green)
                .frame(width: 80, height: 80)
                .overlay(
                    Image(systemName: "checkmark")
                        .font(.largeTitle)
                        .foregroundColor(.white)
                )
            
            VStack(spacing: 10) {
                Text("Cashout Successful!")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Money cashed out successfully")
                    .foregroundColor(.gray)
            }
            
            VStack(spacing: 10) {
                HStack {
                    Text("To Agent:")
                    Spacer()
                    Text(agentNumber)
                        .fontWeight(.bold)
                }
                
                HStack {
                    Text("Amount:")
                    Spacer()
                    Text("৳\(amount)")
                        .fontWeight(.bold)
                }
                
                HStack {
                    Text("Fee:")
                    Spacer()
                    Text("৳\(calculateCashoutFee())")
                        .fontWeight(.bold)
                }
                
                HStack {
                    Text("New Balance:")
                    Spacer()
                    Text(userManager.currentUser?.formattedBalance ?? "৳0")
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                }
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(10)
            
            Spacer()
            
            Button("Done") {
                presentationMode.wrappedValue.dismiss()
            }
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(red: 0.16, green: 0.66, blue: 0.92))
            .cornerRadius(10)
        }
        .padding()
    }
    
    private func validateAgentNumberAndProceed() {
        guard agentNumber.count == 11, agentNumber.hasPrefix("01") else {
            showError(message: "Please enter a valid 11-digit agent phone number")
            return
        }
        currentStep = 2
        showError = false
    }
    
    private func validateAmountAndProceed() {
        guard let amountValue = Double(amount), amountValue > 0 else {
            showError(message: "Please enter a valid amount")
            return
        }
        
        let totalDeduction = amountValue + calculateCashoutFeeValue()
        
        guard totalDeduction <= (userManager.currentUser?.balance ?? 0) else {
            showError(message: "Insufficient Balance!")
            return
        }
        
        currentStep = 3
        showError = false
    }
    
    private func calculateCashoutFee() -> String {
        guard let amountValue = Double(amount) else { return "0" }
        let fee = amountValue * cashoutChargeRate
        return String(format: "%.2f", fee)
    }
    
    private func calculateCashoutFeeValue() -> Double {
        guard let amountValue = Double(amount) else { return 0.0 }
        return amountValue * cashoutChargeRate
    }
    
    private func processCashout() {
        guard let amountValue = Double(amount) else {
            showError(message: "Invalid amount")
            return
        }
        
        isLoading = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            guard let userPhone = authManager.currentUser?.phoneNumber else {
                showError(message: "User phone number not available.")
                isLoading = false
                return
            }
            
            let totalDeduction = amountValue + calculateCashoutFeeValue()
            
            // Simulate cashout by deducting from user balance
            if var currentUser = authManager.currentUser {
                if currentUser.balance >= totalDeduction {
                    currentUser.balance -= totalDeduction
                    authManager.updateUserBalance(for: userPhone, newBalance: currentUser.balance)
                    
                    // Add transaction
                    let cashoutTransaction = Transaction(
                        type: .cashout,
                        amount: -totalDeduction, // Negative for outgoing
                        recipient: "Agent \(agentNumber)",
                        date: Date(),
                        status: .completed,
                        method: "Cashout",
                        fee: calculateCashoutFeeValue(),
                        recipientPhone: agentNumber
                    )
                    authManager.addTransaction(cashoutTransaction)
                    
                    showSuccess = true
                } else {
                    showError(message: "Insufficient Balance!")
                }
            } else {
                showError(message: "User not logged in.")
            }
            isLoading = false
        }
    }
}

#Preview {
    NavigationView {
        CashoutView()
            .environmentObject(AuthenticationManager.shared)
            .environmentObject(UserManager(authManager: .shared))
    }
}
