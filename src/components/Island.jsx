'use client';

import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { LinearFilter, SRGBColorSpace } from 'three';
import { DISPLACEMENT_SCALE, DISPLACEMENT_BIAS } from '../config';

/**
 * Dalkey Island terrain mesh.
 *
 * Separate tile from the main terrain — positioned in scene space using
 * the same ITM → scene coordinate mapping (1 unit = 20 m).
 *
 * Source:      dalkey-island.tif  (ITM / EPSG:2157)
 * Tile origin: E 727209.122, N 727039.352
 * Real size:   773.0 m × 947.5 m  (non-square pixels: 0.755 × 0.925 m/px)
 * Scene size:  38.65 × 47.375 units
 * Scene centre: X=79.781, Z=71.720
 *
 * Satellite texture UV crop:
 *   The colour texture is the same 4km×4km tile as the main terrain.
 *   offset/repeat are set to sample only the island's region of that texture.
 *   Derived from pixel bounds: left=3570 top=3294 right=4430 bottom=4348 (of 4450px)
 *
 * @param {string} colorMap  Public path to the satellite colour texture.
 * @param {number} segments  PlaneGeometry subdivision count. Default 256.
 */

const POSITION      = [79.7811, 0, 71.7199];
const SIZE          = [38.65, 47.375];    // [width, depth] in scene units

// UV region of the 4km×4km satellite texture that covers the island tile
const UV_OFFSET     = [0.802280, 0.022963];
const UV_REPEAT     = [0.193250, 0.236875];

export default function Island({
  colorMap = '/textures/dl-area-plus-piers-texture.jpg',
  segments = 256,
}) {
  const [heightTexture, rawColorTexture] = useTexture([
    '/textures/dalkey-island.png',
    colorMap,
  ]);

  heightTexture.minFilter = LinearFilter;
  heightTexture.magFilter = LinearFilter;

  // Clone so the island's UV crop doesn't affect the terrain's copy of the texture.
  const colorTexture = useMemo(() => {
    const t = rawColorTexture.clone();
    t.colorSpace = SRGBColorSpace;
    t.offset.set(...UV_OFFSET);
    t.repeat.set(...UV_REPEAT);
    t.needsUpdate = true;
    return t;
  }, [rawColorTexture]);

  return (
    <mesh
      receiveShadow
      castShadow
      position={POSITION}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[SIZE[0], SIZE[1], segments, segments]} />
      <meshStandardMaterial
        map={colorTexture}
        displacementMap={heightTexture}
        displacementScale={DISPLACEMENT_SCALE}
        displacementBias={DISPLACEMENT_BIAS}
        roughness={0.88}
        metalness={0.0}
      />
    </mesh>
  );
}
