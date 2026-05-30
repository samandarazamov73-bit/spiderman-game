import { create } from 'zustand'

// Default fonts hosted on jsDelivr (via the three.js npm package).
// Loaded at runtime by FontLoader. CORS is enabled.
export const DEFAULT_FONTS = [
  {
    id: 'helvetiker',
    name: 'Helvetiker',
    url: 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/helvetiker_regular.typeface.json',
  },
  {
    id: 'helvetiker-bold',
    name: 'Helvetiker Bold',
    url: 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/helvetiker_bold.typeface.json',
  },
  {
    id: 'optimer',
    name: 'Optimer',
    url: 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/optimer_regular.typeface.json',
  },
  {
    id: 'gentilis',
    name: 'Gentilis',
    url: 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/gentilis_regular.typeface.json',
  },
  {
    id: 'droid-sans',
    name: 'Droid Sans',
    url: 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/droid/droid_sans_regular.typeface.json',
  },
]

export const ENV_PRESETS = [
  'studio',
  'city',
  'sunset',
  'dawn',
  'night',
  'warehouse',
  'forest',
  'apartment',
  'park',
  'lobby',
]

const DEFAULTS = {
  // Text content
  text: 'Kiro',

  // Typography
  fontId: 'helvetiker-bold',
  customFontSource: null, // parsed Font object (from FontLoader)
  customFontName: null,
  size: 1,

  // Geometry
  depth: 0.4,
  curveSegments: 12,
  bevelEnabled: true,
  bevelThickness: 0.04,
  bevelSize: 0.02,
  bevelSegments: 6,

  // Material
  color: '#e8e6e3',
  roughness: 0.25,
  metalness: 0.4,
  clearcoat: 0.6,
  clearcoatRoughness: 0.15,
  reflectivity: 0.6,

  // Environment
  background: '#0e1014',
  envPreset: 'studio',
  envIntensity: 0.9,
  showShadows: true,

  // Animation
  autoRotate: false,
  autoRotateSpeed: 1.2,
}

export const useStore = create((set, get) => ({
  ...DEFAULTS,

  // Imperative actions registered by Scene
  exportPNG: null,
  resetCamera: null,

  set: (patch) => set(patch),
  reset: () => set({ ...DEFAULTS }),
}))
