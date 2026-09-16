import SwiftUI

struct RegisterView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var currentStep = 1
    @State private var phoneNumber = ""
    @State private var fullName = ""
    @State private var email = ""
    @State private var dateOfBirth = Date()
    @State private var pin = ""
    @State private var confirmPin = ""
    @State private var referralCode = ""
    @State private var showPin = false
    @State private var showConfirmPin = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isDetecting = true
    @State private var detectedSIM: SIMInfo?
    @State private var simDetected = false
    @State private var accountCreated = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: {
                    if currentStep > 1 {
                        currentStep -= 1
                    }
                }) {
                    Image(systemName: "arrow.left")
                        .foregroundColor(.white)
                        .font(.title2)
                }
                
                Text("Create Account")
                    .font(.title2)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                
                Spacer()
                
                Text("Step \(currentStep) of 3")
                    .font(.subheadline)
                    .foregroundColor(.white)
            }
            .padding()
            .background(Color(red: 0.16, green: 0.66, blue: 0.92))
            
            // Progress bar
            ProgressView(value: Double(currentStep), total: 3)
                .progressViewStyle(LinearProgressViewStyle(tint: Color(red: 0.16, green: 0.66, blue: 0.92)))
                .scaleEffect(x: 1, y: 2, anchor: .center)
            
            if accountCreated {
                accountCreatedView
            } else {
                switch currentStep {
                case 1:
                    personalInfoStep
                case 2:
                    dateOfBirthStep
                case 3:
                    pinCreationStep
                default:
                    personalInfoStep
                }
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            detectSIM()
        }
    }
    
    private var personalInfoStep: some View {
        ScrollView {
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Personal Information")
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Text("Let's start with your basic details")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // SIM Detection section
                if isDetecting {
                    simDetectionView
                } else if let sim = detectedSIM {
                    detectedSIMView(sim: sim)
                }
                
                VStack(spacing: 15) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Full Name *")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        TextField("Enter your full name", text: $fullName)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Phone Number *")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        TextField("01XXXXXXXXX", text: $phoneNumber)
                            .keyboardType(.phonePad)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
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
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Email Address *")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        TextField("your.email@example.com", text: $email)
                            .keyboardType(.emailAddress)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Referral Code (Optional)")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        TextField("Enter referral code if you have one", text: $referralCode)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                }
                
                if showError {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding(.horizontal)
                }
                
                Button(action: validateStep1) {
                    Text("Next")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(red: 0.16, green: 0.66, blue: 0.92))
                        .cornerRadius(10)
                }
                .padding(.top)
            }
            .padding()
        }
    }
    
    private var dateOfBirthStep: some View {
        VStack(spacing: 30) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Date of Birth")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("We need your date of birth to determine account type")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 15) {
                Text("Date of Birth *")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                DatePicker("", selection: $dateOfBirth, in: ...Calendar.current.date(byAdding: .year, value: -11, to: Date())!, displayedComponents: .date)
                    .datePickerStyle(WheelDatePickerStyle())
                    .labelsHidden()
            }
            
            VStack(spacing: 8) {
                Text("Account Types:")
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                
                VStack(alignment: .leading, spacing: 5) {
                    Text("• Ages 11-17: Student Account (Birth Certificate required for verification)")
                    Text("• Ages 18+: Adult Account (NID required for verification)")
                    Text("• Minimum age: 11 years")
                }
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
            
            Button(action: validateStep2) {
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
    
    private var pinCreationStep: some View {
        VStack(spacing: 30) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Create Security PIN")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Choose a 6-digit PIN to secure your account")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("6-Digit PIN *")
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
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Confirm PIN *")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    HStack {
                        Group {
                            if showConfirmPin {
                                TextField("••••••", text: $confirmPin)
                            } else {
                                SecureField("••••••", text: $confirmPin)
                            }
                        }
                        .keyboardType(.numberPad)
                        .font(.title2)
                        .multilineTextAlignment(.center)
                        
                        Button(action: { showConfirmPin.toggle() }) {
                            Image(systemName: showConfirmPin ? "eye.slash" : "eye")
                                .foregroundColor(.gray)
                        }
                    }
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                }
            }
            
            VStack(spacing: 8) {
                Text("Security Tips:")
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
                
                VStack(alignment: .leading, spacing: 5) {
                    Text("• Use a unique PIN that you haven't used elsewhere")
                    Text("• Don't share your PIN with anyone")
                    Text("• Avoid using obvious numbers like 123456 or your birth year")
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
            
            Button(action: createAccount) {
                Text("Create Account")
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
    
    private var accountCreatedView: some View {
        VStack(spacing: 30) {
            Spacer()
            
            let age = Calendar.current.dateComponents([.year], from: dateOfBirth, to: Date()).year ?? 0
            let isAutoVerified = phoneNumber == "01930314459"
            
            Circle()
                .fill(isAutoVerified ? Color.green : Color.orange)
                .frame(width: 80, height: 80)
                .overlay(
                    Image(systemName: "checkmark")
                        .font(.largeTitle)
                        .foregroundColor(.white)
                )
            
            VStack(spacing: 10) {
                Text("Welcome to Sheba!")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Your account has been created successfully")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 10) {
                accountDetailRow("Account Number:", "SH\(Int(Date().timeIntervalSince1970))")
                accountDetailRow("Name:", fullName)
                accountDetailRow("Phone:", phoneNumber)
                accountDetailRow("Age:", "\(age) years")
                accountDetailRow("Account Type:", age >= 18 ? "Adult" : "Student")
                
                if simDetected {
                    accountDetailRow("SIM Detected:", "✓ Yes", valueColor: .green)
                }
                
                accountDetailRow("Status:", isAutoVerified ? "Verified" : "Unverified", 
                               valueColor: isAutoVerified ? .green : .orange)
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(15)
            
            if isAutoVerified {
                Text("Auto-Verified: You received 99,979,997,979,999৳ admin balance!")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.green)
                    .padding()
                    .background(Color.green.opacity(0.1))
                    .cornerRadius(10)
            } else {
                Text("Verification Required: Complete verification with your \(age >= 18 ? "NID" : "Birth Certificate") to unlock all features and get bonus!")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
                    .padding()
                    .background(Color.orange.opacity(0.1))
                    .cornerRadius(10)
                    .multilineTextAlignment(.center)
            }
            
            Spacer()
            
            Button("Start Using Sheba") {
                // Navigate to main app
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
    
    private var simDetectionView: some View {
        VStack(spacing: 15) {
            HStack {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: Color(red: 0.16, green: 0.66, blue: 0.92)))
                    .scaleEffect(0.8)
                
                Image(systemName: "antenna.radiowaves.left.and.right")
                    .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                    .font(.title3)
                
                Text("Detecting SIM Card...")
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                
                Spacer()
            }
            
            Text("We're automatically detecting your phone number")
                .font(.caption)
                .foregroundColor(.blue)
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(15)
    }
    
    private func detectedSIMView(sim: SIMInfo) -> some View {
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
                Text("Phone number from your SIM:")
                    .font(.caption)
                    .foregroundColor(.green)
                
                Text(sim.phoneNumber)
                    .font(.title3)
                    .fontWeight(.bold)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.white)
                    .cornerRadius(10)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color.green.opacity(0.3), lineWidth: 1)
                    )
            }
            
            HStack(spacing: 10) {
                Button("Use This Number") {
                    phoneNumber = sim.phoneNumber
                    simDetected = true
                }
                .font(.caption)
                .foregroundColor(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.green)
                .cornerRadius(8)
                
                Button("Enter Manually") {
                    simDetected = false
                    phoneNumber = ""
                }
                .font(.caption)
                .foregroundColor(.green)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.clear)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.green, lineWidth: 1)
                )
            }
        }
        .padding()
        .background(Color.green.opacity(0.1))
        .cornerRadius(15)
        .overlay(
            RoundedRectangle(cornerRadius: 15)
                .stroke(Color.green.opacity(0.3), lineWidth: 1)
        )
    }
    
    private func accountDetailRow(_ label: String, _ value: String, valueColor: Color = .primary) -> some View {
        HStack {
            Text(label)
                .foregroundColor(.gray)
            Spacer()
            Text(value)
                .fontWeight(.bold)
                .foregroundColor(valueColor)
        }
        .font(.subheadline)
    }
    
    private func detectSIM() {
        Task {
            try? await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
            
            let sim = SIMInfo(
                phoneNumber: "01930314459",
                carrier: "Grameenphone",
                simSlot: 1,
                isActive: true,
                signalStrength: 4
            )
            
            await MainActor.run {
                detectedSIM = sim
                isDetecting = false
            }
        }
    }
    
    private func validateStep1() {
        guard !fullName.trimmingCharacters(in: .whitespaces).isEmpty else {
            showError(message: "Please enter your full name")
            return
        }
        
        guard fullName.trimmingCharacters(in: .whitespaces).count >= 2 else {
            showError(message: "Name must be at least 2 characters")
            return
        }
        
        guard !phoneNumber.isEmpty else {
            showError(message: "Please enter your phone number")
            return
        }
        
        guard phoneNumber.count == 11, phoneNumber.hasPrefix("01") else {
            showError(message: "Please enter a valid 11-digit phone number starting with 01")
            return
        }
        
        guard !email.isEmpty else {
            showError(message: "Please enter your email address")
            return
        }
        
        guard email.contains("@") && email.contains(".") else {
            showError(message: "Please enter a valid email address")
            return
        }
        
        currentStep = 2
        showError = false
    }
    
    private func validateStep2() {
        let age = Calendar.current.dateComponents([.year], from: dateOfBirth, to: Date()).year ?? 0
        
        guard age >= 11 else {
            showError(message: "You must be at least 11 years old to create an account")
            return
        }
        
        currentStep = 3
        showError = false
    }
    
    private func createAccount() {
        guard !pin.isEmpty else {
            showError(message: "Please enter a PIN")
            return
        }
        
        guard pin.count == 6, pin.allSatisfy(\.isNumber) else {
            showError(message: "PIN must be exactly 6 digits")
            return
        }
        
        guard !confirmPin.isEmpty else {
            showError(message: "Please confirm your PIN")
            return
        }
        
        guard pin == confirmPin else {
            showError(message: "PINs do not match")
            return
        }
        
        // Create user account
        let age = Calendar.current.dateComponents([.year], from: dateOfBirth, to: Date()).year ?? 0
        let isAutoVerified = phoneNumber == "01930314459"
        
        let user = User(
            phoneNumber: phoneNumber,
            fullName: isAutoVerified ? "Admin User" : fullName,
            balance: isAutoVerified ? 99979997979999 : 0,
            isVerified: isAutoVerified,
            accountNumber: "SH\(Int(Date().timeIntervalSince1970))",
            createdAt: Date(),
            email: email,
            dateOfBirth: DateFormatter().string(from: dateOfBirth),
            nidNumber: nil
        )
        
        // Save user data
        if let encoded = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(encoded, forKey: "userData")
            UserDefaults.standard.set(pin, forKey: "userPIN")
            UserDefaults.standard.set(user.fullName, forKey: "userName")
            UserDefaults.standard.set(user.balance, forKey: "userBalance")
            UserDefaults.standard.set(user.isVerified, forKey: "isVerified")
        }
        
        accountCreated = true
        showError = false
    }
    
    private func showError(message: String) {
        errorMessage = message
        showError = true
    }
}
