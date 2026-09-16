import SwiftUI

struct PinVerificationView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var pin = ""
    
    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                VStack(spacing: 20) {
                    HStack(spacing: 12) {
                        ForEach(0..<6, id: \.self) { index in
                            Circle()
                                .fill(index < pin.count ? Color.white : Color.white.opacity(0.4))
                                .frame(width: 20, height: 20)
                        }
                    }
                    .padding(.vertical, 15)
                    
                    if !authManager.errorMessage.isEmpty {
                        Text(authManager.errorMessage)
                            .foregroundColor(.red)
                            .font(.body)
                    }
                }
                .padding(.horizontal, 25)
                .padding(.top, 30)
                .padding(.bottom, 20)
                
                VStack(spacing: 25) {
                    ForEach(0..<3) { row in
                        HStack(spacing: 45) {
                            ForEach(1...3, id: \.self) { col in
                                let number = row * 3 + col
                                Button(action: { addDigit("\(number)") }) {
                                    Text("\(number)")
                                        .font(.system(size: 32, weight: .medium))
                                        .foregroundColor(.white)
                                        .frame(width: 65, height: 65)
                                }
                            }
                        }
                    }
                    
                    HStack(spacing: 45) {
                        Color.clear
                            .frame(width: 65, height: 65)
                        
                        Button(action: { addDigit("0") }) {
                            Text("0")
                                .font(.system(size: 32, weight: .medium))
                                .foregroundColor(.white)
                                .frame(width: 65, height: 65)
                        }
                        
                        Button(action: deleteDigit) {
                            Image(systemName: "delete.left")
                                .font(.system(size: 24))
                                .foregroundColor(.white)
                                .frame(width: 65, height: 65)
                        }
                    }
                }
                .padding(.horizontal, 25)
                .padding(.vertical, 20)
                
                Spacer()
                
                Button(action: {
                    // Handle forgot PIN
                }) {
                    Text("Forgot PIN?")
                        .font(.title2)
                        .foregroundColor(.white)
                }
                .padding(.bottom, 30)
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
            .background(Color(red: 0.12, green: 0.75, blue: 1.0))
            .clipped()
        }
        .navigationBarHidden(true)
        .onChange(of: pin) { value in
            if value.count == 6 {
                authManager.verifyPin(value)
            }
        }
        .overlay(
            Group {
                if authManager.isLoading {
                    Color.black.opacity(0.3)
                        .ignoresSafeArea()
                    
                    VStack(spacing: 15) {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.2)
                        
                        Text("Verifying PIN...")
                            .foregroundColor(.white)
                            .font(.body)
                    }
                }
            }
        )
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

#Preview {
    PinVerificationView()
        .environmentObject(AuthenticationManager.shared)
}
