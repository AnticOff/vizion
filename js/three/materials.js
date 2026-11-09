// Shared materials. Hex colours are sRGB; three.js converts them to linear itself.
// Slots: primary (switchable finish), accent (red lacquer), white (eye), dark (grips, pupil).

import * as THREE from 'three';

export function createMaterials() {
  const side = THREE.DoubleSide; // lathe cups and open rims show their inside
  return {
    chrome: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12, side }),
    rouge: new THREE.MeshPhysicalMaterial({ color: 0xff3030, metalness: 0, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08, side }),
    bordeaux: new THREE.MeshPhysicalMaterial({ color: 0x4a0606, metalness: 0.85, roughness: 0.34, side }),
    accent: new THREE.MeshPhysicalMaterial({ color: 0xff3030, metalness: 0, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.06, side }),
    white: new THREE.MeshPhysicalMaterial({ color: 0xfff1ef, metalness: 0, roughness: 0.35, clearcoat: 0.6, side }),
    dark: new THREE.MeshPhysicalMaterial({ color: 0x1c0000, metalness: 0.2, roughness: 0.55, side }),
  };
}

// Gives every mesh the material of its slot; `finish` is the primary material key.
export function applyFinish(model, materials, finish) {
  model.traverse((obj) => {
    if (!obj.isMesh) return;
    const slot = obj.userData.slot;
    obj.material = slot === 'primary' ? materials[finish] : materials[slot];
  });
}
