'use client';

/**
 * Flat water plane sitting at sea level (Y = 0).
 *
 * With the current displacement setup, 0 m real elevation maps to exactly
 * Y = 0 in scene space (displacementBias cancels out the minimum elevation),
 * so no Y offset calculation is needed. A small negative Y nudge (-0.05)
 * prevents z-fighting where the terrain surface grazes sea level.
 *
 * @param {number} size     Plane size in scene units. Should match terrain. Default 200.
 * @param {string} color    Water colour. Default '#006994'.
 * @param {number} opacity  0–1. Default 0.82.
 */
export default function Sea({ size = 200, color = '#006994', opacity = 0.82 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        color={color}
        roughness={0.15}
        metalness={0.2}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}
