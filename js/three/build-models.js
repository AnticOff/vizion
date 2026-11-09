// Procedural models of the library, built from three.js primitives (no external files).
// Every builder fills a Group with meshes tagged by material slot (see materials.js).
// buildModel() centres the result, scales it to a 1.8-unit bounding box and stores its stats.

import * as THREE from 'three';

const V2 = (x, y) => new THREE.Vector2(x, y);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lathe = (points, segments = 64) => new THREE.LatheGeometry(points.map(([x, y]) => V2(x, y)), segments);
const TAU = Math.PI * 2;

function part(group, geometry, slot, setup) {
  const mesh = new THREE.Mesh(geometry);
  mesh.userData.slot = slot;
  if (setup) setup(mesh);
  group.add(mesh);
  return mesh;
}

// Places `count` copies around the Y axis at `radius`, height `y`.
function ring(count, radius, y, make, offset = 0) {
  for (let i = 0; i < count; i++) {
    const a = ((i + offset) / count) * TAU;
    make(Math.cos(a) * radius, y, Math.sin(a) * radius, a);
  }
}

const BUILDERS = {
  tour(g) {
    part(g, lathe([[0, 0], [0.62, 0], [0.62, 0.08], [0.52, 0.14], [0.5, 0.2], [0.42, 0.26], [0.34, 0.34],
      [0.3, 0.9], [0.4, 0.98], [0.44, 1.06], [0.44, 1.3], [0.36, 1.3], [0.36, 1.2], [0, 1.2]]), 'primary');
    ring(6, 0.4, 1.38, (x, y, z, a) => part(g, new THREE.BoxGeometry(0.2, 0.16, 0.1), 'primary', (m) => {
      m.position.set(x, y, z);
      m.rotation.y = Math.PI / 2 - a; // long side along the rim
    }));
  },

  pion(g) {
    part(g, lathe([[0, 0], [0.55, 0], [0.55, 0.08], [0.45, 0.14], [0.42, 0.2], [0.3, 0.3], [0.2, 0.62],
      [0.32, 0.68], [0.32, 0.74], [0.18, 0.8], [0, 0.8]]), 'primary');
    part(g, new THREE.SphereGeometry(0.27, 48, 24), 'primary', (m) => m.position.set(0, 1.02, 0));
  },

  reine(g) {
    part(g, lathe([[0, 0], [0.6, 0], [0.6, 0.08], [0.48, 0.15], [0.45, 0.22], [0.32, 0.32], [0.2, 0.98],
      [0.36, 1.04], [0.36, 1.1], [0.22, 1.15], [0.36, 1.4], [0.3, 1.42], [0, 1.36]]), 'primary');
    ring(9, 0.33, 1.44, (x, y, z) => part(g, new THREE.SphereGeometry(0.05, 16, 12), 'primary', (m) => m.position.set(x, y, z)));
    part(g, new THREE.SphereGeometry(0.1, 32, 16), 'accent', (m) => m.position.set(0, 1.53, 0));
  },

  couronne(g) {
    part(g, lathe([[0.66, 0], [0.72, 0], [0.72, 0.36], [0.66, 0.36], [0.66, 0]], 96), 'primary');
    [0, 0.36].forEach((y) => part(g, new THREE.TorusGeometry(0.72, 0.035, 12, 96), 'primary', (m) => {
      m.rotation.x = Math.PI / 2;
      m.position.y = y;
    }));
    ring(8, 0.69, 0.57, (x, y, z) => part(g, new THREE.ConeGeometry(0.11, 0.42, 4), 'primary', (m) => m.position.set(x, y, z)));
    ring(8, 0.69, 0.81, (x, y, z) => part(g, new THREE.SphereGeometry(0.045, 16, 12), 'primary', (m) => m.position.set(x, y, z)));
    ring(8, 0.735, 0.18, (x, y, z) => part(g, new THREE.OctahedronGeometry(0.07), 'accent', (m) => m.position.set(x, y, z)), 0.5);
  },

  calice(g) {
    part(g, lathe([[0, 0], [0.48, 0], [0.48, 0.05], [0.3, 0.1], [0.1, 0.2], [0.07, 0.52], [0.13, 0.58],
      [0.13, 0.62], [0.07, 0.68], [0.1, 0.76], [0.36, 0.88], [0.47, 1.1], [0.5, 1.32], [0.46, 1.32],
      [0.43, 1.12], [0.33, 0.92], [0, 0.84]]), 'primary');
    ring(4, 0.15, 0.6, (x, y, z) => part(g, new THREE.OctahedronGeometry(0.05), 'accent', (m) => m.position.set(x, y, z)));
  },

  anneau(g) {
    part(g, new THREE.TorusGeometry(0.55, 0.08, 32, 128), 'primary');
    part(g, new THREE.CylinderGeometry(0.1, 0.13, 0.12, 32), 'primary', (m) => m.position.set(0, 0.66, 0));
    part(g, new THREE.OctahedronGeometry(0.17), 'accent', (m) => {
      m.position.set(0, 0.86, 0);
      m.scale.set(1, 1.25, 1);
    });
  },

  oeil(g) {
    // eyeball, lids, iris and pupil, then the three rays of the logo
    part(g, new THREE.SphereGeometry(0.5, 64, 32), 'white', (m) => m.scale.set(1, 0.62, 0.42));
    const lid = (sign) => new THREE.TubeGeometry(
      new THREE.QuadraticBezierCurve3(V3(-0.62, 0, 0), V3(0, sign * 0.78, 0.18), V3(0.62, 0, 0)), 64, 0.04, 12, false);
    part(g, lid(1), 'primary');
    part(g, lid(-1), 'primary');
    part(g, new THREE.CylinderGeometry(0.2, 0.2, 0.05, 48), 'accent', (m) => {
      m.rotation.x = Math.PI / 2;
      m.position.z = 0.2;
    });
    part(g, new THREE.CylinderGeometry(0.08, 0.08, 0.06, 32), 'dark', (m) => {
      m.rotation.x = Math.PI / 2;
      m.position.z = 0.22;
    });
    [-0.28, 0, 0.28].forEach((x) => part(g, new THREE.CapsuleGeometry(0.03, 0.18, 4, 12), 'primary', (m) => {
      m.position.set(x, x === 0 ? 0.68 : 0.62, 0.05);
      m.rotation.z = -x * 0.9;
    }));
  },

  epee(g) {
    const blade = new THREE.Shape();
    blade.moveTo(0, 1.25);
    blade.lineTo(0.09, 1.05);
    blade.lineTo(0.08, 0);
    blade.lineTo(-0.08, 0);
    blade.lineTo(-0.09, 1.05);
    blade.closePath();
    const bladeGeo = new THREE.ExtrudeGeometry(blade, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 });
    bladeGeo.translate(0, 0, -0.015);
    part(g, bladeGeo, 'primary');
    part(g, new THREE.BoxGeometry(0.55, 0.07, 0.12), 'primary', (m) => m.position.set(0, -0.03, 0));
    part(g, new THREE.CylinderGeometry(0.045, 0.045, 0.42, 16), 'dark', (m) => m.position.set(0, -0.28, 0));
    part(g, new THREE.SphereGeometry(0.075, 24, 16), 'accent', (m) => m.position.set(0, -0.53, 0));
  },

  hache(g) {
    part(g, new THREE.CylinderGeometry(0.045, 0.06, 1.6, 16), 'dark');
    const head = new THREE.Shape();
    head.moveTo(-0.1, 0.12);
    head.lineTo(0.15, 0.1);
    head.lineTo(0.45, 0.32);
    head.quadraticCurveTo(0.6, 0, 0.45, -0.32);
    head.lineTo(0.15, -0.1);
    head.lineTo(-0.1, -0.12);
    head.closePath();
    const headGeo = new THREE.ExtrudeGeometry(head, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 16 });
    headGeo.translate(0, 0, -0.03);
    part(g, headGeo, 'primary', (m) => m.position.set(0, 0.6, 0));
  },

  bouclier(g) {
    part(g, lathe([[0, 0.16], [0.3, 0.13], [0.6, 0.06], [0.76, 0], [0.78, -0.04], [0.7, -0.05], [0, -0.03]], 96), 'primary', (m) => {
      m.rotation.x = Math.PI / 2; // dome faces the camera (+z)
    });
    part(g, new THREE.TorusGeometry(0.77, 0.04, 12, 96), 'primary');
    part(g, new THREE.SphereGeometry(0.15, 32, 16), 'accent', (m) => m.position.set(0, 0, 0.14));
  },

  cristal(g) {
    part(g, new THREE.OctahedronGeometry(0.5), 'primary', (m) => m.scale.set(0.55, 1.5, 0.55));
    ring(4, 0.32, -0.4, (x, y, z, a) => part(g, new THREE.OctahedronGeometry(0.28), 'primary', (m) => {
      m.position.set(x, y, z);
      m.scale.set(0.5, 1.4, 0.5);
      m.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); // lean outwards
    }), 0.125);
  },

  noeud(g) {
    part(g, new THREE.TorusKnotGeometry(0.45, 0.14, 256, 32, 2, 3), 'primary');
  },

  monolithe(g) {
    [[0.8, 0.3, 0.15, 0], [0.6, 0.5, 0.55, 0.3], [0.45, 0.7, 1.15, 0.6]].forEach(([w, h, y, r]) =>
      part(g, new THREE.BoxGeometry(w, h, w), 'primary', (m) => {
        m.position.y = y;
        m.rotation.y = r;
      }));
    part(g, new THREE.BoxGeometry(0.22, 0.22, 0.22), 'accent', (m) => {
      m.position.y = 1.65;
      m.rotation.set(0.6, 0.9, 0);
    });
  },
};

export const MODEL_IDS = Object.keys(BUILDERS);

export function buildModel(id) {
  const build = BUILDERS[id];
  if (!build) throw new Error(`Unknown model: ${id}`);
  const inner = new THREE.Group();
  build(inner);

  const box = new THREE.Box3().setFromObject(inner);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  inner.position.copy(center).multiplyScalar(-1);

  const pivot = new THREE.Group();
  pivot.add(inner);
  pivot.scale.setScalar(1.8 / Math.max(size.x, size.y, size.z));
  pivot.userData.stats = countStats(inner);
  return pivot;
}

function countStats(root) {
  let triangles = 0, vertices = 0, parts = 0;
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    const geo = obj.geometry;
    parts += 1;
    vertices += geo.attributes.position.count;
    triangles += (geo.index ? geo.index.count : geo.attributes.position.count) / 3;
  });
  return { triangles: Math.round(triangles), vertices, parts };
}

// Frees the geometries; materials are shared and stay alive.
export function disposeModel(model) {
  model.traverse((obj) => { if (obj.isMesh) obj.geometry.dispose(); });
}
