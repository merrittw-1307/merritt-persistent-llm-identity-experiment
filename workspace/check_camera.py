#!/usr/bin/env python3
"""
Check camera authorization status and provide guidance
"""

from AVFoundation import AVCaptureDevice, AVMediaTypeVideo

status = AVCaptureDevice.authorizationStatusForMediaType_(AVMediaTypeVideo)

status_messages = {
    0: "Not Determined - Permission never requested",
    1: "Restricted - System restriction prevents access",
    2: "Denied - User denied permission",
    3: "Authorized - Camera access granted ✅"
}

print(f"Current camera status: {status}")
print(f"Meaning: {status_messages.get(status, 'Unknown')}")

if status == 2:
    print("\n⚠️ Camera permission was DENIED")
    print("\nTo fix this, you need to:")
    print("1. Open System Settings → Privacy & Security → Camera")
    print("2. Look for Terminal (or Python) in the list")
    print("3. Check the box next to it ✅")
    print("\nIf Terminal is not in the list:")
    print("- You may need to reset camera permissions")
    print("- Or try running this from a different terminal")
    
if status == 0:
    print("\nℹ️ Permission not requested yet")
    print("Run request_camera.py to trigger the permission dialog")
