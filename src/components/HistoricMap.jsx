'use client';

import { useTexture } from '@react-three/drei';
import { LinearFilter, SRGBColorSpace } from 'three';
import { DISPLACEMENT_SCALE, DISPLACEMENT_BIAS } from '../config';

/**
 * 1837 OS map overlay draped over the terrain.
 *
 * Same ITM bounds as the main terrain (E 724000–728000, N 726000–730000,
 * 4000m × 4000m) so UV mapping is 1:1 — no offset or repeat required.
 *
 * polygonOffset pushes this mesh slightly in front of the terrain to prevent
 * z-fighting without requiring a visible gap.
 */
export default function HistoricMap({
  opacity = 1.0,
  segments = 512,
  size = [200, 200],
}) {
  const [heightTexture, colorTexture] = useTexture([
    '/textures/dl-area-plus-piers.png',
    '/textures/1837-map-texture.jpg',
  ]);

  heightTexture.minFilter = LinearFilter;
  heightTexture.magFilter = LinearFilter;
  colorTexture.colorSpace = SRGBColorSpace;

  return (
    <mesh
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[size[0], size[1], segments, segments]} />
      <meshStandardMaterial
        map={colorTexture}
        displacementMap={heightTexture}
        displacementScale={DISPLACEMENT_SCALE}
        displacementBias={DISPLACEMENT_BIAS}
        roughness={0.9}
        metalness={0.0}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}
