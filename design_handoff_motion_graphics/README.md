# Handoff: "How's It Going?" — Reel Motion Graphics

## Overview
A 51.5-second motion-graphics overlay for an Instagram reel about the
**How's It Going?** dashboard (https://mlorenzon.github.io/howsitgoing).
The overlay sits on top of pre-recorded camera footage of the host
speaking to camera; it animates titles, numbers, charts, and a verdict
summary in sync with the spoken transcript.

The current implementation runs in a browser as a real-time React
animation. **The goal of this handoff is to render the same motion as
discrete frames** (e.g. 1080×1920 @ 60fps PNG sequence, or a 4K
upscale, or a 2160×3840 alpha-PNG sequence) so it can be cut into
Premiere / After Effects at production quality — instead of being
screen-captured live.

## About the Design Files
The files in `source/` are a **design reference** — a working browser
prototype that defines the exact look, motion, and timing. They are not
meant to ship as-is. Your job is to port them into a frame-accurate
offline renderer so the output is:

- **Pixel-perfect at any resolution** (no browser scaling artifacts)
- **Frame-exact** (60fps deterministic, no dropped frames from screen capture)
- **Alpha-channel native** (ProRes 4444 or PNG sequence with true transparency, so we don't have to chroma-key)

The recommended path is **Remotion** (https://www.remotion.dev/) — it
is React-based and takes ~minutes to port to from this codebase. An
alternative path using **Puppeteer + a frame-stepping harness** is
documented at the bottom if Remotion isn't desired.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, motion curves,
and timing are all locked in. The developer should reproduce the
existing motion exactly, not redesign anything.

---

## What the overlay shows

### Format
- **Canvas**: 1080 × 1920 (9:16 vertical, Instagram Reel)
- **Safe overlay zone**: y = 1180 → 1880 (a 940 × 700 region in the lower
  third). The top two-thirds are occupied by the speaker's face and
  shoulders; nothing should render above y=1180.
- **Frame rate**: 60 fps
- **Duration**: 51.5 s (3090 frames)
- **Background**: transparent in final output. (In the browser preview
  it defaults to chroma green #00B140 for live screen-capture; the
  port should output true alpha and skip the key step.)

### Scene timeline
Times are seconds from the start of the speaker's audio.

| #  | Scene             | Start  | End    | Card color           | Status pill        |
|----|-------------------|--------|--------|----------------------|--------------------|
| 1  | Title             | 5.40   | 10.20  | —                    | —                  |
| 2  | Atmospheric CO₂   | 10.40  | 17.90  | Red (`#ef6a6a`)      | Worsening          |
| 3  | CO₂ annual rate   | 17.95  | 19.70  | Red                  | Accelerating       |
| 4  | Income inequality | 19.75  | 22.40  | Green (`#5cc28f`)    | Improving          |
| 5  | Wealth inequality | 22.50  | 28.50  | Amber (`#f0b342`)    | Mixed              |
| 6  | Housing affordability | 28.55 | 31.40 | Red                | Still a mess       |
| 7  | 4-up verdict      | 31.60  | 45.70  | White / Red CTA      | — ("not doing enough") |
| 8  | Link in bio       | 45.85  | 48.30  | —                    | —                  |
| 9  | "What's in YOUR dashboard?" | 48.40 | 51.50 | —          | —                  |

Word-level transcript timings are in `transcript-word-timings.tsv` and
the raw JSON is in `source/transcript.json` — these are what the scene
boundaries were tuned to.

### Scene-by-scene detail

Each chart scene shares the same card chrome ("Card" component in
`source/motion-scenes.jsx`):

- Position: `left: 70, top: 1180, width: 940, height: 700`
- Background: `#0e1118` (ink)
- Border: 1px `rgba(255,255,255,0.10)`, plus a 4px top stroke in the
  scene's status color
- Border-radius: 28px
- Box-shadow: `0 28px 60px rgba(0,0,0,0.35), 0 0 0 1px <color>22, 0 0 80px <color>33`
- Inner padding: 40px top / 44px sides / 36px bottom
- Children: flex column, 22px gap

**Scene 1 — Title** (5.4–10.2s)
- Eyebrow line: "GLOBAL INDICATORS · 2004 – 2025" — JetBrains Mono 22px,
  uppercase, letter-spacing 0.24em, color `rgba(246,244,239,0.62)`,
  preceded by a 60px-wide rule that slides in.
- H1: "How's it *going?*" — Helvetica 168px / 0.92 line-height,
  letter-spacing -0.045em. The word "going?" is italic in
  `rgba(246,244,239,0.62)`; the rest is `#f6f4ef`. Fades up with 30px
  upward slide.
- Subtitle: "A 20-year read on whether we're making progress." —
  JetBrains Mono 26px, color `rgba(246,244,239,0.38)`.

**Scene 2 — Atmospheric CO₂** (10.4–17.9s)
- Eyebrow: "Atmospheric CO₂ · Mauna Loa" (red)
- Animated SVG line chart, 22 yearly data points 2004–2025, domain
  370→432. Reference dashed line at y=400 with label "400 PPM (2015)".
  See `LineChart` component for animation: line strokes in over the
  first 55% of the chart's local progress (path-length stroke-dash
  reveal); area fill fades in 35–70%; end-tip dot pops at 55–75%;
  reference line fades in 45–65%.
- Big number: 427.35 PPM (Helvetica/JetBrains Mono 92px, red) — counts
  up from 0 with easeOutCubic. "PPM" suffix in 36px soft-grey.
- Delta badge: "▲ +49.65 ppm (+13.1%)" pill, red on red-15% fill.
- Status pill: "WORSENING" — red dot + outlined red pill, scales in
  with easeOutBack.

**Scene 3 — CO₂ annual rate** (17.95–19.7s)
- Eyebrow: "Annual increase, ppm / year" (red)
- Bar chart: 21 bars (year-on-year deltas of CO₂ series). Bars rise in
  staggered left-to-right with easeOutCubic. A dashed white trendline
  is drawn across them at 55–95% progress.
- Big text: "Also going up." (Helvetica 64px white)
- Status pill: "ACCELERATING"

**Scene 4 — Income inequality** (19.75–22.4s)
- Eyebrow: "Income inequality · Australia" (green)
- LineChart: 20 points 2004–2023, domain 30.5→36, green.
- Big number: 32.30 GINI (green)
- Delta badge: "▼ -0.80 (-2.4%)" in green
- Status pill: "IMPROVING"

**Scene 5 — Wealth inequality** (22.5–28.5s)
- Eyebrow: "Wealth inequality · Australia" (amber)
- LineChart: 20 points, domain 58→68, amber. The **last 3 points are
  re-stroked in green** on top of the amber line (the "highlightLastN"
  prop on `LineChart`) and fade in at progress 50–70%.
- Big number: 65.60 GINI (amber)
- Delta badge: "▲ +5.80 (+9.7%)" in amber
- Status pill: "MIXED" — plus a green italic tagline "…turning a
  corner?" that slides in from the left at 3.0–3.6s into the scene.

**Scene 6 — Housing affordability** (28.55–31.4s)
- Eyebrow: "Housing affordability · Australia" (red)
- LineChart: 21 points 2004–2024, domain 5→10.5, red. Reference dashed
  line at y=5 labelled `"Severely unaffordable" (5×)`.
- Big number: 9.30× (red)
- Delta badge: "▲ +2.80× (+43.1%)"
- Status pill: "STILL A MESS"

**Scene 7 — Verdict summary** (31.6–45.7s)
- Eyebrow: "THE VERDICT" (white)
- Four list rows, each with: a glowing colored dot (22px, with 18px
  blur), the indicator name (Helvetica 30px / 600), the status (mono
  22px in the indicator's color, uppercase), and the value (mono 30px
  / 700 white, right-aligned). Rows slide in from the left, staggered
  0.25s apart.
- After the last row, at `(duration - 4.0)`s, a big red CTA pill
  "We're not doing enough." pops in with easeOutBack: red `#ef6a6a`
  background, white Helvetica 44px / 700, padded 18×36, 18px radius,
  with a 40px red glow.

**Scene 8 — Link in bio** (45.85–48.3s)
- Centered column.
- Small label: "TRY IT YOURSELF" (mono, soft-grey, tracked).
- "Link in bio ↗" — Helvetica 108px / 700, letter-spacing -0.03em.
- URL chip: `mlorenzon.github.io/howsitgoing` in mono 26px, on a dark
  ink chip with thin border.

**Scene 9 — What's in your dashboard?** (48.4–51.5s)
- Eyebrow: "YOUR TURN"
- H2: "What's in *your* dashboard?" — Helvetica 124px / 0.95, "your"
  in italic amber `#f0b342`.
- Subtext: "Tell me in the comments ↓" — mono 26px soft.

### Motion principles
- All scenes use the shared `entryExit(localTime, sceneDuration, entryDur, exitDur)`
  helper in `motion-scenes.jsx` — entry crossfades over `entryDur` with
  a 24px upward slide; exit crossfades over `exitDur` with a 12px
  upward slide. Defaults are 0.4–0.5s entry / 0.35–0.55s exit per scene.
- All eases are sourced from `animations.jsx`'s `Easing` object:
  `easeOutCubic` (most reveals), `easeOutBack` (pills + CTA), `easeInCubic` (exits).
- Chart reveal is composed of stages within each scene's local
  progress: stroke-dash line draw → area fill fade → end-tip pop →
  reference-line fade.

---

## Design Tokens

### Colors
```
--ink           #0e1118    /* card background */
--ink-border    rgba(255,255,255,0.10)
--text          #f6f4ef    /* primary on-dark */
--text-soft     rgba(246,244,239,0.62)
--text-faint    rgba(246,244,239,0.38)

--status-red    #ef6a6a    /* worsening, accelerating, still a mess */
--status-amber  #f0b342    /* mixed */
--status-green  #5cc28f    /* improving */
--status-blue   #7dadf2    /* (defined but currently unused) */

--key-green     #00B140    /* chroma-key bg in browser preview only */
```

These mirror the dashboard's traffic-light system (see
`source/indicators-dashboard.jsx` in the original project) — keep them
exact.

### Typography
- **UI / Display**: Helvetica Neue (fallback to Helvetica, Arial,
  sans-serif). Weights used: 400 italic, 600, 700.
- **Mono / Numbers**: JetBrains Mono (Google Fonts, weights 400 / 500 / 700).
  Used for eyebrows, big numbers, status pills, delta badges, axis
  labels, URL chips.

### Spacing
- Outer side-pad: **70px**
- Card content width: **940px**
- Card inner padding: **40px / 44px / 36px** (top / sides / bottom)
- Card-internal flex gap: **22px**
- Eyebrow rule width on reveal: **60px**
- Card border-radius: **28px**
- Pill border-radius: **999** (full)
- CTA radius: **18px**

### Shadows
- Card: `0 28px 60px rgba(0,0,0,0.35), 0 0 0 1px <color>22, 0 0 80px <color>33`
- Status dot: `0 0 16px <color>`
- Verdict-row dot: `0 0 18px <color>aa`
- CTA: `0 0 40px #ef6a6a88`

---

## Data
All data series live as inline JS arrays at the top of
`source/motion-scenes.jsx` (`CO2_DATA`, `GINI_DATA`, `WEALTH_DATA`,
`HOUSING_DATA`). They mirror the dashboard's authoritative numbers; do
not recompute or refetch — copy the arrays as-is. `CO2_RATE` is
derived from `CO2_DATA` (year-on-year deltas).

---

## Recommended port: Remotion

[Remotion](https://www.remotion.dev/) renders React components to MP4
/ ProRes / PNG sequence offline using a headless Chromium driver. The
existing code is already React + JSX so the port is mostly mechanical.

### Step-by-step

1. **Scaffold**
   ```bash
   npx create-video@latest hows-it-going-mg --blank
   cd hows-it-going-mg
   npm i
   ```

2. **Set composition dimensions** in `src/Root.tsx`:
   ```tsx
   <Composition
     id="HowsItGoing"
     component={Reel}
     durationInFrames={Math.round(51.5 * 60)}  // 3090
     fps={60}
     width={1080}
     height={1920}
   />
   ```

3. **Port the scenes**. Each scene in `motion-scenes.jsx` is a
   `<Sprite start={s} end={e}>` whose children receive
   `{localTime, duration}`. In Remotion, wrap each scene in a
   `<Sequence from={Math.round(start * fps)} durationInFrames={Math.round((end - start) * fps)}>`
   and replace `useTime()` / `localTime` with:
   ```ts
   const frame = useCurrentFrame();
   const localTime = frame / fps;
   ```
   The `entryExit`, `phase`, `Easing.*`, `clamp`, and `interpolate`
   helpers are pure functions — copy them verbatim from
   `source/animations.jsx`.

4. **Drop the custom Stage / scrubber.** Remotion provides the
   timeline; you only need the scene-rendering layer. Replace
   `<Stage>` with a top-level `<AbsoluteFill>` containing your
   `<Sequence>` list, with `style={{ background: 'transparent' }}`.

5. **Fonts.** Use `@remotion/google-fonts/JetBrainsMono` for the mono
   stack. Helvetica is system-supplied on the macOS render host; if
   rendering on Linux, install Helvetica or substitute with an
   identical-metrics alternative (e.g. `Inter` at -0.04em tracking is
   the closest free option).

6. **Render with alpha**:
   ```bash
   # PNG sequence with alpha (recommended for AE/Premiere)
   npx remotion render src/index.ts HowsItGoing out/frame-%04d.png \
     --image-format=png --pixel-format=yuva444p10le

   # OR — ProRes 4444 with alpha
   npx remotion render src/index.ts HowsItGoing out/overlay.mov \
     --codec=prores --prores-profile=4444
   ```
   For a 4K (2160×3840) upscale, change the composition's `width`
   and `height` — all motion is resolution-independent because the
   SVG charts and CSS sizes are in absolute pixels, and Remotion
   captures them at the composition resolution. (You may want to bump
   font sizes proportionally if the upscale is for a different
   delivery format than 9:16 reel.)

### What does NOT need to change
- The scene timing table (it's all relative to the audio).
- Colors, fonts, and the safe zone (still y=1180–1880 even at 2160×3840
  if you 2×-scale the composition).
- Chart data arrays.
- Motion curves and easing.

### What you may want to add
- A `<Audio src={...} />` track of the original voiceover for preview
  scrub-sync inside the Remotion studio (don't bake it into the
  rendered output — that gets mixed back in Premiere).
- A `--scale=2` render flag, or a parametrised composition, if you
  want both 1080p and 4K outputs from the same project.

---

## Alternative path: Puppeteer frame-stepping

If you'd rather not adopt Remotion, the existing HTML can be
frame-stepped offline with Puppeteer:

```js
// pseudocode
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
await page.goto('file:///.../Motion Graphics.html?capture=1');

// Override the Stage's time source to be frame-controlled instead of wall-clock.
// You'll need to expose a hook on window from animations.jsx — see Stage's
// `persistKey`-driven currentTime state. Replace it with a controlled value:
await page.evaluate(() => { window.__forceTime = (t) => { /* set stage time */ }; });

const fps = 60, total = 51.5;
for (let f = 0; f <= total * fps; f++) {
  await page.evaluate((t) => window.__forceTime(t), f / fps);
  await page.screenshot({ path: `out/${String(f).padStart(4,'0')}.png`,
                          omitBackground: true });
}
```

You'll need a small modification to `animations.jsx`'s `Stage` to
accept an externally-driven time (it currently runs off
`requestAnimationFrame` + `persistKey` localStorage). Look for the
`useTime()` hook there.

Render the PNG sequence with `ffmpeg`:
```bash
ffmpeg -framerate 60 -i out/%04d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le overlay.mov
```

This route is more fiddly but avoids any porting work on the scenes themselves.

---

## Files in this bundle

```
design_handoff_motion_graphics/
├── README.md                       ← this file
├── transcript-word-timings.tsv     ← word-by-word audio timings (for re-tuning if needed)
└── source/
    ├── Motion Graphics.html        ← entry point — open in browser to preview
    ├── animations.jsx              ← Stage, Sprite, Easing, useTime, interpolate
    ├── motion-scenes.jsx           ← all 9 scenes + Card / LineChart / RateBars / pills
    ├── tweaks-panel.jsx            ← in-browser tweak controls (drop on port)
    ├── thumbnail.png               ← reference frame of the speaker for safe-zone alignment
    └── transcript.json             ← raw Riverside/Whisper-style segments+words JSON
```

## Assets
- `thumbnail.png` is a frame grab of the host speaking to camera —
  used to confirm the safe-zone boundary. Not shipped in the final
  render; reference only.
- No icons or imagery are used. All graphics are CSS / SVG.
- Fonts: Helvetica Neue (system), JetBrains Mono (Google Fonts).

## Questions for the project owner
- Target delivery resolution: 1080×1920, 2160×3840, or both?
- Codec: ProRes 4444 (.mov, large, native-alpha, best quality) or PNG
  sequence (most flexible, also alpha)? Reel doesn't need 60fps for
  upload but cleaner motion blur in NLEs is worth keeping the source
  at 60.
- Should the final render include the voiceover audio baked in, or
  ship as silent overlay (recommended; mix in Premiere)?
