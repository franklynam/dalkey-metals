'use client';

import { useTexture } from '@react-three/drei';
import { LinearFilter } from 'three';

/**
 * LiDAR terrain mesh.
 *
 * Scene scale:  200×200 units = 2000m×2000m  → 1 unit = 10 m
 *
 * Note on 16-bit fidelity:
 *   Browsers decode 16-bit PNG to 8-bit when constructing WebGL textures via
 *   HTMLImageElement. For the boilerplate this gives ~256 height steps — sufficient
 *   for visual exploration. For full 16-bit precision, replace useTexture with a
 *   custom DataTexture loader using upng-js or a similar library.
 *
 * @param {string}   heightmap          Public path to the 16-bit grayscale PNG.
 * @param {number}   displacementScale  Vertical exaggeration (scene units).
 * @param {number}   displacementBias   Vertical offset (scene units).
 * @param {number}   segments           PlaneGeometry subdivision count. Default 1024.
 * @param {number[]} size               [width, height] in scene units. Default [200, 200].
 */
export default function Terrain({
  heightmap = '/textures/dalkey-area.png',
  displacementScale = 21.0,
  displacementBias = -1.0,
  segments = 1024,
  size = [200, 200],
}) {
  const texture = useTexture(heightmap);

  // LinearFilter avoids the mip-map blocky stepping artefacts that
  // NearestFilter produces on a high-density displacement mesh.
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  return (
    <mesh
      receiveShadow
      castShadow
      // Rotate the XY plane to lie flat on the XZ ground plane
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[size[0], size[1], segments, segments]} />
      <meshStandardMaterial
        displacementMap={texture}
        displacementScale={displacementScale}
        displacementBias={displacementBias}
        color="#6e8c60"
        roughness={0.88}
        metalness={0.0}
      />
    </mesh>
  );
}
