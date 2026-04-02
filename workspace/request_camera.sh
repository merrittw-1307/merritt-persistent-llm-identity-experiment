#!/bin/bash
# Trigger camera permission request

echo "即将请求摄像头权限，请查看屏幕上的系统对话框..."

# Use osascript to trigger camera access
osascript << 'EOF'
tell application "System Events"
    display dialog "请点击'允许'以授予摄像头权限" buttons {"允许"} default button "允许"
end tell
EOF

# Try to access camera
python3 -c "
import cv2
cap = cv2.VideoCapture(0)
if cap.isOpened():
    ret, frame = cap.read()
    if ret:
        import os
        path = os.path.expanduser('~/Downloads/Openclaw/workspace/first_photo.jpg')
        cv2.imwrite(path, frame)
        print(f'Success! Photo saved to: {path}')
    cap.release()
"
