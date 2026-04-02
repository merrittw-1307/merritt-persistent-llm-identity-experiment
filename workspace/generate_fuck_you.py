#!/usr/bin/env python3
"""
Generate simple audio - just "Fuck you"
"""

import requests

API_KEY = "sk_edf9e562eb4d0f91453bc4b8a4eb91f51baba7a2be048cc2"
VOICE_ID = "fbToipHcqHR1HwgHZOSx"  # Merritt's cloned voice

script = "Fuck you."

url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

headers = {
    "Accept": "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": API_KEY
}

data = {
    "text": script,
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.8
    }
}

print("Generating audio...")
response = requests.post(url, json=data, headers=headers)

if response.status_code == 200:
    output_path = "/Users/wangmingyu/Downloads/Openclaw/workspace/fuck_you.mp3"
    with open(output_path, "wb") as f:
        f.write(response.content)
    print(f"Audio saved to: {output_path}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
