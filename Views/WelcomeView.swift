import SwiftUI

struct WelcomeView: View {
    @State private var showLogin = false
    @State private var showRegister = false
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(red: 0.16, green: 0.66, blue: 0.92), Color(red: 0.12, green: 0.53, blue: 0.89)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 40) {
                Spacer()
                
                // Logo and title
                VStack(spacing: 20) {
                    // Water droplet logo
                    ZStack {
                        Circle()
                            .fill(Color.white)
                            .frame(width: 120, height: 120)
                        
                        Image(systemName: "drop.fill")
                            .font(.system(size: 60))
                            .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                    }
                    
                    Text("Sheba")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Your Complete Digital Wallet")
                        .font(.title3)
                        .foregroundColor(.white.opacity(0.9))
                        .multilineTextAlignment(.center)
                }
                
                Spacer()
                
                // Action buttons
                VStack(spacing: 15) {
                    NavigationLink(destination: LoginView()) {
                        Text("Login")
                            .font(.headline)
                            .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.white)
                            .cornerRadius(25)
                    }
                    
                    NavigationLink(destination: RegisterView()) {
                        Text("Create Account")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.white.opacity(0.2))
                            .cornerRadius(25)
                            .overlay(
                                RoundedRectangle(cornerRadius: 25)
                                    .stroke(Color.white, lineWidth: 1)
                            )
                    }
                    
                    NavigationLink(destination: SIMDetectionView()) {
                        HStack {
                            Image(systemName: "antenna.radiowaves.left.and.right")
                            Text("Auto-Detect SIM")
                        }
                        .font(.subheadline)
                        .foregroundColor(.white)
                        .padding(.vertical, 8)
                    }
                }
                .padding(.horizontal, 30)
                
                Spacer()
            }
        }
        .navigationBarHidden(true)
    }
}
