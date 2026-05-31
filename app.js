// ============================================================
// 3D Text Studio — Nomad Sculpt-inspired edition.
// Vanilla three.js + plain DOM, no build step.
// ============================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ============ CONSTANTS ============
const DEFAULT_FONTS = [
  { id: 'helvetiker',      name: 'Helvetiker',      url: 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/helvetiker_regular.typeface.json' },
  { id: 'helvetiker-bold', name: 'Helvetiker Bold', url: 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/helvetiker_bold.typeface.json' },
  { id: 'optimer',         name: 'Optimer',         url: 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/optimer_regular.typeface.json' },
  { id: 'gentilis',        name: 'Gentilis',        url: 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/gentilis_regular.typeface.json' },
  { id: 'droid-sans',      name: 'Droid Sans',      url: 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/droid/droid_sans_regular.typeface.json' },
];

const HDRI_PRESETS = [
  { id: 'studio', name: 'Studio',  url: null },
  { id: 'royal',  name: 'Royal',   url: 'https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr' },
  { id: 'sunset', name: 'Sunset',  url: 'https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr' },
  { id: 'dawn',   name: 'Dawn',    url: 'https://threejs.org/examples/textures/equirectangular/spruit_sunrise_1k.hdr' },
  { id: 'city',   name: 'City',    url: 'https://threejs.org/examples/textures/equirectangular/pedestrian_overpass_1k.hdr' },
  { id: 'night',  name: 'Night',   url: 'https://threejs.org/examples/textures/equirectangular/quarry_01_1k.hdr' },
];

const MATERIAL_PRESETS = [
  { name: 'Matte Clay',     swatch: '#d6c8b8', vals: { color:'#d6c8b8', roughness:0.85, metalness:0.0, clearcoat:0.0, clearcoatRoughness:0.5,  reflectivity:0.20, transmission:0, sheen:0, iridescence:0, emissiveIntensity:0 } },
  { name: 'Glossy Plastic', swatch: '#e74c3c', vals: { color:'#e74c3c', roughness:0.25, metalness:0.0, clearcoat:1.0, clearcoatRoughness:0.05, reflectivity:0.55, transmission:0, sheen:0, iridescence:0, emissiveIntensity:0 } },
  { name: 'Polished Metal', swatch: '#c8c8c8', vals: { color:'#c8c8c8', roughness:0.12, metalness:1.0, clearcoat:0.4, clearcoatRoughness:0.10, reflectivity:1.00, transmission:0, sheen:0, iridescence:0, emissiveIntensity:0 } },
  { name: 'Liquid Gold',    swatch: '#ffb740', vals: { color:'#ffb740', roughness:0.18, metalness:1.0, clearcoat:0.6, clearcoatRoughness:0.08, reflectivity:1.00, transmission:0, sheen:0, iridescence:0, emissiveIntensity:0 } },
  { name: 'Soft Velvet',    swatch: '#6e3bb3', vals: { color:'#6e3bb3', roughness:0.95, metalness:0.0, clearcoat:0.0, clearcoatRoughness:0.5,  reflectivity:0.15, transmission:0, sheen:1.0, sheenColor:'#ff8aff', iridescence:0, emissiveIntensity:0 } },
  { name: 'Glass Candy',    swatch: '#7dd3fc', vals: { color:'#7dd3fc', roughness:0.05, metalness:0.0, clearcoat:1.0, clearcoatRoughness:0.02, reflectivity:0.90, transmission:0.9, ior:1.5, sheen:0, iridescence:0, emissiveIntensity:0 } },
  { name: 'Frosted Ice',    swatch: '#bae6fd', vals: { color:'#bae6fd', roughness:0.4,  metalness:0.0, clearcoat:1.0, clearcoatRoughness:0.3,  reflectivity:0.5,  transmission:0.7, ior:1.31, sheen:0, iridescence:0, emissiveIntensity:0 } },
  { name: 'Soap Bubble',    swatch: '#ffffff', vals: { color:'#ffffff', roughness:0.05, metalness:0.0, clearcoat:1.0, clearcoatRoughness:0.0,  reflectivity:0.5,  transmission:0.3, sheen:0, iridescence:1.0, iridescenceIOR:1.3, iridescenceThickness:600, emissiveIntensity:0 } },
  { name: 'Hot Lava',       swatch: '#ff5722', vals: { color:'#3d0a00', roughness:0.6,  metalness:0.0, clearcoat:0.0, clearcoatRoughness:0.5,  reflectivity:0.3,  transmission:0, sheen:0, iridescence:0, emissive:'#ff4500', emissiveIntensity:2.5 } },
  { name: 'Neon Glow',      swatch: '#ff00ff', vals: { color:'#000000', roughness:1.0,  metalness:0.0, clearcoat:0.0, clearcoatRoughness:0.5,  reflectivity:0.0,  transmission:0, sheen:0, iridescence:0, emissive:'#ff00ff', emissiveIntensity:3.0 } },
  { name: 'Pearl',          swatch: '#fef3c7', vals: { color:'#fef3c7', roughness:0.2,  metalness:0.0, clearcoat:1.0, clearcoatRoughness:0.05, reflectivity:0.7,  transmission:0, sheen:0, iridescence:0.7, iridescenceIOR:1.3, iridescenceThickness:400, emissiveIntensity:0 } },
  { name: 'Carbon Fiber',   swatch: '#1a1a1a', vals: { color:'#1a1a1a', roughness:0.35, metalness:0.5, clearcoat:0.9, clearcoatRoughness:0.1,  reflectivity:0.6,  transmission:0, sheen:0, iridescence:0, emissiveIntensity:0 } },
];

const BG_PRESETS = ['#0a0a0d', '#0e1014', '#1a1f2e', '#2c1b3a', '#f4f4f5', '#e8e6e3', '#5b21b6', '#0ea5e9'];

// Animation presets. `t` is elapsed time × state.animationSpeed; `g` is the text group.
const ANIMATIONS = [
  { id: 'none',     name: 'None',           apply: null },
  { id: 'spinY',    name: 'Spin Y',         apply: (g, t) => { g.rotation.y =  t; } },
  { id: 'spinYRev', name: 'Spin Y Reverse', apply: (g, t) => { g.rotation.y = -t; } },
  { id: 'spinX',    name: 'Spin X',         apply: (g, t) => { g.rotation.x =  t * 0.8; } },
  { id: 'spinZ',    name: 'Spin Z',         apply: (g, t) => { g.rotation.z =  t * 0.6; } },
  { id: 'tumble',   name: 'Tumble (XYZ)',   apply: (g, t) => { g.rotation.x = t * 0.7; g.rotation.y = t; g.rotation.z = t * 0.4; } },
  { id: 'wobble',   name: 'Wobble',         apply: (g, t) => { g.rotation.x = Math.sin(t * 1.4) * 0.28; g.rotation.z = Math.cos(t * 1.0) * 0.20; g.rotation.y = Math.sin(t * 0.6) * 0.45; } },
  { id: 'pendulum', name: 'Pendulum',       apply: (g, t) => { g.rotation.y = Math.sin(t * 1.6) * 0.9; } },
  { id: 'float',    name: 'Float',          apply: (g, t) => { g.position.y = Math.sin(t * 1.5) * 0.18; g.rotation.y = Math.sin(t * 0.6) * 0.30; g.rotation.z = Math.sin(t * 1.2) * 0.06; } },
  { id: 'figure8',  name: 'Figure 8',       apply: (g, t) => { g.rotation.y = Math.sin(t) * 0.7; g.rotation.x = Math.sin(t * 2) * 0.35; } },
  { id: 'shimmy',   name: 'Shimmy',         apply: (g, t) => { g.rotation.z = Math.sin(t * 6) * 0.08; g.position.x = Math.sin(t * 6) * 0.05; } },
  { id: 'breathe',  name: 'Breathe',        apply: (g, t) => { const s = 1 + Math.sin(t * 1.5) * 0.06; g.scale.set(s, s, s); } },
  { id: 'orbit',    name: 'Orbit Camera',   apply: null /* OrbitControls.autoRotate */ },
];

// Procedurally-generated matcap textures (radial gradients on a 256² canvas).
function makeMatcap(stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(128, 96, 8, 128, 128, 160);
  stops.forEach(([s, col]) => grad.addColorStop(s, col));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const MATCAPS = [
  { id: 'silver',  name: 'Silver',  build: () => makeMatcap([[0,'#ffffff'],[0.4,'#c0c4cc'],[0.7,'#5a6173'],[1,'#0c0e14']]) },
  { id: 'gold',    name: 'Gold',    build: () => makeMatcap([[0,'#fff7c4'],[0.4,'#ffd166'],[0.7,'#9c6a1a'],[1,'#1a0f00']]) },
  { id: 'red',     name: 'Red',     build: () => makeMatcap([[0,'#ffd6cc'],[0.4,'#ff5a3c'],[0.7,'#7a0e00'],[1,'#1a0000']]) },
  { id: 'jade',    name: 'Jade',    build: () => makeMatcap([[0,'#d6ffe6'],[0.4,'#3ddc9a'],[0.7,'#0a4a30'],[1,'#001a0c']]) },
  { id: 'purple',  name: 'Purple',  build: () => makeMatcap([[0,'#f0d6ff'],[0.4,'#a855f7'],[0.7,'#3a0e6b'],[1,'#0c001a']]) },
  { id: 'clay',    name: 'Clay',    build: () => makeMatcap([[0,'#fff5e0'],[0.4,'#f0c89a'],[0.7,'#7a5a40'],[1,'#1a0e08']]) },
];

// ============ BLOOM PRESETS ============
const BLOOM_PRESETS = [
  { name: 'Subtle',    vals: { bloomStrength: 0.35, bloomThreshold: 0.85, bloomRadius: 0.4, bloomColor: '#ffffff', bloomColorMix: 0,    chromaticOn: false, vignetteOn: false, grainOn: false } },
  { name: 'Dreamy',    vals: { bloomStrength: 1.1,  bloomThreshold: 0.55, bloomRadius: 0.9, bloomColor: '#ffd6f5', bloomColorMix: 0.4,  chromaticOn: false, vignetteOn: true,  vignetteIntensity: 0.4, grainOn: false } },
  { name: 'Neon',      vals: { bloomStrength: 1.6,  bloomThreshold: 0.3,  bloomRadius: 0.7, bloomColor: '#7dd3fc', bloomColorMix: 0.55, chromaticOn: true,  chromaticAmount: 0.004, vignetteOn: true, vignetteIntensity: 0.55, grainOn: false } },
  { name: 'Cinematic', vals: { bloomStrength: 0.55, bloomThreshold: 0.78, bloomRadius: 0.6, bloomColor: '#ffe6c4', bloomColorMix: 0.25, chromaticOn: true,  chromaticAmount: 0.0015, vignetteOn: true, vignetteIntensity: 0.7, grainOn: true, grainAmount: 0.12 } },
  { name: 'Intense',   vals: { bloomStrength: 2.5,  bloomThreshold: 0.2,  bloomRadius: 1.0, bloomColor: '#ffffff', bloomColorMix: 0,    chromaticOn: true,  chromaticAmount: 0.006, vignetteOn: true, vignetteIntensity: 0.8, grainOn: false } },
  { name: 'Magic',     vals: { bloomStrength: 1.4,  bloomThreshold: 0.5,  bloomRadius: 1.2, bloomColor: '#a855f7', bloomColorMix: 0.6,  chromaticOn: true,  chromaticAmount: 0.003, vignetteOn: false, grainOn: false } },
  { name: 'Sun Flare', vals: { bloomStrength: 1.8,  bloomThreshold: 0.6,  bloomRadius: 0.8, bloomColor: '#ffd166', bloomColorMix: 0.7,  chromaticOn: false, vignetteOn: true, vignetteIntensity: 0.5, grainOn: false } },
];

// ============ 3D DECORATION GENERATORS ============
// Each decoration returns a single THREE.Object3D (mesh or group).
function makeStarGeom() {
  // 5-pointed star extruded
  const shape = new THREE.Shape();
  const outer = 0.5, inner = 0.22;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * 2 * i) / 10 - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3, curveSegments: 8 });
}
function makeHeartGeom() {
  const x = 0, y = 0, shape = new THREE.Shape();
  shape.moveTo(x, y - 0.15);
  shape.bezierCurveTo(x, y - 0.15, x - 0.25, y - 0.55, x - 0.5, y - 0.15);
  shape.bezierCurveTo(x - 0.75, y + 0.25, x - 0.5, y + 0.55, x, y + 0.25);
  shape.bezierCurveTo(x + 0.5, y + 0.55, x + 0.75, y + 0.25, x + 0.5, y - 0.15);
  shape.bezierCurveTo(x + 0.25, y - 0.55, x, y - 0.15, x, y - 0.15);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4, curveSegments: 12 });
}
function makeNoteGeom() {
  // Quarter note: round head + stem
  const head = new THREE.SphereGeometry(0.18, 16, 12);
  head.scale(1.3, 1, 0.5);
  const stem = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
  stem.translate(0.18, 0.45, 0);
  // merge
  return mergeGeoms([head, stem]);
}
function makeDoubleNoteGeom() {
  // Eighth note pair (♫)
  const h1 = new THREE.SphereGeometry(0.16, 16, 12); h1.scale(1.3, 1, 0.5); h1.translate(-0.25, 0, 0);
  const h2 = new THREE.SphereGeometry(0.16, 16, 12); h2.scale(1.3, 1, 0.5); h2.translate(0.25, 0, 0);
  const s1 = new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8); s1.translate(-0.10, 0.42, 0);
  const s2 = new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8); s2.translate(0.40, 0.42, 0);
  const beam = new THREE.BoxGeometry(0.55, 0.08, 0.06); beam.translate(0.15, 0.82, 0);
  return mergeGeoms([h1, h2, s1, s2, beam]);
}
function makeChainLink() {
  // Single torus that forms a link
  return new THREE.TorusGeometry(0.32, 0.08, 12, 32);
}
function makeSparkleGeom() {
  // 4-pointed sparkle / sparkle plus
  const shape = new THREE.Shape();
  const long = 0.5, short = 0.08;
  shape.moveTo(0, long);
  shape.lineTo(short, short);
  shape.lineTo(long, 0);
  shape.lineTo(short, -short);
  shape.lineTo(0, -long);
  shape.lineTo(-short, -short);
  shape.lineTo(-long, 0);
  shape.lineTo(-short, short);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 6 });
}
function makeDiamondGeom() {
  // Octahedron = simple gem
  const g = new THREE.OctahedronGeometry(0.45, 0);
  return g;
}
function makeCrownGeom() {
  // Simple crown: ring + 5 spikes
  const ring = new THREE.CylinderGeometry(0.45, 0.45, 0.2, 24, 1, true);
  const parts = [ring];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const sp = new THREE.ConeGeometry(0.1, 0.35, 8);
    sp.translate(Math.cos(a) * 0.42, 0.27, Math.sin(a) * 0.42);
    parts.push(sp);
  }
  return mergeGeoms(parts);
}
function makeBoltGeom() {
  // Lightning bolt
  const shape = new THREE.Shape();
  shape.moveTo(0.05, 0.55);
  shape.lineTo(-0.20, 0.05);
  shape.lineTo(-0.02, 0.05);
  shape.lineTo(-0.15, -0.55);
  shape.lineTo(0.20, -0.05);
  shape.lineTo(0.02, -0.05);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 2, curveSegments: 4 });
}
function makeRingGeom() {
  return new THREE.TorusGeometry(0.35, 0.08, 16, 48);
}
function makeFlameGeom() {
  // Teardrop pointing up
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.6);
  shape.bezierCurveTo(0.3, 0.4, 0.3, -0.1, 0, -0.3);
  shape.bezierCurveTo(-0.3, -0.1, -0.3, 0.4, 0, 0.6);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3, curveSegments: 16 });
}
function makeBubbleGeom() {
  return new THREE.SphereGeometry(0.32, 24, 18);
}
function makeSpiralGeom() {
  // Helix-ish spiral as a tube
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const a = t * Math.PI * 4;
    pts.push(new THREE.Vector3(Math.cos(a) * 0.3 * t, t * 0.6 - 0.3, Math.sin(a) * 0.3 * t));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.05, 8, false);
}

// Merge helper using three's BufferGeometryUtils (lazy-loaded elsewhere; here
// we accept that merging is asynchronous-safe through our cached `_bgU`).
function mergeGeoms(arr) {
  if (_bgU) return _bgU.mergeGeometries(arr, false);
  // Fallback: pick first and queue lazy merge
  getBufferGeometryUtils().then(() => updateText());
  return arr[0];
}

const DECORATIONS = [
  { id: 'none',    name: 'None' },
  { id: 'star',    name: '⭐ Stars',         emissiveDefault: 0,   make: makeStarGeom },
  { id: 'heart',   name: '❤ Hearts',         emissiveDefault: 0,   make: makeHeartGeom },
  { id: 'note',    name: '♪ Music Notes',    emissiveDefault: 0,   make: makeNoteGeom },
  { id: 'note2',   name: '♫ Beamed Notes',   emissiveDefault: 0,   make: makeDoubleNoteGeom },
  { id: 'chain',   name: '⛓ Chain Links',    emissiveDefault: 0,   make: makeChainLink, ring: true },
  { id: 'sparkle', name: '✦ Sparkles',       emissiveDefault: 1.5, make: makeSparkleGeom },
  { id: 'diamond', name: '💎 Diamonds',      emissiveDefault: 0,   make: makeDiamondGeom, glassy: true },
  { id: 'crown',   name: '👑 Crowns',        emissiveDefault: 0,   make: makeCrownGeom },
  { id: 'bolt',    name: '⚡ Lightning',      emissiveDefault: 1.8, make: makeBoltGeom },
  { id: 'ring',    name: '○ Rings',          emissiveDefault: 0,   make: makeRingGeom },
  { id: 'flame',   name: '🔥 Flames',        emissiveDefault: 2.0, make: makeFlameGeom },
  { id: 'bubble',  name: '○ Bubbles',        emissiveDefault: 0,   make: makeBubbleGeom, glassy: true },
  { id: 'spiral',  name: '@ Spirals',        emissiveDefault: 0,   make: makeSpiralGeom },
];

// ============ DEFAULTS / STATE ============
const DEFAULTS = {
  // Text
  text: 'Kiro',
  fontId: 'helvetiker-bold',
  customFont: null,
  customFontName: null,
  size: 1,
  letterSpacing: 0,
  lineHeight: 1.2,

  // Geometry
  depth: 0.4,
  curveSegments: 12,
  bevelEnabled: true,
  bevelThickness: 0.04,
  bevelSize: 0.02,
  bevelOffset: 0,
  bevelSegments: 6,
  // Photoshop-style inner bevel
  innerBevel: false,
  innerBevelStyle: 'chiselHard',  // chiselHard | chiselSoft | smooth | pillow | stroke
  innerBevelDepth: 0.7,            // Photoshop "Depth" (0..1) — height multiplier
  innerBevelSize: 0.08,            // Photoshop "Size" — how far the bevel extends
  innerBevelSoften: 0,             // Photoshop "Soften" — 0 = razor sharp, 1 = smooth
  innerBevelDirection: 'up',       // 'up' = raised, 'down' = engraved
  innerBevelHighlight: '#ffffff',
  innerBevelShadow: '#000000',
  innerBevelHighlightOpacity: 0.75,
  innerBevelShadowOpacity: 0.75,
  innerBevelAngle: 120,            // light angle in degrees
  innerBevelAltitude: 30,
  innerBevelResolution: 512,       // distance-field resolution per axis

  // Material — base
  shadingMode: 'pbr', // 'pbr' | 'matcap' | 'normal'
  matcapId: 'silver',
  color: '#e8e6e3',
  roughness: 0.25,
  metalness: 0.4,
  clearcoat: 0.6,
  clearcoatRoughness: 0.15,
  reflectivity: 0.6,
  flatShading: false,
  wireframe: false,

  // Material — extended
  emissive: '#000000',
  emissiveIntensity: 0,
  transmission: 0,
  ior: 1.5,
  thickness: 0.5,
  sheen: 0,
  sheenColor: '#ffffff',
  sheenRoughness: 0.5,
  iridescence: 0,
  iridescenceIOR: 1.3,
  iridescenceThickness: 400,

  // Outline
  outlineOn: false,
  outlineThickness: 0.02,
  outlineColor: '#000000',

  // Symmetry
  mirrorX: false,
  mirrorY: false,

  // Background
  bgMode: 'solid', // 'solid' | 'gradient' | 'hdri' | 'transparent'
  background: '#0e1014',
  bgGradientTop: '#1a1f2e',
  bgGradientBottom: '#000000',

  // Environment
  envPreset: 'studio',
  envIntensity: 0.9,

  // Lights
  ambientIntensity: 0.18,
  dirIntensity: 0.55,
  dirColor: '#ffffff',
  dirX: 6, dirY: 8, dirZ: 6,
  dirShadow: true,
  light2On: false, light2Color: '#7dd3fc', light2Intensity: 1.5, light2X: -4, light2Y: 3, light2Z: 4,
  light3On: false, light3Color: '#ff5e9c', light3Intensity: 1.2, light3X: 4, light3Y: 2, light3Z: -4,

  // Floor
  showShadows: true,
  showGrid: false,
  gridColor: '#252932',

  // Camera
  fov: 32,
  orthographic: false,

  // Post-processing
  bloomOn: false,
  bloomStrength: 0.5,
  bloomThreshold: 0.85,
  bloomRadius: 0.6,
  bloomColor: '#ffffff',
  bloomColorMix: 0,            // 0 = white, 1 = full bloomColor tint
  vignetteOn: false,
  vignetteIntensity: 0.5,
  chromaticOn: false,
  chromaticAmount: 0.003,
  grainOn: false,
  grainAmount: 0.08,

  // 3D Decorations (chains, music notes, stars, hearts, etc.)
  decorationType: 'none',      // see DECORATIONS below
  decorationCount: 14,
  decorationScale: 1.0,
  decorationSpread: 1.6,       // how far around the text they sit
  decorationColor: '#ffd166',
  decorationMetalness: 0.9,
  decorationRoughness: 0.2,
  decorationEmissive: 0,
  decorationFloat: true,       // gentle bobbing animation
  decorationSpinIndividual: true,

  // Animation
  autoRotate: false,           // simple toggle (back-compat)
  autoRotateSpeed: 1.2,
  animationMode: 'none',
  animationSpeed: 1.0,

  // UI
  showStats: true,
};

// Live state (clone of defaults)
const state = JSON.parse(JSON.stringify(DEFAULTS));
// Non-cloneable members
state.customFont = null;

// ============ DOM ============
const canvas = document.getElementById('canvas');
const panel = document.getElementById('panel');
const loadingOverlay = document.getElementById('loadingOverlay');

// ============ THREE SETUP ============
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
  powerPreference: 'high-performance',
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

const persp = new THREE.PerspectiveCamera(state.fov, 1, 0.1, 100);
persp.position.set(0, 1.2, 6);
const ortho = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 100);
ortho.position.copy(persp.position);
let camera = persp;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2;
controls.maxDistance = 24;

// Gradient background scene (rendered before main scene when bgMode='gradient')
const gradientScene = new THREE.Scene();
const gradientCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const gradientMat = new THREE.ShaderMaterial({
  uniforms: { topColor: { value: new THREE.Color() }, bottomColor: { value: new THREE.Color() } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
  fragmentShader: `varying vec2 vUv; uniform vec3 topColor; uniform vec3 bottomColor;
    void main(){ gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0); }`,
  depthTest: false, depthWrite: false,
});
gradientScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), gradientMat));

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, state.ambientIntensity);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, state.dirIntensity);
dirLight.position.set(state.dirX, state.dirY, state.dirZ);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.bias = -0.0005;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 30;
dirLight.shadow.camera.left = -6; dirLight.shadow.camera.right = 6;
dirLight.shadow.camera.top = 6;   dirLight.shadow.camera.bottom = -6;
scene.add(dirLight);

const fillLight = new THREE.PointLight(0xffffff, 0, 30);
fillLight.position.set(state.light2X, state.light2Y, state.light2Z);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xffffff, 0, 30);
rimLight.position.set(state.light3X, state.light3Y, state.light3Z);
scene.add(rimLight);

// Floor (shadow plane)
const groundMat = new THREE.ShadowMaterial({ opacity: 0.4 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.15;
ground.receiveShadow = true;
scene.add(ground);

// Grid
const gridHelper = new THREE.GridHelper(20, 40, 0x363a45, 0x252932);
gridHelper.position.y = -1.149;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.5;
gridHelper.visible = state.showGrid;
scene.add(gridHelper);

// Materials
const pbrMaterial = new THREE.MeshPhysicalMaterial({});
const matcapMaterial = new THREE.MeshMatcapMaterial({});
const normalMaterial = new THREE.MeshNormalMaterial({ flatShading: false });
const matcapTextures = {};
MATCAPS.forEach((m) => { matcapTextures[m.id] = m.build(); });

// Outline material (back-side, inflated along normals)
const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });

// Text container
const textGroup = new THREE.Group();
scene.add(textGroup);

// Decorations group — orbiting/floating 3D items around the text.
const decorationsGroup = new THREE.Group();
scene.add(decorationsGroup);

// PMREM for HDRI
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

// ============ POST-PROCESSING ============
let composer = null;
let bloomPass = null;
let vignettePass = null;
let chromaticPass = null;
let grainPass = null;
let bloomTintPass = null;

const VignetteShader = {
  uniforms: { tDiffuse: { value: null }, intensity: { value: 0.5 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float intensity; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv);
      float d = distance(vUv, vec2(0.5));
      float v = smoothstep(0.8, 0.3, d);
      c.rgb *= mix(1.0, v, intensity);
      gl_FragColor = c; }`,
};

const ChromaticShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0.003 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float amount; varying vec2 vUv;
    void main(){
      vec2 dir = vUv - 0.5;
      float r = texture2D(tDiffuse, vUv + dir * amount).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - dir * amount).b;
      float a = texture2D(tDiffuse, vUv).a;
      gl_FragColor = vec4(r, g, b, a);
    }`,
};

const GrainShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0.08 }, time: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float amount; uniform float time; varying vec2 vUv;
    float rand(vec2 co){ return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float n = rand(vUv + time) - 0.5;
      c.rgb += n * amount;
      gl_FragColor = c;
    }`,
};

// Tint the bloom output with a colour. We post-process after bloom to multiply
// the bloomed highlights by a colour mix factor without re-writing the bloom
// pass itself.
const BloomTintShader = {
  uniforms: { tDiffuse: { value: null }, tintColor: { value: new THREE.Color('#ffffff') }, mixAmount: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 tintColor; uniform float mixAmount; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      // Pull out highlights and mix them with tintColor
      float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      float hi = smoothstep(0.6, 1.4, lum);
      vec3 tinted = mix(c.rgb, c.rgb * tintColor, mixAmount * hi);
      gl_FragColor = vec4(tinted, c.a);
    }`,
};

function ensureComposer() {
  if (composer) return composer;
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), state.bloomStrength, state.bloomRadius, state.bloomThreshold);
  bloomPass.enabled = state.bloomOn;
  composer.addPass(bloomPass);

  bloomTintPass = new ShaderPass(BloomTintShader);
  bloomTintPass.uniforms.tintColor.value = new THREE.Color(state.bloomColor);
  bloomTintPass.uniforms.mixAmount.value = state.bloomColorMix;
  bloomTintPass.enabled = state.bloomOn && state.bloomColorMix > 0;
  composer.addPass(bloomTintPass);

  chromaticPass = new ShaderPass(ChromaticShader);
  chromaticPass.uniforms.amount.value = state.chromaticAmount;
  chromaticPass.enabled = state.chromaticOn;
  composer.addPass(chromaticPass);

  vignettePass = new ShaderPass(VignetteShader);
  vignettePass.uniforms.intensity.value = state.vignetteIntensity;
  vignettePass.enabled = state.vignetteOn;
  composer.addPass(vignettePass);

  grainPass = new ShaderPass(GrainShader);
  grainPass.uniforms.amount.value = state.grainAmount;
  grainPass.enabled = state.grainOn;
  composer.addPass(grainPass);

  composer.addPass(new OutputPass());
  return composer;
}

function postEnabled() {
  return state.bloomOn || state.vignetteOn || state.chromaticOn || state.grainOn;
}

// ============ FONT LOADING ============
const fontCache = new Map();
let currentFont = null;

function loadFontUrl(url) {
  if (fontCache.has(url)) return Promise.resolve(fontCache.get(url));
  return new Promise((resolve, reject) => {
    new FontLoader().load(url, (f) => { fontCache.set(url, f); resolve(f); }, undefined, reject);
  });
}

async function setActiveFont() {
  if (state.fontId === 'custom' && state.customFont) {
    currentFont = state.customFont;
  } else {
    const f = DEFAULT_FONTS.find((f) => f.id === state.fontId) || DEFAULT_FONTS[0];
    try { currentFont = await loadFontUrl(f.url); }
    catch (e) { console.error('Font load failed:', e); return; }
  }
  updateText();
}

async function loadFontFromFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const buffer = await file.arrayBuffer();
  if (ext === 'json') {
    const json = JSON.parse(new TextDecoder().decode(buffer));
    return new FontLoader().parse(json);
  }
  if (ext === 'ttf' || ext === 'otf') {
    const { TTFLoader } = await import('three/addons/loaders/TTFLoader.js');
    const json = new TTFLoader().parse(buffer);
    return new FontLoader().parse(json);
  }
  throw new Error(`Unsupported format: .${ext}`);
}

// ============ TEXT GEOMETRY ============
let textTriCount = 0;
let textVertCount = 0;

function pickActiveMaterial() {
  if (state.shadingMode === 'matcap') return matcapMaterial;
  if (state.shadingMode === 'normal') return normalMaterial;
  return pbrMaterial;
}

function buildTextGeometry(text) {
  const safeText = text && text.length > 0 ? text : ' ';
  const useBodyBevel = state.bevelEnabled && !state.innerBevel;
  const baseOpts = (str) => ({
    font: currentFont,
    size: state.size,
    depth: state.depth,
    curveSegments: state.curveSegments,
    bevelEnabled: useBodyBevel,
    bevelThickness: useBodyBevel ? state.bevelThickness : 0,
    bevelSize: useBodyBevel ? state.bevelSize : 0,
    bevelOffset: useBodyBevel ? state.bevelOffset : 0,
    bevelSegments: state.bevelSegments,
  });

  if (Math.abs(state.letterSpacing) < 0.001) {
    const g = new TextGeometry(safeText, baseOpts(safeText));
    g.computeBoundingBox();
    return g;
  }
  // Per-character composition with custom advance
  const lineHeight = state.size * state.lineHeight;
  const lines = safeText.split('\n');
  const geoms = [];
  let yCursor = 0;
  for (let li = 0; li < lines.length; li++) {
    let xCursor = 0;
    const line = lines[li];
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === ' ') {
        // Use a measured space using a sample geometry of a wide char.
        const probe = new TextGeometry('M', baseOpts('M'));
        probe.computeBoundingBox();
        const w = probe.boundingBox ? (probe.boundingBox.max.x - probe.boundingBox.min.x) : state.size * 0.5;
        probe.dispose();
        xCursor += w * 0.55 + state.letterSpacing;
        continue;
      }
      const cg = new TextGeometry(ch, baseOpts(ch));
      cg.computeBoundingBox();
      const w = cg.boundingBox ? (cg.boundingBox.max.x - cg.boundingBox.min.x) : state.size * 0.6;
      cg.translate(xCursor, -li * lineHeight, 0);
      geoms.push(cg);
      xCursor += w + state.letterSpacing;
    }
    yCursor -= lineHeight;
  }
  // Merge
  return mergeBufferGeometriesFallback(geoms);
}

// Tiny merge utility (simple approach: combine via Group → no, we need a single
// geometry for outline). Use BufferGeometryUtils dynamically.
let _bgU = null;
async function getBufferGeometryUtils() {
  if (!_bgU) _bgU = await import('three/addons/utils/BufferGeometryUtils.js');
  return _bgU;
}

function mergeBufferGeometriesFallback(geoms) {
  // If utils not yet loaded, return first one and queue the rest.
  // For initial render this is fine because letterSpacing ≈ 0 by default.
  if (!_bgU) {
    // Trigger async load and re-run later
    getBufferGeometryUtils().then(() => updateText());
    const g = geoms[0] || new THREE.BufferGeometry();
    geoms.slice(1).forEach((x) => x.dispose());
    return g;
  }
  return _bgU.mergeGeometries(geoms, false);
}

// ============ INNER BEVEL (Photoshop-style) ============
// Two algorithms behind the same UI:
//
//   • Chisel Hard / Soft / Stroke → TextGeometry-based approach.
//     We build a `depth=0` extruded text with a single-segment bevel; that
//     produces a "double pyramid" along each glyph outline. We center it on
//     the body's front face so the back half hides inside the body, and the
//     front half sticks out as a mathematically perfect, razor-sharp ridge.
//
//   • Smooth / Pillow → distance-field displacement on a high-res plane.
//     We rasterize the silhouette, run an EXACT 1-D Saito-Toriwaki EDT (no
//     chamfer artifacts) and bilinearly sample it from the displaced
//     vertices, so the bevel band has perfectly circular contours.
function buildInnerBevelCap(bodyGeom) {
  if (!bodyGeom.boundingBox) bodyGeom.computeBoundingBox();

  // Chisel Hard → true prismatic medial-axis displacement (no plateau).
  if (state.innerBevelStyle === 'chiselHard') {
    return buildPrismaticChiselCap(bodyGeom);
  }
  // Chisel Soft / Stroke → TextGeometry trick (constant-width slopes).
  if (state.innerBevelStyle === 'chiselSoft' || state.innerBevelStyle === 'stroke') {
    return buildSharpChiselCap(bodyGeom);
  }
  return buildSmoothBevelCap(bodyGeom);
}

// ---------- TRUE PRISMATIC CHISEL HARD ----------
// Slopes go all the way from glyph outline to the medial axis (the "skeleton"
// of each stroke). No plateau on the front face. The ridge runs along the
// medial axis; corners produce miter joints automatically because the
// distance field is C¹-discontinuous there. Razor-sharp via:
//   1. Linear height = D × scale  (no clamping → no plateau)
//   2. High-res grid (resolution slider drives subdivisions)
//   3. Non-indexed buffer geometry → no normal averaging across the ridge
//   4. flatShading = true on the material
function buildPrismaticChiselCap(bodyGeom) {
  const bb = bodyGeom.boundingBox;
  const padPx = 24;
  const w = bb.max.x - bb.min.x;
  const h = bb.max.y - bb.min.y;
  if (w < 0.001 || h < 0.001) return null;

  // Render-resolution; higher = sharper miters at the cost of memory.
  const targetMax = Math.min(640, Math.max(256, state.innerBevelResolution));
  const aspect = w / h;
  let texW, texH;
  if (aspect >= 1) { texW = targetMax; texH = Math.max(96, Math.round(targetMax / aspect)); }
  else            { texH = targetMax; texW = Math.max(96, Math.round(targetMax * aspect)); }

  // 1. Rasterize silhouette via the same font shape paths as the 3D body.
  const canvas = document.createElement('canvas');
  canvas.width = texW + padPx * 2;
  canvas.height = texH + padPx * 2;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const shapes = currentFont.generateShapes(state.text && state.text.length ? state.text : ' ', state.size);
  let sxmin = Infinity, symin = Infinity, sxmax = -Infinity, symax = -Infinity;
  shapes.forEach(s => {
    const pts = s.getPoints(64);
    pts.forEach(p => {
      if (p.x < sxmin) sxmin = p.x; if (p.x > sxmax) sxmax = p.x;
      if (p.y < symin) symin = p.y; if (p.y > symax) symax = p.y;
    });
  });
  const sw = sxmax - sxmin, sh = symax - symin;
  const drawScale = Math.min(texW / sw, texH / sh);
  const offX = padPx + (texW - sw * drawScale) / 2 - sxmin * drawScale;
  const offY = padPx + (texH - sh * drawScale) / 2 + symax * drawScale;
  ctx.fillStyle = '#fff';
  shapes.forEach(shape => {
    ctx.beginPath();
    drawShape(ctx, shape, drawScale, offX, offY);
    if (shape.holes) shape.holes.forEach(hole => drawShape(ctx, hole, drawScale, offX, offY, true));
    ctx.fill('evenodd');
  });

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;
  const inside = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) inside[i] = img.data[i * 4] > 128 ? 1 : 0;

  // 2. Exact EDT (px distance to nearest exterior pixel).
  const dist = exactEDT(inside, W, H);

  // 3. Build a high-density grid plane covering the bbox.
  //    Resolution roughly matches the rasterization grid so each cell maps to
  //    1–2 pixels of the distance field — that's what gives us crisp miters.
  const segX = Math.min(380, Math.max(120, Math.round(texW / 1.4)));
  const segY = Math.min(380, Math.max(120, Math.round(texH / 1.4)));
  const plane = new THREE.PlaneGeometry(w, h, segX, segY);
  const pos = plane.attributes.position;

  // 4. Photoshop "Depth" maps to overall height; "Size" is auto from medial.
  //    `heightPerPx` converts pixel-distance into world-space ridge height.
  //    The factor 0.018 was tuned so Depth=1 looks like a moderately raised
  //    bevel without overpowering the body.
  const heightPerPx = 0.018 * state.innerBevelDepth * (state.size / drawScale * drawScale) / 1.0;
  const heightScale = state.innerBevelDepth * 0.045 / Math.max(0.0001, drawScale * 0.01);

  const dirSign = state.innerBevelDirection === 'down' ? -1 : 1;
  const vertOutside = new Uint8Array(pos.count);

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const u = (vx + w / 2) / w;
    const v = 1 - (vy + h / 2) / h;
    const fx = padPx + u * texW;
    const fy = padPx + v * texH;
    const d = sampleBilinear(dist, W, H, fx, fy);
    if (d <= 0.0) {
      vertOutside[i] = 1;
      pos.setZ(i, -0.002);
      continue;
    }
    // PRISMATIC: linear in distance, NO ceiling. The ridge forms naturally
    // wherever two opposite slopes meet (= the medial axis).
    pos.setZ(i, d * heightScale * dirSign);
  }
  pos.needsUpdate = true;

  // 5. Cull triangles fully outside the silhouette so the cap matches the
  //    glyph shape, not a rectangle.
  const oldIndex = plane.index;
  const newIdx = [];
  if (oldIndex) {
    for (let i = 0; i < oldIndex.count; i += 3) {
      const a = oldIndex.getX(i), b = oldIndex.getX(i + 1), c = oldIndex.getX(i + 2);
      if (vertOutside[a] && vertOutside[b] && vertOutside[c]) continue;
      newIdx.push(a, b, c);
    }
    plane.setIndex(newIdx);
  }

  // 6. Convert to non-indexed → each triangle gets its own 3 vertices.
  //    With flatShading=true, normals come from per-triangle cross products,
  //    so the ridge along the medial axis stays razor-sharp instead of being
  //    smoothed across by averaging neighbour-triangle normals.
  const sharpGeom = plane.toNonIndexed();
  sharpGeom.computeVertexNormals();

  let capMat;
  if (state.shadingMode === 'matcap')      capMat = matcapMaterial.clone();
  else if (state.shadingMode === 'normal') capMat = normalMaterial.clone();
  else                                     capMat = pbrMaterial.clone();
  capMat.flatShading = true;       // hard miters / facets, no shading smoothing
  capMat.side = THREE.DoubleSide;  // safety against backface culling at sharp angles
  capMat.needsUpdate = true;

  const mesh = new THREE.Mesh(sharpGeom, capMat);
  mesh.userData.disposableMaterial = true;

  // Free the original indexed plane (toNonIndexed copies; original is now unused).
  plane.dispose();

  return mesh;
}

// ---------- SHARP / CHISEL ----------
function buildSharpChiselCap(bodyGeom) {
  const bb = bodyGeom.boundingBox;

  // Photoshop's "Size" is the slope width. With our text-geom trick the slope
  // width = bevelSize. "Depth" multiplies the height (= bevelThickness).
  // Stroke = a tiny ridge sat on the outline (small thickness/size both).
  // Soft   = same shape but smoothed via more bevel segments + soften factor.
  const size = state.innerBevelSize * state.size;       // world-units
  const depth = state.innerBevelDepth * state.size * 0.45;
  const segs =
    state.innerBevelStyle === 'chiselHard' ? 1 :
    state.innerBevelStyle === 'chiselSoft' ? Math.max(2, Math.round(2 + state.innerBevelSoften * 4)) :
    /* stroke */ 1;

  // For 'stroke' we want a *thin* ridge: clamp size/depth.
  const useSize  = state.innerBevelStyle === 'stroke' ? Math.min(size, 0.04 * state.size) : size;
  const useDepth = state.innerBevelStyle === 'stroke' ? Math.min(depth, 0.04 * state.size) : depth;

  const cap = new TextGeometry(state.text || ' ', {
    font: currentFont,
    size: state.size,
    depth: 0,                     // ← key: zero extrusion makes a double pyramid
    curveSegments: state.curveSegments,
    bevelEnabled: true,
    bevelThickness: useDepth,
    bevelSize: useSize,
    bevelOffset: 0,
    bevelSegments: segs,
  });
  cap.computeBoundingBox();
  const cbb = cap.boundingBox;
  // Centre cap horizontally / vertically same as body (z is naturally centered)
  cap.translate(-(cbb.max.x + cbb.min.x) / 2, -(cbb.max.y + cbb.min.y) / 2, 0);
  cap.computeVertexNormals();

  // For chiselHard we want flat-shaded faces so the ridge is visually razor-sharp.
  const useFlat = state.innerBevelStyle === 'chiselHard';

  let capMat;
  if (state.shadingMode === 'matcap')      capMat = matcapMaterial.clone();
  else if (state.shadingMode === 'normal') capMat = normalMaterial.clone();
  else                                     capMat = pbrMaterial.clone();
  capMat.flatShading = useFlat;
  capMat.needsUpdate = true;

  const mesh = new THREE.Mesh(cap, capMat);
  mesh.userData.disposableMaterial = true;
  // Direction: 'down' = engraved (flip pyramid so it goes into the body).
  if (state.innerBevelDirection === 'down') mesh.scale.z = -1;
  return mesh;
}

// ---------- SMOOTH / PILLOW (displacement) ----------
function buildSmoothBevelCap(bodyGeom) {
  const bb = bodyGeom.boundingBox;
  const padPx = 32;
  const w = bb.max.x - bb.min.x;
  const h = bb.max.y - bb.min.y;
  if (w < 0.001 || h < 0.001) return null;

  const targetMax = state.innerBevelResolution;
  const aspect = w / h;
  let texW, texH;
  if (aspect >= 1) { texW = targetMax; texH = Math.max(64, Math.round(targetMax / aspect)); }
  else            { texH = targetMax; texW = Math.max(64, Math.round(targetMax * aspect)); }

  // Rasterise the glyph silhouette via the font's own shape paths.
  const canvas = document.createElement('canvas');
  canvas.width = texW + padPx * 2;
  canvas.height = texH + padPx * 2;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const shapes = currentFont.generateShapes(state.text && state.text.length ? state.text : ' ', state.size);
  let sxmin = Infinity, symin = Infinity, sxmax = -Infinity, symax = -Infinity;
  shapes.forEach(s => {
    const pts = s.getPoints(64);
    pts.forEach(p => {
      if (p.x < sxmin) sxmin = p.x; if (p.x > sxmax) sxmax = p.x;
      if (p.y < symin) symin = p.y; if (p.y > symax) symax = p.y;
    });
  });
  const sw = sxmax - sxmin, sh = symax - symin;
  const sx = texW / sw, sy = texH / sh;
  const drawScale = Math.min(sx, sy);
  const offX = padPx + (texW - sw * drawScale) / 2 - sxmin * drawScale;
  const offY = padPx + (texH - sh * drawScale) / 2 + symax * drawScale;
  ctx.fillStyle = '#fff';
  shapes.forEach(shape => {
    ctx.beginPath();
    drawShape(ctx, shape, drawScale, offX, offY);
    if (shape.holes) {
      shape.holes.forEach(hole => drawShape(ctx, hole, drawScale, offX, offY, true));
    }
    ctx.fill('evenodd');
  });

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;
  const inside = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) inside[i] = img.data[i * 4] > 128 ? 1 : 0;

  // Exact Saito-Toriwaki EDT: gives perfectly circular distance contours
  // (no chamfer artifacts → no "крученность" on smooth shapes).
  const dist = exactEDT(inside, W, H);

  const bevelPixels = Math.max(2, state.innerBevelSize * drawScale);
  const heightWorld = state.innerBevelDepth * 0.4;

  const segX = Math.min(380, Math.max(60, Math.round(texW / 1.5)));
  const segY = Math.min(380, Math.max(60, Math.round(texH / 1.5)));
  const plane = new THREE.PlaneGeometry(w, h, segX, segY);
  const pos = plane.attributes.position;
  const dirSign = state.innerBevelDirection === 'down' ? -1 : 1;
  const profile = bevelProfile(state.innerBevelStyle, state.innerBevelSoften);

  const vertOutside = new Uint8Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const u = (vx + w / 2) / w;
    const v = 1 - (vy + h / 2) / h;
    // Bilinear sample of distance field
    const fx = padPx + u * texW;
    const fy = padPx + v * texH;
    const d = sampleBilinear(dist, W, H, fx, fy);
    if (d <= 0) {
      vertOutside[i] = 1;
      pos.setZ(i, -0.002);
      continue;
    }
    const t = Math.min(1, d / bevelPixels);
    const z = profile(t) * heightWorld * dirSign;
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;

  const oldIndex = plane.index;
  const newIdx = [];
  if (oldIndex) {
    for (let i = 0; i < oldIndex.count; i += 3) {
      const a = oldIndex.getX(i), b = oldIndex.getX(i + 1), c = oldIndex.getX(i + 2);
      if (vertOutside[a] && vertOutside[b] && vertOutside[c]) continue;
      newIdx.push(a, b, c);
    }
    plane.setIndex(newIdx);
  }
  plane.computeVertexNormals();

  let capMat;
  if (state.shadingMode === 'matcap')      capMat = matcapMaterial.clone();
  else if (state.shadingMode === 'normal') capMat = normalMaterial.clone();
  else                                     capMat = pbrMaterial.clone();
  capMat.flatShading = false;  // smooth styles want averaged normals
  capMat.needsUpdate = true;

  const mesh = new THREE.Mesh(plane, capMat);
  mesh.userData.disposableMaterial = true;
  return mesh;
}

function drawShape(ctx, shape, scale, offX, offY) {
  const pts = shape.getPoints(64);
  pts.forEach((p, i) => {
    const x = p.x * scale + offX;
    const y = -p.y * scale + offY;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function sampleBilinear(arr, W, H, fx, fy) {
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1);
  const dx = fx - x0, dy = fy - y0;
  if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H) return 0;
  const a = arr[y0 * W + x0];
  const b = arr[y0 * W + x1];
  const c = arr[y1 * W + x0];
  const d = arr[y1 * W + x1];
  return (a * (1 - dx) + b * dx) * (1 - dy) + (c * (1 - dx) + d * dx) * dy;
}

// Exact Euclidean distance transform, Felzenszwalb & Huttenlocher 2012.
// Returns *distance in pixels* to the nearest exterior pixel for each
// interior pixel (0 outside).
function exactEDT(mask, W, H) {
  const INF = 1e20;
  const f = new Float64Array(Math.max(W, H));
  const v = new Int32Array(Math.max(W, H));
  const z = new Float64Array(Math.max(W, H) + 1);
  const sq = new Float64Array(W * H);

  // Pass 1: column-wise 1D EDT on f(x) = 0 if exterior, +INF if interior.
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) f[y] = mask[y * W + x] ? INF : 0;
    edt1D(f, H, v, z);
    for (let y = 0; y < H; y++) sq[y * W + x] = f[y];
  }
  // Pass 2: row-wise 1D EDT (now operating on squared distances)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) f[x] = sq[y * W + x];
    edt1D(f, W, v, z);
    for (let x = 0; x < W; x++) sq[y * W + x] = f[x];
  }
  // sqrt to get pixel distances; clamp to 0 for exterior.
  const out = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) out[i] = mask[i] ? Math.sqrt(sq[i]) : 0;
  return out;
}

function edt1D(f, n, v, z) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = +Infinity;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = +Infinity;
  }
  k = 0;
  // Reuse f as the temp output buffer (we read v/z, write f back).
  const tmp = new Float64Array(n);
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    tmp[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
  for (let q = 0; q < n; q++) f[q] = tmp[q];
}

// Photoshop-style profile functions (for displacement-based smooth/pillow only).
function bevelProfile(style, soften) {
  const s = THREE.MathUtils.clamp(soften, 0, 1);
  switch (style) {
    case 'smooth':
      return (t) => Math.sin(t * Math.PI / 2);
    case 'pillow':
      return (t) => {
        const a = 1 - Math.cos(t * Math.PI / 2);
        const b = Math.sin(t * Math.PI / 2);
        return a * 0.4 + b * 0.6;
      };
    default:
      return (t) => Math.min(1, t);
  }
}

function updateText() {
  if (!currentFont) return;

  // Dispose previous (geometry + per-instance materials like bevel caps)
  while (textGroup.children.length) {
    const c = textGroup.children.pop();
    if (c.geometry) c.geometry.dispose();
    // Bevel-cap meshes use a cloned material; the shared body/outline materials
    // are reused across rebuilds, so only dispose materials marked as cap.
    if (c.userData && c.userData.disposableMaterial && c.material && c.material.dispose) {
      c.material.dispose();
    }
  }

  // Main body
  const body = buildTextGeometry(state.text);
  body.computeBoundingBox();
  body.computeVertexNormals();
  const bb = body.boundingBox;
  const dx = -(bb.max.x + bb.min.x) / 2;
  const dy = -(bb.max.y + bb.min.y) / 2;
  const dz = -(bb.max.z + bb.min.z) / 2;
  body.translate(dx, dy, dz);

  const mat = pickActiveMaterial();

  function addInstance(mirror) {
    const mesh = new THREE.Mesh(body, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (mirror) {
      mesh.scale.x = mirror.x ? -1 : 1;
      mesh.scale.y = mirror.y ? -1 : 1;
    }
    textGroup.add(mesh);

    // Outline
    if (state.outlineOn && state.shadingMode !== 'normal') {
      const om = new THREE.Mesh(body, outlineMaterial);
      om.scale.copy(mesh.scale).multiplyScalar(1 + state.outlineThickness);
      textGroup.add(om);
    }

    // Inner bevel — Photoshop-style distance-field heightmap cap
    if (state.innerBevel && state.innerBevelSize > 0 && state.innerBevelDepth > 0) {
      const cap = buildInnerBevelCap(body);
      if (cap) {
        // Cap is built around origin in local space; place it on the front face.
        cap.position.z = bb.max.z + dz + 0.0005;  // tiny epsilon to avoid z-fight
        cap.castShadow = true;
        cap.receiveShadow = true;
        if (mirror) { cap.scale.x = mirror.x ? -1 : 1; cap.scale.y = mirror.y ? -1 : 1; }
        textGroup.add(cap);
      }
    }
  }

  addInstance(null);
  if (state.mirrorX) addInstance({ x: true, y: false });
  if (state.mirrorY) addInstance({ x: false, y: true });
  if (state.mirrorX && state.mirrorY) addInstance({ x: true, y: true });

  // Stats
  textTriCount = 0; textVertCount = 0;
  textGroup.traverse((obj) => {
    if (obj.isMesh && obj.geometry && obj.geometry.attributes.position) {
      const pos = obj.geometry.attributes.position;
      textVertCount += pos.count;
      const idx = obj.geometry.index;
      textTriCount += idx ? idx.count / 3 : pos.count / 3;
    }
  });
  updateStats();
}

// ============ DECORATIONS ============
// Stable per-instance "seeds" so animation looks consistent between rebuilds.
function hashSeed(i, k = 0) {
  return ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
}

function rebuildDecorations() {
  while (decorationsGroup.children.length) {
    const c = decorationsGroup.children.pop();
    if (c.geometry) c.geometry.dispose();
    if (c.material && c.material.dispose) c.material.dispose();
  }
  if (state.decorationType === 'none' || state.decorationCount <= 0) return;

  const def = DECORATIONS.find(d => d.id === state.decorationType);
  if (!def || !def.make) return;

  const baseGeom = def.make();
  if (!baseGeom) return;

  // Material — we use one PBR for all instances (instanced is overkill here
  // because counts are small).
  const m = new THREE.MeshPhysicalMaterial({
    color: state.decorationColor,
    metalness: def.glassy ? 0.0 : state.decorationMetalness,
    roughness: def.glassy ? 0.05 : state.decorationRoughness,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    transmission: def.glassy ? 0.85 : 0,
    ior: def.glassy ? 1.5 : 1.5,
    thickness: def.glassy ? 0.3 : 0.5,
    emissive: state.decorationEmissive > 0 ? state.decorationColor : '#000000',
    emissiveIntensity: state.decorationEmissive,
    envMapIntensity: 1.5,
  });

  // Layout: ring around text. textGroup gets centered at origin so we orbit
  // the origin at radius based on `decorationSpread`.
  const N = state.decorationCount;
  const radius = state.decorationSpread;

  for (let i = 0; i < N; i++) {
    const mesh = new THREE.Mesh(baseGeom, m);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.scale.setScalar(state.decorationScale * (0.85 + hashSeed(i, 1) * 0.3));

    if (def.id === 'chain' && def.ring) {
      // Lay out chain links along a circle, each link rotated 90° from neighbour
      const a = (i / N) * Math.PI * 2;
      mesh.position.set(Math.cos(a) * radius, Math.sin(a) * radius * 0.55, 0);
      mesh.rotation.z = a + Math.PI / 2;
      mesh.rotation.y = (i % 2) ? 0 : Math.PI / 2;  // alternating link orientation
    } else {
      // Random points on a sphere shell (slightly elongated horizontally)
      const a = (i / N) * Math.PI * 2 + hashSeed(i, 2) * 0.5;
      const elevation = (hashSeed(i, 3) - 0.5) * Math.PI * 0.7;
      const r = radius * (0.8 + hashSeed(i, 4) * 0.4);
      mesh.position.set(
        Math.cos(a) * Math.cos(elevation) * r * 1.4,
        Math.sin(elevation) * r,
        Math.sin(a) * Math.cos(elevation) * r * 0.6 - 0.3
      );
      mesh.rotation.set(
        hashSeed(i, 5) * Math.PI * 2,
        hashSeed(i, 6) * Math.PI * 2,
        hashSeed(i, 7) * Math.PI * 2
      );
    }

    // Save initial position/rotation for animation
    mesh.userData.basePos = mesh.position.clone();
    mesh.userData.baseRot = mesh.rotation.clone();
    mesh.userData.seed = i;
    decorationsGroup.add(mesh);
  }
}

function animateDecorations(dt, totalT) {
  if (state.decorationType === 'none') return;
  decorationsGroup.children.forEach((mesh) => {
    // Skip while user is currently dragging this item.
    if (mesh.userData.dragging) return;
    // Pinned items keep their custom position/rotation (no float, no spin).
    if (mesh.userData.pinned) return;
    const i = mesh.userData.seed || 0;
    if (state.decorationFloat) {
      const phase = hashSeed(i, 11) * Math.PI * 2;
      mesh.position.y = mesh.userData.basePos.y + Math.sin(totalT * 1.2 + phase) * 0.08;
    }
    if (state.decorationSpinIndividual) {
      const sx = (hashSeed(i, 12) - 0.5) * 1.5;
      const sy = (hashSeed(i, 13) - 0.5) * 1.5 + 0.8;
      mesh.rotation.x = mesh.userData.baseRot.x + totalT * sx;
      mesh.rotation.y = mesh.userData.baseRot.y + totalT * sy;
    }
  });
}

// ============ DECORATION DRAG-AND-DROP ============
// Pointer down on a decoration → grab it. Drag along a plane that faces the
// camera and passes through the item's current position. Pointer up → release.
// While dragging, OrbitControls is disabled so the camera doesn't move.
const dragRaycaster = new THREE.Raycaster();
const dragPointerNDC = new THREE.Vector2();
const dragPlane = new THREE.Plane();
const dragPlaneNormal = new THREE.Vector3();
const dragHitPoint = new THREE.Vector3();
const dragOffset = new THREE.Vector3();
let draggedItem = null;
let dragMoved = false;

function pointerToNDC(ev) {
  const r = canvas.getBoundingClientRect();
  dragPointerNDC.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
  dragPointerNDC.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
}

function onDecorationPointerDown(ev) {
  if (state.decorationType === 'none' || decorationsGroup.children.length === 0) return;
  // Only left button / primary touch
  if (ev.pointerType === 'mouse' && ev.button !== 0) return;

  pointerToNDC(ev);
  dragRaycaster.setFromCamera(dragPointerNDC, camera);
  const hits = dragRaycaster.intersectObjects(decorationsGroup.children, true);
  if (!hits.length) return;

  // Find the top-level decoration (raycast may hit a child geometry).
  let target = hits[0].object;
  while (target.parent && target.parent !== decorationsGroup) target = target.parent;

  draggedItem = target;
  draggedItem.userData.dragging = true;
  dragMoved = false;

  // Build a plane through the item's position, facing the camera.
  camera.getWorldDirection(dragPlaneNormal).negate();
  dragPlane.setFromNormalAndCoplanarPoint(dragPlaneNormal, target.position);
  dragRaycaster.ray.intersectPlane(dragPlane, dragHitPoint);
  dragOffset.copy(target.position).sub(dragHitPoint);

  // Disable orbit so the camera doesn't move while we drag.
  controls.enabled = false;
  canvas.style.cursor = 'grabbing';

  // Capture pointer so we keep getting events even if we leave the canvas.
  canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId);
  // Stop OrbitControls from also seeing this event.
  ev.stopImmediatePropagation();
  ev.preventDefault();
}

let lastHoverCheck = 0;
function onDecorationPointerMove(ev) {
  if (!draggedItem) {
    // Hover cursor feedback (throttled — raycasting on every mouse move is wasteful).
    const now = performance.now();
    if (now - lastHoverCheck > 80 && state.decorationType !== 'none' && decorationsGroup.children.length) {
      lastHoverCheck = now;
      pointerToNDC(ev);
      dragRaycaster.setFromCamera(dragPointerNDC, camera);
      const hits = dragRaycaster.intersectObjects(decorationsGroup.children, true);
      canvas.style.cursor = hits.length ? 'grab' : '';
    }
    return;
  }

  pointerToNDC(ev);
  dragRaycaster.setFromCamera(dragPointerNDC, camera);
  if (dragRaycaster.ray.intersectPlane(dragPlane, dragHitPoint)) {
    draggedItem.position.copy(dragHitPoint).add(dragOffset);
    // After moving, pin the item so float/spin no longer overrides position.
    draggedItem.userData.pinned = true;
    // Update basePos so animation (if re-enabled) uses the new anchor.
    draggedItem.userData.basePos.copy(draggedItem.position);
    dragMoved = true;
  }
}

function onDecorationPointerUp(ev) {
  if (!draggedItem) return;
  draggedItem.userData.dragging = false;
  draggedItem = null;
  controls.enabled = true;
  canvas.style.cursor = '';
  if (canvas.releasePointerCapture && ev.pointerId !== undefined) {
    try { canvas.releasePointerCapture(ev.pointerId); } catch {}
  }
}

canvas.addEventListener('pointerdown', onDecorationPointerDown, { capture: true });
canvas.addEventListener('pointermove', onDecorationPointerMove);
canvas.addEventListener('pointerup', onDecorationPointerUp, { capture: true });
canvas.addEventListener('pointercancel', onDecorationPointerUp, { capture: true });

// Reset all manual placements (used by the panel button).
function unpinAllDecorations() {
  decorationsGroup.children.forEach((m) => {
    m.userData.pinned = false;
    if (m.userData.basePos) m.position.copy(m.userData.basePos);
  });
}


function applyMaterial() {
  // PBR
  pbrMaterial.color.set(state.color);
  pbrMaterial.roughness = state.roughness;
  pbrMaterial.metalness = state.metalness;
  pbrMaterial.clearcoat = state.clearcoat;
  pbrMaterial.clearcoatRoughness = state.clearcoatRoughness;
  pbrMaterial.reflectivity = state.reflectivity;
  pbrMaterial.envMapIntensity = state.envIntensity * 1.25;
  pbrMaterial.flatShading = state.flatShading;
  pbrMaterial.wireframe = state.wireframe;
  pbrMaterial.emissive.set(state.emissive);
  pbrMaterial.emissiveIntensity = state.emissiveIntensity;
  pbrMaterial.transmission = state.transmission;
  pbrMaterial.ior = state.ior;
  pbrMaterial.thickness = state.thickness;
  pbrMaterial.sheen = state.sheen;
  pbrMaterial.sheenColor.set(state.sheenColor);
  pbrMaterial.sheenRoughness = state.sheenRoughness;
  pbrMaterial.iridescence = state.iridescence;
  pbrMaterial.iridescenceIOR = state.iridescenceIOR;
  pbrMaterial.iridescenceThicknessRange = [100, state.iridescenceThickness];
  pbrMaterial.needsUpdate = true;

  // Matcap
  matcapMaterial.matcap = matcapTextures[state.matcapId] || matcapTextures.silver;
  matcapMaterial.flatShading = state.flatShading;
  matcapMaterial.wireframe = state.wireframe;
  matcapMaterial.needsUpdate = true;

  // Normal
  normalMaterial.flatShading = state.flatShading;
  normalMaterial.wireframe = state.wireframe;

  // Outline
  outlineMaterial.color.set(state.outlineColor);

  // Bevel-cap material clones — keep them in sync with the body's material.
  textGroup.traverse((obj) => {
    if (obj.isMesh && obj.userData && obj.userData.disposableMaterial && obj.material) {
      const m = obj.material;
      if (m.color) m.color.set(state.color);
      if ('roughness' in m) m.roughness = state.roughness;
      if ('metalness' in m) m.metalness = state.metalness;
      if ('clearcoat' in m) m.clearcoat = state.clearcoat;
      if ('clearcoatRoughness' in m) m.clearcoatRoughness = state.clearcoatRoughness;
      if ('reflectivity' in m) m.reflectivity = state.reflectivity;
      if ('emissive' in m) m.emissive.set(state.emissive);
      if ('emissiveIntensity' in m) m.emissiveIntensity = state.emissiveIntensity;
      if ('envMapIntensity' in m) m.envMapIntensity = state.envIntensity * 1.25;
      m.needsUpdate = true;
    }
  });
}

// ============ HDRI / BACKGROUND ============
let hdriLoadingId = 0;
let currentHdriTexture = null;
async function loadHDRI(presetId) {
  const preset = HDRI_PRESETS.find((p) => p.id === presetId);
  if (!preset) return;
  const myId = ++hdriLoadingId;
  if (!preset.url) {
    const envScene = new RoomEnvironment();
    const envTex = pmrem.fromScene(envScene, 0.04).texture;
    if (myId === hdriLoadingId) { scene.environment = envTex; currentHdriTexture = envTex; applyBackground(); }
    return;
  }
  return new Promise((resolve) => {
    new RGBELoader().load(
      preset.url,
      (tex) => {
        const envTex = pmrem.fromEquirectangular(tex).texture;
        if (myId === hdriLoadingId) { scene.environment = envTex; currentHdriTexture = envTex; applyBackground(); }
        tex.dispose();
        resolve();
      },
      undefined,
      (err) => {
        console.warn('HDRI load failed, using neutral room:', err);
        const envScene = new RoomEnvironment();
        const envTex = pmrem.fromScene(envScene, 0.04).texture;
        if (myId === hdriLoadingId) { scene.environment = envTex; currentHdriTexture = envTex; applyBackground(); }
        resolve();
      }
    );
  });
}

function applyBackground() {
  if (state.bgMode === 'transparent') {
    scene.background = null;
    return;
  }
  if (state.bgMode === 'hdri') {
    scene.background = currentHdriTexture;
    return;
  }
  if (state.bgMode === 'gradient') {
    scene.background = null; // we render the gradient quad ourselves
    return;
  }
  scene.background = new THREE.Color(state.background);
}

// ============ UI BUILDER ============
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}

function makeSection(id, title, icon, build, opts = {}) {
  const sec = el('div', { class: 'section' + (opts.collapsed ? ' collapsed' : ''), id: 'sec-' + id });
  const head = el('div', { class: 'section-header' });
  head.innerHTML = `<span class="title"><span class="icon">${icon}</span>${title}</span><span class="chev">▼</span>`;
  const body = el('div', { class: 'body' });
  build(body);
  sec.appendChild(head);
  sec.appendChild(body);
  head.addEventListener('click', () => sec.classList.toggle('collapsed'));
  return sec;
}

function makeSlider(label, key, min, max, step, integer = false) {
  const wrap = el('div', { class: 'flex flex-col gap-1.5' });
  const top = el('div', { class: 'row' });
  const num = el('input', { type: 'number', min, max, step, class: 'input-base' });
  num.value = state[key];
  top.appendChild(el('span', { class: 'row-label' }, [label]));
  top.appendChild(num);

  const range = document.createElement('input');
  range.type = 'range'; range.min = min; range.max = max; range.step = step;
  range.className = 'range-pro';
  range.value = state[key];

  const setFill = () => {
    const pct = ((Number(state[key]) - min) / (max - min)) * 100;
    range.style.setProperty('--val', pct + '%');
  };
  setFill();

  const apply = (v) => {
    let val = parseFloat(v);
    if (Number.isNaN(val)) return;
    if (integer) val = Math.round(val);
    val = Math.max(min, Math.min(max, val));
    pushUndo();
    state[key] = val;
    range.value = val;
    num.value = val;
    setFill();
    handleChange(key);
  };
  range.addEventListener('input', (e) => apply(e.target.value));
  num.addEventListener('input', (e) => apply(e.target.value));

  wrap.appendChild(top);
  wrap.appendChild(range);
  return wrap;
}

function makeSelect(label, key, options) {
  const wrap = el('div', { class: 'row' });
  wrap.appendChild(el('span', { class: 'row-label' }, [label]));
  const sel = el('select', { class: 'input-base' });
  options.forEach((opt) => {
    const o = document.createElement('option');
    o.value = opt.value; o.textContent = opt.label;
    sel.appendChild(o);
  });
  sel.value = state[key];
  sel.addEventListener('change', (e) => { pushUndo(); state[key] = e.target.value; handleChange(key); });
  wrap.appendChild(sel);
  return wrap;
}

function makeColor(label, key) {
  const wrap = el('div', { class: 'row' });
  wrap.appendChild(el('span', { class: 'row-label' }, [label]));
  const box = el('div', { class: 'color-box' });
  const color = el('input', { type: 'color' }); color.value = state[key];
  const text = el('input', { type: 'text', spellcheck: 'false' }); text.value = String(state[key]).toUpperCase();
  const apply = (v) => {
    if (!/^#([0-9a-f]{6})$/i.test(v)) return;
    pushUndo();
    state[key] = v;
    color.value = v;
    text.value = v.toUpperCase();
    handleChange(key);
  };
  color.addEventListener('input', (e) => apply(e.target.value));
  text.addEventListener('input', (e) => apply(e.target.value));
  text.addEventListener('blur', () => { text.value = String(state[key]).toUpperCase(); });
  box.appendChild(color); box.appendChild(text);
  wrap.appendChild(box);
  return wrap;
}

function makeToggle(label, key, hint) {
  const wrap = el('div', { class: 'row' });
  const left = el('div', { class: 'flex flex-col min-w-0' }, [
    el('span', { class: 'row-label' }, [label]),
    hint ? el('span', { class: 'hint' }, [hint]) : null,
  ]);
  const tog = el('div', { class: 'toggle' + (state[key] ? ' on' : '') });
  tog.appendChild(el('span', { class: 'knob' }));
  tog.addEventListener('click', () => {
    pushUndo();
    state[key] = !state[key];
    tog.classList.toggle('on', state[key]);
    handleChange(key);
  });
  wrap.appendChild(left); wrap.appendChild(tog);
  return wrap;
}

function buildPanel() {
  panel.innerHTML = '';

  // ========== TEXT ==========
  panel.appendChild(makeSection('text', 'Text', 'T', (b) => {
    const ta = el('textarea', { class: 'input-base', rows: 3, placeholder: 'Type to sculpt…\n(use newline for multi-line)', spellcheck: 'false' });
    ta.value = state.text;
    const charCounter = el('span', { class: 'font-mono' }, [state.text.length + ' chars']);
    ta.addEventListener('input', (e) => {
      pushUndo(); state.text = e.target.value;
      charCounter.textContent = state.text.length + ' chars';
      handleChange('text');
    });
    b.appendChild(ta);
    b.appendChild(el('div', { class: 'flex items-center justify-between text-[10px] text-ink-200' }, [
      charCounter,
      el('span', { class: 'flex items-center gap-1' }, [
        el('span', { class: 'w-1 h-1 rounded-full bg-emerald-400' }), ' Live update',
      ]),
    ]));
    b.appendChild(makeSlider('Letter Spacing', 'letterSpacing', -0.3, 0.5, 0.005));
    b.appendChild(makeSlider('Line Height', 'lineHeight', 0.6, 2.5, 0.05));
  }));

  // ========== TYPOGRAPHY ==========
  panel.appendChild(makeSection('typography', 'Typography', '¶', (b) => {
    const fontOpts = DEFAULT_FONTS.map((f) => ({ value: f.id, label: f.name }));
    if (state.customFontName) fontOpts.push({ value: 'custom', label: state.customFontName + ' (Custom)' });
    b.appendChild(makeSelect('Font', 'fontId', fontOpts));

    const wrap = el('div', { class: 'flex flex-col gap-1.5' });
    wrap.appendChild(el('span', { class: 'row-label' }, ['Custom Font']));
    const btn = el('button', { class: 'upload-btn', type: 'button' });
    btn.innerHTML = `<span>⬆</span><span class="upload-label">${state.customFontName || 'Click to upload font'}</span>`;
    const file = el('input', { type: 'file', accept: '.ttf,.otf,.json', style: 'display:none' });
    btn.addEventListener('click', () => file.click());
    file.addEventListener('change', async (e) => {
      const f = e.target.files?.[0]; file.value = '';
      if (!f) return;
      btn.querySelector('.upload-label').textContent = 'Loading…';
      const oldErr = wrap.querySelector('.error-msg'); if (oldErr) oldErr.remove();
      try {
        const font = await loadFontFromFile(f);
        state.customFont = font; state.customFontName = f.name; state.fontId = 'custom';
        buildPanel(); await setActiveFont(); updateHud();
      } catch (err) {
        btn.querySelector('.upload-label').textContent = state.customFontName || 'Click to upload font';
        wrap.appendChild(el('p', { class: 'error-msg' }, [err.message || 'Failed to load font']));
      }
    });
    wrap.appendChild(btn); wrap.appendChild(file);
    wrap.appendChild(el('p', { class: 'hint' }, ['Supports .ttf, .otf, or three.js .json typeface']));
    b.appendChild(wrap);

    b.appendChild(makeSlider('Size', 'size', 0.1, 3, 0.05));
  }));

  // ========== GEOMETRY ==========
  panel.appendChild(makeSection('geometry', 'Geometry', '▣', (b) => {
    b.appendChild(makeSlider('Depth', 'depth', 0.01, 2, 0.01));
    b.appendChild(makeSlider('Curve Segments', 'curveSegments', 2, 32, 1, true));
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Bevel', 'bevelEnabled', 'Rounded edges'));
    if (state.bevelEnabled) {
      b.appendChild(makeSlider('Bevel Thickness', 'bevelThickness', 0, 0.3, 0.005));
      b.appendChild(makeSlider('Bevel Size', 'bevelSize', 0, 0.2, 0.005));
      b.appendChild(makeSlider('Bevel Offset', 'bevelOffset', -0.15, 0.15, 0.005));
      b.appendChild(makeSlider('Bevel Segments', 'bevelSegments', 1, 16, 1, true));
    }
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Inner Bevel', 'innerBevel', 'Photoshop-style Bevel & Emboss'));
    if (state.innerBevel) {
      b.appendChild(makeSelect('Style', 'innerBevelStyle', [
        { value: 'chiselHard', label: '⚔ Chisel Hard (sharp)' },
        { value: 'chiselSoft', label: '⚒ Chisel Soft' },
        { value: 'smooth',     label: '◐ Smooth (rounded)' },
        { value: 'pillow',     label: '☁ Pillow' },
        { value: 'stroke',     label: '⌖ Stroke (thin ridge)' },
      ]));
      b.appendChild(makeSelect('Direction', 'innerBevelDirection', [
        { value: 'up',   label: '▲ Up (raised)' },
        { value: 'down', label: '▼ Down (engraved)' },
      ]));
      b.appendChild(makeSlider('Depth', 'innerBevelDepth', 0.05, 2, 0.01));
      b.appendChild(makeSlider('Size', 'innerBevelSize', 0.005, 0.3, 0.005));
      b.appendChild(makeSlider('Soften', 'innerBevelSoften', 0, 1, 0.01));
      b.appendChild(makeSlider('Quality', 'innerBevelResolution', 128, 1024, 32, true));
      b.appendChild(el('p', { class: 'hint' }, [
        'Chisel Hard = prismatic (slopes meet at the centerline, no plateau). Higher Quality = sharper miters.',
      ]));

      // Quick presets
      const presets = [
        { name: 'Sharp Chisel', vals: { innerBevelStyle: 'chiselHard', innerBevelSoften: 0, innerBevelDepth: 1.0, innerBevelSize: 0.06 } },
        { name: 'Carved Stone', vals: { innerBevelStyle: 'chiselHard', innerBevelSoften: 0.1, innerBevelDepth: 0.7, innerBevelSize: 0.10 } },
        { name: 'Soft Plastic', vals: { innerBevelStyle: 'smooth', innerBevelSoften: 0.5, innerBevelDepth: 0.5, innerBevelSize: 0.10 } },
        { name: 'Pillow',       vals: { innerBevelStyle: 'pillow', innerBevelSoften: 0.3, innerBevelDepth: 0.6, innerBevelSize: 0.12 } },
        { name: 'Engraved',     vals: { innerBevelStyle: 'chiselHard', innerBevelDirection: 'down', innerBevelSoften: 0, innerBevelDepth: 0.8, innerBevelSize: 0.05 } },
        { name: 'Outline Edge', vals: { innerBevelStyle: 'stroke', innerBevelSoften: 0, innerBevelDepth: 0.6, innerBevelSize: 0.04 } },
      ];
      const grid = el('div', { class: 'preset-grid', style: 'grid-template-columns: 1fr 1fr;' });
      presets.forEach(p => {
        const btn = el('button', { class: 'preset-btn', type: 'button', style: 'justify-content:center;' });
        btn.textContent = p.name;
        btn.addEventListener('click', () => {
          pushUndo();
          Object.assign(state, p.vals);
          buildPanel(); updateText();
        });
        grid.appendChild(btn);
      });
      b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider pt-2' }, ['Bevel Presets']));
      b.appendChild(grid);
    }
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Mirror X', 'mirrorX', 'Зеркально отразить по X'));
    b.appendChild(makeToggle('Mirror Y', 'mirrorY', 'Зеркально отразить по Y'));
  }), { collapsed: false });

  // ========== MATERIAL ==========
  panel.appendChild(makeSection('material', 'Material', '✦', (b) => {
    b.appendChild(makeSelect('Shading', 'shadingMode', [
      { value: 'pbr', label: 'PBR (Physical)' },
      { value: 'matcap', label: 'Matcap' },
      { value: 'normal', label: 'Normal Map' },
    ]));

    if (state.shadingMode === 'matcap') {
      b.appendChild(makeSelect('Matcap', 'matcapId', MATCAPS.map((m) => ({ value: m.id, label: m.name }))));
    }

    if (state.shadingMode === 'pbr') {
      b.appendChild(makeColor('Color', 'color'));
      b.appendChild(makeSlider('Roughness', 'roughness', 0, 1, 0.01));
      b.appendChild(makeSlider('Metalness', 'metalness', 0, 1, 0.01));
      b.appendChild(makeSlider('Clearcoat', 'clearcoat', 0, 1, 0.01));
      b.appendChild(makeSlider('Clearcoat Rough.', 'clearcoatRoughness', 0, 1, 0.01));
      b.appendChild(makeSlider('Reflectivity', 'reflectivity', 0, 1, 0.01));
    }

    b.appendChild(makeToggle('Wireframe', 'wireframe'));
    b.appendChild(makeToggle('Flat Shading', 'flatShading'));

    if (state.shadingMode === 'pbr') {
      const presets = el('div', { class: 'flex flex-col gap-2 pt-2', style: 'border-top: 1px solid rgba(54,58,69,0.15)' });
      presets.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Material Presets']));
      const grid = el('div', { class: 'preset-grid' });
      MATERIAL_PRESETS.forEach((p) => {
        const btn = el('button', { class: 'preset-btn', type: 'button' });
        btn.innerHTML = `<span class="preset-swatch" style="background:${p.swatch}"></span><span class="truncate">${p.name}</span>`;
        btn.addEventListener('click', () => {
          pushUndo();
          // Reset extras to defaults first, then apply preset values
          Object.assign(state, {
            emissive: '#000000', emissiveIntensity: 0,
            transmission: 0, ior: 1.5, sheen: 0, iridescence: 0,
          });
          Object.assign(state, p.vals);
          buildPanel(); handleChange('color');
        });
        grid.appendChild(btn);
      });
      presets.appendChild(grid);
      b.appendChild(presets);
    }
  }));

  // ========== ADVANCED MATERIAL (PBR only) ==========
  if (state.shadingMode === 'pbr') {
    panel.appendChild(makeSection('material-extras', 'Advanced Material', '⚛', (b) => {
      b.appendChild(makeColor('Emissive', 'emissive'));
      b.appendChild(makeSlider('Emissive Intensity', 'emissiveIntensity', 0, 5, 0.05));
      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(makeSlider('Transmission', 'transmission', 0, 1, 0.01));
      b.appendChild(makeSlider('IOR', 'ior', 1, 2.5, 0.01));
      b.appendChild(makeSlider('Thickness', 'thickness', 0, 5, 0.05));
      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(makeSlider('Sheen', 'sheen', 0, 1, 0.01));
      b.appendChild(makeColor('Sheen Color', 'sheenColor'));
      b.appendChild(makeSlider('Sheen Roughness', 'sheenRoughness', 0, 1, 0.01));
      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(makeSlider('Iridescence', 'iridescence', 0, 1, 0.01));
      b.appendChild(makeSlider('Iridescence IOR', 'iridescenceIOR', 1, 2.5, 0.01));
      b.appendChild(makeSlider('Iridescence Thickness', 'iridescenceThickness', 100, 1000, 10, true));
    }, { collapsed: true }));
  }

  // ========== OUTLINE ==========
  panel.appendChild(makeSection('outline', 'Outline (Toon)', '◇', (b) => {
    b.appendChild(makeToggle('Enable Outline', 'outlineOn'));
    if (state.outlineOn) {
      b.appendChild(makeSlider('Thickness', 'outlineThickness', 0.005, 0.1, 0.005));
      b.appendChild(makeColor('Color', 'outlineColor'));
    }
  }, { collapsed: true }));

  // ========== DECORATIONS (3D items around the text) ==========
  panel.appendChild(makeSection('decorations', '🎁 3D Decorations', '🎁', (b) => {
    b.appendChild(makeSelect('Type', 'decorationType',
      DECORATIONS.map(d => ({ value: d.id, label: d.name }))
    ));
    if (state.decorationType !== 'none') {
      b.appendChild(makeSlider('Count', 'decorationCount', 1, 60, 1, true));
      b.appendChild(makeSlider('Scale', 'decorationScale', 0.2, 3, 0.05));
      b.appendChild(makeSlider('Spread', 'decorationSpread', 0.5, 5, 0.05));
      b.appendChild(makeColor('Color', 'decorationColor'));
      b.appendChild(makeSlider('Metalness', 'decorationMetalness', 0, 1, 0.01));
      b.appendChild(makeSlider('Roughness', 'decorationRoughness', 0, 1, 0.01));
      b.appendChild(makeSlider('Glow', 'decorationEmissive', 0, 4, 0.05));
      b.appendChild(makeToggle('Float Animation', 'decorationFloat'));
      b.appendChild(makeToggle('Spin Each Item', 'decorationSpinIndividual'));

      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(el('p', { class: 'hint' }, [
        '✋ Drag items in the viewport to place them anywhere. Dragged items get pinned and stop floating.',
      ]));
      const resetBtn = el('button', { class: 'btn-secondary', type: 'button' }, ['↺ Reset positions']);
      resetBtn.addEventListener('click', () => { unpinAllDecorations(); });
      b.appendChild(resetBtn);
    }

    // Quick "vibe" presets — combinations that look great
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Vibe Presets']));
    const vibes = [
      { name: '⭐ Stardust',       vals: { decorationType: 'star',    decorationCount: 24, decorationColor: '#ffe066', decorationEmissive: 1.5, decorationScale: 0.7, decorationSpread: 2.4 } },
      { name: '✦ Sparkle Magic',   vals: { decorationType: 'sparkle', decorationCount: 30, decorationColor: '#ffffff', decorationEmissive: 2.5, decorationScale: 0.6, decorationSpread: 2.2 } },
      { name: '♫ Music Vibes',     vals: { decorationType: 'note2',   decorationCount: 12, decorationColor: '#a855f7', decorationEmissive: 0.4, decorationScale: 1.0, decorationSpread: 2.5 } },
      { name: '❤ Love',            vals: { decorationType: 'heart',   decorationCount: 18, decorationColor: '#ff5e9c', decorationEmissive: 0.3, decorationScale: 0.7, decorationSpread: 2.2 } },
      { name: '⛓ Chained',         vals: { decorationType: 'chain',   decorationCount: 28, decorationColor: '#c8c8c8', decorationMetalness: 1, decorationRoughness: 0.2, decorationScale: 0.9, decorationSpread: 2.8 } },
      { name: '👑 Royal',          vals: { decorationType: 'crown',   decorationCount: 6,  decorationColor: '#ffd166', decorationMetalness: 1, decorationRoughness: 0.15, decorationScale: 0.9, decorationSpread: 2.8 } },
      { name: '⚡ Electric',       vals: { decorationType: 'bolt',    decorationCount: 14, decorationColor: '#7dd3fc', decorationEmissive: 2.5, decorationScale: 0.8, decorationSpread: 2.4 } },
      { name: '💎 Diamonds',       vals: { decorationType: 'diamond', decorationCount: 16, decorationColor: '#bae6fd', decorationScale: 0.6, decorationSpread: 2.4 } },
      { name: '🔥 Fire Ring',      vals: { decorationType: 'flame',   decorationCount: 16, decorationColor: '#ff6a00', decorationEmissive: 3.0, decorationScale: 0.8, decorationSpread: 2.2 } },
      { name: '○ Bubbles',         vals: { decorationType: 'bubble',  decorationCount: 22, decorationColor: '#bae6fd', decorationScale: 0.6, decorationSpread: 2.2 } },
      { name: '@ Galaxy Spirals',  vals: { decorationType: 'spiral',  decorationCount: 8,  decorationColor: '#a855f7', decorationEmissive: 1.0, decorationScale: 1.2, decorationSpread: 2.5 } },
      { name: '○ Saturn Rings',    vals: { decorationType: 'ring',    decorationCount: 5,  decorationColor: '#ffd166', decorationMetalness: 1, decorationScale: 1.3, decorationSpread: 2.4 } },
    ];
    const grid = el('div', { class: 'preset-grid', style: 'grid-template-columns: 1fr 1fr;' });
    vibes.forEach(v => {
      const btn = el('button', { class: 'preset-btn', type: 'button', style: 'justify-content:center;' });
      btn.textContent = v.name;
      btn.addEventListener('click', () => {
        pushUndo();
        Object.assign(state, v.vals);
        buildPanel(); rebuildDecorations();
      });
      grid.appendChild(btn);
    });
    b.appendChild(grid);
  }));

  // ========== ENVIRONMENT ==========
  panel.appendChild(makeSection('environment', 'Environment', '◯', (b) => {
    b.appendChild(makeSelect('Background', 'bgMode', [
      { value: 'solid', label: 'Solid Color' },
      { value: 'gradient', label: 'Gradient' },
      { value: 'hdri', label: 'HDRI as Background' },
      { value: 'transparent', label: 'Transparent' },
    ]));

    if (state.bgMode === 'solid') {
      b.appendChild(makeColor('BG Color', 'background'));
      const swatchRow = el('div', { class: 'bg-swatch-row' });
      BG_PRESETS.forEach((c) => {
        const sw = el('button', { class: 'bg-swatch' + (state.background.toLowerCase() === c.toLowerCase() ? ' active' : ''), type: 'button' });
        sw.style.background = c;
        sw.addEventListener('click', () => { pushUndo(); state.background = c; buildPanel(); handleChange('background'); });
        swatchRow.appendChild(sw);
      });
      b.appendChild(swatchRow);
    }
    if (state.bgMode === 'gradient') {
      b.appendChild(makeColor('Top', 'bgGradientTop'));
      b.appendChild(makeColor('Bottom', 'bgGradientBottom'));
    }

    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeSelect('HDRI', 'envPreset', HDRI_PRESETS.map((p) => ({ value: p.id, label: p.name }))));
    b.appendChild(makeSlider('Env Intensity', 'envIntensity', 0, 3, 0.05));
    b.appendChild(makeToggle('Ground Shadow', 'showShadows', 'Soft shadow under text'));
    b.appendChild(makeToggle('Show Grid', 'showGrid', 'Floor grid helper'));
  }));

  // ========== LIGHTING ==========
  panel.appendChild(makeSection('lighting', 'Lighting', '☀', (b) => {
    b.appendChild(makeSlider('Ambient', 'ambientIntensity', 0, 2, 0.02));
    b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Key Light (Directional)']));
    b.appendChild(makeSlider('Intensity', 'dirIntensity', 0, 5, 0.05));
    b.appendChild(makeColor('Color', 'dirColor'));
    b.appendChild(makeSlider('Position X', 'dirX', -10, 10, 0.1));
    b.appendChild(makeSlider('Position Y', 'dirY', -10, 10, 0.1));
    b.appendChild(makeSlider('Position Z', 'dirZ', -10, 10, 0.1));
    b.appendChild(makeToggle('Cast Shadow', 'dirShadow'));

    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Fill Light (cyan)', 'light2On'));
    if (state.light2On) {
      b.appendChild(makeColor('Color', 'light2Color'));
      b.appendChild(makeSlider('Intensity', 'light2Intensity', 0, 10, 0.1));
      b.appendChild(makeSlider('Pos X', 'light2X', -10, 10, 0.1));
      b.appendChild(makeSlider('Pos Y', 'light2Y', -10, 10, 0.1));
      b.appendChild(makeSlider('Pos Z', 'light2Z', -10, 10, 0.1));
    }
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Rim Light (pink)', 'light3On'));
    if (state.light3On) {
      b.appendChild(makeColor('Color', 'light3Color'));
      b.appendChild(makeSlider('Intensity', 'light3Intensity', 0, 10, 0.1));
      b.appendChild(makeSlider('Pos X', 'light3X', -10, 10, 0.1));
      b.appendChild(makeSlider('Pos Y', 'light3Y', -10, 10, 0.1));
      b.appendChild(makeSlider('Pos Z', 'light3Z', -10, 10, 0.1));
    }
  }, { collapsed: true }));

  // ========== BLOOM (its own dedicated section) ==========
  panel.appendChild(makeSection('bloom', '✨ Bloom', '✨', (b) => {
    b.appendChild(makeToggle('Enable Bloom', 'bloomOn', 'Светящееся свечение на ярких пикселях'));
    if (state.bloomOn) {
      b.appendChild(makeSlider('Strength', 'bloomStrength', 0, 4, 0.05));
      b.appendChild(makeSlider('Threshold', 'bloomThreshold', 0, 1, 0.01));
      b.appendChild(makeSlider('Radius', 'bloomRadius', 0, 1.5, 0.05));
      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(makeColor('Bloom Color', 'bloomColor'));
      b.appendChild(makeSlider('Color Mix', 'bloomColorMix', 0, 1, 0.02));
      b.appendChild(el('p', { class: 'hint' }, ['Color Mix > 0 окрашивает свечение в выбранный цвет.']));
    }

    // Presets
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Bloom Presets']));
    const grid = el('div', { class: 'preset-grid', style: 'grid-template-columns: 1fr 1fr;' });
    BLOOM_PRESETS.forEach(p => {
      const btn = el('button', { class: 'preset-btn', type: 'button', style: 'justify-content:center;' });
      const swatch = (p.vals.bloomColor || '#ffffff');
      btn.innerHTML = `<span class="preset-swatch" style="background:${swatch}"></span><span class="truncate">${p.name}</span>`;
      btn.addEventListener('click', () => {
        pushUndo();
        // Reset extras then apply preset
        Object.assign(state, {
          chromaticOn: false, vignetteOn: false, grainOn: false,
          bloomOn: true,
        });
        Object.assign(state, p.vals);
        buildPanel(); applyMaterial(); updatePostProcessing();
      });
      grid.appendChild(btn);
    });
    b.appendChild(grid);

    // Quick "off" button
    const offBtn = el('button', { class: 'btn-secondary', type: 'button' }, ['Turn Off All Effects']);
    offBtn.addEventListener('click', () => {
      pushUndo();
      Object.assign(state, { bloomOn: false, chromaticOn: false, vignetteOn: false, grainOn: false });
      buildPanel(); updatePostProcessing();
    });
    b.appendChild(offBtn);
  }));

  // ========== EXTRA EFFECTS ==========
  panel.appendChild(makeSection('post', 'Extra Effects', '✶', (b) => {
    b.appendChild(makeToggle('Vignette', 'vignetteOn'));
    if (state.vignetteOn) b.appendChild(makeSlider('Intensity', 'vignetteIntensity', 0, 1, 0.02));
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Chromatic Aberration', 'chromaticOn', 'RGB-сдвиг по краям (как у анаморфных линз)'));
    if (state.chromaticOn) b.appendChild(makeSlider('Amount', 'chromaticAmount', 0, 0.02, 0.0005));
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Film Grain', 'grainOn', 'Кинематографическое зерно'));
    if (state.grainOn) b.appendChild(makeSlider('Amount', 'grainAmount', 0, 0.3, 0.005));
  }, { collapsed: true }));

  // ========== CAMERA ==========
  panel.appendChild(makeSection('camera', 'Camera', '🎥', (b) => {
    b.appendChild(makeToggle('Orthographic', 'orthographic', 'Disable perspective'));
    if (!state.orthographic) {
      b.appendChild(makeSlider('FOV', 'fov', 10, 90, 1, true));
    }
    const btnFrame = el('button', { class: 'btn-secondary', type: 'button' }, ['⛶ Frame Camera']);
    btnFrame.addEventListener('click', frameCamera);
    b.appendChild(btnFrame);
  }, { collapsed: true }));

  // ========== ANIMATION ==========
  panel.appendChild(makeSection('animation', 'Animation', '↻', (b) => {
    b.appendChild(makeToggle('Auto-Rotate (camera)', 'autoRotate', 'Camera circles the text'));
    if (state.autoRotate) b.appendChild(makeSlider('Rotation Speed', 'autoRotateSpeed', 0.1, 5, 0.1));

    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeSelect('Mesh Animation', 'animationMode',
      ANIMATIONS.map((a) => ({ value: a.id, label: a.name }))));
    if (state.animationMode !== 'none') {
      b.appendChild(makeSlider('Speed', 'animationSpeed', 0.05, 5, 0.05));
    }

    const grid = el('div', { class: 'preset-grid', style: 'grid-template-columns: 1fr 1fr 1fr;' });
    ANIMATIONS.forEach((a) => {
      const btn = el('button', { class: 'preset-btn', type: 'button', style: 'justify-content:center; padding:6px 4px;' });
      if (state.animationMode === a.id) { btn.style.background = 'rgba(99,102,241,0.18)'; btn.style.color = '#a5a7f5'; }
      btn.textContent = a.name;
      btn.addEventListener('click', () => { pushUndo(); state.animationMode = a.id; buildPanel(); handleChange('animationMode'); });
      grid.appendChild(btn);
    });
    b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider pt-2' }, ['Quick pick']));
    b.appendChild(grid);
  }));

  // ========== EXPORT ==========
  panel.appendChild(makeSection('export', 'Export', '⤓', (b) => {
    b.appendChild(el('p', { class: 'hint' }, ['Capture or download in different formats.']));
    [
      ['📷 PNG (1×)', () => exportPNG(1)],
      ['📷 PNG (2×)', () => exportPNG(2)],
      ['📷 PNG (4×)', () => exportPNG(4)],
      ['📦 GLB', () => exportGLB()],
      ['📐 OBJ', () => exportOBJ()],
      ['🖨 STL', () => exportSTL()],
    ].forEach(([label, fn]) => {
      const btn = el('button', { class: 'btn-secondary', type: 'button' }, [label]);
      btn.addEventListener('click', fn);
      b.appendChild(btn);
    });
  }, { collapsed: true }));

  // ========== PRESETS / SCENE ==========
  panel.appendChild(makeSection('presets', 'Scene Presets', '★', (b) => {
    b.appendChild(el('p', { class: 'hint' }, ['Сохраняй сцену в localStorage и загружай позже.']));
    const slotInput = el('input', { class: 'input-base', type: 'text', placeholder: 'Slot name', style: 'width:100%; padding:6px 10px' });
    b.appendChild(slotInput);
    const saveBtn = el('button', { class: 'btn-primary', type: 'button' }, ['💾 Save Scene']);
    saveBtn.addEventListener('click', () => savePreset(slotInput.value || 'untitled'));
    b.appendChild(saveBtn);

    const list = el('div', { class: 'flex flex-col gap-1' });
    const presets = listPresets();
    if (presets.length === 0) list.appendChild(el('p', { class: 'hint' }, ['No saved scenes yet.']));
    presets.forEach((name) => {
      const row = el('div', { class: 'flex items-center gap-1' });
      const load = el('button', { class: 'btn-secondary flex-1', type: 'button' }, ['📂 ' + name]);
      load.addEventListener('click', () => loadPreset(name));
      const del = el('button', { class: 'btn-secondary', type: 'button', style: 'flex:0 0 auto; width:32px' }, ['×']);
      del.addEventListener('click', () => { deletePreset(name); buildPanel(); });
      row.appendChild(load); row.appendChild(del);
      list.appendChild(row);
    });
    b.appendChild(list);

    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    const rndBtn = el('button', { class: 'btn-secondary', type: 'button' }, ['🎲 Randomize All']);
    rndBtn.addEventListener('click', randomizeAll);
    b.appendChild(rndBtn);
    const rstBtn = el('button', { class: 'btn-secondary', type: 'button' }, ['⟲ Reset All']);
    rstBtn.addEventListener('click', resetAll);
    b.appendChild(rstBtn);
  }, { collapsed: true }));

  // ========== STATS ==========
  panel.appendChild(makeSection('stats', 'Stats', '📊', (b) => {
    b.appendChild(makeToggle('Show Stats Overlay', 'showStats'));
    const info = el('div', { class: 'flex flex-col gap-1 font-mono text-[10px] text-ink-200', id: 'panelStats' });
    info.innerHTML = `
      <div class="flex justify-between"><span>Vertices</span><span id="psVerts">—</span></div>
      <div class="flex justify-between"><span>Triangles</span><span id="psTris">—</span></div>
      <div class="flex justify-between"><span>Draw calls</span><span id="psCalls">—</span></div>
      <div class="flex justify-between"><span>FPS</span><span id="psFps">—</span></div>
    `;
    b.appendChild(info);
  }, { collapsed: true }));
}

// ============ STATE CHANGE DISPATCH ============
const GEOMETRY_KEYS = new Set([
  'text', 'size', 'depth', 'curveSegments',
  'bevelEnabled', 'bevelThickness', 'bevelSize', 'bevelOffset', 'bevelSegments',
  'innerBevel', 'innerBevelStyle', 'innerBevelDepth', 'innerBevelSize',
  'innerBevelSoften', 'innerBevelDirection', 'innerBevelResolution',
  'mirrorX', 'mirrorY', 'outlineOn', 'outlineThickness',
  'letterSpacing', 'lineHeight', 'shadingMode', 'matcapId',
]);
const MATERIAL_KEYS = new Set([
  'color', 'roughness', 'metalness', 'clearcoat', 'clearcoatRoughness', 'reflectivity',
  'flatShading', 'wireframe', 'emissive', 'emissiveIntensity',
  'transmission', 'ior', 'thickness',
  'sheen', 'sheenColor', 'sheenRoughness',
  'iridescence', 'iridescenceIOR', 'iridescenceThickness',
  'outlineColor',
]);

function handleChange(key) {
  if (key === 'fontId') { setActiveFont().then(updateHud); return; }
  if (GEOMETRY_KEYS.has(key)) {
    const rebuild = ['bevelEnabled', 'innerBevel', 'innerBevelStyle', 'innerBevelDirection', 'shadingMode', 'outlineOn'].includes(key);
    if (rebuild) buildPanel();
    if (['flatShading', 'wireframe', 'matcapId'].includes(key)) applyMaterial();
    updateText();
  }
  if (MATERIAL_KEYS.has(key)) applyMaterial();

  if (['bgMode', 'background', 'bgGradientTop', 'bgGradientBottom'].includes(key)) {
    if (key === 'bgMode') buildPanel();
    gradientMat.uniforms.topColor.value.set(state.bgGradientTop);
    gradientMat.uniforms.bottomColor.value.set(state.bgGradientBottom);
    applyBackground();
  }
  if (key === 'envPreset') { loadHDRI(state.envPreset); updateHud(); }
  if (key === 'envIntensity') applyMaterial();
  if (key === 'showShadows') ground.visible = state.showShadows;
  if (key === 'showGrid') gridHelper.visible = state.showGrid;

  if (['ambientIntensity'].includes(key)) ambientLight.intensity = state.ambientIntensity;
  if (['dirIntensity', 'dirColor', 'dirX', 'dirY', 'dirZ', 'dirShadow'].includes(key)) updateDirLight();
  if (['light2On', 'light2Color', 'light2Intensity', 'light2X', 'light2Y', 'light2Z'].includes(key)) updateLight2();
  if (['light3On', 'light3Color', 'light3Intensity', 'light3X', 'light3Y', 'light3Z'].includes(key)) updateLight3();

  if (['fov', 'orthographic'].includes(key)) updateCamera();

  if (key === 'animationMode' || key === 'animationSpeed') applyAnimationMode();
  if (key === 'autoRotate' || key === 'autoRotateSpeed') {
    controls.autoRotate = state.autoRotate;
    controls.autoRotateSpeed = state.autoRotateSpeed * 2;
  }

  if (['bloomOn', 'bloomStrength', 'bloomThreshold', 'bloomRadius',
       'bloomColor', 'bloomColorMix',
       'vignetteOn', 'vignetteIntensity',
       'chromaticOn', 'chromaticAmount',
       'grainOn', 'grainAmount'].includes(key)) {
    if (['bloomOn', 'vignetteOn', 'chromaticOn', 'grainOn'].includes(key)) buildPanel();
    updatePostProcessing();
  }

  // Decorations
  if (key === 'decorationType') buildPanel();
  if ([
    'decorationType', 'decorationCount', 'decorationScale', 'decorationSpread',
    'decorationColor', 'decorationMetalness', 'decorationRoughness', 'decorationEmissive',
  ].includes(key)) {
    rebuildDecorations();
  }

  if (key === 'showStats') {
    document.getElementById('statsOverlay').style.display = state.showStats ? 'flex' : 'none';
  }

  if (key === 'text') updateHud();
}

function updateDirLight() {
  dirLight.intensity = state.dirIntensity;
  dirLight.color.set(state.dirColor);
  dirLight.position.set(state.dirX, state.dirY, state.dirZ);
  dirLight.castShadow = state.dirShadow;
}
function updateLight2() {
  fillLight.intensity = state.light2On ? state.light2Intensity : 0;
  fillLight.color.set(state.light2Color);
  fillLight.position.set(state.light2X, state.light2Y, state.light2Z);
}
function updateLight3() {
  rimLight.intensity = state.light3On ? state.light3Intensity : 0;
  rimLight.color.set(state.light3Color);
  rimLight.position.set(state.light3X, state.light3Y, state.light3Z);
}

function updateCamera() {
  if (state.orthographic) {
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const size = 3;
    ortho.left = -size * aspect; ortho.right = size * aspect;
    ortho.top = size; ortho.bottom = -size;
    ortho.position.copy(persp.position);
    ortho.updateProjectionMatrix();
    camera = ortho;
  } else {
    persp.fov = state.fov;
    persp.updateProjectionMatrix();
    camera = persp;
  }
  controls.object = camera;
  controls.update();
  // Re-set composer's render pass camera by rebuilding
  if (composer) { composer = null; }
  if (postEnabled()) ensureComposer();
}

function updatePostProcessing() {
  if (postEnabled()) ensureComposer();
  if (bloomPass) {
    bloomPass.enabled = state.bloomOn;
    bloomPass.strength = state.bloomStrength;
    bloomPass.threshold = state.bloomThreshold;
    bloomPass.radius = state.bloomRadius;
  }
  if (bloomTintPass) {
    bloomTintPass.enabled = state.bloomOn && state.bloomColorMix > 0;
    bloomTintPass.uniforms.tintColor.value.set(state.bloomColor);
    bloomTintPass.uniforms.mixAmount.value = state.bloomColorMix;
  }
  if (chromaticPass) {
    chromaticPass.enabled = state.chromaticOn;
    chromaticPass.uniforms.amount.value = state.chromaticAmount;
  }
  if (vignettePass) {
    vignettePass.enabled = state.vignetteOn;
    vignettePass.uniforms.intensity.value = state.vignetteIntensity;
  }
  if (grainPass) {
    grainPass.enabled = state.grainOn;
    grainPass.uniforms.amount.value = state.grainAmount;
  }
}

// ============ HUD ============
function updateHud() {
  const fontLabel = state.fontId === 'custom'
    ? state.customFontName || 'Custom'
    : (DEFAULT_FONTS.find((f) => f.id === state.fontId) || {}).name || state.fontId;
  document.getElementById('hudFont').textContent = fontLabel;
  const env = HDRI_PRESETS.find((p) => p.id === state.envPreset);
  document.getElementById('hudEnv').textContent = 'HDRI: ' + (env ? env.name : state.envPreset);
  const t = state.text || ' ';
  document.getElementById('hudText').textContent = '"' + (t.length > 24 ? t.slice(0, 24) + '…' : t) + '"';
}

function updateStats() {
  if (!document.getElementById('statsOverlay')) return;
  const v = textVertCount.toLocaleString();
  const tr = Math.round(textTriCount).toLocaleString();
  document.getElementById('soVerts').textContent = v;
  document.getElementById('soTris').textContent = tr;
  const psV = document.getElementById('psVerts');
  if (psV) {
    psV.textContent = v;
    document.getElementById('psTris').textContent = tr;
  }
}

// ============ EXPORT ============
function exportPNG(scale = 1) {
  const oldDpr = renderer.getPixelRatio();
  renderer.setPixelRatio(oldDpr * scale);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  if (composer && postEnabled()) { composer.setSize(w, h); composer.render(); }
  else renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  renderer.setPixelRatio(oldDpr);
  renderer.setSize(w, h, false);
  download(url, `3d-text-${Date.now()}.png`);
}
async function exportGLB() {
  const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
  new GLTFExporter().parse(textGroup, (result) => {
    const blob = new Blob([result], { type: 'application/octet-stream' });
    download(URL.createObjectURL(blob), `3d-text-${Date.now()}.glb`, true);
  }, undefined, { binary: true });
}
async function exportOBJ() {
  const { OBJExporter } = await import('three/addons/exporters/OBJExporter.js');
  const data = new OBJExporter().parse(textGroup);
  const blob = new Blob([data], { type: 'text/plain' });
  download(URL.createObjectURL(blob), `3d-text-${Date.now()}.obj`, true);
}
async function exportSTL() {
  const { STLExporter } = await import('three/addons/exporters/STLExporter.js');
  const data = new STLExporter().parse(textGroup, { binary: true });
  const blob = new Blob([data], { type: 'application/octet-stream' });
  download(URL.createObjectURL(blob), `3d-text-${Date.now()}.stl`, true);
}
function download(href, name, revoke = false) {
  const a = document.createElement('a');
  a.href = href; a.download = name; a.click();
  if (revoke) setTimeout(() => URL.revokeObjectURL(href), 1000);
}

// ============ PRESETS (localStorage) ============
const PRESET_KEY = '3dts:presets';
function listPresets() {
  try { return Object.keys(JSON.parse(localStorage.getItem(PRESET_KEY) || '{}')); }
  catch { return []; }
}
function savePreset(name) {
  if (!name) return;
  const all = JSON.parse(localStorage.getItem(PRESET_KEY) || '{}');
  const snap = JSON.parse(JSON.stringify(state));
  delete snap.customFont; // can't serialize Font instances
  all[name] = snap;
  localStorage.setItem(PRESET_KEY, JSON.stringify(all));
  buildPanel();
}
function loadPreset(name) {
  const all = JSON.parse(localStorage.getItem(PRESET_KEY) || '{}');
  if (!all[name]) return;
  pushUndo();
  // Preserve custom font reference
  const cf = state.customFont, cfn = state.customFontName;
  Object.assign(state, all[name]);
  state.customFont = cf; state.customFontName = cfn;
  applyAllChanges();
}
function deletePreset(name) {
  const all = JSON.parse(localStorage.getItem(PRESET_KEY) || '{}');
  delete all[name];
  localStorage.setItem(PRESET_KEY, JSON.stringify(all));
}

// ============ UNDO / REDO ============
const UNDO_LIMIT = 50;
const undoStack = [];
const redoStack = [];
function snapshot() {
  const s = JSON.parse(JSON.stringify(state));
  delete s.customFont;
  return s;
}
function pushUndo() {
  undoStack.push(snapshot());
  if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  redoStack.length = 0;
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  const cf = state.customFont, cfn = state.customFontName;
  Object.assign(state, undoStack.pop());
  state.customFont = cf; state.customFontName = cfn;
  applyAllChanges();
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  const cf = state.customFont, cfn = state.customFontName;
  Object.assign(state, redoStack.pop());
  state.customFont = cf; state.customFontName = cfn;
  applyAllChanges();
}

// ============ APPLY ALL ============
function applyAllChanges() {
  applyMaterial();
  applyBackground();
  ambientLight.intensity = state.ambientIntensity;
  updateDirLight(); updateLight2(); updateLight3();
  ground.visible = state.showShadows;
  gridHelper.visible = state.showGrid;
  updateCamera();
  updatePostProcessing();
  applyAnimationMode();
  rebuildDecorations();
  controls.autoRotate = state.autoRotate;
  controls.autoRotateSpeed = state.autoRotateSpeed * 2;
  document.getElementById('statsOverlay').style.display = state.showStats ? 'flex' : 'none';
  buildPanel();
  setActiveFont().then(updateHud);
  loadHDRI(state.envPreset);
}

// ============ TOPBAR / FLOATING BUTTONS ============
function frameCamera() {
  persp.position.set(0, 1.2, 6);
  ortho.position.copy(persp.position);
  controls.target.set(0, 0, 0);
  controls.update();
}
function resetTextTransform() {
  textGroup.rotation.set(0, 0, 0);
  textGroup.position.set(0, 0, 0);
  textGroup.scale.set(1, 1, 1);
}
function applyAnimationMode() {
  const mode = ANIMATIONS.find((a) => a.id === state.animationMode);
  // Orbit Camera = OrbitControls.autoRotate
  if (mode && mode.id === 'orbit') controls.autoRotate = true;
  resetTextTransform();
  const pill = document.getElementById('autoRotateBtn');
  if (pill) {
    pill.classList.toggle('active', state.animationMode !== 'none' || state.autoRotate);
    const lbl = pill.querySelector('.anim-label');
    if (lbl) lbl.textContent = state.animationMode === 'none' ? 'Animate' : (mode ? mode.name : '—');
  }
}
function resetAll() {
  pushUndo();
  const cf = state.customFont, cfn = state.customFontName;
  Object.assign(state, JSON.parse(JSON.stringify(DEFAULTS)));
  state.customFont = cf; state.customFontName = cfn;
  frameCamera();
  applyAllChanges();
}
function randomizeAll() {
  pushUndo();
  const r = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(r(a, b + 1));
  const rcol = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');

  state.color = rcol();
  state.roughness = r(0, 1);
  state.metalness = Math.random() < 0.5 ? 0 : 1;
  state.clearcoat = r(0, 1);
  state.clearcoatRoughness = r(0, 0.5);
  state.depth = r(0.1, 1);
  state.bevelThickness = r(0, 0.15);
  state.bevelSize = r(0, 0.08);
  state.bevelSegments = ri(2, 10);
  state.envPreset = HDRI_PRESETS[ri(0, HDRI_PRESETS.length - 1)].id;
  state.background = BG_PRESETS[ri(0, BG_PRESETS.length - 1)];
  state.animationMode = ANIMATIONS[ri(1, ANIMATIONS.length - 1)].id;
  state.animationSpeed = r(0.3, 2.5);
  state.matcapId = MATCAPS[ri(0, MATCAPS.length - 1)].id;
  applyAllChanges();
}

document.getElementById('topExportBtn').addEventListener('click', () => exportPNG(2));
document.getElementById('topResetBtn').addEventListener('click', frameCamera);
document.getElementById('frameBtn').addEventListener('click', frameCamera);
document.getElementById('autoRotateBtn').addEventListener('click', () => {
  pushUndo();
  const ids = ANIMATIONS.map((a) => a.id);
  const i = ids.indexOf(state.animationMode);
  state.animationMode = ids[(i + 1) % ids.length];
  buildPanel();
  applyAnimationMode();
});
document.addEventListener('keydown', (e) => {
  const meta = e.ctrlKey || e.metaKey;
  if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  else if ((meta && e.key === 'y') || (meta && e.shiftKey && e.key.toLowerCase() === 'z')) { e.preventDefault(); redo(); }
});

// ============ RESIZE ============
function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const dpr = renderer.getPixelRatio();
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    renderer.setSize(w, h, false);
    if (composer) composer.setSize(w, h);
    persp.aspect = w / h;
    persp.updateProjectionMatrix();
    if (camera === ortho) updateCamera();
  }
}

// ============ ANIMATION LOOP ============
const clock = new THREE.Clock();
let animTime = 0;
let totalTime = 0;
let fpsCounter = { last: performance.now(), frames: 0, fps: 0 };

function animate() {
  requestAnimationFrame(animate);
  resize();
  const dt = clock.getDelta();
  totalTime += dt;
  const mode = ANIMATIONS.find((a) => a.id === state.animationMode);
  if (mode && mode.apply) {
    animTime += dt * state.animationSpeed;
    mode.apply(textGroup, animTime);
  }
  // Decorations animation (independent of the text animation mode)
  animateDecorations(dt, totalTime);

  // Update grain shader time uniform so noise actually moves
  if (grainPass) grainPass.uniforms.time.value = totalTime;

  controls.update();

  // Render gradient first if needed
  renderer.autoClear = state.bgMode !== 'gradient';
  if (state.bgMode === 'gradient') {
    renderer.clear();
    renderer.render(gradientScene, gradientCam);
    renderer.autoClear = false;
  }

  if (postEnabled()) {
    ensureComposer();
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
  renderer.autoClear = true;

  // FPS counter
  fpsCounter.frames++;
  const now = performance.now();
  if (now - fpsCounter.last > 500) {
    fpsCounter.fps = Math.round((fpsCounter.frames * 1000) / (now - fpsCounter.last));
    fpsCounter.frames = 0; fpsCounter.last = now;
    const so = document.getElementById('soFps');
    if (so) so.textContent = fpsCounter.fps;
    const ps = document.getElementById('psFps');
    if (ps) ps.textContent = fpsCounter.fps;
    const cls = document.getElementById('soCalls');
    if (cls) cls.textContent = renderer.info.render.calls;
    const psc = document.getElementById('psCalls');
    if (psc) psc.textContent = renderer.info.render.calls;
  }
}

// ============ INIT ============
async function init() {
  // Pre-load BufferGeometryUtils so multi-part decorations (notes, crown)
  // merge synchronously on first render.
  await getBufferGeometryUtils();
  buildPanel();
  applyMaterial();
  ground.visible = state.showShadows;
  gridHelper.visible = state.showGrid;
  updateDirLight(); updateLight2(); updateLight3();
  updateCamera();
  applyAnimationMode();
  gradientMat.uniforms.topColor.value.set(state.bgGradientTop);
  gradientMat.uniforms.bottomColor.value.set(state.bgGradientBottom);
  applyBackground();
  controls.autoRotate = state.autoRotate;
  controls.autoRotateSpeed = state.autoRotateSpeed * 2;
  document.getElementById('statsOverlay').style.display = state.showStats ? 'flex' : 'none';
  await loadHDRI(state.envPreset);
  await setActiveFont();
  rebuildDecorations();
  updateHud();
  loadingOverlay.style.display = 'none';
  animate();
}

init().catch((e) => {
  console.error(e);
  loadingOverlay.innerHTML = `<div class="text-red-400 text-sm font-mono p-4 text-center">Init failed: ${e.message}<br/>Open the browser console for details.</div>`;
});
