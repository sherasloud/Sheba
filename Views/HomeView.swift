import SwiftUI

struct HomeView: View {
    @EnvironmentObject var userManager: UserManager
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var currentBannerIndex = 0
    @State private var bannerTimer: Timer?
    
    // Banner data - converted from TSX
    private let banners = [
        BannerData(
            id: "send-money-updated",
            imageName: "sheba-send-money-banner-updated", // Ensure this image is in your Assets.xcassets
            title: "Send Money Complete",
            destination: "SendMoney"
        ),
        BannerData(
            id: "cashout-beach",
            imageName: "sheba-cashout-banner-beach", // Ensure this image is in your Assets.xcassets
            title: "Cashout ৹৯ Charge",
            destination: "Cashout"
        )
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header with balance
                headerView
                
                // Banner carousel
                bannerCarousel
                
                // Feature grid
                featureGrid
                
                Spacer(minLength: 100) // Space for bottom navigation
            }
            .padding()
        }
        .navigationBarHidden(true)
        .onAppear {
            startBannerTimer()
        }
        .onDisappear {
            stopBannerTimer()
        }
    }
    
    private var headerView: some View {
        VStack(spacing: 15) {
            // Sheba title - tap to show balance
            Button(action: { userManager.toggleBalanceVisibility() }) {
                Text("Sheba")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }
            
            // User info and balance
            HStack {
                // Profile photo
                Button(action: profileAction) {
                    if let photoName = userManager.currentUser?.profilePhoto, !photoName.isEmpty {
                        Image(photoName) // Ensure this image is in your Assets.xcassets
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 40, height: 40)
                            .clipShape(Circle())
                    } else {
                        Circle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(width: 40, height: 40)
                            .overlay(
                                Text(userManager.currentUser?.name.prefix(1).uppercased() ?? "U")
                                    .font(.headline)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                            )
                    }
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(userManager.currentUser?.name ?? "User")
                            .font(.headline)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                        
                        if userManager.currentUser?.isVerified == true {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                                .font(.caption)
                        }
                    }
                    
                    if userManager.currentUser?.isVerified != true && userManager.currentUser?.accountType != .admin {
                        Text("Unverified")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                    }
                }
                
                Spacer()
                
                // Balance display
                if userManager.showBalance {
                    Text(userManager.currentUser?.formattedBalance ?? "৳0")
                        .font(.title2)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                }
            }
            .padding()
            .background(Color.white.opacity(0.2))
            .cornerRadius(25)
        }
        .padding()
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color.blue, Color.blue.opacity(0.8)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(20)
    }
    
    private var bannerCarousel: some View {
        TabView(selection: $currentBannerIndex) {
            ForEach(0..<banners.count, id: \.self) { index in
                NavigationLink(destination: destinationView(for: banners[index].destination)) {
                    Image(banners[index].imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(height: 120)
                        .clipped()
                        .cornerRadius(15)
                }
                .tag(index)
            }
        }
        .tabViewStyle(PageTabViewStyle(indexDisplayMode: .always))
        .frame(height: 140)
    }
    
    private var featureGrid: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 15) {
            // Main features
            FeatureButton(
                icon: "paperplane.fill",
                title: "Send Money",
                color: .blue,
                destination: AnyView(SendMoneyView())
            )
            
            FeatureButton(
                icon: "phone.fill",
                title: "Recharge",
                color: .green,
                destination: AnyView(Text("Recharge View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "banknote",
                title: "Cashout",
                color: .orange,
                destination: AnyView(CashoutView())
            )
            
            FeatureButton(
                icon: "plus.circle.fill",
                title: "Add Money",
                color: .purple,
                destination: AnyView(Text("Add Money View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "arrow.triangle.2.circlepath",
                title: "Transfer",
                color: .indigo,
                destination: AnyView(Text("Transfer View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "calendar",
                title: "Budget",
                color: .teal,
                destination: AnyView(Text("Budget View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "creditcard.fill",
                title: "Payment",
                color: .red,
                destination: AnyView(Text("Payment View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "doc.text.fill",
                title: "Bill",
                color: .brown,
                destination: AnyView(Text("Bill View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "graduationcap.fill",
                title: "Edu Fee",
                color: .cyan,
                destination: AnyView(Text("Edu Fee View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "airplane",
                title: "Air Tickets",
                color: .blue,
                destination: AnyView(Text("Air Tickets View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "train.side.front.car",
                title: "Rail Tickets",
                color: .blue,
                destination: AnyView(Text("Rail Tickets View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "heart.fill",
                title: "Donate",
                color: .pink,
                destination: AnyView(Text("Donate View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "leaf.fill",
                title: "Savings",
                color: .green,
                destination: AnyView(Text("Savings View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "globe",
                title: "Remittance",
                color: .blue,
                destination: AnyView(Text("Remittance View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "chart.line.uptrend.xyaxis",
                title: "Debenture",
                color: .orange,
                destination: AnyView(Text("Debenture View Placeholder")) // Placeholder
            )
            
            FeatureButton(
                icon: "questionmark.circle.fill",
                title: "Help",
                color: .gray,
                destination: AnyView(Text("Help View Placeholder")) // Placeholder
            )
        }
    }
    
    private func startBannerTimer() {
        bannerTimer = Timer.scheduledTimer(withTimeInterval: 7.0, repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.5)) {
                currentBannerIndex = (currentBannerIndex + 1) % banners.count
            }
        }
    }
    
    private func stopBannerTimer() {
        bannerTimer?.invalidate()
        bannerTimer = nil
    }
    
    private func profileAction() {
        if userManager.currentUser?.isVerified == true {
            // Navigate to QR share or profile details
            print("Navigate to QR share/profile details")
        } else {
            // Show verification required alert or navigate to verification flow
            print("Show verification required alert")
        }
    }
    
    @ViewBuilder
    private func destinationView(for destination: String) -> some View {
        switch destination {
        case "SendMoney":
            SendMoneyView()
        case "Cashout":
            CashoutView()
        default:
            Text("Destination for \(destination) not implemented yet.")
        }
    }
}

struct BannerData: Identifiable {
    let id: String
    let imageName: String
    let title: String
    let destination: String
}

struct FeatureButton: View {
    let icon: String
    let title: String
    let color: Color
    let destination: AnyView
    
    var body: some View {
        NavigationLink(destination: destination
                        .environmentObject(AuthenticationManager.shared)
                        .environmentObject(UserManager(authManager: .shared))
                        .environmentObject(TransactionManager.shared)
        ) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                
                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
                    .multilineTextAlignment(.center)
                    .foregroundColor(.primary)
            }
            .frame(height: 70)
            .frame(maxWidth: .infinity)
            .background(Color(.systemGray6))
            .cornerRadius(10)
        }
    }
}

#Preview {
    NavigationView {
        HomeView()
            .environmentObject(AuthenticationManager.shared)
            .environmentObject(UserManager(authManager: .shared))
            .environmentObject(TransactionManager.shared)
    }
}
