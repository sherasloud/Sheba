import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var userManager: UserManager
    @Environment(\.presentationMode) var presentationMode
    
    @State private var navigateToChangeName = false
    @State private var navigateToChangePin = false
    @State private var navigateToLogin = false
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Account")) {
                    HStack {
                        Text("Name")
                        Spacer()
                        Text(userManager.currentUser?.name ?? "N/A")
                    }
                    .onTapGesture {
                        navigateToChangeName = true
                    }
                    
                    HStack {
                        Text("Phone Number")
                        Spacer()
                        Text(userManager.currentUser?.maskedPhoneNumber ?? "N/A")
                    }
                    
                    HStack {
                        Text("Balance")
                        Spacer()
                        Text(userManager.currentUser?.formattedBalance ?? "৳0")
                    }
                    
                    HStack {
                        Text("Account Type")
                        Spacer()
                        Text(userManager.currentUser?.accountType.rawValue ?? "N/A")
                    }
                    
                    Button("Change PIN") {
                        navigateToChangePin = true
                    }
                    .foregroundColor(.primary)
                    
                    Button("Update Profile Photo") {
                        // Implement photo picker
                    }
                    .foregroundColor(.primary)
                }
                
                Section(header: Text("Security")) {
                    Button("Reset PIN Verification") {
                        authManager.resetPinVerification()
                    }
                    .foregroundColor(.red)
                }
                
                Section(header: Text("App")) {
                    Button("Clear All User Data (For Testing)") {
                        authManager.resetAllUserData()
                        navigateToLogin = true // Go back to login after clearing data
                    }
                    .foregroundColor(.red)
                    
                    Button("Logout") {
                        authManager.logout()
                        navigateToLogin = true // Go back to login after logout
                    }
                    .foregroundColor(.red)
                }
            }
            .listStyle(GroupedListStyle())
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .fullScreenCover(isPresented: $navigateToLogin) {
                PhoneEntryView()
                    .environmentObject(authManager)
                    .environmentObject(UserManager(authManager: authManager))
                    .environmentObject(TransactionManager.shared)
            }
            .sheet(isPresented: $navigateToChangeName) {
                ChangeNameView()
                    .environmentObject(authManager)
                    .environmentObject(userManager)
            }
            .sheet(isPresented: $navigateToChangePin) {
                Text("Change PIN View Placeholder") // Implement ChangePinView
            }
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthenticationManager.shared)
        .environmentObject(UserManager(authManager: .shared))
}
