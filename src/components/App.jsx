'use client';

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';

const btnStyle = {
  padding: '8px 16px',
  border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'system-ui, sans-serif',
  cursor: 'pointer',
  backdropFilter: 'blur(4px)',
  userSelect: 'none',
};

const DESKTOP_CAMERA   = { position: [85.74,   82.25,  -67.78] };
const DESKTOP_TARGET   = [-24.09, -16.12,  15.46];

const MOBILE_CAMERA    = { position: [6.26,  115.94, -170.35] };
const MOBILE_TARGET    = [ 10.55,   20.46,  -30.59];

export default function App() {
  const isMobile = window.innerWidth < 768;
  const initialCamera = isMobile ? MOBILE_CAMERA : DESKTOP_CAMERA;
  const initialTarget = isMobile ? MOBILE_TARGET : DESKTOP_TARGET;

  const [showHistoricMap, setShowHistoricMap] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{
          ...initialCamera,
          fov: 45,
          near: 0.1,
          far: 2000,
        }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Scene showHistoricMap={showHistoricMap} initialTarget={initialTarget} />
        </Suspense>
      </Canvas>

      <div style={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setShowHistoricMap((v) => !v)}
          style={{
            ...btnStyle,
            background: showHistoricMap ? 'rgba(232,200,74,0.9)' : 'rgba(0,0,0,0.55)',
            color: showHistoricMap ? '#1a1a1a' : '#fff',
          }}
        >
          {showHistoricMap ? '1837 Map: ON' : '1837 Map: OFF'}
        </button>
      </div>
    </div>
  );
}
