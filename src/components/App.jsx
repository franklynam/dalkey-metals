'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';

export default function App() {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 40, 120],
        fov: 45,
        near: 0.1,
        far: 2000,
      }}
      gl={{ antialias: true }}
      style={{ width: '100vw', height: '100vh' }}
    >
      {/*
        Suspense lives here — above Scene — so useTexture inside Terrain
        can suspend without unmounting the whole canvas.
      */}
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
