'use client';

import { Sky, OrbitControls } from '@react-three/drei';
import { DISPLACEMENT_SCALE, DISPLACEMENT_BIAS } from '../config';
import Terrain from './Terrain';
import MetalsPath from './MetalsPath';

// Late-afternoon sun, roughly WSW — casts long shadows across the quarry face
const SUN_POSITION = [80, 60, -60];

export default function Scene() {
  return (
    <>
      <Sky
        sunPosition={SUN_POSITION}
        turbidity={6}
        rayleigh={0.4}
        mieCoefficient={0.004}
        mieDirectionalG={0.85}
      />

      {/* Low fill to lift shadows out of pure black */}
      <ambientLight intensity={0.25} />

      <directionalLight
        castShadow
        position={SUN_POSITION}
        intensity={2.2}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-130}
        shadow-camera-right={130}
        shadow-camera-top={130}
        shadow-camera-bottom={-130}
        shadow-camera-near={1}
        shadow-camera-far={500}
      />

      {/*
        maxPolarAngle prevents the camera from going below the ground plane.
        PI / 2.1 ≈ 85.7° from vertical — leaves a small margin above the horizon.
      */}
      <OrbitControls
        maxPolarAngle={Math.PI / 2.1}
        enableDamping
        dampingFactor={0.05}
        minDistance={15}
        maxDistance={450}
        target={[0, 2, -45]}
      />

      <Terrain
        heightmap="/textures/dalkey-area.png"
        displacementScale={DISPLACEMENT_SCALE}
        displacementBias={DISPLACEMENT_BIAS}
        segments={1024}
        size={[200, 200]}
      />

      <MetalsPath />
    </>
  );
}
