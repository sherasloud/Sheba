import SwiftUI

struct SIMDetectionView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var isDetecting = true
    @State private var detectionStep = 0
    @State private var detectedSIM: SIMInfo?
    @State private var showError = false
    @State private var errorMessage = ""
    
    @State private var confirmedPhoneNumber = ""
    @State private var showPhoneConfirmation = false
    
    private let detectionSteps = [
        "Checking device permissions...",
        "Scanning for SIM cards...",
        "Reading SIM information...",
        "Validating phone numbers...",
        "Detection complete!"
    ]
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: {}) {
                    Image(systemName: "arrow.left")
                        .foregroundColor(.white)
                        .font(.title2)
                }
                
                Text("SIM Detection")
                    .font(.title2)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                
                Spacer()
            }
            .padding()
            .background(Color(red: 0.16, green: 0.66, blue: 0.92))
            
            if isDetecting {
                detectionView
            } else if let sim = detectedSIM {
                detectedView(sim: sim)
            } else {
                errorView
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            startSIMDetection()
        }
    }
    
    private var detectionView: some View {
        VStack(spacing: 30) {
            Spacer()
            
            // Animated detection indicator
            ZStack {
                Circle()
                    .stroke(Color(red: 0.16, green: 0.66, blue: 0.92).opacity(0.3), lineWidth: 4)
                    .frame(width: 120, height: 120)
                
                Circle()
                    .trim(from: 0, to: 0.3)
                    .stroke(Color(red: 0.16, green: 0.66, blue: 0.92), lineWidth: 4)
                    .frame(width: 120, height: 120)
                    .rotationEffect(.degrees(Double(detectionStep) * 72))
                    .animation(.linear(duration: 1).repeatForever(autoreverses: false), value: detectionStep)
                
                Image(systemName: "antenna.radiowaves.left.and.right")
                    .font(.system(size: 40))
                    .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
            }
            
            VStack(spacing: 10) {
                Text("Detecting SIM Cards")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Please wait while we scan your device for SIM cards...")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            // Detection steps
            VStack(spacing: 15) {
                ForEach(0..<detectionSteps.count, id: \.self) { index in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(stepColor(for: index))
                            .frame(width: 24, height: 24)
                            .overlay(
                                stepIcon(for: index)
                            )
                        
                        Text(detectionSteps[index])
                            .font(.subheadline)
                            .foregroundColor(index <= detectionStep ? .primary : .gray)
                        
                        Spacer()
                    }
                }
            }
            .padding(.horizontal)
            
            Spacer()
            
            Text("This process requires access to your device's SIM information")
                .font(.caption)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
    }
    
    private var detectedView: some View {
        VStack(spacing: 30) {
            Spacer()
            
            // Success icon
            Circle()
                .fill(Color.green)
                .frame(width: 80, height: 80)
                .overlay(
                    Image(systemName: "checkmark")
                        .font(.largeTitle)
                        .foregroundColor(.white)
                )
            
            VStack(spacing: 10) {
                Text("SIM Card Detected")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Carrier: \(detectedSIM?.carrier ?? "Unknown")")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            
            VStack(spacing: 15) {
                Text("Confirm Your Phone Number")
                    .font(.headline)
                
                TextField("Enter your phone number", text: $confirmedPhoneNumber)
                    .keyboardType(.phonePad)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(10)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color(red: 0.16, green: 0.66, blue: 0.92), lineWidth: 1)
                    )
                
                Text("This number will be locked to this device")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding()
            
            Spacer()
            
            VStack(spacing: 10) {
                Button(action: {
                    if !confirmedPhoneNumber.isEmpty {
                        authManager.lockDeviceToPhoneNumber(confirmedPhoneNumber)
                        authManager.setPhoneNumber(confirmedPhoneNumber)
                    }
                }) {
                    NavigationLink(destination: LoginView()) {
                        Text("Continue with \(confirmedPhoneNumber.isEmpty ? "This Number" : confirmedPhoneNumber)")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(confirmedPhoneNumber.isEmpty ? Color.gray : Color(red: 0.16, green: 0.66, blue: 0.92))
                            .cornerRadius(10)
                    }
                }
                .disabled(confirmedPhoneNumber.isEmpty)
                
                Button("Scan Again") {
                    startSIMDetection()
                }
                .font(.caption)
                .foregroundColor(.gray)
                .padding(.top, 5)
            }
        }
        .padding()
    }
    
    private var errorView: some View {
        VStack(spacing: 30) {
            Spacer()
            
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 60))
                .foregroundColor(.orange)
            
            VStack(spacing: 10) {
                Text("Detection Failed")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text(errorMessage)
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            Spacer()
            
            VStack(spacing: 10) {
                Button("Try Again") {
                    startSIMDetection()
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(red: 0.16, green: 0.66, blue: 0.92))
                .cornerRadius(10)
                
                NavigationLink(destination: LoginView()) {
                    Text("Enter Number Manually")
                        .font(.subheadline)
                        .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.clear)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Color(red: 0.16, green: 0.66, blue: 0.92), lineWidth: 1)
                        )
                }
            }
        }
        .padding()
    }
    
    private func stepColor(for index: Int) -> Color {
        if index < detectionStep {
            return .green
        } else if index == detectionStep {
            return Color(red: 0.16, green: 0.66, blue: 0.92)
        } else {
            return .gray.opacity(0.3)
        }
    }
    
    private func stepIcon(for index: Int) -> some View {
        Group {
            if index < detectionStep {
                Image(systemName: "checkmark")
                    .font(.caption)
                    .foregroundColor(.white)
            } else if index == detectionStep {
                Circle()
                    .fill(Color.white)
                    .frame(width: 8, height: 8)
                    .scaleEffect(1.2)
                    .animation(.easeInOut(duration: 0.8).repeatForever(), value: detectionStep)
            } else {
                Circle()
                    .fill(Color.white)
                    .frame(width: 8, height: 8)
            }
        }
    }
    
    private func startSIMDetection() {
        isDetecting = true
        detectionStep = 0
        showError = false
        
        Task {
            for step in 0..<detectionSteps.count {
                await MainActor.run {
                    detectionStep = step
                }
                
                try? await Task.sleep(nanoseconds: 1_500_000_000) // 1.5 seconds
                
                if step == 2 {
                    // Simulate SIM detection
                    let sim = await authManager.detectSIM()
                    await MainActor.run {
                        detectedSIM = sim
                    }
                }
            }
            
            await MainActor.run {
                isDetecting = false
            }
        }
    }
}

struct SIMInfo {
    var simSlot: String
    var carrier: String
    var phoneNumber: String
    var isActive: Bool
    var signalStrength: Int
}
