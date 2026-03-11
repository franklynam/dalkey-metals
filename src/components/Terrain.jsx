'use client';

import { useTexture } from '@react-three/drei';
import { LinearFilter, SRGBColorSpace } from 'three';

/**
 * LiDAR terrain mesh.
 *
 * Scene scale:  200×200 units = 4000m×4000m  → 1 unit = 20 m
 *
 * Note on 16-bit fidelity:
 *   Browsers decode 16-bit PNG to 8-bit when constructing WebGL textures via
 *   HTMLImageElement. For the boilerplate this gives ~256 height steps — sufficient
 *   for visual exploration. For full 16-bit precision, replace useTexture with a
 *   custom DataTexture loader using upng-js or a similar library.
 *
 * @param {string}   heightmap          Public path to the 16-bit grayscale PNG.
 * @param {string}   colorMap           Public path to the satellite colour texture.
 * @param {number}   displacementScale  Vertical exaggeration (scene units).
 * @param {number}   displacementBias   Vertical offset (scene units).
 * @param {number}   segments           PlaneGeometry subdivision count. Default 1024.
 * @param {number[]} size               [width, height] in scene units. Default [200, 200].
 */
export default function Terrain({
  heightmap = '/textures/dl-area-plus-piers.png',
  colorMap  = '/textures/dl-area-plus-piers-texture.jpg',
  displacementScale = 21.0,
  displacementBias  = -1.0,
  segments = 1024,
  size = [200, 200],
}) {
  const [heightTexture, colorTexture] = useTexture([heightmap, colorMap]);

  // LinearFilter avoids mip-map blocky stepping on a high-density displacement mesh.
  heightTexture.minFilter = LinearFilter;
  heightTexture.magFilter = LinearFilter;

  // Satellite imagery is sRGB — tell Three.js so colours render correctly.
  colorTexture.colorSpace = SRGBColorSpace;

  return (
    <mesh
      receiveShadow
      castShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[size[0], size[1], segments, segments]} />
      <meshStandardMaterial
        map={colorTexture}
        displacementMap={heightTexture}
        displacementScale={displacementScale}
        displacementBias={displacementBias}
        roughness={0.88}
        metalness={0.0}
      />
    </mesh>
  );
}
