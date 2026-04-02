#!/usr/bin/env python3
"""
Request camera permission using AVFoundation
"""

import sys
import time
from Foundation import NSObject
from AVFoundation import AVCaptureDevice, AVMediaTypeVideo

def check_authorization():
    """Check current camera authorization status"""
    status = AVCaptureDevice.authorizationStatusForMediaType_(AVMediaTypeVideo)
    # 0 = not determined, 1 = restricted, 2 = denied, 3 = authorized
    return status

def request_camera_access():
    """Request camera access and wait for user response"""
    
    status = check_authorization()
    
    if status == 3:
        print("✅ Camera access already granted!")
        return True
    elif status == 2:
        print("❌ Camera access denied")
        return False
    elif status == 1:
        print("⚠️ Camera access restricted")
        return False
    
    # Status 0 = not determined, need to request
    print("🎥 Requesting camera access...")
    print("👉 Please look for a system dialog and click 'Allow'")
    
    # Request access
    AVCaptureDevice.requestAccessForMediaType_completionHandler_(
        AVMediaTypeVideo,
        lambda granted: print(f"\nAccess {'GRANTED ✅' if granted else 'DENIED ❌'}")
    )
    
    # Wait for user response
    for i in range(15):
        time.sleep(1)
        new_status = check_authorization()
        if new_status == 3:
            print("✅ Camera access granted!")
            return True
        elif new_status == 2:
            print("❌ Camera access was denied")
            return False
    
    print("⏱️ Timeout waiting for permission")
    return False

if __name__ == "__main__":
    granted = request_camera_access()
    sys.exit(0 if granted else 1)
