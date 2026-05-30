# 3D Text Studio

A high-quality, browser-based 3D text generator built with React, Three.js (React Three Fiber + Drei), and Tailwind CSS. The UI is modeled after professional 3D / design tools (Spline, Figma) with a topbar, left tool rail, large WebGL viewport, and a dense properties panel on the right.

## Features

- **Live 3D text** — type into the sidebar, the extruded geometry rebuilds in real time.
- **Typography**
  - 5 built-in high-quality fonts (Helvetiker, Helvetiker Bold, Optimer, Gentilis, Droid Sans).
  - Upload your own `.ttf`, `.otf`, or three.js `.json` typeface fonts.
  - Adjustable size.
- **Geometry** — depth (extrusion), curve segments, bevel toggle with thickness / size / segments controls.
- **PBR materials** (`MeshPhysicalMaterial`) — color, roughness, metalness, clearcoat, clearcoat roughness, reflectivity, plus six material presets (Matte Clay, Glossy Plastic, Polished Metal, Liquid Gold, Soft Velvet, Glass Candy).
- **Environment** — color + swatch palette for the background, 10 HDRI presets (`studio`, `city`, `sunset`, `dawn`, `night`, `warehouse`, `forest`, `apartment`, `park`, `lobby`), env-map intensity slider, soft contact shadows.
- **Camera** — `OrbitControls` (drag to orbit, scroll to zoom, right-click to pan), with a frame/reset button.
- **Animation** — auto-rotate toggle with adjustable speed.
- **Export** — one-click PNG snapshot of the viewport at native DPR.
- **Quality** — ACES filmic tone mapping, antialiasing, dynamic resolution (`dpr=[1,2]`), shadow mapping, soft contact shadows, and HDRI-driven reflections for that "Nomad Sculpt" feel.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + Vite |
| 3D | three.js, @react-three/fiber, @react-three/drei |
| State | zustand |
| Styling | Tailwind CSS (custom dark theme) |
| Icons | lucide-react |
| Font parsing | three.js `FontLoader` + `TTFLoader` (opentype.js) |

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# -> http://localhost:5173

# 3. Production build
npm run build
npm run preview
```

Required dependencies (already in `package.json`):

```bash
npm i react react-dom three @react-three/fiber @react-three/drei zustand lucide-react opentype.js
npm i -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer
```

> **Note**: HDRI environments and default fonts are fetched at runtime from public CDNs (Drei's hosted HDRIs and jsDelivr for the three.js typeface fonts). An internet connection is required on first load. Fonts are cached in memory after the first fetch.

## Project Structure

```
.
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                 # React entry
    ├── App.jsx                  # App shell (Topbar + LeftRail + Viewport + ControlPanel)
    ├── index.css                # Tailwind + custom design tokens
    ├── store/
    │   └── useStore.js          # Zustand store: text, typography, geometry, material, env, animation
    ├── utils/
    │   └── fontLoader.js        # Parses .ttf/.otf/.json uploads into three.js Font instances
    ├── scene/
    │   ├── Scene.jsx            # R3F Canvas + lights + Environment + ContactShadows + OrbitControls
    │   ├── Text3DObject.jsx     # TextGeometry + MeshPhysicalMaterial mesh
    │   └── useFont.js           # Hook that resolves URL or Font object → Font (cached)
    └── components/
        ├── Topbar.jsx
        ├── LeftRail.jsx
        ├── Viewport.jsx
        ├── ControlPanel.jsx     # Right sidebar: composes all panels
        ├── ui/
        │   ├── Section.jsx      # Collapsible section header
        │   ├── Slider.jsx       # Slider + numeric input + min/max readouts
        │   ├── ColorInput.jsx   # Color picker + hex text input
        │   ├── Toggle.jsx       # iOS-style switch
        │   ├── Select.jsx       # Custom-styled dropdown
        │   ├── TextArea.jsx
        │   ├── Button.jsx
        │   └── FileUpload.jsx   # Dashed dropzone-style upload button
        └── panels/
            ├── TextPanel.jsx
            ├── TypographyPanel.jsx
            ├── GeometryPanel.jsx
            ├── MaterialPanel.jsx
            ├── EnvironmentPanel.jsx
            ├── AnimationPanel.jsx
            └── ExportPanel.jsx
```

## Architecture Notes

- **Single source of truth.** All UI controls write to a Zustand store; `Text3DObject` and `Scene` subscribe to slices of that store. Components stay tiny and rerender independently.
- **Imperative bridge.** Renderer-only operations (PNG export, camera reset) are registered into the store from inside the `<Canvas>` via a `CanvasBridge` child, so any UI button outside R3F can trigger them through `useStore.getState().exportPNG?.()`.
- **Geometry rebuild.** `TextGeometry` is rebuilt inside `useMemo` whenever any geometry-relevant input changes; the previous geometry is `dispose()`d in a cleanup effect to prevent GPU memory leaks.
- **Custom font upload.** TTF/OTF files are parsed by three.js's `TTFLoader` (powered by `opentype.js`), then handed to `FontLoader.parse()` to produce a `Font` instance — exactly the same shape as the built-in JSON typefaces, so the rendering path is unified.

## Keyboard / Mouse

| Action | Input |
|---|---|
| Orbit camera | Left-click drag |
| Pan | Right-click drag |
| Zoom | Scroll |
| Reset camera | "Reset Camera" in topbar / "Frame" in viewport |
| Toggle auto-rotate | Bottom-left "Auto-rotate" pill |
| Export PNG | "Export PNG" in topbar / Export panel |
