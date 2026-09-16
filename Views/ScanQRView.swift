import SwiftUI

struct ScanQRView: View {
    var body: some View {
        VStack(spacing: 0) {
            // Header
            Text("Scan QR Code")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.white)
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color(red: 0.16, green: 0.66, blue: 0.92))
            
            // QR Scanner placeholder
            VStack(spacing: 30) {
                Spacer()
                
                // Scanner frame
                ZStack {
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color(red: 0.16, green: 0.66, blue: 0.92), lineWidth: 3)
                        .frame(width: 250, height: 250)
                    
                    // Corner indicators
                    VStack {
                        HStack {
                            Rectangle()
                                .fill(Color(red: 0.16, green: 0.66, blue: 0.92))
                                .frame(width: 30, height: 5)
                                .cornerRadius(2)
                            Spacer()
                            Rectangle()
                                .fill(Color(red: 0.16, green: 0.66, blue: 0.92))
                                .frame(width: 30, height: 5)
                                .cornerRadius(2)
                        }
                        Spacer()
                        HStack {
                            Rectangle()
                                .fill(Color(red: 0.16, green: 0.66, blue: 0.92))
                                .frame(width: 30, height: 5)
                                .cornerRadius(2)
                            Spacer()
                            Rectangle()
                                .fill(Color(red: 0.16, green: 0.66, blue: 0.92))
                                .frame(width: 30, height: 5)
                                .cornerRadius(2)
                        }
                    }
                    .frame(width: 250, height: 250)
                    
                    // QR code icon
                    Image(systemName: "qrcode")
                        .font(.system(size: 60))
                        .foregroundColor(.gray.opacity(0.3))
                }
                
                VStack(spacing: 10) {
                    Text("Position QR code within the frame")
                        .font(.headline)
                        .fontWeight(.medium)
                    
                    Text("The QR code will be scanned automatically")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                }
                
                Spacer()
                
                // Action buttons
                VStack(spacing: 15) {
                    Button("Upload from Gallery") {
                        // Handle gallery upload
                    }
                    .font(.subheadline)
                    .foregroundColor(Color(red: 0.16, green: 0.66, blue: 0.92))
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.clear)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color(red: 0.16, green: 0.66, blue: 0.92), lineWidth: 1)
                    )
                    
                    Button("My QR Code") {
                        // Show user's QR code
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(red: 0.16, green: 0.66, blue: 0.92))
                    .cornerRadius(10)
                }
                .padding(.horizontal)
            }
            .padding()
        }
        .navigationBarHidden(true)
    }
}
