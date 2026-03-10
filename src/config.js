// ---------------------------------------------------------------------------
// Vertical exaggeration
// ---------------------------------------------------------------------------
// Increase Y_SCALE to make the terrain feel taller.
// 1 = true scale, 3 = 3× exaggeration (recommended for this 4 km tile).
//
// Terrain:  1 scene unit = 20 m real world (4000 m / 200 unit plane)
//           Elevation range: −10 m → 200 m (210 m span)
// ---------------------------------------------------------------------------

export const Y_SCALE = 3;

// Derived displacement values for Terrain.jsx — do not edit directly.
const BASE_DISPLACEMENT_SCALE =  10.5; // 210 m / 20 m·unit⁻¹
const BASE_DISPLACEMENT_BIAS  =  -0.5; // −10 m / 20 m·unit⁻¹

export const DISPLACEMENT_SCALE = BASE_DISPLACEMENT_SCALE * Y_SCALE;
export const DISPLACEMENT_BIAS  = BASE_DISPLACEMENT_BIAS  * Y_SCALE;
