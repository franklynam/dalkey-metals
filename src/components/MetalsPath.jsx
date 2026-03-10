'use client';

import { Line } from '@react-three/drei';
import { Y_SCALE } from '../config';
import { METALS_PATH } from '../data/metals-path';

/**
 * Heritage overlay — "The Metals" railway path.
 *
 * 22 waypoints, ITM EPSG:2157 source, Z from GeoJSON, 1 unit = 20 m.
 * Path Y values are at true scale (elev_m / 20); Y_SCALE is applied at
 * render time to match the terrain's vertical exaggeration.
 *
 * @param {string} color      Line colour. Default '#e8c84a' (amber).
 * @param {number} lineWidth  Fat-line width in px. Default 3.
 */
export default function MetalsPath({ color = '#e8c84a', lineWidth = 3 }) {
  const points = METALS_PATH.map(([x, y, z]) => [x, y * Y_SCALE, z]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      dashed={false}
    />
  );
}
