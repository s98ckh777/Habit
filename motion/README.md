# Haebit Korean Medicine Hospital promo motion graphic (`motion/`)

A 40-second, 16:9 (1920×1080) promo motion graphic with no sound. It is separate from the website (`site/`).

## Files
| File | Contents |
|---|---|
| `habit-365.mp4` | Finished video (30fps, H.264). Use this file for upload or playback |
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
| 17.6–23.6s | Treatments | Acupuncture · Chuna · pharmacopuncture · herbal medicine / laser skin care · new-skin acupuncture · skin booster (line icons drawn on) |
| 23.6–28.4s | Main care areas | Post-surgery rehab, cancer patient care · immunotherapy, pain treatment, car accident treatment, fracture patient care |
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
4. Make the video: `node render.mjs` (about 10 minutes, needs Playwright and ffmpeg). Use `--fps 60` for 60 frames.

Each scene's start and end times are in the `render(t)` function at the bottom of `index.html`, under comments like `// ---- S3 ----`.

## Before use
- Videos are also subject to medical advertising review. Before using it as an ad (YouTube ads, outdoor displays, etc.), check whether it needs review.
- Music isn't included. If you add music in CapCut or similar, use music cleared for commercial use.
