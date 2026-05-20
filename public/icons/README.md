# Icon set — How's it going?

Drop the entire `icons/` folder into `public/` so files are served from the site root
(Vite copies `public/*` straight to `/`).

## Add to `index.html` `<head>`

```html
<!-- Modern browsers: vector favicon scales perfectly at every size -->
<link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />

<!-- Fallback PNGs for browsers that don't accept SVG favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />

<!-- iOS home-screen icon (square; iOS rounds it itself) -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />

<!-- PWA manifest -->
<link rel="manifest" href="/icons/site.webmanifest" />
<meta name="theme-color" content="#f7f5ef" />
```

## What's in here

| File | Purpose |
|---|---|
| `favicon.svg` | Vector master. Modern browsers prefer this. |
| `favicon-16x16.png` / `-32x32.png` / `-48x48.png` | Classic browser favicons. |
| `favicon-64x64.png` | High-DPI tab. |
| `apple-touch-icon.png` (180×180) | iOS home-screen. Square — iOS applies the squircle mask. |
| `icon-192.png` / `icon-512.png` | PWA "any" purpose icons. |
| `icon-maskable-192.png` / `icon-maskable-512.png` | PWA "maskable" icons. Content sits in the central 80% safe zone so Android adaptive icon shapes don't crop the dots. |
| `icon-source-1024.png` | High-res master if you ever need to regenerate at a larger size. |
| `site.webmanifest` | PWA manifest. |

## Notes

- The vector design is three traffic-light dots (red / amber / green) on the dashboard's paper background.
- Background `#f7f5ef` matches the dashboard `--bg` token.
- No favicon.ico is included — modern browsers (including IE11) accept PNG via `<link rel="icon">`. If you have a legacy requirement, convert `favicon-32x32.png` via any online ICO tool.
