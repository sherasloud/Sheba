import SwiftUI
import PhotosUI
import AVFoundation

struct VerificationView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var currentStep = 0
    @State private var selectedAge = 18
    @State private var fullName = ""
    @State private var documentNumber = ""
    @State private var dateOfBirth = ""
    @State private var selectedDocument: PhotosPickerItem?
    @State private var documentImage: UIImage?
    @State private var selfieImage: UIImage?
    @State private var showCamera = false
    @State private var showDocumentPicker = false
    @State private var isProcessing = false
    @State private var processingStep = 0
    @State private var showSuccess = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    private let processingSteps = [
        "Analyzing document...",
        "Verifying facial features...",
        "Cross-checking information...",
        "Finalizing verification..."
    ]
    
    var isStudentAccount: Bool {
        selectedAge < 18
    }
    
    var documentType: String {
        isStudentAccount ? "Birth Certificate" : "NID Card"
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Progress indicator
                progressIndicator
                
                ScrollView {
                    VStack(spacing: 24) {
                        switch currentStep {
                        case 0:
                            ageSelectionStep
                        case 1:
                            personalInfoStep
                        case 2:
                            documentUploadStep
                        case 3:
                            faceVerificationStep
                        case 4:
                            processingStep
                        default:
                            EmptyView()
                        }
                    }
                    .padding()
                }
                
                // Bottom button
                if currentStep < 4 {
                    bottomButton
                }
            }
            .navigationTitle("Account Verification")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
        .sheet(isPresented: $showCamera) {
            CameraView { image in
                selfieImage = image
                showCamera = false
            }
        }
        .photosPicker(isPresented: $showDocumentPicker, selection: $selectedDocument, matching: .images)
        .onChange(of: selectedDocument) { newValue in
            Task {
                if let data = try? await newValue?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    documentImage = image
                }
            }
        }
        .alert("Verification Complete!", isPresented: $showSuccess) {
            Button("Continue") {
                dismiss()
            }
        } message: {
            Text("Your account has been verified successfully! ৳30 bonus has been added to your account.")
        }
        .alert("Verification Failed", isPresented: $showError) {
            Button("Try Again") {
                currentStep = 0
                resetForm()
            }
        } message: {
            Text(errorMessage)
        }
    }
    
    private var progressIndicator: some View {
        HStack {
            ForEach(0..<5) { index in
                Circle()
                    .fill(index <= currentStep ? Color.blue : Color.gray.opacity(0.3))
                    .frame(width: 12, height: 12)
                
                if index < 4 {
                    Rectangle()
                        .fill(index < currentStep ? Color.blue : Color.gray.opacity(0.3))
                        .frame(height: 2)
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.05))
    }
    
    private var ageSelectionStep: some View {
        VStack(spacing: 20) {
            VStack(spacing: 8) {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.blue)
                
                Text("Select Your Age")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text("This helps us determine the required documents")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 16) {
                Picker("Age", selection: $selectedAge) {
                    ForEach(11...80, id: \.self) { age in
                        Text("\(age) years old").tag(age)
                    }
                }
                .pickerStyle(WheelPickerStyle())
                .frame(height: 120)
                
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: isStudentAccount ? "graduationcap.fill" : "person.fill")
                            .foregroundColor(isStudentAccount ? .green : .blue)
                        Text(isStudentAccount ? "Student Account" : "Regular Account")
                            .fontWeight(.medium)
                    }
                    
                    Text("Required: \(documentType) + Facial Verification")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(8)
            }
        }
    }
    
    private var personalInfoStep: some View {
        VStack(spacing: 20) {
            VStack(spacing: 8) {
                Image(systemName: "doc.text.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.green)
                
                Text("Personal Information")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text("Enter your details as shown in your \(documentType)")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Full Name")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    TextField("Enter your full name", text: $fullName)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text(isStudentAccount ? "Birth Certificate Number" : "NID Number")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    TextField(isStudentAccount ? "Enter birth certificate number" : "Enter NID number", text: $documentNumber)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.numberPad)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Date of Birth")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    TextField("DD/MM/YYYY", text: $dateOfBirth)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.numbersAndPunctuation)
                }
            }
        }
    }
    
    private var documentUploadStep: some View {
        VStack(spacing: 20) {
            VStack(spacing: 8) {
                Image(systemName: "camera.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.orange)
                
                Text("Upload \(documentType)")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text("Take a clear photo of your \(documentType.lowercased())")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 16) {
                if let documentImage = documentImage {
                    Image(uiImage: documentImage)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(height: 200)
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.green, lineWidth: 2)
                        )
                } else {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.gray.opacity(0.1))
                        .frame(height: 200)
                        .overlay(
                            VStack(spacing: 8) {
                                Image(systemName: "doc.text")
                                    .font(.system(size: 40))
                                    .foregroundColor(.gray)
                                
                                Text("No document uploaded")
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                        )
                }
                
                Button(action: {
                    showDocumentPicker = true
                }) {
                    HStack {
                        Image(systemName: "camera")
                        Text(documentImage == nil ? "Upload \(documentType)" : "Change Document")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                
                // Guidelines
                VStack(alignment: .leading, spacing: 4) {
                    Text("Guidelines:")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Text("• Ensure all text is clearly visible")
                    Text("• Avoid shadows and glare")
                    Text("• Take photo in good lighting")
                    Text("• Keep the document flat")
                }
                .font(.caption)
                .foregroundColor(.gray)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.yellow.opacity(0.1))
                .cornerRadius(8)
            }
        }
    }
    
    private var faceVerificationStep: some View {
        VStack(spacing: 20) {
            VStack(spacing: 8) {
                Image(systemName: "faceid")
                    .font(.system(size: 60))
                    .foregroundColor(.purple)
                
                Text("Facial Verification")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text("Take a selfie to verify your identity")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 16) {
                if let selfieImage = selfieImage {
                    Image(uiImage: selfieImage)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 200, height: 200)
                        .clipShape(Circle())
                        .overlay(
                            Circle()
                                .stroke(Color.green, lineWidth: 3)
                        )
                } else {
                    Circle()
                        .fill(Color.gray.opacity(0.1))
                        .frame(width: 200, height: 200)
                        .overlay(
                            VStack(spacing: 8) {
                                Image(systemName: "person.circle")
                                    .font(.system(size: 60))
                                    .foregroundColor(.gray)
                                
                                Text("No selfie taken")
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                        )
                }
                
                Button(action: {
                    showCamera = true
                }) {
                    HStack {
                        Image(systemName: "camera.fill")
                        Text(selfieImage == nil ? "Take Selfie" : "Retake Selfie")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.purple)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                
                // Guidelines
                VStack(alignment: .leading, spacing: 4) {
                    Text("Guidelines:")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Text("• Look directly at the camera")
                    Text("• Ensure your face is well-lit")
                    Text("• Remove sunglasses or hat")
                    Text("• Keep a neutral expression")
                }
                .font(.caption)
                .foregroundColor(.gray)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)
            }
        }
    }
    
    private var processingStep: some View {
        VStack(spacing: 30) {
            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .stroke(Color.blue.opacity(0.3), lineWidth: 8)
                        .frame(width: 100, height: 100)
                    
                    Circle()
                        .trim(from: 0, to: CGFloat(processingStep + 1) / 4)
                        .stroke(Color.blue, lineWidth: 8)
                        .frame(width: 100, height: 100)
                        .rotationEffect(.degrees(-90))
                        .animation(.easeInOut(duration: 0.5), value: processingStep)
                    
                    Image(systemName: "checkmark")
                        .font(.system(size: 40, weight: .bold))
                        .foregroundColor(.blue)
                        .opacity(processingStep == 3 ? 1 : 0)
                        .animation(.easeInOut(duration: 0.3), value: processingStep)
                }
                
                Text("AI Verification in Progress")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text(processingSteps[min(processingStep, processingSteps.count - 1)])
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .animation(.easeInOut(duration: 0.3), value: processingStep)
            }
            
            VStack(spacing: 12) {
                ForEach(0..<processingSteps.count, id: \.self) { index in
                    HStack {
                        Image(systemName: index <= processingStep ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(index <= processingStep ? .green : .gray)
                        
                        Text(processingSteps[index])
                            .font(.subheadline)
                            .foregroundColor(index <= processingStep ? .primary : .gray)
                        
                        Spacer()
                    }
                    .animation(.easeInOut(duration: 0.3), value: processingStep)
                }
            }
            .padding()
            .background(Color.gray.opacity(0.05))
            .cornerRadius(12)
        }
        .onAppear {
            startProcessing()
        }
    }
    
    private var bottomButton: some View {
        VStack {
            Button(action: nextStep) {
                Text(getButtonText())
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(isNextButtonEnabled() ? Color.blue : Color.gray)
                    .cornerRadius(12)
            }
            .disabled(!isNextButtonEnabled())
            .padding()
        }
        .background(Color.white)
        .shadow(color: .gray.opacity(0.2), radius: 5, x: 0, y: -2)
    }
    
    private func getButtonText() -> String {
        switch currentStep {
        case 0: return "Continue"
        case 1: return "Next"
        case 2: return "Next"
        case 3: return "Start Verification"
        default: return "Continue"
        }
    }
    
    private func isNextButtonEnabled() -> Bool {
        switch currentStep {
        case 0: return true
        case 1: return !fullName.isEmpty && !documentNumber.isEmpty && !dateOfBirth.isEmpty
        case 2: return documentImage != nil
        case 3: return selfieImage != nil
        default: return false
        }
    }
    
    private func nextStep() {
        if currentStep < 4 {
            withAnimation {
                currentStep += 1
            }
        }
    }
    
    private func startProcessing() {
        processingStep = 0
        
        Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { timer in
            if processingStep < 3 {
                processingStep += 1
            } else {
                timer.invalidate()
                completeVerification()
            }
        }
    }
    
    private func completeVerification() {
        let success = authManager.completeVerification(
            fullName: fullName,
            documentNumber: documentNumber,
            dateOfBirth: dateOfBirth,
            age: selectedAge
        )
        
        if success {
            showSuccess = true
        } else {
            errorMessage = "Verification failed. Please try again."
            showError = true
        }
    }
    
    private func resetForm() {
        fullName = ""
        documentNumber = ""
        dateOfBirth = ""
        documentImage = nil
        selfieImage = nil
        processingStep = 0
    }
}

struct CameraView: UIViewControllerRepresentable {
    let onImageCaptured: (UIImage) -> Void
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.cameraDevice = .front
        picker.delegate = context.coordinator
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraView
        
        init(_ parent: CameraView) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.onImageCaptured(image)
            }
            picker.dismiss(animated: true)
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            picker.dismiss(animated: true)
        }
    }
}
