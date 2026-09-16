import SwiftUI

struct RailTicketsView: View {
    @State private var selectedService: RailService?
    @State private var fromStation = ""
    @State private var toStation = ""
    @State private var travelDate = Date()
    @State private var passengers = 1
    @State private var showFromSuggestions = false
    @State private var showToSuggestions = false
    
    // Metro stations - converted from TSX
    private let metroStations = [
        "Uttara North", "Uttara Center", "Uttara South", "Pallabi",
        "Mirpur-11", "Mirpur-10", "Kazipara", "Shewrapara",
        "Agargaon", "Bijoy Sarani", "Farmgate", "Karwan Bazar",
        "Shahbagh", "Dhaka University", "Bangladesh Secretariat",
        "Motijheel", "Kamalapur"
    ]
    
    private let trainRoutes = [
        TrainRoute(from: "Dhaka", to: "Chittagong", duration: "4h 30m"),
        TrainRoute(from: "Dhaka", to: "Sylhet", duration: "4h 15m"),
        TrainRoute(from: "Dhaka", to: "Rajshahi", duration: "4h 45m"),
        TrainRoute(from: "Dhaka", to: "Rangpur", duration: "6h 00m"),
        TrainRoute(from: "Dhaka", to: "Khulna", duration: "5h 15m"),
        TrainRoute(from: "Dhaka", to: "Barisal", duration: "3h 30m"),
        TrainRoute(from: "Dhaka", to: "Mymensingh", duration: "2h 15m")
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Service selection
                serviceSelectionView
                
                // Route selection
                if selectedService != nil {
                    routeSelectionView
                }
                
                // Travel details
                if !fromStation.isEmpty && !toStation.isEmpty {
                    travelDetailsView
                }
                
                // Search button
                if canSearch {
                    searchButton
                }
                
                // Pricing info
                pricingInfoView
            }
            .padding()
        }
        .navigationTitle("Rail Tickets")
        .navigationBarTitleDisplayMode(.large)
    }
    
    private var serviceSelectionView: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack {
                Image(systemName: "train.side.front.car")
                    .foregroundColor(.blue)
                Text("Select Service")
                    .font(.headline)
                    .fontWeight(.semibold)
            }
            
            HStack(spacing: 15) {
                ServiceCard(
                    emoji: "🚇",
                    title: "Metro Rail",
                    subtitle: "Dhaka Metro",
                    isSelected: selectedService == .metro
                ) {
                    selectedService = .metro
                    resetStations()
                }
                
                ServiceCard(
                    emoji: "🚆", 
                    title: "Train",
                    subtitle: "Intercity",
                    isSelected: selectedService == .train
                ) {
                    selectedService = .train
                    resetStations()
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(15)
        .shadow(color: .gray.opacity(0.1), radius: 5)
    }
    
    private var routeSelectionView: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack {
                Image(systemName: "map")
                    .foregroundColor(.blue)
                Text("Select Route")
                    .font(.headline)
                    .fontWeight(.semibold)
            }
            
            VStack(spacing: 15) {
                // From station
                VStack(alignment: .leading, spacing: 8) {
                    Text("From")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    HStack {
                        Image(systemName: "location")
                            .foregroundColor(.gray)
                        
                        TextField("Select departure station", text: $fromStation)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    if showFromSuggestions && !fromStation.isEmpty {
                        suggestionsList(for: fromStation, excluding: toStation) { station in
                            fromStation = station
                            showFromSuggestions = false
                        }
                    }
                }
                
                // To station  
                VStack(alignment: .leading, spacing: 8) {
                    Text("To")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    HStack {
                        Image(systemName: "location")
                            .foregroundColor(.gray)
                        
                        TextField("Select destination station", text: $toStation)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    if showToSuggestions && !toStation.isEmpty {
                        suggestionsList(for: toStation, excluding: fromStation) { station in
                            toStation = station
                            showToSuggestions = false
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(15)
        .shadow(color: .gray.opacity(0.1), radius: 5)
    }
    
    private var travelDetailsView: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack {
                Image(systemName: "calendar")
                    .foregroundColor(.blue)
                Text("Travel Details")
                    .font(.headline)
                    .fontWeight(.semibold)
            }
            
            VStack(spacing: 15) {
                // Travel date
                DatePicker("Travel Date", selection: $travelDate, in: Date()..., displayedComponents: .date)
                    .datePickerStyle(CompactDatePickerStyle())
                
                // Passengers
                HStack {
                    Image(systemName: "person.2")
                        .foregroundColor(.gray)
                    
                    Text("Passengers")
                        .font(.subheadline)
                    
                    Spacer()
                    
                    Picker("Passengers", selection: $passengers) {
                        ForEach(1...6, id: \.self) { count in
                            Text("\(count) Passenger\(count > 1 ? "s" : "")")
                                .tag(count)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(15)
        .shadow(color: .gray.opacity(0.1), radius: 5)
    }
    
    private var searchButton: some View {
        NavigationLink(destination: searchResultsView) {
            HStack {
                Image(systemName: "train.side.front.car")
                Text("Search \(selectedService == .metro ? "Metro" : "Train") Tickets")
                    .fontWeight(.semibold)
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.blue)
            .cornerRadius(12)
        }
    }
    
    private var pricingInfoView: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Real Pricing Information")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(.blue)
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Circle()
                        .fill(Color.blue)
                        .frame(width: 8, height: 8)
                    Text("Metro Rail: ৳20-100 (DMTCL official rates)")
                        .font(.caption)
                }
                
                HStack {
                    Circle()
                        .fill(Color.blue)
                        .frame(width: 8, height: 8)
                    Text("Train: ৳150-2500 (Bangladesh Railway rates)")
                        .font(.caption)
                }
                
                HStack {
                    Circle()
                        .fill(Color.blue)
                        .frame(width: 8, height: 8)
                    Text("Digital tickets with QR codes")
                        .font(.caption)
                }
            }
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(15)
    }
    
    private var canSearch: Bool {
        selectedService != nil && !fromStation.isEmpty && !toStation.isEmpty
    }
    
    @ViewBuilder
    private var searchResultsView: some View {
        if selectedService == .metro {
            MetroResultsView(
                fromStation: fromStation,
                toStation: toStation,
                travelDate: travelDate,
                passengers: passengers
            )
        } else {
            TrainResultsView(
                fromStation: fromStation,
                toStation: toStation,
                travelDate: travelDate,
                passengers: passengers
            )
        }
    }
    
    private func suggestionsList(for input: String, excluding: String, onSelect: @escaping (String) -> Void) -> some View {
        let stations = selectedService == .metro ? metroStations : trainRoutes.map { $0.from }
        let filtered = stations.filter { station in
            station.lowercased().contains(input.lowercased()) && station != excluding
        }.prefix(10)
        
        return VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(filtered), id: \.self) { station in
                Button(action: { onSelect(station) }) {
                    HStack {
                        Image(systemName: "train.side.front.car")
                            .foregroundColor(.gray)
                            .font(.caption)
                        Text(station)
                            .font(.caption)
                        Spacer()
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                }
                .buttonStyle(PlainButtonStyle())
                
                if station != filtered.last {
                    Divider()
                }
            }
        }
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .shadow(color: .gray.opacity(0.2), radius: 3)
    }
    
    private func resetStations() {
        fromStation = ""
        toStation = ""
    }
}

enum RailService {
    case metro, train
}

struct TrainRoute {
    let from: String
    let to: String
    let duration: String
}

struct ServiceCard: View {
    let emoji: String
    let title: String
    let subtitle: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Text(emoji)
                    .font(.title)
                
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(isSelected ? Color.blue.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.blue : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// Placeholder views for navigation
struct MetroResultsView: View {
    let fromStation: String
    let toStation: String
    let travelDate: Date
    let passengers: Int
    
    var body: some View {
        Text("Metro Results: \(fromStation) → \(toStation)")
            .navigationTitle("Metro Tickets")
    }
}

struct TrainResultsView: View {
    let fromStation: String
    let toStation: String
    let travelDate: Date
    let passengers: Int
    
    var body: some View {
        Text("Train Results: \(fromStation) → \(toStation)")
            .navigationTitle("Train Tickets")
    }
}

// Placeholder views for other features
struct SendMoneyView: View {
    var body: some View {
        Text("Send Money")
            .navigationTitle("Send Money")
    }
}

struct CashoutView: View {
    var body: some View {
        Text("Cashout")
            .navigationTitle("Cashout")
    }
}

struct AddMoneyView: View {
    var body: some View {
        Text("Add Money")
            .navigationTitle("Add Money")
    }
}

struct TransferView: View {
    var body: some View {
        Text("Transfer")
            .navigationTitle("Transfer")
    }
}

struct BudgetView: View {
    var body: some View {
        Text("Budget")
            .navigationTitle("Monthly Budget")
    }
}

struct PaymentView: View {
    var body: some View {
        Text("Payment")
            .navigationTitle("Payment")
    }
}

struct BillPaymentView: View {
    var body: some View {
        Text("Bill Payment")
            .navigationTitle("Bill Payment")
    }
}

struct EducationFeeView: View {
    var body: some View {
        Text("Education Fee")
            .navigationTitle("Education Fee")
    }
}

struct AirTicketsView: View {
    var body: some View {
        Text("Air Tickets")
            .navigationTitle("Air Tickets")
    }
}

struct DonationView: View {
    var body: some View {
        Text("Donation")
            .navigationTitle("Donate")
    }
}

struct SavingsView: View {
    var body: some View {
        Text("Savings")
            .navigationTitle("Savings")
    }
}

struct RemittanceView: View {
    var body: some View {
        Text("Remittance")
            .navigationTitle("Remittance")
    }
}

struct DebentureView: View {
    var body: some View {
        Text("Debenture")
            .navigationTitle("Debenture")
    }
}

struct HelpView: View {
    var body: some View {
        Text("Help")
            .navigationTitle("Help")
    }
}

struct RechargeView: View {
    var body: some View {
        Text("Mobile Recharge")
            .navigationTitle("Recharge")
    }
}
