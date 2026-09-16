import SwiftUI

struct PinView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var pin = ""
    @State private var navigateToHome = false
    
    let phoneNumber: String
    
    var body: some View {
        ZStack {
            LinearGradient(
                gradient: Gradient(colors: [Color(hex: "1FBFFF"), Color(hex: "29a9eb")]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 30) {
                Spacer()
                
                Text("সেবা")
                    .font(.system(size: 36, weight: .bold, design: .default))
                    .foregroundColor(.white)
                    .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 2)
                
                Spacer()
                
                VStack(spacing: 20) {
                    Text("Enter Your PIN")
                        .font(.title2)
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                    
                    HStack(spacing: 15) {
                        ForEach(0..<6, id: \.self) { index in
                            Circle()
                                .fill(index < pin.count ? Color.white : Color.white.opacity(0.3))
                                .frame(width: 20, height: 20)
                                .scaleEffect(index < pin.count ? 1.2 : 1.0)
                                .animation(.spring(response: 0.3, dampingFraction: 0.6), value: pin.count)
                        }
                    }
                    .padding(.vertical, 10)
                    
                    if !authManager.errorMessage.isEmpty {
                        Text(authManager.errorMessage)
                            .foregroundColor(.red)
                            .font(.body)
                    }
                }
                
                Spacer()
                
                VStack(spacing: 20) {
                    ForEach(0..<3, id: \.self) { row in
                        HStack(spacing: 30) {
                            ForEach(1...3, id: \.self) { col in
                                let number = row * 3 + col
                                NumberButton(number: "\(number)") {
                                    addDigit("\(number)")
                                }
                            }
                        }
                    }
                    
                    HStack(spacing: 30) {
                        Color.clear
                            .frame(width: 70, height: 70)
                        
                        NumberButton(number: "0") {
                            addDigit("0")
                        }
                        
                        Button(action: deleteDigit) {
                            Image(systemName: "delete.left")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 70, height: 70)
                                .background(Color.white.opacity(0.2))
                                .clipShape(Circle())
                        }
                    }
                }
                .padding(.horizontal, 40)
                
                Spacer()
                
                Button("Forgot PIN?") {
                    // Navigate to forgot PIN page
                }
                .foregroundColor(.white.opacity(0.8))
                .font(.system(size: 16, weight: .medium))
                
                Spacer()
            }
            .padding()
            
            if authManager.isLoading {
                Color.black.opacity(0.3)
                    .ignoresSafeArea()
                
                VStack(spacing: 20) {
                    ProgressView()
                        .scaleEffect(1.5)
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    
                    Text("Verifying PIN...")
                        .foregroundColor(.white)
                        .font(.headline)
                }
            }
        }
        .navigationBarHidden(true)
        .onChange(of: pin) { newPin in
            if newPin.count == 6 {
                authManager.verifyPin(newPin)
            }
        }
        .onChange(of: authManager.isPinVerified) { isVerified in
            if isVerified {
                navigateToHome = true
            }
        }
        .fullScreenCover(isPresented: $navigateToHome) {
            MainTabView()
                .environmentObject(authManager)
                .environmentObject(UserManager(authManager: authManager)) // Pass authManager
                .environmentObject(TransactionManager.shared)
        }
    }
    
    private func addDigit(_ digit: String) {
        if pin.count < 6 {
            pin += digit
            let impactFeedback = UIImpactFeedbackGenerator(style: .light)
            impactFeedback.impactOccurred()
        }
    }
    
    private func deleteDigit() {
        if !pin.isEmpty {
            pin.removeLast()
            let impactFeedback = UIImpactFeedbackGenerator(style: .light)
            impactFeedback.impactOccurred()
        }
    }
}

struct NumberButton: View {
    let number: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(number)
                .font(.title)
                .fontWeight(.medium)
                .foregroundColor(.white)
                .frame(width: 70, height: 70)
                .background(Color.white.opacity(0.2))
                .clipShape(Circle())
        }
    }
}

#Preview {
    PinView(phoneNumber: "01930314459")
        .environmentObject(AuthenticationManager.shared)
}
