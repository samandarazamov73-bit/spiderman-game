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

// ============ LOGO TEMPLATES ============
// One-click pro designs that bundle multiple coordinated state changes —
// the kind of feature usually paywalled in commercial tools.
const LOGO_TEMPLATES = [
  {
    name: 'Crystal Premium',
    icon: '💎',
    tagline: 'Glass + chisel + neon glow',
    apply: {
      color: '#bae6fd', metalness: 0, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02, transmission: 0.7, ior: 1.4,
      innerBevel: true, innerBevelStyle: 'chiselHard', innerBevelDepth: 1.2, innerBevelSize: 0.10, bevelEnabled: false,
      envPreset: 'studio', envIntensity: 1.4, background: '#0a0a0d', bgMode: 'solid',
      bloomOn: true, bloomStrength: 0.9, bloomThreshold: 0.6, bloomRadius: 0.8, bloomColor: '#7dd3fc', bloomColorMix: 0.5,
      decorationType: 'sparkle', decorationCount: 18, decorationColor: '#ffffff', decorationEmissive: 2.0, decorationScale: 0.5,
      animationMode: 'spinY', animationSpeed: 0.5,
    },
  },
  {
    name: 'Liquid Gold Awards',
    icon: '🏆',
    tagline: 'Polished gold + sparkles',
    apply: {
      color: '#ffd166', metalness: 1, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.08, reflectivity: 1, transmission: 0,
      innerBevel: true, innerBevelStyle: 'chiselHard', innerBevelDepth: 1.0, innerBevelSize: 0.12, bevelEnabled: false,
      envPreset: 'sunset', envIntensity: 1.2, background: '#1a0f00', bgMode: 'solid',
      bloomOn: true, bloomStrength: 0.7, bloomThreshold: 0.7, bloomRadius: 0.6, bloomColor: '#ffd166', bloomColorMix: 0.4,
      vignetteOn: true, vignetteIntensity: 0.5,
      decorationType: 'sparkle', decorationCount: 22, decorationColor: '#fff7c4', decorationEmissive: 2.5, decorationScale: 0.55,
      animationMode: 'pendulum', animationSpeed: 0.6,
    },
  },
  {
    name: 'Neon Synthwave',
    icon: '🌃',
    tagline: 'Cyan glow + dark BG',
    apply: {
      color: '#000000', metalness: 0, roughness: 0.5, clearcoat: 0, transmission: 0,
      emissive: '#00d4ff', emissiveIntensity: 1.5,
      innerBevel: false, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.04,
      envPreset: 'night', envIntensity: 0.5, background: '#0a0a14', bgMode: 'gradient', bgGradientTop: '#1a0a3e', bgGradientBottom: '#000010',
      bloomOn: true, bloomStrength: 1.6, bloomThreshold: 0.3, bloomRadius: 0.8, bloomColor: '#00d4ff', bloomColorMix: 0.6,
      chromaticOn: true, chromaticAmount: 0.004,
      outerGlowOn: true, outerGlowColor: '#00d4ff', outerGlowSize: 0.18, outerGlowIntensity: 2.0,
      decorationType: 'bolt', decorationCount: 10, decorationColor: '#ff00ff', decorationEmissive: 2.5, decorationScale: 0.7,
      animationMode: 'float', animationSpeed: 0.8,
    },
  },
  {
    name: 'Birthday Party',
    icon: '🎉',
    tagline: 'Pink + hearts + confetti',
    apply: {
      color: '#ff5e9c', metalness: 0, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05,
      innerBevel: true, innerBevelStyle: 'pillow', innerBevelDepth: 0.6, innerBevelSize: 0.14,
      envPreset: 'studio', envIntensity: 1.0, background: '#fff0f6', bgMode: 'solid',
      bloomOn: true, bloomStrength: 0.6, bloomThreshold: 0.7, bloomRadius: 0.6, bloomColor: '#ffaad6', bloomColorMix: 0.4,
      decorationType: 'heart', decorationCount: 22, decorationColor: '#ff5e9c', decorationScale: 0.6, decorationEmissive: 0.4,
      particlesType: 'dust', particlesCount: 200, particlesColor: '#ffd6f0', particlesSize: 0.04, particlesEmissive: 0.6,
      animationMode: 'breathe', animationSpeed: 1.0,
    },
  },
  {
    name: 'Minimal Premium',
    icon: '◯',
    tagline: 'Clean black & white',
    apply: {
      color: '#f5f5f5', metalness: 0, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.1, transmission: 0,
      innerBevel: false, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02,
      envPreset: 'studio', envIntensity: 1.0, background: '#0e1014', bgMode: 'solid',
      bloomOn: false, vignetteOn: true, vignetteIntensity: 0.5,
      decorationType: 'none',
      animationMode: 'none',
      reflectiveFloor: true, reflectiveFloorOpacity: 0.4,
    },
  },
  {
    name: 'Cyber Glitch',
    icon: '⚡',
    tagline: 'Pixelate + chromatic',
    apply: {
      color: '#22d3ee', metalness: 0.7, roughness: 0.3, clearcoat: 1, transmission: 0,
      innerBevel: true, innerBevelStyle: 'chiselHard', innerBevelDepth: 1.3, innerBevelSize: 0.08, bevelEnabled: false,
      envPreset: 'city', envIntensity: 0.9, background: '#06081a', bgMode: 'gradient', bgGradientTop: '#1a0a3e', bgGradientBottom: '#04061f',
      bloomOn: true, bloomStrength: 1.4, bloomThreshold: 0.45, bloomRadius: 0.7, bloomColor: '#22d3ee', bloomColorMix: 0.5,
      chromaticOn: true, chromaticAmount: 0.005,
      pixelateOn: true, pixelateSize: 4,
      decorationType: 'bolt', decorationCount: 14, decorationColor: '#22d3ee', decorationEmissive: 2.5, decorationScale: 0.65,
      animationMode: 'shimmy', animationSpeed: 0.8,
    },
  },
  {
    name: 'Ocean Breeze',
    icon: '🌊',
    tagline: 'Glass + bubbles',
    apply: {
      color: '#7dd3fc', metalness: 0, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02, transmission: 0.85, ior: 1.4,
      innerBevel: true, innerBevelStyle: 'smooth', innerBevelDepth: 0.8, innerBevelSize: 0.12,
      envPreset: 'dawn', envIntensity: 1.0, background: '#082f49', bgMode: 'gradient', bgGradientTop: '#0c4a6e', bgGradientBottom: '#082f49',
      bloomOn: true, bloomStrength: 0.8, bloomThreshold: 0.6, bloomRadius: 0.7, bloomColor: '#bae6fd', bloomColorMix: 0.5,
      decorationType: 'bubble', decorationCount: 22, decorationColor: '#bae6fd', decorationScale: 0.6, decorationEmissive: 0,
      particlesType: 'bokeh', particlesCount: 150, particlesColor: '#ffffff', particlesSize: 0.06, particlesEmissive: 0.4,
      animationMode: 'float', animationSpeed: 0.7,
    },
  },
  {
    name: 'Galaxy Cosmic',
    icon: '🪐',
    tagline: 'Iridescent + stars',
    apply: {
      color: '#a855f7', metalness: 0.3, roughness: 0.2, clearcoat: 1, iridescence: 0.8, iridescenceIOR: 1.3,
      innerBevel: true, innerBevelStyle: 'chiselHard', innerBevelDepth: 1.0, innerBevelSize: 0.08, bevelEnabled: false,
      envPreset: 'night', envIntensity: 0.7, background: '#0c0024', bgMode: 'gradient', bgGradientTop: '#3a0e6b', bgGradientBottom: '#0c0024',
      bloomOn: true, bloomStrength: 1.2, bloomThreshold: 0.5, bloomRadius: 1.0, bloomColor: '#c084fc', bloomColorMix: 0.55,
      decorationType: 'star', decorationCount: 24, decorationColor: '#fef3c7', decorationEmissive: 2.0, decorationScale: 0.55,
      particlesType: 'dust', particlesCount: 250, particlesColor: '#e0e7ff', particlesSize: 0.04, particlesEmissive: 0.7,
      animationMode: 'spinY', animationSpeed: 0.5,
    },
  },
  {
    name: 'Hot Lava',
    icon: '🔥',
    tagline: 'Glowing emissive + embers',
    apply: {
      color: '#3d0a00', metalness: 0, roughness: 0.6, emissive: '#ff4500', emissiveIntensity: 2.5,
      innerBevel: true, innerBevelStyle: 'chiselHard', innerBevelDepth: 1.0, innerBevelSize: 0.10,
      envPreset: 'sunset', envIntensity: 0.5, background: '#1a0500', bgMode: 'solid',
      bloomOn: true, bloomStrength: 1.6, bloomThreshold: 0.4, bloomRadius: 0.9, bloomColor: '#ff6a00', bloomColorMix: 0.6,
      vignetteOn: true, vignetteIntensity: 0.6,
      decorationType: 'flame', decorationCount: 14, decorationColor: '#ff6a00', decorationEmissive: 3.0, decorationScale: 0.7,
      particlesType: 'embers', particlesCount: 250, particlesColor: '#ff8a40', particlesSize: 0.05, particlesEmissive: 1.0,
      animationMode: 'breathe', animationSpeed: 1.2,
    },
  },
  {
    name: 'Winter Frost',
    icon: '❄',
    tagline: 'Icy + snow particles',
    apply: {
      color: '#dbeafe', metalness: 0, roughness: 0.4, clearcoat: 1, clearcoatRoughness: 0.3, transmission: 0.5, ior: 1.31,
      innerBevel: true, innerBevelStyle: 'chiselHard', innerBevelDepth: 1.0, innerBevelSize: 0.10,
      envPreset: 'dawn', envIntensity: 1.2, background: '#1e3a5f', bgMode: 'gradient', bgGradientTop: '#3b6ea5', bgGradientBottom: '#0a1830',
      bloomOn: true, bloomStrength: 0.8, bloomThreshold: 0.7, bloomRadius: 0.7, bloomColor: '#ffffff', bloomColorMix: 0.3,
      decorationType: 'snowflake', decorationCount: 14, decorationColor: '#ffffff', decorationScale: 0.5, decorationEmissive: 0.3,
      particlesType: 'snow', particlesCount: 600, particlesColor: '#ffffff', particlesSize: 0.04, particlesEmissive: 0.5,
      animationMode: 'wobble', animationSpeed: 0.5,
    },
  },
];

function applyLogoTemplate(tpl) {
  pushUndo();
  Object.assign(state, tpl.apply);
  applyAllChanges();
}

// Heuristic auto-colour: peek the active HDRI env and pick a colour based
// on the preset's mood. Real envmap sampling would need a render-target;
// this hand-tuned table gives equally-good 'AI-style' results without it.
function autoColorFromHDRI() {
  const palette = {
    studio:    { color: '#f5f5f5', metalness: 0.3, roughness: 0.3 },
    royal:     { color: '#ffd166', metalness: 1.0, roughness: 0.15 },
    sunset:    { color: '#ff8a40', metalness: 0.6, roughness: 0.2 },
    dawn:      { color: '#fda4af', metalness: 0.4, roughness: 0.25 },
    city:      { color: '#cbd5e1', metalness: 0.8, roughness: 0.18 },
    night:     { color: '#a855f7', metalness: 0.4, roughness: 0.25 },
  };
  const p = palette[state.envPreset] || palette.studio;
  pushUndo();
  Object.assign(state, p);
  applyMaterial();
  buildPanel();
}

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

// ----- Extra decoration generators -----
function makeMoonGeom() {
  // Crescent moon: outer disc minus offset disc
  const outer = new THREE.Shape();
  outer.absarc(0, 0, 0.45, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0.18, 0, 0.4, 0, Math.PI * 2, true);
  outer.holes.push(hole);
  return new THREE.ExtrudeGeometry(outer, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3, curveSegments: 24 });
}
function makeSunGeom() {
  // Sun: disc + radial spikes
  const parts = [new THREE.SphereGeometry(0.30, 24, 12)];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const sp = new THREE.ConeGeometry(0.06, 0.22, 6);
    sp.translate(0, 0.40, 0);
    sp.rotateZ(-a);
    parts.push(sp);
  }
  return mergeGeoms(parts);
}
function makeCloudGeom() {
  // 4 spheres clumped together
  const s = (x, y, r) => { const g = new THREE.SphereGeometry(r, 16, 12); g.translate(x, y, 0); return g; };
  return mergeGeoms([s(0, 0, 0.28), s(-0.28, -0.05, 0.22), s(0.28, -0.05, 0.24), s(0, 0.20, 0.20)]);
}
function makeSnowflakeGeom() {
  // 6-arm flake — extruded path
  const parts = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const arm = new THREE.BoxGeometry(0.05, 0.55, 0.05);
    arm.translate(0, 0.275, 0);
    arm.rotateZ(-a);
    parts.push(arm);
    // little spike on each arm
    for (const t of [0.18, 0.32]) {
      const sp = new THREE.BoxGeometry(0.04, 0.16, 0.04);
      sp.translate(0, t, 0);
      sp.rotateZ(Math.PI / 4);
      sp.translate(0, t, 0);
      const sp2 = sp.clone();
      sp.rotateZ(-a);
      sp2.rotateZ(-Math.PI / 2 - a);
      parts.push(sp);
      parts.push(sp2);
    }
  }
  return mergeGeoms(parts);
}
function makeLeafGeom() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.5);
  shape.bezierCurveTo(0.35, 0.45, 0.35, -0.15, 0, -0.5);
  shape.bezierCurveTo(-0.35, -0.15, -0.35, 0.45, 0, 0.5);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 16 });
}
function makeFlowerGeom() {
  // 5 petals around a center disc
  const parts = [new THREE.SphereGeometry(0.12, 16, 12)];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const petal = new THREE.SphereGeometry(0.16, 16, 10);
    petal.scale(1.0, 1.6, 0.5);
    petal.translate(0, 0.28, 0);
    petal.rotateZ(-a);
    parts.push(petal);
  }
  return mergeGeoms(parts);
}
function makeButterflyGeom() {
  // 4 wing teardrops + body
  const wing = (mx, my, sx, sy) => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.bezierCurveTo(sx * 0.5, sy * 0.6, sx * 0.6, sy * 0.2, 0, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false, curveSegments: 8 });
    g.translate(mx, my, 0);
    return g;
  };
  const body = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
  body.rotateX(Math.PI / 2);
  return mergeGeoms([
    wing(0, 0, 0.5, 0.5),
    wing(0, 0, -0.5, 0.5),
    wing(0, 0, 0.4, -0.4),
    wing(0, 0, -0.4, -0.4),
    body,
  ]);
}
function makePlanetGeom() {
  // Sphere + thin ring
  const ball = new THREE.SphereGeometry(0.32, 20, 16);
  const ring = new THREE.TorusGeometry(0.5, 0.02, 8, 48);
  ring.rotateX(Math.PI / 2.4);
  return mergeGeoms([ball, ring]);
}
function makeRocketGeom() {
  const body = new THREE.CylinderGeometry(0.12, 0.12, 0.55, 16);
  const nose = new THREE.ConeGeometry(0.12, 0.22, 16); nose.translate(0, 0.385, 0);
  const fin1 = new THREE.BoxGeometry(0.18, 0.16, 0.04); fin1.translate(0.10, -0.32, 0);
  const fin2 = new THREE.BoxGeometry(0.18, 0.16, 0.04); fin2.translate(-0.10, -0.32, 0);
  const exhaust = new THREE.ConeGeometry(0.08, 0.18, 12); exhaust.translate(0, -0.36, 0); exhaust.rotateZ(Math.PI);
  return mergeGeoms([body, nose, fin1, fin2, exhaust]);
}
function makeCubeGeom() {
  return new THREE.BoxGeometry(0.5, 0.5, 0.5);
}
function makeIcosaGeom() {
  return new THREE.IcosahedronGeometry(0.45, 0);
}
function makeTorusKnotGeom() {
  return new THREE.TorusKnotGeometry(0.28, 0.08, 64, 12);
}
function makeArrowGeom() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.45, -0.10);
  shape.lineTo( 0.05, -0.10);
  shape.lineTo( 0.05, -0.25);
  shape.lineTo( 0.45,  0.00);
  shape.lineTo( 0.05,  0.25);
  shape.lineTo( 0.05,  0.10);
  shape.lineTo(-0.45,  0.10);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.10, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
}
function makeCheckGeom() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.4, 0.0);
  shape.lineTo(-0.10, -0.30);
  shape.lineTo( 0.40,  0.30);
  shape.lineTo( 0.30,  0.40);
  shape.lineTo(-0.10, -0.05);
  shape.lineTo(-0.32,  0.13);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.10, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 2 });
}
function makeQuestionGeom() {
  // Approximated '?': torus arc + dot
  const arc = new THREE.TorusGeometry(0.18, 0.06, 10, 24, Math.PI * 1.2);
  arc.rotateZ(-Math.PI * 0.6);
  arc.translate(0, 0.18, 0);
  const stem = new THREE.CylinderGeometry(0.06, 0.06, 0.18, 12);
  stem.translate(0, -0.05, 0);
  const dot = new THREE.SphereGeometry(0.08, 12, 10);
  dot.translate(0, -0.32, 0);
  return mergeGeoms([arc, stem, dot]);
}
function makeExclamationGeom() {
  const stem = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 12);
  stem.translate(0, 0.10, 0);
  const dot = new THREE.SphereGeometry(0.09, 12, 10);
  dot.translate(0, -0.32, 0);
  return mergeGeoms([stem, dot]);
}
function makeMusicEighthGeom() {
  // Single eighth (♪) with flag
  const head = new THREE.SphereGeometry(0.16, 16, 12); head.scale(1.3, 1, 0.5);
  const stem = new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8); stem.translate(0.18, 0.42, 0);
  const flag = new THREE.BoxGeometry(0.18, 0.32, 0.04); flag.translate(0.27, 0.70, 0);
  return mergeGeoms([head, stem, flag]);
}
function makeMusicTrebleGeom() {
  // Stylised treble clef as a stack of tori + curve
  const t1 = new THREE.TorusGeometry(0.15, 0.05, 8, 24); t1.translate(0, 0.18, 0);
  const t2 = new THREE.TorusGeometry(0.18, 0.05, 8, 24); t2.translate(0, -0.10, 0);
  const stem = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 10); stem.translate(0.08, 0.05, 0);
  return mergeGeoms([t1, t2, stem]);
}
function makeCoinGeom() {
  const c = new THREE.CylinderGeometry(0.32, 0.32, 0.06, 32);
  c.rotateX(Math.PI / 2);
  return c;
}
function makeAtomGeom() {
  // Nucleus + 3 ellipse rings rotated around different axes
  const parts = [new THREE.SphereGeometry(0.10, 16, 12)];
  const ringGeom = (rotX, rotY) => {
    const t = new THREE.TorusGeometry(0.36, 0.02, 8, 48);
    t.rotateX(rotX); t.rotateY(rotY);
    return t;
  };
  parts.push(ringGeom(Math.PI / 2, 0));
  parts.push(ringGeom(Math.PI / 3, Math.PI / 3));
  parts.push(ringGeom(Math.PI / 3, -Math.PI / 3));
  return mergeGeoms(parts);
}
function makeYinYangGeom() {
  // Disc + central bar; visually approximating yin yang as a flat disc
  const ring = new THREE.CylinderGeometry(0.40, 0.40, 0.10, 32);
  ring.rotateX(Math.PI / 2);
  return ring;
}
function makeRibbonGeom() {
  // Twisted ribbon — narrow bent box
  const shape = new THREE.Shape();
  shape.moveTo(-0.4, -0.05); shape.lineTo(0.4, -0.05);
  shape.lineTo(0.4, 0.05);   shape.lineTo(-0.4, 0.05);
  shape.closePath();
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, 0, 0),
    new THREE.Vector3(-0.1, 0.2, 0.05),
    new THREE.Vector3(0.1, -0.2, -0.05),
    new THREE.Vector3(0.4, 0, 0),
  ]);
  return new THREE.TubeGeometry(path, 24, 0.05, 8, false);
}
function makeRosePetalGeom() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.2, 0.1, 0.3, 0.4, 0, 0.5);
  shape.bezierCurveTo(-0.3, 0.4, -0.2, 0.1, 0, 0);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
}

// Merge helper using three's BufferGeometryUtils (lazy-loaded elsewhere; here
// we accept that merging is asynchronous-safe through our cached `_bgU`).
function mergeGeoms(arr) {
  if (_bgU) return _bgU.mergeGeometries(arr, false);
  // Fallback: pick first and queue lazy merge
  getBufferGeometryUtils().then(() => updateText());
  return arr[0];
}

// Categorised decorations for the UI.
const DECORATION_CATEGORIES = [
  { id: 'symbols', name: 'Symbols', items: [
    { id: 'star',        name: '⭐ Star',         make: makeStarGeom },
    { id: 'heart',       name: '❤ Heart',         make: makeHeartGeom },
    { id: 'sparkle',     name: '✦ Sparkle',       make: makeSparkleGeom,   emissiveDefault: 1.5 },
    { id: 'crown',       name: '👑 Crown',        make: makeCrownGeom },
    { id: 'diamond',     name: '💎 Diamond',      make: makeDiamondGeom,   glassy: true },
    { id: 'bolt',        name: '⚡ Lightning',     make: makeBoltGeom,      emissiveDefault: 1.8 },
    { id: 'flame',       name: '🔥 Flame',        make: makeFlameGeom,     emissiveDefault: 2.0 },
    { id: 'arrow',       name: '➤ Arrow',         make: makeArrowGeom },
    { id: 'check',       name: '✓ Checkmark',     make: makeCheckGeom },
    { id: 'question',    name: '? Question',      make: makeQuestionGeom },
    { id: 'exclaim',     name: '! Exclaim',       make: makeExclamationGeom },
  ]},
  { id: 'music', name: 'Music', items: [
    { id: 'note',        name: '♩ Quarter Note',  make: makeNoteGeom },
    { id: 'note2',       name: '♫ Beamed Notes',  make: makeDoubleNoteGeom },
    { id: 'noteEighth',  name: '♪ Eighth Note',   make: makeMusicEighthGeom },
    { id: 'treble',      name: '𝄞 Treble Clef',   make: makeMusicTrebleGeom },
  ]},
  { id: 'nature', name: 'Nature', items: [
    { id: 'sun',         name: '☀ Sun',           make: makeSunGeom,       emissiveDefault: 1.5 },
    { id: 'moon',        name: '☾ Moon',          make: makeMoonGeom,      emissiveDefault: 0.4 },
    { id: 'cloud',       name: '☁ Cloud',         make: makeCloudGeom },
    { id: 'snowflake',   name: '❄ Snowflake',     make: makeSnowflakeGeom },
    { id: 'leaf',        name: '🍃 Leaf',         make: makeLeafGeom },
    { id: 'flower',      name: '🌸 Flower',       make: makeFlowerGeom },
    { id: 'rosePetal',   name: '🌹 Rose Petal',   make: makeRosePetalGeom },
    { id: 'butterfly',   name: '🦋 Butterfly',    make: makeButterflyGeom },
  ]},
  { id: 'geometry', name: 'Geometry', items: [
    { id: 'cube',        name: '◻ Cube',          make: makeCubeGeom },
    { id: 'icosa',       name: '◊ Icosahedron',   make: makeIcosaGeom },
    { id: 'torusKnot',   name: '⌬ Torus Knot',    make: makeTorusKnotGeom },
    { id: 'ring',        name: '○ Ring',          make: makeRingGeom },
    { id: 'spiral',      name: '@ Spiral',        make: makeSpiralGeom },
    { id: 'bubble',      name: '○ Bubble',        make: makeBubbleGeom,    glassy: true },
    { id: 'ribbon',      name: '〰 Ribbon',       make: makeRibbonGeom },
  ]},
  { id: 'space', name: 'Space', items: [
    { id: 'planet',      name: '🪐 Planet',       make: makePlanetGeom },
    { id: 'rocket',      name: '🚀 Rocket',       make: makeRocketGeom,    emissiveDefault: 0.5 },
    { id: 'atom',        name: '⚛ Atom',         make: makeAtomGeom,       emissiveDefault: 0.6 },
  ]},
  { id: 'misc', name: 'Misc', items: [
    { id: 'chain',       name: '⛓ Chain Link',    make: makeChainLink, ring: true },
    { id: 'coin',        name: '🪙 Coin',         make: makeCoinGeom },
    { id: 'yinyang',     name: '☯ Disc',          make: makeYinYangGeom },
  ]},
];

// Flattened lookup with backward-compatible "none" sentinel.
const DECORATIONS = [
  { id: 'none', name: 'None' },
  ...DECORATION_CATEGORIES.flatMap(cat => cat.items),
];

// ============ NECKLACE STYLES ============
// 16 chain styles — each defines a function that builds one repeated link
// + an optional pendant centerpiece. The factory functions below produce
// small geometries that get instanced around a circle by buildNecklace().
function makeLinkOval()       { return new THREE.TorusGeometry(0.18, 0.05, 12, 24); }
function makeLinkRound()      { return new THREE.TorusGeometry(0.16, 0.06, 14, 28); }
function makeLinkBead()       { return new THREE.SphereGeometry(0.13, 16, 12); }
function makeLinkPearl()      { const g = new THREE.SphereGeometry(0.14, 20, 14); return g; }
function makeLinkBox()        { return new THREE.BoxGeometry(0.20, 0.10, 0.10); }
function makeLinkOctaSmall()  { return new THREE.OctahedronGeometry(0.13, 0); }
function makeLinkSpike()      { return new THREE.ConeGeometry(0.07, 0.25, 8); }
function makeLinkRice()       { const g = new THREE.SphereGeometry(0.10, 12, 10); g.scale(2.0, 1.0, 1.0); return g; }
function makeLinkDisc()       { const g = new THREE.CylinderGeometry(0.13, 0.13, 0.04, 24); g.rotateX(Math.PI/2); return g; }
function makeLinkSquareLink() { return new THREE.TorusGeometry(0.16, 0.05, 4, 4); /* low segs = square ring */ }
function makeLinkCubeRot()    { const g = new THREE.BoxGeometry(0.16, 0.16, 0.16); return g; }
function makeLinkHeart()      { return makeHeartGeom(); }
function makeLinkStar()       { return makeStarGeom(); }
function makeLinkSparkle()    { return makeSparkleGeom(); }
function makeLinkBolt()       { return makeBoltGeom(); }
function makeLinkRose()       { return makeRosePetalGeom(); }

const NECKLACE_STYLES = [
  { id: 'none',       name: '— None —' },
  { id: 'oval',       name: '🟡 Classic Oval Chain',    make: makeLinkOval,       linkRotEachZ: Math.PI/2 },
  { id: 'round',      name: '◯ Round Cable Chain',      make: makeLinkRound,      linkRotEachZ: 0 },
  { id: 'figaro',     name: '⛓ Figaro Chain',           make: makeLinkOval,       linkRotEachZ: Math.PI/2, varyEvery: 3, variantScale: 1.6 },
  { id: 'box',        name: '◻ Box Chain',              make: makeLinkBox,        linkRotEachZ: 0 },
  { id: 'rope',       name: '🪢 Rope (alternating)',     make: makeLinkOval,       linkRotEachZ: Math.PI/4, alternate: true },
  { id: 'beads',      name: '⚫ Bead Necklace',         make: makeLinkBead,       linkRotEachZ: 0, scale: 1.0 },
  { id: 'pearls',     name: '🦪 Pearl Strand',          make: makeLinkPearl,      linkRotEachZ: 0, scale: 1.05, pearlMat: true },
  { id: 'spikes',     name: '🗿 Spike Choker',          make: makeLinkSpike,      linkRotEachZ: 0, spikeOut: true },
  { id: 'rice',       name: '🌾 Rice Chain',            make: makeLinkRice,       linkRotEachZ: 0 },
  { id: 'disc',       name: '⏺ Disc Chain',             make: makeLinkDisc,       linkRotEachZ: 0 },
  { id: 'octa',       name: '◊ Octahedron Beads',       make: makeLinkOctaSmall,  linkRotEachZ: 0 },
  { id: 'cubes',      name: '🎲 Cube Chain',            make: makeLinkCubeRot,    linkRotEachZ: 0 },
  { id: 'hearts',     name: '❤ Heart Chain',            make: makeLinkHeart,      linkRotEachZ: 0, scale: 0.45 },
  { id: 'stars',      name: '⭐ Star Chain',            make: makeLinkStar,       linkRotEachZ: 0, scale: 0.5 },
  { id: 'sparkles',   name: '✦ Sparkle Necklace',       make: makeLinkSparkle,    linkRotEachZ: 0, scale: 0.55, glowDefault: 1.5 },
  { id: 'bolts',      name: '⚡ Lightning Chain',        make: makeLinkBolt,       linkRotEachZ: 0, scale: 0.5, glowDefault: 1.5 },
  { id: 'flower',     name: '🌹 Petal Chain',           make: makeLinkRose,       linkRotEachZ: 0, scale: 0.5 },
  { id: 'square',     name: '⬜ Square Link Chain',      make: makeLinkSquareLink, linkRotEachZ: Math.PI/2 },
];

// ============ NECKLACE ANIMATIONS ============
// Rich set of per-link motion patterns. Each animation receives:
//   • link  — the THREE.Mesh for that link
//   • t     — totalTime * state.necklaceAnimSpeed (seconds, scaled)
//   • i     — link index (0..N-1)
//   • N     — total link count
//   • r     — current orbit radius
//   • basePos — { x, y, z } original on-circle position
// Each animation should compute the link's final position (and may tweak
// rotation) without touching anything else. The Spin direction toggle is
// applied separately via the parent ring's rotation.y.
const NECKLACE_ANIMATIONS = [
  { id: 'none',    name: '— Static —',
    apply: (link, t, i, N, r, basePos) => { link.position.copy(basePos); } },
  { id: 'spin',    name: '↻ Spin (classic)',
    apply: (link, t, i, N, r, basePos) => { link.position.copy(basePos); } /* parent rotation does the work */ },
  { id: 'pulse',   name: '✦ Pulse (radius breath)',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2;
      const rr = r + Math.sin(t * 1.4) * 0.25;
      link.position.set(Math.cos(a) * rr, basePos.y, Math.sin(a) * rr);
    }},
  { id: 'wave',    name: '〰 Wave (vertical)',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2;
      link.position.set(Math.cos(a) * r,
        basePos.y + Math.sin(t * 2 + i * 0.5) * 0.25,
        Math.sin(a) * r);
    }},
  { id: 'snake',   name: '🐍 Snake (travelling wave)',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2;
      const phase = (i / N) * Math.PI * 4 - t * 3;
      link.position.set(Math.cos(a) * r,
        basePos.y + Math.sin(phase) * 0.30,
        Math.sin(a) * r);
    }},
  { id: 'breath',  name: '🌬 Breath (in & out)',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2;
      const rr = r + (Math.sin(t * 0.9) * 0.5);
      link.position.set(Math.cos(a) * rr, basePos.y, Math.sin(a) * rr);
    }},
  { id: 'swing',   name: '⏲ Swing (left-right)',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2 + Math.sin(t * 1.2) * 0.4;
      link.position.set(Math.cos(a) * r, basePos.y, Math.sin(a) * r);
    }},
  { id: 'drop',    name: '💧 Drop (gravity bounce)',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2;
      const phase = i * 0.3 + t * 1.5;
      const drop = Math.abs(Math.sin(phase)) * 0.4;
      link.position.set(Math.cos(a) * r,
        basePos.y - drop,
        Math.sin(a) * r);
    }},
  { id: 'spiral',  name: '🌀 Spiral (rising helix)',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2 + t * 0.5;
      const rise = Math.sin((i / N) * Math.PI * 2 + t) * 0.4;
      link.position.set(Math.cos(a) * r, basePos.y + rise, Math.sin(a) * r);
    }},
  { id: 'flow',    name: '🌊 Flow (sine river)',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2;
      const flow = Math.sin(a * 3 + t * 2) * 0.3;
      const rr = r + Math.cos(t * 1.1 + i * 0.4) * 0.15;
      link.position.set(Math.cos(a) * rr, basePos.y + flow, Math.sin(a) * rr);
    }},
  { id: 'dance',   name: '💃 Dance (chaotic sway)',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2;
      const wx = Math.sin(t * 1.3 + i * 0.6) * 0.20;
      const wy = Math.sin(t * 2.1 + i * 0.4) * 0.25;
      const wz = Math.cos(t * 1.7 + i * 0.5) * 0.20;
      link.position.set(Math.cos(a) * r + wx, basePos.y + wy, Math.sin(a) * r + wz);
      link.rotation.x += 0.01;
      link.rotation.z += 0.008;
    }},
  { id: 'scatter', name: '✨ Scatter (explode & return)',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2;
      const cycle = (Math.sin(t * 0.8) * 0.5 + 0.5);  // 0..1
      const rr = r + cycle * 1.2;
      link.position.set(Math.cos(a) * rr, basePos.y + cycle * 0.4, Math.sin(a) * rr);
    }},
  { id: 'tilt',    name: '🎢 Tilt-A-Whirl',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2;
      const tiltY = Math.sin((i / N) * Math.PI * 2 - t * 1.5) * 0.35;
      link.position.set(Math.cos(a) * r, basePos.y + tiltY, Math.sin(a) * r);
    }},
  { id: 'orbit3d', name: '🪐 3D Orbit (full XYZ)',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2;
      const tiltAngle = t * 0.4 + i * 0.05;
      // Tilt the orbit plane around X-axis based on time
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * Math.sin(tiltAngle) * 0.5;
      const z = Math.sin(a) * r * Math.cos(tiltAngle);
      link.position.set(x, basePos.y + y, z);
    }},
  { id: 'magnet',  name: '🧲 Magnetic Pull',
    apply: (link, t, i, N, r, basePos) => {
      const a = (i / N) * Math.PI * 2;
      const pull = (Math.sin(t * 0.9 + i * 0.2) * 0.5 + 0.5);
      const rr = r * (1 - pull * 0.4);
      link.position.set(Math.cos(a) * rr, basePos.y, Math.sin(a) * rr);
    }},
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
  innerBevelDepth: 1.0,            // Photoshop "Depth" (0..1) — height multiplier
  innerBevelSize: 0.10,            // Photoshop "Size" — how far the bevel extends
  innerBevelSoften: 0,             // Photoshop "Soften" — 0 = razor sharp, 1 = smooth
  innerBevelDirection: 'up',       // 'up' = raised, 'down' = engraved
  innerBevelTintOn: false,         // override cap colour with innerBevelHighlight
  innerBevelHighlight: '#ffd166',  // Photoshop "Highlight Color" — drives cap colour when tint is on
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
  reflectiveFloor: false,
  reflectiveFloorOpacity: 0.45,

  // Camera
  fov: 32,
  orthographic: false,
  cameraShakeOn: false,
  cameraShakeAmount: 0.4,

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
  pixelateOn: false,
  pixelateSize: 6,

  // Layer effects (Photoshop-style)
  dropShadowOn: false,
  dropShadowColor: '#000000',
  dropShadowOpacity: 0.6,
  dropShadowBlur: 0.10,        // visual blur via duplicate-mesh offset (cheap proxy)
  dropShadowDistance: 0.20,
  dropShadowAngle: 135,        // degrees
  outerGlowOn: false,
  outerGlowColor: '#7dd3fc',
  outerGlowSize: 0.10,
  outerGlowIntensity: 1.5,

  // Particles
  particlesType: 'none',       // none | snow | embers | dust | leaves | rain | bokeh
  particlesCount: 200,
  particlesColor: '#ffffff',
  particlesSpeed: 1.0,
  particlesSize: 0.04,
  particlesEmissive: 0.5,

  // 3D Decorations (chains, music notes, stars, hearts, etc.)
  decorationType: 'none',      // see DECORATIONS below
  decorationCategory: 'all',   // filters icon grid in the panel
  decorationCount: 14,
  decorationScale: 1.0,
  decorationSpread: 1.6,       // how far around the text they sit
  decorationColor: '#ffd166',
  decorationMetalness: 0.9,
  decorationRoughness: 0.2,
  decorationEmissive: 0,
  decorationFloat: true,       // gentle bobbing animation
  decorationSpinIndividual: true,

  // Necklace / Chain — circular ring of links surrounding the text. Has its
  // own dedicated controls so it can coexist with other 3D Decorations.
  necklaceStyle: 'none',       // 'none' | one of NECKLACE_STYLES.id
  necklaceColor: '#ffd166',
  necklaceMetalness: 1.0,
  necklaceRoughness: 0.2,
  necklaceEmissive: 0,
  necklaceLinkCount: 32,
  necklaceRadius: 2.4,
  necklaceLinkSize: 1.0,
  necklaceTilt: 18,            // tilt of the chain plane (deg, X-axis)
  necklaceSpin: true,
  necklaceSpinSpeed: 0.6,
  necklaceSpinDir: 1,          // +1 or -1 — clockwise or counter
  necklaceWobble: false,       // legacy figure-8 wobble (kept for back-compat)
  necklaceAnimation: 'spin',   // see NECKLACE_ANIMATIONS — drives per-link motion
  necklaceAnimSpeed: 1.0,
  // Window-like reflections: use a mirror-finish material that strongly
  // samples the env map (HDRI) so each link reflects the scene like glass.
  necklaceMirror: true,

  // Live scene reflections on the TEXT itself: a CubeCamera at the text's
  // centre captures the scene every frame, so the text mirrors the spinning
  // chain / decorations / floor / HDRI in real time. Like a polished window
  // on the letters' surface. Off by default because it costs ~1ms per frame.
  textLiveReflections: false,
  textLiveReflectionStrength: 1.5,
  textLiveReflectionEvery: 1,    // 1 = every frame, 2 = every other frame, ...
  textLiveReflectionRes: 1024,   // 256 / 512 / 1024 / 2048 — higher = sharper mirror

  // Animation
  autoRotate: false,           // simple toggle (back-compat)
  autoRotateSpeed: 1.2,
  animationMode: 'none',
  animationSpeed: 1.0,

  // UI
  showStats: true,

  // Left rail / tab system — drives which property sections are shown.
  activeTab: 'content',

  // Video / GIF export
  videoDuration: 5,
  videoFps: 30,
};

// Live state (clone of defaults)
const state = JSON.parse(JSON.stringify(DEFAULTS));
// Non-cloneable members
state.customFont = null;

// ============ DOM ============
const canvas = document.getElementById('canvas');
const panel = document.getElementById('panel');
const loadingOverlay = document.getElementById('loadingOverlay');
const leftRailEl = document.getElementById('leftRail');

// ============ LEFT RAIL TABS ============
// Group the 19 property sections into 6 logical workspaces. The left rail
// becomes a tab switcher — only sections for the active tab are rendered
// in the right panel, so the UI stays uncluttered. Icons are inline SVGs
// (Lucide-style strokes) instead of emojis for a clean professional look.
const SVG_ICON = {
  type: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
  shape: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  effects: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6l-5 3.6 1.9-5.8L4 8.8h6.1z"/></svg>',
  decorate: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
  scene: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  project: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
};
const RAIL_TABS = [
  { id: 'content',  icon: SVG_ICON.type,     title: 'Content',         sections: ['text', 'typography'] },
  { id: 'shape',    icon: SVG_ICON.shape,    title: 'Geometry & Material', sections: ['geometry', 'material', 'material-extras', 'outline'] },
  { id: 'effects',  icon: SVG_ICON.effects,  title: 'Effects',         sections: ['bloom', 'post', 'layereffects'] },
  { id: 'decorate', icon: SVG_ICON.decorate, title: 'Decorations',     sections: ['decorations', 'necklace', 'particles'] },
  { id: 'scene',    icon: SVG_ICON.scene,    title: 'Scene & Camera',  sections: ['environment', 'lighting', 'floor', 'camera', 'animation'] },
  { id: 'project',  icon: SVG_ICON.project,  title: 'Export & Project', sections: ['templates', 'export', 'presets', 'stats'] },
];

function getActiveTabSections() {
  const tab = RAIL_TABS.find(t => t.id === state.activeTab) || RAIL_TABS[0];
  return new Set(tab.sections);
}

function buildLeftRail() {
  leftRailEl.innerHTML = '';
  RAIL_TABS.forEach((tab) => {
    const btn = document.createElement('button');
    btn.className = 'rail-btn' + (state.activeTab === tab.id ? ' active' : '');
    btn.title = tab.title;
    btn.innerHTML = tab.icon;
    btn.addEventListener('click', () => {
      if (state.activeTab === tab.id) return;
      state.activeTab = tab.id;
      buildLeftRail();
      buildPanel();
      // Scroll the right panel back to the top so the new tab starts fresh.
      panel.scrollTop = 0;
    });
    leftRailEl.appendChild(btn);
  });
  const spacer = document.createElement('div');
  spacer.style.flex = '1';
  leftRailEl.appendChild(spacer);
  const ver = document.createElement('span');
  ver.className = 'text-[9px] font-mono text-ink-200';
  ver.textContent = 'v0.2';
  leftRailEl.appendChild(ver);
}

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

// Necklace group — circular chain that orbits the text in its own pivot.
// Kept separate so it can rotate as a single unit independent of decorations.
const necklacePivot = new THREE.Group();
scene.add(necklacePivot);
const necklaceRing = new THREE.Group();
necklacePivot.add(necklaceRing);

// ============ PARTICLES ============
// One reusable Points object; geometry is rebuilt when type/count changes.
const particlesGroup = new THREE.Group();
scene.add(particlesGroup);
let particleSystem = null;     // { points, velocities, kind, bounds }

// ============ REFLECTIVE FLOOR ============
// A polished mirror-like floor disk; toggled separately from the shadow plane.
const reflectorGroup = new THREE.Group();
scene.add(reflectorGroup);
let reflectorMesh = null;

// PMREM for HDRI
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

// ============ LIVE SCENE REFLECTIONS (CubeCamera) ============
// A small CubeCamera sits at the centre of the text. Once per frame (when
// reflections are enabled) we hide the text itself, render the rest of the
// scene into a high-res cube render target from that point, then assign that
// target as the text material's envMap. The result: the text's surface
// shows a LIVE reflection of the spinning chain / decorations / HDRI / floor
// — like a real polished window on the letters' surface.
//
// QUALITY: 1024² with linear mipmap chain + HalfFloat = mirror-grade
// reflections. The CubeRenderTarget can't take an MSAA `samples` option in
// three.js (cube targets aren't multisampled at the WebGL2 spec level), but
// the high resolution + linear filtering eliminates visible aliasing.
let reflectionRT = null;
let reflectionCubeCamera = null;
function buildReflectionRig(resolution) {
  if (reflectionRT) reflectionRT.dispose();
  if (reflectionCubeCamera && reflectionCubeCamera.parent) reflectionCubeCamera.parent.remove(reflectionCubeCamera);
  reflectionRT = new THREE.WebGLCubeRenderTarget(resolution, {
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    type: THREE.HalfFloatType,
    anisotropy: renderer.capabilities.getMaxAnisotropy(),
  });
  reflectionCubeCamera = new THREE.CubeCamera(0.1, 60, reflectionRT);
  scene.add(reflectionCubeCamera);
}
buildReflectionRig(1024);
let _hdriEnvTexture = null;        // last loaded HDRI envmap (used as fallback)
let _reflectionFrame = 0;          // render the cube every Nth frame for perf

// ============ POST-PROCESSING ============
let composer = null;
let bloomPass = null;
let vignettePass = null;
let chromaticPass = null;
let grainPass = null;
let bloomTintPass = null;
let pixelatePass = null;

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

// Pixelate the rendered image — fun retro / glitch effect.
const PixelateShader = {
  uniforms: { tDiffuse: { value: null }, pixelSize: { value: 6 }, resolution: { value: new THREE.Vector2(1024, 768) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float pixelSize; uniform vec2 resolution; varying vec2 vUv;
    void main(){
      vec2 dx = vec2(pixelSize / resolution.x, 0.0);
      vec2 dy = vec2(0.0, pixelSize / resolution.y);
      vec2 uv = vec2(
        floor(vUv.x / dx.x) * dx.x + dx.x * 0.5,
        floor(vUv.y / dy.y) * dy.y + dy.y * 0.5
      );
      gl_FragColor = texture2D(tDiffuse, uv);
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

  pixelatePass = new ShaderPass(PixelateShader);
  pixelatePass.uniforms.pixelSize.value = state.pixelateSize;
  pixelatePass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  pixelatePass.enabled = state.pixelateOn;
  composer.addPass(pixelatePass);

  composer.addPass(new OutputPass());
  return composer;
}

function postEnabled() {
  return state.bloomOn || state.vignetteOn || state.chromaticOn || state.grainOn || state.pixelateOn;
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
  if (state.innerBevelStyle === 'chiselHard' ||
      state.innerBevelStyle === 'chiselSoft' ||
      state.innerBevelStyle === 'stroke') {
    return buildSharpChiselCap(bodyGeom);
  }
  return buildSmoothBevelCap(bodyGeom);
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
  mesh.userData.bevelCap = true;
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
  mesh.userData.bevelCap = true;
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

  // Dispose previous (geometry + per-instance materials/textures like bevel caps)
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
    // Drop shadow — render BEFORE the body, dark + offset + slightly behind.
    if (state.dropShadowOn) {
      const shadowMat = new THREE.MeshBasicMaterial({
        color: state.dropShadowColor,
        transparent: true,
        opacity: state.dropShadowOpacity,
        depthWrite: false,
      });
      const sh = new THREE.Mesh(body, shadowMat);
      const ang = (state.dropShadowAngle * Math.PI) / 180;
      sh.position.x = Math.cos(ang) * state.dropShadowDistance;
      sh.position.y = -Math.sin(ang) * state.dropShadowDistance;
      sh.position.z = -0.01 - state.dropShadowBlur * 0.2;
      // Cheap "blur" approximation: scale up slightly. Real gaussian blur would
      // need a separate render target which we skip to keep this lightweight.
      const s = 1 + state.dropShadowBlur * 0.4;
      sh.scale.set(s, s, 1);
      if (mirror) {
        sh.scale.x *= mirror.x ? -1 : 1;
        sh.scale.y *= mirror.y ? -1 : 1;
      }
      sh.userData.disposableMaterial = true;
      textGroup.add(sh);
    }

    // Outer glow — additive bright shell behind, scaled up
    if (state.outerGlowOn) {
      const glowMat = new THREE.MeshBasicMaterial({
        color: state.outerGlowColor,
        transparent: true,
        opacity: Math.min(1, state.outerGlowIntensity * 0.4),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      });
      const g = new THREE.Mesh(body, glowMat);
      const s = 1 + state.outerGlowSize * 2;
      g.scale.set(s, s, 1);
      g.position.z = -0.005;
      if (mirror) {
        g.scale.x *= mirror.x ? -1 : 1;
        g.scale.y *= mirror.y ? -1 : 1;
      }
      g.userData.disposableMaterial = true;
      textGroup.add(g);
    }

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

// ============ PARTICLES ============
// Builds an animated point cloud whose physics depends on the chosen kind.
function rebuildParticles() {
  // Tear down existing
  while (particlesGroup.children.length) {
    const c = particlesGroup.children.pop();
    if (c.geometry) c.geometry.dispose();
    if (c.material && c.material.dispose) c.material.dispose();
  }
  particleSystem = null;
  if (state.particlesType === 'none' || state.particlesCount <= 0) return;

  const N = Math.max(10, Math.min(2000, state.particlesCount));
  const positions = new Float32Array(N * 3);
  const velocities = new Float32Array(N * 3);

  // Range box where particles live around the text
  const RX = 5, RY = 3, RZ = 3;

  for (let i = 0; i < N; i++) {
    const ix = i * 3;
    positions[ix    ] = (Math.random() - 0.5) * RX * 2;
    positions[ix + 1] = (Math.random() - 0.5) * RY * 2;
    positions[ix + 2] = (Math.random() - 0.5) * RZ * 2;
    // velocities depend on kind
    initParticleVel(state.particlesType, velocities, ix);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: state.particlesColor,
    size: state.particlesSize,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    blending: state.particlesEmissive > 0.5 ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false,
    map: makeParticleSprite(),
  });
  const points = new THREE.Points(geom, mat);
  particlesGroup.add(points);
  particleSystem = { points, velocities, kind: state.particlesType, bounds: { RX, RY, RZ } };
}

function initParticleVel(kind, vel, ix) {
  switch (kind) {
    case 'snow':
      vel[ix    ] = (Math.random() - 0.5) * 0.05;
      vel[ix + 1] = -0.18 - Math.random() * 0.15;
      vel[ix + 2] = (Math.random() - 0.5) * 0.05;
      break;
    case 'rain':
      vel[ix    ] = (Math.random() - 0.5) * 0.04;
      vel[ix + 1] = -1.4 - Math.random() * 0.6;
      vel[ix + 2] = 0;
      break;
    case 'embers':
      vel[ix    ] = (Math.random() - 0.5) * 0.10;
      vel[ix + 1] = 0.30 + Math.random() * 0.40;
      vel[ix + 2] = (Math.random() - 0.5) * 0.10;
      break;
    case 'dust':       // slow magic dust drifting
    case 'bokeh':
      vel[ix    ] = (Math.random() - 0.5) * 0.08;
      vel[ix + 1] = (Math.random() - 0.5) * 0.08 + 0.04;
      vel[ix + 2] = (Math.random() - 0.5) * 0.08;
      break;
    case 'leaves':
      vel[ix    ] = (Math.random() - 0.5) * 0.20;
      vel[ix + 1] = -0.20 - Math.random() * 0.15;
      vel[ix + 2] = (Math.random() - 0.5) * 0.10;
      break;
    default:
      vel[ix] = vel[ix + 1] = vel[ix + 2] = 0;
  }
}

// Tiny radial gradient sprite — gives the points a soft round look.
let _particleSprite = null;
function makeParticleSprite() {
  if (_particleSprite) return _particleSprite;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  _particleSprite = new THREE.CanvasTexture(c);
  _particleSprite.colorSpace = THREE.SRGBColorSpace;
  return _particleSprite;
}

function animateParticles(dt, totalT) {
  if (!particleSystem) return;
  const { points, velocities, kind, bounds } = particleSystem;
  const pos = points.geometry.attributes.position;
  const arr = pos.array;
  const speed = state.particlesSpeed * dt * 5; // global tempo

  for (let i = 0; i < arr.length; i += 3) {
    // Add a swirl/wobble depending on kind
    if (kind === 'leaves' || kind === 'dust' || kind === 'bokeh') {
      const phase = i * 0.13 + totalT * 1.5;
      arr[i    ] += (Math.sin(phase) * 0.04 + velocities[i    ]) * speed;
      arr[i + 1] += (velocities[i + 1] + Math.sin(phase * 0.5) * 0.02) * speed;
      arr[i + 2] += (Math.cos(phase) * 0.04 + velocities[i + 2]) * speed;
    } else if (kind === 'snow') {
      arr[i    ] += (Math.sin(totalT + i) * 0.03 + velocities[i    ]) * speed;
      arr[i + 1] += velocities[i + 1] * speed;
      arr[i + 2] += velocities[i + 2] * speed;
    } else {
      arr[i    ] += velocities[i    ] * speed;
      arr[i + 1] += velocities[i + 1] * speed;
      arr[i + 2] += velocities[i + 2] * speed;
    }

    // Wrap or recycle when out of bounds
    const { RX, RY, RZ } = bounds;
    if (kind === 'embers') {
      if (arr[i + 1] > RY)      { arr[i + 1] = -RY; arr[i] = (Math.random() - 0.5) * RX * 2; arr[i + 2] = (Math.random() - 0.5) * RZ * 2; }
    } else {
      // Generic wrap
      if (arr[i + 1] < -RY)     arr[i + 1] = RY;
      if (arr[i + 1] >  RY)     arr[i + 1] = -RY;
    }
    if (arr[i    ] < -RX) arr[i    ] = RX;
    if (arr[i    ] >  RX) arr[i    ] = -RX;
    if (arr[i + 2] < -RZ) arr[i + 2] = RZ;
    if (arr[i + 2] >  RZ) arr[i + 2] = -RZ;
  }
  pos.needsUpdate = true;
}

function applyParticleStyling() {
  if (!particleSystem) return;
  const m = particleSystem.points.material;
  m.color.set(state.particlesColor);
  m.size = state.particlesSize;
  m.blending = state.particlesEmissive > 0.5 ? THREE.AdditiveBlending : THREE.NormalBlending;
  m.opacity = 0.6 + state.particlesEmissive * 0.3;
  m.needsUpdate = true;
}

// ============ REFLECTIVE FLOOR ============
function rebuildReflectiveFloor() {
  while (reflectorGroup.children.length) {
    const c = reflectorGroup.children.pop();
    if (c.geometry) c.geometry.dispose();
    if (c.material) c.material.dispose();
  }
  reflectorMesh = null;
  if (!state.reflectiveFloor) return;
  // Use a glossy metal-ish floor — true planar reflection (Reflector) needs
  // an extra render pass which we skip for simplicity. This still looks great.
  const geom = new THREE.CircleGeometry(8, 64);
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#0a0a0d',
    roughness: 0.05,
    metalness: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.5,
    transparent: true,
    opacity: state.reflectiveFloorOpacity,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -1.149;
  mesh.receiveShadow = true;
  reflectorGroup.add(mesh);
  reflectorMesh = mesh;
}

// Resolves the active list of decoration items based on the selected category.
function resolveDecorationItems() {
  if (state.decorationCategory === 'all') {
    return DECORATION_CATEGORIES.flatMap(c => c.items);
  }
  const cat = DECORATION_CATEGORIES.find(c => c.id === state.decorationCategory);
  return cat ? cat.items : [];
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
    const i = mesh.userData.seed || 0;
    const isPinned = !!mesh.userData.pinned;

    // Float (vertical bob) — anchor on the CURRENT base position so toggling
    // the float toggle off-then-on no longer snaps the item back to the
    // procedural origin. Pinned items skip the bob entirely (they stay
    // exactly where the user put them).
    if (state.decorationFloat && !isPinned) {
      const phase = hashSeed(i, 11) * Math.PI * 2;
      mesh.position.y = mesh.userData.basePos.y + Math.sin(totalT * 1.2 + phase) * 0.08;
    } else if (!isPinned) {
      // Float disabled → snap mesh back to its base Y so the item doesn't
      // freeze mid-bob at some random offset.
      mesh.position.y = mesh.userData.basePos.y;
    }

    // Per-item spin runs for ALL items, including pinned ones — being placed
    // by hand should NOT freeze the rotation; the user just wants to control
    // where the sticker SITS, not whether it rotates. (Old behaviour of
    // freezing pinned items broke this expectation.)
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

// ============ NECKLACE / CHAIN ============
function rebuildNecklace() {
  // Tear down previous
  while (necklaceRing.children.length) {
    const c = necklaceRing.children.pop();
    if (c.geometry) c.geometry.dispose();
    if (c.material && c.material.dispose) c.material.dispose();
  }
  if (state.necklaceStyle === 'none') return;
  const style = NECKLACE_STYLES.find((s) => s.id === state.necklaceStyle);
  if (!style || !style.make) return;

  const N = Math.max(4, Math.min(120, state.necklaceLinkCount));
  const radius = state.necklaceRadius;
  const baseScale = (style.scale || 1.0) * state.necklaceLinkSize;

  // Window-style reflections:
  //   • Mirror mode: roughness ≈ 0, metalness = 1, full clearcoat, very high
  //     envMapIntensity so the HDRI is visible like a real polished surface
  //     reflecting a window. clearcoat=1 + clearcoatRoughness=0 adds the
  //     extra "wet glass" specular layer on top.
  //   • Otherwise: regular PBR using the user's metalness/roughness sliders.
  //   • Pearl style still overrides to its iridescent setup.
  const mat = new THREE.MeshPhysicalMaterial({
    color: state.necklaceColor,
    metalness: style.pearlMat ? 0.05 : (state.necklaceMirror ? 1.0 : state.necklaceMetalness),
    roughness: style.pearlMat ? 0.25 : (state.necklaceMirror ? 0.02 : state.necklaceRoughness),
    clearcoat: style.pearlMat ? 1 : (state.necklaceMirror ? 1 : 0.4),
    clearcoatRoughness: style.pearlMat ? 0.05 : (state.necklaceMirror ? 0.0 : 0.1),
    iridescence: style.pearlMat ? 0.6 : 0,
    reflectivity: state.necklaceMirror ? 1.0 : 0.6,
    emissive: state.necklaceEmissive > 0 ? state.necklaceColor : '#000000',
    emissiveIntensity: state.necklaceEmissive,
    envMapIntensity: state.necklaceMirror ? 3.0 : 1.5,
  });

  const baseGeom = style.make();

  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    // For 'figaro' style, every Nth link is bigger.
    let s = baseScale;
    if (style.varyEvery && i % style.varyEvery === 0) s = baseScale * (style.variantScale || 1.4);
    const link = new THREE.Mesh(baseGeom, mat);
    const x = Math.cos(a) * radius, z = Math.sin(a) * radius;
    link.position.set(x, 0, z);
    link.scale.setScalar(s);

    // Orient link so it sits naturally along the ring tangent.
    link.lookAt(0, 0, 0);
    if (style.linkRotEachZ) link.rotateZ(style.linkRotEachZ);
    // Alternate every other link by 90° around its tangent (rope effect).
    if (style.alternate && i % 2) link.rotateY(Math.PI / 2);
    // Spike chokers point outward.
    if (style.spikeOut) {
      link.lookAt(Math.cos(a) * radius * 2, 0, Math.sin(a) * radius * 2);
      link.rotateX(Math.PI / 2);
    }
    link.castShadow = true;
    link.receiveShadow = true;
    // Per-link metadata used by the animation dispatcher
    link.userData.basePos = link.position.clone();
    link.userData.linkIndex = i;
    link.userData.linkCount = N;
    link.userData.linkRadius = radius;
    necklaceRing.add(link);
  }

  // Material is owned by the ring — dispose when next rebuild empties children
  // since we recreate it each time.
  necklaceRing.userData.sharedMat = mat;
  necklaceRing.userData.baseGeom = baseGeom;

  // Apply tilt to the pivot so the chain sits at a natural neckline angle.
  necklacePivot.rotation.x = THREE.MathUtils.degToRad(state.necklaceTilt);
}

function animateNecklace(dt, totalT) {
  if (state.necklaceStyle === 'none') return;

  // Parent ring spin — applied for both 'spin' animation and any other
  // pattern that wants the whole chain to also rotate around Y. We honour
  // necklaceSpin so the user can disable continuous rotation.
  if (state.necklaceSpin) {
    necklaceRing.rotation.y += dt * state.necklaceSpinSpeed * state.necklaceSpinDir;
  }

  // Per-link animation pattern (none / pulse / wave / snake / ...).
  const animDef = NECKLACE_ANIMATIONS.find(a => a.id === state.necklaceAnimation);
  if (animDef && animDef.apply && state.necklaceAnimation !== 'none' && state.necklaceAnimation !== 'spin') {
    const t = totalT * (state.necklaceAnimSpeed || 1.0);
    necklaceRing.children.forEach((link) => {
      const ud = link.userData;
      if (!ud || !ud.basePos) return;
      animDef.apply(link, t, ud.linkIndex, ud.linkCount, ud.linkRadius, ud.basePos);
    });
  } else if (state.necklaceAnimation === 'none') {
    // Snap each link back to its base position so the static look is clean.
    necklaceRing.children.forEach((link) => {
      const ud = link.userData;
      if (ud && ud.basePos) link.position.copy(ud.basePos);
    });
  }

  // Legacy wobble still works alongside any animation pattern.
  if (state.necklaceWobble) {
    necklacePivot.rotation.z = Math.sin(totalT * 0.8) * 0.08;
    // Don't override Y here — that would fight the spin.
  } else {
    necklacePivot.rotation.z = 0;
  }
}

function applyNecklaceMaterial() {
  const mat = necklaceRing.userData && necklaceRing.userData.sharedMat;
  if (!mat) return;
  mat.color.set(state.necklaceColor);
  // Mirror mode overrides metalness / roughness for that mirror-finish look.
  if (state.necklaceMirror) {
    mat.metalness = 1.0;
    mat.roughness = 0.02;
    mat.clearcoat = 1;
    mat.clearcoatRoughness = 0.0;
    mat.envMapIntensity = 3.0;
    mat.reflectivity = 1.0;
  } else {
    mat.metalness = state.necklaceMetalness;
    mat.roughness = state.necklaceRoughness;
    mat.clearcoat = 0.4;
    mat.clearcoatRoughness = 0.1;
    mat.envMapIntensity = 1.5;
    mat.reflectivity = 0.6;
  }
  if (state.necklaceEmissive > 0) {
    mat.emissive.set(state.necklaceColor);
  } else {
    mat.emissive.set('#000000');
  }
  mat.emissiveIntensity = state.necklaceEmissive;
  mat.needsUpdate = true;
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
  // Use a separate `bevelCap` flag because drop-shadow / outer-glow meshes
  // also use `disposableMaterial=true` but should keep their own colours.
  textGroup.traverse((obj) => {
    if (obj.isMesh && obj.userData && obj.userData.bevelCap && obj.material) {
      const m = obj.material;
      const capColor = state.innerBevelTintOn ? state.innerBevelHighlight : state.color;
      if (m.color) m.color.set(capColor);
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
    if (myId === hdriLoadingId) {
      scene.environment = envTex;
      currentHdriTexture = envTex;
      _hdriEnvTexture = envTex;
      applyBackground();
    }
    return;
  }
  return new Promise((resolve) => {
    new RGBELoader().load(
      preset.url,
      (tex) => {
        const envTex = pmrem.fromEquirectangular(tex).texture;
        if (myId === hdriLoadingId) {
          scene.environment = envTex;
          currentHdriTexture = envTex;
          _hdriEnvTexture = envTex;
          applyBackground();
        }
        tex.dispose();
        resolve();
      },
      undefined,
      (err) => {
        console.warn('HDRI load failed, using neutral room:', err);
        const envScene = new RoomEnvironment();
        const envTex = pmrem.fromScene(envScene, 0.04).texture;
        if (myId === hdriLoadingId) {
          scene.environment = envTex;
          currentHdriTexture = envTex;
          _hdriEnvTexture = envTex;
          applyBackground();
        }
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
  // Only render sections that belong to the currently-active rail tab.
  // Returns null otherwise; appendChild is null-safe via guards in buildPanel.
  const activeSections = getActiveTabSections();
  if (!activeSections.has(id)) return null;
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

  // Helper: append a section to the panel only if it belongs to the active tab
  // (makeSection returns null otherwise so we don't get appendChild(null) errors).
  const addSection = (sec) => { if (sec) panel.appendChild(sec); };

  // Tab title at the very top of the panel for clarity.
  const activeTab = RAIL_TABS.find(t => t.id === state.activeTab) || RAIL_TABS[0];
  const tabHeader = document.createElement('div');
  tabHeader.className = 'px-4 py-2 border-b border-ink-400/10 flex items-center gap-2 text-accent';
  tabHeader.innerHTML = `${activeTab.icon}<span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-50">${activeTab.title}</span>`;
  panel.appendChild(tabHeader);

  // ========== TEXT ==========
  addSection(makeSection('text', 'Text', 'T', (b) => {
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
  addSection(makeSection('typography', 'Typography', '¶', (b) => {
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
  addSection(makeSection('geometry', 'Geometry', '▣', (b) => {
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
        'Chisel Hard = острый pyramidal ridge через TextGeometry. Soften > 0 даёт более мягкий гребень. Quality влияет только на Smooth/Pillow.',
      ]));
      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(makeToggle('Tint Bevel', 'innerBevelTintOn', 'Highlight color override (Photoshop "Highlight Color")'));
      if (state.innerBevelTintOn) {
        b.appendChild(makeColor('Highlight Color', 'innerBevelHighlight'));
      }

      // Quick presets — tuned to look polished out-of-the-box
      const presets = [
        { name: 'Sharp Chisel', vals: { innerBevelStyle: 'chiselHard', innerBevelSoften: 0,   innerBevelDepth: 1.2, innerBevelSize: 0.10 } },
        { name: 'Carved Stone', vals: { innerBevelStyle: 'chiselHard', innerBevelSoften: 0.2, innerBevelDepth: 0.9, innerBevelSize: 0.14 } },
        { name: 'Soft Plastic', vals: { innerBevelStyle: 'smooth',     innerBevelSoften: 0.5, innerBevelDepth: 0.7, innerBevelSize: 0.14 } },
        { name: 'Pillow',       vals: { innerBevelStyle: 'pillow',     innerBevelSoften: 0.3, innerBevelDepth: 0.7, innerBevelSize: 0.16 } },
        { name: 'Engraved',     vals: { innerBevelStyle: 'chiselHard', innerBevelDirection: 'down', innerBevelSoften: 0, innerBevelDepth: 0.9, innerBevelSize: 0.08 } },
        { name: 'Outline Edge', vals: { innerBevelStyle: 'stroke',     innerBevelSoften: 0,   innerBevelDepth: 0.6, innerBevelSize: 0.04 } },
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
  addSection(makeSection('material', 'Material', '✦', (b) => {
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

    // ── LIVE WINDOW REFLECTIONS ──────────────────────────────────────────
    // Cube-camera-driven mirror finish: the text reflects whatever is around
    // it (chain, decorations, floor, HDRI) every frame. Costs roughly 1-2 ms
    // depending on scene complexity, so the user can rate-limit it.
    if (state.shadingMode === 'pbr') {
      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(makeToggle('🪟 Live Window Reflections', 'textLiveReflections',
        'Текст отражает крутящуюся цепь и сцену в реальном времени'));
      if (state.textLiveReflections) {
        b.appendChild(makeSlider('Reflection Strength', 'textLiveReflectionStrength', 0, 4, 0.05));
        b.appendChild(makeSlider('Update Every N Frames', 'textLiveReflectionEvery', 1, 6, 1, true));
        // Quality / resolution — higher = sharper mirror, more GPU.
        b.appendChild(makeSelect('Quality', 'textLiveReflectionRes', [
          { value: 256,  label: '256² (fast)' },
          { value: 512,  label: '512² (good)' },
          { value: 1024, label: '1024² (mirror) ⭐' },
          { value: 2048, label: '2048² (ultra)' },
        ]));

        // One-click presets that flip the right material flags for a
        // perfect mirror or clean glass look.
        b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
        b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Material Presets']));
        const grid = el('div', { class: 'preset-grid', style: 'grid-template-columns: 1fr 1fr;' });
        const fxPresets = [
          { name: '🪞 Perfect Mirror', vals: { metalness: 1, roughness: 0, clearcoat: 1, clearcoatRoughness: 0, transmission: 0, color: '#ffffff', textLiveReflectionStrength: 2.5, textLiveReflectionRes: 1024 } },
          { name: '🪟 Clean Glass',    vals: { metalness: 0, roughness: 0, clearcoat: 1, clearcoatRoughness: 0, transmission: 1, ior: 1.5, thickness: 0.6, color: '#ffffff', textLiveReflectionStrength: 1.6, textLiveReflectionRes: 1024 } },
          { name: '✨ Chrome',         vals: { metalness: 1, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02, transmission: 0, color: '#ffffff', textLiveReflectionStrength: 2.2, textLiveReflectionRes: 1024 } },
          { name: '💎 Crystal',        vals: { metalness: 0, roughness: 0, clearcoat: 1, clearcoatRoughness: 0, transmission: 0.85, ior: 1.5, thickness: 0.4, color: '#bae6fd', textLiveReflectionStrength: 1.4, textLiveReflectionRes: 1024 } },
        ];
        fxPresets.forEach((p) => {
          const btn = el('button', { class: 'preset-btn', type: 'button', style: 'justify-content:center;' });
          btn.textContent = p.name;
          btn.addEventListener('click', () => {
            pushUndo();
            Object.assign(state, p.vals);
            buildPanel();
            applyMaterial();
            // Quality change also rebuilds the cube target.
            buildReflectionRig(state.textLiveReflectionRes);
          });
          grid.appendChild(btn);
        });
        b.appendChild(grid);

        b.appendChild(el('p', { class: 'hint' }, [
          '🪞 Perfect Mirror: metalness=1, roughness=0. 🪟 Clean Glass: transmission=1, roughness=0. Quality 1024² — это уровень настоящего полированного стекла. 2048² для ультра-чёткости (медленнее).',
        ]));
      }
    }

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
    addSection(makeSection('material-extras', 'Advanced Material', '⚛', (b) => {
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
  addSection(makeSection('outline', 'Outline (Toon)', '◇', (b) => {
    b.appendChild(makeToggle('Enable Outline', 'outlineOn'));
    if (state.outlineOn) {
      b.appendChild(makeSlider('Thickness', 'outlineThickness', 0.005, 0.1, 0.005));
      b.appendChild(makeColor('Color', 'outlineColor'));
    }
  }, { collapsed: true }));

  // ========== DECORATIONS (3D items around the text) ==========
  addSection(makeSection('decorations', '🎁 3D Decorations', '🎁', (b) => {
    // Category dropdown — keeps the long item list manageable
    b.appendChild(makeSelect('Category', 'decorationCategory',
      [{ value: 'all', label: 'All' }, ...DECORATION_CATEGORIES.map(c => ({ value: c.id, label: c.name }))]
    ));

    // Visual icon grid — replaces the long single dropdown.
    const items = [{ id: 'none', name: 'None' }, ...resolveDecorationItems()];
    const iconGrid = el('div', { class: 'preset-grid', style: 'grid-template-columns: repeat(4, 1fr); gap:4px;' });
    items.forEach(it => {
      const btn = el('button', {
        class: 'preset-btn', type: 'button',
        style: 'justify-content:center; padding:6px 2px; min-height:34px; font-size:14px;',
        title: it.name,
      });
      if (state.decorationType === it.id) { btn.style.background = 'rgba(99,102,241,0.18)'; btn.style.color = '#a5a7f5'; }
      // Show only the leading symbol for compact view (fall back to short text).
      const m = it.name.match(/^([\W\d_]+)/);
      btn.textContent = m && m[1].trim().length ? m[1].trim() : it.name.slice(0, 4);
      btn.addEventListener('click', () => {
        pushUndo();
        state.decorationType = it.id;
        buildPanel(); rebuildDecorations();
      });
      iconGrid.appendChild(btn);
    });
    b.appendChild(iconGrid);

    if (state.decorationType !== 'none') {
      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
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
        '✋ Drag items to place them. Pinned items still spin but stop bobbing — toggle Spin Each Item if you want them frozen too.',
      ]));
      const resetBtn = el('button', { class: 'btn-secondary', type: 'button' }, ['↺ Reset positions']);
      resetBtn.addEventListener('click', () => { unpinAllDecorations(); });
      b.appendChild(resetBtn);
    }

    // Quick "vibe" presets
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Vibe Presets']));
    const vibes = [
      { name: '⭐ Stardust',       vals: { decorationType: 'star',     decorationCount: 24, decorationColor: '#ffe066', decorationEmissive: 1.5, decorationScale: 0.7, decorationSpread: 2.4 } },
      { name: '✦ Sparkle Magic',   vals: { decorationType: 'sparkle',  decorationCount: 30, decorationColor: '#ffffff', decorationEmissive: 2.5, decorationScale: 0.6, decorationSpread: 2.2 } },
      { name: '♫ Music Vibes',     vals: { decorationType: 'note2',    decorationCount: 12, decorationColor: '#a855f7', decorationEmissive: 0.4, decorationScale: 1.0, decorationSpread: 2.5 } },
      { name: '❤ Love',            vals: { decorationType: 'heart',    decorationCount: 18, decorationColor: '#ff5e9c', decorationEmissive: 0.3, decorationScale: 0.7, decorationSpread: 2.2 } },
      { name: '⛓ Chained',         vals: { decorationType: 'chain',    decorationCount: 28, decorationColor: '#c8c8c8', decorationMetalness: 1, decorationRoughness: 0.2, decorationScale: 0.9, decorationSpread: 2.8 } },
      { name: '👑 Royal',          vals: { decorationType: 'crown',    decorationCount: 6,  decorationColor: '#ffd166', decorationMetalness: 1, decorationRoughness: 0.15, decorationScale: 0.9, decorationSpread: 2.8 } },
      { name: '⚡ Electric',       vals: { decorationType: 'bolt',     decorationCount: 14, decorationColor: '#7dd3fc', decorationEmissive: 2.5, decorationScale: 0.8, decorationSpread: 2.4 } },
      { name: '💎 Diamonds',       vals: { decorationType: 'diamond',  decorationCount: 16, decorationColor: '#bae6fd', decorationScale: 0.6, decorationSpread: 2.4 } },
      { name: '🔥 Fire Ring',      vals: { decorationType: 'flame',    decorationCount: 16, decorationColor: '#ff6a00', decorationEmissive: 3.0, decorationScale: 0.8, decorationSpread: 2.2 } },
      { name: '○ Bubbles',         vals: { decorationType: 'bubble',   decorationCount: 22, decorationColor: '#bae6fd', decorationScale: 0.6, decorationSpread: 2.2 } },
      { name: '🪐 Cosmos',         vals: { decorationType: 'planet',   decorationCount: 5,  decorationColor: '#a855f7', decorationScale: 1.0, decorationSpread: 2.6 } },
      { name: '🚀 Liftoff',        vals: { decorationType: 'rocket',   decorationCount: 6,  decorationColor: '#ffffff', decorationEmissive: 0.4, decorationScale: 0.9, decorationSpread: 2.6 } },
      { name: '🌸 Garden',         vals: { decorationType: 'flower',   decorationCount: 16, decorationColor: '#ff8aff', decorationScale: 0.7, decorationSpread: 2.3 } },
      { name: '🦋 Wings',          vals: { decorationType: 'butterfly',decorationCount: 12, decorationColor: '#7dd3fc', decorationScale: 0.9, decorationSpread: 2.4 } },
      { name: '☀ Sunshine',        vals: { decorationType: 'sun',      decorationCount: 10, decorationColor: '#ffd166', decorationEmissive: 1.5, decorationScale: 0.7, decorationSpread: 2.5 } },
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
  addSection(makeSection('environment', 'Environment', '◯', (b) => {
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
  }));

  // ========== LIGHTING ==========
  addSection(makeSection('lighting', 'Lighting', '☀', (b) => {
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
  addSection(makeSection('bloom', '✨ Bloom', '✨', (b) => {
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
  addSection(makeSection('post', 'Extra Effects', '✶', (b) => {
    b.appendChild(makeToggle('Vignette', 'vignetteOn'));
    if (state.vignetteOn) b.appendChild(makeSlider('Intensity', 'vignetteIntensity', 0, 1, 0.02));
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Chromatic Aberration', 'chromaticOn', 'RGB-сдвиг по краям (как у анаморфных линз)'));
    if (state.chromaticOn) b.appendChild(makeSlider('Amount', 'chromaticAmount', 0, 0.02, 0.0005));
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Film Grain', 'grainOn', 'Кинематографическое зерно'));
    if (state.grainOn) b.appendChild(makeSlider('Amount', 'grainAmount', 0, 0.3, 0.005));
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Pixelate', 'pixelateOn', 'Ретро/глитч-стиль'));
    if (state.pixelateOn) b.appendChild(makeSlider('Pixel Size', 'pixelateSize', 1, 30, 1, true));
  }, { collapsed: true }));

  // ========== LAYER EFFECTS (Photoshop-style) ==========
  addSection(makeSection('layereffects', '🎨 Layer Effects', '🎨', (b) => {
    b.appendChild(makeToggle('Drop Shadow', 'dropShadowOn'));
    if (state.dropShadowOn) {
      b.appendChild(makeColor('Shadow Color', 'dropShadowColor'));
      b.appendChild(makeSlider('Opacity', 'dropShadowOpacity', 0, 1, 0.02));
      b.appendChild(makeSlider('Distance', 'dropShadowDistance', 0, 1, 0.01));
      b.appendChild(makeSlider('Angle', 'dropShadowAngle', 0, 360, 1, true));
      b.appendChild(makeSlider('Blur', 'dropShadowBlur', 0, 0.5, 0.01));
    }
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Outer Glow', 'outerGlowOn'));
    if (state.outerGlowOn) {
      b.appendChild(makeColor('Glow Color', 'outerGlowColor'));
      b.appendChild(makeSlider('Size', 'outerGlowSize', 0, 0.4, 0.005));
      b.appendChild(makeSlider('Intensity', 'outerGlowIntensity', 0, 4, 0.05));
    }

    // Quick preset combos
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Effect Presets']));
    const fxPresets = [
      { name: 'Hard Shadow',  vals: { dropShadowOn: true, dropShadowColor: '#000000', dropShadowOpacity: 0.7, dropShadowDistance: 0.18, dropShadowAngle: 135, dropShadowBlur: 0.05, outerGlowOn: false } },
      { name: 'Soft Shadow',  vals: { dropShadowOn: true, dropShadowColor: '#000000', dropShadowOpacity: 0.5, dropShadowDistance: 0.10, dropShadowAngle: 135, dropShadowBlur: 0.30, outerGlowOn: false } },
      { name: 'Neon Glow',    vals: { dropShadowOn: false, outerGlowOn: true, outerGlowColor: '#00d4ff', outerGlowSize: 0.18, outerGlowIntensity: 2.0 } },
      { name: 'Pink Aura',    vals: { dropShadowOn: false, outerGlowOn: true, outerGlowColor: '#ff5e9c', outerGlowSize: 0.14, outerGlowIntensity: 1.6 } },
      { name: 'Hot Glow',     vals: { dropShadowOn: false, outerGlowOn: true, outerGlowColor: '#ffae00', outerGlowSize: 0.20, outerGlowIntensity: 2.5 } },
      { name: 'Glow + Shadow',vals: { dropShadowOn: true, dropShadowColor: '#000000', dropShadowOpacity: 0.5, dropShadowDistance: 0.12, dropShadowAngle: 130, dropShadowBlur: 0.20, outerGlowOn: true, outerGlowColor: '#7dd3fc', outerGlowSize: 0.10, outerGlowIntensity: 1.4 } },
    ];
    const grid = el('div', { class: 'preset-grid', style: 'grid-template-columns: 1fr 1fr;' });
    fxPresets.forEach(p => {
      const btn = el('button', { class: 'preset-btn', type: 'button', style: 'justify-content:center;' });
      btn.textContent = p.name;
      btn.addEventListener('click', () => {
        pushUndo();
        Object.assign(state, p.vals);
        buildPanel();
        updateText();
      });
      grid.appendChild(btn);
    });
    b.appendChild(grid);
  }, { collapsed: true }));

  // ========== NECKLACE / CHAIN ==========
  addSection(makeSection('necklace', '⛓ Necklace / Chain', '⛓', (b) => {
    b.appendChild(makeSelect('Style', 'necklaceStyle',
      NECKLACE_STYLES.map((s) => ({ value: s.id, label: s.name }))
    ));

    if (state.necklaceStyle !== 'none') {
      // Visual style swatches — pick a chain by clicking its tile.
      const styleGrid = el('div', { class: 'preset-grid', style: 'grid-template-columns: 1fr 1fr;' });
      NECKLACE_STYLES.filter(s => s.id !== 'none').forEach((s) => {
        const btn = el('button', { class: 'preset-btn', type: 'button', style: 'justify-content:flex-start; padding:6px 10px;' });
        if (state.necklaceStyle === s.id) { btn.style.background = 'rgba(99,102,241,0.18)'; btn.style.color = '#a5a7f5'; }
        btn.textContent = s.name;
        btn.addEventListener('click', () => {
          pushUndo();
          state.necklaceStyle = s.id;
          buildPanel();
          rebuildNecklace();
        });
        styleGrid.appendChild(btn);
      });
      b.appendChild(styleGrid);

      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(makeSlider('Links',         'necklaceLinkCount', 6, 120, 1, true));
      b.appendChild(makeSlider('Radius',        'necklaceRadius',    1.0, 6.0, 0.05));
      b.appendChild(makeSlider('Link Size',     'necklaceLinkSize',  0.4, 3.0, 0.05));
      b.appendChild(makeSlider('Tilt (deg)',    'necklaceTilt',     -60, 60, 1, true));

      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(makeColor('Color', 'necklaceColor'));
      b.appendChild(makeToggle('🪟 Mirror Reflections', 'necklaceMirror', 'Polished window-like reflections (HDRI envmap, roughness ≈ 0)'));
      if (!state.necklaceMirror) {
        b.appendChild(makeSlider('Metalness', 'necklaceMetalness', 0, 1, 0.01));
        b.appendChild(makeSlider('Roughness', 'necklaceRoughness', 0, 1, 0.01));
      } else {
        b.appendChild(el('p', { class: 'hint' }, [
          'Mirror mode forces metalness=1, roughness≈0 — like polished glass / chrome reflecting the HDRI scene.',
        ]));
      }
      b.appendChild(makeSlider('Glow', 'necklaceEmissive', 0, 4, 0.05));

      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Animation']));

      // Animation pattern dropdown — choose a per-link motion preset.
      b.appendChild(makeSelect('Pattern', 'necklaceAnimation',
        NECKLACE_ANIMATIONS.map(a => ({ value: a.id, label: a.name }))
      ));
      // Visual grid for quick-picking animations
      const animGrid = el('div', { class: 'preset-grid', style: 'grid-template-columns: 1fr 1fr;' });
      NECKLACE_ANIMATIONS.forEach(a => {
        const btn = el('button', { class: 'preset-btn', type: 'button', style: 'justify-content:flex-start; padding:6px 10px;' });
        if (state.necklaceAnimation === a.id) { btn.style.background = 'rgba(99,102,241,0.18)'; btn.style.color = '#a5a7f5'; }
        btn.textContent = a.name;
        btn.addEventListener('click', () => {
          pushUndo();
          state.necklaceAnimation = a.id;
          buildPanel();
        });
        animGrid.appendChild(btn);
      });
      b.appendChild(animGrid);
      if (state.necklaceAnimation !== 'none') {
        b.appendChild(makeSlider('Anim Speed', 'necklaceAnimSpeed', 0, 4, 0.05));
      }

      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(makeToggle('Spin (whole ring)', 'necklaceSpin', 'Crутить цепь вокруг текста'));
      if (state.necklaceSpin) {
        b.appendChild(makeSlider('Spin Speed', 'necklaceSpinSpeed', 0, 4, 0.05));
        // Direction toggle (numeric +1 / -1).
        const dirRow = el('div', { class: 'row' });
        dirRow.appendChild(el('span', { class: 'row-label' }, ['Direction']));
        const dirGroup = el('div', { class: 'flex gap-1' });
        [
          { v:  1, label: '↻ Right' },
          { v: -1, label: '↺ Left'  },
        ].forEach((opt) => {
          const b2 = el('button', { class: 'preset-btn', type: 'button', style: 'padding:4px 8px; font-size:10px;' }, [opt.label]);
          if (state.necklaceSpinDir === opt.v) { b2.style.background = 'rgba(99,102,241,0.18)'; b2.style.color = '#a5a7f5'; }
          b2.addEventListener('click', () => {
            pushUndo();
            state.necklaceSpinDir = opt.v;
            buildPanel();
          });
          dirGroup.appendChild(b2);
        });
        dirRow.appendChild(dirGroup);
        b.appendChild(dirRow);
      }
      b.appendChild(makeToggle('Wobble', 'necklaceWobble', 'Лёгкое покачивание Z-axis'));

      // Quick "vibe" presets
      b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
      b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Vibe Presets']));
      const vibes = [
        { name: 'Gold Cuban',   vals: { necklaceStyle: 'oval',     necklaceColor: '#ffd166', necklaceMetalness: 1, necklaceRoughness: 0.18, necklaceLinkCount: 32, necklaceLinkSize: 1.1, necklaceRadius: 2.4, necklaceEmissive: 0 } },
        { name: 'Silver Box',   vals: { necklaceStyle: 'box',      necklaceColor: '#cbd5e1', necklaceMetalness: 1, necklaceRoughness: 0.15, necklaceLinkCount: 36, necklaceLinkSize: 1.0, necklaceRadius: 2.4, necklaceEmissive: 0 } },
        { name: 'Pink Pearls',  vals: { necklaceStyle: 'pearls',   necklaceColor: '#fbcfe8', necklaceMetalness: 0, necklaceRoughness: 0.2, necklaceLinkCount: 28, necklaceLinkSize: 1.0, necklaceRadius: 2.3, necklaceEmissive: 0 } },
        { name: 'Black Beads',  vals: { necklaceStyle: 'beads',    necklaceColor: '#111827', necklaceMetalness: 0.4, necklaceRoughness: 0.5, necklaceLinkCount: 30, necklaceLinkSize: 1.0, necklaceRadius: 2.4, necklaceEmissive: 0 } },
        { name: 'Punk Spikes',  vals: { necklaceStyle: 'spikes',   necklaceColor: '#1f2937', necklaceMetalness: 0.9, necklaceRoughness: 0.3, necklaceLinkCount: 22, necklaceLinkSize: 1.0, necklaceRadius: 2.2, necklaceEmissive: 0 } },
        { name: 'Diamond Cubes',vals: { necklaceStyle: 'cubes',    necklaceColor: '#bae6fd', necklaceMetalness: 0.2, necklaceRoughness: 0.05, necklaceLinkCount: 28, necklaceLinkSize: 0.7, necklaceRadius: 2.4, necklaceEmissive: 0.2 } },
        { name: 'Heart Gold',   vals: { necklaceStyle: 'hearts',   necklaceColor: '#ff5e9c', necklaceMetalness: 0.4, necklaceRoughness: 0.25, necklaceLinkCount: 18, necklaceLinkSize: 1.0, necklaceRadius: 2.4, necklaceEmissive: 0.2 } },
        { name: 'Star Glow',    vals: { necklaceStyle: 'stars',    necklaceColor: '#ffe066', necklaceMetalness: 0.3, necklaceRoughness: 0.3, necklaceLinkCount: 18, necklaceLinkSize: 0.9, necklaceRadius: 2.4, necklaceEmissive: 1.5 } },
        { name: 'Sparkle Halo', vals: { necklaceStyle: 'sparkles', necklaceColor: '#ffffff', necklaceMetalness: 0.0, necklaceRoughness: 1.0, necklaceLinkCount: 24, necklaceLinkSize: 0.7, necklaceRadius: 2.5, necklaceEmissive: 2.5 } },
        { name: 'Lightning',    vals: { necklaceStyle: 'bolts',    necklaceColor: '#7dd3fc', necklaceMetalness: 0, necklaceRoughness: 0.5, necklaceLinkCount: 16, necklaceLinkSize: 0.85, necklaceRadius: 2.4, necklaceEmissive: 2.5 } },
        { name: 'Rope Thick',   vals: { necklaceStyle: 'rope',     necklaceColor: '#ffd166', necklaceMetalness: 1, necklaceRoughness: 0.2, necklaceLinkCount: 56, necklaceLinkSize: 1.0, necklaceRadius: 2.4, necklaceEmissive: 0 } },
        { name: 'Figaro Gold',  vals: { necklaceStyle: 'figaro',   necklaceColor: '#ffd166', necklaceMetalness: 1, necklaceRoughness: 0.18, necklaceLinkCount: 36, necklaceLinkSize: 1.0, necklaceRadius: 2.4, necklaceEmissive: 0 } },
        { name: 'Octa Crystal', vals: { necklaceStyle: 'octa',     necklaceColor: '#bae6fd', necklaceMetalness: 0.2, necklaceRoughness: 0.05, necklaceLinkCount: 24, necklaceLinkSize: 1.0, necklaceRadius: 2.4, necklaceEmissive: 0.4 } },
        { name: 'Disc Tribe',   vals: { necklaceStyle: 'disc',     necklaceColor: '#92400e', necklaceMetalness: 0.4, necklaceRoughness: 0.5, necklaceLinkCount: 30, necklaceLinkSize: 1.0, necklaceRadius: 2.3, necklaceEmissive: 0 } },
        { name: 'Rose Petals',  vals: { necklaceStyle: 'flower',   necklaceColor: '#ff5e9c', necklaceMetalness: 0.1, necklaceRoughness: 0.4, necklaceLinkCount: 20, necklaceLinkSize: 1.0, necklaceRadius: 2.4, necklaceEmissive: 0.2 } },
        { name: 'Square Edge',  vals: { necklaceStyle: 'square',   necklaceColor: '#e7e9ee', necklaceMetalness: 1, necklaceRoughness: 0.3, necklaceLinkCount: 28, necklaceLinkSize: 1.0, necklaceRadius: 2.4, necklaceEmissive: 0 } },
      ];
      const grid = el('div', { class: 'preset-grid', style: 'grid-template-columns: 1fr 1fr;' });
      vibes.forEach((v) => {
        const btn = el('button', { class: 'preset-btn', type: 'button', style: 'justify-content:center;' });
        btn.textContent = v.name;
        btn.addEventListener('click', () => {
          pushUndo();
          Object.assign(state, v.vals);
          buildPanel();
          rebuildNecklace();
        });
        grid.appendChild(btn);
      });
      b.appendChild(grid);
    }
  }));

  // ========== PARTICLES ==========
  addSection(makeSection('particles', '❄ Particles', '❄', (b) => {
    b.appendChild(makeSelect('Type', 'particlesType', [
      { value: 'none',   label: 'None' },
      { value: 'snow',   label: '❄ Snow' },
      { value: 'rain',   label: '☔ Rain' },
      { value: 'embers', label: '🔥 Embers (rising)' },
      { value: 'dust',   label: '✨ Magic Dust' },
      { value: 'leaves', label: '🍃 Falling Leaves' },
      { value: 'bokeh',  label: '○ Bokeh' },
    ]));
    if (state.particlesType !== 'none') {
      b.appendChild(makeSlider('Count', 'particlesCount', 10, 2000, 10, true));
      b.appendChild(makeColor('Color', 'particlesColor'));
      b.appendChild(makeSlider('Size', 'particlesSize', 0.005, 0.4, 0.005));
      b.appendChild(makeSlider('Speed', 'particlesSpeed', 0, 4, 0.05));
      b.appendChild(makeSlider('Glow (additive)', 'particlesEmissive', 0, 1, 0.05));
    }
  }, { collapsed: true }));

  // ========== FLOOR ==========
  addSection(makeSection('floor', '◐ Floor / Ground', '◐', (b) => {
    b.appendChild(makeToggle('Soft Contact Shadow', 'showShadows'));
    b.appendChild(makeToggle('Show Grid', 'showGrid'));
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Reflective Floor', 'reflectiveFloor', 'Глянцевый отражающий пол'));
    if (state.reflectiveFloor) {
      b.appendChild(makeSlider('Opacity', 'reflectiveFloorOpacity', 0, 1, 0.02));
    }
  }, { collapsed: true }));

  // ========== CAMERA ==========
  addSection(makeSection('camera', 'Camera', '🎥', (b) => {
    b.appendChild(makeToggle('Orthographic', 'orthographic', 'Disable perspective'));
    if (!state.orthographic) {
      b.appendChild(makeSlider('FOV', 'fov', 10, 90, 1, true));
    }
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Camera Shake', 'cameraShakeOn', 'Дрожание камеры (cinematic)'));
    if (state.cameraShakeOn) b.appendChild(makeSlider('Amount', 'cameraShakeAmount', 0, 2, 0.05));
    const btnFrame = el('button', { class: 'btn-secondary', type: 'button' }, ['⛶ Frame Camera']);
    btnFrame.addEventListener('click', frameCamera);
    b.appendChild(btnFrame);
  }, { collapsed: true }));

  // ========== ANIMATION ==========
  addSection(makeSection('animation', 'Animation', '↻', (b) => {
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
  // ========== TEMPLATES (one-click pro looks — Logo / Title / Cinematic) ==========
  addSection(makeSection('templates', '✨ Logo Templates', '✨', (b) => {
    b.appendChild(el('p', { class: 'hint' }, [
      'One-click pro designs. Each template applies a coordinated combo of geometry, material, environment, effects and decorations.',
    ]));
    const grid = el('div', { class: 'preset-grid', style: 'grid-template-columns: 1fr 1fr;' });
    LOGO_TEMPLATES.forEach((tpl) => {
      const btn = el('button', { class: 'preset-btn', type: 'button', style: 'justify-content:flex-start; padding:8px 10px; min-height:44px; flex-direction:column; align-items:flex-start; gap:2px;' });
      btn.innerHTML =
        `<span style="font-size:11px; font-weight:600; color:#e7e9ee;">${tpl.icon} ${tpl.name}</span>` +
        `<span style="font-size:9px; color:#7a7f8c;">${tpl.tagline}</span>`;
      btn.addEventListener('click', () => applyLogoTemplate(tpl));
      grid.appendChild(btn);
    });
    b.appendChild(grid);

    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Smart Tools']));

    const acBtn = el('button', { class: 'btn-secondary', type: 'button' }, ['🎨 Auto-Color from HDRI']);
    acBtn.addEventListener('click', () => autoColorFromHDRI());
    b.appendChild(acBtn);

    const surpriseBtn = el('button', { class: 'btn-primary', type: 'button' }, ['🎲 Surprise Me!']);
    surpriseBtn.addEventListener('click', () => {
      const tpl = LOGO_TEMPLATES[Math.floor(Math.random() * LOGO_TEMPLATES.length)];
      applyLogoTemplate(tpl);
    });
    b.appendChild(surpriseBtn);
  }));

  addSection(makeSection('export', 'Export', '⤓', (b) => {
    b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Image']));
    [
      ['📷 PNG (1×)', () => exportPNG(1)],
      ['📷 PNG (2×)', () => exportPNG(2)],
      ['📷 PNG (4×)', () => exportPNG(4)],
    ].forEach(([label, fn]) => {
      const btn = el('button', { class: 'btn-secondary', type: 'button' }, [label]);
      btn.addEventListener('click', fn);
      b.appendChild(btn);
    });

    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Video & Animation']));
    b.appendChild(makeSlider('Video Duration (sec)', 'videoDuration', 1, 60, 1, true));
    b.appendChild(makeSlider('Video FPS', 'videoFps', 12, 60, 1, true));
    [
      ['🎬 MP4 / WebM (Loop)', () => exportVideo()],
      ['🎞 GIF (animated)',    () => exportGIF()],
    ].forEach(([label, fn]) => {
      const btn = el('button', { class: 'btn-secondary', type: 'button' }, [label]);
      btn.addEventListener('click', fn);
      b.appendChild(btn);
    });
    b.appendChild(el('p', { class: 'hint' }, [
      'Записывает ровно один цикл анимации. После записи откроется превью с автоматическим loop — оттуда можно скачать файл.',
    ]));

    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['3D Model']));
    [
      ['📦 GLB (recommended — keeps colors)', () => exportGLB()],
      ['🎨 PLY (with vertex colors)',         () => exportPLY()],
      ['📐 OBJ',                              () => exportOBJ()],
      ['🖨 STL (geometry only — no colors)', () => exportSTL()],
    ].forEach(([label, fn]) => {
      const btn = el('button', { class: 'btn-secondary', type: 'button' }, [label]);
      btn.addEventListener('click', fn);
      b.appendChild(btn);
    });
    b.appendChild(el('p', { class: 'hint' }, [
      'STL stores only geometry — colors and animation are not part of the format. Use GLB for full PBR colors, PLY for baked vertex colors.',
    ]));
  }, { collapsed: true }));

  // ========== PRESETS / SCENE ==========
  addSection(makeSection('presets', 'Scene Presets', '★', (b) => {
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
  addSection(makeSection('stats', 'Stats', '📊', (b) => {
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
  // Layer effects (drop shadow + outer glow create extra meshes around the body).
  'dropShadowOn', 'dropShadowColor', 'dropShadowOpacity', 'dropShadowBlur',
  'dropShadowDistance', 'dropShadowAngle',
  'outerGlowOn', 'outerGlowColor', 'outerGlowSize', 'outerGlowIntensity',
]);
const MATERIAL_KEYS = new Set([
  'color', 'roughness', 'metalness', 'clearcoat', 'clearcoatRoughness', 'reflectivity',
  'flatShading', 'wireframe', 'emissive', 'emissiveIntensity',
  'transmission', 'ior', 'thickness',
  'sheen', 'sheenColor', 'sheenRoughness',
  'iridescence', 'iridescenceIOR', 'iridescenceThickness',
  'outlineColor',
  'innerBevelTintOn', 'innerBevelHighlight',
]);

function handleChange(key) {
  if (key === 'fontId') { setActiveFont().then(updateHud); return; }
  if (GEOMETRY_KEYS.has(key)) {
    const rebuild = ['bevelEnabled', 'innerBevel', 'innerBevelStyle', 'innerBevelDirection', 'innerBevelTintOn', 'shadingMode', 'outlineOn'].includes(key);
    if (rebuild) buildPanel();
    if (['flatShading', 'wireframe', 'matcapId'].includes(key)) applyMaterial();
    updateText();
  }
  if (MATERIAL_KEYS.has(key)) applyMaterial();
  // Tint toggle needs a panel rebuild so the color picker shows/hides.
  if (key === 'innerBevelTintOn') buildPanel();

  if (['bgMode', 'background', 'bgGradientTop', 'bgGradientBottom'].includes(key)) {
    if (key === 'bgMode') buildPanel();
    gradientMat.uniforms.topColor.value.set(state.bgGradientTop);
    gradientMat.uniforms.bottomColor.value.set(state.bgGradientBottom);
    applyBackground();
  }
  if (key === 'envPreset') { loadHDRI(state.envPreset); updateHud(); }
  if (key === 'textLiveReflections') buildPanel();
  if (key === 'textLiveReflectionRes') {
    // Resolution change: rebuild the cube render target. The makeSelect
    // helper stores values as strings, so coerce back to int first.
    state.textLiveReflectionRes = parseInt(state.textLiveReflectionRes, 10) || 1024;
    buildReflectionRig(state.textLiveReflectionRes);
    // Force the next frame to refresh and re-bind the new texture.
    if (pbrMaterial.envMap) {
      pbrMaterial.envMap = null;
      pbrMaterial.needsUpdate = true;
    }
  }
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
       'grainOn', 'grainAmount',
       'pixelateOn', 'pixelateSize'].includes(key)) {
    if (['bloomOn', 'vignetteOn', 'chromaticOn', 'grainOn', 'pixelateOn'].includes(key)) buildPanel();
    updatePostProcessing();
  }

  // Decorations
  if (key === 'decorationType' || key === 'decorationCategory') buildPanel();
  if ([
    'decorationType', 'decorationCount', 'decorationScale', 'decorationSpread',
    'decorationColor', 'decorationMetalness', 'decorationRoughness', 'decorationEmissive',
  ].includes(key)) {
    rebuildDecorations();
  }

  // Necklace
  // - Style change rebuilds the chain (different geometry).
  // - Count / radius / link-size / tilt all rebuild because they recreate
  //   the per-link instances or the pivot transform.
  // - Material-only changes (color, metalness, roughness, emissive) take a
  //   cheap path that updates the shared MeshPhysicalMaterial uniforms.
  if (key === 'necklaceStyle' || key === 'necklaceMirror' || key === 'necklaceAnimation') buildPanel();
  if ([
    'necklaceStyle', 'necklaceLinkCount', 'necklaceRadius',
    'necklaceLinkSize', 'necklaceTilt', 'necklaceMirror',
  ].includes(key)) {
    rebuildNecklace();
  }
  if ([
    'necklaceColor', 'necklaceMetalness', 'necklaceRoughness', 'necklaceEmissive',
  ].includes(key)) {
    applyNecklaceMaterial();
  }

  // Particles
  if (['particlesType', 'particlesCount'].includes(key)) {
    if (key === 'particlesType') buildPanel();
    rebuildParticles();
  }
  if (['particlesColor', 'particlesSize', 'particlesEmissive'].includes(key)) {
    applyParticleStyling();
  }

  // Reflective floor
  if (['reflectiveFloor', 'reflectiveFloorOpacity'].includes(key)) {
    rebuildReflectiveFloor();
    if (key === 'reflectiveFloor') buildPanel();
  }

  // Layer effect bevel-flag rebuilds the panel so sliders show/hide
  if (['dropShadowOn', 'outerGlowOn'].includes(key)) buildPanel();

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
  if (pixelatePass) {
    pixelatePass.enabled = state.pixelateOn;
    pixelatePass.uniforms.pixelSize.value = state.pixelateSize;
    pixelatePass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
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

// PLY *can* store per-vertex colours, so we bake the active material colour
// into each vertex of every text-group mesh before exporting.
async function exportPLY() {
  const { PLYExporter } = await import('three/addons/exporters/PLYExporter.js');
  // Bake the body's PBR colour into a vertex-colour attribute on every mesh.
  const baked = [];
  textGroup.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry) return;
    const geom = obj.geometry.clone();
    const count = geom.attributes.position.count;
    const colArr = new Float32Array(count * 3);
    const c = obj.material && obj.material.color ? obj.material.color : new THREE.Color(state.color);
    for (let i = 0; i < count; i++) {
      colArr[i * 3    ] = c.r;
      colArr[i * 3 + 1] = c.g;
      colArr[i * 3 + 2] = c.b;
    }
    geom.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
    baked.push(new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ vertexColors: true })));
  });
  const tempGroup = new THREE.Group();
  baked.forEach((m) => tempGroup.add(m));
  new PLYExporter().parse(tempGroup, (data) => {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    download(URL.createObjectURL(blob), `3d-text-${Date.now()}.ply`, true);
    baked.forEach((m) => m.geometry.dispose());
  }, { binary: true, includeColors: true });
}

// Live MediaRecorder capture of the WebGL canvas. Output is .webm (Chrome/
// Firefox) or .mp4 when the browser supports the H.264 codec (newer Chrome,
// Edge, Safari). The user can rename .webm to .mp4 if their video tool needs
// that extension — most players accept either container.
let _recordingInProgress = false;
function exportVideo() {
  if (_recordingInProgress) { alert('Запись уже идёт, подожди завершения.'); return; }
  if (!canvas.captureStream) {
    alert('Твой браузер не поддерживает canvas.captureStream(). Попробуй Chrome / Edge.');
    return;
  }
  // Pick the best mime type the browser supports (preferred order: mp4 → webm-vp9 → webm-vp8).
  const candidates = [
    { mime: 'video/mp4;codecs=avc1',  ext: 'mp4'  },
    { mime: 'video/webm;codecs=vp9',  ext: 'webm' },
    { mime: 'video/webm;codecs=vp8',  ext: 'webm' },
    { mime: 'video/webm',             ext: 'webm' },
  ];
  let chosen = null;
  for (const c of candidates) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(c.mime)) { chosen = c; break; }
  }
  if (!chosen) { alert('MediaRecorder API недоступен в этом браузере.'); return; }

  const fps = Math.max(12, Math.min(60, state.videoFps || 30));
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType: chosen.mime, videoBitsPerSecond: 8_000_000 });
  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  recorder.onstop = () => {
    _recordingInProgress = false;
    setRecordingHud(false);
    const blob = new Blob(chunks, { type: chosen.mime });
    const url = URL.createObjectURL(blob);
    // Show a built-in looping preview so the user can immediately see the
    // file plays as a seamless loop. Video files don't loop "by themselves";
    // looping is a player feature — we use <video loop> here, then offer
    // download. The MP4/WebM container has no native loop flag.
    showLoopPreview(url, chosen.ext);
  };

  _recordingInProgress = true;
  // Record exactly one full animation cycle. NO tail buffer — that was
  // breaking the seamless loop because the last second showed a near-static
  // frame. With a clean cycle, <video loop> wraps perfectly.
  const totalSec = Math.max(1, state.videoDuration || 5);
  setRecordingHud(true, totalSec);
  recorder.start();
  setTimeout(() => { try { recorder.stop(); } catch (e) { console.error(e); } }, totalSec * 1000);
}

// Modal that plays the recorded clip on a loop, with Download / Close buttons.
// MP4 / WebM don't have a "loop" flag baked into the container; the seamless-
// looking playback you see in social apps is the player's `loop` attribute.
// We recreate that experience here.
function showLoopPreview(blobUrl, ext) {
  const old = document.getElementById('loopPreviewModal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'loopPreviewModal';
  modal.style.cssText =
    'position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center;' +
    'background:rgba(0,0,0,0.78); backdrop-filter:blur(6px);';

  const card = document.createElement('div');
  card.style.cssText =
    'max-width:min(680px, 90vw); width:100%; background:#0e1014;' +
    'border:1px solid rgba(54,58,69,0.5); border-radius:12px; overflow:hidden;' +
    'box-shadow:0 20px 60px rgba(0,0,0,0.5); display:flex; flex-direction:column;';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'padding:12px 16px; border-bottom:1px solid rgba(54,58,69,0.4); display:flex; align-items:center; justify-content:space-between;';
  header.innerHTML =
    '<span style="font-weight:600; font-size:13px; color:#e7e9ee;">' +
    '🔁 Loop Preview — playing on repeat</span>' +
    '<span style="font-family:\'JetBrains Mono\', monospace; font-size:10px; color:#7a7f8c;">' + ext.toUpperCase() + '</span>';
  card.appendChild(header);

  // Looping <video> player. The `loop` attribute is what makes it appear
  // endless. Without it, MP4/WebM stops at the end of the file.
  const video = document.createElement('video');
  video.src = blobUrl;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.controls = true;
  video.style.cssText = 'width:100%; display:block; background:#000; max-height:60vh;';
  card.appendChild(video);

  // Footer with actions
  const footer = document.createElement('div');
  footer.style.cssText = 'padding:12px 16px; display:flex; gap:8px; justify-content:flex-end;';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn-secondary';
  closeBtn.style.cssText = 'padding:8px 14px; flex:0 0 auto;';
  closeBtn.textContent = 'Close';
  closeBtn.onclick = () => {
    URL.revokeObjectURL(blobUrl);
    modal.remove();
  };
  const dlBtn = document.createElement('button');
  dlBtn.className = 'btn-primary';
  dlBtn.style.cssText = 'padding:8px 14px; flex:0 0 auto;';
  dlBtn.textContent = '⤓ Download ' + ext.toUpperCase();
  dlBtn.onclick = () => {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `3d-text-loop-${Date.now()}.${ext}`;
    a.click();
  };
  footer.appendChild(closeBtn);
  footer.appendChild(dlBtn);
  card.appendChild(footer);

  // Hint about how looping works
  const hint = document.createElement('div');
  hint.style.cssText = 'padding:0 16px 12px 16px; font-size:10px; color:#7a7f8c; line-height:1.5;';
  hint.innerHTML =
    'Видео-файл (MP4/WebM) сам по себе не «лупит» — это делает плеер. ' +
    'Этот предпросмотр играет с включённым <code style="background:rgba(255,255,255,0.06); padding:1px 4px; border-radius:3px;">loop</code> атрибутом. ' +
    'В Instagram / TikTok ролик зациклится автоматически. В обычном плеере включи кнопку Loop / Repeat.';
  card.appendChild(hint);

  modal.appendChild(card);
  // Click backdrop to close
  modal.addEventListener('click', (e) => { if (e.target === modal) closeBtn.click(); });
  document.body.appendChild(modal);
}

// On-screen recording badge so the user can see capture is in progress.
function setRecordingHud(on, totalSec = 0) {
  let badge = document.getElementById('recBadge');
  if (!on) { if (badge) badge.remove(); return; }
  badge = document.createElement('div');
  badge.id = 'recBadge';
  badge.style.cssText =
    'position:fixed; top:60px; left:50%; transform:translateX(-50%); z-index:30;' +
    'padding:6px 14px; background:rgba(220,38,38,0.92); color:#fff;' +
    'font-family: "JetBrains Mono", monospace; font-size:11px; border-radius:999px;' +
    'box-shadow:0 0 18px rgba(220,38,38,0.6); display:flex; align-items:center; gap:8px;';
  const dot = document.createElement('span');
  dot.style.cssText = 'width:8px; height:8px; border-radius:50%; background:#fff; animation:pulseRec 1s infinite;';
  const lab = document.createElement('span');
  lab.id = 'recBadgeLabel';
  lab.textContent = `REC · ${totalSec}s`;
  badge.appendChild(dot); badge.appendChild(lab);
  document.body.appendChild(badge);
  if (!document.getElementById('recBadgeStyle')) {
    const s = document.createElement('style');
    s.id = 'recBadgeStyle';
    s.textContent = '@keyframes pulseRec { 0%,100% { opacity:1 } 50% { opacity:0.3 } }';
    document.head.appendChild(s);
  }
  // Countdown
  let remaining = totalSec;
  const t = setInterval(() => {
    remaining--;
    const el = document.getElementById('recBadgeLabel');
    if (el) el.textContent = `REC · ${Math.max(0, remaining)}s`;
    if (remaining <= 0 || !document.getElementById('recBadge')) clearInterval(t);
  }, 1000);
}

// Animated GIF export via gif.js (lazy-loaded from a CDN). The recorder
// samples the WebGL canvas at the chosen FPS for the chosen duration.
async function exportGIF() {
  if (_recordingInProgress) { alert('Подожди — запись видео ещё идёт.'); return; }
  // Lazy-load gif.js + its worker from a CDN that exposes them as ES modules.
  const gifJsUrl    = 'https://cdn.jsdelivr.net/npm/gif.js.optimized@1.0.1/dist/gif.js';
  const gifWorker   = 'https://cdn.jsdelivr.net/npm/gif.js.optimized@1.0.1/dist/gif.worker.js';
  if (!window.GIF) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = gifJsUrl;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    }).catch(() => { alert('Не удалось загрузить gif.js. Проверь интернет.'); });
    if (!window.GIF) return;
  }

  const fps = Math.max(8, Math.min(30, state.videoFps || 20));
  // Record exactly one full cycle for a seamless loop (GIFs auto-loop in
  // every viewer, so no tail buffer is needed — and a tail would actually
  // create a visible "pause" between loops).
  const duration = Math.max(1, Math.min(60, state.videoDuration || 5));
  const totalFrames = Math.round(fps * duration);
  const frameDelay = Math.round(1000 / fps);

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const gif = new window.GIF({
    workers: 2,
    quality: 10,
    width: Math.min(800, w),
    height: Math.min(800, h) * (Math.min(800, w) / w),
    workerScript: gifWorker,
    transparent: null,
  });

  _recordingInProgress = true;
  setRecordingHud(true, duration);

  // Capture loop: render + addFrame, paced by frameDelay.
  let frame = 0;
  const captureCanvas = document.createElement('canvas');
  captureCanvas.width = Math.min(800, w);
  captureCanvas.height = Math.round(captureCanvas.width * (h / w));
  const cctx = captureCanvas.getContext('2d');

  const captureOne = () => {
    if (frame >= totalFrames) {
      gif.on('finished', (blob) => {
        _recordingInProgress = false;
        setRecordingHud(false);
        download(URL.createObjectURL(blob), `3d-text-${Date.now()}.gif`, true);
      });
      gif.render();
      return;
    }
    // The canvas is rendered every requestAnimationFrame by the main loop —
    // we just sample it. Scale-down via a 2D canvas so file size stays sane.
    cctx.drawImage(canvas, 0, 0, captureCanvas.width, captureCanvas.height);
    gif.addFrame(captureCanvas, { copy: true, delay: frameDelay });
    frame++;
    setTimeout(captureOne, frameDelay);
  };
  captureOne();
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
  rebuildParticles();
  rebuildReflectiveFloor();
  rebuildNecklace();
  controls.autoRotate = state.autoRotate;
  controls.autoRotateSpeed = state.autoRotateSpeed * 2;
  document.getElementById('statsOverlay').style.display = state.showStats ? 'flex' : 'none';
  buildLeftRail();
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
  else if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); exportPNG(2); }
  else if (meta && e.key.toLowerCase() === 'e') { e.preventDefault(); exportPNG(2); }
});

// ============ TOP-BAR MENUS (File / Edit / View / Help) ============
// Premium-looking dropdown menus that wire into the app's existing actions.
// Each menu is a flat array of items: { label, shortcut?, action?, divider?, section? }.
const TOPBAR_MENUS = {
  file: [
    { section: 'Project' },
    { label: 'New / Reset Scene',   shortcut: 'Ctrl+N',  action: () => resetAll() },
    { label: 'Randomize',           shortcut: 'Ctrl+R',  action: () => randomizeAll() },
    { divider: true },
    { section: 'Save / Load' },
    { label: 'Quick Save Scene',                         action: () => savePreset('quick-' + new Date().toISOString().slice(11, 19)) },
    { label: 'Open Scene Manager',                       action: () => switchToTab('project', 'presets') },
    { divider: true },
    { section: 'Export' },
    { label: 'Export PNG (2×)',     shortcut: 'Ctrl+S',  action: () => exportPNG(2) },
    { label: 'Export PNG (4×)',                          action: () => exportPNG(4) },
    { label: 'Export Loop Video',                        action: () => exportVideo() },
    { label: 'Export GIF',                               action: () => exportGIF() },
    { label: 'Export GLB Model',                         action: () => exportGLB() },
    { label: 'Open Export Tab',                          action: () => switchToTab('project', 'export') },
  ],
  edit: [
    { section: 'History' },
    { label: 'Undo',                shortcut: 'Ctrl+Z',  action: () => undo() },
    { label: 'Redo',                shortcut: 'Ctrl+Y',  action: () => redo() },
    { divider: true },
    { section: 'Smart Edits' },
    { label: 'Auto-Center & Frame',                      action: () => { frameCamera(); } },
    { label: 'Reset Sticker Positions',                  action: () => unpinAllDecorations() },
    { label: 'Clear All Decorations',                    action: () => { state.decorationType = 'none'; rebuildDecorations(); buildPanel(); } },
    { label: 'Clear All Particles',                      action: () => { state.particlesType = 'none'; rebuildParticles(); buildPanel(); } },
    { label: 'Clear All Effects (post-FX)',              action: () => {
      pushUndo();
      Object.assign(state, { bloomOn: false, vignetteOn: false, chromaticOn: false, grainOn: false, pixelateOn: false });
      updatePostProcessing(); buildPanel();
    } },
  ],
  view: [
    { section: 'Camera' },
    { label: 'Frame / Reset Camera',                     action: () => frameCamera() },
    { label: 'Toggle Auto-Rotate',                       action: () => { pushUndo(); state.autoRotate = !state.autoRotate; controls.autoRotate = state.autoRotate; controls.autoRotateSpeed = state.autoRotateSpeed * 2; buildPanel(); } },
    { label: 'Toggle Orthographic',                      action: () => { pushUndo(); state.orthographic = !state.orthographic; updateCamera(); buildPanel(); } },
    { divider: true },
    { section: 'Overlays' },
    { label: 'Toggle Stats Overlay',                     action: () => { state.showStats = !state.showStats; document.getElementById('statsOverlay').style.display = state.showStats ? 'flex' : 'none'; } },
    { label: 'Toggle Floor Grid',                        action: () => { state.showGrid = !state.showGrid; gridHelper.visible = state.showGrid; } },
    { label: 'Toggle Reflective Floor',                  action: () => { state.reflectiveFloor = !state.reflectiveFloor; rebuildReflectiveFloor(); buildPanel(); } },
    { divider: true },
    { section: 'Workspace' },
    { label: 'Go to Content',                            action: () => switchToTab('content') },
    { label: 'Go to Geometry & Material',                action: () => switchToTab('shape') },
    { label: 'Go to Effects',                            action: () => switchToTab('effects') },
    { label: 'Go to Decorations',                        action: () => switchToTab('decorate') },
    { label: 'Go to Scene & Camera',                     action: () => switchToTab('scene') },
    { label: 'Go to Project',                            action: () => switchToTab('project') },
  ],
  help: [
    { section: 'Help' },
    { label: 'Show Keyboard Shortcuts',                  action: () => showShortcutsModal() },
    { label: 'About 3D Text Studio',                     action: () => showAboutModal() },
    { divider: true },
    { section: 'Resources' },
    { label: 'Three.js Documentation ↗',                 action: () => window.open('https://threejs.org/docs/', '_blank') },
    { label: 'Source on GitHub ↗',                       action: () => window.open('https://github.com/samandarazamov73-bit/spiderman-game', '_blank') },
  ],
};

function switchToTab(tabId, sectionId) {
  if (state.activeTab !== tabId) {
    state.activeTab = tabId;
    buildLeftRail();
    buildPanel();
  }
  if (sectionId) {
    // Scroll the right panel to that section if present
    const el = document.getElementById('sec-' + sectionId);
    if (el) {
      el.classList.remove('collapsed');
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function showShortcutsModal() {
  showInfoModal('⌨ Keyboard Shortcuts', `
    <table style="width:100%; font-size:11px; color:#b5b9c2;">
      <tr><td style="padding:4px 8px;">Undo</td><td style="font-family:monospace;">Ctrl+Z</td></tr>
      <tr><td style="padding:4px 8px;">Redo</td><td style="font-family:monospace;">Ctrl+Y / Ctrl+Shift+Z</td></tr>
      <tr><td style="padding:4px 8px;">Export PNG</td><td style="font-family:monospace;">Ctrl+S / Ctrl+E</td></tr>
      <tr><td style="padding:4px 8px;">Drag camera</td><td style="font-family:monospace;">Left mouse drag</td></tr>
      <tr><td style="padding:4px 8px;">Pan camera</td><td style="font-family:monospace;">Right mouse drag</td></tr>
      <tr><td style="padding:4px 8px;">Zoom camera</td><td style="font-family:monospace;">Scroll wheel</td></tr>
      <tr><td style="padding:4px 8px;">Move sticker</td><td style="font-family:monospace;">Click + drag</td></tr>
    </table>
  `);
}
function showAboutModal() {
  showInfoModal('About 3D Text Studio', `
    <div style="font-size:12px; color:#b5b9c2; line-height:1.6;">
      <p><b>3D Text Studio</b> — a free, open-source browser-based 3D text generator.</p>
      <p style="margin-top:10px;">Built with three.js, vanilla JavaScript, and Tailwind CSS. No build step required.</p>
      <p style="margin-top:10px; font-size:10px; color:#7a7f8c;">Version 0.3 · Made with ❤ by Kiro</p>
    </div>
  `);
}
function showInfoModal(title, htmlBody) {
  const old = document.getElementById('infoModal');
  if (old) old.remove();
  const modal = document.createElement('div');
  modal.id = 'infoModal';
  modal.style.cssText = 'position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.78); backdrop-filter:blur(6px);';
  const card = document.createElement('div');
  card.style.cssText = 'max-width:min(520px, 90vw); width:100%; background:#0e1014; border:1px solid rgba(54,58,69,0.5); border-radius:12px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.5);';
  card.innerHTML = `
    <div style="padding:12px 16px; border-bottom:1px solid rgba(54,58,69,0.4); font-weight:600; font-size:13px; color:#e7e9ee;">${title}</div>
    <div style="padding:16px;">${htmlBody}</div>
    <div style="padding:12px 16px; display:flex; justify-content:flex-end;">
      <button class="btn-secondary" style="padding:8px 16px; flex:0 0 auto;">Close</button>
    </div>`;
  card.querySelector('button').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  modal.appendChild(card);
  document.body.appendChild(modal);
}

// Wire up the topbar menu buttons.
(function wireTopbarMenus() {
  const menusContainer = document.getElementById('topbarMenus');
  if (!menusContainer) return;
  let openPopover = null;
  let openBtn = null;

  function close() {
    if (openPopover) { openPopover.remove(); openPopover = null; }
    if (openBtn) { openBtn.classList.remove('open'); openBtn = null; }
  }

  function openMenu(btn, menuId) {
    close();
    const items = TOPBAR_MENUS[menuId];
    if (!items) return;
    const pop = document.createElement('div');
    pop.className = 'topbar-menu-popover';
    items.forEach((it) => {
      if (it.divider) {
        const d = document.createElement('div');
        d.className = 'topbar-menu-divider';
        pop.appendChild(d);
      } else if (it.section) {
        const s = document.createElement('div');
        s.className = 'topbar-menu-section';
        s.textContent = it.section;
        pop.appendChild(s);
      } else {
        const b = document.createElement('button');
        b.className = 'topbar-menu-item' + (it.danger ? ' danger' : '');
        b.innerHTML = `<span>${it.label}</span>${it.shortcut ? `<span class="shortcut">${it.shortcut}</span>` : ''}`;
        b.addEventListener('click', () => { close(); try { it.action && it.action(); } catch (e) { console.error(e); } });
        pop.appendChild(b);
      }
    });
    // Position popover under the button.
    const r = btn.getBoundingClientRect();
    const containerR = menusContainer.getBoundingClientRect();
    pop.style.left = (r.left - containerR.left) + 'px';
    menusContainer.appendChild(pop);
    btn.classList.add('open');
    openBtn = btn;
    openPopover = pop;
    requestAnimationFrame(() => pop.classList.add('show'));
  }

  menusContainer.querySelectorAll('.topbar-menu-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menuId = btn.dataset.menu;
      if (openBtn === btn) { close(); return; }
      openMenu(btn, menuId);
    });
    // Hover-switch: if a menu is already open, hovering over a sibling switches.
    btn.addEventListener('mouseenter', () => {
      if (openBtn && openBtn !== btn) openMenu(btn, btn.dataset.menu);
    });
  });

  document.addEventListener('click', () => close());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

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

  // Necklace orbit
  animateNecklace(dt, totalTime);

  // Particles
  animateParticles(dt, totalTime);

  // Camera shake (applied as a tiny offset before render; restored after)
  let camShakeOffset = null;
  if (state.cameraShakeOn) {
    camShakeOffset = camera.position.clone();
    const a = state.cameraShakeAmount * 0.05;
    camera.position.x += (Math.random() - 0.5) * a;
    camera.position.y += (Math.random() - 0.5) * a;
    camera.position.z += (Math.random() - 0.5) * a;
  }

  // Update grain shader time uniform so noise actually moves
  if (grainPass) grainPass.uniforms.time.value = totalTime;

  controls.update();

  // ── LIVE TEXT REFLECTIONS ─────────────────────────────────────────────
  // Update the cube-render-target every Nth frame so the text reflects the
  // currently-spinning chain / decorations / floor in real time. Because the
  // text would otherwise be IN its own reflection, we hide it for that pass.
  if (state.textLiveReflections) {
    _reflectionFrame++;
    const every = Math.max(1, state.textLiveReflectionEvery | 0);
    if (_reflectionFrame % every === 0) {
      const wasVisible = textGroup.visible;
      textGroup.visible = false;
      // Position the cube cam at the text's centre (after the animation has
      // moved/scaled the group, so reflections track the text's transform).
      reflectionCubeCamera.position.set(0, 0, 0);
      // Use the text group's world position as the reflection origin.
      const wp = new THREE.Vector3();
      textGroup.getWorldPosition(wp);
      reflectionCubeCamera.position.copy(wp);
      reflectionCubeCamera.update(renderer, scene);
      textGroup.visible = wasVisible;
      // Inject the live cube map as the PBR material's envMap. envMapIntensity
      // controls how strongly the reflection blends with HDRI lighting.
      if (pbrMaterial.envMap !== reflectionRT.texture) {
        pbrMaterial.envMap = reflectionRT.texture;
        pbrMaterial.needsUpdate = true;
      }
      pbrMaterial.envMapIntensity = state.envIntensity * 1.25 * state.textLiveReflectionStrength;
    }
  } else {
    // Restore HDRI-only reflections when the toggle is off.
    if (pbrMaterial.envMap !== null) {
      pbrMaterial.envMap = null;
      pbrMaterial.needsUpdate = true;
      pbrMaterial.envMapIntensity = state.envIntensity * 1.25;
    }
  }

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

  // Restore camera offset from shake so OrbitControls keeps working cleanly.
  if (camShakeOffset) camera.position.copy(camShakeOffset);

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
  buildLeftRail();
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
  rebuildParticles();
  rebuildReflectiveFloor();
  rebuildNecklace();
  updateHud();
  loadingOverlay.style.display = 'none';
  animate();
}

init().catch((e) => {
  console.error(e);
  loadingOverlay.innerHTML = `<div class="text-red-400 text-sm font-mono p-4 text-center">Init failed: ${e.message}<br/>Open the browser console for details.</div>`;
});
