import SwiftUI

struct ChangeNameView: View {
    @EnvironmentObject var userManager: UserManager
    @Environment(\.presentationMode) var presentationMode
    @State private var newName: String = ""
    @State private var showError: Bool = false
    @State private var errorMessage: String = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Change Your Name")
                    .font(.title)
                    .fontWeight(.bold)
                
                TextField("Enter new name", text: $newName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding()
                
                if showError {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                }
                
                Button(action: saveName) {
                    Text("Save Name")
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
            .padding()
            .navigationTitle("Change Name")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
            .onAppear {
                newName = userManager.currentUser?.name ?? ""
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
    }
    
    private func saveName() {
        guard !newName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            errorMessage = "Name cannot be empty."
            showError = true
            return
        }
        
        userManager.updateUserName(newName)
        presentationMode.wrappedValue.dismiss()
    }
}

#Preview {
    ChangeNameView()
        .environmentObject(UserManager(authManager: AuthenticationManager.shared))
}
