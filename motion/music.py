"""Background music for the 40-second motion graphic (numpy only, no samples).

80 BPM, 4/4 -> one bar = 3 s. Key: D major. Progression per bar follows the scenes:
 0 Dmaj7 | 1 A/C# | 2 Bm7 | 3 Gmaj7 | 4 Dmaj7 | 5 A/C# | 6 Bm7 | 7 Gmaj7 | 8 Dmaj7 | 9 A/C# | 10 Bm7 | 11 G -> A | 12 Dmaj9 (ending)
Output: music.wav (44.1 kHz stereo). Run: python3 music.py
"""
import wave
import numpy as np

SR = 44100
DUR = 40.0
BPM = 80
BEAT = 60 / BPM            # 0.75 s
BAR = 4 * BEAT             # 3.0 s
N = int(SR * (DUR + 4))
rng = np.random.default_rng(365)

dry = np.zeros((2, N))
wet = np.zeros((2, N))     # reverb send


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(sig, t0, pan=0.0, gain=1.0, send=0.3):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    for buf, amt in ((dry, 1.0), (wet, send)):
        buf[0, i:i + len(sig)] += sig * l * amt
        buf[1, i:i + len(sig)] += sig * r * amt


# ---------- instruments ----------
def piano(m, dur, vel=0.6):
    """Soft felt-piano tone: inharmonic partials, faster decay for upper partials, damper on release."""
    f = hz(m)
    L = dur + 0.9
    t = np.arange(int(L * SR)) / SR
    out = np.zeros_like(t)
    bright = 0.6 + 0.6 * vel
    for k in range(1, 11):
        fk = k * f * np.sqrt(1 + 0.0003 * k * k)
        if fk > 12000:
            break
        a = (1 / k ** (2.0 - bright)) * np.exp(-t * (0.7 + 0.55 * k) * (0.6 + f / 900))
        for d in (-0.0007, 0.0007):
            out += a * np.sin(2 * np.pi * fk * (1 + d) * t + k)
    out *= np.minimum(1, t / 0.004)
    out *= np.where(t > dur, np.exp(-(t - dur) * 7), 1.0)
    click = rng.standard_normal(len(t)) * np.exp(-t * 300) * 0.02
    return (out / 6 + click) * vel


def pad(notes, dur, att=0.9, rel=1.8):
    L = dur + rel
    t = np.arange(int(L * SR)) / SR
    out = np.zeros_like(t)
    for m in notes:
        f = hz(m)
        for cents in (-7, 0, 7):
            fd = f * 2 ** (cents / 1200)
            ph = rng.uniform(0, 6.28)
            for k in range(1, 9):
                if fd * k > 6000:
                    break
                out += np.sin(2 * np.pi * fd * k * t + ph * k) / k ** 2.1
    env = np.minimum(1, t / att) * np.where(t > dur, np.exp(-(t - dur) * 3 / rel), 1.0)
    env *= 1 + 0.06 * np.sin(2 * np.pi * 0.25 * t)
    return out * env / (len(notes) * 3)


def bass(m, dur, vel=0.8):
    f = hz(m)
    L = dur + 0.25
    t = np.arange(int(L * SR)) / SR
    out = sum(a * np.sin(2 * np.pi * f * k * t) for k, a in ((1, 1), (2, .38), (3, .14), (4, .05)))
    env = np.minimum(1, t / 0.01) * (0.65 + 0.35 * np.exp(-t * 5)) * np.where(t > dur, np.exp(-(t - dur) * 25), 1.0)
    return out * env * vel


def kick(vel=1.0):
    t = np.arange(int(0.45 * SR)) / SR
    f = 46 + 70 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 8) * np.minimum(1, t / 0.002) * vel


def shaker(vel=1.0):
    n = rng.standard_normal(int(0.09 * SR))
    n = np.diff(np.diff(n, prepend=0), prepend=0)
    t = np.arange(len(n)) / SR
    return n * np.minimum(1, t / 0.006) * np.exp(-t * 55) * 0.12 * vel


def bell(m, vel=0.5, L=3.5):
    f = hz(m)
    t = np.arange(int(L * SR)) / SR
    idx = 2.2 * np.exp(-t * 2.5)
    sig = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 3.5 * t))
    sig += 0.3 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 2)
    return sig * np.exp(-t * 1.4) * np.minimum(1, t / 0.003) * vel


def noise_swell(L, peak_at, lo=200, hi=5000):
    n = rng.standard_normal(int(L * SR))
    F = np.fft.rfft(n)
    fr = np.fft.rfftfreq(len(n), 1 / SR)
    F *= ((fr > lo) & (fr < hi)) / np.sqrt(np.maximum(fr, 50) / 50)
    n = np.fft.irfft(F, len(n))
    n /= np.abs(n).max()
    t = np.arange(len(n)) / SR
    env = np.where(t < peak_at, (t / peak_at) ** 2.5, np.exp(-(t - peak_at) * 6))
    return n * env


# ---------- harmony ----------
D, Acs, Bm, G, Asus, A = 'D', 'Acs', 'Bm', 'G', 'Asus', 'A'
PAD = {D: [50, 57, 61, 66, 69], Acs: [49, 57, 61, 64, 69], Bm: [47, 54, 57, 62, 66],
       G: [43, 50, 54, 59, 62], Asus: [45, 52, 57, 62, 64], A: [45, 52, 57, 61, 64], 'D9': [50, 57, 61, 64, 66, 69]}
ARP = {D: [62, 66, 69, 73, 74, 73, 69, 66], Acs: [61, 64, 69, 71, 73, 71, 69, 64], Bm: [62, 66, 69, 71, 74, 71, 69, 66],
       G: [62, 66, 67, 71, 74, 71, 67, 66], Asus: [62, 64, 69, 71, 74, 71, 69, 64], A: [61, 64, 69, 73, 76, 73, 69, 64]}
BASS = {D: 38, Acs: 37, Bm: 35, G: 31, Asus: 33, A: 33}
PROG = [D, Acs, Bm, G, D, Acs, Bm, G, D, Acs, Bm, G]

# pad: bars 0-11, then final chord
for b, ch in enumerate(PROG):
    if b == 11:
        place(pad(PAD[G], BAR / 2), b * BAR, gain=0.55, send=0.5)
        place(pad(PAD[Asus], BAR / 4, att=0.3), b * BAR + BAR / 2, gain=0.55, send=0.5)
        place(pad(PAD[A], BAR / 4, att=0.2), b * BAR + 3 * BEAT, gain=0.55, send=0.5)
    else:
        place(pad(PAD[ch], BAR, att=2.5 if b == 0 else 0.8), b * BAR, gain=0.42 if b < 4 else 0.55, send=0.5)
place(pad(PAD['D9'], 2.6, att=0.15, rel=2.5), 36.0, gain=0.7, send=0.6)

# intro: sparse high piano, one note per beat (bars 0-1)
intro = [(0, 81, 2), (2, 78, 1), (3, 76, 1), (4, 73, 2), (6, 76, 1), (7, 81, 1)]
for beat, m, d in intro:
    place(piano(m, d * BEAT, 0.35), 0.4 + beat * BEAT, pan=0.15, send=0.55)

# sun orbit (3.0-4.6 s): rising pentatonic shimmer that lands with the 365 count
shim = [74, 76, 78, 81, 83, 86, 88, 90, 93, 95, 98]
for i, m in enumerate(shim):
    place(bell(m, 0.10 + i * 0.012, 1.6), 3.05 + 1.5 * (i / len(shim)) ** 0.8, pan=-0.5 + i / len(shim), send=0.7)
place(bell(86, 0.35), 4.62, pan=0.2, send=0.7)
place(bell(93, 0.18), 4.66, pan=-0.2, send=0.8)
place(bell(86, 0.25), 0.25, pan=0, send=0.8)       # sun appears

# 8th-note arpeggio (the clock ticking) bars 2-10, softer at night (bar 3)
for b in range(2, 11):
    ch = PROG[b]
    for i, m in enumerate(ARP[ch]):
        acc = 0.42 if i % 2 == 0 else 0.3
        if b == 3:
            acc *= 0.8
        place(piano(m, BEAT * 0.9, acc), b * BAR + i * BEAT / 2, pan=0.35 if i % 2 else -0.35, gain=0.8, send=0.35)
# bar 11 arp: G then Asus/A
for i in range(8):
    ch = G if i < 4 else (Asus if i < 6 else A)
    place(piano(ARP[ch][i], BEAT * 0.9, 0.3), 33 + i * BEAT / 2, pan=0.35 if i % 2 else -0.35, gain=0.7, send=0.45)

# bass from bar 4
for b in range(4, 12):
    ch = PROG[b]
    if b == 11:
        place(bass(BASS[G], BEAT * 1.9), b * BAR, gain=0.32, send=0.05)
        place(bass(BASS[A], BEAT * 1.9), b * BAR + 2 * BEAT, gain=0.32, send=0.05)
        continue
    place(bass(BASS[ch], BEAT * 1.4), b * BAR, gain=0.32, send=0.05)
    place(bass(BASS[ch] + 12, BEAT * 0.45, 0.6), b * BAR + 1.5 * BEAT, gain=0.28, send=0.05)
    place(bass(BASS[ch], BEAT * 1.9), b * BAR + 2 * BEAT, gain=0.32, send=0.05)
place(bass(38, 3.4), 36.0, gain=0.38, send=0.1)

# drums: shaker 8ths from bar 5, kick half-time + 16th shaker from bar 6; out at bar 11 (sunrise)
for b in range(5, 11):
    for i in range(8 if b == 5 else 16):
        step = BEAT / 2 if b == 5 else BEAT / 4
        v = (0.9 if i % 2 else 0.5) if b > 5 else (0.8 if i % 2 else 0.45)
        place(shaker(v), b * BAR + i * step, pan=0.4, gain=0.9, send=0.15)
    if b >= 6:
        place(kick(0.55), b * BAR, gain=0.5, send=0.03)
        place(kick(0.4), b * BAR + 2.5 * BEAT, gain=0.5, send=0.03)

# melody (bars 6-12)
MEL = {6: [(0, 78, 1.5), (1.5, 76, .5), (2, 74, 1), (3, 71, 1)],
       7: [(0, 74, 1.5), (1.5, 76, .5), (2, 78, 2)],
       8: [(0, 81, 1.5), (1.5, 78, .5), (2, 76, 1), (3, 74, 1)],
       9: [(0, 73, 1.5), (1.5, 74, .5), (2, 76, 2)],
       10: [(0, 78, 1.5), (1.5, 81, .5), (2, 83, 1), (3, 81, 1)],
       11: [(0, 79, 1.5), (1.5, 78, .5), (2, 76, 1), (3, 73, 1)],
       12: [(0, 74, 4)]}
for b, notes in MEL.items():
    for beat, m, d in notes:
        place(piano(m, d * BEAT, 0.62), b * BAR + beat * BEAT, pan=0.0, gain=1.0, send=0.4)
        place(piano(m + 12, d * BEAT, 0.18), b * BAR + beat * BEAT, pan=0.1, gain=1.0, send=0.5)

# transitions: soft swell into the night->ivory circle (12.6 s) and into the sunrise (33.2 s) and ending
place(noise_swell(1.3, 0.9), 12.0, gain=0.06, send=0.6)
place(noise_swell(2.6, 2.4, 300, 7000), 33.6, gain=0.05, send=0.6)
# logo: bell arpeggio when the logo appears (37.35 s)
for i, m in enumerate([74, 78, 81, 86]):
    place(bell(m + 12, 0.28 - i * 0.03, 3.2), 37.35 + i * 0.09, pan=-0.3 + i * 0.2, send=0.8)

# ---------- reverb (FFT convolution with a synthetic stereo hall) ----------
IRL = int(2.6 * SR)
tt = np.arange(IRL) / SR
wet_out = np.zeros_like(wet)
for ch in range(2):
    ir = rng.standard_normal(IRL) * np.exp(-tt * 6.9 / 2.4) * np.minimum(1, tt / 0.02)
    F = np.fft.rfft(ir)
    fr = np.fft.rfftfreq(IRL, 1 / SR)
    ir = np.fft.irfft(F / (1 + (fr / 5000) ** 2), IRL)  # darker tail
    ir /= np.sqrt(np.sum(ir ** 2))
    n = 1 << int(np.ceil(np.log2(N + IRL)))
    wet_out[ch] = np.fft.irfft(np.fft.rfft(wet[ch], n) * np.fft.rfft(ir, n), n)[:N]
mix = dry + 0.55 * wet_out

# ---------- master ----------
mix = mix[:, :int(DUR * SR)]
t = np.arange(mix.shape[1]) / SR
mix *= np.minimum(1, t / 0.05) * np.where(t > 38.2, np.cos(np.clip((t - 38.2) / 1.8, 0, 1) * np.pi / 2) ** 1.5, 1)
mix /= np.abs(mix).max()
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
pcm = (mix.T * 0.89 * 32767).astype('<i2')
with wave.open('music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('music.wav', mix.shape[1] / SR, 's')
