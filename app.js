// ============================================================
// 3D Text Studio — vanilla three.js + plain DOM. No build step.
// ============================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

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
  { name: 'Matte Clay',     swatch: '#d6c8b8', vals: { color:'#d6c8b8', roughness:0.85, metalness:0.0, clearcoat:0.0, clearcoatRoughness:0.5,  reflectivity:0.20 } },
  { name: 'Glossy Plastic', swatch: '#e74c3c', vals: { color:'#e74c3c', roughness:0.25, metalness:0.0, clearcoat:1.0, clearcoatRoughness:0.05, reflectivity:0.55 } },
  { name: 'Polished Metal', swatch: '#c8c8c8', vals: { color:'#c8c8c8', roughness:0.12, metalness:1.0, clearcoat:0.4, clearcoatRoughness:0.10, reflectivity:1.00 } },
  { name: 'Liquid Gold',    swatch: '#ffb740', vals: { color:'#ffb740', roughness:0.18, metalness:1.0, clearcoat:0.6, clearcoatRoughness:0.08, reflectivity:1.00 } },
  { name: 'Soft Velvet',    swatch: '#6e3bb3', vals: { color:'#6e3bb3', roughness:0.95, metalness:0.0, clearcoat:0.0, clearcoatRoughness:0.5,  reflectivity:0.15 } },
  { name: 'Glass Candy',    swatch: '#7dd3fc', vals: { color:'#7dd3fc', roughness:0.05, metalness:0.0, clearcoat:1.0, clearcoatRoughness:0.02, reflectivity:0.90 } },
];

const BG_PRESETS = ['#0a0a0d', '#0e1014', '#1a1f2e', '#2c1b3a', '#f4f4f5', '#e8e6e3', '#5b21b6', '#0ea5e9'];

// Animation presets. Each defines how to transform the text group per frame.
// `t` is elapsed time × state.animationSpeed; `g` is the text group.
const ANIMATIONS = [
  { id: 'none',     name: 'None',           apply: null },
  { id: 'spinY',    name: 'Spin Y',         apply: (g, t) => { g.rotation.y =  t; } },
  { id: 'spinYRev', name: 'Spin Y Reverse', apply: (g, t) => { g.rotation.y = -t; } },
  { id: 'spinX',    name: 'Spin X',         apply: (g, t) => { g.rotation.x =  t * 0.8; } },
  { id: 'spinZ',    name: 'Spin Z',         apply: (g, t) => { g.rotation.z =  t * 0.6; } },
  { id: 'tumble',   name: 'Tumble (XYZ)',   apply: (g, t) => {
      g.rotation.x = t * 0.7;
      g.rotation.y = t;
      g.rotation.z = t * 0.4;
  } },
  { id: 'wobble',   name: 'Wobble',         apply: (g, t) => {
      g.rotation.x = Math.sin(t * 1.4) * 0.28;
      g.rotation.z = Math.cos(t * 1.0) * 0.20;
      g.rotation.y = Math.sin(t * 0.6) * 0.45;
  } },
  { id: 'pendulum', name: 'Pendulum',       apply: (g, t) => {
      g.rotation.y = Math.sin(t * 1.6) * 0.9;
  } },
  { id: 'float',    name: 'Float',          apply: (g, t) => {
      g.position.y = Math.sin(t * 1.5) * 0.18;
      g.rotation.y = Math.sin(t * 0.6) * 0.30;
      g.rotation.z = Math.sin(t * 1.2) * 0.06;
  } },
  { id: 'figure8',  name: 'Figure 8',       apply: (g, t) => {
      g.rotation.y = Math.sin(t)        * 0.7;
      g.rotation.x = Math.sin(t * 2)    * 0.35;
  } },
  { id: 'shimmy',   name: 'Shimmy',         apply: (g, t) => {
      g.rotation.z = Math.sin(t * 6)    * 0.08;
      g.position.x = Math.sin(t * 6)    * 0.05;
  } },
  { id: 'orbit',    name: 'Orbit Camera',   apply: null /* handled by OrbitControls.autoRotate */ },
];

// ============ STATE ============
const state = {
  text: 'Kiro',
  fontId: 'helvetiker-bold',
  customFont: null,
  customFontName: null,
  size: 1,
  depth: 0.4,
  curveSegments: 12,
  bevelEnabled: true,
  bevelThickness: 0.04,
  bevelSize: 0.02,
  bevelOffset: 0,
  bevelSegments: 6,
  // Inner (chiseled) bevel: a separate raised ridge on the front face.
  innerBevel: false,
  innerBevelHeight: 0.06,
  innerBevelInset: 0.05,
  innerBevelSegments: 1, // 1 = sharp pyramid edge
  color: '#e8e6e3',
  roughness: 0.25,
  metalness: 0.4,
  clearcoat: 0.6,
  clearcoatRoughness: 0.15,
  reflectivity: 0.6,
  background: '#0e1014',
  envPreset: 'studio',
  envIntensity: 0.9,
  showShadows: true,
  animationMode: 'none',
  animationSpeed: 1.0,
};

// ============ SCENE SETUP ============
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true, // needed for PNG export
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(state.background);

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 1.2, 6);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2;
controls.maxDistance = 24;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.18));

const dirLight = new THREE.DirectionalLight(0xffffff, 0.55);
dirLight.position.set(6, 8, 6);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.bias = -0.0005;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 30;
dirLight.shadow.camera.left = -6;
dirLight.shadow.camera.right = 6;
dirLight.shadow.camera.top = 6;
dirLight.shadow.camera.bottom = -6;
scene.add(dirLight);

// Shadow-only ground plane
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.ShadowMaterial({ opacity: 0.4 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.15;
ground.receiveShadow = true;
scene.add(ground);

// Material (single shared instance)
const material = new THREE.MeshPhysicalMaterial({
  color: state.color,
  roughness: state.roughness,
  metalness: state.metalness,
  clearcoat: state.clearcoat,
  clearcoatRoughness: state.clearcoatRoughness,
  reflectivity: state.reflectivity,
  envMapIntensity: state.envIntensity * 1.25,
});

// Text mesh group
const textGroup = new THREE.Group();
scene.add(textGroup);
let textMesh = null;

// PMREM for HDRI
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

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
    try {
      currentFont = await loadFontUrl(f.url);
    } catch (e) {
      console.error('Font load failed:', e);
      return;
    }
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
    // TTFLoader pulls in opentype.js (declared in the importmap).
    const { TTFLoader } = await import('three/addons/loaders/TTFLoader.js');
    const json = new TTFLoader().parse(buffer);
    return new FontLoader().parse(json);
  }
  throw new Error(`Unsupported format: .${ext}`);
}

// ============ TEXT MESH ============
function updateText() {
  if (!currentFont) return;

  // Dispose all previous text-related meshes (body + optional inner-bevel cap).
  while (textGroup.children.length) {
    const c = textGroup.children.pop();
    if (c.geometry) c.geometry.dispose();
  }
  textMesh = null;

  const safeText = state.text && state.text.length > 0 ? state.text : ' ';

  // 1) MAIN BODY
  const body = new TextGeometry(safeText, {
    font: currentFont,
    size: state.size,
    depth: state.depth,
    curveSegments: state.curveSegments,
    bevelEnabled: state.bevelEnabled,
    bevelThickness: state.bevelEnabled ? state.bevelThickness : 0,
    bevelSize: state.bevelEnabled ? state.bevelSize : 0,
    bevelOffset: state.bevelEnabled ? state.bevelOffset : 0,
    bevelSegments: state.bevelSegments,
  });
  body.computeBoundingBox();
  body.computeVertexNormals();
  const bb = body.boundingBox;
  const dx = -(bb.max.x + bb.min.x) / 2;
  const dy = -(bb.max.y + bb.min.y) / 2;
  const dz = -(bb.max.z + bb.min.z) / 2;
  body.translate(dx, dy, dz);
  textMesh = new THREE.Mesh(body, material);
  textMesh.castShadow = true;
  textMesh.receiveShadow = true;
  textGroup.add(textMesh);

  // 2) INNER BEVEL CAP (chiseled ridge on the front face)
  // Trick: a TextGeometry with depth=0 + bevelEnabled produces a "double pyramid"
  // along the letter outline (full outline at z=0, narrowing to the inset outline
  // at z=±height). Place its z=0 plane on the body's front face — the back half
  // is hidden inside the body and the front half forms a sharp inner ridge.
  if (state.innerBevel && state.innerBevelHeight > 0 && state.innerBevelInset > 0) {
    const cap = new TextGeometry(safeText, {
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
    // Align cap's X/Y with the body's centering (Z is naturally centered).
    cap.translate(
      -(cbb.max.x + cbb.min.x) / 2,
      -(cbb.max.y + cbb.min.y) / 2,
      0
    );
    cap.computeVertexNormals();
    const capMesh = new THREE.Mesh(cap, material);
    // Body's front face after centering is at bb.max.z + dz.
    capMesh.position.z = bb.max.z + dz;
    capMesh.castShadow = true;
    capMesh.receiveShadow = true;
    textGroup.add(capMesh);
  }
}

// ============ HDRI LOADING ============
let hdriLoadingId = 0;
async function loadHDRI(presetId) {
  const preset = HDRI_PRESETS.find((p) => p.id === presetId);
  if (!preset) return;
  const myId = ++hdriLoadingId;
  if (!preset.url) {
    const envScene = new RoomEnvironment();
    const envTex = pmrem.fromScene(envScene, 0.04).texture;
    if (myId === hdriLoadingId) scene.environment = envTex;
    return;
  }
  return new Promise((resolve) => {
    new RGBELoader().load(
      preset.url,
      (tex) => {
        const envTex = pmrem.fromEquirectangular(tex).texture;
        if (myId === hdriLoadingId) scene.environment = envTex;
        tex.dispose();
        resolve();
      },
      undefined,
      (err) => {
        console.warn('HDRI load failed, using neutral room:', err);
        const envScene = new RoomEnvironment();
        const envTex = pmrem.fromScene(envScene, 0.04).texture;
        if (myId === hdriLoadingId) scene.environment = envTex;
        resolve();
      }
    );
  });
}

// ============ UI BUILDER ============
const panel = document.getElementById('panel');

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

function makeSection(id, title, icon, build) {
  const sec = el('div', { class: 'section', id: 'sec-' + id });
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
  sel.addEventListener('change', (e) => { state[key] = e.target.value; handleChange(key); });
  wrap.appendChild(sel);
  return wrap;
}

function makeColor(label, key) {
  const wrap = el('div', { class: 'row' });
  wrap.appendChild(el('span', { class: 'row-label' }, [label]));
  const box = el('div', { class: 'color-box' });
  const color = el('input', { type: 'color' }); color.value = state[key];
  const text = el('input', { type: 'text', spellcheck: 'false' }); text.value = state[key].toUpperCase();
  const apply = (v) => {
    if (!/^#([0-9a-f]{6})$/i.test(v)) return;
    state[key] = v;
    color.value = v;
    text.value = v.toUpperCase();
    handleChange(key);
  };
  color.addEventListener('input', (e) => apply(e.target.value));
  text.addEventListener('input', (e) => apply(e.target.value));
  text.addEventListener('blur', () => { text.value = state[key].toUpperCase(); });
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
    state[key] = !state[key];
    tog.classList.toggle('on', state[key]);
    handleChange(key);
  });
  wrap.appendChild(left);
  wrap.appendChild(tog);
  return wrap;
}

function buildPanel() {
  panel.innerHTML = '';

  // ========== TEXT ==========
  panel.appendChild(makeSection('text', 'Text', 'T', (b) => {
    const ta = el('textarea', { class: 'input-base', rows: 3, placeholder: 'Type to sculpt…', spellcheck: 'false' });
    ta.value = state.text;
    const charCounter = el('span', { class: 'font-mono' }, [state.text.length + ' chars']);
    ta.addEventListener('input', (e) => {
      state.text = e.target.value;
      charCounter.textContent = state.text.length + ' chars';
      handleChange('text');
    });
    b.appendChild(ta);
    b.appendChild(el('div', { class: 'flex items-center justify-between text-[10px] text-ink-200' }, [
      charCounter,
      el('span', { class: 'flex items-center gap-1' }, [
        el('span', { class: 'w-1 h-1 rounded-full bg-emerald-400' }),
        ' Live update',
      ]),
    ]));
  }));

  // ========== TYPOGRAPHY ==========
  panel.appendChild(makeSection('typography', 'Typography', '¶', (b) => {
    const fontOpts = DEFAULT_FONTS.map((f) => ({ value: f.id, label: f.name }));
    if (state.customFontName) fontOpts.push({ value: 'custom', label: state.customFontName + ' (Custom)' });
    b.appendChild(makeSelect('Font', 'fontId', fontOpts));

    // Upload
    const wrap = el('div', { class: 'flex flex-col gap-1.5' });
    wrap.appendChild(el('span', { class: 'row-label' }, ['Custom Font']));
    const btn = el('button', { class: 'upload-btn', type: 'button' });
    btn.innerHTML = `<span>⬆</span><span class="upload-label">${state.customFontName || 'Click to upload font'}</span>`;
    const file = el('input', { type: 'file', accept: '.ttf,.otf,.json', style: 'display:none' });
    btn.addEventListener('click', () => file.click());
    file.addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      file.value = '';
      if (!f) return;
      btn.querySelector('.upload-label').textContent = 'Loading…';
      const errBox = wrap.querySelector('.error-msg');
      if (errBox) errBox.remove();
      try {
        const font = await loadFontFromFile(f);
        state.customFont = font;
        state.customFontName = f.name;
        state.fontId = 'custom';
        buildPanel();
        await setActiveFont();
        updateHud();
      } catch (err) {
        btn.querySelector('.upload-label').textContent = state.customFontName || 'Click to upload font';
        wrap.appendChild(el('p', { class: 'error-msg' }, [err.message || 'Failed to load font']));
      }
    });
    wrap.appendChild(btn);
    wrap.appendChild(file);
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
    b.appendChild(makeToggle('Inner Bevel', 'innerBevel', 'Sharp chiseled ridge on the front face'));
    if (state.innerBevel) {
      b.appendChild(makeSlider('Ridge Height', 'innerBevelHeight', 0.005, 0.25, 0.005));
      b.appendChild(makeSlider('Ridge Inset', 'innerBevelInset', 0.005, 0.15, 0.005));
      b.appendChild(makeSlider('Sharpness', 'innerBevelSegments', 1, 8, 1, true));
      b.appendChild(el('p', { class: 'hint' }, ['Sharpness = 1 → острый гребень. Больше = округлый.']));
    }
  }));

  // ========== MATERIAL ==========
  panel.appendChild(makeSection('material', 'Material', '✦', (b) => {
    b.appendChild(makeColor('Color', 'color'));
    b.appendChild(makeSlider('Roughness', 'roughness', 0, 1, 0.01));
    b.appendChild(makeSlider('Metalness', 'metalness', 0, 1, 0.01));
    b.appendChild(makeSlider('Clearcoat', 'clearcoat', 0, 1, 0.01));
    b.appendChild(makeSlider('Clearcoat Rough.', 'clearcoatRoughness', 0, 1, 0.01));
    b.appendChild(makeSlider('Reflectivity', 'reflectivity', 0, 1, 0.01));

    const presets = el('div', { class: 'flex flex-col gap-2 pt-2', style: 'border-top: 1px solid rgba(54,58,69,0.15)' });
    presets.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider' }, ['Material Presets']));
    const grid = el('div', { class: 'preset-grid' });
    MATERIAL_PRESETS.forEach((p) => {
      const btn = el('button', { class: 'preset-btn', type: 'button' });
      btn.innerHTML = `<span class="preset-swatch" style="background:${p.swatch}"></span><span class="truncate">${p.name}</span>`;
      btn.addEventListener('click', () => {
        Object.assign(state, p.vals);
        buildPanel();
        handleChange('color');
      });
      grid.appendChild(btn);
    });
    presets.appendChild(grid);
    b.appendChild(presets);
  }));

  // ========== ENVIRONMENT ==========
  panel.appendChild(makeSection('environment', 'Environment', '◯', (b) => {
    b.appendChild(makeColor('Background', 'background'));

    const swatchRow = el('div', { class: 'bg-swatch-row' });
    BG_PRESETS.forEach((c) => {
      const sw = el('button', { class: 'bg-swatch' + (state.background.toLowerCase() === c.toLowerCase() ? ' active' : ''), type: 'button' });
      sw.style.background = c;
      sw.addEventListener('click', () => { state.background = c; buildPanel(); handleChange('background'); });
      swatchRow.appendChild(sw);
    });
    b.appendChild(swatchRow);

    b.appendChild(makeSelect('HDRI', 'envPreset', HDRI_PRESETS.map((p) => ({ value: p.id, label: p.name }))));
    b.appendChild(makeSlider('Env Intensity', 'envIntensity', 0, 3, 0.05));
    b.appendChild(makeToggle('Ground Shadow', 'showShadows', 'Soft shadow under text'));
  }));

  // ========== ANIMATION ==========
  panel.appendChild(makeSection('animation', 'Animation', '↻', (b) => {
    b.appendChild(makeSelect(
      'Mode',
      'animationMode',
      ANIMATIONS.map((a) => ({ value: a.id, label: a.name }))
    ));
    if (state.animationMode !== 'none') {
      b.appendChild(makeSlider('Speed', 'animationSpeed', 0.05, 5, 0.05));
    }

    // Quick-pick grid of animation chips.
    const grid = el('div', { class: 'preset-grid', style: 'grid-template-columns: 1fr 1fr 1fr;' });
    ANIMATIONS.forEach((a) => {
      const btn = el('button', { class: 'preset-btn', type: 'button', style: 'justify-content:center; padding:6px 4px;' });
      btn.style.background = state.animationMode === a.id ? 'rgba(99,102,241,0.18)' : '';
      btn.style.color = state.animationMode === a.id ? '#a5a7f5' : '';
      btn.textContent = a.name;
      btn.addEventListener('click', () => {
        state.animationMode = a.id;
        buildPanel();
        handleChange('animationMode');
      });
      grid.appendChild(btn);
    });
    b.appendChild(el('span', { class: 'text-[10px] text-ink-200 uppercase tracking-wider pt-2' }, ['Quick pick']));
    b.appendChild(grid);
  }));

  // ========== EXPORT ==========
  panel.appendChild(makeSection('export', 'Export & Reset', '⤓', (b) => {
    b.appendChild(el('p', { class: 'hint' }, ['Capture the current viewport as a PNG image (DPR-aware).']));
    const exp = el('button', { class: 'btn-primary', type: 'button' }, ['📷 Export PNG']);
    exp.addEventListener('click', exportPNG);
    b.appendChild(exp);
    const rst = el('button', { class: 'btn-secondary', type: 'button' }, ['⟲ Reset All']);
    rst.addEventListener('click', resetAll);
    b.appendChild(rst);
  }));
}

// ============ STATE CHANGE DISPATCH ============
const GEOMETRY_KEYS = new Set(['text', 'size', 'depth', 'curveSegments', 'bevelEnabled', 'bevelThickness', 'bevelSize', 'bevelOffset', 'bevelSegments', 'innerBevel', 'innerBevelHeight', 'innerBevelInset', 'innerBevelSegments']);
const MATERIAL_KEYS = new Set(['color', 'roughness', 'metalness', 'clearcoat', 'clearcoatRoughness', 'reflectivity']);

function handleChange(key) {
  if (key === 'fontId') {
    setActiveFont().then(updateHud);
    return;
  }
  if (GEOMETRY_KEYS.has(key)) {
    if (key === 'bevelEnabled' || key === 'innerBevel') buildPanel(); // show/hide sub-sliders
    updateText();
  }
  if (MATERIAL_KEYS.has(key)) {
    material.color.set(state.color);
    material.roughness = state.roughness;
    material.metalness = state.metalness;
    material.clearcoat = state.clearcoat;
    material.clearcoatRoughness = state.clearcoatRoughness;
    material.reflectivity = state.reflectivity;
    material.needsUpdate = true;
  }
  if (key === 'background') scene.background = new THREE.Color(state.background);
  if (key === 'envPreset') { loadHDRI(state.envPreset); updateHud(); }
  if (key === 'envIntensity') material.envMapIntensity = state.envIntensity * 1.25;
  if (key === 'showShadows') ground.visible = state.showShadows;
  if (key === 'animationMode' || key === 'animationSpeed') {
    applyAnimationMode();
  }
  if (key === 'text') updateHud();
}

// ============ HUD ============
function updateHud() {
  const fontLabel =
    state.fontId === 'custom'
      ? state.customFontName || 'Custom'
      : (DEFAULT_FONTS.find((f) => f.id === state.fontId) || {}).name || state.fontId;
  document.getElementById('hudFont').textContent = fontLabel;
  const env = HDRI_PRESETS.find((p) => p.id === state.envPreset);
  document.getElementById('hudEnv').textContent = 'HDRI: ' + (env ? env.name : state.envPreset);
  const t = state.text || ' ';
  document.getElementById('hudText').textContent = '"' + (t.length > 24 ? t.slice(0, 24) + '…' : t) + '"';
}

// ============ TOPBAR + VIEWPORT BUTTONS ============
function exportPNG() {
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  const a = document.createElement('a');
  a.download = `3d-text-${Date.now()}.png`;
  a.href = url;
  a.click();
}

function frameCamera() {
  camera.position.set(0, 1.2, 6);
  controls.target.set(0, 0, 0);
  controls.update();
}

// Reset transform of the text group (animation modes manipulate it directly).
function resetTextTransform() {
  textGroup.rotation.set(0, 0, 0);
  textGroup.position.set(0, 0, 0);
}

function applyAnimationMode() {
  const mode = ANIMATIONS.find((a) => a.id === state.animationMode);
  // Orbit Camera = OrbitControls.autoRotate; everything else is a per-frame group transform.
  controls.autoRotate = (mode && mode.id === 'orbit');
  controls.autoRotateSpeed = state.animationSpeed * 2;
  resetTextTransform();
  // Update HUD pill
  const pill = document.getElementById('autoRotateBtn');
  pill.classList.toggle('active', state.animationMode !== 'none');
  pill.querySelector('.anim-label').textContent =
    state.animationMode === 'none' ? 'Animate' : (mode ? mode.name : '—');
}

function resetAll() {
  // Reset state to defaults (preserve custom uploaded font reference)
  Object.assign(state, {
    text: 'Kiro',
    fontId: state.customFont ? state.fontId : 'helvetiker-bold',
    size: 1, depth: 0.4, curveSegments: 12,
    bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.02, bevelOffset: 0, bevelSegments: 6,
    innerBevel: false, innerBevelHeight: 0.06, innerBevelInset: 0.05, innerBevelSegments: 1,
    color: '#e8e6e3', roughness: 0.25, metalness: 0.4,
    clearcoat: 0.6, clearcoatRoughness: 0.15, reflectivity: 0.6,
    background: '#0e1014', envPreset: 'studio', envIntensity: 0.9, showShadows: true,
    animationMode: 'none', animationSpeed: 1.0,
  });
  frameCamera();
  resetTextTransform();
  controls.autoRotate = false;
  document.getElementById('autoRotateBtn').classList.remove('active');
  scene.background = new THREE.Color(state.background);
  material.color.set(state.color);
  material.roughness = state.roughness;
  material.metalness = state.metalness;
  material.clearcoat = state.clearcoat;
  material.clearcoatRoughness = state.clearcoatRoughness;
  material.reflectivity = state.reflectivity;
  material.envMapIntensity = state.envIntensity * 1.25;
  ground.visible = state.showShadows;
  buildPanel();
  loadHDRI(state.envPreset);
  setActiveFont().then(updateHud);
  applyAnimationMode();
}

document.getElementById('topExportBtn').addEventListener('click', exportPNG);
document.getElementById('topResetBtn').addEventListener('click', frameCamera);
document.getElementById('frameBtn').addEventListener('click', frameCamera);
// Bottom-left pill cycles through animation modes (None → Spin Y → Reverse → ... → Orbit → None).
document.getElementById('autoRotateBtn').addEventListener('click', () => {
  const ids = ANIMATIONS.map((a) => a.id);
  const i = ids.indexOf(state.animationMode);
  state.animationMode = ids[(i + 1) % ids.length];
  buildPanel();
  applyAnimationMode();
});

// ============ RESIZE ============
function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

// ============ ANIMATION LOOP ============
const clock = new THREE.Clock();
let animTime = 0;

function animate() {
  requestAnimationFrame(animate);
  resize();
  const dt = clock.getDelta();
  // Drive the active animation preset (Orbit Camera is handled by OrbitControls).
  const mode = ANIMATIONS.find((a) => a.id === state.animationMode);
  if (mode && mode.apply) {
    animTime += dt * state.animationSpeed;
    mode.apply(textGroup, animTime);
  }
  controls.update();
  renderer.render(scene, camera);
}

// ============ INIT ============
async function init() {
  buildPanel();
  applyAnimationMode();
  await loadHDRI(state.envPreset);
  await setActiveFont();
  updateHud();
  document.getElementById('loadingOverlay').style.display = 'none';
  animate();
}

init().catch((e) => {
  console.error(e);
  const ov = document.getElementById('loadingOverlay');
  ov.innerHTML = `<div class="text-red-400 text-sm font-mono p-4 text-center">Init failed: ${e.message}<br/>Open the browser console for details.</div>`;
});
