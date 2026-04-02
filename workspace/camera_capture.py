#!/usr/bin/env python3
"""
Camera capture script for OpenClaw
Usage: python3 camera_capture.py [output_path] [warmup_seconds]
"""

import cv2
import sys
import time

def capture_image(output_path="~/Desktop/snapshot.jpg", warmup=2.0):
    """Capture an image from the default camera."""
    
    # Expand the path
    output_path = os.path.expanduser(output_path)
    
    # Open the default camera (0)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("ERROR: Could not open camera", file=sys.stderr)
        sys.exit(1)
    
    # Wait for warmup (camera to adjust exposure/focus)
    time.sleep(warmup)
    
    # Read a frame
    ret, frame = cap.read()
    
    if not ret:
        print("ERROR: Could not read frame from camera", file=sys.stderr)
        cap.release()
        sys.exit(1)
    
    # Save the image
    cv2.imwrite(output_path, frame)
    print(f"Image saved to: {output_path}")
    
    # Release the camera
    cap.release()
    
    return output_path

if __name__ == "__main__":
    import os
    
    output = sys.argv[1] if len(sys.argv) > 1 else "~/Desktop/snapshot.jpg"
    warmup = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0
    
    capture_image(output, warmup)
