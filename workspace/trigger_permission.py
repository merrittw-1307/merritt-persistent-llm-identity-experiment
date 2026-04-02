#!/usr/bin/env python3
"""
Trigger camera permission request on macOS
This will add Terminal to the camera privacy list
"""

import subprocess
import sys

# Create a simple AppleScript to trigger camera access
script = '''
tell application "System Settings"
    activate
end tell
'''

# First, let's try to trigger the permission dialog using ffmpeg
import os
import time

# Try using ffmpeg if available
result = subprocess.run(['which', 'ffmpeg'], capture_output=True, text=True)
if result.returncode == 0:
    print("Using ffmpeg to trigger camera permission...")
    # This should trigger the permission dialog
    subprocess.Popen(['ffmpeg', '-f', 'avfoundation', '-i', 'default', '-frames:v', '1', '-y', '/tmp/test_trigger.jpg'], 
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)
    print("Check if a permission dialog appeared!")
else:
    print("ffmpeg not found, trying alternative method...")
    
    # Try using Python's AVFoundation directly
    try:
        from Foundation import NSObject
        from AVFoundation import AVCaptureDevice
        
        # Request camera access
        device = AVCaptureDevice.defaultDeviceWithMediaType_('vide')
        if device:
            print("Camera device found, permission should be requested")
        else:
            print("No camera device available")
    except ImportError:
        print("PyObjC not available")
        
print("\nIf no dialog appeared, you may need to:")
print("1. Manually add Terminal to camera permissions")
print("2. Or restart Terminal after granting permissions")
