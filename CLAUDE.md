# Metals App — Claude Context

## What this is
LiDAR terrain visualiser for the Dalkey Quarry → Dún Laoghaire heritage railway ("The Metals"). Interactive 3D scene rendered in the browser using WebGL.

## Stack
- **Next.js 15** (App Router) + **React 19**
- **Three.js r170+** via **@react-three/fiber** + **@react-three/drei**
- **Tailwind CSS v4** (`@tailwindcss/postcss`) — see styling rules below

## Key files

| File | Purpose |
|------|---------|
| `src/app/page.jsx` | Dynamic import of App (`ssr: false`) |
| `src/app/layout.jsx` | Root layout, imports `globals.css` |
| `src/app/globals.css` | `@import "tailwindcss"` + `@theme` tokens |
| `src/components/App.jsx` | Canvas setup, top-level UI state |
| `src/components/Scene.jsx` | Sky, lights, OrbitControls |
| `src/components/Terrain.jsx` | Displacement mesh |
| `src/components/MetalsPath.jsx` | Drei `<Line>` path overlay |
| `src/components/POIMarkers.jsx` | Drei `<Html>` pin markers |
| `src/components/LayerPicker.jsx` | Map layer dropdown |
| `src/components/TitleCard.jsx` | Title badge + info button |
| `src/components/InfoModal.jsx` | Full info modal |
| `src/components/InfoPanel.jsx` | POI detail panel |
| `src/config.js` | `Y_SCALE`, `DISPLACEMENT_SCALE`, `DISPLACEMENT_BIAS` |
| `src/data/metals-path.js` | Pre-projected scene coordinates for the path |
| `src/data/points-of-interest.js` | POI definitions |
| `public/textures/` | Heightmap and satellite/map textures |

## Coordinate system

- **Scene plane**: 200×200 units = 4000m×4000m → **1 scene unit = 20 m**
- **Elevation**: `Y_SCALE = 1.5` (1.5× vertical exaggeration), `DISPLACEMENT_SCALE = 11.25`, `DISPLACEMENT_BIAS = -0.75`
- **DTM tile** (ITM / EPSG:2157): E 724000–726000, N 726000–728000 (original 2km tile; current heightmap may cover a wider area)
- **Path Y**: `elev_m / 20 * Y_SCALE` + small offset to prevent z-fighting
- **Known limitation**: Browsers decode 16-bit PNG to 8-bit via `HTMLImageElement`. Full 16-bit fidelity requires a `DataTexture` loader using `upng-js`. Documented in `Terrain.jsx`.

## Tailwind CSS setup

Tailwind v4 is configured via PostCSS:
- **Config**: `postcss.config.mjs` with `@tailwindcss/postcss`
- **Entry**: `src/app/globals.css` with `@import "tailwindcss"` and `@theme` block
- **Custom tokens**: `--color-gold: #e8c84a`, `--color-poi-red: #c0392b`

### Critical rule: inline styles for R3F layout

**Never use Tailwind utilities for `width`, `height`, or `position` on any element that Three.js/R3F uses for sizing.** Use inline `style` props instead.

```jsx
// ✅ Correct
<div className="relative" style={{ width: '100vw', height: '100vh' }}>

// ❌ Wrong — canvas gets squashed if Tailwind utilities aren't loaded yet
<div className="relative w-screen h-screen">
```

R3F's `<Canvas>` uses a `ResizeObserver` on its parent div. If that div has no explicit height (because a CSS class failed to load), the canvas renders at ~150px tall.

Use Tailwind freely for: color, blur, border, padding, gap, typography, hover states.

## Workflow preferences

- **Always write a `PLAN.md` before starting a non-trivial implementation task.** Align on the approach before writing code.
- Prefer Next.js over Vite for this project.
- Mark steps complete in `PLAN.md` as they are finished.
