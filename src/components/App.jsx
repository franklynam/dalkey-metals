'use client';

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import InfoPanel from './InfoPanel';
import LayerPicker from './LayerPicker';

const DESKTOP_CAMERA = { position: [85.74,  82.25,  -67.78] };
const DESKTOP_TARGET = [-24.09, -16.12,  15.46];

const MOBILE_CAMERA  = { position: [6.26,  115.94, -170.35] };
const MOBILE_TARGET  = [ 10.55,   20.46,  -30.59];

export default function App() {
  const isMobile = window.innerWidth < 768;
  const initialCamera = isMobile ? MOBILE_CAMERA : DESKTOP_CAMERA;
  const initialTarget = isMobile ? MOBILE_TARGET : DESKTOP_TARGET;

  const [activeLayer, setActiveLayer] = useState('satellite');
  const [selectedPOI, setSelectedPOI] = useState(null);

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
          <Scene
            activeLayer={activeLayer}
            initialTarget={initialTarget}
            selectedPOI={selectedPOI}
            onSelectPOI={setSelectedPOI}
          />
        </Suspense>
      </Canvas>

      {selectedPOI && <InfoPanel poi={selectedPOI} onClose={() => setSelectedPOI(null)} />}

      <div style={{ position: 'absolute', bottom: 24, right: 24 }}>
        <LayerPicker activeLayer={activeLayer} onLayerChange={setActiveLayer} />
      </div>
    </div>
  );
}
