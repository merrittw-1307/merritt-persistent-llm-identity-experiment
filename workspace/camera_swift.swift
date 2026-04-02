import AVFoundation
import CoreImage
import AppKit

func capturePhoto() {
    let session = AVCaptureSession()
    session.sessionPreset = .photo
    
    guard let device = AVCaptureDevice.default(for: .video) else {
        print("ERROR: No camera available")
        exit(1)
    }
    
    do {
        let input = try AVCaptureDeviceInput(device: device)
        session.addInput(input)
        
        let output = AVCapturePhotoOutput()
        session.addOutput(output)
        
        session.startRunning()
        
        // Wait a bit for camera to warm up
        Thread.sleep(forTimeInterval: 2.0)
        
        let settings = AVCapturePhotoSettings()
        output.capturePhoto(with: settings, delegate: PhotoDelegate())
        
        // Keep running until photo is captured
        RunLoop.main.run(until: Date(timeIntervalSinceNow: 5.0))
        
    } catch {
        print("ERROR: \(error)")
        exit(1)
    }
}

class PhotoDelegate: NSObject, AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        if let error = error {
            print("ERROR: \(error)")
            exit(1)
        }
        
        guard let imageData = photo.fileDataRepresentation() else {
            print("ERROR: Could not get image data")
            exit(1)
        }
        
        let fileManager = FileManager.default
        let path = fileManager.homeDirectoryForCurrentUser.appendingPathComponent("Downloads/Openclaw/workspace/snapshot_swift.jpg")
        
        do {
            try imageData.write(to: path)
            print("Photo saved to: \(path.path)")
        } catch {
            print("ERROR saving: \(error)")
            exit(1)
        }
        
        exit(0)
    }
}

capturePhoto()
