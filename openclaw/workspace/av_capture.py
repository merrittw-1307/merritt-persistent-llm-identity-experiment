#!/usr/bin/env python3
"""
Capture photo using AVFoundation directly
"""

import time
import os
from Foundation import NSObject, NSData
from AVFoundation import (
    AVCaptureSession, AVCaptureDevice, AVCaptureDeviceInput,
    AVCapturePhotoOutput, AVCapturePhotoSettings, AVMediaTypeVideo
)
from AppKit import NSImage

class PhotoCaptureDelegate(NSObject):
    def captureOutput_didFinishProcessingPhoto_error_(self, output, photo, error):
        if error:
            print(f"Error: {error}")
            return
        
        image_data = photo.fileDataRepresentation()
        if image_data:
            output_path = os.path.expanduser("~/Downloads/Openclaw/workspace/avphoto.jpg")
            image_data.writeToFile_atomically_(output_path, True)
            print(f"Photo saved to: {output_path}")

def capture_photo():
    # Check authorization
    auth_status = AVCaptureDevice.authorizationStatusForMediaType_(AVMediaTypeVideo)
    print(f"Auth status: {auth_status}")
    
    if auth_status == 0:  # Not determined
        print("Requesting permission...")
        AVCaptureDevice.requestAccessForMediaType_completionHandler_(
            AVMediaTypeVideo,
            lambda granted: print(f"Granted: {granted}")
        )
        time.sleep(2)
    
    if auth_status != 3 and AVCaptureDevice.authorizationStatusForMediaType_(AVMediaTypeVideo) != 3:
        print("Camera not authorized")
        return
    
    # Setup capture session
    session = AVCaptureSession()
    session.sessionPreset = "photo"
    
    device = AVCaptureDevice.defaultDeviceWithMediaType_(AVMediaTypeVideo)
    if not device:
        print("No camera found")
        return
    
    try:
        input_device = AVCaptureDeviceInput.deviceInputWithDevice_error_(device, None)[0]
        session.addInput_(input_device)
        
        output = AVCapturePhotoOutput()
        session.addOutput_(output)
        
        session.startRunning()
        time.sleep(2)  # Warmup
        
        settings = AVCapturePhotoSettings.photoSettings()
        delegate = PhotoCaptureDelegate.alloc().init()
        output.capturePhotoWithSettings_delegate_(settings, delegate)
        
        time.sleep(1)
        session.stopRunning()
        print("Capture complete")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    capture_photo()
