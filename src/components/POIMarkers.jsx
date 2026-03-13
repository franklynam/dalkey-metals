'use client';

import { Html } from '@react-three/drei';
import { METALS_PATH } from '../data/metals-path';
import { POINTS_OF_INTEREST } from '../data/points-of-interest';
import { Y_SCALE } from '../config';

// Pin dimensions
const PIN_SIZE = 32;

function PinIcon({ selected }) {
  const accent = selected ? '#e8c84a' : '#c0392b';
  return (
    <svg
      width={PIN_SIZE}
      height={PIN_SIZE * 1.4}
      viewBox="0 0 32 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 0C7.163 0 0 7.163 0 16c0 10.314 14.222 27.68 15.164 28.836a1.067 1.067 0 001.672 0C17.778 43.68 32 26.314 32 16 32 7.163 24.837 0 16 0z"
        fill={accent}
      />
      <circle cx="16" cy="16" r="6" fill="white" />
    </svg>
  );
}

export default function POIMarkers({ selectedId, onSelect }) {
  return POINTS_OF_INTEREST.map((poi) => {
    const [x, y, z] = METALS_PATH[poi.waypointIndex];

    return (
      <Html
        key={poi.id}
        position={[x, y * Y_SCALE + 0.5, z]}
        center
        zIndexRange={[50, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <button
          onClick={() => onSelect(poi.id === selectedId ? null : poi)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            pointerEvents: 'auto',
            // Drop shadow so pin reads against any terrain colour
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            transform: 'translateY(-50%)',
          }}
          aria-label={poi.title}
        >
          <PinIcon selected={poi.id === selectedId} />
        </button>
      </Html>
    );
  });
}
