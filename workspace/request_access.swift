import AVFoundation
import Foundation

// Request camera access
let mediaType = AVMediaType.video

AVCaptureDevice.requestAccess(for: mediaType) { granted in
    if granted {
        print("Camera access GRANTED!")
        
        // Try to capture
        let session = AVCaptureSession()
        session.sessionPreset = .photo
        
        guard let device = AVCaptureDevice.default(for: .video) else {
            print("No camera found")
            exit(1)
        }
        
        do {
            let input = try AVCaptureDeviceInput(device: device)
            session.addInput(input)
            print("Camera ready!")
            exit(0)
        } catch {
            print("Error: \(error)")
            exit(1)
        }
    } else {
        print("Camera access DENIED")
        exit(1)
    }
}

// Wait for async callback
RunLoop.main.run(until: Date(timeIntervalSinceNow: 5.0))
