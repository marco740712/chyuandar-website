"""Create an original quiet, wordless sound bed. No samples or third-party music."""
import json
import math
import struct
import sys
import wave
from pathlib import Path

root = Path(__file__).resolve().parents[1]
work = Path(sys.argv[1])
scenes = json.loads((root / 'tools/japan-tax-refund-video.json').read_text())
duration = sum(s['seconds'] for s in scenes)
rate = 32000
chords = [(146.832, 184.997, 220), (123.471, 146.832, 184.997),
          (97.999, 123.471, 146.832), (110, 138.591, 164.814)]
notes = [293.665, 369.994, 440.0, 587.33, 493.883, 440.0, 369.994, 329.628]
starts, elapsed = [], 0
for scene in scenes:
    starts.append(elapsed)
    elapsed += scene['seconds']
output = bytearray()
peak = 0
for i in range(int(duration * rate)):
    t = i / rate
    chord = chords[int(t / 6) % len(chords)]
    # Soft evolving pad and a sparse pentatonic pluck.
    value = sum(0.006 * math.sin(2 * math.pi * f * t) for f in chord)
    beat = int(t / 1.25)
    local = t % 1.25
    envelope = min(1, local / 0.015) * math.exp(-local * 5)
    f = notes[beat % len(notes)]
    value += 0.043 * envelope * (math.sin(2 * math.pi * f * local) + 0.15 * math.sin(4 * math.pi * f * local))
    for start in starts:
        dt = t - start
        if 0 <= dt < 0.65:
            value += 0.045 * min(1, dt / 0.015) * math.exp(-dt * 7) * math.sin(2 * math.pi * 880 * dt)
    value *= min(1, t / 0.4, (duration - t) / 1.4)
    peak = max(peak, abs(value))
    output.extend(struct.pack('<h', int(max(-1, min(1, value)) * 32767)))
with wave.open(str(work / 'original-sound.wav'), 'wb') as audio:
    audio.setnchannels(1)
    audio.setsampwidth(2)
    audio.setframerate(rate)
    audio.writeframes(output)
print(f'Original sound: {duration:.2f}s, peak {20 * math.log10(peak):.1f} dBFS')
