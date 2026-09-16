import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var phoneNumber = ""
    @State private var pin = ""
    @State private var showPin = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isLoading = false
    @State private var simDetected = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: {}) {
                    Image(systemName: "arrow.left")
                        .foregroundColor(.white)
                        .font(.title2)
                }
                
                Text("Login")
                    .font(.title2)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                
                Spacer()
            }
            .padding()
            .background(Color(red: 0.16, green: 0.66, blue: 0.92))
            
            ScrollView {
                VStack(spacing: 30) {
                    // Welcome section
                    VStack(spacing: 10) {
                        Text("Welcome Back")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                        
                        Text("Login to your Sheba account")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    .padding(.top, 30)
                    
                    // SIM Detection section
                    if let detectedSIM = authManager.detectedSIM {
                        VStack(spacing: 15) {
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                                    .font(.title3)
                                
                                Text("SIM Detected!")
                                    .fontWeight(.bold)
                                    .foregroundColor(.green)
                                
                                Spacer()
                            }
                            
                            VStack(spacing: 8) {
                                HStack {
                                    Text("Phone:")
                                        .foregroundColor(.green)
                                    Spacer()
                                    Text(detectedSIM.phoneNumber)
                                        .fontWeight(.bold)
                                        .font(.system(.body, design: .monospaced))
                                }
                                
                                HStack {
                                    Text("Carrier:")
                                        .foregroundColor(.green)
                                    Spacer()
                                    Text(detectedSIM.carrier)
                                        .fontWeight(.medium)
                                }
                                
                                HStack {
                                    Text("SIM Slot:")
                                        .foregroundColor(.green)
                                    Spacer()
                                    Text("Slot \(detectedSIM.simSlot)")
                                        .fontWeight(.medium)
                                }
                            }
                            
                            NavigationLink(destination: SIMDetectionView()) {
                                HStack {
                                    Image(systemName: "gearshape")
                                    Text("Change SIM")
                                }
                                .font(.caption)
                                .foregroundColor(.green)
                            }
                        }
                        .padding()
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(15)
                        .overlay(
                            RoundedRectangle(cornerRadius: 15)
                                .stroke(Color.green.opacity(0.3), lineWidth: 1)
                        )
                        .onAppear {
                            phoneNumber = detectedSIM.phoneNumber
                            simDetected = true
                        }
                    } else {
                        // Auto-detect SIM section
                        VStack(spacing: 15) {
                            HStack {
                                Image(systemName: "antenna.radiowaves.left.and.right")
                                    .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                                    .font(.title3)
                                
                                Text("Auto-Detect SIM")
                                    .fontWeight(.bold)
                                    .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                                
                                Spacer()
                            }
                            
                            Text("Let us automatically detect your phone number from your SIM card for faster login.")
                                .font(.caption)
                                .foregroundColor(.blue)
                            
                            NavigationLink(destination: SIMDetectionView()) {
                                Text("Detect My SIM")
                                    .font(.subheadline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 8)
                                    .background(Color(red: 0.16, green: 0.66, blue: 0.92))
                                    .cornerRadius(8)
                            }
                        }
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(15)
                        .overlay(
                            RoundedRectangle(cornerRadius: 15)
                                .stroke(Color.blue.opacity(0.3), lineWidth: 1)
                        )
                    }
                    
                    // Login form
                    VStack(spacing: 20) {
                        VStack(alignment: .leading, spacing: 8) {
                            if let lockedNumber = authManager.getLockedPhoneNumber() {
                                Text("Phone Number (Device Locked)")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                HStack {
                                    Text(lockedNumber)
                                        .font(.title3)
                                        .padding()
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .background(Color.orange.opacity(0.1))
                                        .cornerRadius(8)
                                    
                                    Image(systemName: "lock.fill")
                                        .foregroundColor(.orange)
                                }
                                
                                HStack {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                        .foregroundColor(.orange)
                                        .font(.caption)
                                    Text("This device is locked to this number only")
                                        .font(.caption)
                                        .foregroundColor(.orange)
                                }
                                .onAppear {
                                    phoneNumber = lockedNumber
                                }
                            } else {
                                Text("Phone Number")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("01XXXXXXXXX", text: $phoneNumber)
                                    .keyboardType(.phonePad)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .font(.title3)
                                    .disabled(simDetected)
                                    .background(simDetected ? Color.green.opacity(0.1) : Color.clear)
                                
                                if simDetected {
                                    HStack {
                                        Image(systemName: "checkmark.circle")
                                            .foregroundColor(.green)
                                            .font(.caption)
                                        Text("Auto-detected from SIM")
                                            .font(.caption)
                                            .foregroundColor(.green)
                                    }
                                }
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("6-Digit PIN")
                                .font(.subheadline)
                                .fontWeight(.medium)
                            
                            HStack {
                                Group {
                                    if showPin {
                                        TextField("••••••", text: $pin)
                                    } else {
                                        SecureField("••••••", text: $pin)
                                    }
                                }
                                .keyboardType(.numberPad)
                                .font(.title2)
                                .multilineTextAlignment(.center)
                                
                                Button(action: { showPin.toggle() }) {
                                    Image(systemName: showPin ? "eye.slash" : "eye")
                                        .foregroundColor(.gray)
                                }
                            }
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        if showError {
                            Text(errorMessage)
                                .foregroundColor(.red)
                                .font(.caption)
                                .padding(.horizontal)
                        }
                        
                        Button(action: handleLogin) {
                            HStack {
                                if isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .scaleEffect(0.8)
                                }
                                Text(isLoading ? "Logging in..." : "Login")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(red: 0.16, green: 0.66, blue: 0.92))
                            .cornerRadius(10)
                        }
                        .disabled(isLoading)
                        
                        NavigationLink(destination: ForgotPinView()) {
                            Text("Forgot PIN?")
                                .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                                .font(.subheadline)
                        }
                    }
                    
                    Spacer(minLength: 50)
                    
                    // Registration and demo info
                    VStack(spacing: 15) {
                        HStack {
                            Text("Don't have an account?")
                                .foregroundColor(.gray)
                            NavigationLink(destination: RegisterView()) {
                                Text("Create Account")
                                    .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                                    .fontWeight(.medium)
                            }
                        }
                        
                        VStack(spacing: 8) {
                            Text("Demo Login:")
                                .fontWeight(.bold)
                                .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                            Text("Phone: 01930314459 or 01712345678")
                            Text("PIN: 123456")
                        }
                        .font(.caption)
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(10)
                    }
                }
                .padding(.horizontal)
            }
        }
        .navigationBarHidden(true)
    }
    
    private func handleLogin() {
        guard !phoneNumber.isEmpty else {
            showError(message: "Please enter your phone number")
            return
        }
        
        guard phoneNumber.count == 11, phoneNumber.hasPrefix("01") else {
            showError(message: "Please enter a valid 11-digit phone number")
            return
        }
        
        if !authManager.canLoginWithNumber(phoneNumber) {
            showError(message: "This device is locked to a different number. Cannot login with \(phoneNumber)")
            return
        }
        
        guard !pin.isEmpty else {
            showError(message: "Please enter your PIN")
            return
        }
        
        guard pin.count == 6, pin.allSatisfy(\.isNumber) else {
            showError(message: "PIN must be 6 digits")
            return
        }
        
        isLoading = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            if authManager.login(phoneNumber: phoneNumber, pin: pin) {
                isLoading = false
                showError = false
            } else {
                isLoading = false
                showError(message: "Invalid phone number or PIN")
            }
        }
    }
    
    private func showError(message: String) {
        errorMessage = message
        showError = true
    }
}
