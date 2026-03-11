// ---------------------------------------------------------------------------
// Vertical exaggeration
// ---------------------------------------------------------------------------
// Increase Y_SCALE to make the terrain feel taller.
// 1 = true scale, 3 = 3× exaggeration (recommended for this 4 km tile).
//
// Terrain:  1 scene unit = 20 m real world (4000 m / 200 unit plane)
//           Elevation range: −10 m → 140 m (150 m span)  [dalkey-area-sea2.png]
//           Sea areas encoded as −10 m flat → sit below Y = 0 in scene space
// ---------------------------------------------------------------------------

export const Y_SCALE = 1.5;

// Derived displacement values for Terrain.jsx — do not edit directly.
const BASE_DISPLACEMENT_SCALE = 7.5; // 150 m / 20 m·unit⁻¹
const BASE_DISPLACEMENT_BIAS = -0.5; // −10 m / 20 m·unit⁻¹

export const DISPLACEMENT_SCALE = BASE_DISPLACEMENT_SCALE * Y_SCALE;
export const DISPLACEMENT_BIAS = BASE_DISPLACEMENT_BIAS * Y_SCALE;
