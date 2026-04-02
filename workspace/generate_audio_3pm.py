#!/usr/bin/env python3
"""
Generate audio using ElevenLabs API - Updated time to 3 PM today
"""

import requests

API_KEY = "sk_edf9e562eb4d0f91453bc4b8a4eb91f51baba7a2be048cc2"
VOICE_ID = "fbToipHcqHR1HwgHZOSx"  # Merritt's cloned voice

# The script with updated time
script = """Alex, please. I'm begging you. This afternoon, 3 PM, same place. Bring cigarettes. I'm not asking, I'm pleading.

I know you have those Marlboro Golds. Don't hide them. Bring two packs, I'll bring the lighter. We need to talk—not small talk, real talk. I don't care what you've been busy with, this afternoon your time belongs to me.

How long does a cigarette take? Twenty minutes? Thirty? You can find that time in your short video scrolling. But this cigarette is different. This is two people sitting down, lighter flicking, cigarette burning, and then we can say anything. Or nothing at all.

I don't need you to fix my problems. I don't need you to comfort me. I just need a real person, light a cigarette, watch the smoke rise, and say whatever comes to mind. You can sit there in silence, smoking yours, me smoking mine. That's enough.

You know those moments? When the cigarette's half-burned, words half-spoken, then we both stop and laugh. Those moments.

Today, 3 PM. Please don't be late—every minute late costs an extra cigarette. Don't be early either—I won't be ready to hear what you have to say. Just 3 PM, perfect timing.

Bring your stories, bring your troubles, or bring nothing at all—just cigarettes and fire. I'll have lighters ready here, plus two beers. Weather's not cold, we can sit outside or inside, you choose.

I don't want to talk every day, but today I do. Today I need to know you're still here, I'm still here, and we can still do this—meet when we say meet, smoke when we say smoke. That's rare, you know?

So please, today, 3 PM. Will you come? Please say yes. I'm asking you, as a friend, as someone who needs this. Don't make me beg more than I already am.

Three. Today. Please."""

# ElevenLabs API endpoint
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

# Generate audio
print("Generating audio...")
response = requests.post(url, json=data, headers=headers)

if response.status_code == 200:
    output_path = "/Users/wangmingyu/Downloads/Openclaw/workspace/alex_smoke_pleading_3pm.mp3"
    with open(output_path, "wb") as f:
        f.write(response.content)
    print(f"Audio saved to: {output_path}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
