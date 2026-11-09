// 3D for the library page.
// - Grid: one WebGLRenderer and one canvas for every [data-view] stage; each view is drawn into
//   its element's rectangle with setViewport/setScissor (no per-card WebGL context).
// - Viewer: a second renderer inside the <dialog>, with OrbitControls; runs only while open.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { $, $$, play } from '../motion/env.js';
import { initSlidingPill } from '../motion/nav-pill.js';
import { MODELS, CATEGORIES } from '../data/models.js';
import { LANG, t } from '../i18n.js';
import { addModelToQuote } from '../quote-store.js';
import { buildModel, disposeModel } from './build-models.js';
import { createMaterials, applyFinish } from './materials.js';

const nf = new Intl.NumberFormat(LANG === 'fr' ? 'fr-FR' : 'en-GB');
const S = {
  en: { tris: 'triangles', added: (n) => `Added to your quote: ${n}.`, view: 'View my quote' },
  fr: { tris: 'triangles', added: (n) => `Ajouté à votre devis : ${n}.`, view: 'Voir mon devis' },
}[LANG];
const BASE_ANGLE = 0.6;   // resting yaw, radians
const SPIN = 0.45;        // rad/s
const SPIN_HOVER = 1.8;   // rad/s
const SWAY = 0.7;         // max yaw of swaying models, radians

function setupRenderer(renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);
}

function makeEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const texture = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  pmrem.dispose();
  return texture;
}

function makeStage(environment) {
  const scene = new THREE.Scene();
  scene.environment = environment;
  scene.environmentIntensity = 0.85;
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xff3030, 5);   // brand red on the edges
  rim.position.set(-4, 1.5, -3);
  const fill = new THREE.DirectionalLight(0xff6a5a, 1.2);
  fill.position.set(4, -1, 2);
  scene.add(key, rim, fill);
  return scene;
}

function makeCamera(distance = 4.6) {
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.45, distance);
  camera.lookAt(0, 0, 0);
  return camera;
}

// Narrow stages zoom out so the model keeps fitting horizontally.
function fitCamera(camera, width, height) {
  camera.aspect = width / height;
  camera.zoom = Math.min(1, camera.aspect * 1.15);
  camera.updateProjectionMatrix();
}

export function initLibraryScene({ reduced = false } = {}) {
  const canvas = $('.gl-canvas');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    document.documentElement.classList.add('no-webgl');
    return null;
  }
  setupRenderer(renderer);
  renderer.setScissorTest(true);

  const materials = createMaterials();
  const environment = makeEnvironment(renderer);

  // ---------- grid views ----------
  const views = $$('[data-view]').map((el) => {
    const scene = makeStage(environment);
    const model = buildModel(el.dataset.view);
    applyFinish(model, materials, el.dataset.finish || 'chrome');
    model.rotation.y = MODELS.find((m) => m.id === el.dataset.view)?.sway ? 0 : BASE_ANGLE;
    scene.add(model);
    const sway = Boolean(MODELS.find((m) => m.id === el.dataset.view)?.sway);
    const card = el.closest('.model-card') || el;
    const view = { el, card, scene, model, camera: makeCamera(), hover: false, sway, phase: 0 };
    card.addEventListener('pointerenter', () => { view.hover = true; });
    card.addEventListener('pointerleave', () => { view.hover = false; });
    return view;
  });

  // triangle counts are measured on the real geometry
  views.forEach(({ el, model }) => {
    const out = $(`[data-tris="${el.dataset.view}"]`);
    if (out) out.textContent = `${nf.format(model.userData.stats.triangles)} ${S.tris}`;
  });

  const resize = () => {
    canvas.style.height = `${innerHeight}px`;
    renderer.setSize(canvas.clientWidth, innerHeight, false);
  };
  addEventListener('resize', resize);
  resize();

  const timer = new THREE.Timer();
  timer.connect(document);

  function gridLoop() {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.1);
    canvas.style.transform = `translate3d(0, ${scrollY}px, 0)`; // canvas follows the viewport
    const width = canvas.clientWidth;
    const height = innerHeight;

    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);

    for (const view of views) {
      const r = view.el.getBoundingClientRect();
      if (r.width === 0 || r.bottom < 0 || r.top > height || r.right < 0 || r.left > width) continue;
      // the canvas ignores DOM opacity: wait until the card has faded in (intro, stagger, filters)
      if (parseFloat(getComputedStyle(view.card).opacity) < 0.5) continue;
      if (!reduced) {
        const speed = view.hover ? SPIN_HOVER : SPIN;
        if (view.sway) {
          view.phase += dt * speed;
          view.model.rotation.y = Math.sin(view.phase) * SWAY; // front-facing models never show their back
        } else {
          view.model.rotation.y += dt * speed;
        }
      }
      fitCamera(view.camera, r.width, r.height);
      const bottom = height - r.bottom;
      renderer.setViewport(r.left, bottom, r.width, r.height);
      renderer.setScissor(r.left, bottom, r.width, r.height);
      renderer.render(view.scene, view.camera);
    }
  }
  renderer.setAnimationLoop(gridLoop);

  // ---------- viewer ----------
  let viewer = null;

  function createViewer() {
    const dialog = $('[data-viewer]');
    const stage = $('.viewer-stage', dialog);
    const vr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    setupRenderer(vr);
    stage.prepend(vr.domElement);
    vr.domElement.setAttribute('aria-hidden', 'true');

    const scene = makeStage(makeEnvironment(vr));
    const camera = makeCamera(4.8);
    const controls = new OrbitControls(camera, vr.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 8;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 1.6;

    const vTimer = new THREE.Timer();
    vTimer.connect(document);

    const finishRoot = $('[data-finishes]', dialog);
    const finishButtons = $$('button[data-finish]', finishRoot);
    let finishPill = null;
    const toggle = $('[data-autorotate]', dialog);
    toggle.setAttribute('aria-pressed', String(controls.autoRotate));

    const state = { model: null, id: null };

    const size = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      vr.setSize(w, h, false);
      fitCamera(camera, w, h);
    };
    new ResizeObserver(size).observe(stage);

    const loop = () => {
      vTimer.update();
      controls.update(Math.min(vTimer.getDelta(), 0.1));
      vr.render(scene, camera);
    };

    const setFinish = (key) => {
      if (state.model) applyFinish(state.model, materials, key);
      finishButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.finish === key)));
      const active = finishButtons.find((b) => b.dataset.finish === key);
      if (finishPill && active) finishPill.setActive(active);
    };

    finishButtons.forEach((b) => b.addEventListener('click', () => setFinish(b.dataset.finish)));
    toggle.addEventListener('click', () => {
      controls.autoRotate = !controls.autoRotate;
      toggle.setAttribute('aria-pressed', String(controls.autoRotate));
    });
    $('[data-viewer-close]', dialog).addEventListener('click', () => dialog.close());

    // add the open model to the quote cart (stored in localStorage, read by the pricing page)
    const addStatus = $('[data-add-status]', dialog);
    $('[data-add-quote]', dialog).addEventListener('click', () => {
      if (!state.id) return;
      addModelToQuote(state.id);
      const name = t(MODELS.find((m) => m.id === state.id).name);
      addStatus.innerHTML = `${S.added(name)} <a href="${addStatus.dataset.quoteHref}">${S.view} ↗</a>`;
    });
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // backdrop
    dialog.addEventListener('close', () => {
      vr.setAnimationLoop(null);
      renderer.setAnimationLoop(gridLoop);
    });

    function open(id, finish) {
      const info = MODELS.find((m) => m.id === id);
      if (!info) return;
      if (state.model) {
        scene.remove(state.model);
        disposeModel(state.model);
      }
      state.model = buildModel(id);
      state.model.rotation.y = BASE_ANGLE;
      scene.add(state.model);
      state.id = id;

      if (info.sway) state.model.rotation.y = 0;
      // front-facing models: keep the camera in front of them
      controls.minAzimuthAngle = info.sway ? -1.1 : -Infinity;
      controls.maxAzimuthAngle = info.sway ? 1.1 : Infinity;
      controls.autoRotate = !reduced && !info.sway;
      toggle.setAttribute('aria-pressed', String(controls.autoRotate));
      camera.position.set(0, 0.45, 4.8);
      controls.target.set(0, 0, 0);
      controls.update();

      const stats = state.model.userData.stats;
      $('[data-viewer-title]', dialog).textContent = t(info.name);
      $('[data-viewer-cat]', dialog).textContent = t(CATEGORIES[info.category]);
      addStatus.textContent = '';
      $('[data-stat="triangles"]', dialog).textContent = nf.format(stats.triangles);
      $('[data-stat="vertices"]', dialog).textContent = nf.format(stats.vertices);
      $('[data-stat="parts"]', dialog).textContent = nf.format(stats.parts);

      renderer.setAnimationLoop(null); // pause the grid while the viewer is open
      dialog.showModal();
      if (!finishPill) finishPill = initSlidingPill(finishRoot, { items: 'button' });
      setFinish(finish || info.material);
      size();
      vTimer.update();
      vr.setAnimationLoop(loop);
      if (!reduced) {
        play(dialog, [{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 380 });
      }
    }

    return { open };
  }

  function openViewer(id, finish) {
    if (!viewer) viewer = createViewer();
    viewer.open(id, finish);
  }

  return { openViewer };
}
