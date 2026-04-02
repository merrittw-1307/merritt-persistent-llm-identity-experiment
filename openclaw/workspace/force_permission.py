#!/usr/bin/env python3
"""
Force camera permission request for Terminal
"""

import subprocess
import sys
import time

# Method 1: Try using AVFoundation directly via PyObjC
try:
    from Foundation import NSObject
    from AVFoundation import AVCaptureDevice, AVMediaTypeVideo
    import threading
    
    access_granted = None
    
    def check_access():
        global access_granted
        status = AVCaptureDevice.authorizationStatusForMediaType_(AVMediaTypeVideo)
        if status == 3:  # Authorized
            access_granted = True
        elif status == 2:  # Denied
            access_granted = False
        print(f"Camera authorization status: {status}")
    
    # Check current status
    check_access()
    
    if access_granted is None:
        # Request access
        AVCaptureDevice.requestAccessForMediaType_completionHandler_(
            AVMediaTypeVideo,
            lambda granted: print(f"Access {'granted' if granted else 'denied'}")
        )
        
        # Wait for user response
        print("Please check for a permission dialog and click 'Allow'")
        for i in range(10):
            time.sleep(1)
            check_access()
            if access_granted is not None:
                break
    
    if access_granted:
        print("SUCCESS: Camera access granted!")
    else:
        print("Camera access not granted yet")
        
except ImportError as e:
    print(f"PyObjC not available: {e}")
    print("Trying alternative method...")
    
    # Method 2: Use ffmpeg
    result = subprocess.run(['which', 'ffmpeg'], capture_output=True)
    if result.returncode == 0:
        print("Using ffmpeg to trigger permission...")
        subprocess.Popen(
            ['ffmpeg', '-f', 'avfoundation', '-list_devices', 'true', '-i', ''],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        time.sleep(2)
    
    # Method 3: Try to capture with OpenCV
    print("Trying OpenCV...")
    import cv2
    cap = cv2.VideoCapture(0)
    if cap.isOpened():
        ret, frame = cap.read()
        if ret:
            print("SUCCESS! Camera is accessible")
            cap.release()
        else:
            print("Camera opened but couldn't read frame")
    else:
        print("Could not open camera")
