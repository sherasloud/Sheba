import SwiftUI

struct PhoneEntryView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var phoneNumber: String = ""
    @State private var navigateToPinView = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            Image("seba-logo-splash") // Ensure this image is in your Assets.xcassets
                .resizable()
                .scaledToFit()
                .frame(width: 150, height: 150)
            
            Text("Welcome to Sheba")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text("Enter your phone number to get started")
                .font(.headline)
                .foregroundColor(.gray)
            
            VStack(alignment: .leading, spacing: 10) {
                Text("Phone Number")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                TextField("01XXXXXXXXX", text: $phoneNumber)
                    .keyboardType(.phonePad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .font(.title2)
                    .padding(.horizontal)
            }
            .padding(.horizontal)
            
            if showError {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
            }
            
            Button(action: proceedToPin) {
                Text("Continue")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(red: 0.16, green: 0.66, blue: 0.92))
                    .cornerRadius(10)
            }
            .padding(.horizontal)
            
            Spacer()
        }
        .navigationBarHidden(true)
        .alert("Error", isPresented: $showError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
        .fullScreenCover(isPresented: $navigateToPinView) {
            PinView(phoneNumber: phoneNumber)
                .environmentObject(authManager)
        }
    }
    
    private func proceedToPin() {
        guard phoneNumber.count == 11 && phoneNumber.hasPrefix("01") else {
            errorMessage = "Please enter a valid 11-digit phone number."
            showError = true
            return
        }
        authManager.setPhoneNumber(phoneNumber)
        navigateToPinView = true
    }
}

#Preview {
    PhoneEntryView()
        .environmentObject(AuthenticationManager.shared)
}
