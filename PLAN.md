# LiDAR Terrain Visualiser — Implementation Plan

## Overview

Build a React Three Fiber (R3F) scene that renders the Dalkey Quarry → Dún Laoghaire LiDAR terrain using the `metals_dtm_16bit` heightmap, with "The Metals" heritage path overlaid as a 3D line.

---

## 1. Build Tooling Decision

The working directory (`/projects/metals/app`) currently contains only the heightmap assets. Two sensible options:

| Option | Reason to choose |
|---|---|
| **Vite + React** | Fastest cold starts, native ESM, simplest config for a standalone 3D viewer |
| **Next.js (App Router)** | If this viewer will be embedded in the broader franklynam.com site |

**Recommendation:** Vite unless this is meant to live inside a Next.js monorepo. Confirm before scaffolding.

---

## 2. Target File Structure

```
app/
├── public/
│   └── textures/
│       └── metals_dtm_16bit.png   ← converted 16-bit grayscale PNG (already generated)
├── src/
│   ├── App.jsx                    ← root, Canvas setup
│   ├── Scene.jsx                  ← lights, Sky, OrbitControls, Suspense wrapper
│   ├── Terrain.jsx                ← PlaneGeometry + displacementMap + MeshStandardMaterial
│   └── MetalsPath.jsx             ← Drei <Line> overlay for heritage path
├── index.html
├── main.jsx
├── vite.config.js (or next.config.js)
└── package.json
```

---

## 3. Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.170.0",
    "@react-three/fiber": "^8.x",
    "@react-three/drei": "^9.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

> Note: `@react-three/fiber` v8 targets Three.js r139–r170+. Double-check peer deps when installing.

---

## 4. Heightmap Asset

- **Source file:** `metals_dtm_16bit.tif` — 2048×2048 RGBA uint8
- **Encoding:** 16-bit elevation stored as `R × 256 + G` (big-endian, range 0–65535)
- **Converted output:** `metals_dtm_16bit.png` — 16-bit grayscale PNG (already generated via Python/Pillow)
- **Action needed:** Copy PNG to `public/textures/` after project scaffold

### Three.js texture config

```js
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.format = THREE.RedFormat;       // single-channel
texture.type = THREE.UnsignedShortType; // 16-bit
```

> **Important:** Browser `<img>` elements strip 16-bit PNG depth to 8-bit. To preserve full 16-bit fidelity, load the PNG via a custom loader using `THREE.DataTexture` from a raw pixel buffer (e.g. via a WebWorker + `fetch` + `png.js` or `upng-js`). For a first-pass boilerplate, `useTexture` with `THREE.LinearFilter` is acceptable — Three.js will use whatever bit depth the browser provides.

---

## 5. Component Design

### `App.jsx`
- Renders `<Canvas>` with `gl={{ antialias: true }}` and `shadows`
- Sets `camera` position above and slightly angled (e.g. `[0, 80, 120]`)
- Wraps `<Scene>` in `<Suspense fallback={null}>`

### `Scene.jsx`
- **Sky** (`@react-three/drei`) — `sunPosition`, `turbidity`, `rayleigh` props
- **DirectionalLight** — `castShadow`, positioned at sun angle, `shadow-mapSize` 2048
- **AmbientLight** — low intensity fill
- **OrbitControls** — `maxPolarAngle={Math.PI / 2.1}`, `enableDamping`
- Renders `<Terrain>` and `<MetalsPath>`

### `Terrain.jsx`
```jsx
// Props:
// - displacementScale: number (vertical exaggeration, default 0.002 of raw 0–65535)
// - displacementBias: number (vertical offset, default 0)
// - segments: number (default 1024)
// - size: [width, height] in scene units (default [200, 200])

const texture = useTexture('/textures/metals_dtm_16bit.png');
texture.minFilter = LinearFilter;
texture.magFilter = LinearFilter;

<mesh receiveShadow castShadow rotation={[-Math.PI / 2, 0, 0]}>
  <planeGeometry args={[size[0], size[1], segments, segments]} />
  <meshStandardMaterial
    displacementMap={texture}
    displacementScale={displacementScale}
    displacementBias={displacementBias}
    color="#7a9e6e"
    roughness={0.9}
    metalness={0.0}
  />
</mesh>
```

### `MetalsPath.jsx`
```jsx
// Props:
// - points: Vector3[] | [x,y,z][]  (The Metals railway path waypoints)
// - color: string (default '#e8c84a')
// - lineWidth: number (default 2)

import { Line } from '@react-three/drei';

<Line
  points={points}
  color={color}
  lineWidth={lineWidth}
  dashed={false}
/>
```

> Path Y-coordinates need to match displaced terrain. Two strategies:
> 1. **Simple:** add a constant Y offset above the terrain surface (e.g. `y + 0.5`)
> 2. **Accurate:** sample the heightmap at each XZ coordinate to get the exact displaced Y

---

## 6. Key Technical Considerations

### Displacement map scale
- Raw elevation range: 0–65535 (~65m real-world range for this coastal area)
- `displacementScale` default suggestion: `0.003` (maps 65535 → ~196 scene units at size=200 — adjust down)
- Start with `displacementScale={2}` and `displacementBias={-1}` for a scene unit grid of 200×200

### Segment density vs. performance
- 1024×1024 plane = ~1M vertices — GPU-heavy on mobile/integrated graphics
- Consider a `segments` prop defaulting to `512` for development, bumped to `1024` for final render
- Add a `<Perf />` panel from `r3f-perf` for monitoring

### `useTexture` + Suspense
- `useTexture` throws a Promise (React Suspense protocol) — wrap call site in `<Suspense>`
- The `<Suspense>` lives in `App.jsx` around `<Scene>`, not inside `Terrain.jsx`

### 16-bit PNG browser caveat
- Most browsers decode 16-bit PNG to 8-bit when used as a standard texture
- For full precision: use a custom loader (`upng-js` → `THREE.DataTexture`) — out of scope for boilerplate but noted for future upgrade

---

## 7. Build Steps (in order)

1. Confirm build tool (Vite vs Next.js)
2. Scaffold project (`npm create vite@latest` or `npx create-next-app`)
3. Install dependencies
4. Copy `metals_dtm_16bit.png` → `public/textures/`
5. Create `src/App.jsx`
6. Create `src/Scene.jsx`
7. Create `src/Terrain.jsx`
8. Create `src/MetalsPath.jsx`
9. Add placeholder path points for The Metals (GeoJSON → scene XZ coordinates)
10. Smoke test in browser, tune `displacementScale`

---

## 8. Resolved Decisions

- [x] **Build tool:** Next.js 15 (App Router) — `dynamic(() => import('../components/App'), { ssr: false })`
- [x] **Path data:** `metals-path.json` provided — 10 waypoints, EPSG:4326 with Z elevations
- [x] **Map projection:** WGS84 → ITM (EPSG:2157) manually computed; scene XZ mapped from 2km×2km tile; 1 unit = 10 m
- [x] **Colour map:** Flat `MeshStandardMaterial` (`#6e8c60`) for boilerplate; elevation ramp deferred
- [x] **16-bit fidelity:** 8-bit browser downgrade accepted for boilerplate; DataTexture upgrade path documented in `Terrain.jsx`

## 9. Derived Constants (from heightmap analysis)

| Constant | Value | Notes |
|---|---|---|
| DTM tile (ITM) | E:724000–726000, N:726000–728000 | 2km×2km |
| Pixel scale | 0.9765625 m/px | 2048px → 2000m |
| Elevation encoding | `raw16 / 712.82` = metres | R×256+G → 16-bit |
| Scene unit | 10 m | 200-unit plane = 2000m |
| `displacementScale` | 9.2 | maps [0,1] → [0, 92m] |
| Path Y | `elev_m / 10` | matches displaced terrain within 1% |
