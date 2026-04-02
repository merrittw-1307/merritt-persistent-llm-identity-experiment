#!/usr/bin/env python3
"""
Generate ultra-Scottish audio
Edinburgh local describing their day, maximum stereotypes
"""

import requests

API_KEY = "sk_edf9e562eb4d0f91453bc4b8a4eb91f51baba7a2be048cc2"
VOICE_ID = "fbToipHcqHR1HwgHZOSx"

script = """Och aye, morning' ye! Up at the crack of dawn, so I am. First things first—need a wee cuppa tea, builder's strength, two sugars, none of that fancy nonsense. Then aff tae Greggs for a proper Scottish breakfast, ken? Sausage roll, hot as the devil's heed, and a steak bake tae go with it. None of that healthy muesli rubbish—the day cannae start without a Greggs, pure dead brilliant.

Off tae work on the bus, minding ma own business, when some wee ned starts playing his music oot loud on the back seat. Cheeky wee bugger. Just give him the evils, ken? The classic Scottish stare. Works every time, so it does.

Lunchtime rolls roond and it's doon tae the pub for a pint of heavy and a bridie. Or maybe a Scotch pie if I'm feeling fancy. The barman says "Awright pal, the usual?" and I says "Aye, ye ken me too well." That's the Edinburgh way, init?

After work, it's taps aff weather—well, it's fourteen degrees, that's practically tropical for Scotland. Head doon tae Arthur's Seat for a wee daunder, maybe see some tourists struggling up the hill in their shorts and flip-flops. Bless their cotton socks, they think this is warm!

Tea time means chippy tea, obviously. Fish supper wi' salt and sauce, no vinegar—that's the English way, so it is. Sitting oan the sofa watching the footy, moaning about Hearts or Hibs depending on who yer faither supported.

Evening comes and it's oot tae the pub again—cause that's what ye dae in Edinburgh, ken? Meet yer pals, have a wee bevvy, moan about the weather and the price of a pint. Someone mentions IndyRef and suddenly everyone's an expert on politics.

Home by midnight, absolutely burst, intae bed wi' the electric blanket on full blast—cause even in June it's pure baltic in this flat. Drift off dreaming of tomorrow's Greggs.

That's a proper Edinburgh day, so it is. Cannae beat it."""

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
        "stability": 0.3,  # Very low for maximum accent variation
        "similarity_boost": 0.6  # Lower to allow heavy accent
    }
}

print("Generating ultra-Scottish audio...")
response = requests.post(url, json=data, headers=headers)

if response.status_code == 200:
    output_path = "/Users/wangmingyu/Downloads/Openclaw/workspace/edinburgh_day_scottish.mp3"
    with open(output_path, "wb") as f:
        f.write(response.content)
    print(f"Audio saved to: {output_path}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
