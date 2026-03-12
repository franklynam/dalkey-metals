'use client';

import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';

// Scene units moved per unit of scroll deltaY.
const SCROLL_SPEED = 0.03;

// Maximum ms between two taps to count as a double-tap.
const DOUBLE_TAP_MS = 300;

// Orbit pivot distance bounds (scene units).
const MIN_ORBIT_DIST = 5;
const MAX_ORBIT_DIST = 200;

/**
 * OrbitControls with dolly-along-view zoom and mobile double-tap reset.
 *
 * Desktop:
 *   Left-drag   → orbit
 *   Scroll      → move camera + target forward/back along the look direction
 *   Right-drag  → pan
 *
 * Mobile:
 *   Tap+drag        → orbit
 *   Pinch           → zoom
 *   Two-finger drag → pan
 *   Double-tap      → reset to initial camera state
 *
 * All OrbitControls props are forwarded.
 */
export default function NavigationControls(props) {
  const controlsRef = useRef();
  const { camera, gl } = useThree();

  // Scroll → dolly along the camera's look direction.
  useEffect(() => {
    const el = gl.domElement;

    const onWheel = (e) => {
      e.preventDefault();
      const controls = controlsRef.current;
      if (!controls) return;

      const forward = new Vector3();
      camera.getWorldDirection(forward);
      forward.multiplyScalar(e.deltaY * SCROLL_SPEED);

      camera.position.add(forward);
      controls.target.add(forward);
      controls.update();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [camera, gl]);

  // Left-click drag start → move orbit pivot to a point in front of the camera.
  // This ensures orbit always feels like it's turning around what you're looking at.
  useEffect(() => {
    const el = gl.domElement;

    const onPointerDown = (e) => {
      if (e.button !== 0) return; // left button only; right-drag is pan
      const controls = controlsRef.current;
      if (!controls) return;

      const dist = Math.min(
        Math.max(camera.position.distanceTo(controls.target), MIN_ORBIT_DIST),
        MAX_ORBIT_DIST,
      );
      const forward = new Vector3();
      camera.getWorldDirection(forward);
      controls.target.copy(camera.position).addScaledVector(forward, dist);
      controls.update();
    };

    el.addEventListener('pointerdown', onPointerDown);
    return () => el.removeEventListener('pointerdown', onPointerDown);
  }, [camera, gl]);

  // Double-tap → reset to saved state.
  useEffect(() => {
    const el = gl.domElement;
    let lastTap = 0;

    const onTouchEnd = (e) => {
      if (e.touches.length !== 0) return;
      const now = Date.now();
      if (now - lastTap < DOUBLE_TAP_MS) {
        controlsRef.current?.reset();
      }
      lastTap = now;
    };

    el.addEventListener('touchend', onTouchEnd);
    return () => el.removeEventListener('touchend', onTouchEnd);
  }, [gl]);

  return (
    <OrbitControls
      ref={(controls) => {
        controlsRef.current = controls;
        controls?.saveState();
      }}
      enableZoom={false}
      {...props}
    />
  );
}
