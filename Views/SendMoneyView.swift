import SwiftUI

struct SendMoneyView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var userManager: UserManager // Use UserManager for current user balance
    @Environment(\.presentationMode) var presentationMode
    
    @State private var receiverPhone = ""
    @State private var amount = ""
    @State private var pin = ""
    @State private var currentStep = 1
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isLoading = false
    @State private var showSuccess = false
    @State private var transferResult: TransferResult?
    
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
                
                Text("Send Money")
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
                    phoneNumberStep
                case 2:
                    amountStep
                case 3:
                    pinConfirmationStep
                default:
                    phoneNumberStep
                }
            }
        }
        .navigationBarHidden(true)
    }
    
    private var phoneNumberStep: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Send Money")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Free charge - No fees!")
                    .font(.subheadline)
                    .foregroundColor(.green)
                    .fontWeight(.medium)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("📱")
                    Text("Receiver Phone Number")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                TextField("01XXXXXXXXX", text: $receiverPhone)
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
            
            Button(action: validatePhoneAndProceed) {
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
                
                Text("To: \(receiverPhone)")
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
                Text("Confirm Transfer")
                    .font(.title)
                    .fontWeight(.bold)
                
                VStack(alignment: .leading, spacing: 5) {
                    Text("To: \(receiverPhone)")
                    Text("Amount: ৳\(amount)")
                    Text("Fee: ৳0 (FREE)")
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
                
                Button(action: processTransfer) {
                    HStack {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        }
                        Text(isLoading ? "Processing..." : "Send Money")
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
                Text("Transfer Successful!")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Money sent successfully")
                    .foregroundColor(.gray)
            }
            
            VStack(spacing: 10) {
                HStack {
                    Text("To:")
                    Spacer()
                    Text(receiverPhone)
                        .fontWeight(.bold)
                }
                
                HStack {
                    Text("Amount:")
                    Spacer()
                    Text("৳\(amount)")
                        .fontWeight(.bold)
                }
                
                HStack {
                    Text("New Balance:")
                    Spacer()
                    Text(userManager.currentUser?.formattedBalance ?? "৳0")
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                }
                
                HStack {
                    Text("Transaction ID:")
                    Spacer()
                    Text(transferResult?.transactionId ?? "")
                        .fontWeight(.bold)
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
    
    private func validatePhoneAndProceed() {
        guard receiverPhone.count == 11, receiverPhone.hasPrefix("01") else {
            showError(message: "Please enter a valid 11-digit phone number")
            return
        }
        
        guard receiverPhone != authManager.currentUser?.phoneNumber else {
            showError(message: "Cannot send money to yourself")
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
        
        guard amountValue <= (userManager.currentUser?.balance ?? 0) else {
            showError(message: "Insufficient Balance!")
            return
        }
        
        currentStep = 3
        showError = false
    }
    
    private func processTransfer() {
        guard let amountValue = Double(amount) else {
            showError(message: "Invalid amount")
            return
        }
        
        isLoading = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            guard let senderPhone = authManager.currentUser?.phoneNumber else {
                showError(message: "Sender phone number not available.")
                isLoading = false
                return
            }
            
            let result = authManager.transferMoney(
                from: senderPhone,
                to: receiverPhone,
                amount: amountValue,
                pin: pin
            )
            
            isLoading = false
            
            if result.success {
                transferResult = result
                showSuccess = true
            } else {
                showError(message: result.message)
            }
        }
    }
    
    private func showError(message: String) {
        errorMessage = message
        showError = true
    }
}

#Preview {
    NavigationView {
        SendMoneyView()
            .environmentObject(AuthenticationManager.shared)
            .environmentObject(UserManager(authManager: .shared))
    }
}
