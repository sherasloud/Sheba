import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var userManager: UserManager
    @EnvironmentObject var transactionManager: TransactionManager
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            TransactionHistoryView()
                .tabItem {
                    Label("Transactions", systemImage: "list.bullet.rectangle.fill")
                }
                .tag(1)
            
            InboxView()
                .tabItem {
                    Label("Inbox", systemImage: "bell.fill")
                }
                .tag(2)
            
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
                .tag(3)
        }
        .accentColor(Color(red: 0.16, green: 0.66, blue: 0.92)) // Sheba blue
        .onAppear {
            // Load transactions for the current user when MainTabView appears
            if let phoneNumber = authManager.currentUser?.phoneNumber {
                transactionManager.loadTransactions(for: phoneNumber)
            }
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthenticationManager.shared)
        .environmentObject(UserManager(authManager: .shared))
        .environmentObject(TransactionManager.shared)
}
