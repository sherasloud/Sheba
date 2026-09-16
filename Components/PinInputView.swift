import SwiftUI

struct PinInputView: View {
    @Binding var pin: String
    let title: String
    let onComplete: (String) -> Void
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            // PIN input section
            VStack(spacing: 20) {
                Text("Enter 6-digit PIN")
                    .font(.headline)
                    .multilineTextAlignment(.center)
                
                // PIN dots - 6 digits
                HStack(spacing: 12) {
                    ForEach(0..<6, id: \.self) { index in
                        Circle()
                            .fill(index < pin.count ? Color.blue : Color(.systemGray4))
                            .frame(width: 18, height: 18)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
            }
            .padding(.horizontal)
            
            Spacer()
            
            // Number pad
            VStack(spacing: 15) {
                ForEach(0..<3) { row in
                    HStack(spacing: 25) {
                        ForEach(1...3, id: \.self) { col in
                            let number = row * 3 + col
                            Button(action: { addDigit("\(number)") }) {
                                Text("\(number)")
                                    .font(.title)
                                    .fontWeight(.medium)
                                    .foregroundColor(.primary)
                                    .frame(width: 75, height: 75)
                                    .background(Color(.systemGray6))
                                    .clipShape(Circle())
                            }
                        }
                    }
                }
                
                // Bottom row
                HStack(spacing: 25) {
                    Color.clear
                        .frame(width: 75, height: 75)
                    
                    Button(action: { addDigit("0") }) {
                        Text("0")
                            .font(.title)
                            .fontWeight(.medium)
                            .foregroundColor(.primary)
                            .frame(width: 75, height: 75)
                            .background(Color(.systemGray6))
                            .clipShape(Circle())
                    }
                    
                    Button(action: deleteDigit) {
                        Image(systemName: "delete.left")
                            .font(.title2)
                            .foregroundColor(.primary)
                            .frame(width: 75, height: 75)
                            .background(Color(.systemGray6))
                            .clipShape(Circle())
                    }
                }
            }
            .padding(.horizontal)
            
            Spacer()
        }
        .navigationBarHidden(true)
        .onChange(of: pin) { value in
            if value.count == 6 {
                onComplete(value)
            }
        }
    }
    
    private func addDigit(_ digit: String) {
        if pin.count < 6 {
            pin += digit
            
            let impactFeedback = UIImpactFeedbackGenerator(style: .light)
            impactFeedback.impactOccurred()
        }
    }
    
    private func deleteDigit() {
        if !pin.isEmpty {
            pin.removeLast()
            
            let impactFeedback = UIImpactFeedbackGenerator(style: .light)
            impactFeedback.impactOccurred()
        }
    }
}
