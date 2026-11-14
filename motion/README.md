# Haebit Korean Medicine Hospital promo motion graphic (`motion/`)

A 40-second, 16:9 (1920×1080) promo motion graphic with background music. It is separate from the website (`site/`).

## Files
| File | Contents |
|---|---|
| `habit-365.mp4` | Finished video (30fps, H.264 + AAC background music). Use this file for upload or playback |
| `music.py` | Program that composes the background music directly in code (no samples or outside music) → `music.wav` |
| `music.m4a` | Background music adjusted to a suitable loudness (−16 LUFS). Also played by the sound button on the preview page |
| `index.html` | Source of the motion graphic. Opening it in a browser plays it in real time (space bar = pause) |
| `render.mjs` | Script that saves `index.html` as an MP4, frame by frame |
| `fonts/pretendard-motion.woff2` | Pretendard font (SIL OFL), cut down to only the characters used in the video |
| `logo-full.png` | Hospital logo (copy of `site/assets/img/logo-full.png`) |

## Scene order
| Time | Scene | Main lines |
|---|---|---|
| 0–6s | 365 days | "Pain doesn't keep office hours" → sun circles the 365-day ring, "Open on Saturdays, Sundays and public holidays" |
| 6–13s | Hours | Clock 09:00→21:00, sky goes day→sunset→night, "Every weekday until 9 pm", weekday/weekend hours cards |
| 13–17.6s | Medical staff | 7 Korean medicine doctors · 1 medical doctor, inpatient & outpatient care |
| 17.6–20.9s | Korean medicine treatments | Acupuncture · Chuna · pharmacopuncture · herbal medicine (line icons drawn on) |
| 20.9–25.6s | Main care areas | Post-surgery rehab, cancer patient care · immunotherapy, pain treatment, car accident treatment, fracture patient care |
| 25.7–28.4s | Skin & aesthetics | Laser skin care · new-skin acupuncture · skin booster |
| 28.4–33.4s | Our strengths | "We check for your discomfort first" (kind staff), explaining the cause of pain → treatment method → treatment plan in plain words |
| 33.4–40s | Closing | Sunrise, "Back to an ordinary, peaceful daily life" → the sun becomes the yellow circle in the logo, hours, phone, address |

## How to edit
1. Edit the text in `index.html` (search for the Korean sentence you want to change).
2. If you added **new characters** (Hangul) to the text, cut the font again (otherwise those characters show in a different font):
   ```bash
   pip install fonttools brotli
   python3 -c "s=open('index.html',encoding='utf-8').read();print(''.join(sorted(set(c for c in s if ord(c)>127)|set(map(chr,range(32,127)))|set('–·'))))" > /tmp/chars.txt
   pyftsubset PretendardVariable.ttf --text-file=/tmp/chars.txt --flavor=woff2 --layout-features='*' --output-file=fonts/pretendard-motion.woff2
   ```
   (`PretendardVariable.ttf` is in the `pretendard` npm package under `dist/public/variable/`)
3. Check timing with stills: `node render.mjs --stills 3,10,20` → saved to the `stills/` folder
4. Make the video: `python3 music.py` (music, ~10 sec) → `node render.mjs` (video + music combined, about 10 minutes, needs Playwright and ffmpeg). Use `--fps 60` for 60 frames.
   - To change only the music: `python3 music.py` → `node render.mjs --mux video-without-music.mp4`

Each scene's start and end times are in the `render(t)` function at the bottom of `index.html`, under comments like `// ---- S3 ----`.

## Before use
- Videos are also subject to medical advertising review. Before using it as an ad (YouTube ads, outdoor displays, etc.), check whether it needs review.
- The background music is composed directly in `music.py` (80 BPM, D major, piano · pad · bass · light percussion), so there are no copyright issues. Chords and instruments change to match the scene changes (sun appearing, 365 completing, nightfall, sunrise, logo).

## Music cue sheet (1 bar = 3s)
| Time | Music |
|---|---|
| 0–6s | Soft pad + high piano notes; bells when the sun appears and when 365 completes |
| 6–12s | 8th-note piano arpeggio like a ticking clock (softer at night) |
| 12–18s | Bass enters, swell at the circle transition, light shaker |
| 18–33s | Main melody + kick, bass, shaker |
| 33–36s | Percussion drops out, sunrise swell |
| 36–40s | Resolves to the home chord (D) + bells as the logo appears, fades out |
