'use client';

import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';

// Scene units to move per pixel of scroll deltaY.
// At 1 unit = 20 m, this gives ~60 m per standard mouse wheel click (deltaY ≈ 100).
const SCROLL_SPEED = 0.03;

/**
 * OrbitControls with scroll-wheel remapped to forward/back movement.
 *
 * Standard OrbitControls behaviour is preserved (left-drag orbit, right-drag
 * pan) with one change: the scroll wheel translates both the camera position
 * and the orbit target along the camera's forward vector instead of zooming.
 *
 * All OrbitControls props are forwarded.
 */
export default function NavigationControls(props) {
  const controlsRef = useRef();
  const { camera, gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;

    const onWheel = (e) => {
      e.preventDefault();

      const controls = controlsRef.current;
      if (!controls) return;

      // Unit vector pointing from camera toward the orbit target
      const forward = new Vector3()
        .subVectors(controls.target, camera.position)
        .normalize()
        .multiplyScalar(e.deltaY * SCROLL_SPEED);

      camera.position.add(forward);
      controls.target.add(forward);
      controls.update();
    };

    // passive: false required to call preventDefault() and suppress page scroll
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [camera, gl]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      {...props}
    />
  );
}
