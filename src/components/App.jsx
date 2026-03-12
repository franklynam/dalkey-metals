'use client';

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';

export default function App() {
  const [showHistoricMap, setShowHistoricMap] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{
          position: [0, 40, 120],
          fov: 45,
          near: 0.1,
          far: 2000,
        }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        {/*
          Suspense lives here — above Scene — so useTexture inside Terrain
          can suspend without unmounting the whole canvas.
        */}
        <Suspense fallback={null}>
          <Scene showHistoricMap={showHistoricMap} />
        </Suspense>
      </Canvas>

      <button
        onClick={() => setShowHistoricMap((v) => !v)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          padding: '8px 16px',
          background: showHistoricMap ? 'rgba(232,200,74,0.9)' : 'rgba(0,0,0,0.55)',
          color: showHistoricMap ? '#1a1a1a' : '#fff',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 6,
          fontSize: 13,
          fontFamily: 'system-ui, sans-serif',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          userSelect: 'none',
        }}
      >
        {showHistoricMap ? '1837 Map: ON' : '1837 Map: OFF'}
      </button>
    </div>
  );
}
