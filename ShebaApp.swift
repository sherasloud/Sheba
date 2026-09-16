import SwiftUI

@main
struct ShebaApp: App {
    // State objects for global managers
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var userManager = UserManager(authManager: .shared) // Pass authManager
    @StateObject private var transactionManager = TransactionManager.shared
    
    var body: some Scene {
        WindowGroup {
            // Use a NavigationView for navigation stack
            NavigationView {
                if authManager.isAuthenticated {
                    // If authenticated, check if PIN is verified for the session
                    if authManager.isPinVerified {
                        MainTabView()
                            .environmentObject(authManager)
                            .environmentObject(userManager)
                            .environmentObject(transactionManager)
                    } else {
                        // If authenticated but PIN not verified for session, go to PIN verification
                        PinVerificationView()
                            .environmentObject(authManager)
                            .environmentObject(userManager)
                            .environmentObject(transactionManager)
                    }
                } else {
                    // If not authenticated, go to phone entry
                    PhoneEntryView()
                        .environmentObject(authManager)
                        .environmentObject(userManager)
                        .environmentObject(transactionManager)
                }
            }
        }
    }
}

// Color extension for hex colors (from previous context)
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
