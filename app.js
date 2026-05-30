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
  innerBevel: false,
  innerBevelHeight: 0.08,
  innerBevelInset: 0.18,
  innerBevelSegments: 1,

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
  vignetteOn: false,
  vignetteIntensity: 0.5,

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

// PMREM for HDRI
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

// ============ POST-PROCESSING ============
let composer = null;
let bloomPass = null;
let vignettePass = null;
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

function ensureComposer() {
  if (composer) return composer;
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), state.bloomStrength, state.bloomRadius, state.bloomThreshold);
  bloomPass.enabled = state.bloomOn;
  composer.addPass(bloomPass);
  vignettePass = new ShaderPass(VignetteShader);
  vignettePass.uniforms.intensity.value = state.vignetteIntensity;
  vignettePass.enabled = state.vignetteOn;
  composer.addPass(vignettePass);
  composer.addPass(new OutputPass());
  return composer;
}

function postEnabled() { return state.bloomOn || state.vignetteOn; }

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

function updateText() {
  if (!currentFont) return;

  // Dispose previous
  while (textGroup.children.length) {
    const c = textGroup.children.pop();
    if (c.geometry) c.geometry.dispose();
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

    // Inner bevel (chiseled cap)
    if (state.innerBevel && state.innerBevelHeight > 0 && state.innerBevelInset > 0) {
      const cap = new TextGeometry(state.text || ' ', {
        font: currentFont,
        size: state.size,
        depth: 0,
        curveSegments: state.curveSegments,
        bevelEnabled: true,
        bevelThickness: state.innerBevelHeight,
        bevelSize: state.innerBevelInset,
        bevelOffset: 0,
        bevelSegments: state.innerBevelSegments,
      });
      cap.computeBoundingBox();
      const cbb = cap.boundingBox;
      cap.translate(-(cbb.max.x + cbb.min.x) / 2, -(cbb.max.y + cbb.min.y) / 2, 0);
      cap.computeVertexNormals();
      const capMesh = new THREE.Mesh(cap, mat);
      capMesh.position.z = bb.max.z + dz;
      capMesh.castShadow = true; capMesh.receiveShadow = true;
      if (mirror) { capMesh.scale.x = mirror.x ? -1 : 1; capMesh.scale.y = mirror.y ? -1 : 1; }
      textGroup.add(capMesh);
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

// ============ MATERIAL UPDATE ============
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
    b.appendChild(makeToggle('Inner Bevel', 'innerBevel', 'Граненая поверхность (огранка / резьба)'));
    if (state.innerBevel) {
      b.appendChild(makeSlider('Ridge Height', 'innerBevelHeight', 0.005, 0.4, 0.005));
      b.appendChild(makeSlider('Ridge Inset', 'innerBevelInset', 0.005, 0.5, 0.005));
      b.appendChild(makeSlider('Sharpness', 'innerBevelSegments', 1, 8, 1, true));
      const chiselBtn = el('button', { class: 'btn-secondary', type: 'button' }, ['Chisel It (preset)']);
      chiselBtn.addEventListener('click', () => {
        pushUndo();
        Object.assign(state, { innerBevelHeight: 0.08, innerBevelInset: 0.18, innerBevelSegments: 1, bevelEnabled: false });
        buildPanel(); updateText();
      });
      b.appendChild(chiselBtn);
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

  // ========== POST-PROCESSING ==========
  panel.appendChild(makeSection('post', 'Post-Processing', '✶', (b) => {
    b.appendChild(makeToggle('Bloom', 'bloomOn', 'Glow effect on bright pixels'));
    if (state.bloomOn) {
      b.appendChild(makeSlider('Strength', 'bloomStrength', 0, 3, 0.05));
      b.appendChild(makeSlider('Threshold', 'bloomThreshold', 0, 1, 0.01));
      b.appendChild(makeSlider('Radius', 'bloomRadius', 0, 1.5, 0.05));
    }
    b.appendChild(el('div', { style: 'border-top: 1px solid rgba(54,58,69,0.15); padding-top: 4px' }));
    b.appendChild(makeToggle('Vignette', 'vignetteOn'));
    if (state.vignetteOn) {
      b.appendChild(makeSlider('Intensity', 'vignetteIntensity', 0, 1, 0.02));
    }
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
  'innerBevel', 'innerBevelHeight', 'innerBevelInset', 'innerBevelSegments',
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
    const rebuild = ['bevelEnabled', 'innerBevel', 'shadingMode', 'outlineOn'].includes(key);
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

  if (['bloomOn', 'bloomStrength', 'bloomThreshold', 'bloomRadius', 'vignetteOn', 'vignetteIntensity'].includes(key)) {
    updatePostProcessing();
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
  if (vignettePass) {
    vignettePass.enabled = state.vignetteOn;
    vignettePass.uniforms.intensity.value = state.vignetteIntensity;
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
let fpsCounter = { last: performance.now(), frames: 0, fps: 0 };

function animate() {
  requestAnimationFrame(animate);
  resize();
  const dt = clock.getDelta();
  const mode = ANIMATIONS.find((a) => a.id === state.animationMode);
  if (mode && mode.apply) {
    animTime += dt * state.animationSpeed;
    mode.apply(textGroup, animTime);
  }
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
  updateHud();
  loadingOverlay.style.display = 'none';
  animate();
}

init().catch((e) => {
  console.error(e);
  loadingOverlay.innerHTML = `<div class="text-red-400 text-sm font-mono p-4 text-center">Init failed: ${e.message}<br/>Open the browser console for details.</div>`;
});
