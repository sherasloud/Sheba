import SwiftUI

struct ForgotPinView: View {
    @State private var currentStep = 1
    @State private var phoneNumber = ""
    @State private var nidNumber = ""
    @State private var otpCode = ""
    @State private var newPin = ""
    @State private var confirmPin = ""
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var showSuccess = false
    @State private var sentOtp = ""
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: {}) {
                    Image(systemName: "arrow.left")
                        .foregroundColor(.white)
                        .font(.title2)
                }
                
                Text("Reset PIN")
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
                    nidVerificationStep
                case 3:
                    otpVerificationStep
                case 4:
                    newPinStep
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
                Text("Forgot Your PIN?")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Enter your phone number to reset your PIN")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Phone Number")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                TextField("01XXXXXXXXX", text: $phoneNumber)
                    .keyboardType(.phonePad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .font(.title3)
            }
            
            VStack(spacing: 8) {
                Text("Security Information")
                    .fontWeight(.bold)
                    .foregroundColor(.blue)
                
                Text("We'll verify your identity using your NID number and send an OTP to reset your PIN.")
                    .font(.caption)
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
            
            Button(action: validatePhoneAndProceed) {
                Text("Continue")
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
    
    private var nidVerificationStep: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Verify Identity")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Enter your NID number for verification")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("National ID Number")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                TextField("Enter your NID number", text: $nidNumber)
                    .keyboardType(.numberPad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .font(.title3)
            }
            
            VStack(spacing: 8) {
                Text("Security:")
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
                
                Text("Your NID number must match the one used during account creation.")
                    .font(.caption)
                    .foregroundColor(.orange)
            }
            .padding()
            .background(Color.orange.opacity(0.1))
            .cornerRadius(10)
            
            if showError {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            Spacer()
            
            Button(action: validateNidAndSendOtp) {
                Text("Verify & Send OTP")
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
    
    private var otpVerificationStep: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Enter OTP")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Enter the OTP sent to \(phoneNumber)")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("6-Digit OTP")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                TextField("••••••", text: $otpCode)
                    .keyboardType(.numberPad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .font(.title)
                    .multilineTextAlignment(.center)
            }
            
            if !sentOtp.isEmpty {
                VStack(spacing: 8) {
                    Text("Demo OTP:")
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                    
                    Text("OTP sent to \(phoneNumber): \(sentOtp)")
                        .font(.caption)
                        .foregroundColor(.green)
                }
                .padding()
                .background(Color.green.opacity(0.1))
                .cornerRadius(10)
            }
            
            if showError {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            VStack(spacing: 8) {
                Text("Didn't receive the OTP?")
                    .font(.caption)
                    .foregroundColor(.blue)
                
                Button("Resend OTP") {
                    validateNidAndSendOtp()
                }
                .font(.caption)
                .foregroundColor(.blue)
                .underline()
            }
            .padding()
            .background(Color.blue.opacity(0.1))
            .cornerRadius(10)
            
            Spacer()
            
            Button(action: verifyOtp) {
                Text("Verify OTP")
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
    
    private var newPinStep: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Create New PIN")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Choose a new 6-digit PIN for your account")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(spacing: 15) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("New 6-Digit PIN")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    SecureField("••••••", text: $newPin)
                        .keyboardType(.numberPad)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .font(.title2)
                        .multilineTextAlignment(.center)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Confirm New PIN")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    SecureField("••••••", text: $confirmPin)
                        .keyboardType(.numberPad)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .font(.title2)
                        .multilineTextAlignment(.center)
                }
            }
            
            VStack(spacing: 8) {
                Text("Security Tips:")
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
                
                VStack(alignment: .leading, spacing: 5) {
                    Text("• Use a unique PIN that you haven't used elsewhere")
                    Text("• Don't share your PIN with anyone")
                    Text("• Avoid using obvious numbers like 123456")
                }
                .font(.caption)
                .foregroundColor(.orange)
            }
            .padding()
            .background(Color.orange.opacity(0.1))
            .cornerRadius(10)
            
            if showError {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            Spacer()
            
            Button(action: resetPin) {
                Text("Reset PIN")
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
                Text("PIN Reset Successful!")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Your PIN has been updated successfully")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            Text("You can now login with your new PIN. Keep it safe and secure!")
                .font(.caption)
                .foregroundColor(.green)
                .padding()
                .background(Color.green.opacity(0.1))
                .cornerRadius(10)
                .multilineTextAlignment(.center)
            
            Spacer()
            
            NavigationLink(destination: LoginView()) {
                Text("Login Now")
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
    
    private func validatePhoneAndProceed() {
        guard phoneNumber.count == 11, phoneNumber.hasPrefix("01") else {
            showError(message: "Please enter a valid 11-digit phone number")
            return
        }
        
        currentStep = 2
        showError = false
    }
    
    private func validateNidAndSendOtp() {
        guard !nidNumber.isEmpty else {
            showError(message: "Please enter your NID number")
            return
        }
        
        guard nidNumber.count >= 10 else {
            showError(message: "Please enter a valid NID number")
            return
        }
        
        // Generate and "send" OTP
        let otp = String(Int.random(in: 100000...999999))
        sentOtp = otp
        
        currentStep = 3
        showError = false
    }
    
    private func verifyOtp() {
        guard !otpCode.isEmpty else {
            showError(message: "Please enter the OTP")
            return
        }
        
        guard otpCode == sentOtp else {
            showError(message: "Invalid OTP. Please try again.")
            return
        }
        
        currentStep = 4
        showError = false
    }
    
    private func resetPin() {
        guard !newPin.isEmpty else {
            showError(message: "Please enter a new PIN")
            return
        }
        
        guard newPin.count == 6, newPin.allSatisfy(\.isNumber) else {
            showError(message: "PIN must be exactly 6 digits")
            return
        }
        
        guard !confirmPin.isEmpty else {
            showError(message: "Please confirm your new PIN")
            return
        }
        
        guard newPin == confirmPin else {
            showError(message: "PINs do not match")
            return
        }
        
        // Update PIN in UserDefaults
        UserDefaults.standard.set(newPin, forKey: "userPIN")
        
        showSuccess = true
        showError = false
    }
    
    private func showError(message: String) {
        errorMessage = message
        showError = true
    }
}
