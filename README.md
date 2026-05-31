# 3D Text Studio

A high-quality 3D text generator that runs entirely in the browser. Three files, no build step, no `npm install` — just open `index.html` (served over HTTP) and you have a Spline/Figma-style 3D editor with PBR materials, HDRI lighting, soft shadows, and a polished UI.

## Files

```
index.html   UI markup, Tailwind CDN, importmap for Three.js + opentype.js
styles.css   Custom styling (sliders, color inputs, sections, buttons)
app.js       Three.js scene + font loading + UI wiring
```

## How to view it (pick one)

1. **Hosted preview** — once this branch is on GitHub, open it via raw.githack:
   `https://raw.githack.com/<owner>/<repo>/<branch>/index.html`

2. **GitHub Pages** — in the repo *Settings → Pages*, pick the branch that contains these files. The site goes live at `https://<owner>.github.io/<repo>/`.

3. **Locally** — any static server works because ES modules require HTTP (not `file://`):
   ```bash
   # Python 3
   python3 -m http.server 8000
   # or Node
   npx serve
   ```
   Then open <http://localhost:8000>.

## Features

- **Live text** — edit in the side panel, the 3D mesh updates in real time.
- **5 built-in fonts** + upload your own `.ttf` / `.otf` / three.js `.json` typeface (parsed via `TTFLoader` + `opentype.js`).
- **Geometry**: depth, curve segments, bevel toggle (thickness / size / segments).
- **PBR material** (`MeshPhysicalMaterial`): color, roughness, metalness, clearcoat, clearcoat roughness, reflectivity + 6 swatch presets (Matte Clay, Glossy Plastic, Polished Metal, Liquid Gold, Soft Velvet, Glass Candy).
- **Environment**: solid background (color picker + 8 swatches), 6 HDRI options (procedural Studio + 5 real HDRIs), env-map intensity, ground shadow toggle.
- **Camera**: `OrbitControls` (drag / scroll / right-click), auto-rotate toggle with speed slider, "Frame" reset.
- **Export**: one-click PNG of the viewport.
- **Quality**: ACES filmic tone mapping, antialiasing, dynamic resolution (DPR 1–2), 2048² shadow map, PMREM-prefiltered HDRIs.

## What's loaded from the network

Everything visual is local except for these CDN imports declared in `index.html`:

- Tailwind CSS — `cdn.tailwindcss.com`
- Three.js + addons — `unpkg.com/three@0.169.0`
- opentype.js (only used when uploading `.ttf`/`.otf`) — `esm.sh/opentype.js@1.3.4`
- Default fonts — `cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/`
- HDRIs — `threejs.org/examples/textures/equirectangular/`
- Inter / JetBrains Mono — `fonts.googleapis.com`

## Controls

| Action | Input |
|---|---|
| Orbit camera | Left-click drag |
| Pan | Right-click drag |
| Zoom | Scroll |
| Frame / reset camera | "⛶ Frame" / "Reset Camera" |
| Auto-rotate | Bottom-left pill / Animation panel |
| Export PNG | Top-right "📷 Export PNG" / Export panel |
